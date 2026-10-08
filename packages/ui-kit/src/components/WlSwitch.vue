<script setup lang="ts">
import type { WlPt } from "../pt-types";
import type { WlNoModelModifiers } from "../model-types";
import { computed, useAttrs } from "vue";
import { useWlPt } from "../config";
import type { WlSwitchSize } from "../types";
import { getWlControlProps, splitInputAttrs } from "../utils/inputAttrs";
import { deepMerge } from "../utils/merge";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    modelModifiers?: WlNoModelModifiers;
    size?: WlSwitchSize;
    disabled?: boolean;
    invalid?: boolean;
    pt?: WlPt<"toggleswitch">;
  }>(),
  {
    size: "md",
    disabled: false,
    invalid: false
  }
);

const model = defineModel<boolean, never>({ default: false });
const attrs = useAttrs();

const attrGroups = computed(() => splitInputAttrs(attrs));
const inputAttrs = computed(() => attrGroups.value.inputAttrs);
const rootAttrs = computed(() => attrGroups.value.rootAttrs);
const controlProps = computed(() => getWlControlProps(inputAttrs.value));
const mergedPt = computed(() => deepMerge({ input: inputAttrs.value }, props.pt));
const section = useWlPt("toggleswitch", mergedPt);

const rootClass = computed(() => [
  "wl-switch",
  `wl-switch--${props.size}`,
  model.value && "is-checked",
  props.invalid && "is-invalid",
  props.disabled && "is-disabled"
]);
</script>

<template>
  <label
    v-bind="rootAttrs"
    class="wl-switch-wrap"
    :class="{ 'is-disabled': disabled }"
    data-wl="switch"
    :data-size="size"
  >
    <span :class="rootClass">
    <input
      v-bind="section('input', { checked: model, disabled })"
      class="wl-check-input"
      type="checkbox"
      role="switch"
      :aria-checked="model"
      v-model="model"
      :disabled="disabled"
      :aria-invalid="invalid || undefined"
      :id="controlProps.inputId"
      :name="controlProps.name"
      :readonly="controlProps.readonly"
      :aria-label="controlProps.ariaLabel"
      :aria-labelledby="controlProps.ariaLabelledby"
    />
    <span v-bind="section('slider', { checked: model, disabled })" class="wl-switch__slider" aria-hidden="true">
      <span v-bind="section('handle')" class="wl-switch__handle" />
    </span>
    </span>
    <span v-if="$slots.default" class="wl-switch-wrap__label"><slot /></span>
  </label>
</template>
