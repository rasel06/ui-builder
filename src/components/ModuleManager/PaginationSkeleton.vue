<template>
    <div :class="wrapperClass">
        <div
            :class="[
                `rounded-lg border ${theme.tableBackground} ${theme.tableBorder}`,
                paddingClass,
                isSticky ? 'shadow-lg backdrop-blur-sm' : '',
            ]"
        >
            <div
                class="flex flex-col items-center justify-between gap-4 sm:flex-row"
            >
                <div class="flex items-center gap-3 text-sm">
                    <div
                        class="h-4 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
                    ></div>
                    <div
                        :class="[
                            selectHeightClass,
                            `w-[70px] animate-pulse rounded-md border ${theme.inputBorder} ${theme.inputBackground}`,
                        ]"
                    ></div>
                    <div class="hidden sm:inline">
                        <div class="flex items-center gap-1">
                            <div
                                class="h-4 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
                            ></div>
                            <div
                                class="h-4 w-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
                            ></div>
                            <div
                                class="h-4 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
                            ></div>
                            <div
                                class="h-4 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
                            ></div>
                            <div
                                class="h-4 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
                            ></div>
                        </div>
                    </div>
                </div>

                <div v-if="showPagination" class="flex items-center gap-1">
                    <!-- First Page -->
                    <div
                        :class="[
                            'animate-pulse rounded-md border',
                            buttonSizeClass,
                            theme.paginationButton,
                        ]"
                    ></div>

                    <!-- Previous Page -->
                    <div
                        :class="[
                            'animate-pulse rounded-md border',
                            buttonSizeClass,
                            theme.paginationButton,
                        ]"
                    ></div>

                    <!-- Page Numbers -->
                    <div
                        v-for="i in pageButtonCount"
                        :key="i"
                        :class="[
                            'animate-pulse rounded-md border',
                            buttonSizeClass,
                            theme.paginationButton,
                        ]"
                    ></div>

                    <!-- Next Page -->
                    <div
                        :class="[
                            'animate-pulse rounded-md border',
                            buttonSizeClass,
                            theme.paginationButton,
                        ]"
                    ></div>

                    <!-- Last Page -->
                    <div
                        :class="[
                            'animate-pulse rounded-md border',
                            buttonSizeClass,
                            theme.paginationButton,
                        ]"
                    ></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ThemeConfig } from '../../types/module';

interface Props {
    isSticky?: boolean;
    showPagination?: boolean;
    pageButtonCount?: number;
    theme: ThemeConfig | Partial<ThemeConfig>;
    density?: 'compact' | 'normal' | 'relaxed';
}

const props = withDefaults(defineProps<Props>(), {
    isSticky: false,
    showPagination: true,
    pageButtonCount: 5,
    density: 'normal',
});

const wrapperClass = computed(() => {
    const mt =
        props.density === 'compact'
            ? 'mt-2'
            : props.density === 'relaxed'
              ? 'mt-4'
              : 'mt-3';
    const bottom =
        props.density === 'compact'
            ? 'bottom-1'
            : props.density === 'relaxed'
              ? 'bottom-3'
              : 'bottom-2';
    return props.isSticky ? `sticky ${bottom} z-10 ${mt}` : mt;
});

const paddingClass = computed(() => {
    if (props.density === 'compact') return 'p-2 sm:p-2.5';
    if (props.density === 'relaxed') return 'p-5';
    return 'p-4';
});

const selectHeightClass = computed(() => {
    if (props.density === 'compact') return 'h-8';
    if (props.density === 'relaxed') return 'h-10';
    return 'h-9';
});

const buttonSizeClass = computed(() => {
    if (props.density === 'compact') return 'h-8 w-8';
    if (props.density === 'relaxed') return 'h-10 w-10';
    return 'h-9 w-9';
});
</script>
