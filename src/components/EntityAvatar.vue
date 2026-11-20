<script setup lang="ts">
import { Eye } from '@lucide/vue';
import { computed } from 'vue';
import { getThemeHex, readableTextOn, themeColorFamily } from '../composables/themes';
import { useImagePreview } from '../composables/useImagePreview';
import { avatarSizeClass, type SizeValue } from '../utils/sizing';

export interface EntityAvatarProps {
    src?: string | null;
    name?: string | null;
    initial?: string | null;
    theme?: any;
    themeHex?: string | null;
    themeName?: string | null;
    size?: SizeValue;
    rounded?: string;
    previewable?: boolean;
    previewTitle?: string;
    fallbackDefault?: string;
    imageClass?: string;
}

const props = withDefaults(defineProps<EntityAvatarProps>(), {
    src: null,
    name: '',
    initial: null,
    theme: null,
    themeHex: null,
    themeName: null,
    size: 'h-10 w-10',
    rounded: '',
    previewable: true,
    previewTitle: undefined,
    fallbackDefault: 'B',
    imageClass: '',
});

const logoUrl = computed(() => {
    if (!props.src) return null;
    if (
        props.src.startsWith('http://') ||
        props.src.startsWith('https://') ||
        props.src.startsWith('/') ||
        props.src.startsWith('data:') ||
        props.src.startsWith('blob:')
    ) {
        return props.src;
    }
    return `/storage/${props.src}`;
});

const displayInitial = computed(() => {
    if (props.initial) return props.initial.charAt(0).toUpperCase();
    if (props.name && props.name.trim())
        return props.name.trim().charAt(0).toUpperCase();
    return props.fallbackDefault || 'B';
});

const computedThemeHex = computed(() => {
    if (props.themeHex) return props.themeHex;

    const resolvedName =
        props.themeName ||
        (typeof props.theme === 'string' ? props.theme : null) ||
        props.theme?.selectedTheme ||
        themeColorFamily(props.theme?.primaryButton) ||
        props.theme?.name?.toLowerCase() ||
        'blue';

    return getThemeHex(resolvedName);
});

// Initials take whichever text colour reads on the fill; the gradient's second stop moves away from
// that text colour (darker under white, lighter under dark), so both ends stay readable.
const initialColor = computed(() => readableTextOn(computedThemeHex.value));
const fallbackBackground = computed(() => {
    const away = initialColor.value === '#ffffff' ? 'black' : 'white';
    return `linear-gradient(135deg, ${computedThemeHex.value}, color-mix(in srgb, ${computedThemeHex.value} 85%, ${away}))`;
});

// xs … 7xl from the shared scale (utils/sizing.ts), or raw classes (`h-14 w-14`) as given.
const sizeClasses = computed(() => avatarSizeClass(props.size));

const imageRoundedClass = computed(() => props.rounded || 'rounded-lg');
const fallbackRoundedClass = computed(() => props.rounded || 'rounded-xl');

const displayName = computed(() => props.name || 'Logo');

const handlePreview = (e: MouseEvent) => {
    if (!props.previewable || !logoUrl.value) return;
    e.preventDefault();
    e.stopPropagation();
    const { openPreview } = useImagePreview();
    const title = props.previewTitle || `${displayName.value} Logo`;
    openPreview(logoUrl.value, title);
};
</script>

<template>
    <div
        v-if="logoUrl"
        :class="[
            'group/img relative flex flex-shrink-0 items-center justify-center overflow-hidden border border-slate-200 bg-white shadow-2xs transition-all select-none hover:border-blue-400 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-500',
            props.previewable ? 'cursor-pointer' : '',
            sizeClasses,
            imageRoundedClass,
        ]"
        :onClick="handlePreview"
        :title="props.previewable ? 'Click to preview logo' : undefined"
    >
        <img
            :src="logoUrl"
            :alt="displayName"
            :class="[
                'h-full w-full object-contain p-1 transition-transform duration-200 group-hover/img:scale-105',
                props.imageClass,
            ]"
        />
        <div
            v-if="props.previewable"
            class="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40 opacity-0 backdrop-blur-[1px] transition-opacity duration-200 group-hover/img:opacity-100"
        >
            <Eye class="h-4 w-4 text-white drop-shadow" />
        </div>
    </div>

    <div
        v-else
        :class="[
            'flex shrink-0 items-center justify-center font-bold shadow-sm ring-2 ring-black/5 transition-transform duration-200 select-none hover:scale-105 dark:ring-white/10',
            sizeClasses,
            fallbackRoundedClass,
        ]"
        :style="{ background: fallbackBackground, color: initialColor }"
    >
        {{ displayInitial }}
    </div>
</template>
