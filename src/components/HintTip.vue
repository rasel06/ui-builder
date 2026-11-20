<script setup lang="ts">
import { Info } from '@lucide/vue';
import { TooltipArrow, TooltipContent, TooltipPortal, TooltipProvider, TooltipRoot, TooltipTrigger } from 'reka-ui';

/**
 * An (i) icon that shows a field's hint as a tooltip, so helper text no longer takes a line
 * of its own under every input. Reachable by keyboard (focus opens it) and carries the text
 * as its accessible name for screen readers. Renders nothing without text.
 */
defineProps<{ text?: string | null }>();
</script>

<template>
    <TooltipProvider v-if="text" :delay-duration="100">
        <TooltipRoot>
            <TooltipTrigger as-child>
                <span
                    role="img"
                    tabindex="0"
                    :aria-label="text"
                    class="ml-1 inline-flex size-4 shrink-0 cursor-help items-center justify-center rounded-full align-middle opacity-60 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-current"
                    @click.prevent
                >
                    <Info class="size-3.5" />
                </span>
            </TooltipTrigger>
            <TooltipPortal>
                <TooltipContent
                    side="top"
                    :side-offset="6"
                    :collision-padding="8"
                    class="z-[200] max-w-xs rounded-md bg-gray-900 px-3 py-1.5 text-xs leading-snug font-normal tracking-normal whitespace-normal text-white shadow-md dark:bg-gray-100 dark:text-gray-900"
                >
                    {{ text }}
                    <TooltipArrow class="fill-gray-900 dark:fill-gray-100" />
                </TooltipContent>
            </TooltipPortal>
        </TooltipRoot>
    </TooltipProvider>
</template>
