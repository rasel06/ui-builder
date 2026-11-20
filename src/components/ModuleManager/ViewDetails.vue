<script setup lang="ts">
import { Badge } from '../../primitives/badge';
import { Paperclip } from '@lucide/vue';
import { resolveFieldLabel, resolveLabel } from '../../i18n';
import { computed } from 'vue';
import type { FormField, ModuleConfig } from '../../types/module';
import { gridWidthClass } from '../../utils/sizing';
import { formatDate } from '../../utils/utilities';

interface Props {
    config: ModuleConfig;
    row: Record<string, any>;
    theme?: any;
}

const props = defineProps<Props>();

const visibleFields = computed(() => {
    const { viewFields, formFields } = props.config;

    if (!viewFields) return formFields;

    const { showAll, fields, except } = viewFields;

    let displayFields: FormField[] = [];

    if (showAll === true) {
        const rowKeys = Object.keys(props.row);
        displayFields = rowKeys.map((key) => {
            const existingField = formFields.find((f) => f.name === key);
            if (existingField) return existingField;

            return {
                name: key,
                label: key
                    .split('_')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' '),
                type: 'text',
            } as FormField;
        });
    } else if (fields && fields.length > 0) {
        displayFields = fields.map((fieldName) => {
            const existingField = formFields.find((f) => f.name === fieldName);
            if (existingField) return existingField;

            return {
                name: fieldName,
                label: fieldName
                    .split('_')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' '),
                type: 'text',
            } as FormField;
        });
    } else {
        displayFields = [...formFields];
    }

    if (except && except.length > 0) {
        displayFields = displayFields.filter((f) => !except.includes(f.name));
    }

    return displayFields;
});

const resolvePath = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const getFieldValue = (field: FormField) => {
    const { viewFields } = props.config;
    let value = props.row[field.name];

    if (viewFields?.format) {
        const formatConfig = viewFields.format.find(
            (f) => f.key === field.name,
        );
        if (formatConfig) {
            if (typeof formatConfig.data === 'function') {
                value = formatConfig.data(props.row);
            } else {
                value = resolvePath(props.row, formatConfig.data as string);
            }

            // Auto-format if type is date and it's not already formatted by the function
            if (
                formatConfig.type === 'date' &&
                (typeof value === 'string' || value instanceof Date)
            ) {
                value = formatDate(value);
            }
        }
    }

    if (value === null || value === undefined || value === '') {
        // Special case: 0 is a valid value
        if (value === 0 || value === '0') return value;
        return '-';
    }

    if (field.type === 'switch') {
        const onLabel = field.switchConfig?.onLabel || 'Active';
        const offLabel = field.switchConfig?.offLabel || 'Inactive';
        const onValue = field.switchConfig?.onValue ?? true;

        return value === onValue ? onLabel : offLabel;
    }

    if (
        (field.type === 'select' ||
            field.type === 'radio' ||
            field.type === 'vue-select') &&
        field.options
    ) {
        const option = field.options.find((opt) => {
            if (typeof opt === 'object') return opt.value === value;
            return opt === value;
        });

        if (option) {
            return typeof option === 'object' ? resolveLabel(option.label) : option;
        }
    }

    return value;
};

const MEDIA_FIELD_TYPES = ['image', 'avatar', 'file'];

const IMAGE_EXTENSION = /\.(jpe?g|png|gif|webp|svg|bmp|avif|ico)(\?.*)?$/i;

// Typed loosely like the rest of this file's field handling — `formFields` is a
// FormFieldItem union that also covers layout nodes, which carry no `name`/`type`.
const isMediaField = (field: any) =>
    MEDIA_FIELD_TYPES.includes(field?.type as string);

/**
 * Stored paths differ per module — Spatie media and the plain Storage-disk uploads
 * (brand logo, campaign banner, staff photo) hand back '/storage/...', while a raw
 * ->store() path has no leading slash at all.
 */
const toMediaUrl = (raw: string) => {
    if (/^(https?:|data:|blob:)/i.test(raw)) return raw;
    return raw.startsWith('/') ? raw : `/storage/${raw}`;
};

const toMediaItem = (item: any, field: any) => {
    if (!item) return null;

    let url: any = item;
    let name: string | undefined;

    if (typeof item === 'object') {
        url = item.url ?? item.path ?? item.file_path ?? item.src ?? null;
        name = item.name ?? item.file_name ?? undefined;
    }

    if (typeof url !== 'string' || url === '') return null;

    const resolved = toMediaUrl(url);

    return {
        url: resolved,
        name: name || resolved.split('/').pop() || '',
        // 'image'/'avatar' fields are images by definition; a 'file' field holds
        // whatever was uploaded, so fall back to sniffing the extension.
        isImage: field.type !== 'file' || IMAGE_EXTENSION.test(resolved),
    };
};

