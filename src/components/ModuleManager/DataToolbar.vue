<!--
  The persistent toolbar for a grid-enabled module: Select-all, a Columns/Fields
  visibility dropdown (context-aware — "Columns" in table layout, "Fields" in grid
  layout), the shared DensityToggle, the Table/Grid LayoutToggle, and the bulk-action
  bar. Rendered ONCE by ModuleManager.vue, above the table/grid content swap, so it
  never unmounts/remounts (and therefore never animates) when the layout toggles —
  only the actual rows/cards underneath it do.
-->
<template>
    <div
        :class="`flex flex-col gap-2 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${theme.toolbarBorder} ${theme.toolbarBackground}`"
    >
        <div
            :class="
                cn(
                    'flex flex-wrap items-center gap-2 rounded-lg border p-1.5',
                    theme.rowSelected,
                    theme.toolbarBorder,
                )
            "
        >
            <div v-if="hasCheckboxColumn" class="flex items-center gap-2 px-1">
                <input
                    type="checkbox"
                    :checked="isAllSelected"
                    :indeterminate.prop="isIndeterminate"
                    @click="handleSelectAllClick"
                    class="h-4 w-4 cursor-pointer rounded border-gray-300 dark:border-white/15"
                    :style="{ accentColor: checkboxAccentColor }"
                />
                <span :class="['text-xs font-medium', theme.toolbarText]">{{
                    t('ui-builder.select_all')
                }}</span>
            </div>

            <!-- Columns / Fields visibility dropdown (context-aware by layout) -->
            <DropdownMenu :modal="false">
                <DropdownMenuTrigger as-child>
                    <Button
                        variant="ghost"
                        :class="
                            cn(
                                'border font-medium flex items-center justify-center',
                                buttonSizeClass,
                                theme.secondaryButton,
                            )
                        "
                    >
                        <Eye class="me-2 h-4 w-4" />
                        {{ dropdownLabel }}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="start"
                    :class="
                        cn(
                            'w-48 border',
                            theme.menuBackground,
                            theme.menuBorder,
                            theme.menuText,
                        )
                    "
                    :collision-padding="8"
                >
                    <div class="flex items-center justify-between pr-2">
                        <DropdownMenuLabel :class="theme.menuText">
                            {{ toggleLabel }}
                        </DropdownMenuLabel>
                        <Button
                            variant="ghost"
                            size="icon"
                            :class="`h-6 w-6 ${theme.iconActive || 'text-blue-600'} hover:opacity-80 transition-opacity`"
                            :title="resetLabel"
                            @click="emit('resetColumns')"
                        >
                            <RotateCcw class="h-3.5 w-3.5" />
                        </Button>
                    </div>
                    <DropdownMenuSeparator
                        :class="theme.toolbarSeparator || 'opacity-20'"
                    />
                    <div class="max-h-72 overflow-y-auto">
                        <DropdownMenuCheckboxItem
                            v-for="entry in dropdownEntries"
                            :key="entry.key"
                            :checked="visibleColumns.includes(entry.key)"
                            @select.prevent
                            @click="emit('toggleColumn', entry.key)"
                            :class="theme.menuText"
                        >
                            <div class="flex w-full items-center justify-between">
                                <span>{{ entry.label }}</span>
                                <Eye
                                    v-if="visibleColumns.includes(entry.key)"
                                    :class="[
                                        'ms-2 h-4 w-4',
                                        theme.iconActive || 'text-blue-600',
                                    ]"
                                />
                                <EyeOff
                                    v-else
                                    :class="[
                                        'ms-2 h-4 w-4',
                                        theme.iconInactive || 'text-gray-400 dark:text-neutral-400',
                                    ]"
                                />
                            </div>
                        </DropdownMenuCheckboxItem>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>

            <!-- Density (single shared control — see DensityToggle.vue) -->
            <DensityToggle :theme="theme" />

            <LayoutToggle
                v-if="showLayoutToggle"
                :model-value="layout"
                :theme="theme"
                @update:model-value="emit('update:layout', $event)"
            />
        </div>

        <div
            v-if="selectedRows.length > 0"
            :class="
                cn(
                    'flex flex-wrap items-center gap-2 rounded-lg border p-1.5',
                    theme.rowSelected,
                    theme.toolbarBorder,
                )
            "
        >
            <span :class="['pr-1 text-sm font-medium', theme.toolbarText]">
                {{ selectedRows.length }} {{ t('ui-builder.selected') }}
            </span>
            <div :class="['mx-1 h-4 w-px', theme.toolbarSeparator]"></div>
            <Button
                variant="ghost"
                :class="
                    cn(
                        'border font-medium flex items-center justify-center',
                        buttonSizeClass,
                        theme.secondaryButton,
                    )
                "
                @click="emit('selectionChange', [])"
            >
                <Eraser class="h-4 w-4" />
                {{ t('ui-builder.clear') }}
            </Button>
            <div :class="['mx-1 h-4 w-px', theme.toolbarSeparator]"></div>
            <template v-for="action in visibleBulkActions" :key="action.key">
                <Button
                    variant="ghost"
                    :class="
                        cn(
                            'border font-medium flex items-center justify-center',
                            buttonSizeClass,
                            theme.secondaryButton,
                        )
                    "
                    @click="emit('bulkAction', action.key, selectedRows)"
                >
                    <component
                        v-if="action.icon"
                        :is="action.icon"
                        class="me-2 h-4 w-4"
                    />
                    {{ resolveLabel(action.label) }}
                </Button>
                <div :class="['mx-1 h-4 w-px', theme.toolbarSeparator]"></div>
            </template>
            <Button
                v-if="canBulkDelete && selectedRows.length > 1"
                variant="destructive"
                size="sm"
                @click="emit('bulkAction', 'delete', selectedRows)"
            >
                <component
                    :is="actionConfig?.bulkDelete?.icon || Trash2"
                    class="me-2 h-4 w-4"
                />
                {{ t('ui-builder.delete') }} ({{ selectedRows.length }})
            </Button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { storageKey } from '../../lib/storage';
