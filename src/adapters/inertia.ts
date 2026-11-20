/**
 * The only file in ui-builder that imports Inertia. Every component and composable takes `router`
 * and `usePage` from here, so the coupling to `@inertiajs/vue3` (a peer dependency: ui-builder must
 * use the host's own router and page state) sits in one place, and a React build swaps this file
 * for `@inertiajs/react` without touching anything else.
 */
export { router, usePage } from '@inertiajs/vue3';
