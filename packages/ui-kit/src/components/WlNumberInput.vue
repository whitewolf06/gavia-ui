<script setup lang="ts">
import { computed, ref, useAttrs, watch } from "vue";
import WlIcon from "./WlIcon.vue";
import type { WlDensity, WlSizeSm } from "../types";
import { splitInputAttrs } from "../utils/inputAttrs";

defineOptions({ inheritAttrs: false });

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
    decrementLabel?: string;
    incrementLabel?: string;
  }>(),
  {
    min: 0,
    max: 99,
    step: 1,
    size: "md",
    density: "default",
    disabled: false,
    invalid: false,
    decrementLabel: "Уменьшить",
    incrementLabel: "Увеличить"
  }
);

const model = defineModel<number>({ default: 0 });
const attrs = useAttrs();

const attrGroups = computed(() => splitInputAttrs(attrs));
const innerAttrs = computed(() => attrGroups.value.inputAttrs);
const rootAttrs = computed(() => attrGroups.value.rootAttrs);
const inputMode = computed(
  () =>
    (typeof innerAttrs.value.inputmode === "string"
      ? innerAttrs.value.inputmode
      : "numeric") as "none" | "text" | "decimal" | "numeric" | "tel" | "search" | "email" | "url"
);

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
  <div
    class="wl-stepper"
    :class="{ 'is-disabled': disabled }"
    v-bind="rootAttrs"
    data-wl="number-input"
    :data-size="size"
    :data-density="density"
  >
    <button
      type="button"
      class="wl-stepper__btn"
      :disabled="disabled"
      :aria-label="decrementLabel"
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
      v-bind="innerAttrs"
      type="text"
      role="spinbutton"
      :inputmode="inputMode"
      :disabled="disabled"
      :aria-label="ariaLabel"
      :aria-invalid="invalid || undefined"
      :aria-valuemin="Number.isFinite(min) ? min : undefined"
      :aria-valuemax="Number.isFinite(max) ? max : undefined"
      :aria-valuenow="model"
      @blur="commitDraft"
      @keydown.enter="commitDraft"
      @keydown="onKeydown"
    />
    <button
      type="button"
      class="wl-stepper__btn"
      :disabled="disabled"
      :aria-label="incrementLabel"
      @click="bump(1)"
    >
      <WlIcon name="plus" :size="14" />
    </button>
  </div>
</template>
