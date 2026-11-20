<template>
    <form
        autocomplete="off"
        @submit.prevent="handleSubmit"
        class="@container flex flex-col"
        :style="{ '--focus-theme-color': getThemeHex(selectedTheme) }"
    >
        <FormErrors
            v-if="hasErrors"
            :errors="form.errors"
            :theme="appliedTheme"
        />

        <div class="flex-grow">
            <!-- ══════════════════════════════════════════════════════
                 UNIFIED RENDERER  (used when any item is a group node)
                 ══════════════════════════════════════════════════════ -->
            <div
                v-if="hasGroupNodes"
                :class="['grid w-full grid-cols-12', gridGroupGapClass]"
            >
                <FormNodeRenderer
                    v-for="(item, idx) in processedItems"
                    :key="
                        (isGroupNode(item) ? 'group_' + idx : item.name) || idx
                    "
                    :node="item"
                    :form="form"
                    :is-editing="isEditing"
                    :readonly="readonly"
                    :all-flat-fields="allFlatFields"
                    :applied-theme="appliedTheme"
                    :selected-theme="selectedTheme"
                    :density="density"
                    @change="handleChange"
                    @file-change="handleFileChange"
                />
            </div>

            <!-- ══════════════════════════════════════════════════════
                 FLAT GRID LAYOUT (no group nodes)
                 ══════════════════════════════════════════════════════ -->
            <div
                v-else-if="useGridLayout"
                :class="[
                    'grid w-full grid-cols-12',
                    gridGapClass,
                    props.dnd ? '' : '',
                ]"
            >
                <div
                    v-for="(field, index) in localFields"
                    :key="field.name || index"
                    :class="[
                        getFieldWidth(field),
                        field.type === 'checkbox' &&
                        field.orientation === 'vertical'
                            ? 'mb-4'
                            : '',
                        props.dnd
                            ? cn(
                                  'group relative flex cursor-move items-center space-x-3 rounded-lg border bg-white dark:bg-neutral-900 shadow-sm transition-all',
                                  appliedTheme.cardBorder,
                                  getDensityClasses(),
                                  getHoverClasses(),
                              )
                            : '',
                    ]"
                    :draggable="props.dnd"
                    @dragstart="handleDragStart(index)"
                    @dragover.prevent
                    @drop="handleDrop(index)"
                >
                    <div
                        v-if="props.dnd"
                        class="flex h-full flex-shrink-0 cursor-grab items-center active:cursor-grabbing"
                        :title="resolveLabel('ui-builder.drag_to_reorder')"
                    >
                        <GripVertical
                            class="group-hover:text-primary-500 h-5 w-5 text-gray-400 dark:text-neutral-400 transition-colors"
                        />
                    </div>

                    <div class="flex-1 space-y-2">
                        <SwitchField
                            v-if="isSwitchField(field)"
                            :field="field"
                            :value="getFieldValue(field)"
                            :error="getFieldError(field)"
                            :theme="appliedTheme"
                            :selected-theme="selectedTheme"
                            :readonly="readonly"
                            @update="handleChange"
                        />
                        <FileUploadField
                            v-else-if="isFileField(field)"
                            :field="field"
                            :value="getFieldValue(field)"
                            :error="getFieldError(field)"
                            :size="getFieldSize(field)"
                            :theme="appliedTheme"
                            :selected-theme="selectedTheme"
                            :readonly="readonly"
                            @update="handleFileChange"
                        />
                        <CheckAllField
                            v-else-if="field.type === 'check-all'"
                            :field="field"
                            :value="getFieldValue(field)"
                            :size="getFieldSize(field)"
                            :theme="appliedTheme"
                            :selected-theme="selectedTheme"
                            :form="form"
                            :all-fields="localFields"
                            @update="handleChange"
                        />
                        <component
                            :is="field.component"
                            v-else-if="field.type === 'component' && field.component"
                            :form="form"
                            :field="field"
                            :theme="appliedTheme"
                            :selected-theme="selectedTheme"
                            :is-editing="isEditing"
                            v-bind="resolveComponentProps(field)"
                        />
                        <FormField
                            v-else
                            :field="field"
                            :value="getFieldValue(field)"
                            :error="getFieldError(field)"
                            :size="getFieldSize(field)"
                            :theme="appliedTheme"
                            :selected-theme="selectedTheme"
                            :form-data="form.data"
                            :form="form"
                            :row="row"
                            :readonly="readonly"
                            @update="handleChange"
                        />
                    </div>
                </div>
            </div>

            <!-- ══════════════════════════════════════════════════════
                 STACK LAYOUT (useGridLayout=false, no group nodes)
                 ══════════════════════════════════════════════════════ -->
            <div v-else class="mt-2 w-full space-y-6">
                <div
                    v-for="(field, index) in localFields"
                    :key="field.name || index"
                    :class="[
                        field.type === 'checkbox' &&
                        field.orientation === 'vertical'
                            ? 'mt-4 mb-4'
                            : '',
                        props.dnd
                            ? cn(
                                  'group relative flex cursor-move items-center space-x-3 rounded-lg border bg-white dark:bg-neutral-900 shadow-sm transition-all',
                                  appliedTheme.cardBorder,
                                  getDensityClasses(),
                                  getHoverClasses(),
                              )
                            : '',
                    ]"
                    :draggable="props.dnd"
                    @dragstart="handleDragStart(index)"
                    @dragover.prevent
                    @drop="handleDrop(index)"
                >
                    <div
                        v-if="props.dnd"
                        class="flex h-full flex-shrink-0 cursor-grab items-center active:cursor-grabbing"
                        :title="resolveLabel('ui-builder.drag_to_reorder')"
                    >
                        <GripVertical
                            class="group-hover:text-primary-500 h-5 w-5 text-gray-400 dark:text-neutral-400 transition-colors"
                        />
                    </div>

                    <div class="flex-1 space-y-2">
                        <SwitchField
                            v-if="isSwitchField(field)"
                            :field="field"
                            :value="getFieldValue(field)"
                            :error="getFieldError(field)"
                            :theme="appliedTheme"
                            :selected-theme="selectedTheme"
                            :readonly="readonly"
                            @update="handleChange"
                        />
                        <FileUploadField
                            v-else-if="isFileField(field)"
                            :field="field"
                            :value="getFieldValue(field)"
                            :error="getFieldError(field)"
                            :size="getFieldSize(field)"
                            :theme="appliedTheme"
                            :selected-theme="selectedTheme"
                            :readonly="readonly"
                            @update="handleFileChange"
                        />
                        <CheckAllField
                            v-else-if="field.type === 'check-all'"
                            :field="field"
                            :value="getFieldValue(field)"
                            :size="getFieldSize(field)"
                            :theme="appliedTheme"
                            :selected-theme="selectedTheme"
                            :form="form"
                            :all-fields="localFields"
                            @update="handleChange"
                        />
                        <component
                            :is="field.component"
                            v-else-if="field.type === 'component' && field.component"
                            :form="form"
                            :field="field"
                            :theme="appliedTheme"
                            :selected-theme="selectedTheme"
                            :is-editing="isEditing"
                            v-bind="resolveComponentProps(field)"
                        />
                        <FormField
                            v-else
                            :field="field"
                            :value="getFieldValue(field)"
                            :error="getFieldError(field)"
                            :size="getFieldSize(field)"
                            :theme="appliedTheme"
                            :selected-theme="selectedTheme"
                            :form-data="form.data"
                            :form="form"
                            :row="row"
                            :readonly="readonly"
                            @update="handleChange"
                        />
                    </div>
                </div>
            </div>
        </div>
    </form>
