import { computed, getCurrentInstance, onBeforeUnmount, onMounted, ref, type ComputedRef } from 'vue';

/**
 * Overlays (toasts, image preview) keep their state in one module-level store, so only one mounted copy may
 * draw it. UiBuilderRoot mounts one; a layout or page that still mounts its own is harmless: the first copy
 * mounted draws, the rest stay empty, and when it unmounts the next one takes over.
 */
const owners: Record<string, ReturnType<typeof ref<number[]>>> = {};

export function useOverlayOwner(kind: string): ComputedRef<boolean> {
    const list = (owners[kind] ??= ref<number[]>([]));
    const uid = getCurrentInstance()?.uid ?? -1;
    onMounted(() => list.value!.push(uid));
    onBeforeUnmount(() => {
        list.value = list.value!.filter((id) => id !== uid);
    });
    return computed(() => list.value![0] === uid);
}
