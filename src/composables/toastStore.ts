import { ref } from 'vue';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
    id: number;
    type: ToastType;
    title?: string;
    message: string;
    duration?: number;
}

/** Every toast on the page, drawn by the one mounted ToastNotification (see overlayOwner.ts). */
export const toasts = ref<ToastItem[]>([]);
let lastId = 0;

export function removeToast(id: number): void {
    toasts.value = toasts.value.filter((t) => t.id !== id);
}

export function addToast(toast: Omit<ToastItem, 'id'>): number {
    const id = ++lastId;
    toasts.value.push({ ...toast, id });
    if (toast.duration !== 0) setTimeout(() => removeToast(id), toast.duration || 5000);
    return id;
}

let listening = false;

/**
 * A page can also raise a toast with `window.dispatchEvent(new CustomEvent('show-toast', { detail }))`
 * (older pages do). One listener, added the first time a toast area mounts in a browser.
 */
export function listenForToastEvents(): void {
    if (listening || typeof window === 'undefined') return;
    listening = true;
    window.addEventListener('show-toast', (event: Event) => {
        const detail = (event as CustomEvent).detail;
        if (detail?.message) addToast(detail);
    });
}
