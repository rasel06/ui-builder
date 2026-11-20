<template>
    <div class="py-12 text-center">
        <div class="mb-3 text-5xl">🔭</div>
        <div
            :class="
                cn(
                    'text-lg font-medium text-gray-900 dark:text-gray-100',
                    theme?.headerText,
                )
            "
        >
            No {{ pluralModuleName.toLowerCase() }} found
        </div>
        <div
            :class="
                cn(
                    'mt-1 text-sm text-gray-500 opacity-80 dark:text-gray-400',
                    theme?.tableTextSecondary,
                )
            "
        >
            {{
                hasActiveFilters
                    ? 'Try adjusting your filters'
                    : `Get started by creating your first ${moduleName.toLowerCase()}`
            }}
        </div>
        <button
            v-if="canCreate && !hasActiveFilters"
            @click="$emit('createClick')"
            :class="[
                'mt-4 inline-flex items-center justify-center rounded-md font-medium transition-colors',
                buttonSizeClass,
                theme?.primaryButton
                    ? theme.primaryButton
                    : 'bg-blue-600 text-white hover:bg-blue-700',
            ]"
        >
            <PlusCircle class="me-2 h-4 w-4" />
            Add {{ moduleName }}
        </button>
    </div>
</template>

<script setup lang="ts">
import { cn } from '../../lib/utils';
import { PlusCircle } from '@lucide/vue';
import pluralize from 'pluralize';
import { computed } from 'vue';
import type { ThemeConfig } from '../../types/module';

interface Props {
    moduleName: string;
    hasActiveFilters: boolean;
    canCreate: boolean;
    theme?: Partial<ThemeConfig>;
    density?: 'compact' | 'normal' | 'relaxed';
}

const props = withDefaults(defineProps<Props>(), {
    density: 'normal',
});

const pluralModuleName = computed(() => {
    return pluralize(props.moduleName, 2, false);
});

const buttonSizeClass = computed(() => {
    if (props.density === 'compact') return 'h-8 text-xs px-3';
    if (props.density === 'relaxed') return 'h-10 text-base px-5';
    return 'h-9 text-sm px-4';
});

defineEmits<{
    createClick: [];
}>();
</script>
