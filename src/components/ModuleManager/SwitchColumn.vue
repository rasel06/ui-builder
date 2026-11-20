<template>
    <div class="flex items-center gap-2" @click.stop>
        <div class="relative inline-flex items-center">
            <Switch
                :model-value="internalValue"
                @update:model-value="(val: boolean) => (internalValue = val)"
                :disabled="isLocked || isLoading"
                :class="getSwitchClasses()"
                :size="sizeToken(props.size)"
            />
            <!-- Overlay to catch clicks and force toggle (Necessary for Table context) -->
            <div
                v-if="!isLocked && !isLoading"
                class="absolute inset-0 z-50 cursor-pointer opacity-0"
                @click.stop="forceToggle"
            ></div>
        </div>

        <span
            v-if="showLabel"
            class="text-sm font-medium transition-colors"
            :class="getLabelClasses()"
            @click.stop="forceToggle"
        >
            {{ currentLabel }}
        </span>

        <div
            v-if="isLoading"
            class="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
            :class="getSpinnerClasses()"
        ></div>
    </div>
</template>

<script setup lang="ts">
import { Switch } from '../../primitives/switch';
import { sizeToken } from '../../utils/sizing';
import { router, usePage } from '../../adapters/inertia';
import { readPageProps } from '../../adapters/pageProps';
import axios from 'axios';
import { Swal } from '../../utils/swal';
import { computed, ref, watch } from 'vue';
import { useUiI18n } from '../../i18n';

const { t } = useUiI18n();
import {
    getThemeActiveSwitchColor,
    THEME_ACTIVE_SWITCH_COLORS,
    themeHexMap,
} from '../../composables/themes';
import { toast } from '../../composables/useToast';
import type {
    SwitchColumnConfig,
    SwitchSize,
    TableTheme,
    ThemeConfig,
} from '../../types/module';

interface Props {
    row: any;
    config: SwitchColumnConfig;
    permission?: string;
    updateEndpoint?: string;
    theme?: Partial<ThemeConfig> | Partial<TableTheme>;
    disabled?: boolean | ((row: any) => boolean);
    readonly?: boolean | ((row: any) => boolean);
    isChecked?: any; // Allow any type, we'll convert it
    variant?:
        'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger';
    dataPropName?: string;
    extraPropsToRefresh?: string[];
    size?: SwitchSize;
}

const props = withDefaults(defineProps<Props>(), {
    isChecked: undefined,
    permission: undefined,
    updateEndpoint: undefined,
    theme: undefined,
    disabled: undefined,
    readonly: undefined,
    variant: undefined,
});

const emit = defineEmits<{
    change: [value: boolean];
}>();

const page = usePage();
const auth = computed(() => readPageProps(page).auth);

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

const isLoading = ref(false);

// Optimistic local state to ensure UI responsiveness
// Initialize from props.isChecked if provided, otherwise from row data
const internalValue = ref(false);

// Unified sync function
const syncState = () => {
    let newVal;
    const fromProp = props.isChecked !== undefined;

    if (fromProp) {
        newVal =
            typeof props.isChecked === 'function'
                ? props.isChecked(props.row)
                : props.isChecked;
    } else {
        const fieldName = props.config.field || (props as any).column?.key;
        if (fieldName && props.row) {
            newVal = props.row[fieldName];
        }
    }

    const boolVal = getBooleanValue(newVal);
    internalValue.value = boolVal;
};

syncState();

watch(
    [
        () =>
            typeof props.isChecked === 'function'
                ? props.isChecked(props.row)
                : props.isChecked,
        () => props.row,
        () => props.config.field,
    ],
    () => {
        syncState();
    },
    { deep: true, immediate: true },
);

const isEnabled = computed(() => !!internalValue.value);

const onSwitchToggle = async (checked: boolean) => {
    if (isLocked.value || isLoading.value) {
        return;
    }
    await handleToggle(checked);
};


// currentValue removed as it was unused and causing lint errors

const checkPermission = (permission?: string): boolean => {
    if (!permission) return true;
    return auth.value?.permissions?.includes(permission) ?? false;
};

