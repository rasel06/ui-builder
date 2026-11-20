/**
 * The one place ui-builder turns a size into pixels or Tailwind classes.
 *
 * Every component (FormField and its vue-select, KeyValueField, the themed raw-input helper,
 * switches, avatars, dialogs and the form grids) reads from here, so a size means the same
 * thing everywhere. A size is either a token from Tailwind's own scale (`xs` … `7xl`) or any
 * Tailwind class string (`h-12 text-xl`, `h-[52px]`, `h-10 md:h-14`), which is applied as given.
 *
 * Every class below is written out literally on purpose: Tailwind only generates classes it can
 * find in the source, so a class built at runtime from pieces would never exist.
 */

export const SIZE_SCALE = [
    'xs',
    'sm',
    'md',
    'lg',
    'xl',
    '2xl',
    '3xl',
    '4xl',
    '5xl',
    '6xl',
    '7xl',
] as const;

export type SizeToken = (typeof SIZE_SCALE)[number];

/** A size token, or Tailwind classes applied as given. */
export type SizeValue = SizeToken | (string & {});

export const isSizeToken = (value: unknown): value is SizeToken =>
    typeof value === 'string' &&
    (SIZE_SCALE as readonly string[]).includes(value);

// ── Controls (inputs, selects, pickers) ─────────────────────────────────────

interface ControlMetric {
    /** Outer height in px. */
    height: number;
    /** Left/right padding in px. */
    padX: number;
    /** Text-size class for the control. */
    text: string;
    /** Icon size in px for icons drawn inside the control. */
    icon: number;
    /** vue-select search font size; unset keeps vue-select's own 1rem (no iOS focus zoom). */
    vsFont?: string;
    /** Rich-text editor body font (sm to lg keep the editor's existing 14px). */
    editorFont: string;
}

/** sm to xl are the exact pixels these controls always had; the rest extend the same steps. */
const CONTROL_METRICS: Record<SizeToken, ControlMetric> = {
    xs: { height: 28, padX: 6, text: 'text-xs', icon: 14, editorFont: '0.75rem' },
    sm: { height: 32, padX: 8, text: 'text-sm', icon: 16, editorFont: '0.875rem' },
    md: { height: 36, padX: 8, text: 'text-base', icon: 16, editorFont: '0.875rem' },
    lg: { height: 40, padX: 12, text: 'text-base', icon: 18, editorFont: '0.875rem' },
    xl: { height: 44, padX: 12, text: 'text-lg', icon: 20, editorFont: '1rem' },
    '2xl': { height: 48, padX: 14, text: 'text-xl', icon: 20, vsFont: '1.25rem', editorFont: '1.125rem' },
    '3xl': { height: 56, padX: 16, text: 'text-2xl', icon: 24, vsFont: '1.5rem', editorFont: '1.25rem' },
    '4xl': { height: 64, padX: 18, text: 'text-3xl', icon: 28, vsFont: '1.875rem', editorFont: '1.5rem' },
    '5xl': { height: 72, padX: 20, text: 'text-4xl', icon: 32, vsFont: '2.25rem', editorFont: '1.875rem' },
    '6xl': { height: 88, padX: 24, text: 'text-5xl', icon: 40, vsFont: '3rem', editorFont: '2.25rem' },
    '7xl': { height: 104, padX: 28, text: 'text-6xl', icon: 48, vsFont: '3.75rem', editorFont: '3rem' },
};

export interface ControlSize {
    /** The token, or the token nearest a raw class string's height. */
    token: SizeToken;
    /** The raw classes as given; '' for a token. */
    raw: string;
    /** CSS length of the control's base height (for parts that sit beside it). */
    height: string;
    /** Approximate base height in px. */
    heightPx: number;
    iconPx: number;
    /** Classes for the control: the token's text class, or the raw classes plus whatever they leave out. */
    className: string;
    /** Text-size classes only (for parts that must not take a height: textarea, labels, editor). */
    textClass: string;
    /** Width and height of a small box drawn at this size (checkbox, radio, inline icon). */
    iconStyle: Record<string, string>;
    /** Rich-text editor body font size. */
    editorFont: string;
    /** Inline height, only when no class sets one. */
    heightStyle: Record<string, string>;
    /** Inline min-height matching the known base height (multi-selects grow from it). */
    minHeightStyle: Record<string, string>;
    /** Inline left/right padding, only when no class sets padding. */
    padStyle: Record<string, string>;
    /** vue-select variables, only when the height is fixed inline (else the inner parts follow the root). */
    vars: Record<string, string>;
}

