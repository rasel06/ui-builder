/**
 * Where the "Views" menu keeps saved filters. ui-builder stays self-contained: it stores views in the browser
 * (localStorage) unless the host app registers a store of its own with setSavedViewStore() (the host keeps them per
 * user on the server, so they follow a person between devices and can be shared).
 */

import { storageKey } from '../lib/storage';

export interface SavedView {
    id: number | string;
    name: string;
    /** The list's address query: filters, search, sort (no page). */
    query: string;
    is_shared?: boolean;
    is_default?: boolean;
    /** False for a view someone else shared: it can be used, not deleted. */
    mine?: boolean;
    /** A date rule ("last_7_days") kept instead of exact dates; resolved to a range on the day the view is opened. */
    date_preset?: DatePreset | null;
}

export const DATE_PRESETS = ['today', 'yesterday', 'last_7_days', 'last_30_days', 'this_week', 'this_month', 'last_month', 'this_year'] as const;
export type DatePreset = (typeof DATE_PRESETS)[number];

const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** The date range a rule means on a given day (local time). Weeks start on Monday. */
export function resolveDatePreset(preset: DatePreset, today: Date = new Date()): { date_from: string; date_to: string } {
    const day = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const shift = (d: Date, days: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);

    switch (preset) {
        case 'yesterday': {
            const y = shift(day, -1);
            return { date_from: ymd(y), date_to: ymd(y) };
        }
        case 'last_7_days':
            return { date_from: ymd(shift(day, -6)), date_to: ymd(day) };
        case 'last_30_days':
            return { date_from: ymd(shift(day, -29)), date_to: ymd(day) };
        case 'this_week':
            return { date_from: ymd(shift(day, -((day.getDay() + 6) % 7))), date_to: ymd(day) };
        case 'this_month':
            return { date_from: ymd(new Date(day.getFullYear(), day.getMonth(), 1)), date_to: ymd(day) };
        case 'last_month':
            return { date_from: ymd(new Date(day.getFullYear(), day.getMonth() - 1, 1)), date_to: ymd(new Date(day.getFullYear(), day.getMonth(), 0)) };
        case 'this_year':
            return { date_from: ymd(new Date(day.getFullYear(), 0, 1)), date_to: ymd(day) };
        default:
            return { date_from: ymd(day), date_to: ymd(day) };
    }
}

/** The query a saved view opens with: its own filters, plus the date range its rule means today (if it has a rule). */
export function viewQuery(view: Pick<SavedView, 'query' | 'date_preset'>, today: Date = new Date()): string {
    if (!view.date_preset) return view.query;
    const params = new URLSearchParams(view.query);
    const range = resolveDatePreset(view.date_preset, today);
    params.set('date_from', range.date_from);
    params.set('date_to', range.date_to);
    return params.toString();
}

export interface SavedViewStore {
    list(scope: string): Promise<SavedView[]>;
    save(scope: string, view: { name: string; query: string; is_shared?: boolean; is_default?: boolean; date_preset?: DatePreset | null }): Promise<SavedView>;
    remove(id: SavedView['id']): Promise<void>;
}

const key = (scope: string) => storageKey(`saved-views:${scope}`);

const read = (scope: string): SavedView[] => {
    try {
        return JSON.parse(localStorage.getItem(key(scope)) ?? '[]');
    } catch {
        return [];
    }
};

const write = (scope: string, views: SavedView[]) => {
    try {
        localStorage.setItem(key(scope), JSON.stringify(views));
    } catch {
        // Storage blocked (private window): views just do not persist.
    }
};

const browserStore: SavedViewStore = {
    async list(scope) {
        return read(scope);
    },
    async save(scope, view) {
        const views = read(scope)
            .filter((v) => v.name !== view.name)
            .map((v) => (view.is_default ? { ...v, is_default: false } : v));
        const saved: SavedView = { id: `${Date.now()}`, mine: true, ...view };
        write(scope, [...views, saved]);
        return saved;
    },
    async remove(id) {
        const prefix = storageKey('saved-views:');
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k?.startsWith(prefix)) {
                    const scope = k.slice(prefix.length);
                    write(scope, read(scope).filter((v) => v.id !== id));
                }
            }
        } catch {
            // Storage blocked: nothing was kept, so nothing to remove.
        }
    },
};

let store: SavedViewStore = browserStore;

export function setSavedViewStore(next: SavedViewStore | null) {
    store = next ?? browserStore;
}

export function savedViewStore(): SavedViewStore {
    return store;
}

/** The current list's query, without the page (a saved view always starts on the first page). */
export function currentListQuery(): string {
    const params = new URLSearchParams(window.location.search);
    params.delete('page');
    return params.toString();
}
