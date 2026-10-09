<script setup lang="ts">
import { useWlLocaleText } from "../config";
import type { WlSpinnerSize } from "../types";
const localeText = useWlLocaleText();

withDefaults(
  defineProps<{
    size?: WlSpinnerSize;
    light?: boolean;
    label?: string;
  }>(),
  {
    size: "md",
    light: false,
    label: "Загрузка"
  }
);
</script>

<template>
  <span
    class="wl-spinner"
    :class="[`wl-spinner--${size}`, light && 'wl-spinner--light']"
    role="status"
    :aria-label="localeText('label', label, 'loading')"
    data-wl="spinner"
    :data-size="size"
  />
</template>
