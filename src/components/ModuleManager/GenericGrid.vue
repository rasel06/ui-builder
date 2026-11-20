<template>
    <div
        :class="
            hideToolbar
                ? ''
                : `overflow-hidden rounded-lg border ${theme.tableBorder} ${theme.tableBackground}`
        "
    >
        <!-- Toolbar (hidden when a shared DataToolbar is rendered above this component
             instead — see ModuleManager.vue's `hideToolbar` wiring, so the toolbar stays
             mounted while only the cards swap) -->
        <div
            v-if="!hideToolbar"
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
                <!-- Select all (when a bulk-selectable 'select' column is present) -->
                <div
                    v-if="hasCheckboxColumn"
                    class="flex items-center gap-2 px-1"
                >
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

                <DropdownMenu :modal="false">
                    <DropdownMenuTrigger as-child>
                        <Button
                            variant="ghost"
                            :class="cn('border font-medium flex items-center justify-center', buttonSizeClass, theme.secondaryButton)"
                        >
                            <Eye class="me-2 h-4 w-4" />
                            {{ t('ui-builder.fields') }}
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
                                {{ t('ui-builder.toggle_fields') }}
                            </DropdownMenuLabel>
                            <Button
                                variant="ghost"
                                size="icon"
                                :class="`h-6 w-6 ${theme.iconActive || 'text-blue-600'} hover:opacity-80 transition-opacity`"
                                :title="t('ui-builder.reset_fields')"
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
                                v-for="field in eligibleFields"
                                :key="field.key"
                                :checked="visibleColumns.includes(field.key)"
                                @select.prevent
                                @click="emit('toggleColumn', field.key)"
                                :class="theme.menuText"
                            >
                                <div class="flex w-full items-center justify-between">
                                    <span>{{ resolveFieldLabel(field) }}</span>
                                    <Eye
                                        v-if="visibleColumns.includes(field.key)"
                                        :class="['ms-2 h-4 w-4', theme.iconActive || 'text-blue-600']"
                                    />
                                    <EyeOff
                                        v-else
                                        :class="['ms-2 h-4 w-4', theme.iconInactive || 'text-gray-400 dark:text-neutral-400']"
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
                    :model-value="layout || 'grid'"
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
                    :class="cn('border font-medium flex items-center justify-center', buttonSizeClass, theme.secondaryButton)"
                    @click="emit('selectionChange', [])"
                >
                    <Eraser class="h-4 w-4" />
                    {{ t('ui-builder.clear') }}
                </Button>
                <div :class="['mx-1 h-4 w-px', theme.toolbarSeparator]"></div>
                <template v-for="action in visibleBulkActions" :key="action.key">
                    <Button
                        variant="ghost"
                        :class="cn('border font-medium flex items-center justify-center', buttonSizeClass, theme.secondaryButton)"
                        @click="emit('bulkAction', action.key, selectedRows)"
                    >
                        <component v-if="action.icon" :is="action.icon" class="me-2 h-4 w-4" />
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
                    <component :is="actionConfig?.bulkDelete?.icon || Trash2" class="me-2 h-4 w-4" />
                    {{ t('ui-builder.delete') }} ({{ selectedRows.length }})
                </Button>
            </div>
        </div>

        <div
            class="grid"
            :class="currentGap"
            :style="{
                gridTemplateColumns: `repeat(auto-fill, minmax(${gridConfig.minCardWidth || '200px'}, 1fr))`,
                padding: containerPadding,
            }"
        >
            <div
                v-for="row in data"
                :key="row.id"
                data-grid-card
                :class="
                    cn(
                        'group relative flex cursor-pointer flex-col overflow-hidden rounded-lg border transition-colors',
                        theme.tableBorder,
                        selectedRows.includes(String(row.id)) ? getSelectedRowClass() : theme.tableBackground,
                        !selectedRows.includes(String(row.id)) && theme.rowHover,
                        gridConfig.cardClass,
                    )
                "
                @click="handleCardClick($event, row)"
            >
                <div v-if="hasCheckboxColumn" class="absolute top-2 start-2 z-10">
                    <input
                        type="checkbox"
                        :checked="selectedRows.includes(String(row.id))"
                        @click.stop="handleSelectRowClick(row.id)"
                        class="h-4 w-4 cursor-pointer rounded border-gray-300 dark:border-white/15 shadow"
                        :style="{ accentColor: checkboxAccentColor }"
                    />
                </div>

                <div
                    v-if="hasVisibleActions(row)"
                    class="absolute top-2 end-2 z-10"
                    @click.stop
                >
                    <DropdownMenu :modal="false">
                        <DropdownMenuTrigger as-child>
                            <Button
                                variant="ghost"
                                size="icon"
                                :class="cn('h-6 w-6 rounded-full shadow-sm backdrop-blur', theme.tableBackground)"
                            >
                                <MoreHorizontal class="h-3.5 w-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            :collision-padding="8"
                            :class="cn('w-36 border p-1', theme.menuBackground, theme.menuBorder, theme.menuText)"
                        >
                            <template
                                v-for="(action, index) in getRowDropdownActions(row)"
                                :key="action.key"
                            >
                                <DropdownMenuSeparator
                                    v-if="index > 0"
                                    :class="cn('my-0.5', theme.toolbarSeparator)"
                                />
                                <DropdownMenuItem
                                    @click="action.onClick"
                                    :class="cn(
                                        'cursor-pointer flex items-center gap-2 px-2 py-1 text-xs font-medium',
                                        action.class || theme.menuText,
                                    )"
                                >
                                    <component
                                        v-if="action.icon"
                                        :is="action.icon"
                                        :class="['h-3.5 w-3.5', action.iconClass || 'opacity-60']"
                                    />
                                    <span>{{ resolveLabel(action.label) }}</span>
                                </DropdownMenuItem>
                            </template>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div
                    v-if="gridConfig.imageKey"
                    :class="cn('w-full overflow-hidden bg-gray-100 dark:bg-gray-900', gridConfig.imageAspect || 'aspect-[4/3]')"
                >
                    <img
                        :src="resolveImage(row)"
                        :alt="String(resolveGridValue(gridConfig.titleKey, row) ?? '')"
                        :class="cn('h-full w-full object-cover', gridConfig.imageClass)"
                        @error="(e) => { (e.target as HTMLImageElement).src = gridConfig.imageFallback || '/images/placeholder.jpg'; }"
                    />
                </div>

                <div :class="['flex flex-1 flex-col gap-1.5', cardBodyPadding]">
                    <div class="flex flex-col gap-0.5 pe-6">
                        <div class="flex flex-wrap items-center gap-1.5">
                            <h3 :class="cn('truncate text-sm font-semibold', theme.textPrimary, gridConfig.titleClass)">
                                {{ resolveGridValue(gridConfig.titleKey, row) ?? '—' }}
                            </h3>
                        </div>
                        <p
                            v-if="gridConfig.subtitleKey"
                            :class="cn('truncate text-[11px]', theme.textSecondary, gridConfig.subtitleClass)"
                        >
                            {{ resolveGridValue(gridConfig.subtitleKey, row) ?? '—' }}
                        </p>
                        <div
                            v-if="badgeFields.length"
                            :class="cn('flex flex-wrap items-center gap-1 pt-0.5', gridConfig.badgesClass)"
                        >
                            <template v-for="field in badgeFields" :key="field.key">
                                <component
                                    :is="resolveFieldOutput(field, row)"
                                    v-if="isVNode(resolveFieldOutput(field, row))"
                                />
                                <span v-else :class="cn(theme.textSecondary, field.valueClass)">{{
                                    resolveFieldOutput(field, row)
                                }}</span>
                            </template>
                        </div>
                    </div>

                    <div
                        v-if="visibleBodyFields.length"
                        :class="cn('flex flex-col gap-1 border-t pt-1.5', theme.rowBorder, gridConfig.fieldsClass)"
                    >
                        <div
                            v-for="field in visibleBodyFields"
                            :key="field.key"
                            class="flex items-center justify-between gap-2 text-[11px]"
                        >
                            <span :class="cn('shrink-0', theme.textSecondary, field.labelClass)">{{
                                resolveFieldLabel(field)
                            }}</span>
                            <span :class="cn('truncate text-right font-medium', theme.textPrimary, field.valueClass)">
                                <component
                                    :is="resolveFieldOutput(field, row)"
                                    v-if="isVNode(resolveFieldOutput(field, row))"
                                />
                                <template v-else>{{ resolveFieldOutput(field, row) }}</template>
                            </span>
                        </div>
                    </div>

                    <div
                        v-if="footerFields.length"
                        :class="cn('mt-auto flex flex-wrap items-center justify-between gap-2 border-t pt-1.5', theme.rowBorder, gridConfig.footerClass)"
                    >
                        <div
                            v-for="field in footerFields"
                            :key="field.key"
                            class="flex flex-col"
                        >
                            <span :class="cn('text-[9px] uppercase tracking-wide', theme.textSecondary, field.labelClass)">{{
                                resolveFieldLabel(field)
                            }}</span>
                            <span :class="cn('text-[13px] font-semibold', theme.textPrimary, field.valueClass)">
                                <component
                                    :is="resolveFieldOutput(field, row)"
                                    v-if="isVNode(resolveFieldOutput(field, row))"
                                />
                                <template v-else>{{ resolveFieldOutput(field, row) }}</template>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { storageKey } from '../../lib/storage';
