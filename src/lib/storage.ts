/**
 * Browser storage for ui-builder's per-device preferences (theme, row density, table/grid layout).
 *
 * Keys can carry a prefix (`setStoragePrefix('my-app:')`) so two apps on the same domain do not
 * share them; the default is no prefix. Set it before mounting the app. Storage can be missing
 * (server rendering) or refuse access (private windows, blocked site data), so every read and
 * write is guarded and falls back quietly.
 */

let prefix = '';

export function setStoragePrefix(next: string): void {
    prefix = next ?? '';
}

export function storageKey(name: string): string {
    return prefix + name;
}

export function readStorage(name: string): string | null {
    try {
        return typeof localStorage === 'undefined' ? null : localStorage.getItem(storageKey(name));
    } catch {
        return null;
    }
}

export function writeStorage(name: string, value: string): void {
    try {
        if (typeof localStorage !== 'undefined') localStorage.setItem(storageKey(name), value);
    } catch {
        /* storage unavailable: the preference lasts for this page only */
    }
}
