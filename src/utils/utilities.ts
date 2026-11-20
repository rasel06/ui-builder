import { h, type VNode } from 'vue';
import EntityAvatar, {
    type EntityAvatarProps,
} from '../components/EntityAvatar.vue';

export { EntityAvatar, type EntityAvatarProps };

export function renderEntityAvatar(
    srcOrOptions?: string | null | EntityAvatarProps,
    name?: string | null,
    theme?: any,
    extraOptions?: Partial<EntityAvatarProps>,
): VNode {
    if (
        srcOrOptions &&
        typeof srcOrOptions === 'object' &&
        !Array.isArray(srcOrOptions)
    ) {
        return h(EntityAvatar, srcOrOptions as EntityAvatarProps);
    }
    return h(EntityAvatar, {
        src: srcOrOptions as string | null | undefined,
        name: name || undefined,
        theme: theme || undefined,
        ...extraOptions,
    });
}

export {
    isImageFile,
    isPdfFile,
    isPreviewableFile,
    renderAttachmentsHtml,
    useImagePreview,
} from '../composables/useImagePreview';

export function diffForHumans(isoString: string | null | undefined) {
    if (!isoString) return '-';

    const date = new Date(isoString).getTime();
    if (isNaN(date)) return '-';

    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const now = new Date().getTime();

    const diffInSeconds = Math.round((date - now) / 1000);

    const units: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
        { unit: 'year', seconds: 31536000 },
        { unit: 'month', seconds: 2592000 },
        { unit: 'week', seconds: 604800 },
        { unit: 'day', seconds: 86400 },
        { unit: 'hour', seconds: 3600 },
        { unit: 'minute', seconds: 60 },
        { unit: 'second', seconds: 1 },
    ];

    for (const { unit, seconds } of units) {
        if (Math.abs(diffInSeconds) >= seconds || unit === 'second') {
            const value = Math.round(diffInSeconds / seconds);

            const rawString = rtf.format(value, unit);

            return rawString.replace(/\b\w/g, (char) => char.toUpperCase());
        }
    }

    return 'Just Now';
}

/**
 * Lets the host app take over date display (e.g. a configured date format/timezone) without ui-builder
 * importing anything from it. The formatter returns null to decline, which keeps the built-in output.
 */
let hostDateFormatter: ((date: string | Date) => string | null) | null = null;
export function setDateFormatter(fn: ((date: string | Date) => string | null) | null) {
    hostDateFormatter = fn;
}

export function formatDate(
    date: string | Date | null,
    options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    },
) {
    if (!date) return '-';
    const hosted = hostDateFormatter?.(date);
    if (hosted) return hosted;
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', options).format(d);
}
