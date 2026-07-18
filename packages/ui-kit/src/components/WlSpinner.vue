<script setup lang="ts">
import type { WlSpinnerSize } from "../types";

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
    :aria-label="label"
    data-wl="spinner"
    :data-size="size"
  />
</template>
