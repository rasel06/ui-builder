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
                    <HintTip :text="hintText" />
                </label>
            </div>

            <div class="flex shrink-0 items-center gap-3 pt-0.5">
                <Switch
                    :id="field.name"
                    :name="field.name"
                    :model-value="isChecked"
                    @update:model-value="handleToggle"
                    :disabled="field.disabled"
                    :class="getSwitchClasses()"
                    :style="switchStyle"
                    :size="sizeToken(props.field.size || props.size)"
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
import HintTip from '../HintTip.vue';
import { getThemeHex } from '../../composables/themes';
import type { FormField, ThemeConfig } from '../../types/module';

interface Props {
    field: FormField;
    value: any;
    error?: string;
    theme: Partial<ThemeConfig>;
    selectedTheme?: string;
    hideLabel?: boolean;
    /** The form's size for this field (utils/sizing.ts); the field's own size wins. */
    size?: string;
}

const props = withDefaults(defineProps<Props>(), {
    selectedTheme: 'blue',
});

const emit = defineEmits<{
    update: [name: string, value: any];
}>();

// Hint and description go in an (i) tooltip beside the label. When the host form already
// renders the label (`hideLabel`), it carries the same text itself.
const hintText = computed(() => {
    const parts = [props.field.hint, props.field.placeholder].filter(Boolean).map((k) => resolveLabel(k as string));
    return parts.join(' ') || null;
});

const switchConfig = computed(
    () =>
        props.field.switchConfig || {
            onValue: true,
            offValue: false,
            onLabel: 'Enabled',
            offLabel: 'Disabled',
        },
);

const isChecked = computed(() => {
    const onValue = switchConfig.value.onValue ?? true;

    if (typeof onValue === 'boolean') {
        return Boolean(props.value);
    }
    if (typeof onValue === 'number') {
        return Number(props.value) === onValue;
    }
    return String(props.value) === String(onValue);
});

// The switch paints its on-state with --focus-theme-color (blue if nothing sets it), so hand it the chosen preset's colour.
const switchStyle = computed(() => ({ '--focus-theme-color': getThemeHex(props.selectedTheme) }) as Record<string, string>);

const getSwitchClasses = () => {
    return 'cursor-pointer transition-all duration-200';
};

const handleToggle = (checked: boolean) => {
    const onValue = switchConfig.value.onValue ?? true;
    const offValue = switchConfig.value.offValue ?? false;

    const newValue = checked ? onValue : offValue;
    emit('update', props.field.name ?? '', newValue);
};
</script>
