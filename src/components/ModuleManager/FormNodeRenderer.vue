<template>
    <!-- ── GROUP NODE ────────────────────────────────── -->
    <template v-if="isGroupNode(node)">
        <div
            :class="[getGroupWidth(node.width), 'flex flex-col']"
            :style="
                node.headerOffset && node.card === false
                    ? { paddingTop: '45px' }
                    : {}
            "
        >
            <!-- Card mode (default: card !== false) -->
            <div
                v-if="node.card !== false"
                :class="
                    cn(
                        'overflow-hidden rounded-lg border [&>*]:mb-0!',
                        resolveTheme(node).cardBackground,
                        resolveTheme(node).cardBorder,
                        node.class ?? '',
                    )
                "
            >
                <div
                    v-if="node.title"
                    :class="[
                        'border-b text-sm font-semibold tracking-wide',
                        cardHeaderPaddingClass,
                        resolveTheme(node).headerBackground,
                        resolveTheme(node).headerText,
                        resolveTheme(node).cardBorder,
                    ]"
                >
                    {{ resolveLabel(node.title) }}
                </div>

                <div
                    :class="
                        cn(
                            'grid w-full grid-cols-12',
                            cardBodyGridClass,
                            node.bodyClass,
                        )
                    "
                >
                    <FormNodeRenderer
                        v-for="(child, fi) in node.fields"
                        :key="
                            (isGroupNode(child) ? 'group_' + fi : child.name) ||
                            fi
                        "
                        :node="child"
                        :form="form"
                        :is-editing="isEditing"
                        :readonly="readonly"
                        :all-flat-fields="allFlatFields"
                        :applied-theme="resolveTheme(node)"
                        :selected-theme="resolveThemeName(node)"
                        :density="density"
                        @change="handleChange"
                        @file-change="handleFileChange"
                    />
                </div>
            </div>

            <!-- Transparent mode (card: false) — no border, no title, no background -->
            <div
                v-else
                :class="
                    cn(
                        'grid w-full grid-cols-12 gap-x-4 gap-y-4',
                        node.class ?? '',
                    )
                "
            >
                <FormNodeRenderer
                    v-for="(child, fi) in node.fields"
                    :key="
                        (isGroupNode(child) ? 'group_' + fi : child.name) || fi
                    "
                    :node="child"
                    :form="form"
                    :is-editing="isEditing"
                    :readonly="readonly"
                    :all-flat-fields="allFlatFields"
                    :applied-theme="resolveTheme(node)"
                    :selected-theme="resolveThemeName(node)"
                    @change="handleChange"
                    @file-change="handleFileChange"
                />
            </div>
        </div>
    </template>

    <!-- ── PLAIN FIELD (no group) ────────────────────── -->
    <template v-else>
        <div :class="getFieldWidth(node as FormFieldType)">
            <SwitchField
                v-if="isSwitchField(node as FormFieldType)"
                :field="node as FormFieldType"
                :value="getFieldValue(node as FormFieldType)"
                :error="getFieldError(node as FormFieldType)"
                :theme="appliedTheme"
                :selected-theme="selectedTheme"
                :readonly="readonly"
                @update="handleChange"
            />
            <FileUploadField
                v-else-if="isFileField(node as FormFieldType)"
                :field="node as FormFieldType"
                :value="getFieldValue(node as FormFieldType)"
                :error="getFieldError(node as FormFieldType)"
                :size="getFieldSize(node as FormFieldType)"
                :theme="appliedTheme"
                :selected-theme="selectedTheme"
                :readonly="readonly"
                @update="handleFileChange"
            />
            <CheckAllField
                v-else-if="(node as FormFieldType).type === 'check-all'"
                :field="node as FormFieldType"
                :value="getFieldValue(node as FormFieldType)"
                :size="getFieldSize(node as FormFieldType)"
                :theme="appliedTheme"
                :selected-theme="selectedTheme"
                :form="form"
                :all-fields="allFlatFields"
                @update="handleChange"
            />
            <component
                :is="(node as FormFieldType).component"
                v-else-if="
                    (node as FormFieldType).type === 'component' &&
                    (node as FormFieldType).component
                "
                :form="form"
                :field="node as FormFieldType"
                :theme="appliedTheme"
                :selected-theme="selectedTheme"
                :is-editing="isEditing"
                v-bind="resolveComponentProps(node as FormFieldType)"
            />
            <FormField
                v-else
                :field="node as FormFieldType"
                :value="getFieldValue(node as FormFieldType)"
                :error="getFieldError(node as FormFieldType)"
                :size="getFieldSize(node as FormFieldType)"
                :theme="appliedTheme"
                :selected-theme="selectedTheme"
                :form-data="form.data"
                :form="form"
                :readonly="readonly"
                @update="handleChange"
            />
        </div>
    </template>
</template>

<script setup lang="ts">
import { resolveLabel } from '../../i18n';
import { cn } from '../../lib/utils';
import { usePage } from '../../adapters/inertia';
import { readPageProps } from '../../adapters/pageProps';
import { computed } from 'vue';
import { getTheme } from '../../composables/themes';
import type {
    FormFieldItem,
    FormField as FormFieldType,
    GridWidth,
} from '../../types/module';
import { isGroupNode } from '../../types/module';
import { gridWidthClass } from '../../utils/sizing';
import CheckAllField from './CheckAllField.vue';
import FileUploadField from './FileUploadField.vue';
import FormField from './FormField.vue';
import SwitchField from './SwitchField.vue';

