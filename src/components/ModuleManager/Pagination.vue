<template>
    <div :class="wrapperClass">
        <div
            :class="[
                `rounded-lg border ${theme.tableBackground} ${theme.tableBorder}`,
                paddingClass,
                isSticky ? 'backdrop-blur-sm' : '',
            ]"
        >
            <div
                class="flex flex-col items-center justify-between gap-4 sm:flex-row"
            >
                <div
                    dir="ltr"
                    :class="`flex items-center gap-3 text-sm ${theme.paginationText}`"
                >
                    <label
                        for="rows-per-page"
                        class="text-sm whitespace-nowrap"
                    >
                        {{ t('ui-builder.rows') }}:
                    </label>
                    <v-select
                        id="rows-per-page"
                        :model-value="perPageLocal"
                        :options="[10, 25, 50, 100]"
                        :clearable="false"
                        :searchable="false"
                        :class="[
                            'vue-select-custom rows-per-page-select w-[78px] rounded-md border',
                            paginationSizeKey,
                            theme.inputBackground,
                            theme.inputBorder,
                        ]"
                        style="--vs-controls-size: 0.6"
                        @update:model-value="selectPerPage"
                    >
                        <template #open-indicator>
                            <div
                                class="flex h-full items-center justify-center p-1"
                            >
                                <ChevronDown
                                    class="h-4 w-4 flex-shrink-0 opacity-50"
                                />
                            </div>
                        </template>
                    </v-select>
                    <span class="hidden text-sm whitespace-nowrap sm:inline">
                        <span class="font-medium">
                            {{
                                totalCount === 0 ? 0 : (page - 1) * perPage + 1
                            }}
                        </span>
                        -
                        <span class="font-medium">
                            {{ Math.min(page * perPage, totalCount) }}
                        </span>
                        {{ t('ui-builder.of') }}
                        <span class="font-medium">{{ totalCount }}</span>
                    </span>
                </div>

                <div v-if="totalPages > 1" class="flex items-center gap-1">
                    <!-- First Page -->
                    <button
                        @click="$emit('pageChange', 1)"
                        :disabled="page === 1"
                        :class="[
                            'flex items-center justify-center rounded-md border p-0',
                            squareButtonSizeClass,
                            theme.paginationButton,
                            page === 1 ? 'cursor-not-allowed opacity-50' : '',
                        ]"
                    >
                        <ChevronsLeft class="h-4 w-4 rtl:-scale-x-100" />
                    </button>

                    <!-- Previous Page -->
                    <button
                        @click="$emit('pageChange', page - 1)"
                        :disabled="page === 1"
                        :class="[
                            'flex items-center justify-center rounded-md border p-0',
                            squareButtonSizeClass,
                            theme.paginationButton,
                            page === 1 ? 'cursor-not-allowed opacity-50' : '',
                        ]"
                    >
                        <ChevronLeft class="h-4 w-4 rtl:-scale-x-100" />
                    </button>

                    <!-- Page Numbers -->
                    <button
                        v-for="pageNum in pageNumbers"
                        :key="pageNum"
                        @click="$emit('pageChange', pageNum)"
                        :class="[
                            'flex items-center justify-center rounded-md border p-0',
                            squareButtonSizeClass,
                            page === pageNum
                                ? theme.paginationActiveButton
                                : theme.paginationButton,
                        ]"
                    >
                        {{ pageNum }}
                    </button>

                    <!-- Next Page -->
                    <button
                        @click="$emit('pageChange', page + 1)"
                        :disabled="page === totalPages || totalPages === 0"
                        :class="[
                            'flex items-center justify-center rounded-md border p-0',
                            squareButtonSizeClass,
                            theme.paginationButton,
                            page === totalPages || totalPages === 0
                                ? 'cursor-not-allowed opacity-50'
                                : '',
                        ]"
                    >
                        <ChevronRight class="h-4 w-4 rtl:-scale-x-100" />
                    </button>

                    <!-- Last Page -->
                    <button
                        @click="$emit('pageChange', totalPages)"
                        :disabled="page === totalPages || totalPages === 0"
                        :class="[
                            'flex items-center justify-center rounded-md border p-0',
                            squareButtonSizeClass,
                            theme.paginationButton,
                            page === totalPages || totalPages === 0
                                ? 'cursor-not-allowed opacity-50'
                                : '',
                        ]"
                    >
                        <ChevronsRight class="h-4 w-4 rtl:-scale-x-100" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from '@lucide/vue';
import { computed, ref, watch } from 'vue';
import { useUiI18n } from '../../i18n';
import vSelect from 'vue-select';
import type { ThemeConfig } from '../../types/module';

interface Props {
    page: number;
    totalPages: number;
    totalCount: number;
    perPage: number;
    theme: ThemeConfig;
    isSticky?: boolean;
    density?: 'compact' | 'normal' | 'relaxed';
}

const props = withDefaults(defineProps<Props>(), {
    isSticky: false,
    density: 'normal',
});

const { t } = useUiI18n();

const emit = defineEmits<{
    pageChange: [page: number];
    perPageChange: [perPage: number];
}>();

const perPageLocal = ref(props.perPage);

watch(
    () => props.perPage,
    (newValue) => {
        perPageLocal.value = newValue;
    },
);

// Maps to FormField.vue's own .vue-select-custom size classes (sm/md/lg toggle heights of
// 30/34/38px), the closest match to this control's old h-8/h-9/h-10 native-<select> heights.
const paginationSizeKey = computed(() => {
    if (props.density === 'compact') return 'sm';
    if (props.density === 'relaxed') return 'lg';
    return 'md';
});

const squareButtonSizeClass = computed(() => {
    if (props.density === 'compact') return 'h-8 w-8';
    if (props.density === 'relaxed') return 'h-10 w-10';
    return 'h-9 w-9';
});

const paddingClass = computed(() => {
    if (props.density === 'compact') return 'p-2 sm:p-2.5';
    if (props.density === 'relaxed') return 'p-5';
    return 'p-4';
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

const pageNumbers = computed(() => {
    const maxButtons = 5;
    const pages: number[] = [];
    let startPage = Math.max(1, props.page - Math.floor(maxButtons / 2));
    const endPage = Math.min(props.totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
        startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    return pages;
});

const selectPerPage = (value: number) => {
    perPageLocal.value = value;
    emit('perPageChange', Number(value));
};
</script>

<style>
/* Pagination sits at the bottom of the list, so open the rows list upward. FormField.vue's
   global .vs__dropdown-menu rules use !important, hence the matching overrides. */
.rows-per-page-select .vs__dropdown-menu {
    top: auto !important;
    bottom: 100% !important;
    margin-top: 0 !important;
    margin-bottom: 4px !important;
}
</style>
