import type { App, Plugin } from 'vue';
import './types/vueComponent';
import { loadLocale, setLocale, setTranslator } from '@rasel/ui-builder/i18n';
import { setShortcutRegistrar } from '@rasel/ui-builder/integrations/shortcuts';
import { setCsrfTokenResolver } from '@rasel/ui-builder/lib/http';
import { setStoragePrefix } from '@rasel/ui-builder/lib/storage';
import { setExportDefaults } from '@rasel/ui-builder/utils/exportDefaults';
import { setExportBranding } from '@rasel/ui-builder/utils/exportUtils';
import { setSavedViewStore } from '@rasel/ui-builder/utils/savedViews';
import { setPagePropsMapper } from './adapters/pageProps';
import { registerLucideIcons } from './composables/useLucideIcons';
import { setDateFormatter } from './utils/utilities';

/**
 * Everything a host may tell ui-builder, in one place. Every option is optional: with none, ui-builder
 * uses its own strings, browser storage under "ui-builder:", the page's CSRF meta tag or XSRF cookie, a
 * local saved-view store and plain dates.
 */
export interface UiBuilderOptions {
    /** A translator the host already has (e.g. vue-i18n's `i18n.global`); wins for every key it knows. */
    translator?: Parameters<typeof setTranslator>[0];
    /** Language of ui-builder's own strings. Without a translator, the bundled strings for it are loaded. */
    locale?: string;
    /** Prefix for everything ui-builder keeps in localStorage (theme, density, layout...). */
    storagePrefix?: string;
    csrfToken?: Parameters<typeof setCsrfTokenResolver>[0];
    dateFormatter?: Parameters<typeof setDateFormatter>[0];
    exportBranding?: Parameters<typeof setExportBranding>[0];
    exportDefaults?: Parameters<typeof setExportDefaults>[0];
    savedViewStore?: Parameters<typeof setSavedViewStore>[0];
    shortcutRegistrar?: Parameters<typeof setShortcutRegistrar>[0];
    /** Icons by name that should resolve without a network request (e.g. the ones in the host's menus). */
    icons?: Record<string, unknown>;
    /** Maps the host's Inertia page props to the shape ui-builder reads (auth, flash, ...). */
    pageProps?: Parameters<typeof setPagePropsMapper>[0];
}

/** Apply options without a Vue app (e.g. in an SSR entry that builds its app elsewhere). */
export function configureUiBuilder(options: UiBuilderOptions = {}): void {
    if (options.storagePrefix !== undefined) setStoragePrefix(options.storagePrefix);
    if (options.translator !== undefined) setTranslator(options.translator);
    if (options.locale !== undefined) setLocale(options.locale);
    if (!options.translator) void loadLocale(options.locale);
    if (options.csrfToken !== undefined) setCsrfTokenResolver(options.csrfToken);
    if (options.dateFormatter !== undefined) setDateFormatter(options.dateFormatter);
    if (options.exportBranding !== undefined) setExportBranding(options.exportBranding);
    if (options.exportDefaults !== undefined) setExportDefaults(options.exportDefaults);
    if (options.savedViewStore !== undefined) setSavedViewStore(options.savedViewStore);
    if (options.shortcutRegistrar !== undefined) setShortcutRegistrar(options.shortcutRegistrar);
    if (options.icons) registerLucideIcons(options.icons);
    if (options.pageProps !== undefined) setPagePropsMapper(options.pageProps);
}

/** `createApp(...).use(createUiBuilder({ ... }))`, then wrap the root in UiBuilderRoot. */
export function createUiBuilder(options: UiBuilderOptions = {}): Plugin {
    return {
        install(_app: App) {
            configureUiBuilder(options);
        },
    };
}
