import { router } from '../adapters/inertia';
import axios from 'axios';
import { reactive, ref } from 'vue';
import type { FormData, FormErrors } from '../types/module';

export interface UseFormOptions {
    onSuccess?: (data?: any) => void;
    onError?: (errors: FormErrors) => void;
    preserveScroll?: boolean;
    preserveState?: boolean;
}

// A single-select vue-select field is hydrated with a full `{ id/value, name/label }`
// object so its control can show a label without an extra round trip (see
// FormField.vue's own `props.value` object-shape handling, and the `getValue()`
// convention in configs like productConfig.ts's `status`/`nature`/`inventory_mode`
// fields, whose ajax `valueKey` is a string option key, not the option's numeric id
// — an id-based label re-fetch can't resolve those, hence the object shortcut).
// That object must collapse to its scalar `value`/`id` before it reaches the server;
// a genuine user reselection already does this via FormField.vue's
// `handleVueSelectUpdate`, but an untouched, hydrated field never passes through that
// handler, so the raw object would otherwise be submitted as-is.
const extractPrimitive = (item: any): any => {
    if (item === null || item === undefined) return null;
    if (item instanceof File) return item;
    if (typeof item === 'object' && !Array.isArray(item)) {
        if ('value' in item && item.value !== undefined) return item.value;
        if ('id' in item && item.id !== undefined) return item.id;
    }
    return item;
};