import { computed, h, isVNode, watch, type Component } from 'vue';
import { useUiI18n } from '../../i18n';
import { useStorage } from '@vueuse/core';
import { resolveColumnLabel, resolveLabel } from '../../i18n';
import { cn } from '../../lib/utils';
import { Badge } from '../../primitives/badge';
import { Button } from '../../primitives/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../../primitives/dropdown-menu';
import {
    Eraser,
    Eye,
    EyeOff,
    MoreHorizontal,
    Pencil,
    RotateCcw,
    Trash2,
} from '@lucide/vue';
import { toast } from '../../composables/useToast';
import type {
    ActionConfig,
    ActionSettings,
    BadgeConfig,
    ColumnConfig,
    CustomAction,
    DensityType,
    GridFieldConfig,
    GridFieldRef,
    GridValueResolver,
    GridViewConfig,
    ModuleConfig,
    TableTheme,
} from '../../types/module';
import { gridFieldKey } from '../../types/module';
import DensityToggle from './DensityToggle.vue';
import LayoutToggle from './LayoutToggle.vue';
import SwitchColumn from './SwitchColumn.vue';

const { t } = useUiI18n();

interface Props {
    data: any[];
    columns: ColumnConfig[];
    gridConfig: GridViewConfig;
    visibleColumns: string[];
    canUpdate?: boolean;
    canDelete?: boolean;
    canBulkDelete?: boolean;
    canView?: boolean;
    selectedRows: string[];
    totalCount?: number;
    theme?: Partial<TableTheme>;
    customRowActions?: CustomAction[];
    customBulkActions?: CustomAction[];
    updateEndpoint?: string;
    editIcon?: Component;
    deleteIcon?: Component;
    viewIcon?: Component;
    actionConfig?: ActionConfig;
    config?: ModuleConfig;
    selectedTheme?: string;
    layout?: 'table' | 'grid';
    showLayoutToggle?: boolean;
    hideToolbar?: boolean; // ✅ NEW: skip this component's own toolbar — a shared DataToolbar is rendered above it instead
}

