<script setup lang="ts">
import ImagePreviewModal from './ImagePreviewModal.vue';
import ToastNotification from './ToastNotification.vue';

/**
 * Wrap the app's root in this once (`h(UiBuilderRoot, () => h(App, props))`): it mounts ui-builder's
 * page-wide overlays, toasts and the image/PDF preview, so no layout or page has to.
 */
</script>

<template>
    <slot />
    <ToastNotification />
    <ImagePreviewModal />
</template>
