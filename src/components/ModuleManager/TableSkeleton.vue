<template>
    <div
        :class="`overflow-hidden rounded-lg border ${theme.tableBorder} ${theme.tableBackground}`"
    >
        <div
            :class="`flex flex-col gap-2 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${theme.toolbarBorder || theme.tableToolbarBorder || ''} ${theme.toolbarBackground || theme.tableToolbarBackground || ''}`"
        >
            <div
                :class="`flex flex-wrap items-center gap-2 rounded-lg border p-1.5 ${theme.rowSelected || ''} ${theme.toolbarBorder || theme.tableToolbarBorder || ''}`"
            >
                <div
                    class="h-9 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
                ></div>
                <div
                    class="h-9 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
                ></div>
            </div>
        </div>

        <div class="overflow-x-auto">
            <table data-table-type="own" class="w-full min-w-[640px]">
                <thead>
                    <tr
                        :class="`border-b ${theme.headerBackground || theme.tableHeaderBackground || ''} ${theme.tableBorder}`"
                    >
                        <th
                            v-if="hasCheckbox"
                            :class="`w-12 ${currentDensity.headerPadding}`"
                        >
                            <div class="flex items-center justify-center">
                                <div
                                    class="h-4 w-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
                                ></div>
                            </div>
                        </th>
                        <th
                            v-for="col in displayColumns"
                            :key="col.key"
                            :class="`${currentDensity.headerPadding} ${col.hiddenOnMobile ? 'hidden md:table-cell' : 'table-cell'} ${col.align ? `text-${col.align}` : col.key === 'actions' ? 'text-right' : 'text-left'} text-xs font-semibold tracking-wider uppercase ${theme.headerText || theme.tableHeaderText || ''} ${col.sticky === 'right' || col.sticky === true ? `sticky right-0 z-10 ${theme.headerBackground || theme.tableHeaderBackground || 'bg-gray-50 dark:bg-gray-950'} shadow-[-4px_0_6px_-1px_rgb(0,0,0,0.05)]` : col.sticky === 'left' ? `sticky left-0 z-10 ${theme.headerBackground || theme.tableHeaderBackground || 'bg-gray-50 dark:bg-gray-950'} shadow-[4px_0_6px_-1px_rgb(0,0,0,0.05)]` : ''}`"
                        >
                            <div
                                :class="`flex items-center gap-2 ${col.align === 'center' ? 'justify-center' : col.align === 'right' || col.key === 'actions' ? 'justify-end' : 'justify-start'}`"
                            >
                                <div
                                    :class="
                                        col.key === 'actions'
                                            ? 'h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700'
                                            : 'h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700'
                                    "
                                ></div>
                            </div>
                        </th>
                    </tr>
                </thead>

                <tbody :class="`divide-y ${theme.tableRowBorder}`">
                    <tr
                        v-for="i in perPage"
                        :key="i"
                        :class="`${theme.tableBackground}`"
                    >
                        <td
                            v-if="hasCheckbox"
                            :class="`w-12 ${currentDensity.cellPadding}`"
                        >
                            <div class="flex items-center justify-center">
                                <div
                                    class="h-4 w-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
                                ></div>
                            </div>
                        </td>
                        <td
                            v-for="col in displayColumns"
                            :key="col.key"
                            :class="`${currentDensity.cellPadding} ${currentDensity.fontSize || ''} ${col.hiddenOnMobile ? 'hidden md:table-cell' : 'table-cell'} ${col.align ? `text-${col.align}` : col.key === 'actions' ? 'text-right' : 'text-left'} ${theme.textPrimary || ''} ${col.sticky === 'right' || col.sticky === true ? `sticky right-0 z-10 ${theme.tableBackground || 'bg-white dark:bg-gray-800'} shadow-[-4px_0_6px_-1px_rgb(0,0,0,0.05)] group-hover:bg-gray-50 dark:group-hover:bg-gray-900` : col.sticky === 'left' ? `sticky left-0 z-10 ${theme.tableBackground || 'bg-white dark:bg-gray-800'} shadow-[4px_0_6px_-1px_rgb(0,0,0,0.05)] group-hover:bg-gray-50 dark:group-hover:bg-gray-900` : ''}`"
                        >
                            <template v-if="col.key === 'actions'">
                                <div
                                    class="flex items-center justify-end gap-1"
                                >
                                    <div
                                        class="h-8 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
                                    ></div>
                                </div>
                            </template>
                            <template v-else>
                                <SkeletonCell
                                    :type="col.type"
                                    :density="density"
                                />
                            </template>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { DENSITY_CONFIGS } from '../../composables/themes';
import type {
    ColumnConfig,
    DensityType,
    ThemeConfig,
} from '../../types/module';
import SkeletonCell from './SkeletonCell.vue';

interface Props {
    columns: ColumnConfig[];
    visibleColumns: string[];
    perPage?: number;
    hasCheckbox?: boolean;
    density?: DensityType;
    theme: ThemeConfig | Partial<ThemeConfig>;
}

const props = withDefaults(defineProps<Props>(), {
    perPage: 10,
    hasCheckbox: true,
    density: 'normal',
});

const displayColumns = computed(() =>
    props.columns.filter(
        (col) => props.visibleColumns.includes(col.key) && col.key !== 'select',
    ),
);

const currentDensity = computed(
    () => DENSITY_CONFIGS[props.density] || DENSITY_CONFIGS.normal,
);
</script>
