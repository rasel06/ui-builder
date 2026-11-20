<template>
    <div
        :class="`mx-auto my-10 max-w-2xl rounded-lg border ${theme.cardBackground} ${theme.cardBorder}`"
    >
        <div class="py-10 text-center">
            <div class="mb-2 text-5xl">🔒</div>
            <div class="text-xl font-semibold text-red-500">{{ resolveLabel('ui-builder.access_denied') }}</div>
            <div :class="`mt-2 ${theme.paginationText}`">
                {{ resolveLabel('ui-builder.no_permission_to_view') }}
                {{ pluralModuleName.toLowerCase() }}.
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { resolveLabel } from '../../i18n';
import pluralize from 'pluralize';
import { computed } from 'vue';
import type { ThemeConfig } from '../../types/module';

interface Props {
    moduleName: string;
    theme: ThemeConfig;
}

const props = defineProps<Props>();

const pluralModuleName = computed(() => {
    return pluralize(props.moduleName, 2, false);
});
</script>
