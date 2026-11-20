<template>
    <div class="space-y-1">
        <!-- Settings-row layout: the words on the left, the control on the right, so a
             toggle never sits orphaned on a line of its own under its label. -->
        <div class="flex min-h-9 items-start justify-between gap-4">
            <div class="min-w-0 flex-1 pt-0.5">
                <label
                    v-if="!hideLabel"
                    :for="field.name"
                    :class="`cursor-pointer text-[13px] leading-5 font-semibold tracking-tight ${theme.labelText || 'text-gray-700 dark:text-gray-300'}`"
                >
                    {{ resolveFieldLabel(field) }}
                    <span
                        v-if="field.required"
                        :class="theme.errorText || 'text-red-600'"
                    >
                        *
                    </span>
                </label>
                <p
                    v-if="field.placeholder"
                    :class="`mt-0.5 text-xs leading-snug ${theme.paginationText || 'text-gray-500 dark:text-neutral-400'}`"
                >
                    {{ resolveLabel(field.placeholder) }}
                </p>
            </div>

            <div class="flex shrink-0 items-center gap-3 pt-0.5">
                <Switch
                    :id="field.name"
                    :model-value="isChecked"
                    @update:model-value="handleToggle"
                    :disabled="readonly || field.readonly"
                    :class="getSwitchClasses()"
                    :size="sizeToken(props.field.size)"
                />
            </div>
        </div>

        <div
            v-if="error"
            :class="`mt-1 flex items-center gap-1 text-xs font-medium ${theme.errorText || 'text-red-600'}`"
        >
            <svg
                class="h-3.5 w-3.5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
            >
                <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                />
            </svg>
            <span>{{ error }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Switch } from '../../primitives/switch';
import { sizeToken } from '../../utils/sizing';
import { resolveFieldLabel, resolveLabel } from '../../i18n';
import { computed } from 'vue';
import { getThemeActiveSwitchColor } from '../../composables/themes';
import type { FormField, ThemeConfig } from '../../types/module';

interface Props {
    field: FormField;
    value: any;
    error?: string;
    theme: Partial<ThemeConfig>;
    readonly?: boolean;
    hideLabel?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    update: [name: string, value: any];
}>();

const getBooleanValue = (val: any): boolean => {
    if (val === true || val === 1 || val === '1' || val === 'true') {
        return true;
    }
    if (val === false || val === 0 || val === '0' || val === 'false') {
        return false;
    }
    // Fallback permissive check
    return val == true || val == 1;
};

const isChecked = computed(() => {
    const onValue = props.field.switchConfig?.onValue ?? true;

    if (typeof onValue === 'number') {
        return Number(props.value) === onValue;
    }
    if (typeof onValue === 'string') {
        return String(props.value) === String(onValue);
    }

    return getBooleanValue(props.value);
});

const getSwitchClasses = () => {
    const colorClass = getThemeActiveSwitchColor(props.theme?.primaryButton);

    let classes =
        props.readonly || props.field.readonly
            ? 'cursor-not-allowed opacity-70'
            : 'cursor-pointer';

    if (isChecked.value) {
        classes += ` ${colorClass}`;
    } else {
        classes += ' !bg-gray-200 dark:!bg-gray-700';
    }

    return classes;
};

const handleToggle = (checked: boolean) => {
    const onValue = props.field.switchConfig?.onValue ?? true;
    const offValue = props.field.switchConfig?.offValue ?? false;

    const newValue = checked ? onValue : offValue;
    emit('update', props.field.name, newValue);
};
</script>
