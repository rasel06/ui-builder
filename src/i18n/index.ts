/**
 * ui-builder's own translation layer. The package must work in a project that has no vue-i18n and no
 * translations of its own, so it ships its strings (`../locales/{en,ar,bn}.json`, the `ui-builder.*`,
 * `toast.*` and `confirm.*` keys) and resolves them itself.
 *
 * A host that already translates (quick-pos: vue-i18n fed from the `translations` table, where admins can
 * reword anything) registers its translator with `setTranslator()`; the host wins for every key it knows,
 * so admin wording keeps priority. Anything the host does not know falls back to the bundled strings for
 * the current locale, then English, then the raw key/label.
 *
 * The bundled files are loaded lazily (`loadLocale()`), so a host that supplies its own translator never
 * downloads them.
 */

export type TranslateParams = Record<string, unknown>;

export interface UiTranslator {
    te: (key: string) => boolean;
    t: (key: string, params?: TranslateParams) => string;
}

type Messages = Record<string, string>;

let host: UiTranslator | null = null;
let currentLocale = 'en';
const bundled: Record<string, Messages> = {};

const loaders = import.meta.glob<{ default: Messages }>('../locales/*.json');

/** Use the host app's translator first (e.g. a vue-i18n composer: `i18n.global`). `null` removes it. */
export function setTranslator(translator: UiTranslator | null): void {
    host = translator;
}

export function setLocale(locale: string): void {
    currentLocale = locale || 'en';
}

export function getLocale(): string {
    return currentLocale;
}

/** Locales ui-builder ships strings for. */
export function bundledLocales(): string[] {
    return Object.keys(loaders).map((p) => p.replace(/^.*\/([^/]+)\.json$/, '$1'));
}

/**
 * Loads the bundled strings for a locale (and English, the fallback). Await it before mounting when the
 * host supplies no translator; harmless to call more than once.
 */
export async function loadLocale(locale: string = currentLocale): Promise<void> {
    await Promise.all(
        [...new Set(['en', locale])].map(async (code) => {
            if (bundled[code]) return;
            const loader = loaders[`../locales/${code}.json`];
            if (loader) bundled[code] = (await loader()).default;
        }),
    );
}

/** Adds or replaces bundled strings for a locale (a host's own wording, a new language). */
export function registerMessages(locale: string, messages: Messages): void {
    bundled[locale] = { ...(bundled[locale] ?? {}), ...messages };
}

function bundledText(key: string): string | undefined {
    return bundled[currentLocale]?.[key] ?? bundled.en?.[key];
}

function interpolate(text: string, params?: TranslateParams): string {
    if (!params) return text;
    return text.replace(/\{(\w+)\}/g, (match, name) =>
        params[name] === undefined || params[name] === null ? match : String(params[name]),
    );
}

export function hasTranslation(key: string): boolean {
    return !!key && ((host?.te(key) ?? false) || bundledText(key) !== undefined);
}

/** Translates a key; returns the key itself when nobody knows it. */
export function translate(key: string, params?: TranslateParams): string {
    if (host?.te(key)) return host.t(key, params ?? {});
    const text = bundledText(key);
    return text === undefined ? key : interpolate(text, params);
}

/** Drop-in for vue-i18n's `useI18n()` inside ui-builder components: `const { t } = useUiI18n()`. */
export function useUiI18n() {
    return { t: translate, te: hasTranslation };
}

/**
 * Resolves a config label that is either literal text or a translation key: translated when a
 * translation exists, otherwise returned as written, so untranslated configs keep working.
 */
export function resolveLabel(label: string | undefined, params?: TranslateParams): string {
    if (!label) return label ?? '';
    return hasTranslation(label) ? translate(label, params) : label;
}

/**
 * Column/field keys whose text is the same everywhere (table chrome, not module content). They always
 * resolve to the shared `ui-builder.<key>` string, whatever label the config gives.
 */
export const COMMON_COLUMN_KEYS = new Set([
    'actions',
    'status',
    'description',
    'created_at',
    'updated_at',
    'created_by',
    'updated_by',
]);

export function resolveColumnLabel(column: { key: string; label?: string } | undefined): string {
    if (!column) return '';
    if (COMMON_COLUMN_KEYS.has(column.key)) return resolveLabel(`ui-builder.${column.key}`);
    return resolveLabel(column.label);
}

export function resolveFieldLabel(field: { name?: string; label?: string } | undefined): string {
    if (!field) return '';
    if (field.name && COMMON_COLUMN_KEYS.has(field.name)) return resolveLabel(`ui-builder.${field.name}`);
    return resolveLabel(field.label);
}

/**
 * Translated module name for headers and dialog titles. `englishForm` is the singular or plural English
 * word the caller chose (via `pluralize`); looks up `<slug>.module_name` or `<slug>.module_name_plural`
 * and falls back to that English word.
 */
export function resolveModuleName(moduleName: string | undefined, englishForm: string | undefined): string {
    if (!moduleName) return englishForm ?? '';
    const slug = moduleName
        .replace(/&/g, '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    const isPlural = englishForm !== undefined && englishForm !== moduleName;
    const key = `${slug}.module_name${isPlural ? '_plural' : ''}`;
    return hasTranslation(key) ? translate(key) : (englishForm ?? moduleName);
}

/** Default placeholder for a field that has none: "Enter name" / "Select status", word order per language. */
export function fieldPrompt(kind: 'enter' | 'select', label: string): string {
    const key = `ui-builder.${kind}_field`;
    return hasTranslation(key)
        ? translate(key, { field: label.toLowerCase() })
        : `${kind === 'enter' ? 'Enter' : 'Select'} ${label.toLowerCase()}`;
}