/** The utility part of a class, without variants (`md:`, `@lg:`, `hover:`) or the `!` marker. */
const utilityOf = (cls: string): { utility: string; hasVariant: boolean } => {
    let depth = 0;
    let cut = -1;
    for (let i = 0; i < cls.length; i++) {
        const ch = cls[i];
        if (ch === '[' || ch === '(') depth++;
        else if (ch === ']' || ch === ')') depth--;
        else if (ch === ':' && depth === 0) cut = i;
    }
    const utility = cls.slice(cut + 1).replace(/^!|!$/g, '');
    return { utility, hasVariant: cut >= 0 };
};

const HEIGHT_RE = /^(?:h|size)-(.+)$/;
const PADDING_RE = /^(?:p|px|ps|pe|pl|pr)-/;
const TEXT_SIZE_RE = /^text-(?:xs|sm|base|lg|xl|[2-9]xl|\[\d[^\]]*\])$/;

/** Reads a plain Tailwind height value (`12`, `px`, `[52px]`, `[3rem]`) into CSS and px. */
const parseHeightValue = (value: string): { css: string; px: number } | null => {
    if (value === 'px') return { css: '1px', px: 1 };
    if (/^\d+(?:\.\d+)?$/.test(value)) {
        const units = parseFloat(value);
        return { css: `${units * 0.25}rem`, px: units * 4 };
    }
    const arbitrary = value.match(/^\[(\d+(?:\.\d+)?)(px|rem|em)\]$/);
    if (arbitrary) {
        const amount = parseFloat(arbitrary[1]);
        const px = arbitrary[2] === 'px' ? amount : amount * 16;
        return { css: `${amount}${arbitrary[2]}`, px };
    }
    return null;
};

const nearestToken = (px: number): SizeToken => {
    let best: SizeToken = 'md';
    let bestGap = Infinity;
    for (const token of SIZE_SCALE) {
        const gap = Math.abs(CONTROL_METRICS[token].height - px);
        if (gap < bestGap) {
            best = token;
            bestGap = gap;
        }
    }
    return best;
};

const tokenControl = (token: SizeToken): ControlSize => {
    const m = CONTROL_METRICS[token];
    const height = `${m.height}px`;
    const vars: Record<string, string> = {
        '--ub-control-h': height,
        '--ub-control-lh': `${m.height - 4}px`,
    };
    if (m.vsFont) {
        vars['--vs-font-size'] = m.vsFont;
        vars['--ub-vs-pad'] = `${m.padX - 6}px`;
    }
    return {
        token,
        raw: '',
        height,
        heightPx: m.height,
        iconPx: m.icon,
        className: m.text,
        textClass: m.text,
        iconStyle: { width: `${m.icon}px`, height: `${m.icon}px` },
        editorFont: m.editorFont,
        heightStyle: { height },
        minHeightStyle: { minHeight: height },
        padStyle: { paddingLeft: `${m.padX}px`, paddingRight: `${m.padX}px` },
        vars,
    };
};

/**
 * Resolves a control size. A token gives its fixed metrics; a class string is applied as given and the
 * inline style only fills what it leaves out, so responsive classes (`md:h-14`) are never overridden.
 */
export const resolveControlSize = (
    size?: SizeValue | null,
    fallback: SizeToken = 'md',
): ControlSize => {
    const value = typeof size === 'string' ? size.trim() : '';
    if (!value) return tokenControl(fallback);
    if (isSizeToken(value)) return tokenControl(value);

    let definesHeight = false;
    let definesPadding = false;
    let definesText = false;
    let baseHeight: { css: string; px: number } | null = null;
    const textClasses: string[] = [];

    for (const cls of value.split(/\s+/)) {
        const { utility, hasVariant } = utilityOf(cls);
        const height = utility.match(HEIGHT_RE);
        if (height) {
            definesHeight = true;
            if (!hasVariant) baseHeight = parseHeightValue(height[1]) ?? baseHeight;
        }
        if (PADDING_RE.test(utility)) definesPadding = true;
        if (TEXT_SIZE_RE.test(utility)) {
            definesText = true;
            textClasses.push(cls);
        }
    }

    const token = baseHeight ? nearestToken(baseHeight.px) : fallback;
    const base = tokenControl(token);
    const height = baseHeight?.css ?? base.height;

    return {
        token,
        raw: value,
        height,
        heightPx: baseHeight?.px ?? base.heightPx,
        iconPx: base.iconPx,
        className: definesText ? value : `${base.className} ${value}`,
        textClass: definesText ? textClasses.join(' ') : base.textClass,
        iconStyle: base.iconStyle,
        editorFont: base.editorFont,
        heightStyle: definesHeight ? {} : base.heightStyle,
        minHeightStyle: { minHeight: height },
        padStyle: definesPadding ? {} : base.padStyle,
        vars: definesHeight ? {} : base.vars,
    };
};

