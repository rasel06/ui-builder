import { markRaw, shallowRef } from 'vue';

/**
 * Runtime resolution of Lucide icons by *name string*.
 *
 * Menu rows (`menus.icon`) and some module configs store an admin-chosen icon name, so
 * the component can't be known until runtime. The obvious implementation —
 * `import * as LucideIcons from '@lucide/vue'`, or even a dynamic `import('@lucide/vue')`
 * — is a trap: materializing the barrel forces Rollup to emit all ~1,800 icons as one
 * 644 KB chunk, and because static importers get merged into that same chunk, it also
 * destroys tree-shaking for the ~60 other modules that only import a handful of icons by
 * name.
 *
 * The replacement — an `import.meta.glob` over the package's per-icon modules — fixed the
 * artwork but not the index: Vite emits one keyed entry and one `__vite__mapDeps` call
 * site per matched file, which came to **352 KB** here. This module is imported
 * statically by AppSidebar, GenericTable and ModuleHeader, so all 352 KB was in the eager
 * closure of every page in the app. That glob now lives in `lucideIconRegistry.ts`, which
 * nothing imports statically.
 *
 * Two tiers, in order:
 *
 *  1. **Icons the host registers up front** with `registerLucideIcons()` (quick-pos registers
 *     the names in its `menus` table, generated as ordinary named imports so they tree-shake).
 *     Answered synchronously, so a sidebar icon does not appear a frame after paint.
 *  2. **The lazy registry** — fetched only on a miss (an admin picked something unusual,
 *     or the icon picker is open). A miss costs one extra request and still renders, so
 *     tier 1 going stale degrades performance, never correctness.
 */

// Resolved components are cached and shared process-wide; the ref makes consumers
// re-render once a requested icon lands.
const resolved = shallowRef<Record<string, unknown>>({});

/** Registers icon components by name so they resolve synchronously (call before mounting). */
export function registerLucideIcons(icons: Record<string, unknown>): void {
    const next = { ...resolved.value };
    for (const [name, icon] of Object.entries(icons)) next[name] = markRaw(icon as object);
    resolved.value = next;
}
const inFlight = new Set<string>();

/** Loads one icon by name into the shared cache. Safe to call repeatedly. */
export function loadLucideIcon(name: string): void {
    if (!name || inFlight.has(name) || resolved.value[name]) return;

    inFlight.add(name);

    import('./lucideIconRegistry')
        .then(({ loadIconModule }) => loadIconModule(name))
        .then((icon) => {
            if (icon) {
                resolved.value = {
                    ...resolved.value,
                    [name]: markRaw(icon as object),
                };
            }
        })
        .catch(() => {
            /* a missing/renamed icon simply renders as nothing */
        })
        .finally(() => inFlight.delete(name));
}

export function useLucideIcons() {
    /**
     * Resolves an icon name to its component, kicking off the fetch on first request.
     * A name in the common set resolves immediately; anything else returns null until
     * the registry lands, so callers must still render defensively.
     */
    const resolveLucideIcon = (name: string | null | undefined) => {
        if (!name) return null;

        const hit = resolved.value[name];
        if (hit) return hit;

        loadLucideIcon(name);
        return null;
    };

    return { icons: resolved, resolveLucideIcon };
}
