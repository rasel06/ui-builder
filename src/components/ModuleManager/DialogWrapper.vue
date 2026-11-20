<template>
    <Teleport to="body">
        <Transition name="dialog-backdrop">
            <div
                v-if="isOpen"
                :class="[
                    'fixed inset-0 flex items-center justify-center',
                    isScreen ? 'p-0' : 'p-4',
                    props.zClass || 'z-50',
                ]"
                @click.self="props.closeOnBackdrop && handleClose()"
            >
                <div class="dialog-backdrop" />

                <Transition name="dialog-panel" appear>
                    <div
                        v-if="isOpen"
                        role="dialog"
                        aria-modal="true"
                        :aria-labelledby="titleId"
                        :class="`dialog-panel relative flex w-full flex-col ${dialogSizeClass} ${isScreen ? 'h-dvh max-h-dvh rounded-none border-0' : 'max-h-[90vh] min-h-[300px] rounded-xl border'} overflow-hidden ${theme.cardBackground} ${theme.cardBorder} shadow-2xl`"
                        @click.stop
                    >
                        <div
                            :class="[
                                'sticky top-0 z-10 flex shrink-0 items-center justify-between border-b bg-white dark:bg-gray-900',
                                headerPaddingClass,
                            ]"
                        >
                            <h2
                                :id="titleId"
                                :class="`text-xl font-semibold ${theme.headerText}`"
                            >
                                {{ title }}
                            </h2>
                            <button
                                @click="handleClose"
                                class="rounded-lg p-1.5 transition-all duration-150 hover:scale-110 hover:bg-gray-100 active:scale-95 dark:hover:bg-gray-800"
                                :aria-label="resolveLabel('ui-builder.close_dialog')"
                            >
                                <X class="h-5 w-5" />
                            </button>
                        </div>

                        <div
                            :class="[
                                'flex-grow overflow-y-auto',
                                bodyPaddingClass,
                            ]"
                        >
                            <slot />
                        </div>

                        <div
                            v-if="$slots.footer"
                            :class="[
                                'flex shrink-0 items-center justify-end border-t bg-transparent dark:bg-gray-900',
                                footerPaddingClass,
                            ]"
                        >
                            <slot name="footer" />
                        </div>
                    </div>
                </Transition>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { resolveLabel } from '../../i18n';
import { X } from '@lucide/vue';
import { computed, onBeforeUnmount, onMounted, useId } from 'vue';
import type { DialogSize, ThemeConfig } from '../../types/module';
import { dialogWidthClass, isScreenDialog } from '../../utils/sizing';

interface Props {
    isOpen: boolean;
    title: string;
    dialogSize?: DialogSize;
    theme: ThemeConfig;
    density?: 'compact' | 'normal' | 'relaxed';
    closeOnBackdrop?: boolean;
    closeOnEscape?: boolean;
    /** Optional custom z-index class for stacked dialogs */
    zClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
    dialogSize: '2xl',
    density: 'normal',
    closeOnBackdrop: true,
    closeOnEscape: true,
});

const emit = defineEmits<{
    'update:isOpen': [value: boolean];
    close: [];
}>();

const titleId = `dialog-title-${useId()}`;

// Widths come from the shared scale (utils/sizing.ts): 3xs … 7xl, full, screen, or raw classes as given.
const dialogSizeClass = computed(() => dialogWidthClass(props.dialogSize));
const isScreen = computed(() => isScreenDialog(props.dialogSize));

const headerPaddingClass = computed(() => {
    if (props.density === 'compact') return 'px-4 py-2';
    if (props.density === 'relaxed') return 'px-8 py-4';
    return 'px-6 py-3';
});

const bodyPaddingClass = computed(() => {
    if (props.density === 'compact') return 'p-4';
    if (props.density === 'relaxed') return 'p-8';
    return 'p-6';
});

const footerPaddingClass = computed(() => {
    if (props.density === 'compact') return 'px-4 py-2';
    if (props.density === 'relaxed') return 'px-8 py-4';
    return 'px-6 py-3';
});

const handleClose = () => {
    emit('update:isOpen', false);
    emit('close');
};

const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.isOpen && props.closeOnEscape) {
        handleClose();
    }
};

onMounted(() => {
    window.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
.dialog-backdrop-enter-active {
    transition: opacity 0.25s ease;
}
.dialog-backdrop-leave-active {
    transition: opacity 0.2s ease;
}
.dialog-backdrop-enter-from,
.dialog-backdrop-leave-to {
    opacity: 0;
}

.dialog-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
}

.dialog-panel-enter-active {
    transition:
        opacity 0.28s cubic-bezier(0.34, 1.56, 0.64, 1),
        transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.dialog-panel-leave-active {
    transition:
        opacity 0.18s ease-in,
        transform 0.18s ease-in;
}
.dialog-panel-enter-from {
    opacity: 0;
    transform: translateY(20px) scale(0.96);
}
.dialog-panel-leave-to {
    opacity: 0;
    transform: translateY(12px) scale(0.97);
}
</style>