</template>

<script setup lang="ts">
import { resolveLabel } from '../../i18n';
import { cn } from '../../lib/utils';
import { usePage } from '../../adapters/inertia';
import { readPageProps } from '../../adapters/pageProps';
import { GripVertical } from '@lucide/vue';
import { computed, ref, watch } from 'vue';
import { getTheme, getThemeHex } from '../../composables/themes';
import type {
    FormFieldItem,
    FormField as FormFieldType,
    GridWidth,
    InputSize,
    ThemeConfig,
} from '../../types/module';
import { flattenFormFields, isGroupNode } from '../../types/module';
import { gridWidthClass } from '../../utils/sizing';
import CheckAllField from './CheckAllField.vue';
import FileUploadField from './FileUploadField.vue';
import FormErrors from './FormErrors.vue';
import FormField from './FormField.vue';
import FormNodeRenderer from './FormNodeRenderer.vue';
import SwitchField from './SwitchField.vue';

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
    fields: FormFieldItem[];
    form: any;
    isEditing?: boolean;
    submitLabel?: string;
    defaultInputSize?: InputSize;
    useGridLayout?: boolean;
    theme?: Partial<ThemeConfig>;
    selectedTheme?: string;
    readonly?: boolean;
    row?: any;
    dnd?: boolean;
    density?: 'tight' | 'normal' | 'loose' | 'compact' | 'relaxed';
}

