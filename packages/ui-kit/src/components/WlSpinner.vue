<script setup lang="ts">
/** WlSpinner public component contract.
 * @since 0.1.0
 */
import type { WlSpinnerSize } from "../types";
import { useWlLocaleText } from "../config";
withDefaults(
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
     * aria-label.
     * @default "Загрузка"
     */
    label?: string;
  }>(),
  {
    size: "md",
    light: false,
    label: "Загрузка"
  }
);

const localeText = useWlLocaleText();

</script>

<template>
  <span
    class="wl-spinner"
    :class="[`wl-spinner--${size}`, light && 'wl-spinner--light']"
    role="status"
    :aria-label="localeText('label', label, 'loading')"
    data-wl="spinner"
    :data-size="size"
  ></span>
</template>
