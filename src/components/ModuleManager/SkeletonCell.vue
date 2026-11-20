<template>
    <div v-if="type === 'avatar'" class="flex items-center gap-3">
        <div
            :class="`animate-pulse rounded-full bg-gray-200 dark:bg-gray-700 ${avatarSizeClass}`"
        ></div>
        <div
            class="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
        ></div>
    </div>

    <div
        v-else-if="type === 'badge'"
        :class="`animate-pulse rounded-md bg-gray-200 dark:bg-gray-700 ${badgeSizeClass}`"
    ></div>

    <div v-else-if="type === 'status'" class="flex items-center gap-2">
        <div
            class="h-2 w-2 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"
        ></div>
        <div
            class="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
        ></div>
    </div>

    <div
        v-else
        class="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
    ></div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { DensityType } from '../../types/module';

interface Props {
    type?: string;
    density?: DensityType;
}

const props = withDefaults(defineProps<Props>(), {
    density: 'normal',
});

const avatarSizeClass = computed(() => {
    switch (props.density) {
        case 'compact':
            return 'h-6 w-6';
        case 'relaxed':
            return 'h-8 w-8';
        default:
            return 'h-7 w-7';
    }
});

const badgeSizeClass = computed(() => {
    switch (props.density) {
        case 'compact':
            return 'h-4 w-16';
        case 'relaxed':
            return 'h-6 w-20';
        default:
            return 'h-5 w-20';
    }
});
</script>
