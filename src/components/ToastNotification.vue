<template>
    <Teleport v-if="isOwner" to="body">
        <div
            class="pointer-events-none fixed top-4 right-4 z-[9999] flex flex-col gap-2"
        >
            <TransitionGroup name="toast">
                <div
                    v-for="toast in toasts"
                    :key="toast.id"
                    :class="`pointer-events-auto max-w-md min-w-[300px] cursor-pointer rounded-lg border p-4 shadow-xl backdrop-blur-sm ${getToastClasses(toast.type)}`"
                    @click="removeToast(toast.id)"
                >
                    <div class="flex items-start gap-3">
                        <div
                            :class="`flex-shrink-0 ${getIconClasses(toast.type)}`"
                        >
                            <component
                                :is="getIcon(toast.type)"
                                class="h-5 w-5"
                            />
                        </div>
                        <div class="min-w-0 flex-1">
                            <p
                                v-if="toast.title"
                                class="mb-1 text-sm font-semibold"
                            >
                                {{ toast.title }}
                            </p>
                            <p class="text-sm">
                                {{ toast.message }}
                            </p>
                        </div>
                        <button
                            @click.stop="removeToast(toast.id)"
                            class="flex-shrink-0 rounded-lg p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                        >
                            <X class="h-4 w-4" />
                        </button>
                    </div>
                    <div
                        v-if="toast.duration"
                        class="absolute bottom-0 left-0 h-1 rounded-b-lg bg-current opacity-20"
                        :style="{
                            width: '100%',
                            animation: `toast-progress ${toast.duration}ms linear`,
                        }"
                    ></div>
                </div>
            </TransitionGroup>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from '@lucide/vue';
import { onMounted } from 'vue';
import { useOverlayOwner } from '../composables/overlayOwner';
import { addToast, listenForToastEvents, removeToast, toasts, type ToastItem } from '../composables/toastStore';

const isOwner = useOverlayOwner('toast');
type Toast = ToastItem;

const getToastClasses = (type: Toast['type']) => {
    const classes = {
        success:
            'bg-green-50 border-green-200 text-green-900 dark:bg-green-950/50 dark:border-green-500/25 dark:text-green-100',
        error: 'bg-red-50 border-red-200 text-red-900 dark:bg-red-950/50 dark:border-red-500/25 dark:text-red-100',
        warning:
            'bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-950/50 dark:border-yellow-500/25 dark:text-yellow-100',
        info: 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/50 dark:border-blue-500/25 dark:text-blue-100',
    };
    return classes[type];
};

const getIconClasses = (type: Toast['type']) => {
    const classes = {
        success: 'text-green-600 dark:text-green-400',
        error: 'text-red-600 dark:text-red-400',
        warning: 'text-yellow-600 dark:text-yellow-400',
        info: 'text-blue-600 dark:text-blue-400',
    };
    return classes[type];
};

const getIcon = (type: Toast['type']) => {
    const icons = {
        success: CheckCircle,
        error: AlertCircle,
        warning: AlertTriangle,
        info: Info,
    };
    return icons[type];
};

onMounted(() => listenForToastEvents());

// Kept for callers that hold a ref to this component.
defineExpose({ addToast, removeToast });
</script>

<style scoped>
.toast-enter-active {
    animation: toast-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-leave-active {
    animation: toast-out 0.25s cubic-bezier(0.4, 0, 1, 1);
}

.toast-move {
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes toast-in {
    from {
        opacity: 0;
        transform: translateX(100%) scale(0.9);
    }
    to {
        opacity: 1;
        transform: translateX(0) scale(1);
    }
}

@keyframes toast-out {
    from {
        opacity: 1;
        transform: translateX(0) scale(1);
    }
    to {
        opacity: 0;
        transform: translateX(100%) scale(0.9);
    }
}

@keyframes toast-progress {
    from {
        width: 100%;
    }
    to {
        width: 0%;
    }
}
</style>
