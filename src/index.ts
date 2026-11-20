/**
 * @rasel/ui-builder main entry. Importing from here pulls in every component it names, so an app that
 * cares about its first-load size (quick-pos does) keeps importing deep paths such as
 * '@rasel/ui-builder/components/ModuleManager/ModuleManager.vue'; both stay supported.
 */
export { createUiBuilder, configureUiBuilder, type UiBuilderOptions } from './plugin';
export { default as UiBuilderRoot } from './components/UiBuilderRoot.vue';

export * from './types/module';
export * from './types/import';

export { default as ModuleManager } from './components/ModuleManager/ModuleManager.vue';
/** The labelled field every form uses (named UiFormField so it does not clash with the FormField config type). */
export { default as UiFormField } from './components/ModuleManager/FormField.vue';
export { default as GenericForm } from './components/ModuleManager/GenericForm.vue';
export { default as DialogWrapper } from './components/ModuleManager/DialogWrapper.vue';
export { default as SubModuleCrudPanel } from './components/ModuleManager/SubModuleCrudPanel.vue';
export { default as HintTip } from './components/HintTip.vue';
export { default as ToastNotification } from './components/ToastNotification.vue';
export { default as ImagePreviewModal } from './components/ImagePreviewModal.vue';

export { useTheme } from './composables/useTheme';
export { useThemedFieldStyle } from './composables/useThemedFieldStyle';
export { useToast, toast } from './composables/useToast';
export { useImagePreview } from './composables/useImagePreview';
export { useLucideIcons, registerLucideIcons } from './composables/useLucideIcons';
export { useForm } from './composables/useForm';
export { toneClass, renderToneBadge, type BadgeTone } from './composables/badgeTones';
export * from '@rasel/ui-builder/composables/themes';

export { createAjaxLookup } from '@rasel/ui-builder/utils/configUtils';
export { diffForHumans, setDateFormatter, renderEntityAvatar, renderAttachmentsHtml } from './utils/utilities';
export { setExportBranding } from '@rasel/ui-builder/utils/exportUtils';
export { setExportDefaults } from '@rasel/ui-builder/utils/exportDefaults';
export { setSavedViewStore } from '@rasel/ui-builder/utils/savedViews';
export { safeCell, toCsv } from '@rasel/ui-builder/utils/importFile';
export { Swal } from '@rasel/ui-builder/utils/swal';
export * from '@rasel/ui-builder/i18n';
