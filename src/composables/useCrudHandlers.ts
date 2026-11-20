import { router, usePage } from '../adapters/inertia';
import { readPageProps } from '../adapters/pageProps';
import axios from 'axios';
import { Swal } from '../utils/swal';
import type { Ref } from 'vue';
import { useUiI18n } from '../i18n';
import { resolveLabel } from '../i18n';
import type {
    CustomAction,
    CustomActionDialogState,
    ModuleConfig,
} from '../types/module';
import { toast } from './useToast';

/**
 * Read the flash messages from Inertia's shared page props and fire the
 * appropriate toast. Returns true if a flash toast was shown.
 */
function showFlashToast(fallbackSuccess?: string): boolean {
    const page = usePage();
    const flash = readPageProps(page).flash as
        | {
              success?: string;
              error?: string;
              warning?: string;
              message?: string;
          }
        | undefined;

    if (flash?.error) {
        toast.error(flash.error);
        return true;
    }
    if (flash?.warning) {
        toast.warning(flash.warning);
        return true;
    }
    if (flash?.success) {
        toast.success(flash.success);
        return true;
    }
    if (flash?.message) {
        toast.info(flash.message);
        return true;
    }
    if (fallbackSuccess) {
        toast.success(fallbackSuccess);
    }
    return false;
}