const props = withDefaults(defineProps<Props>(), {
    isEditing: false,
    defaultInputSize: 'md',
    useGridLayout: true,
    theme: () => ({}),
    selectedTheme: 'default',
    readonly: false,
    dnd: false,
    density: 'normal',
});

const emit = defineEmits<{ submit: [] }>();

// ─── Theme ───────────────────────────────────────────────────────────────────

const appliedTheme = computed(() => {
    const baseTheme = getTheme(props.selectedTheme);
    return { ...baseTheme, ...props.theme };
});

const resolveTheme = (item: FormFieldItem) => {
    if (isGroupNode(item) && item.theme) {
        return getTheme(item.theme);
    }
    return appliedTheme.value;
};

const resolveThemeName = (item: FormFieldItem) => {
    if (isGroupNode(item) && item.theme) {
        return item.theme;
    }
    return props.selectedTheme;
};

// ─── Width helpers ───────────────────────────────────────────────────────────


const getFieldWidth = (field: FormFieldType): string => {
    if (!props.useGridLayout) return '';
    let width = field.width;
    if (typeof width === 'function') {
        const auth = readPageProps(page).auth;
        width = width(props.isEditing, props.row ?? props.form.data, {
            auth,
        });
    }
    return gridWidthClass(width as string);
};

const getGroupWidth = (width?: GridWidth): string => gridWidthClass(width);

const resolveComponentProps = (field: FormFieldType): Record<string, any> => {
    const row = props.row ?? props.form.data;
    return typeof field.componentProps === 'function'
        ? field.componentProps(row, props.form)
        : field.componentProps || {};
};

// ─── Group detection ─────────────────────────────────────────────────────────

/** True when at least one item in `fields` is a FormGroupNode. */
const hasGroupNodes = computed(() => props.fields.some(isGroupNode));

import { evaluateVisibility } from '../../utils/fieldUtils';

const page = usePage();

/**
 * Processed items for the unified renderer:
 * - Group nodes have their inner fields filtered for visibility.
 * - Plain fields are filtered for visibility.
 * - Groups with zero visible fields are omitted entirely.
 */