// Use the component recursively
import FormNodeRenderer from './FormNodeRenderer.vue';

interface Props {
    node: FormFieldItem;
    form: any;
    isEditing: boolean;
    readonly: boolean;
    allFlatFields: FormFieldType[];
    appliedTheme: any;
    selectedTheme: string;
    density?: 'compact' | 'normal' | 'relaxed';
}

const props = withDefaults(defineProps<Props>(), {
    density: 'normal',
});
const emit = defineEmits(['change', 'file-change']);

const page = usePage();

// ─── Theme ───────────────────────────────────────────────────────────────────

const resolveTheme = (item: FormFieldItem) => {
    if (isGroupNode(item) && item.theme) {
        return getTheme(item.theme);
    }
    return props.appliedTheme;
};

const resolveThemeName = (item: FormFieldItem) => {
    if (isGroupNode(item) && item.theme) {
        return item.theme;
    }
    return props.selectedTheme;
};

// ─── Width helpers ───────────────────────────────────────────────────────────


const getFieldWidth = (field: FormFieldType): string => {
    let width = field.width;
    if (typeof width === 'function') {
        const auth = readPageProps(page).auth;
        width = width(props.isEditing, props.form.data, { auth });
    }
    return gridWidthClass(width as string);
};

const getGroupWidth = (width?: GridWidth): string => gridWidthClass(width);

const resolveComponentProps = (field: FormFieldType): Record<string, any> => {
    return typeof field.componentProps === 'function'
        ? field.componentProps(props.form.data, props.form)
        : field.componentProps || {};
};

const cardHeaderPaddingClass = computed(() => {
    if (props.density === 'compact') return 'px-3 py-1.5';
    if (props.density === 'relaxed') return 'px-6 py-4';
    return 'px-4 py-2.5';
});

const cardBodyGridClass = computed(() => {
    if (props.density === 'compact')
        return 'gap-x-3 gap-y-2.5 px-3 pt-2.5 pb-3';
    if (props.density === 'relaxed') return 'gap-x-6 gap-y-6 px-6 pt-5 pb-6';
    return 'gap-x-4 gap-y-4 px-4 pt-3.5 pb-4';
});

const getFieldSize = (field: FormFieldType): string => {
    const defaultSize =
        props.density === 'compact'
            ? 'sm'
            : props.density === 'relaxed'
              ? 'lg'
              : 'md';
    // A token or raw Tailwind classes; FormField resolves either through utils/sizing.ts.
    return field.size || defaultSize;
};

// ─── Field helpers ────────────────────────────────────────────────────────────

const isSwitchField = (field: FormFieldType): boolean =>
    field.type === 'switch';

const isFileField = (field: FormFieldType): boolean =>
    ['file', 'image', 'avatar'].includes(field.type);

// ─── Form value helpers ───────────────────────────────────────────────────────

const getFieldValue = (field: FormFieldType): any => {
    let value = props.form.data[field.name as string];

    if (field.type === 'date' && value) {
        if (typeof value === 'string') {
            if (value.includes('T')) {
                value = value.split('T')[0];
            } else if (value.includes(' ')) {
                value = value.split(' ')[0];
            }
        } else if (value instanceof Date) {
            value = value.toISOString().split('T')[0];
        }
    }

    if (field.type === 'datetime-local' && value) {
        if (typeof value === 'string') {
            const tIndex = value.indexOf('T');
            if (tIndex !== -1) {
                value = value.substring(0, tIndex + 6); // Keep YYYY-MM-DDTHH:MM
            } else if (value.includes(' ')) {
                value = value.replace(' ', 'T').substring(0, 16);
            }
        } else if (value instanceof Date) {
            value = value.toISOString().substring(0, 16);
        }
    }

    if (
        field.type === 'vue-select' &&
        (typeof value === 'number' ||
            typeof value === 'string' ||
            value === null)
    ) {
        const relationName =
            field.relationName ||
            (field.name && field.name.endsWith('_id')
                ? field.name.replace(/_id$/, '')
                : '');
        if (relationName) {
            const relationData = props.form.data[relationName];
            if (relationData && typeof relationData === 'object') {
                return relationData;
            }
        }
    }

    if (
        field.defaultValue !== undefined &&
        (value === undefined || value === null || value === '')
    ) {
        return field.defaultValue;
    }

    if (value !== undefined && value !== null && value !== '') {
        return value;
    }

    if (value === 0 || value === '0') return value;

    if (field.type === 'checkbox') return [];

    return '';
};

const getFieldError = (field: FormFieldType): string | undefined => {
    if (!field.name) return undefined;
    return props.form.errors[field.name];
};

// ─── Event handlers ───────────────────────────────────────────────────────────

const handleChange = (name: string, value: any) => {
    emit('change', name, value);
};

const handleFileChange = (name: string, files: any) => {
    emit('file-change', name, files);
};
</script>
