<!-- Table/Grid segmented switch — sits beside DensityToggle in the datatable toolbar. -->
<template>
    <div
        :class="
            cn(
                'inline-flex items-center gap-1 rounded-lg border p-1',
                theme.toolbarBorder,
            )
        "
    >
        <button
            type="button"
            :class="segmentClass(modelValue === 'table')"
            :title="t('ui-builder.table_view')"
            @click="$emit('update:modelValue', 'table')"
        >
            <Table2 class="h-4 w-4" />
        </button>
        <button
            type="button"
            :class="segmentClass(modelValue === 'grid')"
            :title="t('ui-builder.grid_view')"
            @click="$emit('update:modelValue', 'grid')"
        >
            <LayoutGrid class="h-4 w-4" />
        </button>
    </div>
</template>

<script setup lang="ts">
import { useUiI18n } from '../../i18n';
import { cn } from '../../lib/utils';
import { LayoutGrid, Table2 } from '@lucide/vue';

const props = defineProps<{
    modelValue: 'table' | 'grid';
    theme: Record<string, any>;
}>();

defineEmits<{ 'update:modelValue': [value: 'table' | 'grid'] }>();

const { t } = useUiI18n();

const segmentClass = (active: boolean) =>
    cn(
        'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
        active ? props.theme.primaryButton : `${props.theme.secondaryButton} border-transparent`,
    );
</script>
