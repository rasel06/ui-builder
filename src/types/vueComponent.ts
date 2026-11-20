import type { Component } from 'vue';

// The config types (types/module.ts) are framework-free; in Vue a renderable component is a Vue Component.
declare module './module' {
    interface UiFrameworkTypes {
        component: Component;
    }
}

export {};
