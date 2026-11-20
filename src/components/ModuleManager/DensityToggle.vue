<!--
  Single, shared density control — used by GenericTable.vue and GenericGrid.vue so
  table density and grid-card density are the same setting, managed from one place
  (a single `useStorage('table-density', ...)` key, kept in sync across every
  instance by vueuse — including a table/grid pair mounted at the same time).
-->
<template>
    <DropdownMenu :modal="false">
        <DropdownMenuTrigger as-child>
            <Button
                variant="ghost"
                :class="
                    cn(
                        'border font-medium flex items-center justify-center',
                        buttonSizeClass,
                        theme.secondaryButton,
                    )
                "
            >
                <AlignJustify class="me-2 h-4 w-4" />
                <span class="hidden sm:inline">{{ t('ui-builder.density') }}</span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
            align="start"
            :class="
                cn(
                    'w-40 border',
                    theme.menuBackground,
                    theme.menuBorder,
                    theme.menuText,
                )
            "
            :collision-padding="8"
        >
            <DropdownMenuLabel :class="theme.menuText">{{
                t('ui-builder.density')
            }}</DropdownMenuLabel>
            <DropdownMenuSeparator :class="theme.toolbarSeparator || 'opacity-20'" />
            <DropdownMenuRadioGroup v-model="density">
                <DropdownMenuRadioItem
                    value="compact"
                    @select.prevent
                    @click="density = 'compact'"
                    :class="theme.menuText"
                >
                    {{ t('ui-builder.compact') }}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                    value="normal"
                    @select.prevent
                    @click="density = 'normal'"
                    :class="theme.menuText"
                >
                    {{ t('ui-builder.normal') }}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                    value="relaxed"
                    @select.prevent
                    @click="density = 'relaxed'"
                    :class="theme.menuText"
                >
                    {{ t('ui-builder.relaxed') }}
                </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
        </DropdownMenuContent>
    </DropdownMenu>
</template>

<script setup lang="ts">
import { storageKey } from '../../lib/storage';
import { computed } from 'vue';
import { useUiI18n } from '../../i18n';
import { useStorage } from '@vueuse/core';
import { cn } from '../../lib/utils';
import { Button } from '../../primitives/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../../primitives/dropdown-menu';
import { AlignJustify } from '@lucide/vue';
import type { DensityType } from '../../types/module';

defineProps<{ theme: Record<string, any> }>();

const { t } = useUiI18n();

const density = useStorage<DensityType>(storageKey('table-density'), 'normal');

const buttonSizeClass = computed(() => {
    if (density.value === 'compact') return 'h-8 text-xs px-3';
    if (density.value === 'relaxed') return 'h-10 text-base px-5';
    return 'h-9 text-sm px-4';
});
</script>
