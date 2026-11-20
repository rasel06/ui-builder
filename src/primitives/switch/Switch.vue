<script setup lang="ts">
import type { SwitchRootEmits, SwitchRootProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { computed } from "vue"
import { reactiveOmit } from "@vueuse/core"
import {
  SwitchRoot,

  SwitchThumb,
  useForwardPropsEmits,
} from "reka-ui"
import { cn } from "../../lib/utils"

// Tailwind's size scale. The thumb travels the track width less the thumb and the 2px border on each side.
type SwitchSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl'

const props = withDefaults(defineProps<SwitchRootProps & { 
  class?: HTMLAttributes["class"],
  size?: SwitchSize
}>(), {
  size: 'md'
})

const emits = defineEmits<SwitchRootEmits>()

const delegatedProps = reactiveOmit(props, "class", "size")

const forwarded = useForwardPropsEmits(delegatedProps, emits)

const sizeClasses: Record<SwitchSize, string> = {
  xs: 'h-3 w-6',
  sm: 'h-4 w-8',
  md: 'h-6 w-11',
  lg: 'h-7 w-12',
  xl: 'h-8 w-[60px]',
  '2xl': 'h-9 w-16',
  '3xl': 'h-10 w-[72px]',
  '4xl': 'h-12 w-[88px]',
  '5xl': 'h-14 w-[104px]',
  '6xl': 'h-16 w-[120px]',
  '7xl': 'h-20 w-[152px]',
}

const thumbClasses: Record<SwitchSize, string> = {
  xs: 'h-2 w-2 data-[state=checked]:translate-x-3',
  sm: 'h-3 w-3 data-[state=checked]:translate-x-4',
  md: 'h-5 w-5 data-[state=checked]:translate-x-5',
  lg: 'h-6 w-6 data-[state=checked]:translate-x-5',
  xl: 'h-7 w-7 data-[state=checked]:translate-x-7',
  '2xl': 'h-8 w-8 data-[state=checked]:translate-x-7',
  '3xl': 'h-9 w-9 data-[state=checked]:translate-x-8',
  '4xl': 'h-11 w-11 data-[state=checked]:translate-x-10',
  '5xl': 'h-13 w-13 data-[state=checked]:translate-x-12',
  '6xl': 'h-15 w-15 data-[state=checked]:translate-x-14',
  '7xl': 'h-19 w-19 data-[state=checked]:translate-x-18',
}

// An unknown value (a raw class string) falls back to md rather than rendering an unsized switch.
const sizeKey = computed<SwitchSize>(() => (props.size && props.size in sizeClasses ? props.size : 'md'))
</script>

<template>
  <SwitchRoot
    v-bind="forwarded"
    dir="ltr"
    :class="cn(
      'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--focus-theme-color,#3b82f6)] disabled:cursor-not-allowed disabled:opacity-50 border dark:border-gray-600',
      props.modelValue ? '!bg-[var(--focus-theme-color,#3b82f6)]' : '!bg-gray-300 dark:!bg-gray-700',
      sizeClasses[sizeKey],
      props.class,
    )"
  >
    <SwitchThumb
      :class="cn(
        'pointer-events-none block rounded-full !bg-white shadow-lg ring-0 transition-transform',
        thumbClasses[sizeKey]
      )"
    >
      <slot name="thumb" />
    </SwitchThumb>
  </SwitchRoot>
</template>
