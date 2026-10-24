<script setup lang="ts">
/** WlSpinner public component contract.
 * @since 0.1.0
 */
import { computed } from "vue";
import type { WlSpinnerSize } from "../types";
import { useWlLocale } from "../config";
const props = withDefaults(
  defineProps<{
    /**
     * Size.
     * @default "md"
     */
    size?: WlSpinnerSize;
    /**
     * Light variant for dark backgrounds.
     * @default false
     */
    light?: boolean;
    /**
     * aria-label; uses locale.loading when omitted or undefined (English: Loading).
     * @default undefined
     */
    label?: string;
  }>(),
  {
    size: "md",
    light: false
  }
);

const locale = useWlLocale();
const label = computed(() => props.label ?? locale.value.loading);
</script>

<template>
  <span
    class="wl-spinner"
    :class="[`wl-spinner--${size}`, light && 'wl-spinner--light']"
    role="status"
    :aria-label="label"
    data-wl="spinner"
    :data-size="size"
  ></span>
</template>
