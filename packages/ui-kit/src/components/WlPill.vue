<script setup lang="ts">
import type { WlPillVariant } from "../types";

withDefaults(
  defineProps<{
    variant?: WlPillVariant;
    label?: string;
  }>(),
  {
    variant: "neutral"
  }
);
</script>

<template>
  <span class="wl-pill" :class="`wl-pill--${variant}`" data-wl="pill" :data-variant="variant">
    <slot>{{ label }}</slot>
  </span>
</template>
