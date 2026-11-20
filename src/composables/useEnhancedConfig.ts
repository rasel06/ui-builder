import type { ModuleConfig } from '../types/module';
import { usePage } from '../adapters/inertia';
import { computed } from 'vue';

export function useEnhancedConfig(baseConfig: ModuleConfig) {
    const page = usePage();

    const mainDataKey = baseConfig.dataPropName || 'items';
    const paginatedData = computed(() => page.props[mainDataKey] || {});

    const extraKeys = baseConfig.extraPropsToRefresh || [];
    const extraProps = computed(() =>
        Object.fromEntries(extraKeys.map((k) => [k, page.props[k] || []])),
    );

    const enhancedFormFields = computed(() => {
        return (baseConfig.formFields || []).map((field) => {
            if (field.name === 'parent_id' && field.type === 'select') {
                return {
                    ...field,
                    options: extraProps.value.parentCategories || [],
                };
            }
            return field;
        });
    });

    return {
        finalConfig: computed(() => ({
            ...baseConfig,
            formFields: enhancedFormFields.value,
        })),
        paginatedData,
    };
}
