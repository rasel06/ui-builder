<template>
    <div
        :class="[
            field.showBorder !== false
                ? `rounded-lg border p-2 ${theme.inputBorder || theme.cardBorder || 'border-gray-200 dark:border-gray-800'}`
                : '',
        ]"
    >
        <div class="flex items-center justify-between gap-4 px-1 py-1">
            <label
                v-if="field.showLabel !== false"
                :for="field.name"
                class="text-sm font-bold"
                :class="theme.labelText || 'text-gray-700 dark:text-gray-300'"
            >
                {{ resolveFieldLabel(field) }}
            </label>

            <input
                ref="masterInput"
                type="checkbox"
                :id="field.name"
                :checked="isChecked"
                @change="handleToggle"
                :class="[
                    'h-4 w-4 cursor-pointer rounded border-gray-300 transition-all focus:ring-1 focus:ring-[var(--focus-theme-color)]! disabled:cursor-not-allowed disabled:opacity-70 dark:border-gray-600',
                    checkboxThemeClass,
                ]"
                :style="{ accentColor: checkboxAccentColor, ...boxStyle }"
            />
        </div>

        <p
            v-if="field.placeholder"
            class="mt-1 px-1 text-xs text-gray-500 dark:text-gray-400"
        >
            {{ field.placeholder }}
        </p>
    </div>
</template>

<script setup lang="ts">
import { resolveFieldLabel } from '../../i18n';
import { computed, ref, watch } from 'vue';
import {
    getThemeActiveCheckboxColor,
    getThemeHex,
} from '../../composables/themes';
import type { FormField, ThemeConfig } from '../../types/module';
import { resolveControlSize } from '../../utils/sizing';

interface Props {
    field: FormField;
    value: any;
    theme: Partial<ThemeConfig>;
    selectedTheme: string;
    form?: any;
    allFields?: FormField[];
    /** A size token or raw classes (utils/sizing.ts); the field's own size wins. */
    size?: string;
}

const props = defineProps<Props>();
const boxStyle = computed(() => resolveControlSize(props.field.size || props.size).iconStyle);
const emit = defineEmits<{
    update: [name: string, value: any];
}>();

const masterInput = ref<HTMLInputElement | null>(null);

const checkboxThemeClass = computed(() => {
    return (
        props.theme?.checkbox ||
        getThemeActiveCheckboxColor(props.theme?.primaryButton)
    );
});

const checkboxAccentColor = computed(() => {
    return getThemeHex(props.selectedTheme);
});

const isChecked = computed(() => !!props.value);

const isGroupAllSelected = computed(() => {
    if (!props.field.targetGroup || !props.allFields || !props.form)
        return false;

    const targetGroup = props.field.targetGroup;
    const relatedFields = props.allFields.filter(
        (f) => f.group === targetGroup,
    );

    if (relatedFields.length === 0) return false;

    return relatedFields.every((f) => {
        const val = props.form.data[f.name];
        if (f.type === 'checkbox' && Array.isArray(val)) {
            return val.length > 0 && val.length === (f.options?.length || 0);
        }
        return !!val;
    });
});

const isGroupSomeSelected = computed(() => {
    if (!props.field.targetGroup || !props.allFields || !props.form)
        return false;

    const targetGroup = props.field.targetGroup;
    const relatedFields = props.allFields.filter(
        (f) => f.group === targetGroup,
    );

    return relatedFields.some((f) => {
        const val = props.form.data[f.name];
        if (f.type === 'checkbox' && Array.isArray(val)) {
            return val.length > 0;
        }
        return !!val;
    });
});

const handleToggle = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const checked = target.checked;

    if (!props.field.targetGroup || !props.allFields || !props.form) return;

    const targetGroup = props.field.targetGroup;
    const relatedFields = props.allFields.filter(
        (f) => f.group === targetGroup,
    );

    relatedFields.forEach((f) => {
        let newVal: any;
        if (f.type === 'checkbox') {
            newVal = checked
                ? f.options?.map((opt) =>
                      typeof opt === 'object' ? opt.value : opt,
                  ) || []
                : [];
        } else {
            newVal = checked;
        }

        props.form.setData(f.name, newVal);

        if (f.onChange) {
            f.onChange(newVal, props.form);
        }
    });

    emit('update', props.field.name, checked);
};

watch(
    () => isGroupAllSelected.value,
    (newVal) => {
        if (props.value !== newVal) {
            emit('update', props.field.name, newVal);
        }
    },
);

watch(
    [isGroupAllSelected, isGroupSomeSelected],
    () => {
        if (masterInput.value) {
            masterInput.value.indeterminate =
                isGroupSomeSelected.value && !isGroupAllSelected.value;
        }
    },
    { immediate: true },
);
</script>
