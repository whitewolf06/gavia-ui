<script setup lang="ts">
import { useWlLocaleText } from "../config";
import { computed, ref, useAttrs, watch } from "vue";
import WlIcon from "./WlIcon.vue";
import type { WlDensity, WlSizeSm } from "../types";
import type { WlNoModelModifiers } from "../model-types";
import { splitInputAttrs } from "../utils/inputAttrs";
const localeText = useWlLocaleText();

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    modelModifiers?: WlNoModelModifiers;
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

const model = defineModel<number, never>({ default: 0 });
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

// Unbounded limits remain supported; NaN and reversed bounds cannot leak into updates.
const minimum = computed(() => Number.isFinite(props.min) || props.min === -Infinity ? props.min : 0);
const maximum = computed(() => Math.max(minimum.value,
  Number.isFinite(props.max) || props.max === Infinity ? props.max : 99));
const increment = computed(() => Number.isFinite(props.step) && props.step > 0 ? props.step : 1);

function clamp(value: number): number {
  const finite = Number.isFinite(value) ? value
    : value === Infinity ? Number.MAX_VALUE : value === -Infinity ? -Number.MAX_VALUE : 0;
  return Math.min(Math.max(finite, minimum.value), maximum.value);
}

function commit(next: number): void {
  if (props.disabled) { draft.value = String(model.value); return; }
  const value = clamp(next);
  draft.value = String(value);
  if (value !== model.value) model.value = value;
}

function bump(direction: 1 | -1): void {
  if (props.disabled) return;
  const value = Number.isFinite(model.value) ? model.value : clamp(model.value);
  commit(value + direction * increment.value);
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
      :aria-label="localeText('decrementLabel', decrementLabel, 'decrease')"
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
      :aria-valuemin="Number.isFinite(minimum) ? minimum : undefined"
      :aria-valuemax="Number.isFinite(maximum) ? maximum : undefined"
      :aria-valuenow="model"
      @blur="commitDraft"
      @keydown.enter="commitDraft"
      @keydown="onKeydown"
    />
    <button
      type="button"
      class="wl-stepper__btn"
      :disabled="disabled"
      :aria-label="localeText('incrementLabel', incrementLabel, 'increase')"
      @click="bump(1)"
    >
      <WlIcon name="plus" :size="14" />
    </button>
  </div>
</template>
