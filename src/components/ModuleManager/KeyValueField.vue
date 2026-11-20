<template>
    <div
        class="w-full rounded-lg border px-4 pt-2 pb-3 shadow-sm"
        :class="[
            theme.inputBorder || 'border-gray-200 dark:border-gray-700',
            theme.inputBackground === 'bg-white'
                ? 'bg-gray-50/50 dark:bg-gray-900/30'
                : theme.inputBackground || 'bg-gray-50/50 dark:bg-gray-900/30',
        ]"
    >
        <div
            class="space-y-4 pt-3 pr-1"
            :class="{ 'custom-scrollbar overflow-y-auto': maxHeight }"
            :style="{ maxHeight: maxHeight }"
        >
            <div
                v-for="(pair, index) in pairs"
                :key="pair._id"
                :draggable="pairs.length > 1"
                @dragstart="onDragStart($event, index)"
                @dragover.prevent
                @dragenter.prevent
                @drop="onDrop($event, index)"
                class="flex items-center gap-3 transition-all"
                :class="draggedIndex === index ? 'opacity-50' : ''"
            >
                <div
                    v-if="showSerial"
                    class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-bold text-gray-500 shadow-sm dark:bg-gray-700 dark:text-gray-400"
                >
                    {{ index + 1 }}
                </div>

                <div
                    class="group relative flex-1 rounded-md border transition-all"
                    :style="{ '--focus-theme-color': focusThemeColor }"
                    :class="[
                        theme.inputBorder ||
                            'border-gray-200 dark:border-gray-700',
                        theme.inputBackground || 'bg-white dark:bg-gray-800',
                        draggedIndex === index ? 'border-dashed' : '',
                        pair.errorKey || pair.errorValue
                            ? theme.errorBorder || 'border-red-500'
                            : 'focus-within:border-[var(--focus-theme-color)]! focus-within:ring-0 focus-within:outline-none!',
                    ]"
                >
                    <div
                        class="absolute -top-2.5 left-3 z-10 flex items-center px-1 transition-colors"
                        :class="solidLabelBackground"
                    >
                        <input
                            type="text"
                            v-model="pair.key"
                            @input="updateValue"
                            @focus="openSuggestionsFor(pair, $event)"
                            @blur="scheduleCloseSuggestions"
                            autocomplete="off"
                            :placeholder="keyPlaceholder || resolveLabel('ui-builder.key_name_placeholder')"
                            :class="[
                                'w-28 bg-transparent text-xs font-semibold tracking-wide transition-colors outline-none focus:w-40 sm:w-32',
                                theme.labelText ||
                                    'text-gray-500 dark:text-gray-400',
                                pair.errorKey
                                    ? theme.errorText || 'text-red-500'
                                    : 'focus:text-gray-900 dark:focus:text-gray-100',
                            ]"
                            :readonly="readonly"
                        />
                    </div>

                    <div
                        v-if="
                            !readonly &&
                            activePairId === pair._id &&
                            filteredSuggestions(pair).length
                        "
                        :style="{
                            '--theme-color': focusThemeColor,
                            maxHeight: dropdownMaxHeight + 'px',
                        }"
                        :class="[
                            'custom-scrollbar absolute left-0 z-30 w-max min-w-[220px] overflow-y-auto rounded-md border py-1 shadow-lg',
                            dropdownDirection === 'up'
                                ? 'bottom-full mb-1'
                                : 'top-full mt-1',
                            theme.inputBorder ||
                                'border-gray-200 dark:border-gray-700',
                            solidLabelBackground,
                        ]"
                    >
                        <div
                            class="px-3 pt-0.5 pb-1 text-[10px] font-semibold tracking-wide text-gray-400 uppercase dark:text-gray-500"
                        >
                            {{ resolveLabel('ui-builder.suggested_fields') }}
                        </div>
                        <button
                            v-for="option in filteredSuggestions(pair)"
                            :key="option"
                            type="button"
                            @mousedown.prevent="selectSuggestion(pair, option)"
                            class="block w-full truncate px-3 py-1.5 text-left text-xs text-gray-700 transition-colors hover:bg-[var(--theme-color)] hover:text-white dark:text-gray-300"
                        >
                            {{ option }}
                        </button>
                    </div>

                    <input
                        type="text"
                        v-model="pair.value"
                        @input="updateValue"
                        :placeholder="valuePlaceholder || resolveLabel('ui-builder.enter_value_placeholder')"
                        :style="{
                            height: computedHeight,
                            paddingLeft: computedPadding,
                            paddingRight: '80px', // Leave space for actions
                        }"
                        :class="[
                            'w-full rounded-md bg-transparent text-sm transition-colors outline-none',
                            theme.inputText ||
                                'text-gray-900 dark:text-gray-100',
                            pair.errorValue
                                ? theme.errorText || 'text-red-500'
                                : '',
                        ]"
                        :readonly="readonly"
                    />

                    <div
                        class="absolute top-1/2 right-1 flex -translate-y-1/2 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100"
                    >
                        <div
                            v-if="pairs.length > 1"
                            class="flex h-7 w-7 cursor-grab items-center justify-center rounded-md text-gray-400 dark:text-neutral-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                            :title="resolveLabel('ui-builder.drag_to_reorder')"
                        >
                            <GripVertical class="h-4 w-4" />
                        </div>

                        <button
                            type="button"
                            @click="removePair(index)"
                            :disabled="readonly || pairs.length === 1"
                            class="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 dark:text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50 dark:hover:bg-red-900/20"
                            :title="resolveLabel('ui-builder.remove')"
                        >
                            <Trash2 class="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <button
                    type="button"
                    @click="addPair(index)"
                    :disabled="readonly || !!localError || hasBlankPair"
                    :style="{ '--theme-color': focusThemeColor }"
                    class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 shadow-sm transition-all hover:bg-[var(--theme-color)] hover:text-white disabled:opacity-50 dark:bg-gray-700 dark:text-gray-400"
                    :title="resolveLabel('ui-builder.add_pair_below')"
                >
                    <Plus class="h-4 w-4" />
                </button>
            </div>
        </div>

        <div class="mt-3 flex items-center justify-between">
            <div class="flex-1">
                <div
                    v-if="localError"
                    :class="`text-xs font-medium ${theme.errorText || 'text-red-500'}`"
                >
                    {{ localError }}
                </div>
                <!-- Hidden input to block HTML5 form submission -->
                <input
                    type="text"
                    :value="localError ? '' : 'valid'"
                    :required="!!localError"
                    class="absolute h-0 w-0 opacity-0"
                    tabindex="-1"
                    :title="resolveLabel('ui-builder.resolve_errors_above')"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { resolveLabel } from '../../i18n';