const props = withDefaults(defineProps<Props>(), {
    canUpdate: true,
    canDelete: true,
    canBulkDelete: true,
    canView: true,
    customRowActions: () => [],
    customBulkActions: () => [],
    theme: () => ({}),
    hideToolbar: false,
});

const emit = defineEmits<{
    rowClick: [row: any];
    viewClick: [row: any];
    delete: [id: string | number];
    bulkAction: [actionKey: string, ids: string[]];
    customRowAction: [action: CustomAction, row: any];
    toggleColumn: [key: string];
    resetColumns: [];
    selectionChange: [rows: string[]];
    'update:layout': [layout: 'table' | 'grid'];
}>();

// ── Theme (mirrors GenericTable.vue's own default palette) ─────────────────
const defaultTheme: TableTheme = {
    tableBackground: 'bg-white dark:bg-gray-900',
    tableBorder: 'border-gray-200 dark:border-gray-700',
    headerBackground: 'bg-gray-50 dark:bg-gray-950',
    headerText: 'text-gray-900 dark:text-gray-100',
    rowHover: 'hover:bg-gray-50 dark:hover:bg-gray-950/50',
    rowSelected: 'bg-blue-50 dark:bg-blue-900/30',
    rowBorder: 'border-gray-100 dark:border-gray-800',
    textPrimary: 'text-gray-900 dark:text-gray-100',
    textSecondary: 'text-gray-700 dark:text-gray-300',
    toolbarBackground: 'bg-gray-50 dark:bg-gray-950',
    toolbarBorder: 'border-gray-200 dark:border-gray-800',
    toolbarText: 'text-gray-700 dark:text-gray-300',
    toolbarSeparator: 'bg-gray-300 dark:bg-gray-600',
    iconActive: 'text-gray-600 dark:text-gray-400',
    iconInactive: 'text-gray-500 dark:text-gray-400',
    menuBackground: 'bg-white dark:bg-gray-950',
    menuBorder: 'border-gray-200 dark:border-gray-800',
    menuText: 'text-gray-900 dark:text-gray-100',
    primaryButton: 'bg-gray-600 hover:bg-gray-700 text-white',
    secondaryButton:
        'bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-800',
    checkbox: 'text-blue-600 focus:ring-blue-500',
};

