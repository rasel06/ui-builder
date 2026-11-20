import type { ColumnConfig, ModuleConfig } from '../types/module';

/** A field flagged "show on list", as the host shares it (prop `customFieldColumns`, grouped by record type). */
export interface CustomFieldColumn {
    key: string;
    label: string;
    type: string;
}

const PREFIX = 'cf_';

function present(type: string, value: any): string {
    if (value === null || value === undefined || value === '') return '—';
    if (type === 'yes_no') return value ? '✓' : '✗';
    if (Array.isArray(value)) return value.join(', ');
    // A picked customer / supplier / product / staff member is kept as {id, name}.
    if (typeof value === 'object') return String(value.name ?? '—');
    if (type === 'money') return Number(value).toFixed(2);

    return String(value);
}

/**
 * Adds a column per custom field to a list config, before its actions column. Idempotent: a column already added is not
 * added twice, so it is safe on every render. The page's config object is changed in place, which is what ModuleManager,
 * its export and its column chooser all read.
 */
export function injectCustomFieldColumns(config: ModuleConfig | undefined, byEntity: Record<string, CustomFieldColumn[]> | null | undefined): void {
    const entity = config?.customFields?.entity;
    const fields = entity ? byEntity?.[entity] ?? [] : [];
    if (!config || !fields.length) return;

    const read = config.customFields?.values ?? ((row: any) => row?.custom_values);
    const columns = config.tableColumns;

    for (const field of fields) {
        const key = `${PREFIX}${field.key}`;
        if (columns.some((c) => c.key === key)) continue;

        const column: ColumnConfig = {
            key,
            label: field.label,
            type: 'text',
            render: (row: any) => present(field.type, (read(row) ?? {})[field.key]),
            exportValue: (_v: any, row: any) => present(field.type, (read(row) ?? {})[field.key]),
        } as ColumnConfig;

        const actionsAt = columns.findIndex((c) => c.type === 'actions');
        actionsAt === -1 ? columns.push(column) : columns.splice(actionsAt, 0, column);
    }
}
