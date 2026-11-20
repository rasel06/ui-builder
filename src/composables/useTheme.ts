import { computed, ref, watch } from 'vue';
import type { ThemeConfig } from '../types/module';
import { PREBUILT_THEMES } from './themes';
import { readStorage, writeStorage } from '../lib/storage';

// Shared state for the active theme. Read from storage on first use, not at import, so a host's
// storage prefix is already set and server rendering never touches localStorage.
const activeThemeName = ref<string>('default');
let themeLoaded = false;

export function useTheme() {
    if (!themeLoaded) {
        themeLoaded = true;
        activeThemeName.value = readStorage('module-theme') || 'default';
    }

    const setTheme = (name: string) => {
        if (PREBUILT_THEMES[name]) {
            activeThemeName.value = name;
            writeStorage('module-theme', name);
        }
    };

    const activeTheme = computed<ThemeConfig>(() => {
        return (
            PREBUILT_THEMES[activeThemeName.value] || PREBUILT_THEMES.default
        );
    });

    /**
     * Persistence logic (already covered by initial ref value, but watch ensures sync if changed elsewhere)
     */
    watch(activeThemeName, (newName) => {
        writeStorage('module-theme', newName);
    });

    return {
        activeThemeName,
        activeTheme,
        setTheme,
    };
}