import { GripVertical, Plus, Trash2 } from '@lucide/vue';
import { Swal } from '../../utils/swal';
import { computed, onMounted, ref, watch } from 'vue';
import { getThemeHex } from '../../composables/themes';
import { resolveControlSize } from '../../utils/sizing';

interface Pair {
    _id: number;
    key: string;
    value: string;
    errorKey?: boolean;
    errorValue?: boolean;
}

const props = defineProps<{
    value: any;
    theme: any;
    size?: string;
    readonly?: boolean;
    keyPlaceholder?: string;
    valuePlaceholder?: string;
    addActionText?: string;
    showSerial?: boolean;
    maxHeight?: string;
    selectedTheme?: string;
    keyOptions?: string[];
}>();

const activePairId = ref<number | null>(null);
const dropdownDirection = ref<'up' | 'down'>('down');
const dropdownMaxHeight = ref(200);

/** Suggestions for a pair's key input: unused keys matching what's typed so far. */
const filteredSuggestions = (pair: Pair) => {
    if (!props.keyOptions?.length) return [];

    const query = pair.key.trim().toLowerCase();
    const usedKeys = new Set(
        pairs.value
            .filter((p) => p._id !== pair._id)
            .map((p) => p.key.trim().toLowerCase())
            .filter(Boolean),
    );

    return props.keyOptions.filter(
        (option) =>
            !usedKeys.has(option.toLowerCase()) &&
            (!query || option.toLowerCase().includes(query)),
    );
};

const PREFERRED_DROPDOWN_HEIGHT = 200;
const MIN_DROPDOWN_HEIGHT = 120;
const VIEWPORT_MARGIN = 16;

/** Opens above the row by default; falls back to below only when there isn't room above. */
const openSuggestionsFor = (pair: Pair, event: FocusEvent) => {
    if (props.readonly) return;
    activePairId.value = pair._id;

    const inputEl = event.target as HTMLElement;
    const rect = inputEl.getBoundingClientRect();
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;

    if (spaceAbove - VIEWPORT_MARGIN >= MIN_DROPDOWN_HEIGHT) {
        dropdownDirection.value = 'up';
        dropdownMaxHeight.value = Math.min(
            PREFERRED_DROPDOWN_HEIGHT,
            spaceAbove - VIEWPORT_MARGIN,
        );
    } else {
        dropdownDirection.value = 'down';
        dropdownMaxHeight.value = Math.max(
            MIN_DROPDOWN_HEIGHT,
            Math.min(PREFERRED_DROPDOWN_HEIGHT, spaceBelow - VIEWPORT_MARGIN),
        );
    }
};

const selectSuggestion = (pair: Pair, option: string) => {
    pair.key = option;
    updateValue();
    activePairId.value = null;
};

/** Delay closing so a suggestion's mousedown (which is prevented from stealing focus) can still register as a click. */
const scheduleCloseSuggestions = () => {
    setTimeout(() => {
        activePairId.value = null;
    }, 150);
};

const emit = defineEmits<{
    (e: 'update', val: any): void;
}>();

const hasBlankPair = computed(() => {
    return pairs.value.some((pair) => !pair.key.trim() && !pair.value.trim());
});

