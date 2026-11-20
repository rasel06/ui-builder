import type { FormField } from '../types/module';

export const evaluateFieldCondition = (
    condition: any,
    isEditing: boolean,
    row: any,
    auth: any,
) => {
    if (typeof condition === 'function') {
        return condition(isEditing, row, { auth });
    }
    return !!condition;
};

export const evaluateVisibility = (
    field: any,
    isEditing: boolean,
    row: any,
    auth: any,
) => {
    // 1. Explicit 'show' property (priority)
    if (field.show !== undefined) {
        if (typeof field.show === 'function') {
            return field.show(isEditing, row, { auth });
        }
        return field.show !== false;
    }

    // 2. Action-based visibility (fallback)
    if (!isEditing) {
        if (
            evaluateFieldCondition(field.hideOnCreate, false, row, auth) ||
            evaluateFieldCondition(field.showOnlyOnEdit, false, row, auth)
        )
            return false;
    } else {
        if (
            evaluateFieldCondition(field.hideOnEdit, true, row, auth) ||
            evaluateFieldCondition(field.showOnlyOnCreate, true, row, auth)
        )
            return false;
    }
    return true;
};

export const getVisibleFields = (
    fields: any[],
    isEditing: boolean,
    row: any,
    auth: any,
): FormField[] => {
    return fields.filter((f) => evaluateVisibility(f, isEditing, row, auth));
};