const isDisabled = computed(() => {
    const hasPermission = checkPermission(props.permission);
    if (!hasPermission) return true;

    // Check top-level disabled prop first
    if (props.disabled !== undefined) {
        if (typeof props.disabled === 'function') {
            return props.disabled(props.row);
        }
        return props.disabled === true;
    }

    if (typeof props.config.disabled === 'function') {
        return props.config.disabled(props.row);
    }
    return props.config.disabled === true;
});

const isReadonly = computed(() => {
    // Check top-level readonly prop first
    if (props.readonly !== undefined) {
        if (typeof props.readonly === 'function') {
            return props.readonly(props.row);
        }
        return props.readonly === true;
    }

    if (typeof props.config.readonly === 'function') {
        return props.config.readonly(props.row);
    }
    return props.config.readonly === true;
});

const isLocked = computed(() => isDisabled.value || isReadonly.value);

const currentLabel = computed(() => {
    if (isEnabled.value) {
        return props.config.onLabel || 'Active';
    }
    return props.config.offLabel || 'Inactive';
});

const showLabel = computed(() => {
    return (
        props.config.onLabel !== undefined ||
        props.config.offLabel !== undefined
    );
});

const variantColors: Record<string, string> = {
    secondary: '!bg-slate-600',
    success: '!bg-emerald-600',
    info: '!bg-sky-500',
    warning: '!bg-amber-500',
    danger: '!bg-rose-600',
};

const getSwitchClasses = () => {
    let classes = 'cursor-pointer';

    if (internalValue.value) {
        if (
            props.variant &&
            props.variant !== 'primary' &&
            variantColors[props.variant]
        ) {
            classes += ` ${variantColors[props.variant]}`;
        } else if (
            props.config.variant &&
            props.config.variant !== 'primary' &&
            variantColors[props.config.variant]
        ) {
            // Legacy support for variant inside config
            classes += ` ${variantColors[props.config.variant]}`;
        } else {
            // Fallback to theme-based color (used for 'primary' or when no variant)
            const colorClass = getThemeActiveSwitchColor(
                props.theme?.primaryButton,
            );
            classes += ` ${colorClass}`;
        }
    } else {
        classes += ' !bg-gray-200 dark:!bg-gray-700';
    }

    if (isLocked.value) {
        classes += ' opacity-50 cursor-not-allowed pointer-events-none';
    }

    return classes;
};

const getThemeColorInfo = () => {
    // 1. Check if we have an explicit variant (except 'primary' which should follow theme)
    const variant = props.variant || props.config.variant;
    if (variant && variant !== 'primary' && variantColors[variant]) {
        // Extract color name from variant class (e.g., '!bg-sky-500' -> 'sky')
        const colorMatch = variantColors[variant].match(/!bg-(\w+)/);
        const colorName = colorMatch ? colorMatch[1] : 'blue';

        return {
            key: colorName,
            bgClass: variantColors[variant],
            hex: themeHexMap[colorName] || '#3b82f6',
            textClass: `theme-${colorName} text-tc-600 dark:text-tc-400`,
            spinnerBorder: `theme-${colorName} border-tc-600`,
        };
    }

    // 2. Otherwise follow the theme's primary button color
    const primaryButton = props.theme?.primaryButton || '';

    for (const [key, cls] of Object.entries(THEME_ACTIVE_SWITCH_COLORS)) {
        if (primaryButton.includes(key)) {
            return {
                key,
                bgClass: cls,
                hex: themeHexMap[key] || '#3b82f6',
                textClass: `theme-${key} text-tc-600 dark:text-tc-400`,
                spinnerBorder: `theme-${key} border-tc-600`,
            };
        }
    }

    // 3. Final default fallback to blue
    return {
        key: 'blue',
        bgClass: '!bg-blue-600',
        hex: '#3b82f6',
        textClass: 'text-blue-600 dark:text-blue-400',
        spinnerBorder: 'border-blue-600',
    };
};

const getLabelClasses = () => {
    if (isLocked.value) {
        return (
            (props.theme as any)?.paginationText ||
            'text-gray-500 dark:text-gray-400'
        );
    }
    if (isEnabled.value) {
        return getThemeColorInfo().textClass;
    }
    return (
        (props.theme as any)?.paginationText ||
        'text-gray-600 dark:text-gray-400'
    );
};

const getSpinnerClasses = () => {
    const { spinnerBorder } = getThemeColorInfo();
    return `border-gray-300 ${spinnerBorder} border-t-transparent`;
};

