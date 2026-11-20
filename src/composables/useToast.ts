import { addToast, type ToastType } from './toastStore';

/**
 * Show a toast from anywhere: `toast.success('Saved')`, or `useToast().error(...)` inside a component.
 * Toasts are drawn by the ToastNotification that UiBuilderRoot mounts, so no component ref is needed.
 */
const show = (type: ToastType) => (message: string, title?: string, duration?: number) =>
    addToast({ type, message, title, duration });

export const toast = {
    success: show('success'),
    error: show('error'),
    warning: show('warning'),
    info: show('info'),
};

export function useToast() {
    return toast;
}
