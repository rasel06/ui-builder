/**
 * Keyboard shortcuts for list screens (search, new, refresh, previous/next page).
 *
 * ui-builder does not own a keyboard system: a host that has one registers it with
 * `setShortcutRegistrar()`, and every ModuleManager list hands it these shortcuts. With no
 * registrar the lists simply have no shortcuts. Ids are stable so a host can let people remap
 * them; `keys` are the defaults.
 */

export interface ListShortcut {
    id: string;
    keys: string;
    /** Translation key describing the shortcut (for a host's help overlay). */
    label: string;
    group: string;
    handler: (event: KeyboardEvent) => void;
    when?: () => boolean;
}

/** Called synchronously inside a component's setup, so it may use lifecycle hooks. */
export type ShortcutRegistrar = (source: () => ListShortcut[]) => void;

export const LIST_SHORTCUT_DEFAULTS: Record<string, Pick<ListShortcut, 'keys' | 'label' | 'group'>> = {
    'list.focus_search': { keys: '/', label: 'shortcut.focus_search', group: 'shortcut.group_list' },
    'list.new_record': { keys: 'n', label: 'shortcut.new_record', group: 'shortcut.group_list' },
    'list.refresh': { keys: 'r', label: 'shortcut.refresh', group: 'shortcut.group_list' },
    'list.prev_page': { keys: '[', label: 'shortcut.prev_page', group: 'shortcut.group_list' },
    'list.next_page': { keys: ']', label: 'shortcut.next_page', group: 'shortcut.group_list' },
};

let registrar: ShortcutRegistrar | null = null;

export function setShortcutRegistrar(next: ShortcutRegistrar | null): void {
    registrar = next;
}

export function listShortcut(id: string, extra: Pick<ListShortcut, 'handler' | 'when'>): ListShortcut {
    return { id, ...LIST_SHORTCUT_DEFAULTS[id], ...extra };
}

/** Registers a list screen's shortcuts with the host, if it has a keyboard system. */
export function useListShortcuts(source: () => ListShortcut[]): void {
    registrar?.(source);
}
