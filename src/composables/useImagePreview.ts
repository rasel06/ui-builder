import axios from 'axios';
import { translate } from '../i18n';
import { ref } from 'vue';

export interface ImagePreviewData {
    url: string;
    fileName?: string;
}

const previewData = ref<ImagePreviewData | null>(null);

export const isImageFile = (att: any, fileName?: string): boolean => {
    if (!att) return false;
    if (typeof att === 'object') {
        const name = att.name || att.file_name || att.fileName || '';
        const type = att.type || att.file_type || att.mime_type || '';
        const path = att.file_path || att.url || '';
        if (type && typeof type === 'string' && type.startsWith('image/'))
            return true;
        if (type && typeof type === 'string' && type.includes('pdf'))
            return false;
        if (
            name &&
            typeof name === 'string' &&
            /\.(jpg|jpeg|png|gif|webp|svg|bmp)/i.test(name)
        )
            return true;
        if (
            path &&
            typeof path === 'string' &&
            /\.(jpg|jpeg|png|gif|webp|svg|bmp)/i.test(path)
        )
            return true;
        return false;
    }
    if (typeof att === 'string') {
        if (att.startsWith('data:image/')) return true;
        if (att.startsWith('data:')) return false;
        if (fileName && /\.pdf/i.test(fileName)) return false;
        if (/\.(jpg|jpeg|png|gif|webp|svg|bmp)/i.test(att)) return true;
        if (att.startsWith('blob:')) {
            if (fileName && /\.pdf/i.test(fileName)) return false;
            return true;
        }
        return false;
    }
    return false;
};

export const isPdfFile = (att: any, fileName?: string): boolean => {
    if (!att) return false;
    if (typeof att === 'object') {
        const name = att.name || att.file_name || att.fileName || '';
        const type = att.type || att.file_type || att.mime_type || '';
        const path = att.file_path || att.url || '';
        if (
            type &&
            typeof type === 'string' &&
            type.toLowerCase().includes('pdf')
        )
            return true;
        if (name && typeof name === 'string' && /\.pdf/i.test(name))
            return true;
        if (path && typeof path === 'string' && /\.pdf/i.test(path))
            return true;
        return false;
    }
    if (typeof att === 'string') {
        if (
            att.startsWith('data:application/pdf') ||
            att.toLowerCase().includes('pdf')
        )
            return true;
        if (/\.pdf/i.test(att)) return true;
        if (fileName && /\.pdf/i.test(fileName)) return true;
        return false;
    }
    return false;
};

export const isPreviewableFile = (att: any, fileName?: string): boolean => {
    return isImageFile(att, fileName) || isPdfFile(att, fileName);
};

function escapeAttr(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export const renderAttachmentsHtml = (
    attachments: any[],
    options: { deleteEndpointPrefix?: string } = {},
): string => {
    if (!attachments || !attachments.length) return '';

    let html =
        '<div class="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">';
    attachments.forEach((att: any) => {
        const filePath = typeof att === 'string' ? att : att.file_path;
        const fileName =
            typeof att === 'string'
                ? att.split('/').pop()
                : att.file_name || 'Attachment';
        const fileId = typeof att === 'object' ? att.id : null;
        const safeUrl =
            filePath.startsWith('/') || filePath.startsWith('http')
                ? filePath
                : `/storage/${filePath}`;
        const safeName = escapeAttr(fileName || '');
        const ext = (fileName || '').split('.').pop()?.toUpperCase() || 'FILE';
        const isImg = isImageFile(att);
        const isPdf = isPdfFile(att);
        const canPreview = isImg || isPdf;

        html += `<div class="group relative flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/80 p-2 shadow-2xs transition-all hover:border-slate-300 hover:bg-white dark:border-slate-700/80 dark:bg-slate-800/60 dark:hover:border-slate-600 dark:hover:bg-slate-800">`;
        html += `<div class="flex min-w-0 flex-1 items-center gap-2.5">`;
        html += `<div class="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 ${canPreview ? 'cursor-pointer transition-opacity hover:opacity-80' : ''}" ${canPreview ? `data-ub-preview-url="${escapeAttr(safeUrl)}" data-ub-preview-name="${safeName}"` : ''} title="${canPreview ? 'Click to preview' : ''}">`;

        if (isImg) {
            html += `<img src="${safeUrl}" class="h-full w-full object-cover" alt="${safeName}"/>`;
        } else if (isPdf || ext === 'PDF') {
            html += `<svg class="h-4 w-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>`;
        } else {
            html += `<svg class="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>`;
        }
        html += `</div>`;

        html += `<div class="min-w-0 flex-1 pr-2">`;
        html += `<p class="truncate text-xs font-semibold leading-tight text-slate-800 dark:text-slate-200" title="${safeName}">${safeName}</p>`;
        html += `<span class="text-[10px] font-medium text-slate-400 uppercase">${ext}</span>`;
        html += `</div>`;
        html += `</div>`;

        html += `<div class="flex items-center gap-1 shrink-0">`;
        if (canPreview) {
            html += `<button type="button" data-ub-preview-url="${escapeAttr(safeUrl)}" data-ub-preview-name="${safeName}" class="no-print shrink-0 cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-700 dark:hover:text-blue-400" title="Preview File"><svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg></button>`;
        }
        html += `<a href="${safeUrl}" target="_blank" download class="no-print shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-700 dark:hover:text-blue-400" title="Download Attachment"><svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg></a>`;

        // Delete is offered only when the caller says where attachments are deleted.
        const deletePrefix = options.deleteEndpointPrefix;
        if (fileId && deletePrefix) {
            html += `<button type="button" data-ub-delete-url="${escapeAttr(`${deletePrefix}/${fileId}`)}" class="no-print shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 cursor-pointer" title="Delete Attachment"><svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>`;
        }
        html += `</div>`;
        html += `</div>`;
    });
    html += '</div>';
    return html;
};

export const useImagePreview = () => {
    const openPreview = (filePathOrUrl: string, fileName?: string) => {
        if (!filePathOrUrl) return;
        const url =
            filePathOrUrl.startsWith('/') ||
            filePathOrUrl.startsWith('http') ||
            filePathOrUrl.startsWith('blob:') ||
            filePathOrUrl.startsWith('data:')
                ? filePathOrUrl
                : `/storage/${filePathOrUrl}`;

        previewData.value = {
            url,
            fileName: fileName || url.split('/').pop() || 'File Preview',
        };
    };

    const closePreview = () => {
        previewData.value = null;
    };

    return {
        previewData,
        isImageFile,
        isPdfFile,
        isPreviewableFile,
        openPreview,
        closePreview,
    };
};

// renderAttachmentsHtml() returns plain HTML (table cells render it with v-html), so its buttons carry
// data attributes and one document-level listener acts on them: no window globals, no inline handlers.
let attachmentClicksInstalled = false;

function installAttachmentClicks() {
    if (attachmentClicksInstalled || typeof document === 'undefined') return;
    attachmentClicksInstalled = true;

    document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement | null;

        const preview = target?.closest<HTMLElement>('[data-ub-preview-url]');
        if (preview) {
            useImagePreview().openPreview(preview.dataset.ubPreviewUrl || '', preview.dataset.ubPreviewName);
            return;
        }

        const remove = target?.closest<HTMLElement>('[data-ub-delete-url]');
        if (remove && window.confirm(translate('ui-builder.attachment_delete_confirm'))) {
            axios
                .delete(remove.dataset.ubDeleteUrl || '')
                .then(() => remove.closest('.group')?.remove())
                .catch(() => window.alert(translate('ui-builder.attachment_delete_failed')));
        }
    });
}

installAttachmentClicks();
