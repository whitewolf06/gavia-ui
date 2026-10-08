<script setup lang="ts">
import type { WlPt } from "../pt-types";
import { computed } from "vue";
import { useWlPt } from "../config";
import type { WlProgressVariant } from "../types";

defineSlots<{}>();
const props = withDefaults(
  defineProps<{
    value?: number;
    variant?: WlProgressVariant;
    thin?: boolean;
    showValue?: boolean;
    pt?: WlPt<"progressbar">;
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
const percent = computed(() => Number.isFinite(props.value) ? Math.max(0, Math.min(100, props.value)) : 0);
</script>

<template>
  <div v-bind="section('root')" :class="rootClass" role="progressbar" :aria-valuenow="percent" aria-valuemin="0" aria-valuemax="100" data-wl="progress" :data-variant="variant">
    <div v-bind="section('value')" class="wl-progress__value" :style="{ width: percent + '%' }" />
    <span v-if="showValue" v-bind="section('label')" class="wl-progress__label">{{ percent }}%</span>
  </div>
</template>