// Same sizes as FormField (utils/sizing.ts): a token, or raw classes whose base height the rows follow.
const control = computed(() => resolveControlSize(props.size));
const computedHeight = computed(() => control.value.height);
const computedPadding = computed(
    () => resolveControlSize(control.value.token).padStyle.paddingLeft,
);

const focusThemeColor = computed(() => {
    return getThemeHex(props.selectedTheme || props.theme?.name || 'blue');
});

const solidLabelBackground = computed(() => {
    let bg = props.theme?.inputBackground || 'bg-white dark:bg-gray-800';
    // If it's explicitly transparent, fall back to white/dark-gray
    if (bg.includes('transparent')) {
        bg = bg.replace(/bg-transparent/g, 'bg-white dark:bg-gray-800');
    }
    // Remove tailwind opacity modifiers like /50 or /30 to force a solid color
    return bg.replace(/\/[0-9]+/g, '');
});

let idCounter = 0;
const generateId = () => ++idCounter;

const pairs = ref<Pair[]>([{ _id: generateId(), key: '', value: '' }]);
const localError = ref('');
const draggedIndex = ref<number | null>(null);

const parseInitialValue = (val: any) => {
    if (!val || val === '__INVALID_KEY_VALUE__')
        return [{ _id: generateId(), key: '', value: '' }];

    try {
        let obj = val;
        if (typeof val === 'string') {
            obj = JSON.parse(val);
        }

        if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
            const parsedPairs = Object.entries(obj).map(([k, v]) => ({
                _id: generateId(),
                key: k,
                value: String(v),
            }));
            return parsedPairs.length
                ? parsedPairs
                : [{ _id: generateId(), key: '', value: '' }];
        }
    } catch (e) {
        console.error('Failed to parse initial value for KeyValueField', e);
    }

    return [{ _id: generateId(), key: '', value: '' }];
};

onMounted(() => {
    pairs.value = parseInitialValue(props.value);
});

let isInternalUpdate = false;

watch(
    () => props.value,
    (newVal, oldVal) => {
        if (isInternalUpdate) return;

        const currentJson = JSON.stringify(getOutputJson());
        const newJson = JSON.stringify(newVal === undefined ? null : newVal);

        if (newJson !== currentJson) {
            pairs.value = parseInitialValue(newVal);
        }
    },
    { deep: true },
);

const addPair = (index: number) => {
    pairs.value.splice(index + 1, 0, { _id: generateId(), key: '', value: '' });
};

const removePair = async (index: number) => {
    if (pairs.value.length > 1) {
        const pair = pairs.value[index];
        // Only ask for confirmation if the row has data
        if (pair.key.trim() !== '' || pair.value.trim() !== '') {
            const result = await Swal.fire({
                title: 'Remove this item?',
                text: "You can't undo this action.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, remove it!',
            });
            if (!result.isConfirmed) return;
        }

        pairs.value.splice(index, 1);
        updateValue();
    }
};

const onDragStart = (event: DragEvent, index: number) => {
    draggedIndex.value = index;
    if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', index.toString());
    }
};

const onDrop = (event: DragEvent, targetIndex: number) => {
    if (draggedIndex.value === null || draggedIndex.value === targetIndex) {
        draggedIndex.value = null;
        return;
    }

    const item = pairs.value.splice(draggedIndex.value, 1)[0];
    pairs.value.splice(targetIndex, 0, item);
    draggedIndex.value = null;
    updateValue();
};

const getOutputJson = () => {
    const result: Record<string, string> = {};
    let hasError = false;
    let hasDuplicate = false;

    pairs.value.forEach((pair) => {
        pair.errorKey = false;
        pair.errorValue = false;

        const k = pair.key.trim();
        const v = pair.value.trim();

        if (!k && !v) {
            // Both are empty, which we'll ignore to allow empty submission if not required
            // The parent form will handle 'required' validation if the field is mandatory
        } else if (k || v) {
            if (!k) {
                pair.errorKey = true;
                hasError = true;
            } else if (result[k] !== undefined) {
                pair.errorKey = true;
                hasDuplicate = true;
                hasError = true;
            }

            // Only add to result if key is not a duplicate so we can keep tracking
            if (k && !hasDuplicate) {
                result[k] = v;
            } else if (k && result[k] === undefined) {
                result[k] = v; // Still add it so subsequent duplicates of this key are also caught
            }
        }
    });

    if (hasDuplicate) {
        localError.value = 'Duplicate keys are not allowed.';
        return '__INVALID_KEY_VALUE__';
    }

    if (hasError) {
        localError.value = 'Key is required for each pair.';
        return '__INVALID_KEY_VALUE__'; // Emit invalid marker to block useForm.validate
    }

    localError.value = '';
    return Object.keys(result).length > 0 ? result : null;
};

const updateValue = () => {
    isInternalUpdate = true;
    const outputData = getOutputJson();
    emit('update', outputData);

    // Reset flag after Vue's reactive cycle
    setTimeout(() => {
        isInternalUpdate = false;
    }, 50);
};
</script>
