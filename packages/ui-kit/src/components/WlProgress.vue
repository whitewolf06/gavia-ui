<script setup lang="ts">
import { computed } from "vue";
import { useWlPt } from "../config";
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
const section = useWlPt("progressbar", computed(() => props.pt));
const percent = computed(() => Math.max(0, Math.min(100, props.value)));
</script>

<template>
  <div v-bind="section('root')" :class="rootClass" role="progressbar" :aria-valuenow="percent" aria-valuemin="0" aria-valuemax="100" data-wl="progress" :data-variant="variant">
    <div v-bind="section('value')" class="wl-progress__value" :style="{ width: percent + '%' }" />
    <span v-if="showValue" v-bind="section('label')" class="wl-progress__label">{{ percent }}%</span>
  </div>
</template>
