<template>
    <div class="space-y-2" :style="themeVars">
        <label
            v-if="!hideLabel"
            :for="field.name"
            :class="`text-sm font-bold ${theme.labelText || 'text-gray-700 dark:text-gray-300'}`"
        >
            {{ resolveFieldLabel(field) }}
            <span
                v-if="field.required"
                :class="theme.errorText || 'text-red-600'"
            >
                *</span
            >
            <HintTip :text="field.hint ? resolveLabel(field.hint) : null" />
        </label>

        <div class="space-y-3">
            <!-- File Drop/Upload Zone (Active when under max files limit) -->
            <div
                v-if="canAddMore || totalFileCount === 0"
                :class="`relative rounded-xl border-2 border-dashed transition-all ${
                    isDragging
                        ? 'border-[var(--focus-theme-color,#3b82f6)] bg-[var(--focus-theme-color,#3b82f6)]/10 shadow-md dark:bg-[var(--focus-theme-color,#3b82f6)]/20'
                        : error
                          ? theme.errorBorder || 'border-red-500'
                          : theme.inputBorder ||
                            'border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600'
                } ${theme.inputBackground || 'bg-white dark:bg-gray-800'} ${
                    totalFileCount > 0 ? 'p-3' : 'p-4'
                }`"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleDrop"
            >
                <input
                    :id="field.name"
                    :name="field.name"
                    type="file"
                    :accept="acceptedTypes"
                    :multiple="isMultiple"
                    @change="handleFileSelect"
                    class="hidden"
                    ref="fileInputRef"
                />

                <div
                    v-if="totalFileCount === 0"
                    class="cursor-pointer py-2 text-center"
                    @click="triggerFileInput"
                >
                    <div
                        class="mx-auto flex h-10 w-10 items-center justify-center rounded-full"
                        :style="{ color: 'var(--focus-theme-color)', backgroundColor: 'color-mix(in srgb, var(--focus-theme-color) 14%, transparent)', ...dropIconBoxStyle }"
                    >
                        <Upload class="h-5 w-5" :style="largeDrop ? control.iconStyle : {}" />
                    </div>
                    <p
                        :class="`mt-2 ${largeDrop || control.raw ? control.textClass : 'text-sm'} ${theme.inputText || 'text-gray-600 dark:text-gray-400'}`"
                    >
                        <span
                            class="font-semibold"
                            :style="{
                                color: 'var(--focus-theme-color,#2563eb)',
                            }"
                            >{{ resolveLabel('ui-builder.click_to_upload') }}</span
                        >
                        {{ resolveLabel('ui-builder.or_drag_drop') }}
                    </p>
                    <p
                        :class="`mt-0.5 text-xs ${theme.paginationText || 'text-gray-500 dark:text-neutral-400'}`"
                    >
                        {{ acceptLabel }} (Max {{ maxSizeMB }}MB{{
                            maxFiles ? ' · up to ' + maxFiles + ' files' : ''
                        }})
                    </p>
                </div>

                <!-- Compact "Add More Files" Strip (When files are already selected) -->
                <div
                    v-else
                    class="flex cursor-pointer items-center justify-center gap-2 py-1 text-xs font-semibold text-gray-600 transition-colors hover:text-[var(--focus-theme-color,#2563eb)] dark:text-gray-300 dark:hover:text-blue-400"
                    @click="triggerFileInput"
                >
                    <Plus class="h-4 w-4" />
                    <span>{{ resolveLabel('ui-builder.add_more_files') }}</span>
                    <span
                        v-if="remainingFiles !== null"
                        class="rounded-full border border-blue-200/60 bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-600 dark:border-blue-800/60 dark:bg-blue-950/50 dark:text-blue-400"
                    >
                        {{ remainingFiles }} remaining
                    </span>
                    <span v-else class="text-[11px] font-normal text-gray-400 dark:text-neutral-400">
                        ({{ totalFileCount }} attached)
                    </span>
                </div>
            </div>

            <div v-if="totalFileCount > 0" class="space-y-2">
                <div
                    class="flex items-center justify-between px-1 text-xs font-medium text-gray-500 dark:text-gray-400"
                >
                    <div class="flex items-center gap-2">
                        <div
                            class="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-gray-300"
                        >
                            <Paperclip class="h-3.5 w-3.5 text-gray-400 dark:text-neutral-400" />
                            <span
                                >Attached Files ({{ totalFileCount
                                }}{{ maxFiles ? '/' + maxFiles : '' }})</span
                            >
                        </div>
                        <span
                            v-if="remainingFiles !== null && remainingFiles > 0"
                            class="rounded-md border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-400"
                        >
                            {{ remainingFiles }} more allowed
                        </span>
                        <span
                            v-else-if="remainingFiles === 0"
                            class="rounded-md border border-amber-100 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-400"
                        >
                            Max limit reached ({{ maxFiles }}/{{ maxFiles }})
                        </span>
                    </div>
                    <button
                        v-if="totalFileCount > 1"
                        type="button"
                        @click="clearAllFiles"
                        class="text-[11px] font-medium text-red-500 transition-colors hover:text-red-600 hover:underline"
                    >
                        {{ resolveLabel('ui-builder.clear_all') }}
                    </button>
                </div>

                <div
                    class="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3"
                >
                    <!-- Initial Previews (URLs from server) -->
                    <div
                        v-for="(url, index) in initialPreviews"
                        :key="'init-' + index"
                        class="group relative flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/80 px-2 py-1.5 shadow-2xs transition-all hover:border-blue-300 hover:bg-blue-50/40 dark:border-slate-700/80 dark:bg-slate-800/60 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                    >
                        <div class="flex min-w-0 flex-1 items-center gap-2">
                            <div
                                class="relative flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                                :class="{
                                    'cursor-pointer transition-opacity hover:opacity-80':
                                        isPreviewableFile(
                                            url,
                                            url.split('/').pop(),
                                        ),
                                }"
                                @click="
                                    isPreviewableFile(
                                        url,
                                        url.split('/').pop(),
                                    ) && viewFile(url, url.split('/').pop())
                                "
                                :title="
                                    isPreviewableFile(url, url.split('/').pop())
                                        ? 'Click to preview'
                                        : ''
                                "
                            >
                                <img
                                    v-if="
                                        isImageFile(url, url.split('/').pop())
                                    "
                                    :src="url"
                                    :alt="resolveLabel('ui-builder.attachment')"
                                    class="h-full w-full object-cover transition-transform group-hover:scale-105"
                                />
                                <div
                                    v-else-if="
                                        isPdfFile(url, url.split('/').pop())
                                    "
                                    class="flex items-center justify-center text-rose-500"
                                >
                                    <FileText class="h-4 w-4" />
                                </div>
                                <div
                                    v-else
                                    class="flex items-center justify-center text-blue-500"
                                >
                                    <FileIcon class="h-4 w-4" />
                                </div>
                            </div>

                            <div class="min-w-0 flex-1">
                                <p
                                    class="truncate text-[11px] leading-tight font-bold text-slate-800 dark:text-slate-200"
                                    :title="url.split('/').pop()"
                                >
                                    {{ url.split('/').pop() }}
                                </p>
                                <div
                                    class="mt-0.5 flex items-center gap-1 text-[10px] text-slate-600 dark:text-slate-400"
                                >
                                    <span>{{ resolveLabel('ui-builder.existing') }}</span>
                                    <span
                                        v-if="getFileExt(url)"
                                        class="py-0.1 rounded bg-slate-200/80 px-1 text-[9px] font-black text-slate-600 uppercase dark:bg-slate-700 dark:text-slate-300"
                                    >
                                        {{ getFileExt(url) }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="flex flex-shrink-0 items-center gap-0.5">
                            <button
                                v-if="
                                    isPreviewableFile(url, url.split('/').pop())
                                "
                                type="button"
                                @click="viewFile(url, url.split('/').pop())"
                                class="cursor-pointer rounded-md p-1 text-slate-400 dark:text-neutral-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                                :title="
                                    isPdfFile(url, url.split('/').pop())
                                        ? 'Preview PDF'
                                        : 'Preview Image'
                                "
                            >
                                <Eye class="h-3.5 w-3.5" />
                            </button>
                            <button
                                type="button"
                                @click="removeInitialFile(index)"
                                class="rounded-md p-1 text-slate-400 dark:text-neutral-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
                                :title="resolveLabel('ui-builder.remove_file')"
                            >
                                <X class="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>

                    <!-- New Selection Previews -->
                    <div
                        v-for="(file, index) in selectedFiles"
                        :key="'new-' + index"
                        class="group relative flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/80 px-2 py-1.5 shadow-2xs transition-all hover:border-blue-300 hover:bg-blue-50/40 dark:border-slate-700/80 dark:bg-slate-800/60 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                    >
                        <div class="flex min-w-0 flex-1 items-center gap-2">
                            <div
                                class="relative flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                                :class="{
                                    'cursor-pointer transition-opacity hover:opacity-80':
                                        isPreviewableFile(file, file?.name),
                                }"
                                @click="
                                    isPreviewableFile(file, file?.name) &&
                                    viewNewFile(index)
                                "
                                :title="
                                    isPreviewableFile(file, file?.name)
                                        ? 'Click to preview'
                                        : ''
                                "
                            >
                                <img
                                    v-if="
                                        previewUrls[index] &&
                                        isImageFile(file, file?.name)
                                    "
                                    :src="previewUrls[index]"
                                    :alt="file?.name || resolveLabel('ui-builder.preview')"
                                    class="h-full w-full object-cover transition-transform group-hover:scale-105"
                                />
                                <div
                                    v-else-if="isPdfFile(file, file?.name)"
                                    class="flex items-center justify-center text-rose-500"
                                >
                                    <FileText class="h-4 w-4" />
                                </div>
                                <div
                                    v-else
                                    class="flex items-center justify-center text-blue-500"
                                >
                                    <FileIcon class="h-4 w-4" />
                                </div>
                            </div>

                            <div class="min-w-0 flex-1">
                                <p
                                    class="truncate text-[11px] leading-tight font-bold text-slate-800 dark:text-slate-200"
                                    :title="file?.name"
                                >
                                    {{ file?.name || 'File' }}
                                </p>
                                <div
                                    class="mt-0.5 flex items-center gap-1 text-[10px] text-slate-600 dark:text-slate-400"
                                >
                                    <span>{{
                                        formatFileSize(file?.size)
                                    }}</span>
                                    <span
                                        v-if="getFileExt(file?.name || '')"
                                        class="py-0.1 rounded bg-slate-200/80 px-1 text-[9px] font-black text-slate-600 uppercase dark:bg-slate-700 dark:text-slate-300"
                                    >
                                        {{ getFileExt(file?.name || '') }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="flex flex-shrink-0 items-center gap-0.5">
                            <button
                                v-if="isPreviewableFile(file, file?.name)"
                                type="button"
                                @click="viewNewFile(index)"
                                class="cursor-pointer rounded-md p-1 text-slate-400 dark:text-neutral-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                                :title="
                                    isPdfFile(file, file?.name)
                                        ? 'Preview PDF'
                                        : 'Preview Image'
                                "
                            >
                                <Eye class="h-3.5 w-3.5" />
                            </button>
                            <button
                                type="button"
                                @click="removeFile(index)"
                                class="rounded-md p-1 text-slate-400 dark:text-neutral-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
                                :title="resolveLabel('ui-builder.remove_file')"
                            >
                                <X class="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="uploading" class="mt-2">
                <div
                    class="mb-1.5 flex items-center justify-between text-xs font-medium"
                >
                    <span :class="theme.inputText">{{ resolveLabel('ui-builder.uploading') }}</span>
                    <span :class="theme.inputText">{{ uploadProgress }}%</span>
                </div>
                <div
                    class="h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
                >
                    <div
                        class="h-full bg-blue-600 transition-all duration-300"
                        :style="{ width: `${uploadProgress}%` }"
                    ></div>
                </div>
            </div>
        </div>

        <div
            v-if="error || uploadError"
            :class="`mt-1.5 flex items-center gap-1 text-xs ${theme.errorText || 'text-red-600'}`"
        >
            <svg
                class="h-3.5 w-3.5 shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
            >
                <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                />
            </svg>
            <span>{{ uploadError || error }}</span>
        </div>

        <p
            v-if="field.placeholder"
            :class="`text-xs ${theme.paginationText || 'text-gray-500 dark:text-neutral-400'}`"
        >
            {{ field.placeholder }}
        </p>
    </div>

    <ImagePreviewModal />
</template>

<script setup lang="ts">
import { resolveLabel } from '../../i18n';
import {
    Eye,
    FileIcon,
    FileText,
    Paperclip,
    Plus,
    Upload,
    X,
} from '@lucide/vue';
import { resolveFieldLabel } from '../../i18n';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import {
    isImageFile,
    isPdfFile,
    isPreviewableFile,
    useImagePreview,
} from '../../composables/useImagePreview';
import { getThemeHex } from '../../composables/themes';
import type { FormField, ThemeConfig } from '../../types/module';
import { resolveControlSize } from '../../utils/sizing';
import HintTip from '../HintTip.vue';
import ImagePreviewModal from '../ImagePreviewModal.vue';

interface Props {
    field: FormField;
    value: any;
    error?: string;
    theme: Partial<ThemeConfig>;
    selectedTheme?: string;
    readonly?: boolean;
    hideLabel?: boolean;
    /** A size token or raw classes (utils/sizing.ts); the field's own size wins. */
    size?: string;
}

const props = defineProps<Props>();

// The drop zone's icon and wording grow with the field size; sm to lg keep the original look.
const control = computed(() => resolveControlSize(props.field.size || props.size));
const largeDrop = computed(() => !['xs', 'sm', 'md', 'lg'].includes(control.value.token));
const dropIconBoxStyle = computed(() =>
    largeDrop.value ? { width: `${control.value.heightPx + 4}px`, height: `${control.value.heightPx + 4}px` } : {},
);

// The accents below read --focus-theme-color, which nothing set here, so they stayed blue under every colour preset.
const themeVars = computed(() => ({ '--focus-theme-color': getThemeHex(props.selectedTheme ?? 'blue') }) as Record<string, string>);

const emit = defineEmits<{
    update: [name: string, value: (File | string)[]];
}>();

const fileInputRef = ref<HTMLInputElement | null>(null);
const selectedFiles = ref<File[]>([]);
const previewUrls = ref<string[]>([]);
const initialPreviews = ref<string[]>([]);
const isDragging = ref(false);
const uploading = ref(false);
const uploadProgress = ref(0);
const viewingImage = ref<string | null>(null);
const uploadError = ref<string | null>(null);

const totalFileCount = computed(
    () => initialPreviews.value.length + selectedFiles.value.length,
);

const maxFiles = computed(() => props.field.fileConfig?.maxFiles || 0);

const remainingFiles = computed(() => {
    if (!maxFiles.value) return null;
    return Math.max(0, maxFiles.value - totalFileCount.value);
});

const canAddMore = computed(
    () =>
        isMultiple.value &&
        (!maxFiles.value || totalFileCount.value < maxFiles.value),
);

const getFileExt = (fileNameOrUrl: string): string => {
    if (!fileNameOrUrl) return '';
    const cleanName = fileNameOrUrl.split('?')[0].split('#')[0];
    const ext = cleanName.split('.').pop();
    return ext && ext !== cleanName ? ext.toUpperCase() : '';
};

const isPdf = (fileNameOrUrl: string): boolean => {
    return /\.pdf$/i.test(fileNameOrUrl);
};

const clearAllFiles = () => {
    previewUrls.value.forEach((p) => {
        if (p.startsWith('blob:')) URL.revokeObjectURL(p);
    });
    selectedFiles.value = [];
    previewUrls.value = [];
    initialPreviews.value = [];
    emit('update', props.field.name, []);
};

// Sync initial values from props.value (e.g. string URLs or array containing string URLs & File objects)
watch(
    () => props.value,
    (newVal) => {
        if (typeof newVal === 'string' && newVal.trim() !== '') {
            initialPreviews.value = [newVal];
        } else if (Array.isArray(newVal)) {
            // Keep all string URLs as initialPreviews so existing files stay visible when choosing new files
            const strings = newVal.filter(
                (v): v is string => typeof v === 'string' && v.trim() !== '',
            );
            initialPreviews.value = strings;
        } else {
            initialPreviews.value = [];
        }
    },
    { immediate: true, deep: true },
);

onMounted(() => {
    // Explicitly reset all local state when component is mounted (dialog opens)
    selectedFiles.value = [];
    previewUrls.value = [];
    uploadError.value = null;
});

onUnmounted(() => {
    // Cleanup Object URLs to prevent memory leaks
    previewUrls.value.forEach((url) => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
    });

    selectedFiles.value = [];
    previewUrls.value = [];
    initialPreviews.value = [];
});

const isImageUrl = (url: string) => {
    return (
        /\.(jpg|jpeg|png|gif|webp|svg)/i.test(url) || url.startsWith('blob:')
    );
};

const maxSizeMB = computed(() => props.field.fileConfig?.maxSize || 10);
const maxSizeBytes = computed(() => maxSizeMB.value * 1024 * 1024);
const isMultiple = computed(() => props.field.fileConfig?.multiple || false);
const isImageType = computed(() =>
    ['image', 'avatar'].includes(props.field.type),
);

const acceptedTypes = computed(() => {
    if (props.field.fileConfig?.accept) {
        return props.field.fileConfig.accept;
    }

    if (props.field.type === 'image' || props.field.type === 'avatar') {
        return 'image/png,image/jpeg,image/jpg,image/webp';
    }

    return '*';
});

const acceptLabel = computed(() => {
    if (props.field.fileConfig?.accept) {
        return props.field.fileConfig.accept
            .split(',')
            .map((t) => {
                const trimmed = t.trim();
                if (trimmed.startsWith('.'))
                    return trimmed.slice(1).toUpperCase();
                return trimmed.split('/')[1]?.toUpperCase() || trimmed;
            })
            .join(', ');
    }
    if (props.field.type === 'image' || props.field.type === 'avatar') {
        return 'PNG, JPG, WEBP';
    }
    return 'Any file type';
});

const triggerFileInput = () => {
    fileInputRef.value?.click();
};

const validateFile = (file: File): string | null => {
    if (file.size > maxSizeBytes.value) {
        return `File size exceeds ${maxSizeMB.value}MB`;
    }

    if (acceptedTypes.value !== '*') {
        const allowedTypes = acceptedTypes.value
            .split(',')
            .map((t) => t.trim().toLowerCase());
        const fileName = file.name.toLowerCase();
        const fileType = file.type.toLowerCase();
        const isMatch = allowedTypes.some((type) => {
            if (type.startsWith('.')) {
                return fileName.endsWith(type);
            } else if (type.endsWith('/*')) {
                return fileType.startsWith(type.slice(0, -2));
            } else {
                return fileType === type;
            }
        });
        if (!isMatch) {
            return `File type not allowed. Allowed types: ${acceptLabel.value}`;
        }
    } else if (isImageType.value && !file.type.startsWith('image/')) {
        return 'Only image files are allowed';
    }

    return null;
};

const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
        if (
            file.type.startsWith('image/') ||
            /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name) ||
            file.type === 'application/pdf' ||
            file.name.toLowerCase().endsWith('.pdf')
        ) {
            // Using URL.createObjectURL is faster and cleaner than FileReader for previews
            resolve(URL.createObjectURL(file));
        } else {
            resolve('');
        }
    });
};

const handleFileSelect = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const files = Array.from(target.files || []);
    await processFiles(files);
};

const handleDrop = async (event: DragEvent) => {
    isDragging.value = false;
    const files = Array.from(event.dataTransfer?.files || []);
    await processFiles(files);
};

const processFiles = async (files: File[]) => {
    uploadError.value = null;
    const validFiles: File[] = [];
    const previews: string[] = [];

    if (props.field.fileConfig?.maxFiles) {
        const totalCount =
            selectedFiles.value.length +
            initialPreviews.value.length +
            files.length;
        if (totalCount > props.field.fileConfig.maxFiles) {
            uploadError.value = `Maximum ${props.field.fileConfig.maxFiles} files allowed. Currently: ${selectedFiles.value.length + initialPreviews.value.length}, New: ${files.length}`;
            return;
        }
    }

    for (const file of files) {
        const fileError = validateFile(file);
        if (fileError) {
            uploadError.value = fileError;
            // Clear successful previews since this batch failed validation
            previews.forEach((p) => {
                if (p.startsWith('blob:')) URL.revokeObjectURL(p);
            });
            return; // Stop processing entirely if any file in the batch is invalid
        }

        validFiles.push(file);
        const preview = await createPreview(file);
        previews.push(preview);
    }

    if (isMultiple.value) {
        selectedFiles.value = [...selectedFiles.value, ...validFiles];
        previewUrls.value = [...previewUrls.value, ...previews];
    } else {
        previewUrls.value.forEach((p) => {
            if (p.startsWith('blob:')) URL.revokeObjectURL(p);
        });
        selectedFiles.value = validFiles.slice(0, 1);
        previewUrls.value = previews.slice(0, 1);
    }

    emit('update', props.field.name, [
        ...initialPreviews.value,
        ...selectedFiles.value,
    ]);

    if (fileInputRef.value) {
        fileInputRef.value.value = '';
    }
};

const removeFile = (index: number) => {
    const preview = previewUrls.value[index];
    if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
    }
    selectedFiles.value.splice(index, 1);
    previewUrls.value.splice(index, 1);
    emit('update', props.field.name, [
        ...initialPreviews.value,
        ...selectedFiles.value,
    ]);
};

const removeInitialFile = (index: number) => {
    initialPreviews.value.splice(index, 1);
    // Emit both the remaining initial URLs and the new files to the parent form
    emit('update', props.field.name, [
        ...initialPreviews.value,
        ...selectedFiles.value,
    ]);
};

const { openPreview } = useImagePreview();

const viewFile = (url: string, fileName?: string) => {
    openPreview(url, fileName);
};

const viewImage = (url: string, fileName?: string) => {
    openPreview(url, fileName);
};

const canPreviewNewFile = (index: number): boolean => {
    const file = selectedFiles.value[index];
    if (!file) return false;
    return isPreviewableFile(file, file.name);
};

const viewNewFile = (index: number) => {
    const file = selectedFiles.value[index];
    if (!file) return;
    let preview = previewUrls.value[index];
    if (
        !preview &&
        (isImageFile(file, file.name) || isPdfFile(file, file.name))
    ) {
        preview = URL.createObjectURL(file);
        previewUrls.value[index] = preview;
    }
    if (preview) {
        openPreview(preview, file.name);
    }
};

const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
