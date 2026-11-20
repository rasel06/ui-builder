<script setup lang="ts">
import { resolveLabel } from '../i18n';
import { Download, Loader2, X } from '@lucide/vue';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { isPdfFile, useImagePreview } from '../composables/useImagePreview';
import { useOverlayOwner } from '../composables/overlayOwner';

const isOwner = useOverlayOwner('image-preview');

const { previewData, closePreview } = useImagePreview();

const isModalImgLoaded = ref(false);
const isDownloading = ref(false);

const isPdf = computed(() => {
    if (!previewData.value) return false;
    return (
        isPdfFile(previewData.value.url, previewData.value.fileName) ||
        isPdfFile(previewData.value.fileName)
    );
});

watch(
    () => [previewData.value?.url, isPdf.value],
    () => {
        isModalImgLoaded.value = false;
        if (isPdf.value) {
            // For PDFs rendered inside an iframe, native browser PDF plugins do not reliably fire iframe @load.
            // Set isModalImgLoaded = true automatically after a short tick to hide the spinner overlay.
            setTimeout(() => {
                isModalImgLoaded.value = true;
            }, 200);
        }
    },
    { immediate: true },
);

const isDownloadable = computed(() => {
    if (!previewData.value?.url) return false;
    return true;
});

const handleDownload = async () => {
    if (!previewData.value?.url) return;
    const fileUrl = previewData.value.url;
    const fileName =
        previewData.value.fileName || fileUrl.split('/').pop() || 'attachment';

    try {
        isDownloading.value = true;
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
    } catch (e) {
        console.warn('Fetch download failed, falling back to direct link:', e);
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } finally {
        isDownloading.value = false;
    }
};

const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOwner.value) return;
    if (e.key === 'Escape' && previewData.value) {
        closePreview();
    }
};

onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
    <Teleport v-if="isOwner" to="body">
        <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
        >
            <div
                v-if="previewData"
                class="no-print fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-xs"
                @click="closePreview"
            >
                <div
                    class="relative flex max-h-[92vh] max-w-[92vw] flex-col items-center overflow-hidden rounded-2xl bg-white p-3 shadow-2xl dark:border dark:border-slate-800 dark:bg-slate-900"
                    @click.stop
                >
                    <div
                        class="mb-2 flex w-full items-center justify-between gap-4 px-2 pt-1"
                    >
                        <span
                            class="truncate text-xs font-bold text-slate-700 dark:text-slate-200"
                            :title="previewData.fileName"
                        >
                            {{ previewData.fileName }}
                        </span>
                        <div class="flex items-center gap-2">
                            <button
                                v-if="isDownloadable"
                                type="button"
                                @click="handleDownload"
                                :disabled="isDownloading"
                                class="flex cursor-pointer items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                :title="resolveLabel('ui-builder.download_attachment')"
                            >
                                <Loader2
                                    v-if="isDownloading"
                                    class="h-3.5 w-3.5 animate-spin text-blue-500"
                                />
                                <Download v-else class="h-3.5 w-3.5" />
                                <span>{{
                                    isDownloading ? 'Saving...' : 'Download'
                                }}</span>
                            </button>
                            <button
                                type="button"
                                @click="closePreview"
                                class="cursor-pointer rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                                :title="resolveLabel('ui-builder.close')"
                            >
                                <X class="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    <div
                        class="relative flex min-h-[260px] w-full max-w-[85vw] min-w-[320px] flex-1 items-center justify-center overflow-auto rounded-xl bg-slate-950/5 p-1 dark:bg-slate-950/40"
                    >
                        <div
                            v-if="!isModalImgLoaded"
                            class="backdrop-blur-2xs absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-xl bg-slate-100/50 dark:bg-slate-900/50"
                        >
                            <Loader2
                                class="h-8 w-8 animate-spin text-blue-500"
                            />
                            <span
                                class="text-xs font-semibold text-slate-600 dark:text-slate-400"
                                >{{ resolveLabel('ui-builder.loading_attachment_preview') }}</span
                            >
                        </div>

                        <iframe
                            v-if="isPdf"
                            :src="previewData.url"
                            class="h-[80vh] w-full min-w-[70vw] rounded-lg border-0 bg-white shadow-xs"
                            @load="isModalImgLoaded = true"
                        ></iframe>

                        <img
                            v-else
                            :src="previewData.url"
                            :alt="previewData.fileName"
                            class="max-h-[80vh] max-w-full rounded-lg object-contain transition-opacity duration-300"
                            :class="{
                                'opacity-0': !isModalImgLoaded,
                                'opacity-100': isModalImgLoaded,
                            }"
                            @load="isModalImgLoaded = true"
                            @error="isModalImgLoaded = true"
                        />
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
