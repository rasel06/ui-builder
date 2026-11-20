<template>
    <div
        class="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center"
    >
        <div class="flex flex-col gap-1">
            <div class="flex items-center gap-3">
                <component
                    v-if="resolvedModuleIcon"
                    :is="resolvedModuleIcon"
                    :class="`h-7 w-7 ${theme.headerText}`"
                />
                <h2 :class="`text-2xl font-bold ${theme.headerText}`">
                    {{ pluralModuleName }}
                </h2>
                <span
                    :class="`rounded-full px-3 py-1 text-sm font-semibold ${theme.badgeBackground} ${theme.badgeText}`"
                >
                    {{ totalCount }}
                </span>
            </div>
            <p
                v-if="resolvedDescription"
                :class="`text-sm ${theme.tableTextSecondary}`"
            >
                {{ resolvedDescription }}
            </p>
        </div>

        <div :class="['flex flex-wrap items-center', gapClass]">
            <div
                class="relative flex-shrink-0 overflow-hidden rounded-md"
                :class="[
                    searchBoxHeightClass,
                    theme.inputBorder,
                    theme.inputBackground,
                ]"
                :style="{
                    borderWidth: '1px',
                    transition: 'all 0.3s ease-out',
                    width:
                        isSearchExpanded || searchTermLocal
                            ? '250px'
                            : density === 'compact'
                              ? '32px'
                              : density === 'relaxed'
                                ? '40px'
                                : '36px',
                }"
            >
                <button
                    v-if="!isSearchExpanded && !searchTermLocal"
                    @click="expandSearch"
                    class="absolute inset-0 z-20 flex h-full w-full items-center justify-center outline-none"
                >
                    <Search :class="`h-4 w-4 ${theme.paginationText}`" />
                </button>

                <div
                    class="relative h-full w-[250px]"
                    :style="{ transition: 'opacity 0.3s ease-out' }"
                    :class="
                        isSearchExpanded || searchTermLocal
                            ? 'opacity-100'
                            : 'pointer-events-none opacity-0'
                    "
                >
                    <Search
                        :class="`absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 ${theme.paginationText}`"
                    />
                    <input
                        ref="searchInputRef"
                        v-model="searchTermLocal"
                        data-module-search
                        @focus="resetShrinkTimer"
                        @blur="resetShrinkTimer"
                        name="search"
                        type="text"
                        :placeholder="t('ui-builder.search')"
                        :class="[
                            controlHeightTextClass,
                            placeholderSizeClass,
                            `h-full w-full border-none bg-transparent pr-9 pl-9 font-medium outline-none placeholder:font-medium focus:ring-0 ${theme.inputText}`,
                        ]"
                    />
                </div>
            </div>

            <button
                @click="$emit('refresh')"
                :disabled="isRefreshing"
                :class="[
                    squareButtonSizeClass,
                    `flex items-center justify-center rounded-md ${theme.secondaryButton}`,
                ]"
            >
                <RefreshCw
                    :class="`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`"
                />
            </button>

            <SavedViewsMenu
                v-if="viewScope"
                :scope="viewScope"
                :theme="theme"
                :button-class="`${squareButtonSizeClass} flex items-center justify-center rounded-md ${theme.secondaryButton}`"
            />

            <button
                v-if="canImport"
                @click="$emit('import')"
                :class="[
                    buttonSizeClass,
                    `rounded-md font-medium ${theme.secondaryButton}`,
                ]"
            >
                <Upload class="me-2 inline h-4 w-4" />
                {{ t('ui-builder.import') }}
            </button>

            <button
                v-for="action in customHeaderActions"
                :key="action.key"
                @click="$emit('customHeaderAction', action)"
                :class="[
                    buttonSizeClass,
                    `flex flex-row items-center justify-center rounded-md font-medium ${action.variant === 'default' ? theme.primaryButton : theme.secondaryButton}`,
                ]"
            >
                <component
                    v-if="action.icon"
                    :is="action.icon"
                    class="me-2 inline h-4 w-4"
                />
                {{ resolveLabel(action.label) }}
            </button>

            <button
                v-if="canCreate"
                @click="$emit('createClick')"
                :class="[
                    buttonSizeClass,
                    `flex flex-row items-center justify-center rounded-md font-medium ${theme.primaryButton}`,
                ]"
            >
                <component
                    :is="createIcon || Plus"
                    class="me-2 inline h-4 w-4"
                />
                {{ t('ui-builder.add') }}
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useLucideIcons } from '../../composables/useLucideIcons';
import { Plus, RefreshCw, Search, Upload } from '@lucide/vue';
import pluralize from 'pluralize';
import type { Component } from 'vue';
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useUiI18n } from '../../i18n';
import { resolveLabel, resolveModuleName } from '../../i18n';
import type { CustomAction, ThemeConfig } from '../../types/module';
import SavedViewsMenu from './SavedViewsMenu.vue';