const filterItemsRecursively = (
    items: FormFieldItem[],
    row: any,
    auth: any,
): FormFieldItem[] => {
    return items
        .map((item): FormFieldItem | null => {
            if (isGroupNode(item)) {
                if (!evaluateVisibility(item, props.isEditing, row, auth))
                    return null;
                const visibleFields = filterItemsRecursively(
                    item.fields,
                    row,
                    auth,
                );
                if (visibleFields.length === 0) return null;
                return { ...item, fields: visibleFields as FormFieldItem[] };
            }

            // Plain field
            if (!evaluateVisibility(item, props.isEditing, row, auth))
                return null;
            return {
                ...item,
                required:
                    typeof (item as FormFieldType).required === 'function'
                        ? ((item as FormFieldType).required as Function)(
                              props.isEditing,
                              row,
                              { auth },
                          )
                        : !!(item as FormFieldType).required,
                keyOptions:
                    typeof (item as FormFieldType).keyOptions === 'function'
                        ? ((item as FormFieldType).keyOptions as Function)(
                              props.isEditing,
                              row,
                              { auth },
                          )
                        : (item as FormFieldType).keyOptions,
                readonly:
                    typeof (item as FormFieldType).readonly === 'function'
                        ? ((item as FormFieldType).readonly as Function)(
                              props.isEditing,
                              row,
                              { auth },
                          )
                        : (item as FormFieldType).readonly,
                options:
                    typeof (item as any).options === 'function'
                        ? ((item as any).options as Function)(
                              props.isEditing,
                              row,
                              { auth },
                          )
                        : (item as FormFieldType).options,
            };
        })
        .filter((i): i is FormFieldItem => i !== null);
};

const processedItems = computed((): FormFieldItem[] => {
    // A custom-action dialog passes the real parent row (a product, an order, …)
    // separately from `form.data`, which only ever holds this panel's own declared
    // fields — falling back to it keeps the main create/edit dialog (which has no
    // separate `row` prop) working exactly as before.
    const row = props.row ?? props.form.data;
    const auth = readPageProps(page).auth;
    return filterItemsRecursively(props.fields, row, auth);
});

/** All flat fields across groups + ungrouped (for CheckAllField & helpers). */
const allFlatFields = computed(() =>
    flattenFormFields(processedItems.value as FormFieldItem[]),
);

// ─── Flat-layout fields (used when there are NO group nodes) ─────────────────

const visibleFields = computed((): FormFieldType[] => {
    const row = props.row ?? props.form.data;
    const auth = readPageProps(page).auth;
    return (props.fields as FormFieldType[])
        .filter((field) => {
            return evaluateVisibility(field, props.isEditing, row, auth);
        })
        .map((field) => ({
            ...field,
            required:
                typeof field.required === 'function'
                    ? field.required(props.isEditing, row, { auth })
                    : !!field.required,
            keyOptions:
                typeof field.keyOptions === 'function'
                    ? (field.keyOptions as Function)(props.isEditing, row, {
                          auth,
                      })
                    : field.keyOptions,
            readonly:
                typeof field.readonly === 'function'
                    ? (field.readonly as Function)(props.isEditing, row, {
                          auth,
                      })
                    : field.readonly,
            options:
                typeof (field as any).options === 'function'
                    ? ((field as any).options as Function)(props.isEditing, row, { auth })
                    : field.options,
        }));
});

// Reactive copy for DnD support (flat layout only)
const localFields = ref<FormFieldType[]>([...visibleFields.value]);

watch(
    visibleFields,
    (newFields) => {
        localFields.value = [...newFields];
    },
    { deep: true },
);

// ─── DnD (flat layout only) ───────────────────────────────────────────────────

const draggedIndex = ref<number | null>(null);

const handleDragStart = (index: number) => {
    if (!props.dnd) return;
    draggedIndex.value = index;
};

const handleDrop = (targetIndex: number) => {
    if (!props.dnd || draggedIndex.value === null) return;

    const items = [...localFields.value];
    const draggedItem = items.splice(draggedIndex.value, 1)[0];
    items.splice(targetIndex, 0, draggedItem);
    localFields.value = items;
    draggedIndex.value = null;

    const ids: string[] = [];
    const orders: number[] = [];
    localFields.value.forEach((field, idx) => {
        const newOrder = idx + 1;
        if (field.type === 'number' || field.name.includes('order')) {
            props.form.setData(field.name, newOrder);
            const idMatch = field.name.match(/order_(\d+)/);
            if (idMatch) {
                ids.push(idMatch[1]);
                orders.push(newOrder);
            }
            if (field.label.includes(':')) {
                field.label = `${newOrder} : ${field.label.split(':').slice(1).join(':').trim()}`;
            }
        }
    });
    if (ids.length > 0) {
        props.form.setData('ids', ids);
        props.form.setData('orders', orders);
    }
};

