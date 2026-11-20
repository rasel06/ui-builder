<template>
    <div
        :class="`overflow-hidden rounded-lg border ${theme.tableBorder} ${theme.tableBackground}`"
    >
        <!-- Toolbar Skeleton (mirrors TableSkeleton.vue's own) -->
        <div
            :class="`flex flex-col gap-2 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${theme.tableToolbarBorder || ''} ${theme.tableToolbarBackground || ''}`"
        >
            <div
                :class="`flex flex-wrap items-center gap-2 rounded-lg border p-1.5 ${theme.tableRowSelected || ''} ${theme.tableToolbarBorder || ''}`"
            >
                <div
                    class="h-9 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
                ></div>
                <div
                    class="h-9 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
                ></div>
            </div>
        </div>

        <div
            class="grid"
            :class="currentGap"
            :style="{
                gridTemplateColumns: `repeat(auto-fill, minmax(${minCardWidth}, 1fr))`,
                padding: containerPadding,
            }"
        >
            <div
                v-for="i in perPage"
                :key="i"
                :class="`flex flex-col overflow-hidden rounded-lg border ${theme.tableBorder} ${theme.tableBackground}`"
            >
                <div
                    v-if="hasImage"
                    :class="`w-full animate-pulse bg-gray-200 dark:bg-gray-700 ${imageAspect}`"
                ></div>
                <div :class="['flex flex-1 flex-col gap-1.5', cardBodyPadding]">
                    <div class="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div class="h-3 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div class="flex gap-1 pt-0.5">
                        <div class="h-4 w-12 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
                        <div class="h-4 w-14 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                    <div :class="`flex flex-col gap-1 border-t pt-1.5 ${theme.tableRowBorder || ''}`">
                        <div class="h-3 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                        <div class="h-3 w-5/6 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                    <div :class="`mt-auto border-t pt-1.5 ${theme.tableRowBorder || ''}`">
                        <div class="h-3 w-1/3 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { storageKey } from '../../lib/storage';
import { computed } from 'vue';
import { useStorage } from '@vueuse/core';
import type { DensityType, GridViewConfig, ThemeConfig } from '../../types/module';

interface Props {
    gridConfig?: GridViewConfig;
    perPage?: number;
    theme: ThemeConfig | Partial<ThemeConfig>;
}

const props = withDefaults(defineProps<Props>(), {
    perPage: 10,
});

// Same storage key as GenericGrid.vue / DensityToggle.vue so the skeleton's
// sizing matches whatever density is currently active.
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

const minCardWidth = computed(() => props.gridConfig?.minCardWidth || '200px');
const hasImage = computed(() => Boolean(props.gridConfig?.imageKey));
const imageAspect = computed(() => props.gridConfig?.imageAspect || 'aspect-[4/3]');
</script>