/**
 * A media field's display value lives in `getValue` (the same hook the edit dialog
 * hydrates from — e.g. Products maps the row's `image_url` onto its `image` field),
 * so read that first and only then the raw column.
 */
const mediaItems = computed(() => {
    const map: Record<string, Array<{ url: string; name: string; isImage: boolean }>> = {};

    (visibleFields.value as any[]).filter(isMediaField).forEach((field: any) => {
        const value = field.getValue
            ? field.getValue(props.row)
            : props.row[field.name];

        const list = Array.isArray(value) ? value : [value];

        map[field.name] = list
            .map((item) => toMediaItem(item, field))
            .filter((item): item is { url: string; name: string; isImage: boolean } => item !== null);
    });

    return map;
});

const onMediaError = (event: Event) => {
    const img = event.target as HTMLImageElement;
    if (img.src.endsWith('/images/placeholder.jpg')) return;
    img.src = '/images/placeholder.jpg';
};

// Same 12-column widths as the forms (utils/sizing.ts); a field with no width takes half the row.
const getFieldWidth = (field: FormField) => {
    let width = field.width;
    if (typeof width === 'function') {
        width = width(true, undefined);
    }
    return gridWidthClass((width as string) || '1/2');
};

const isBadgeField = (field: FormField) => {
    return field.type === 'switch' || field.name === 'status';
};

const getBadgeVariant = (field: FormField, value: any) => {
    if (field.type === 'switch') {
        const onValue = field.switchConfig?.onValue ?? true;
        return value === onValue ? 'default' : 'secondary';
    }

    if (field.name === 'status') {
        return value === 'active' || value === 'published'
            ? 'default'
            : 'secondary';
    }

    return 'outline';
};
</script>

<template>
    <div class="@container">
    <div class="grid grid-cols-12 gap-x-6 gap-y-4 py-4">
        <div
            v-for="field in visibleFields"
            :key="field.name"
            :class="getFieldWidth(field)"
            class="flex flex-col space-y-1"
        >
            <span
                class="text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400"
            >
                {{ resolveFieldLabel(field) }}
            </span>

            <div class="text-sm text-gray-900 dark:text-gray-100">
                <Badge
                    v-if="isBadgeField(field)"
                    :variant="getBadgeVariant(field, row[field.name])"
                    class="capitalize"
                >
                    {{ getFieldValue(field) }}
                </Badge>
                <div
                    v-else-if="
                        config.viewFields?.format?.find(
                            (f) => f.key === field.name,
                        )?.type === 'html'
                    "
                    class="prose prose-sm dark:prose-invert max-w-none break-words"
                    v-html="getFieldValue(field)"
                ></div>
                <div
                    v-else-if="isMediaField(field)"
                    class="flex flex-wrap items-center gap-2 pt-1"
                >
                    <a
                        v-for="(item, index) in mediaItems[field.name] || []"
                        :key="`${field.name}-${index}`"
                        :href="item.url"
                        target="_blank"
                        rel="noopener"
                        class="block"
                        :title="item.name"
                    >
                        <img
                            v-if="item.isImage"
                            :src="item.url"
                            :alt="item.name"
                            class="h-24 w-24 rounded-md border border-gray-200 object-cover transition-opacity hover:opacity-80 dark:border-gray-700"
                            @error="onMediaError"
                        />
                        <span
                            v-else
                            class="inline-flex max-w-[16rem] items-center gap-1 truncate rounded-md border border-gray-200 px-2 py-1 text-xs font-medium hover:underline dark:border-gray-700"
                        >
                            <Paperclip class="h-3.5 w-3.5 shrink-0" />
                            {{ item.name }}
                        </span>
                    </a>
                    <span
                        v-if="!(mediaItems[field.name] || []).length"
                        class="font-medium"
                        >-</span
                    >
                </div>
                <div
                    v-else-if="field.type === 'textarea'"
                    class="leading-relaxed whitespace-pre-wrap"
                >
                    {{ getFieldValue(field) }}
                </div>
                <div v-else class="font-medium">
                    {{ getFieldValue(field) }}
                </div>
            </div>
        </div>
    </div>
    </div>
</template>