// ─── Density / hover (DnD flat layout) ───────────────────────────────────────

const getDensityClasses = () => {
    switch (props.density) {
        case 'tight':
        case 'compact':
            return 'py-1 px-2 space-x-2';
        case 'loose':
        case 'relaxed':
            return 'py-3 px-4 space-x-4';
        default:
            return 'py-2 px-3 space-x-3';
    }
};

const gridGapClass = computed(() => {
    if (props.density === 'compact' || props.density === 'tight')
        return 'gap-x-3 gap-y-2.5';
    if (props.density === 'relaxed' || props.density === 'loose')
        return 'gap-x-6 gap-y-6';
    return 'gap-x-4 gap-y-4';
});

const gridGroupGapClass = computed(() => {
    if (props.density === 'compact' || props.density === 'tight')
        return 'gap-3';
    if (props.density === 'relaxed' || props.density === 'loose')
        return 'gap-6';
    return 'gap-4';
});

const getHoverClasses = () =>
    'hover:shadow-md hover:border-primary-500 dark:hover:border-primary-400';

// ─── Field helpers ────────────────────────────────────────────────────────────

const getFieldSize = (field: FormFieldType): string => {
    const defaultSize =
        props.density === 'compact' || props.density === 'tight'
            ? 'sm'
            : props.density === 'relaxed' || props.density === 'loose'
              ? 'lg'
              : props.defaultInputSize;
    // A token or raw Tailwind classes; FormField resolves either through utils/sizing.ts.
    return field.size || defaultSize || 'md';
};

const isSwitchField = (field: FormFieldType): boolean =>
    field.type === 'switch';

const isFileField = (field: FormFieldType): boolean =>
    ['file', 'image', 'avatar'].includes(field.type);

/**
 * Searches within group fields too so `onChange` and relation-clearing work
 * regardless of whether a field is nested inside a group.
 */
const findField = (name: string): FormFieldType | undefined => {
    for (const item of props.fields) {
        if (isGroupNode(item)) {
            const found = item.fields.find((f) => f.name === name);
            if (found) return found;
        } else if ((item as FormFieldType).name === name) {
            return item as FormFieldType;
        }
    }
    return undefined;
};

// ─── Form value helpers ───────────────────────────────────────────────────────

const getFieldValue = (field: FormFieldType): any => {
    let value = props.form.data[field.name];

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
            (field.name.endsWith('_id') ? field.name.replace(/_id$/, '') : '');
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

const getFieldError = (field: FormFieldType): string | undefined =>
    props.form.errors[field.name];

// ─── Event handlers ───────────────────────────────────────────────────────────

const handleChange = (name: string, value: any) => {
    props.form.setData(name, value);

    const field = findField(name);
    const hasRelation = name.endsWith('_id') || (field && field.relationName);

    // Clear stale relation when an _id or relation field is updated
    if (
        hasRelation &&
        (typeof value === 'number' ||
            typeof value === 'string' ||
            value === null)
    ) {
        const relationName =
            (field && field.relationName) || name.replace(/_id$/, '');
        if (props.form.data[relationName] !== undefined) {
            props.form.setData(relationName, null);
        }
    }

    // Fire custom onChange if defined (searches inside groups too)
    if (field?.onChange) {
        field.onChange(value, props.form);
    }
};

const handleSubmit = () => {
    const auth = readPageProps(page).auth;
    if (
        props.form.validate &&
        !props.form.validate(allFlatFields.value, props.isEditing, { auth })
    )
        return;
    emit('submit');
};

const handleFileChange = (name: string, files: any) => {
    props.form.setData(name, files);
};

// ─── Error summary ────────────────────────────────────────────────────────────

const hasErrors = computed(() => Object.keys(props.form.errors).length > 0);
</script>