const theme = computed(() => ({ ...defaultTheme, ...props.theme }));

// Same storage key as GenericTable.vue / DensityToggle.vue so density stays in
// sync across layouts (and across the shared DensityToggle instance).
const localDensity = useStorage<DensityType>(storageKey('table-density'), 'normal');
const currentGap = computed(() => {
    if (localDensity.value === 'compact') return 'gap-2';
    if (localDensity.value === 'relaxed') return 'gap-4';
    return 'gap-3';
});
const containerPadding = computed(() => {
    if (localDensity.value === 'compact') return '0.5rem';
    if (localDensity.value === 'relaxed') return '1rem';
    return '0.75rem';
});
const cardBodyPadding = computed(() => {
    if (localDensity.value === 'compact') return 'p-2';
    if (localDensity.value === 'relaxed') return 'p-3.5';
    return 'p-2.5';
});

const buttonSizeClass = computed(() => {
    if (localDensity.value === 'compact') return 'h-8 text-xs px-3';
    if (localDensity.value === 'relaxed') return 'h-10 text-base px-5';
    return 'h-9 text-sm px-4';
});

const checkboxAccentColor = computed(() => {
    const primaryButton = theme.value.primaryButton || '';
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

const getSelectedRowClass = () => {
    if (theme.value.rowSelected) return theme.value.rowSelected;
    return 'bg-blue-50 dark:bg-blue-950/30';
};

const getTagBadgeClass = () => {
    const primaryBg = theme.value.primaryButton || '';
    const colorFamilies = [
        'blue', 'emerald', 'green', 'purple', 'red', 'orange', 'yellow', 'teal',
        'cyan', 'indigo', 'pink', 'rose', 'gray', 'slate', 'zinc', 'stone',
        'neutral', 'lime', 'amber', 'violet', 'fuchsia', 'sky',
    ];
    const detected = colorFamilies.find((c) => primaryBg.toLowerCase().includes(c));
    if (detected) {
        const color = detected === 'green' && primaryBg.includes('emerald') ? 'emerald' : detected;
        // Literal tc-* classes (Tailwind cannot see a runtime-built `text-${color}-800`); theme-<color> picks the palette.
        return `theme-${color} bg-tc-100 text-tc-800 border-tc-200 dark:bg-tc-500/15 dark:text-tc-300 dark:border-tc-500/25`;
    }
    return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-500/25';
};

// ── Grid value resolution ───────────────────────────────────────────────────
const resolveGridValue = (resolver: GridValueResolver | undefined, row: any) => {
    if (!resolver) return undefined;
    return typeof resolver === 'function' ? resolver(row) : row?.[resolver];
};

const resolveImage = (row: any) => {
    const val = resolveGridValue(props.gridConfig.imageKey, row);
    return (typeof val === 'string' && val) || props.gridConfig.imageFallback || '/images/placeholder.jpg';
};

// ── Field refs (badges/body/footer) — normalize plain keys and rich configs
//    into one shape, then resolve each against a matching tableColumns entry
//    unless the field brings its own grid-only `render`. ───────────────────
const normalizeFieldRefs = (refs: GridFieldRef[] | undefined): GridFieldConfig[] =>
    (refs || []).map((ref) => (typeof ref === 'string' ? { key: ref } : ref));

const reservedKeys = computed(() => {
    const keys = new Set<string>(['select', 'actions']);
    (props.gridConfig.badgeKeys || []).forEach((ref) => keys.add(gridFieldKey(ref)));
    (props.gridConfig.footerKeys || []).forEach((ref) => keys.add(gridFieldKey(ref)));
    if (typeof props.gridConfig.imageKey === 'string') keys.add(props.gridConfig.imageKey);
    if (typeof props.gridConfig.titleKey === 'string') keys.add(props.gridConfig.titleKey);
    if (typeof props.gridConfig.subtitleKey === 'string') keys.add(props.gridConfig.subtitleKey);
    return keys;
});

const eligibleFields = computed(() => {
    // An explicit empty list means "no body fields"; only an absent one falls back to the table columns.
    if (props.gridConfig.fieldKeys) {
        return normalizeFieldRefs(props.gridConfig.fieldKeys);
    }
    return props.columns
        .filter((c) => !reservedKeys.value.has(c.key))
        .map((c): GridFieldConfig => ({ key: c.key }));
});

const visibleBodyFields = computed(() =>
    eligibleFields.value.filter((f) => props.visibleColumns.includes(f.key)),
);

const badgeFields = computed(() => normalizeFieldRefs(props.gridConfig.badgeKeys));

const footerFields = computed(() => normalizeFieldRefs(props.gridConfig.footerKeys));

// Resolves a field's display value: a grid-only `render` wins outright; otherwise
// falls back to the matching tableColumns entry's own type/render (badge, status,
// switch, custom, …) via renderFieldValue(), then to the raw row value.
const resolveFieldOutput = (field: GridFieldConfig, row: any) => {
    if (field.render) {
        const result = field.render(row);
        if (isVNode(result)) return result;
        return result !== null && result !== undefined && result !== '' ? result : '—';
    }
    const column = props.columns.find((c) => c.key === field.key);
    if (!column) {
        const raw = row[field.key];
        return raw !== null && raw !== undefined && raw !== '' ? String(raw) : '—';
    }
    return renderFieldValue(row, column);
};

const resolveFieldLabel = (field: GridFieldConfig) => {
    // Routed through resolveColumnLabel() (not resolveLabel() directly) even when
    // `field.label` is explicitly set, so a grid field named e.g. `status` still gets
    // the shared "ui-builder.status" translation regardless of what per-module label
    // key the config supplies - same reserved-name special case column headers get.
    if (field.label) return resolveColumnLabel({ key: field.key, label: field.label });
    const column = props.columns.find((c) => c.key === field.key);
    return column ? resolveColumnLabel(column) : field.key;
};

// ── Cell value rendering (trimmed mirror of GenericTable.vue's getCellContent) ─
const renderFieldValue = (row: any, column: ColumnConfig) => {
    switch (column.type) {
        case 'badge': {
            const rawValue = column.render ? column.render(row, theme.value, localDensity.value) : row[column.key];

            const getBadgeVNode = (value: any) => {
                let lookupValue = value;
                if (value && typeof value === 'object') {
                    lookupValue = value.name || value.label || value.id;
                }
                const bc = column.badgeConfig as Record<any, BadgeConfig> | undefined;
                if (bc && !('variantMap' in bc) && !('colorMap' in bc)) {
                    const config = bc[String(lookupValue)];
                    if (config) {
                        return h(
                            Badge,
                            {
                                variant: config.variant as any,
                                class: cn('inline-flex h-auto items-center gap-1 py-0.5 text-[11px]', config.class),
                            },
                            () => [
                                config.icon ? h(config.icon, { class: 'h-3 w-3 flex-shrink-0' }) : null,
                                h('span', resolveLabel(config.label)),
                            ],
                        );
                    }
                }
                return h(
                    Badge,
                    { class: cn('h-auto border py-0.5 text-[11px]', getTagBadgeClass()) },
                    () => String(lookupValue ?? '—'),
                );
            };

            if (Array.isArray(rawValue)) {
                if (!rawValue.length) return '—';
                return h(
                    'div',
                    { class: 'inline-flex flex-wrap items-center justify-end gap-1' },
                    rawValue.map((v) => getBadgeVNode(v)),
                );
            }
            return rawValue !== undefined && rawValue !== null && rawValue !== ''
                ? getBadgeVNode(rawValue)
                : '—';
        }

        case 'status': {
            const isActive = row.status === 'Active';
            return h(
                'span',
                {
                    class: `inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        isActive
                            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    }`,
                },
                [
                    h('span', { class: `h-1.5 w-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}` }),
                    String(row.status ?? '—'),
                ],
            );
        }

        case 'switch': {
            const densityToSize: Record<DensityType, string> = { compact: 'sm', normal: 'sm', relaxed: 'md' };
            return h(SwitchColumn, {
                row,
                config: { field: column.key, onLabel: ' ', offLabel: ' ', ...(column.switchConfig || {}) },
                permission: column.permission,
                disabled: column.disabled,
                readonly: column.readonly || !column.switchConfig,
                isChecked:
                    typeof column.isChecked === 'function'
                        ? column.isChecked(row)
                        : column.isChecked,
                variant: column.variant,
                updateEndpoint: props.updateEndpoint,
                theme: theme.value,
                dataPropName: props.config?.dataPropName || 'data',
                extraPropsToRefresh: props.config?.extraPropsToRefresh || [],
                size: densityToSize[localDensity.value] || 'sm',
            });
        }

        case 'component':
        case 'custom':
        default: {
            if (column.render) {
                const rendered = column.render(row, theme.value, localDensity.value);
                if (isVNode(rendered)) return rendered;
                if (column.type === 'component' && rendered && typeof rendered === 'object') {
                    return h(rendered as Component);
                }
                return rendered !== null && rendered !== undefined && rendered !== '' ? String(rendered) : '—';
            }
            return row[column.key] !== null && row[column.key] !== undefined && row[column.key] !== ''
                ? String(row[column.key])
                : '—';
        }
    }
};

// ── Selection ─────────────────────────────────────────────────────────────
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

const handleSelectRowClick = (id: string | number) => {
    const idStr = String(id);
    const isCurrentlySelected = props.selectedRows.includes(idStr);
    const newSelection = isCurrentlySelected
        ? props.selectedRows.filter((rowId) => rowId !== idStr)
        : [...props.selectedRows, idStr];
    emit('selectionChange', newSelection);
};

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
                    const isMinLengthError = result.message.toLowerCase().includes('select at least');
                    if (isCheckingFirstItem && isMinLengthError) return;
                    toast.warning(result.message);
                }
            }
        });
    },
    { deep: true },
);

