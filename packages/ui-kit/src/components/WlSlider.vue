<script setup lang="ts">
import { computed } from "vue";
import type { WlNoModelModifiers } from "../model-types";

const props = withDefaults(
  defineProps<{
    modelModifiers?: WlNoModelModifiers;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    ariaLabel?: string;
  }>(),
  {
    min: 0,
    max: 100,
    step: 1,
    disabled: false
  }
);

const model = defineModel<number, never>({ default: 0 });
const minimum = computed(() => Number.isFinite(props.min) ? props.min : 0);
const maximum = computed(() => Math.max(minimum.value, Number.isFinite(props.max) ? props.max : 100));
const increment = computed(() => Number.isFinite(props.step) && props.step > 0 ? props.step : 1);
const currentValue = computed(() => Math.min(Math.max(
  Number.isFinite(model.value) ? model.value : minimum.value, minimum.value), maximum.value));

const pct = computed(() => {
  const span = maximum.value - minimum.value;
  if (span <= 0) return 0;
  // Opposite finite extremes can still overflow their subtraction.
  const share = Number.isFinite(span) ? (currentValue.value - minimum.value) / span
    : (currentValue.value / 2 - minimum.value / 2) / (maximum.value / 2 - minimum.value / 2);
  return Math.min(Math.max(share * 100, 0), 100);
});

function onInput(event: Event): void {
  if (props.disabled) return;
  const value = Number((event.target as HTMLInputElement).value);
  if (Number.isFinite(value)) model.value = Math.min(Math.max(value, minimum.value), maximum.value);
}
</script>

<template>
  <input
    type="range"
    class="wl-slider"
    :class="{ 'is-disabled': disabled }"
    :style="{ '--wl-slider-pct': `${pct}%` }"
    :min="minimum"
    :max="maximum"
    :step="increment"
    :value="currentValue"
    :disabled="disabled"
    :aria-label="ariaLabel"
    data-wl="slider"
    @input="onInput"
  />
</template>