export function useForm(initialData: FormData = {}) {
    const data = reactive<FormData>({ ...initialData });
    const errors = reactive<FormErrors>({});
    const processing = ref(false); // ✅ Explicitly initialize as false

    const setData = (field: string, value: any) => {
        data[field] = value;
        clearErrors(field);
    };

    const setDataBulk = (fields: FormData) => {
        Object.entries(fields).forEach(([key, value]) => {
            data[key] = value;
        });
    };

    const setError = (
        keyOrErrors: string | Record<string, string>,
        value?: string,
    ) => {
        if (typeof keyOrErrors === 'string' && value !== undefined) {
            errors[keyOrErrors] = value;
        } else if (typeof keyOrErrors === 'object') {
            Object.entries(keyOrErrors).forEach(([key, val]) => {
                errors[key] = val;
            });
        }
    };

    const clearErrors = (field?: string) => {
        if (field) {
            delete errors[field];
        } else {
            Object.keys(errors).forEach((key) => delete errors[key]);
        }
    };

    const reset = (newData?: FormData) => {
        processing.value = false;

        Object.keys(data).forEach((key) => delete data[key]);
        Object.keys(errors).forEach((key) => delete errors[key]);

        if (newData) {
            Object.entries(newData).forEach(([key, value]) => {
                data[key] = value;
            });
        } else {
            Object.entries(initialData).forEach(([key, value]) => {
                data[key] = value;
            });
        }
    };

    const submit = (
        method: 'get' | 'post' | 'put' | 'patch' | 'delete',
        url: string,
        options: UseFormOptions & { fields?: any[] } = {},
    ) => {
        processing.value = true;
        clearErrors();

        const submitData = { ...data };
        if (options.fields) {
            options.fields.forEach((field) => {
                if (field.skipSubmit) {
                    delete submitData[field.name];
                }
                if (
                    field.type === 'vue-select' &&
                    !field.multiple &&
                    field.name in submitData
                ) {
                    submitData[field.name] = extractPrimitive(
                        submitData[field.name],
                    );
                }
            });
        }

        // Automatic method spoofing for PUT/PATCH requests with files
        let finalMethod = method;
        const hasFiles = Object.values(submitData).some(
            (val) =>
                val instanceof File ||
                (Array.isArray(val) && val.some((v) => v instanceof File)),
        );

        if (hasFiles) {
            // Fix for PHP dropping string values when mixed with files in the same array key
            Object.keys(submitData).forEach((key) => {
                const val = submitData[key];
                if (Array.isArray(val) && val.some((v) => v instanceof File)) {
                    const files = val.filter((v) => v instanceof File);
                    const strings = val.filter((v) => typeof v === 'string');

                    submitData[key] = files;
                    if (strings.length > 0) {
                        submitData[`existing_${key}`] = strings;
                    }
                }
            });

            if (method === 'put' || method === 'patch') {
                finalMethod = 'post';
                submitData['_method'] = method.toUpperCase();
            }
        }

        const routerOptions = {
            preserveScroll: options.preserveScroll ?? true,
            preserveState: options.preserveState ?? true,
            onStart: () => {
                processing.value = true;
            },
            onSuccess: () => {
                processing.value = false;
                options.onSuccess?.();
            },
            onError: (serverErrors: any) => {
                processing.value = false;
                Object.entries(serverErrors).forEach(([key, value]) => {
                    errors[key] = Array.isArray(value)
                        ? value[0]
                        : String(value);
                });
                options.onError?.(errors);
            },
            onFinish: () => {
                processing.value = false;
            },
        };

        if (finalMethod === 'get') {
            router.get(url, submitData, routerOptions);
        } else if (finalMethod === 'post') {
            router.post(url, submitData, routerOptions);
        } else if (finalMethod === 'put') {
            router.put(url, submitData, routerOptions);
        } else if (finalMethod === 'patch') {
            router.patch(url, submitData, routerOptions);
        } else if (finalMethod === 'delete') {
            router.delete(url, { ...routerOptions, data: submitData });
        }
    };

    const get = (url: string, options?: UseFormOptions) =>
        submit('get', url, options);
    const post = (url: string, options?: UseFormOptions) =>
        submit('post', url, options);
    const put = (url: string, options?: UseFormOptions) =>
        submit('put', url, options);
    const patch = (url: string, options?: UseFormOptions) =>
        submit('patch', url, options);
    const destroy = (url: string, options?: UseFormOptions) =>
        submit('delete', url, options);

    const validate = (
        fields: any[],
        isEditing: boolean = false,
        context: any = {},
    ) => {
        clearErrors();
        let isValid = true;
        fields.forEach((field) => {
            const value = data[field.name];

            // Resolve required: supports boolean or (isEditing, row, context) => boolean
            const isRequired =
                typeof field.required === 'function'
                    ? field.required(isEditing, data, context)
                    : !!field.required;

            if (isRequired) {
                if (
                    value === undefined ||
                    value === null ||
                    value === '' ||
                    (Array.isArray(value) && value.length === 0)
                ) {
                    errors[field.name] = `${field.label} is required`;
                    isValid = false;
                }
            }

            // ✅ Validate min/max for numbers
            if (
                field.type === 'number' &&
                value !== undefined &&
                value !== null &&
                value !== ''
            ) {
                const numValue = Number(value);
                if (field.min !== undefined && numValue < Number(field.min)) {
                    errors[field.name] =
                        `${field.label} must be at least ${field.min}`;
                    isValid = false;
                }
                if (field.max !== undefined && numValue > Number(field.max)) {
                    errors[field.name] =
                        `${field.label} must be at most ${field.max}`;
                    isValid = false;
                }
            }

            // ✅ Validate min/max for dates
            if (['date', 'datetime-local'].includes(field.type) && value) {
                const dateValue = new Date(value).getTime();
                if (field.min) {
                    const minDate = new Date(field.min).getTime();
                    if (dateValue < minDate) {
                        errors[field.name] =
                            `${field.label} cannot be earlier than ${field.min}`;
                        isValid = false;
                    }
                }
                if (field.max) {
                    const maxDate = new Date(field.max).getTime();
                    if (dateValue > maxDate) {
                        errors[field.name] =
                            `${field.label} cannot be later than ${field.max}`;
                        isValid = false;
                    }
                }
            }

            // ✅ Custom validation function
            if (field.validation && typeof field.validation === 'function') {
                const customError = field.validation(value, data);
                if (customError) {
                    errors[field.name] = customError;
                    isValid = false;
                }
            }

            // ✅ Internal Component Validation Error (e.g. KeyValueField)
            if (value === '__INVALID_KEY_VALUE__') {
                errors[field.name] =
                    `Please resolve the errors in ${field.label}`;
                isValid = false;
            }
        });
        return isValid;
    };

    const submitRaw = async (
        method: 'get' | 'post' | 'put' | 'patch' | 'delete',
        url: string,
        options: UseFormOptions & { fields?: any[] } = {},
    ) => {
        processing.value = true;
        clearErrors();

        const submitData = { ...data };
        if (options.fields) {
            options.fields.forEach((field) => {
                if (field.skipSubmit) {
                    delete submitData[field.name];
                }
                if (
                    field.type === 'vue-select' &&
                    !field.multiple &&
                    field.name in submitData
                ) {
                    submitData[field.name] = extractPrimitive(
                        submitData[field.name],
                    );
                }
            });
        }

        // Automatic method spoofing for PUT/PATCH requests with files
        let finalMethod = method;
        let payload: any = submitData;
        const hasFiles = Object.values(submitData).some(
            (val) =>
                val instanceof File ||
                (Array.isArray(val) && val.some((v) => v instanceof File)),
        );

        if (hasFiles) {
            const formData = new FormData();
            Object.entries(submitData).forEach(([key, val]) => {
                if (Array.isArray(val)) {
                    val.forEach((item) => {
                        const prim = extractPrimitive(item);
                        if (prim instanceof File) {
                            formData.append(`${key}[]`, prim, prim.name);
                        } else if (prim !== null && prim !== undefined) {
                            formData.append(`${key}[]`, prim);
                        }
                    });
                } else if (val instanceof File) {
                    formData.append(key, val, val.name);
                } else if (val !== null && val !== undefined) {
                    const prim = extractPrimitive(val);
                    if (prim instanceof File) {
                        formData.append(key, prim, prim.name);
                    } else if (prim !== null && prim !== undefined) {
                        formData.append(key, prim);
                    }
                }
            });
            payload = formData;
        }

        if (hasFiles && (method === 'put' || method === 'patch')) {
            finalMethod = 'post';
            if (payload instanceof FormData) {
                payload.append('_method', method.toUpperCase());
            } else {
                payload['_method'] = method.toUpperCase();
            }
        }

        try {
            const response = await (axios as any)({
                method: finalMethod,
                url,
                data: finalMethod === 'get' ? undefined : payload,
                params: finalMethod === 'get' ? payload : undefined,
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(hasFiles
                        ? { 'Content-Type': 'multipart/form-data' }
                        : {}),
                },
            });

            processing.value = false;
            options.onSuccess?.(response.data);
            return response.data;
        } catch (error: any) {
            processing.value = false;
            if (error.response?.status === 422) {
                const serverErrors = error.response.data.errors;
                Object.entries(serverErrors).forEach(([key, value]) => {
                    errors[key] = Array.isArray(value)
                        ? value[0]
                        : String(value);
                });
                options.onError?.(errors);
                // Return gracefully without throwing so we don't get unhandled promise rejections
                return undefined;
            } else {
                console.error('Submission failed:', error);
                throw error;
            }
        }
    };

    return {
        data,
        errors,
        processing,
        setData,
        setDataBulk,
        setError,
        clearErrors,
        reset,
        validate,
        submit,
        submitRaw, // ✅ NEW
        get,
        post,
        put,
        patch,
        delete: destroy,
    };
}
