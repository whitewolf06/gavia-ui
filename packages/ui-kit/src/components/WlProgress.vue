<script setup lang="ts">
import { computed } from "vue";
import ProgressBar from "primevue/progressbar";
import type { WlProgressVariant } from "../types";

const props = withDefaults(
  defineProps<{
    value?: number;
    variant?: WlProgressVariant;
    thin?: boolean;
    showValue?: boolean;
    pt?: Record<string, unknown>;
  }>(),
  {
    value: 0,
    variant: "default",
    thin: false,
    showValue: false
  }
);

const rootClass = computed(() => [
  "wl-progress",
  `wl-progress--${props.variant}`,
  props.thin && "wl-progress--thin"
]);
</script>

<template>
  <ProgressBar
    :value="value"
    :showValue="showValue"
    :class="rootClass"
    :pt="pt"
    data-wl="progress"
    :data-variant="variant"
  />
</template>
