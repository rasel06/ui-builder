import type { ColumnConfig, FormField } from '../types/module';

export const createTableColumn = (
    key: string,
    label: string,
    overrides: Partial<ColumnConfig> = {},
): ColumnConfig => ({
    key,
    label,
    type: 'text',
    sortable: true,
    render: (row: any) => row[key],
    ...overrides,
});

export const createFormField = (
    name: string,
    label: string,
    type: FormField['type'] = 'text',
    overrides: Partial<FormField> = {},
): FormField => ({
    name,
    label,
    type,
    width: '1/2',
    size: 'lg',
    placeholder: label,
    ...overrides,
});

export const generateFromSchema = (
    schema: Record<string, any>,
    tableKeys: string[],
    formKeys: string[],
) => {
    const tableColumns = tableKeys.map((key) => {
        if (typeof key === 'string') {
            const def = schema[key];
            return createTableColumn(key, def?.label || key, def?.table || {});
        }
        return key; // Support passing raw ColumnConfig
    });

    const formFields = formKeys.map((key) => {
        if (typeof key === 'string') {
            const def = schema[key];
            return createFormField(
                key,
                def?.label || key,
                def?.type || 'text',
                def?.form || {},
            );
        }
        return key; // Support passing raw FormField
    });

    return { tableColumns, formFields };
};

export const createAjaxLookup = (
    baseUrl: string,
    type: string,
    overrides: any = {},
) => ({
    endpoint: `${baseUrl}/option-list`,
    method: 'GET' as 'GET' | 'POST',
    resultsPath: 'data',
    labelKey: 'name',
    valueKey: 'id',
    searchParam: 'search',
    ...overrides,
    // `overrides.params` may be a plain object (merged with `type` below) or a
    // `(formData, value) => params` function — FormField.vue calls it with the
    // field's own form context (e.g. a sub-module panel's parent row id) to build
    // params a static object can't express. A function can't be spread (`{...fn}`
    // yields nothing), so it's wrapped instead of merged, with `type` injected
    // into whatever object it returns.
    params:
        typeof overrides.params === 'function'
            ? (formData: any, value: any) => ({
                  type,
                  ...overrides.params(formData, value),
              })
            : {
                  type,
                  ...overrides.params,
              },
});
