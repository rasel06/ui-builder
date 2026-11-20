import { computed } from 'vue';
import { getThemeHex } from './themes';
import { useTheme } from './useTheme';
import { resolveControlSize, type SizeValue } from '../utils/sizing';

/**
 * The single source for "what a themed form field looks like" outside the
 * ModuleManager framework, for the handful of raw elements on bespoke pages
 * (`purchasing/purchase-orders/create.vue`, `pos/index.vue`) that render their own
 * `<input>`/`<select>` instead of `FormField.vue` — either because they need a real
 * DOM `ref` (e.g. an input a page calls `.focus()` on directly) or because they're
 * dense/label-less UI (a table cell, a compact toolbar control) that doesn't fit
 * FormField.vue's always-labeled contract. Everywhere else, a labeled field should
 * render through `FormField.vue` itself (the same component every ModuleManager
 * module's dialog uses) rather than a parallel styled-alike element — this composable
 * exists only to keep those few raw exceptions pixel-identical to it, not to be a
 * second field-rendering system.
 */
/** `xs` … `7xl`, or raw Tailwind classes applied as given (utils/sizing.ts), the same sizes FormField takes. */
export type FieldSize = SizeValue;

export function useThemedFieldStyle() {
    const { activeTheme, activeThemeName } = useTheme();

    const inputClass = computed(
        () =>
            `${activeTheme.value.inputBackground} ${activeTheme.value.inputBorder} ${activeTheme.value.inputText}`,
    );
    const focusColor = computed(() => getThemeHex(activeThemeName.value));
    const inputStyle = computed(
        () =>
            ({ '--focus-theme-color': focusColor.value }) as Record<
                string,
                string
            >,
    );

    /**
     * The same size recipe FormField.vue uses (utils/sizing.ts: height and padding set
     * inline for a token), so a raw element built from this stays pixel-identical to a
     * FormField of the same size.
     */
    const fieldSize = (size: FieldSize = 'md', iconInset = false) => {
        // Raw classes keep their own height and padding; only what they leave out is set inline.
        const control = resolveControlSize(size);
        return {
            style: {
                ...inputStyle.value,
                ...control.heightStyle,
                ...control.padStyle,
                ...(iconInset ? { paddingLeft: '36px' } : {}),
            } as Record<string, string>,
            class: control.className,
        };
    };

    return {
        activeTheme,
        activeThemeName,
        inputClass,
        focusColor,
        inputStyle,
        fieldSize,
    };
}
