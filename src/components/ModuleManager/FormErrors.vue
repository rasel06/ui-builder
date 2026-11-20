<template>
    <!-- <div
        v-if="hasErrors"
        :class="`rounded-lg border p-4 ${theme.errorBackground} ${theme.errorBorderColor} col-span-12`"
    >
        <div class="flex items-start gap-2">
            <svg
                :class="`h-5 w-5 ${theme.errorText}`"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
            >
                <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                />
            </svg>
            <div>
                <h3 :class="`font-semibold ${theme.errorText}`">
                    Please fix the following errors:
                </h3>
                <ul
                    :class="`mt-2 list-inside list-disc space-y-1 text-sm ${theme.errorText}`"
                >
                    <li v-for="(error, field) in errors" :key="field">
                        {{ error }}
                    </li>
                </ul>
            </div>
        </div>
    </div> -->
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { FormErrors, ThemeConfig } from '../../types/module';

interface Props {
    errors: FormErrors;
    theme: ThemeConfig;
}

const props = defineProps<Props>();

const hasErrors = computed(() => Object.keys(props.errors).length > 0);
</script>
