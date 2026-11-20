# @rasel/ui-builder

Declarative CRUD screens, forms, tables and themes for **Laravel + Vue 3 + Inertia** apps.
Frontend only: it never changes your backend. Your server just answers the list, form and flash
requests your pages make.

Full component guide: [docs/documentation.md](docs/documentation.md).


---

## 1. Requirements

- A Laravel + Inertia project using **Vue 3** and **Vite**.
- **Tailwind CSS v4** (the default in new Laravel starter kits). A project without Tailwind can use the
  pre-built CSS file instead (see step 4).
- Access to the private `rasel06/ui-builder` repo, with Git logged in to GitHub (`gh auth login` once per computer).

`vue` and `@inertiajs/vue3` come from your project. Everything else (icons, selects, PDF/Excel export,
date helpers...) ships with ui-builder; you do not install it yourself.

---

## 2. Install in a project

**Step 1.** In your project folder:

```bash
npm i git+https://github.com/rasel06/ui-builder.git#v0.1.0
```

`#v0.1.0` is the version (a Git tag). Your `package.json` now lists `@rasel/ui-builder`.

**Step 2.** Register it in `resources/js/app.ts`:

```ts
import { createUiBuilder, UiBuilderRoot } from '@rasel/ui-builder';

createInertiaApp({
    // ...
    setup({ el, App, props, plugin }) {
        createApp({ render: () => h(UiBuilderRoot, () => h(App, props)) })
            .use(plugin)
            .use(createUiBuilder())
            .mount(el);
    },
});
```

`UiBuilderRoot` mounts the toast messages and the image preview once for the whole app.

**Step 3.** If you use server-side rendering, do the same in `resources/js/ssr.ts`.

**Step 4.** Add the styles to `resources/css/app.css`, below the Tailwind line:

```css
@import 'tailwindcss';
@import '@rasel/ui-builder/styles/source.css';
```

No Tailwind in the project? Import the pre-built file in `app.ts` instead:

```ts
import '@rasel/ui-builder/ui-builder.css';
```

**Step 5.** Run `npm run dev` (or `npm run build`).

---

## 3. Use it in a page

A list page is a config file plus a few lines of Vue.

`resources/js/pages/brands/brandConfig.ts`:

```ts
import type { ModuleConfig } from '@rasel/ui-builder/types/module';

export function getBrandConfig(): ModuleConfig {
    return {
        moduleName: 'Brand',
        dataPropName: 'brands',
        permissions: { view: 'brand view', create: 'brand create', update: 'brand edit', delete: 'brand delete' },
        api: { create: '/brands', update: '/brands/:id', delete: '/brands/:id' },
        tableColumns: [
            { key: 'name', label: 'Name', sortable: true },
            { key: 'actions', label: 'Actions', type: 'actions' },
        ],
        formFields: [{ name: 'name', label: 'Name', type: 'text', required: true }],
    };
}
```

`resources/js/pages/brands/index.vue`:

```vue
<script setup lang="ts">
import ModuleManager from '@rasel/ui-builder/components/ModuleManager/ModuleManager.vue';
import { getBrandConfig } from './brandConfig';

defineProps<{ brands: any }>();
</script>

<template>
    <ModuleManager :config="getBrandConfig()" :data="brands" />
</template>
```

Import exactly what a page needs (`@rasel/ui-builder/components/...`, `/composables/...`, `/utils/...`,
`/types/...`). Importing from the package root pulls every component into the page's first load.

### What your Laravel side must send

ui-builder reads these Inertia props. If your app names them differently, map them with the
`pageProps` option (section 5).

| Prop | Used for |
|---|---|
| `auth.user`, `auth.permissions` (array of names) | showing or hiding buttons by permission |
| `flash.success`, `flash.error`, `flash.warning`, `flash.message` | toast messages |
| the list prop named in `dataPropName` | a Laravel paginator (`data`, `current_page`, `last_page`, `per_page`, `total`) |

List requests arrive as query parameters: `search`, `page`, `perPage`, `sort`, `direction`, `date_from`,
`date_to` and one parameter per filter. How you filter and paginate is up to your controller.

---

## 4. Update a project to a newer version

**Step 1.** See which versions exist:

```bash
git ls-remote --tags https://github.com/rasel06/ui-builder.git
```

**Step 2.** Install the one you want (here `v0.2.0`):

```bash
npm i git+https://github.com/rasel06/ui-builder.git#v0.2.0
```

**Step 3.** Rebuild (`npm run build`) and check your screens. Read the release notes of the tag for
anything you need to change.

To go back, install the previous tag the same way.

---

## 5. Options

Every option is optional; `createUiBuilder()` works with none.

```ts
createUiBuilder({
    translator: i18n.global,          // your vue-i18n; its wording wins over ui-builder's own
    locale: 'en',                     // language of ui-builder's own strings (en, ar, bn bundled)
    storagePrefix: 'myapp-',          // prefix for what ui-builder keeps in localStorage
    pageProps: (props) => ({ ... }),  // map your Inertia props to the shape in section 3
    icons: { LucideHome },            // icons by name that should load without a request
    dateFormatter, exportBranding, exportDefaults, savedViewStore, shortcutRegistrar, csrfToken,
});
```

---

## 6. For maintainers: releasing a new version

ui-builder is developed inside quick-pos at `packages/ui-builder` and published to its own repo.

**Step 1.** Make and commit your change in quick-pos. Before committing, run from the quick-pos root:

```bash
npm run ui-builder:check     # ui-builder must not depend on the app
npm run tsc:check            # no new type errors
npm run build
```

**Step 2.** Raise `version` in `packages/ui-builder/package.json` (for example `0.1.0` to `0.2.0`) and commit.
Use a new major number (`1.x` to `2.0.0`) when a change breaks existing configs.

**Step 3.** From the quick-pos root, publish it:

```bash
scripts/release-ui-builder.sh
```

It reads the version from `package.json`, adds one commit to the `rasel06/ui-builder` repo and tags it
(`v0.2.0`). It refuses if you have uncommitted changes in the package or the version already exists.
Git must be logged in to GitHub (`gh auth login` once per computer).

**Step 4.** Projects move to it with section 4.

### Rules

- Never import from a host app (`@/...`) and never read `window.*` globals; the check in step 1 fails on it.
- New third-party libraries go into this package's `dependencies`. Only `vue` and `@inertiajs/vue3` are peers.
- Files listed as framework-free in `scripts/check-ui-builder-independence.mjs` (quick-pos) must not import
  Vue, Inertia or a `.vue` file, so a React version can share them later.
- Rebuild the pre-built CSS with `npm run build:css -w @rasel/ui-builder` when classes change.
