<!--
    Renders a target module's OWN create form (its real `formFields`, via the same
    GenericForm/FormField this app already uses everywhere) inside a small dialog, and
    posts to that module's OWN create endpoint — so "quick create a Brand" is never a
    second, hand-maintained definition of what a Brand needs. See `QuickCreateConfig`
    in `types/module.ts` for why `getConfig` is a function.

    Submission deliberately uses a plain `axios.post`, not Inertia's `form.post()` —
    this dialog can be opened from any host page (a Product form, a PO line, ...) and
    an Inertia visit would navigate/reload that host page, not just this dialog.
-->
<template>
    <DialogWrapper
        :is-open="open"
        :title="dialogTitle"
        :dialog-size="resolvedDialogSize"
        :theme="(theme as ThemeConfig)"
        z-class="z-[70]"
        :close-on-backdrop="false"
        @close="handleClose"
        @update:is-open="(value) => emit('update:open', value)"
    >
        <div
            v-if="loadingConfig"
            class="flex items-center justify-center py-10 text-sm opacity-70"
        >
            Loading…
        </div>
        <GenericForm
            v-else-if="formRef && targetConfig"
            :fields="targetConfig.formFields"
            :form="formRef"
            :is-editing="false"
            :theme="theme"
            :selected-theme="selectedTheme"
            @submit="handleSubmit"
        />

        <template v-if="!loadingConfig" #footer>
            <button
                type="button"
                :disabled="submitting"
                :class="[
                    'h-9 min-w-[100px] rounded-md px-4 font-medium transition-colors',
                    theme.primaryButton || 'bg-blue-600 text-white hover:bg-blue-700',
                    submitting ? 'cursor-not-allowed opacity-50' : '',
                ]"
                @click="handleSubmit"
            >
                {{ submitting ? resolveLabel('ui-builder.saving') : resolveLabel('ui-builder.create') }}
            </button>
        </template>
    </DialogWrapper>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue';
import { useUiI18n } from '../../i18n';
import axios from 'axios';
import { resolveLabel, resolveModuleName } from '../../i18n';
import DialogWrapper from './DialogWrapper.vue';
import GenericForm from './GenericForm.vue';
import {
    flattenFormFields,
    type DialogSize,
    type ModuleConfig,
    type QuickCreateConfig,
    type ThemeConfig,
} from '../../types/module';
import { toast } from '../../composables/useToast';
// The ModuleManager framework's own form contract (`.data`/`.setData`/`.errors`/
// `.validate` as plain reactive fields, not Inertia's own `useForm()` shape) — every
// component this dialog renders (GenericForm, FormField, ...) is built against this
// one, not against `@inertiajs/vue3`'s `useForm`, even though the name is identical.
import { useForm } from '../../composables/useForm';

const props = defineProps<{
    open: boolean;
    quickCreate: QuickCreateConfig;
    theme: Partial<ThemeConfig>;
    selectedTheme: string;
}>();

const emit = defineEmits<{
    'update:open': [value: boolean];
    created: [record: any];
}>();

const { t } = useUiI18n();

const targetConfig = ref<ModuleConfig | null>(null);
const loadingConfig = ref(false);
const submitting = ref(false);
const formRef = shallowRef<any>(null);

const dialogTitle = computed(() => {
    if (props.quickCreate.title) return resolveLabel(props.quickCreate.title);
    if (!targetConfig.value) return '';
    const module = resolveModuleName(
        targetConfig.value.moduleName,
        targetConfig.value.moduleName,
    );
    return t('ui-builder.create_item', { module });
});

const createEndpoint = computed(
    () =>
        targetConfig.value?.actionConfig?.create?.endpoint ||
        targetConfig.value?.api?.create ||
        '',
);

// Opens at the same width the target's own "Add" dialog uses by default — a quick
// create shouldn't feel more cramped than the real thing just because it was
// reached from somewhere else. `quickCreate.dialogSize` overrides this explicitly
// when a caller genuinely wants a different size.
const resolvedDialogSize = computed<DialogSize>(
    () =>
        props.quickCreate.dialogSize ||
        targetConfig.value?.actionConfig?.create?.dialogueSize ||
        targetConfig.value?.createDialogSize ||
        'md',
);

