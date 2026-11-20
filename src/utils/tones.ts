/**
 * One look for every state badge in a data table. A column that says "Active", "Ready" or "No variant"
 * picks a tone (what the state means) instead of writing its own colours, size and shape, so a Status
 * badge and a Setup badge on the same row read as one family: same height, radius, type size and weight,
 * a soft tint in light mode and a translucent one in dark mode. Literal class strings on purpose:
 * Tailwind cannot see a class built at run time.
 */
export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'neutral';

export const BADGE_BASE = 'inline-flex w-fit items-center gap-1 rounded-md border text-xs font-medium whitespace-nowrap';

export const BADGE_TONE_CLASS: Record<BadgeTone, string> = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-300',
    warning: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/15 dark:text-amber-300',
    danger: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/15 dark:text-rose-300',
    info: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/25 dark:bg-sky-500/15 dark:text-sky-300',
    accent: 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/25 dark:bg-indigo-500/15 dark:text-indigo-300',
    neutral: 'border-slate-200 bg-slate-100 text-slate-600 dark:border-white/15 dark:bg-white/10 dark:text-neutral-300',
};

/** The tone as a class string for a `badgeConfig` entry's `class` (the table adds the density padding itself). */
export const toneClass = (tone: BadgeTone): string => BADGE_TONE_CLASS[tone];
