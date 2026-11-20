import { router, usePage } from '../adapters/inertia';
import { readPageProps } from '../adapters/pageProps';
import { useStorage } from '@vueuse/core';
import { readStorage, storageKey, writeStorage } from '../lib/storage';
import { format } from 'date-fns';
import type { Ref } from 'vue';
import { computed, onMounted, ref, watch } from 'vue';
import type {
    CustomActionDialogState,
    DateRangeState,
    DensityType,
    FilterState,
    ModuleConfig,
    PaginationData,
    SortConfig,
    ThemeConfig,
} from '../types/module';
import { PREBUILT_THEMES } from './themes';
import { useTheme } from './useTheme';

export function useModuleManager(
    configRef: Ref<ModuleConfig>,
    initialData: PaginationData,
    initialFilters: FilterState = {},
    customTheme: Partial<ThemeConfig> = {},
    initialTheme: string = 'default',
) {
    const config = computed(() => configRef.value);
    const page = usePage();

    // ── Data Transformation Helper ──────────────────────────────────────────
    const applyTransform = (raw: any[]) => {
        if (config.value.transformData) {
            return config.value.transformData(raw);
        }
        return raw;
    };

    // ── Core pagination & filter state ───────────────────────────────────────
    const data = ref<any[]>(applyTransform(initialData.data || []));
    const currentPage = ref(initialData.current_page || 1);
    const perPage = ref(initialData.per_page || initialFilters.perPage || 10);
    const totalPages = ref(initialData.last_page || 1);
    const totalCount = ref(initialData.total || 0);
    const loading = ref(false); // Start false - we have initial data

    const searchTerm = ref(initialFilters.search || '');
    const debouncedSearch = ref(initialFilters.search || '');
    const statusFilter = ref(initialFilters.status || 'all');
    const dateRange = ref<DateRangeState>({
        from: initialFilters.date_from
            ? new Date(initialFilters.date_from)
            : null,
        to: initialFilters.date_to ? new Date(initialFilters.date_to) : null,
    });
    const customFilters = ref<Record<string, string>>({});
    const sortConfig = ref<SortConfig>({
        key: initialFilters.sort || null,
        direction: (initialFilters.direction as 'asc' | 'desc') || 'asc',
    });

    // ── Dialog & UI states ───────────────────────────────────────────────────
    const editingItem = ref<any>(null);
    const isDialogOpen = ref(false);
    const isCreating = ref(false);
    const isViewing = ref(false); // ✅ Added
    const visibleColumns = ref(
        config.value.tableColumns
            .filter((col: any) => !col.hidden)
            .map((col: any) => col.key),
    );
    const selectedRows = ref<string[]>([]);
    const isRefreshing = ref(false);
    const customActionDialog = ref<CustomActionDialogState>({
        isOpen: false,
        action: null,
        row: null,
    });
    const density = useStorage<DensityType>(storageKey('table-density'), 'normal');
    const layout = useStorage<'table' | 'grid'>(
        storageKey(`module-layout-${config.value.dataPropName}`),
        config.value.gridConfig?.defaultLayout === 'grid' ? 'grid' : 'table',
    );
    const { activeThemeName: selectedTheme } = useTheme();
    const isImportDialogOpen = ref(false);

    const auth = computed(() => readPageProps(page).auth);
    const checkPermission = (permission?: string): boolean => {
        if (!permission) return true;
        return auth.value?.permissions?.includes(permission) ?? false;
    };

    const canView = computed(
        () =>
            config.value.actionConfig?.view?.show !== false &&
            checkPermission(
                config.value.actionConfig?.view?.permission ||
                    config.value.permissions?.view,
            ),
    );
    const canViewDetails = computed(
        () =>
            config.value.actionConfig?.detailsView?.show !== false &&
            checkPermission(
                config.value.actionConfig?.detailsView?.permission ||
                    config.value.permissions?.view,
            ),
    );
    const canCreate = computed(
        () =>
            config.value.actionConfig?.create?.show !== false &&
            checkPermission(
                config.value.actionConfig?.create?.permission ||
                    config.value.permissions?.create,
            ),
    );
    const canUpdate = computed(
        () =>
            config.value.actionConfig?.edit?.show !== false &&
            checkPermission(
                config.value.actionConfig?.edit?.permission ||
                    config.value.permissions?.update,
            ),
    );
    const canDelete = computed(
        () =>
            config.value.actionConfig?.delete?.show !== false &&
            checkPermission(
                config.value.actionConfig?.delete?.permission ||
                    config.value.permissions?.delete,
            ),
    );
    const canBulkDelete = computed(
        () =>
            !!config.value.actionConfig?.bulkDelete &&
            config.value.actionConfig.bulkDelete.show !== false &&
            checkPermission(
                config.value.actionConfig?.bulkDelete?.permission ||
                    config.value.permissions?.delete,
            ),
    );
    const canExport = computed(
        () =>
            config.value.actionConfig?.export?.show !== false &&
            checkPermission(
                config.value.actionConfig?.export?.permission ||
                    config.value.permissions?.export,
            ),
    );

    const visibleCustomHeaderActions = computed(() =>
        (config.value.customHeaderActions || []).filter(
            (a: any) => !a.permission || checkPermission(a.permission),
        ),
    );

    const visibleCustomRowActions = computed(() =>
        (config.value.customRowActions || []).filter(
            (a: any) => !a.permission || checkPermission(a.permission),
        ),
    );

    const visibleCustomBulkActions = computed(() =>
        (config.value.customBulkActions || []).filter(
            (a: any) => !a.permission || checkPermission(a.permission),
        ),
    );

    // ── Theme computation (unchanged) ────────────────────────────────────────
    const appliedTheme = computed(() => {
        if (Object.keys(customTheme).length > 0) {
            const isFullTheme = !!customTheme.name;
            if (isFullTheme)
                return { ...PREBUILT_THEMES.default, ...customTheme };
            const base =
                PREBUILT_THEMES[selectedTheme.value] || PREBUILT_THEMES.default;
            return { ...base, ...customTheme };
        }
        return PREBUILT_THEMES[selectedTheme.value] || PREBUILT_THEMES.default;
    });

    const tableTheme = computed(() => ({
        selectedTheme: selectedTheme.value,
        tableBackground: appliedTheme.value.tableBackground,
        tableBorder: appliedTheme.value.tableBorder,
        headerBackground: appliedTheme.value.tableHeaderBackground,
        headerText: appliedTheme.value.tableHeaderText,
        rowHover: appliedTheme.value.tableRowHover,
        rowSelected: appliedTheme.value.tableRowSelected, // ✅ NEW
        rowBorder: appliedTheme.value.tableRowBorder,
        textPrimary: appliedTheme.value.tableTextPrimary,
        textSecondary: appliedTheme.value.tableTextSecondary,
        toolbarBackground: appliedTheme.value.tableToolbarBackground,
        toolbarBorder: appliedTheme.value.tableToolbarBorder,
        toolbarText: appliedTheme.value.tableToolbarText, // ✅ NEW
        toolbarSeparator: appliedTheme.value.tableToolbarSeparator, // ✅ NEW
        iconActive: appliedTheme.value.tableIconActive, // ✅ NEW
        iconInactive: appliedTheme.value.tableIconInactive, // ✅ NEW
        menuBackground: appliedTheme.value.tableMenuBackground, // ✅ NEW
        menuBorder: appliedTheme.value.tableMenuBorder, // ✅ NEW
        menuText: appliedTheme.value.tableMenuText, // ✅ NEW
        primaryButton: appliedTheme.value.primaryButton,
        secondaryButton: appliedTheme.value.secondaryButton, // ✅ NEW
        checkbox: appliedTheme.value.checkbox, // ✅ NEW: Pass checkbox theme to table
    }));

    // ── Computed helpers ─────────────────────────────────────────────────────
    const hasStatusFilter = computed(() =>
        data.value.some((row) => 'status' in row),
    );
    const hasActiveFilters = computed(() => {
        // Filters flagged countAsFilter: false are screen context (e.g. a required branch), not applied filters.
        const noCount = new Set(
            (config.value.customFilters ?? [])
                .filter((f: any) => f.countAsFilter === false)
                .map((f: any) => f.key),
        );
        return Boolean(
            debouncedSearch.value ||
            statusFilter.value !== 'all' ||
            dateRange.value.from ||
            dateRange.value.to ||
            Object.entries(customFilters.value).some(
                ([k, v]) => !noCount.has(k) && v !== undefined && v !== null && v !== '' && v !== 'all',
            ),
        );
    });

    const hasSelectedRows = computed(() => selectedRows.value.length > 0);

    // ── CENTRAL FILTER UPDATE FUNCTION ───────────────────────────────────────
    // This is the most important part — almost all pagination issues come from here
    const updateFilters = (updates: Partial<FilterState> = {}) => {
        loading.value = true;

        const currentFilters: FilterState = {
            search: debouncedSearch.value || undefined,
            status:
                statusFilter.value !== 'all' ? statusFilter.value : undefined,
            page: currentPage.value,
            perPage: perPage.value,
            sort: sortConfig.value.key || undefined,
            direction: sortConfig.value.direction || 'asc',
            ...(dateRange.value.from && {
                date_from: format(dateRange.value.from, 'yyyy-MM-dd'),
            }),
            ...(dateRange.value.to && {
                date_to: format(dateRange.value.to, 'yyyy-MM-dd'),
            }),
            ...Object.fromEntries(
                Object.entries(customFilters.value)
                    .filter(
                        ([_, v]) =>
                            v !== undefined &&
                            v !== null &&
                            v !== '' &&
                            v !== 'all' &&
                            (!Array.isArray(v) || v.length > 0),
                    )
                    .map(([k, v]) => [k, Array.isArray(v) ? v.join(',') : v]),
            ),
        };

        const finalFilters: FilterState = {
            ...currentFilters,
            ...updates,
            // Reset page to 1 when filters change (except explicit page change)
            page: updates.page !== undefined ? updates.page : 1,
        };

        Object.keys(finalFilters).forEach((key) => {
            if (
                finalFilters[key] === undefined ||
                finalFilters[key] === null ||
                finalFilters[key] === ''
            ) {
                delete finalFilters[key];
            }
        });

        router.get(window.location.pathname, finalFilters, {
            preserveState: true,
            preserveScroll: true,
            // IMPORTANT: add ALL relevant prop keys your page returns!
            only: [
                config.value.dataPropName, // 'categories', 'users', 'products', etc.
                ...(config.value.extraPropsToRefresh || []), // 'parentCategories', 'stats', etc.
                'filters', // almost always needed
            ],
            onStart: () => {
                loading.value = true;
            },
            onSuccess: (page) => {
                const props = page.props as any;

                const paginatedData = props[config.value.dataPropName];

                if (paginatedData && 'data' in paginatedData) {
                    data.value = applyTransform(paginatedData.data || []);
                    currentPage.value = paginatedData.current_page || 1;
                    totalPages.value = paginatedData.last_page || 1;
                    totalCount.value = paginatedData.total || 0;
                    perPage.value = paginatedData.per_page || perPage.value;
                }
            },
            onFinish: () => {
                loading.value = false;
            },
        });
    };

    // ── Filter & pagination handlers ─────────────────────────────────────────
    const handleStatusFilter = (status: string) => {
        statusFilter.value = status;
        updateFilters({ status, page: 1 });
    };

    const handleDateRangeChange = (range: DateRangeState) => {
        dateRange.value = range;
        updateFilters({ page: 1 });
    };

    const handleCustomFilterChange = (key: string, value: string) => {
        customFilters.value[key] = value;
        if (key === 'status') {
            statusFilter.value = value;
        }
        updateFilters({ page: 1 });
    };

    const handleSort = (key: string) => {
        const direction =
            sortConfig.value.key === key && sortConfig.value.direction === 'asc'
                ? 'desc'
                : 'asc';
        sortConfig.value = { key, direction };
        updateFilters({ sort: key, direction, page: 1 });
    };

    const handlePerPageChange = (newPerPage: number) => {
        perPage.value = newPerPage;
        updateFilters({ perPage: newPerPage, page: 1 });
    };

    const handlePageChange = (newPage: number) => {
        currentPage.value = newPage;
        updateFilters({ page: newPage });
    };

    const handleRefresh = () => {
        isRefreshing.value = true;

        // Build the list of props to refresh, ensuring no duplicates
        const refreshOnly = Array.from(
            new Set([
                config.value.dataPropName,
                'filters',
                ...(config.value.extraPropsToRefresh || []),
            ]),
        );

        router.reload({
            only: refreshOnly,
            onSuccess: (page) => {
                // Manually sync data to ensure it's updated even if watcher lags
                const props = page.props as any;
                const newData = props[config.value.dataPropName];

                if (newData) {
                    if ('data' in newData) {
                        data.value = applyTransform(newData.data || []);
                        currentPage.value = newData.current_page || 1;
                        totalPages.value = newData.last_page || 1;
                        totalCount.value = newData.total || 0;
                        perPage.value = newData.per_page || perPage.value;
                    } else if (Array.isArray(newData)) {
                        data.value = applyTransform(newData);
                        totalCount.value = newData.length;
                    }
                }
            },
            onFinish: () => {
                isRefreshing.value = false;
                selectedRows.value = [];
            },
        });
    };

    const handleClearFilters = () => {
        searchTerm.value = '';
        debouncedSearch.value = '';
        statusFilter.value = 'all';
        dateRange.value = { from: null, to: null };
        customFilters.value = {};
        sortConfig.value = { key: null, direction: 'asc' };

        (config.value.customFilters || []).forEach((filter: any) => {
            customFilters.value[filter.key] = filter.defaultValue || '';
        });

        updateFilters({ page: 1 });
    };

    const resetColumns = () => {
        visibleColumns.value = config.value.tableColumns
            .filter((col: any) => !col.hidden)
            .map((col: any) => col.key);
    };

    // ── Search debounce ──────────────────────────────────────────────────────
    let searchTimeout: any;
    watch(searchTerm, (newValue) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            debouncedSearch.value = newValue;
            if (newValue !== initialFilters.search) {
                updateFilters({ search: newValue, page: 1 });
            }
        }, 500);
    });

    // ── Initial setup ────────────────────────────────────────────────────────
    onMounted(() => {
        (config.value.customFilters || []).forEach((filter: any) => {
            customFilters.value[filter.key] =
                initialFilters[filter.key] || filter.defaultValue || '';
        });

        const savedTheme = readStorage('module-theme');
        if (savedTheme && PREBUILT_THEMES[savedTheme]) {
            selectedTheme.value = savedTheme;
        } else if (initialTheme && PREBUILT_THEMES[initialTheme]) {
            selectedTheme.value = initialTheme;
        }
    });

    watch(selectedTheme, (newTheme) => {
        writeStorage('module-theme', newTheme);
    });

    // ── Props sync watcher ───────────────────────────────────────────────────
    // Sync local refs when props change (e.g. navigation, external updates)
    watch(
        () => initialFilters,
        (filters) => {
            if (filters.search !== undefined)
                searchTerm.value = filters.search || '';
            if (filters.status !== undefined)
                statusFilter.value = filters.status || 'all';
            if (filters.perPage !== undefined)
                perPage.value = Number(filters.perPage) || 10;
            if (filters.page !== undefined)
                currentPage.value = Number(filters.page) || 1;

            if (filters.sort !== undefined || filters.direction !== undefined) {
                sortConfig.value = {
                    key: filters.sort || null,
                    direction: (filters.direction as 'asc' | 'desc') || 'asc',
                };
            }

            if (filters.date_from || filters.date_to) {
                dateRange.value = {
                    from: filters.date_from
                        ? new Date(filters.date_from)
                        : null,
                    to: filters.date_to ? new Date(filters.date_to) : null,
                };
            }

            (config.value.customFilters || []).forEach((f: any) => {
                if (filters[f.key] !== undefined) {
                    customFilters.value[f.key] =
                        filters[f.key] || f.defaultValue || '';
                }
            });
        },
        { deep: true },
    );

    // ── Data sync watcher ────────────────────────────────────────────────────
    // This ensures that when Inertia refreshes props (e.g. after a delete or create)
    // our internal refs stay in sync with the new server data.
    watch(
        () => page.props,
        (newProps: any) => {
            const dataPropName = config.value.dataPropName;
            const newData = newProps[dataPropName];

            if (newData) {
                if ('data' in newData) {
                    data.value = applyTransform(newData.data || []);
                    currentPage.value = newData.current_page || 1;
                    totalPages.value = newData.last_page || 1;
                    totalCount.value = newData.total || 0;
                    perPage.value = newData.per_page || perPage.value;
                } else if (Array.isArray(newData)) {
                    data.value = applyTransform(newData);
                    totalCount.value = newData.length;
                }
            }
        },
        { deep: true, immediate: false },
    );

    return {
        data,
        currentPage,
        perPage,
        totalPages,
        totalCount,
        loading,
        searchTerm,
        debouncedSearch,
        statusFilter,
        dateRange,
        customFilters,
        sortConfig,
        editingItem,
        isDialogOpen,
        isCreating,
        isViewing, // ✅ Added
        visibleColumns,
        selectedRows,
        isRefreshing,
        customActionDialog,
        density,
        layout,
        selectedTheme,
        canView,
        canViewDetails,
        canCreate,
        canUpdate,
        canDelete,
        canBulkDelete,
        canExport,
        visibleCustomHeaderActions,
        visibleCustomRowActions,
        visibleCustomBulkActions,
        checkPermission,
        appliedTheme,
        tableTheme,
        hasStatusFilter,
        hasSelectedRows, // ✅ Added
        hasActiveFilters,
        isImportDialogOpen, // ✅ Added
        updateFilters,
        handleStatusFilter,
        handleDateRangeChange,
        handleCustomFilterChange,
        handleSort,
        handlePerPageChange,
        handlePageChange,
        handleRefresh,
        handleClearFilters,
        resetColumns,
    };
}
