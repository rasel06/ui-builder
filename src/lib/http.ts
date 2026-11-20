/**
 * CSRF for requests ui-builder makes without axios (a raw `fetch`, a form posted to a new tab).
 *
 * Laravel accepts either the plain token (`X-CSRF-TOKEN` header or `_token` field) or the
 * `XSRF-TOKEN` cookie it sets on every response, sent back as an `X-XSRF-TOKEN` header. The
 * cookie path needs nothing from the host page, so it is the default; a `csrf-token` meta tag is
 * used when a page has one, and a host may register its own source with `setCsrfTokenResolver()`.
 */

let resolver: (() => string | null | undefined) | null = null;

export function setCsrfTokenResolver(fn: (() => string | null | undefined) | null): void {
    resolver = fn;
}

/** The plain token, if the host has one available (needed for a form post: forms cannot send headers). */
export function csrfToken(): string | null {
    const fromHost = resolver?.();
    if (fromHost) return fromHost;
    if (typeof document === 'undefined') return null;
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? null;
}

function xsrfCookie(): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}

/** Headers that carry CSRF on a `fetch`: the plain token when known, else the XSRF cookie. */
export function csrfHeaders(): Record<string, string> {
    const token = csrfToken();
    if (token) return { 'X-CSRF-TOKEN': token };
    const cookie = xsrfCookie();
    return cookie ? { 'X-XSRF-TOKEN': cookie } : {};
}