export function useCrudHandlers(
    configRef: Ref<ModuleConfig>,
    visibleCustomBulkActions: Ref<CustomAction[]>,
) {
    const { t } = useUiI18n();

    const handleCreate = (
        createForm: any,
        setIsDialogOpen: (open: boolean) => void,
        getInitialFormData: () => Record<string, any>,
        options?: { onSuccess?: () => void },
    ) => {
        const config = configRef.value;
        createForm.processing.value = false;
        const endpoint =
            config.actionConfig?.create?.endpoint || config.api?.create || '';
        if (!endpoint) return;

        const addMoreConfig = config.actionConfig?.create?.addMore;
        const persistFields = Array.isArray(addMoreConfig) ? addMoreConfig : [];
        const addMore =
            addMoreConfig === 'confirm' ? 'confirm' : Boolean(addMoreConfig);

        const resetWithPersist = () => {
            // Save values we want to persist using the `.data` property of the form wrapper
            const savedValues: Record<string, any> = {};
            persistFields.forEach((field) => {
                savedValues[field] = createForm.data[field];
            });

            createForm.reset(getInitialFormData());
            createForm.clearErrors?.();

            // Restore saved values using `.setData()` to ensure reactivity
            persistFields.forEach((field) => {
                if (savedValues[field] !== undefined) {
                    createForm.setData(field, savedValues[field]);
                }
            });
        };

        createForm.post(endpoint, {
            fields: config.formFields,
            onSuccess: () => {
                if (addMore === 'confirm') {
                    Swal.fire({
                        title: t('toast.create_success'),
                        text: t('confirm.add_more_text'),
                        icon: 'success',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: t('confirm.add_more_confirm'),
                        cancelButtonText: t('confirm.add_more_cancel'),
                    }).then((result) => {
                        if (result.isConfirmed) {
                            resetWithPersist();
                            options?.onSuccess?.();
                        } else {
                            setIsDialogOpen(false);
                            options?.onSuccess?.();
                        }
                    });
                } else if (addMore === true) {
                    resetWithPersist();
                    toast.success(t('toast.create_success'));
                    options?.onSuccess?.();
                } else {
                    setIsDialogOpen(false);
                    toast.success(t('toast.create_success'));
                    options?.onSuccess?.();
                }
                createForm.processing.value = false;
            },
            onError: (errors: any) => {
                createForm.processing.value = false;
                // ✅ Show error toast
                const errorMessage =
                    (Object.values(errors)[0] as string) ||
                    t('toast.create_error');
                toast.error(errorMessage);
            },
        });
    };

    const handleUpdate = (
        updateForm: any,
        editingItem: Ref<any>,
        setIsDialogOpen: (open: boolean) => void,
        setEditingItem: (item: any) => void,
        options?: { onSuccess?: () => void },
    ) => {
        const config = configRef.value;
        if (!editingItem.value?.id) return;

        updateForm.processing.value = false;
        const endpoint =
            config.actionConfig?.edit?.endpoint || config.api?.update || '';
        if (!endpoint) return;

        const editMessages = config.actionConfig?.edit?.messages;

        updateForm.put(endpoint.replace(':id', String(editingItem.value.id)), {
            fields: config.formFields,
            onSuccess: () => {
                setIsDialogOpen(false);
                setEditingItem(null);
                updateForm.processing.value = false;

                // ✅ Prefer server flash; fall back to config message or default
                showFlashToast(
                    editMessages?.success || t('toast.update_success'),
                );
                options?.onSuccess?.();
            },
            onError: (errors: any) => {
                updateForm.processing.value = false;
                // ✅ Show error toast (custom or first field error or default)
                const errorMessage =
                    editMessages?.error ||
                    (Object.values(errors)[0] as string) ||
                    t('toast.update_error');
                toast.error(errorMessage);
            },
        });
    };

    const handleDelete = (
        id: string | number,
        options?: { onSuccess?: () => void },
    ) => {
        const config = configRef.value;
        const deleteMessages = config.actionConfig?.delete?.messages;

        Swal.fire({
            title: t('confirm.delete_title'),
            text: t('confirm.delete_irreversible'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: t('confirm.delete_confirm_button'),
            cancelButtonText: t('ui-builder.cancel'),
        }).then((result) => {
            if (result.isConfirmed) {
                const endpoint =
                    config.actionConfig?.delete?.endpoint ||
                    config.api?.delete ||
                    '';
                if (!endpoint) return;

                router.delete(endpoint.replace(':id', String(id)), {
                    preserveScroll: true,
                    onSuccess: () => {
                        // ✅ Prefer server flash; fall back to config message or default
                        showFlashToast(
                            deleteMessages?.success ||
                                t('toast.delete_success'),
                        );
                        options?.onSuccess?.();
                    },
                    onError: (errors: any) => {
                        // ✅ Show error toast (custom or first field error or default)
                        const errorMessage =
                            deleteMessages?.error ||
                            (Object.values(errors)[0] as string) ||
                            t('toast.delete_error');
                        toast.error(errorMessage);
                    },
                });
            }
        });
    };

    const handleBulkAction = (
        actionKey: string,
        ids: string[],
        data: any[],
        setCustomActionDialog: (state: CustomActionDialogState) => void,
        options?: { onSuccess?: () => void },
    ) => {
        const config = configRef.value;
        if (ids.length === 0) return;

        const customBulk = visibleCustomBulkActions.value.find(
            (a) => a.key === actionKey,
        );

        if (customBulk) {
            const selectedRows = data.filter((row) =>
                ids.includes(String(row.id)),
            );

            if (customBulk.formFields || customBulk.loadForm) {
                if (customBulk.loadForm) {
                    setCustomActionDialog({
                        isOpen: true,
                        action: customBulk,
                        row: selectedRows,
                        isLoading: true,
                    });
                    return;
                }

                setCustomActionDialog({
                    isOpen: true,
                    action: customBulk,
                    row: selectedRows,
                });
                return;
            }

            Swal.fire({
                title: `${resolveLabel(customBulk.label)}?`,
                text:
                    // A config may supply either a translation key or a plain English
                    // literal; resolveLabel returns the raw string when it is not a key,
                    // so every existing config keeps rendering exactly as it did.
                    resolveLabel(customBulk.confirmMessage || '') ||
                    t('confirm.bulk_action_text', {
                        action: resolveLabel(customBulk.label).toLowerCase(),
                        count: ids.length,
                    }),
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: t('confirm.yes_proceed'),
            }).then((result) => {
                if (result.isConfirmed) {
                    if (customBulk.onClick) {
                        customBulk
                            .onClick(selectedRows, router)
                            .then(async (res: any) => {
                                if (res && typeof res === 'object' && res.url) {
                                    if (customBulk.target === '_blank') {
                                        const { openInNewTab } =
                                            await import('../lib/utils');
                                        openInNewTab(
                                            res.url,
                                            res.data || {},
                                            res.method || 'GET',
                                        );
                                    } else {
                                        router.visit(res.url, {
                                            method: res.method || 'GET',
                                            data: res.data || {},
                                        });
                                    }
                                } else {
                                    toast.success(t('toast.action_success'));
                                    options?.onSuccess?.();
                                }
                            })
                            .catch((error: any) => {
                                toast.error(
                                    error.message || t('toast.action_error'),
                                );
                            });
                    } else {
                        router.post(
                            customBulk.endpoint || `/bulk-${actionKey}`,
                            { ids },
                            {
                                onSuccess: () => {
                                    showFlashToast(t('toast.action_success'));
                                    options?.onSuccess?.();
                                },
                                onError: (errors: any) => {
                                    const errorMessage =
                                        (Object.values(errors)[0] as string) ||
                                        t('toast.action_error');
                                    toast.error(errorMessage);
                                },
                            },
                        );
                    }
                }
            });
            return;
        }

        if (actionKey === 'delete') {
            Swal.fire({
                title: t('confirm.delete_multiple_title'),
                text: t('confirm.delete_multiple_text', { count: ids.length }),
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: t('confirm.delete_multiple_confirm_button'),
                cancelButtonText: t('ui-builder.cancel'),
            }).then((result) => {
                if (result.isConfirmed) {
                    const config = configRef.value;
                    const endpoint =
                        config.actionConfig?.bulkDelete?.endpoint ||
                        config.api?.bulkDelete ||
                        config.api?.delete ||
                        '';
                    if (!endpoint) return;

                    router.delete(endpoint, {
                        data: { ids },
                        preserveScroll: true,
                        onSuccess: () => {
                            // ✅ Prefer server flash; fall back to default
                            showFlashToast(
                                t('toast.bulk_delete_success', {
                                    count: ids.length,
                                }),
                            );
                            options?.onSuccess?.();
                        },
                        onError: (errors) => {
                            const errorMessage =
                                (Object.values(errors)[0] as string) ||
                                t('toast.delete_error');
                            toast.error(errorMessage);
                        },
                    });
                }
            });
        }
    };

    const handleCustomRowAction = (
        action: CustomAction,
        row: any,
        setCustomActionDialog: (state: CustomActionDialogState) => void,
        options: { onSuccess?: () => void } = {},
    ) => {
        // If it's a form-based action, ModuleManager handles opening the dialog
        if (action.loadForm) {
            setCustomActionDialog({
                isOpen: true,
                action,
                row,
                isLoading: true,
            });
            return;
        }

        if (action.formFields && action.formFields.length > 0) {
            setCustomActionDialog({ isOpen: true, action, row });
            return;
        }

        if (action.component && !action.onClick) {
            setCustomActionDialog({
                isOpen: true,
                action,
                row,
                dynamicContent: {
                    type: 'component',
                    data: null,
                    component: action.component,
                },
            });
            return;
        }

        if (action.onClick) {
            // ✅ If rendering in dialog, show loading state immediately to prevent any accidental navigation
            if (action.renderInDialog) {
                setCustomActionDialog({
                    isOpen: true,
                    action,
                    row,
                    isLoading: true,
                });
            }

            const executeAction = async () => {
                try {
                    const result = await action.onClick!(row, router);

                    // ✅ Handle renderInDialog: fetch URL HTML and display inside the dialog
                    if (result?.url && action.renderInDialog) {
                        try {
                            const response = await axios.get(result.url, {
                                headers: {
                                    'X-Requested-With': 'XMLHttpRequest',
                                },
                            });
                            const contentType =
                                response.headers['content-type'] || '';
                            const isJson =
                                contentType.includes('application/json') ||
                                typeof response.data === 'object';
                            setCustomActionDialog({
                                isOpen: true,
                                action,
                                row,
                                isLoading: false,
                                dynamicContent: {
                                    type: isJson ? 'component' : 'html',
                                    data: response.data,
                                    component:
                                        result.component || action.component, // ✅ Support dynamic component from onClick result
                                },
                            });
                        } catch (fetchError: any) {
                            setCustomActionDialog({
                                isOpen: false,
                                action: null,
                                row: null,
                            });
                            toast.error(
                                fetchError.message || t('toast.load_error'),
                            );
                        }
                        return;
                    }

                    // ✅ Handle redirection if result contains url (only if not rendering in dialog)
                    if (result?.url && !action.renderInDialog) {
                        if (action.target === '_blank') {
                            const { openInNewTab } =
                                await import('../lib/utils');
                            openInNewTab(
                                result.url,
                                result.data || {},
                                result.method || 'GET',
                            );
                        } else {
                            router.visit(result.url, {
                                method: (result.method as any) || 'GET',
                                data: result.data || {},
                            });
                        }
                        return;
                    }

                    // ✅ No redirection: Show success toast and close loading state if needed
                    if (action.renderInDialog) {
                        // If it was supposed to render in dialog but no URL was returned, just close it or show success
                        setCustomActionDialog({
                            isOpen: false,
                            action: null,
                            row: null,
                        });
                    }

                    if (!action.preventToast) {
                        toast.success(t('toast.action_success'));
                    }
                    options.onSuccess?.();
                } catch (error: any) {
                    if (action.renderInDialog) {
                        setCustomActionDialog({
                            isOpen: false,
                            action: null,
                            row: null,
                        });
                    }
                    toast.error(error.message || t('toast.action_error'));
                }
            };

            if (action.confirmMessage) {
                Swal.fire({
                    title: `${resolveLabel(action.label)}?`,
                    // Same as the bulk branch above: a key resolves, a literal passes
                    // straight through.
                    text: resolveLabel(action.confirmMessage),
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor:
                        action.variant === 'destructive'
                            ? '#ef4444'
                            : '#3b82f6',
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        executeAction();
                    }
                });
            } else {
                executeAction();
            }
        }
    };

    const handleCustomActionSubmit = (
        customActionDialog: Ref<CustomActionDialogState>,
        customActionForm: any,
        setCustomActionDialog: (state: CustomActionDialogState) => void,
        options: {
            onSuccess?: () => void;
            onError?: (errors: any) => void;
        } = {},
    ) => {
        const { action, row } = customActionDialog.value;
        if (!action) return; // Allow row to be null for header actions

        const closeDialog = () => {
            setCustomActionDialog({
                isOpen: false,
                action: null,
                row: null,
            });

            setTimeout(() => {
                customActionForm.reset();
            }, 300);
        };

        // NEW: Integrated Submission Support (acts like Create/Edit)
        if (action.submitConfig) {
            const config = action.submitConfig(row);
            const method = (config.method || 'POST').toLowerCase() as any;

            const fields =
                typeof action.formFields === 'function'
                    ? action.formFields(row)
                    : action.formFields || [];

            const submitFn = customActionForm.submitRaw
                ? customActionForm.submitRaw
                : customActionForm.submit;

            submitFn(method, config.url, {
                fields: fields,
                preserveScroll: config.preserveScroll ?? true,
                onSuccess: (responseData?: any) => {
                    closeDialog();
                    // Use successMessage from config, then server JSON message, then action label
                    const message =
                        config.successMessage ||
                        responseData?.message ||
                        (action.label
                            ? t('toast.submitted_success', {
                                  label: resolveLabel(action.label),
                              })
                            : t('toast.action_success'));
                    showFlashToast(message);
                    options.onSuccess?.(responseData);
                },
                onError: (errors: any) => {
                    const errorMessage =
                        (Object.values(errors)[0] as string) ||
                        t('toast.action_form_error');
                    toast.error(errorMessage);
                    options.onError?.(errors);
                },
            });
            return;
        }

        if (action.onClick) {
            customActionForm.processing.value = true;
            action
                .onClick(row, router, customActionForm.data)
                .then(async (result: any) => {
                    // Only close automatically if explicitly returned true
                    if (result === true) {
                        closeDialog();
                        toast.success(t('toast.action_success'));
                    }
                })
                .catch((error: any) => {
                    toast.error(error.message || t('toast.action_error'));
                })
                .finally(() => {
                    customActionForm.processing.value = false;
                });
        }
    };

    const openCreateDialog = (
        setIsCreating: (creating: boolean) => void,
        setEditingItem: (item: any) => void,
        setIsDialogOpen: (open: boolean) => void,
        createForm: any,
        getInitialFormData: () => Record<string, any>,
    ) => {
        setIsCreating(true);
        setEditingItem(null);
        setIsDialogOpen(true);
        createForm.reset(getInitialFormData());
    };

    const openEditDialog = (
        row: any,
        canUpdate: Ref<boolean>,
        setEditingItem: (item: any) => void,
        setIsCreating: (creating: boolean) => void,
        setIsDialogOpen: (open: boolean) => void,
    ) => {
        const config = configRef.value;
        if (!canUpdate.value || config.disableRowClick) return;
        if (config.onRowClick) {
            config.onRowClick(row, router);
            return;
        }
        setEditingItem(row);
        setIsCreating(false);
        setIsDialogOpen(true);
    };

    return {
        handleCreate,
        handleUpdate,
        handleDelete,
        handleBulkAction,
        handleCustomRowAction,
        handleCustomActionSubmit,
        openCreateDialog,
        openEditDialog,
    };
}