import { computed, watch } from 'vue';
import { useUiI18n } from '../../i18n';
import { useStorage } from '@vueuse/core';
import { resolveColumnLabel, resolveLabel } from '../../i18n';
import { cn } from '../../lib/utils';
import { Button } from '../../primitives/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../../primitives/dropdown-menu';
import { Eraser, Eye, EyeOff, RotateCcw, Trash2 } from '@lucide/vue';
import { toast } from '../../composables/useToast';
import type {
    ActionConfig,
    ColumnConfig,
    CustomAction,
    DensityType,
    GridFieldConfig,
    GridViewConfig,
    TableTheme,
} from '../../types/module';
import { gridFieldKey } from '../../types/module';
import DensityToggle from './DensityToggle.vue';
import LayoutToggle from './LayoutToggle.vue';

const props = withDefaults(
    defineProps<{
        layout: 'table' | 'grid';
        showLayoutToggle?: boolean;
        columns: ColumnConfig[];
        gridConfig?: GridViewConfig;
        visibleColumns: string[];
        data: any[];
        selectedRows: string[];
        customBulkActions?: CustomAction[];
        canBulkDelete?: boolean;
        actionConfig?: ActionConfig;
        theme: Partial<TableTheme>;
    }>(),
    {
        showLayoutToggle: false,
        customBulkActions: () => [],
        canBulkDelete: true,
    },
);

const emit = defineEmits<{
    toggleColumn: [key: string];
    resetColumns: [];
    selectionChange: [rows: string[]];
    bulkAction: [actionKey: string, ids: string[]];
    'update:layout': [layout: 'table' | 'grid'];
}>();

const { t } = useUiI18n();

const localDensity = useStorage<DensityType>(storageKey('table-density'), 'normal');
const buttonSizeClass = computed(() => {
    if (localDensity.value === 'compact') return 'h-8 text-xs px-3';
    if (localDensity.value === 'relaxed') return 'h-10 text-base px-5';
    return 'h-9 text-sm px-4';
});

const checkboxAccentColor = computed(() => {
    const primaryButton = props.theme.primaryButton || '';
    const colorMap: Record<string, string> = {
        'bg-blue-600': '#2563eb',
        'bg-emerald-600': '#059669',
        'bg-green-600': '#16a34a',
        'bg-purple-600': '#9333ea',
        'bg-red-600': '#dc2626',
        'bg-orange-600': '#ea580c',
        'bg-yellow-600': '#ca8a04',
        'bg-teal-600': '#0d9488',
        'bg-cyan-600': '#0891b2',
        'bg-indigo-600': '#4f46e5',
        'bg-pink-600': '#db2777',
        'bg-rose-600': '#e11d48',
        'bg-gray-600': '#4b5563',
        'bg-slate-600': '#475569',
        'bg-zinc-600': '#52525b',
        'bg-stone-600': '#57534e',
        'bg-neutral-600': '#525252',
        'bg-lime-600': '#65a30d',
        'bg-amber-600': '#d97706',
        'bg-violet-600': '#7c3aed',
        'bg-fuchsia-600': '#c026d3',
        'bg-sky-600': '#0284c7',
    };
    for (const [className, hexColor] of Object.entries(colorMap)) {
        if (primaryButton.includes(className)) return hexColor;
    }
    return '#2563eb';
});