/** The scale token for a size (a raw class string maps to the token nearest its height). */
export const sizeToken = (size?: SizeValue | null, fallback: SizeToken = 'md'): SizeToken =>
    resolveControlSize(size, fallback).token;

// ── Avatars ────────────────────────────────────────────────────────────────

export const AVATAR_SIZES: Record<SizeToken, string> = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
    '2xl': 'h-20 w-20 text-xl',
    '3xl': 'h-24 w-24 text-2xl',
    '4xl': 'h-28 w-28 text-3xl',
    '5xl': 'h-32 w-32 text-4xl',
    '6xl': 'h-40 w-40 text-5xl',
    '7xl': 'h-48 w-48 text-6xl',
};

/** Avatar classes for a token, or the raw classes as given. */
export const avatarSizeClass = (size?: SizeValue | null): string =>
    isSizeToken(size) ? AVATAR_SIZES[size] : size || AVATAR_SIZES.md;

// ── Dialogs ────────────────────────────────────────────────────────────────

/** Tailwind's container scale for dialog widths, plus full and screen (edge to edge). */
export const DIALOG_WIDTH_SCALE = [
    '3xs',
    '2xs',
    ...SIZE_SCALE,
    'full',
    'screen',
] as const;

export type DialogWidthToken = (typeof DIALOG_WIDTH_SCALE)[number];

const DIALOG_WIDTHS: Record<DialogWidthToken, string> = {
    '3xs': 'max-w-3xs',
    '2xs': 'max-w-2xs',
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
    screen: 'max-w-none',
};

export const isScreenDialog = (size?: string | null): boolean => size === 'screen';

/** Width class for a dialog: a scale token, or raw classes (`max-w-[60rem]`) as given. */
export const dialogWidthClass = (size?: string | null): string => {
    if (!size) return DIALOG_WIDTHS['2xl'];
    return (DIALOG_WIDTHS as Record<string, string>)[size] ?? size;
};

// ── Form grid widths (12 columns, container queries) ─────────────────────────

/**
 * One literal class string per column span. Breakpoints are the form's own width (container
 * queries), so a field sits the same in a narrow dialog and on a full page. Spans 2 to 10 keep the
 * exact breakpoints the old fraction tables used (1/5 was span 2, 2/5 span 5, 3/5 span 7, 4/5 span 10).
 */
const SPAN_CLASSES: Record<number, string> = {
    1: 'col-span-12 @md:col-span-4 @2xl:col-span-2 @4xl:col-span-1',
    2: 'col-span-12 @lg:col-span-6 @3xl:col-span-2',
    3: 'col-span-12 @lg:col-span-6 @3xl:col-span-3',
    4: 'col-span-12 @lg:col-span-6 @2xl:col-span-4',
    5: 'col-span-12 @3xl:col-span-5',
    6: 'col-span-12 @md:col-span-6',
    7: 'col-span-12 @3xl:col-span-7',
    8: 'col-span-12 @2xl:col-span-8',
    9: 'col-span-12 @3xl:col-span-9',
    10: 'col-span-12 @3xl:col-span-10',
    11: 'col-span-12 @3xl:col-span-11',
    12: 'col-span-12',
};

/** Columns (of 12) a width takes, or null when it is not a fraction or `full`. */
export const gridSpanOf = (width?: string | null): number | null => {
    if (!width || width === 'full') return 12;
    const fraction = width.match(/^(\d+)\/(\d+)$/);
    if (!fraction) return null;
    const top = Number(fraction[1]);
    const bottom = Number(fraction[2]);
    if (!bottom || !top) return null;
    return Math.min(12, Math.max(1, Math.round((12 * top) / bottom)));
};

/**
 * Grid classes for a field or group width: any fraction (`1/2`, `5/12`, `1/6`, `2/5` …) or `full`,
 * or raw `col-*` classes as given. Anything else takes the full row.
 */
export const gridWidthClass = (width?: string | null): string => {
    const span = gridSpanOf(width);
    if (span !== null) return SPAN_CLASSES[span];
    return width && /(?:^|[\s:])col-/.test(width) ? width : SPAN_CLASSES[12];
};
