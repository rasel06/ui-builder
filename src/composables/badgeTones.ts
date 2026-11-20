import { h } from 'vue';
import { DENSITY_CONFIGS } from './themes';
import type { DensityType } from '../types/module';
import { BADGE_BASE, BADGE_TONE_CLASS, type BadgeTone } from '../utils/tones';

export { BADGE_BASE, BADGE_TONE_CLASS, toneClass, type BadgeTone } from '../utils/tones';

/** A ready-made badge vnode for a `custom` column, padded to the table's current density. */
export const renderToneBadge = (label: string, tone: BadgeTone, density: DensityType = 'normal', title?: string) =>
    h(
        'span',
        {
            class: `${BADGE_BASE} ${DENSITY_CONFIGS[density]?.badgePadding ?? DENSITY_CONFIGS.normal.badgePadding} ${BADGE_TONE_CLASS[tone]}`,
            title: title ?? label,
        },
        label,
    );