const hasCheckboxColumn = computed(() => props.visibleColumns.includes('select'));

const isAllSelected = computed(
    () => props.selectedRows.length === props.data.length && props.data.length > 0,
);
const isIndeterminate = computed(
    () => props.selectedRows.length > 0 && props.selectedRows.length < props.data.length,
);

const handleSelectAllClick = () => {
    const newState = !isAllSelected.value;
    emit('selectionChange', newState ? props.data.map((row) => String(row.id)) : []);
};

// ── Columns (table) vs Fields (grid) ────────────────────────────────────────
const selectableColumns = computed(() =>
    props.columns.filter((col) => !['select', 'actions'].includes(col.key)),
);

const eligibleFieldRefs = computed<GridFieldConfig[]>(() => {
    const grid = props.gridConfig;
    if (!grid) return [];
    if (grid.fieldKeys?.length) {
        return grid.fieldKeys.map((ref) => (typeof ref === 'string' ? { key: ref } : ref));
    }
    const reserved = new Set<string>(['select', 'actions']);
    (grid.badgeKeys || []).forEach((ref) => reserved.add(gridFieldKey(ref)));
    (grid.footerKeys || []).forEach((ref) => reserved.add(gridFieldKey(ref)));
    if (typeof grid.imageKey === 'string') reserved.add(grid.imageKey);
    if (typeof grid.titleKey === 'string') reserved.add(grid.titleKey);
    if (typeof grid.subtitleKey === 'string') reserved.add(grid.subtitleKey);
    return props.columns
        .filter((c) => !reserved.has(c.key))
        .map((c): GridFieldConfig => ({ key: c.key }));
});

// Resolves a display label for either a table column or a (possibly custom,
// non-column) grid field — an explicit field label wins, else the matching
// column's label, else the raw key.
const resolveEntryLabel = (key: string, explicitLabel?: string): string => {
    if (explicitLabel) return resolveLabel(explicitLabel);
    const column = props.columns.find((c) => c.key === key);
    return column ? resolveColumnLabel(column) : key;
};

const dropdownEntries = computed(() => {
    if (props.layout === 'grid') {
        return eligibleFieldRefs.value.map((f) => ({
            key: f.key,
            label: resolveEntryLabel(f.key, f.label),
        }));
    }
    return selectableColumns.value.map((c) => ({
        key: c.key,
        label: resolveLabel(c.label),
    }));
});
const dropdownLabel = computed(() =>
    props.layout === 'grid' ? t('ui-builder.fields') : t('ui-builder.columns'),
);
const toggleLabel = computed(() =>
    props.layout === 'grid'
        ? t('ui-builder.toggle_fields')
        : t('ui-builder.toggle_columns'),
);
const resetLabel = computed(() =>
    props.layout === 'grid' ? t('ui-builder.reset_fields') : t('ui-builder.reset_columns'),
);

// ── Bulk actions ─────────────────────────────────────────────────────────────
const selectedFullRows = computed(() =>
    props.data.filter((row) => props.selectedRows.includes(String(row.id))),
);

const visibleBulkActions = computed(() =>
    props.customBulkActions.filter((action) => {
        if (!action.validation) return true;
        return action.validation(selectedFullRows.value).isValid;
    }),
);

watch(
    selectedFullRows,
    (newRows, oldRows) => {
        if (newRows.length === 0) return;
        const isCheckingFirstItem = newRows.length === 1 && oldRows.length === 0;
        props.customBulkActions.forEach((action) => {
            if (action.validation) {
                const result = action.validation(newRows);
                if (!result.isValid && result.message) {
                    const isMinLengthError = result.message
                        .toLowerCase()
                        .includes('select at least');
                    if (isCheckingFirstItem && isMinLengthError) return;
                    toast.warning(result.message);
                }
            }
        });
    },
    { deep: true },
);
</script>
