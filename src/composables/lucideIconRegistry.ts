import { LUCIDE_ICON_ALIASES } from './lucideIconAliases';

/**
 * The full ~1,800-icon lookup, kept out of every page's eager bundle.
 *
 * `import.meta.glob` is lazy about the *modules* it points at, but the map it generates
 * is not free: Vite emits one entry per matched file, each carrying the full glob path as
 * its key plus a `__vite__loadModule(__vite__mapDeps([...]))` call site, and a shared
 * dependency table naming every emitted chunk. Measured on this project that came to
 * **352 KB** — 58 KB of filename table and 294 KB of keys and loader boilerplate — and
 * because `useLucideIcons.ts` was imported statically by AppSidebar, GenericTable and
 * ModuleHeader, all 352 KB sat in the eager import closure of literally every page,
 * including the standalone kitchen and floor-plan terminals.
 *
 * None of it is icon artwork. It is an index, and an index is only worth downloading when
 * something is actually missing from the fast path — so it lives here, in a module nothing
 * imports statically. `useLucideIcons()` answers from a small static map first
 * (icons the host registered with `registerLucideIcons()`) and only reaches for this file on a miss, which in practice
 * means an admin picked an unusual icon, or somebody opened the icon picker.
 */
const iconLoaders = import.meta.glob<{ default: unknown }>(
    // Root-relative, so it does not depend on how deep this file sits (in the app or in node_modules).
    '/node_modules/@lucide/vue/dist/esm/icons/*.mjs',
);

/**
 * `LayoutDashboard` -> `layout-dashboard` (the on-disk filename).
 *
 * Also strips the `Lucide` prefix / `Icon` suffix that the barrel exports as aliases
 * (`LucideSprout` and `SproutIcon` both live in `sprout.mjs`), and splits letter→digit
 * boundaries (`Building2` -> `building-2`). Roughly 800 aliases still can't be derived
 * this way — `UserCog2` is `user-round-cog.mjs` — so LUCIDE_ICON_ALIASES is consulted
 * first. Keep this in sync with the copy in scripts/generate-lucide-aliases.mjs.
 */
export function toIconFileName(name: string): string {
    const alias = LUCIDE_ICON_ALIASES[name];
    if (alias) return alias;

    let n = name;
    if (n.startsWith('Lucide') && n.length > 6) n = n.slice(6);
    if (n.endsWith('Icon') && n.length > 4) n = n.slice(0, -4);

    return n
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
        .replace(/([a-zA-Z])([0-9])/g, '$1-$2')
        .toLowerCase();
}

const loaderByFileName = new Map<string, () => Promise<{ default: unknown }>>();
for (const [path, loader] of Object.entries(iconLoaders)) {
    const file = path.split('/').pop()?.replace(/\.mjs$/, '');
    if (file) loaderByFileName.set(file, loader);
}

/** Fetch one icon module by its exported name, or null if the package has no such icon. */
export async function loadIconModule(name: string): Promise<unknown | null> {
    const loader = loaderByFileName.get(toIconFileName(name));
    if (!loader) return null;

    try {
        return (await loader()).default;
    } catch {
        // A missing or renamed icon simply renders as nothing.
        return null;
    }
}

/** Every icon name the package ships, PascalCase, sorted — no icon modules loaded. */
export function availableIconNames(): string[] {
    return Array.from(loaderByFileName.keys())
        .map((kebab) =>
            kebab
                .split('-')
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join(''),
        )
        .sort((a, b) => a.localeCompare(b));
}
