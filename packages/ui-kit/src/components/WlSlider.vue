<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
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

const model = defineModel<number>({ default: 0 });

const pct = computed(() => {
  const span = props.max - props.min;
  if (span <= 0) return 0;
  return Math.min(Math.max(((model.value - props.min) / span) * 100, 0), 100);
});

function onInput(event: Event): void {
  model.value = Number((event.target as HTMLInputElement).value);
}
</script>

<template>
  <input
    type="range"
    class="wl-slider"
    :class="{ 'is-disabled': disabled }"
    :style="{ '--wl-slider-pct': `${pct}%` }"
    :min="min"
    :max="max"
    :step="step"
    :value="model"
    :disabled="disabled"
    :aria-label="ariaLabel"
    data-wl="slider"
    @input="onInput"
  />
</template>
