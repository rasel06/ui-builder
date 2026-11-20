import type { ExportConfig } from '../types/module';

export type DefaultExportConfig = Omit<
    Required<Omit<ExportConfig, 'ui' | 'document' | 'customActions'>>,
    'indentCondition' | 'logoPath'
> & {
    indentCondition: ExportConfig['indentCondition'];
    logoPath: ExportConfig['logoPath'];
};

/**
 * Static fallbacks/defaults for export configuration.
 * These are used if no DB or runtime settings overrides are provided.
 */
export const STATIC_EXPORT_DEFAULTS: DefaultExportConfig = {
    enabled: true,
    pdf: true,
    excel: true,
    csv: true,
    // Opt-in, unlike the other four: only a module that wants a machine-readable
    // round-trip sets `json: true` on its own exportConfig.
    json: false,
    print: true,
    showAsGroup: true,
    position: 'filterBar',
    showAsDropdown: true,
    companyName: 'Quick POS Corp',
    title: 'Document List',
    subtitle: 'Exported Document',
    showMeta: true,
    showFilters: true,
    themeColor: '',
    customMeta: {},
    pageSize: 'a4',
    orientation: 'landscape',
    margin: { top: 15, bottom: 15, left: 12, right: 12 },
    cellPadding: 1.5,
    showSerial: true,
    align: 'right',
    repeatHeader: false,
    printPosition: 'last',
    activeOnlyOnData: true,
    indentColumns: [],
    indentCondition: undefined,
    logoPath: undefined,
};

type ExportOverrides = Partial<ExportConfig>;

let overridesSource: ExportOverrides | (() => ExportOverrides) = {};

/**
 * Lets the host app supply store-wide export defaults (company name, logo, colour, page size...),
 * either as a fixed object or as a function read at every export. ui-builder reads no page props
 * or globals for this, so it works in any project.
 */
export const setExportDefaults = (source: ExportOverrides | (() => ExportOverrides)): void => {
    overridesSource = source ?? {};
};

/** The host's export defaults, or nothing when none were set (or the host's function failed). */
export const getDatabaseOverrides = (): ExportOverrides => {
    try {
        const value = typeof overridesSource === 'function' ? overridesSource() : overridesSource;
        return value && typeof value === 'object' ? { ...value } : {};
    } catch {
        return {};
    }
};

/**
 * Resolves the final default export config by merging static defaults and database overrides.
 */
export const getDefaultExportConfig = (): DefaultExportConfig => {
    const overrides = getDatabaseOverrides();
    return {
        ...STATIC_EXPORT_DEFAULTS,
        ...overrides,
    };
};