const { t } = useUiI18n();
const { resolveLucideIcon } = useLucideIcons();

interface Props {
    moduleName: string;
    /**
     * The icon shown beside the module title.
     * Accepts a Vue Component (e.g. imported `Van`) OR a Lucide icon name
     * string (e.g. `'Van'`) so it can come straight from the database.
     */
    moduleIcon?: Component | string;
    /** Short subtitle under the title. Plain text or a resolveLabel() key. */
    description?: string;
    totalCount: number;
    searchTerm: string;
    hasActiveFilters: boolean;
    isRefreshing: boolean;
    canExport: boolean;
    canCreate: boolean;
    canImport?: boolean;
    theme: ThemeConfig;
    density?: 'compact' | 'normal' | 'relaxed';
    createIcon?: Component;
    exportIcon?: Component;
    customHeaderActions?: CustomAction[];
    /** Where this list's saved views are kept; no Views menu when empty. */
    viewScope?: string;
}

const props = withDefaults(defineProps<Props>(), {
    canImport: false,
    density: 'normal',
    customHeaderActions: () => [],
});

const resolvedModuleIcon = computed(() => {
    if (!props.moduleIcon) return null;
    if (typeof props.moduleIcon === 'string') {
        return resolveLucideIcon(props.moduleIcon);
    }
    return props.moduleIcon;
});

const resolvedDescription = computed(() =>
    props.description ? resolveLabel(props.description) : '',
);

const pluralModuleName = computed(() => {
    const englishForm = pluralize(props.moduleName, props.totalCount, false);
    return resolveModuleName(props.moduleName, englishForm);
});

const emit = defineEmits<{
    searchChange: [value: string];
    clearSearch: [];
    clearFilters: [];
    refresh: [];
    export: [];
    import: [];
    createClick: [];
    customHeaderAction: [action: CustomAction];
}>();

const controlHeightTextClass = computed(() => {
    if (props.density === 'compact') return 'h-8 text-xs';
    if (props.density === 'relaxed') return 'h-10 text-base';
    return 'h-9 text-sm';
});

const placeholderSizeClass = computed(() => {
    if (props.density === 'compact') return 'placeholder:text-xs';
    if (props.density === 'relaxed') return 'placeholder:text-base';
    return 'placeholder:text-sm';
});

const buttonSizeClass = computed(() => {
    if (props.density === 'compact') return 'h-8 text-xs px-3';
    if (props.density === 'relaxed') return 'h-10 text-base px-5';
    return 'h-9 text-sm px-4';
});

const squareButtonSizeClass = computed(() => {
    if (props.density === 'compact') return 'h-8 w-8';
    if (props.density === 'relaxed') return 'h-10 w-10';
    return 'h-9 w-9';
});

const gapClass = computed(() => {
    if (props.density === 'compact') return 'gap-2';
    if (props.density === 'relaxed') return 'gap-4';
    return 'gap-3';
});

const searchTermLocal = ref(props.searchTerm);

const searchBoxHeightClass = computed(() => {
    if (props.density === 'compact') return 'h-8';
    if (props.density === 'relaxed') return 'h-10';
    return 'h-9';
});

const collapsedSearchWidthClass = computed(() => {
    if (props.density === 'compact') return 'w-8';
    if (props.density === 'relaxed') return 'w-10';
    return 'w-9';
});

const isSearchExpanded = ref(false);
const searchInputRef = ref<HTMLInputElement | null>(null);
let shrinkTimer: number | null = null;

const expandSearch = () => {
    isSearchExpanded.value = true;
    if (searchInputRef.value) {
        setTimeout(() => {
            searchInputRef.value?.focus();
        }, 50);
    }
    resetShrinkTimer();
};

const resetShrinkTimer = () => {
    if (shrinkTimer) {
        window.clearTimeout(shrinkTimer);
    }
    shrinkTimer = window.setTimeout(() => {
        if (!searchTermLocal.value) {
            isSearchExpanded.value = false;
        }
    }, 10000);
};

onBeforeUnmount(() => {
    if (shrinkTimer) {
        window.clearTimeout(shrinkTimer);
    }
});

watch(
    () => props.searchTerm,
    (newValue) => {
        searchTermLocal.value = newValue;
    },
);

watch(searchTermLocal, (newValue) => {
    emit('searchChange', newValue);
    resetShrinkTimer();
});

const handleClearSearch = () => {
    searchTermLocal.value = '';
    emit('clearSearch');
};
</script>