const getNewValue = (currentEnabled: boolean) => {
    const onValue = props.config.onValue ?? true;
    const offValue = props.config.offValue ?? false;

    return currentEnabled ? offValue : onValue;
};

const forceToggle = async () => {
    if (isLocked.value || isLoading.value) {
        return;
    }
    await handleToggle(!isEnabled.value);
};

const handleToggle = async (newCheckedState: boolean) => {
    if (isLocked.value || isLoading.value) {
        return;
    }

    // Store the previous state in case we need to revert
    const previousState = internalValue.value;

    // Optimistically update the UI
    internalValue.value = newCheckedState;

    // Emit change event for form integration
    emit('change', newCheckedState);

    const newValue = getNewValue(previousState);

    if (props.config.confirmToggle !== false) {
        const message = props.config.confirmMessage
            ? props.config.confirmMessage(props.row, newValue)
            : t(
                  newCheckedState
                      ? 'confirm.enable_this'
                      : 'confirm.disable_this',
              );

        const result = await Swal.fire({
            title: t('confirm.confirm_action'),
            text: message,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: t('confirm.yes_proceed'),
            cancelButtonText: t('ui-builder.cancel'),
            confirmButtonColor: getThemeColorInfo().hex,
            cancelButtonColor: '#6B7280',
        });

        if (!result.isConfirmed) {
            internalValue.value = previousState;
            return;
        }
    }

    isLoading.value = true;

    try {
        if (props.config.onToggle) {
            // The config does the saving itself. `false` (or a rejection) means it did not save: put the switch back.
            try {
                const saved = await props.config.onToggle(props.row, newValue, router);
                if (saved === false) {
                    internalValue.value = previousState;
                } else if (props.config.onUpdate) {
                    props.config.onUpdate(props.row, newValue);
                }
            } catch (error: any) {
                internalValue.value = previousState;
                toast.error(error?.message || t('toast.generic_error'));
            }
        } else {
            let endpoint = props.config.endpoint || props.updateEndpoint;
            if (endpoint) {
                endpoint = endpoint.replace(':id', String(props.row.id));
            }

            if (!endpoint) {
                toast.error(t('toast.config_error'));
                isLoading.value = false;
                internalValue.value = previousState;
                return;
            }

            const method = (props.config.method || 'PUT').toLowerCase() as any;

            let resolvedParams: Record<string, any> = {};
            if (typeof props.config.params === 'function') {
                resolvedParams = props.config.params(props.row);
            } else if (props.config.params) {
                Object.entries(props.config.params).forEach(([key, val]) => {
                    resolvedParams[key] =
                        typeof val === 'function'
                            ? (val as any)(props.row)
                            : val;
                });
            }

            const fieldName =
                props.config.field ||
                (props as any).column?.key ||
                props.config.field; // Logic fallback
            const requestData = {
                [fieldName as string]: newValue,
                ...resolvedParams,
            };

            // Options removed as they were for Inertia router

            let response;
            if (method === 'get') {
                response = await axios.get(endpoint, { params: requestData });
            } else if (method === 'post') {
                response = await axios.post(endpoint, requestData);
            } else if (method === 'patch') {
                response = await axios.patch(endpoint, requestData);
            } else if (method === 'delete') {
                response = await axios.delete(endpoint, { data: requestData });
            } else {
                response = await axios.put(endpoint, requestData);
            }

            const updatedData = response.data?.data || response.data;

            // Sync all returned data back into the row object to ensure perfect consistency
            if (updatedData && typeof updatedData === 'object') {
                Object.assign(props.row, updatedData);
            }

            toast.success(t('toast.update_success'));

            if (props.config.onUpdate) {
                props.config.onUpdate(props.row, newValue);
            }

            // Reload page to sync server state across all components
            const dataProp = props.dataPropName || 'data';
            const extraProps = props.extraPropsToRefresh || [];

            router.reload({
                only: [dataProp, 'filters', ...extraProps],
            });
        }
    } catch (error) {
        console.error('SwitchColumn: Toggle request failed', error);
        toast.error(t('toast.generic_error'));
        internalValue.value = previousState;
    } finally {
        isLoading.value = false;
    }
};
</script>