// Same defaulting `useCrudHandlers.ts`'s `getInitialFormData()` uses for the real
// create dialog, kept local since that one isn't exported for reuse.
const buildInitialFormData = (config: ModuleConfig) => {
    const data: Record<string, any> = {};
    flattenFormFields(config.formFields).forEach((field) => {
        if (!field.name) return;
        if (field.type === 'radio' && field.options?.length) {
            const first = field.options[0];
            data[field.name] = typeof first === 'object' ? first.value : first;
        } else if (field.defaultValue !== undefined) {
            data[field.name] = field.defaultValue;
        } else if (field.multiple) {
            data[field.name] = [];
        } else {
            data[field.name] = '';
        }
    });
    return data;
};

watch(
    () => props.open,
    async (isOpen) => {
        if (!isOpen) return;
        loadingConfig.value = true;
        targetConfig.value = null;
        formRef.value = null;
        try {
            const config = await props.quickCreate.getConfig();
            targetConfig.value = config;
            formRef.value = useForm(buildInitialFormData(config));
        } catch (error) {
            console.error('Failed to load quick-create config:', error);
            toast.error(resolveLabel('toast.generic_error'));
            emit('update:open', false);
        } finally {
            loadingConfig.value = false;
        }
    },
);

const containsFile = (value: any): boolean =>
    value instanceof File ||
    value instanceof Blob ||
    (Array.isArray(value) && value.some(containsFile));

// A target's own formFields can include a `file`/`image` field (Brand's logo, for
// instance). Plain JSON can't carry a File, so this switches to multipart only when
// one is actually present — and, per the FormData-boolean trap documented for the
// product builder, stringifies booleans as '0'/'1' rather than letting FormData turn
// `false` into the literal string "false" (which Laravel's `boolean` rule rejects).
const buildRequestPayload = (data: Record<string, any>): Record<string, any> | FormData => {
    if (!Object.values(data).some(containsFile)) return data;

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if (value === null || value === undefined) return;
        if (Array.isArray(value)) {
            value.forEach((item) =>
                formData.append(`${key}[]`, item instanceof File ? item : String(item)),
            );
        } else if (typeof value === 'boolean') {
            formData.append(key, value ? '1' : '0');
        } else if (value instanceof File || value instanceof Blob) {
            formData.append(key, value);
        } else {
            formData.append(key, String(value));
        }
    });
    return formData;
};

const handleClose = () => emit('update:open', false);

const handleSubmit = async () => {
    if (!formRef.value || !createEndpoint.value || submitting.value) return;

    submitting.value = true;
    formRef.value.clearErrors();

    try {
        const response = await axios.post(createEndpoint.value, buildRequestPayload(formRef.value.data), {
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                Accept: 'application/json',
            },
        });

        const payload = response.data || {};
        // Every `store()` here answers `wantsJson()` with `{message|success: string,
        // <entity>: {...}}` — pick whichever key isn't the status string rather than
        // guessing the entity's key name per module (that guess is exactly the kind
        // of derived mapping this codebase has been burned by before).
        const record = Object.entries(payload).find(
            ([key, value]) =>
                key !== 'message' &&
                key !== 'success' &&
                value &&
                typeof value === 'object',
        )?.[1];

        toast.success(payload.message || payload.success || resolveLabel('toast.create_success'));
        emit('created', record ?? payload);
        emit('update:open', false);
    } catch (error: any) {
        if (error?.response?.status === 422 && error.response.data?.errors) {
            const errors: Record<string, string> = {};
            Object.entries(error.response.data.errors as Record<string, string[] | string>).forEach(
                ([key, messages]) => {
                    errors[key] = Array.isArray(messages) ? messages[0] : String(messages);
                },
            );
            formRef.value?.setError(errors);
        } else {
            toast.error(error?.response?.data?.message || resolveLabel('toast.generic_error'));
        }
    } finally {
        submitting.value = false;
    }
};
</script>
