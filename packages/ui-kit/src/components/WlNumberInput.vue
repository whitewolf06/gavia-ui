<script setup lang="ts">
import { ref, watch } from "vue";
import WlIcon from "./WlIcon.vue";
import type { WlDensity, WlSizeSm } from "../types";

const props = withDefaults(
  defineProps<{
    min?: number;
    max?: number;
    step?: number;
    size?: WlSizeSm;
    density?: WlDensity;
    disabled?: boolean;
    invalid?: boolean;
    ariaLabel?: string;
  }>(),
  {
    min: 0,
    max: 99,
    step: 1,
    size: "md",
    density: "default",
    disabled: false,
    invalid: false
  }
);

const model = defineModel<number>({ default: 0 });

const draft = ref(String(model.value));
watch(model, (value) => {
  draft.value = String(value);
});

function clamp(value: number): number {
  return Math.min(Math.max(value, props.min), props.max);
}

function commit(next: number): void {
  const value = clamp(next);
  draft.value = String(value);
  if (value !== model.value) model.value = value;
}

function bump(direction: 1 | -1): void {
  if (props.disabled) return;
  commit((model.value ?? 0) + direction * props.step);
}

function commitDraft(): void {
  const parsed = Number.parseFloat(draft.value.replace(",", "."));
  commit(Number.isNaN(parsed) ? model.value : parsed);
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === "ArrowUp") {
    event.preventDefault();
    bump(1);
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    bump(-1);
  }
}
</script>

<template>
  <div class="wl-stepper" :class="{ 'is-disabled': disabled }" data-wl="number-input" :data-size="size">
    <button
      type="button"
      class="wl-stepper__btn"
      :disabled="disabled"
      aria-label="Уменьшить"
      @click="bump(-1)"
    >
      <WlIcon name="minus" :size="14" />
    </button>
    <input
      v-model="draft"
      class="wl-input wl-stepper__input"
      :class="[
        `wl-input--${size}`,
        invalid && 'is-invalid',
        disabled && 'is-disabled',
        density === 'compact' && 'is-compact'
      ]"
      type="text"
      inputmode="numeric"
      :disabled="disabled"
      :aria-label="ariaLabel"
      :aria-invalid="invalid || undefined"
      @blur="commitDraft"
      @keydown.enter="commitDraft"
      @keydown="onKeydown"
    />
    <button
      type="button"
      class="wl-stepper__btn"
      :disabled="disabled"
      aria-label="Увеличить"
      @click="bump(1)"
    >
      <WlIcon name="plus" :size="14" />
    </button>
  </div>
</template>
