import { csrfToken } from './http';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Tailwind class merge used by every ui-builder component and the vendored primitives. */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/** Opens a URL in a new tab; POST goes through a temporary form (custom actions with target "_blank"). */
export function openInNewTab(
    url: string,
    data: Record<string, any>,
    method: 'GET' | 'POST' = 'GET',
) {
    if (method === 'GET') {
        const queryParams = new URLSearchParams();
        Object.entries(data).forEach(([key, value]) => {
            queryParams.append(
                key,
                typeof value === 'object' ? JSON.stringify(value) : String(value),
            );
        });
        const queryString = queryParams.toString();
        const fullUrl = queryString
            ? `${url}${url.includes('?') ? '&' : '?'}${queryString}`
            : url;
        window.open(fullUrl, '_blank');
        return;
    }

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = url;
    form.target = '_blank';

    const token = csrfToken();
    if (token) {
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_token';
        csrfInput.value = token;
        form.appendChild(csrfInput);
    }

    Object.entries(data).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = typeof value === 'object' ? JSON.stringify(value) : String(value);
        form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
}