// ── Row actions (mirrors GenericTable.vue's dropdown action list) ──────────
const isActionVisible = (action: ActionSettings | CustomAction | undefined, row: any) => {
    if (!action) return true;
    if (typeof action.show === 'function') return action.show(row);
    return action.show !== false;
};

const visibleDropdownActionsForRow = (row: any) =>
    props.customRowActions.filter((a) => a.position !== 'standalone' && isActionVisible(a, row));

const handleCustomAction = (action: CustomAction, row: any) => {
    emit('customRowAction', action, row);
};

const getRowDropdownActions = (row: any) => {
    const list: Array<{ key: string; label: string; icon: any; onClick: () => void; class?: string; iconClass?: string }> = [];

    const viewVisible =
        props.actionConfig?.detailsView?.show !== false &&
        isActionVisible(props.actionConfig?.detailsView, row) &&
        props.canView;
    if (viewVisible) {
        list.push({
            key: 'view',
            label: t('ui-builder.view'),
            icon: props.actionConfig?.detailsView?.icon || props.viewIcon || Eye,
            onClick: () => emit('viewClick', row),
        });
    }

    const editVisible = isActionVisible(props.actionConfig?.edit, row) && props.canUpdate;
    if (editVisible) {
        list.push({
            key: 'edit',
            label: t('ui-builder.edit'),
            icon: props.actionConfig?.edit?.icon || props.editIcon || Pencil,
            onClick: () => emit('rowClick', row),
        });
    }

    for (const action of visibleDropdownActionsForRow(row)) {
        list.push({
            key: `custom-${action.key}`,
            label: action.label,
            icon: action.icon,
            onClick: () => handleCustomAction(action, row),
        });
    }

    const deleteVisible = isActionVisible(props.actionConfig?.delete, row) && props.canDelete;
    if (deleteVisible) {
        list.push({
            key: 'delete',
            label: t('ui-builder.delete'),
            icon: props.actionConfig?.delete?.icon || props.deleteIcon || Trash2,
            onClick: () => emit('delete', row.id),
            class: 'text-red-600 focus:text-red-700 focus:bg-red-50/50 dark:focus:bg-red-950/20',
            iconClass: 'text-red-500',
        });
    }

    return list;
};

const hasVisibleActions = (row: any) => {
    const editVisible = isActionVisible(props.actionConfig?.edit, row);
    const deleteVisible = isActionVisible(props.actionConfig?.delete, row);
    const viewVisible =
        props.actionConfig?.detailsView?.show !== false && isActionVisible(props.actionConfig?.detailsView, row);
    return (
        (editVisible && props.canUpdate) ||
        (deleteVisible && props.canDelete) ||
        (viewVisible && props.canView) ||
        visibleDropdownActionsForRow(row).length > 0
    );
};

const handleCardClick = (event: MouseEvent, row: any) => {
    const target = event.target as HTMLElement;
    if (target.closest('button, input, [role="menuitem"]')) return;
    emit('rowClick', row);
};
</script>
