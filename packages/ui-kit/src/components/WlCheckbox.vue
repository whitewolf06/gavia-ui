<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { useWlPt } from "../config";
import { getWlControlProps, splitInputAttrs } from "../utils/inputAttrs";
import { deepMerge } from "../utils/merge";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    indeterminate?: boolean;
    invalid?: boolean;
    pt?: Record<string, unknown>;
  }>(),
  {
    disabled: false,
    indeterminate: false,
    invalid: false
  }
);

const model = defineModel<boolean>({ default: false });
const attrs = useAttrs();

const attrGroups = computed(() => splitInputAttrs(attrs));
const inputAttrs = computed(() => attrGroups.value.inputAttrs);
const rootAttrs = computed(() => attrGroups.value.rootAttrs);
const controlProps = computed(() => getWlControlProps(inputAttrs.value));
const mergedPt = computed(() => deepMerge({ input: inputAttrs.value }, props.pt));
const section = useWlPt("checkbox", mergedPt);

const rootClass = computed(() => [
  "wl-checkbox",
  props.indeterminate && "is-indeterminate",
  props.invalid && "is-invalid",
  props.disabled && "is-disabled"
]);
</script>

<template>
  <label
    v-bind="rootAttrs"
    class="wl-checkline"
    :class="{ 'is-disabled': disabled }"
    data-wl="checkbox"
  >
    <span :class="rootClass">
    <input
      v-bind="section('input', { checked: model, indeterminate, disabled })"
      class="wl-check-input"
      type="checkbox"
      v-model="model"
      :indeterminate="indeterminate"
      :disabled="disabled"
      :aria-invalid="invalid || undefined"
      :id="controlProps.inputId"
      :name="controlProps.name"
      :required="controlProps.required"
      :readonly="controlProps.readonly"
      :aria-label="controlProps.ariaLabel"
      :aria-labelledby="controlProps.ariaLabelledby"
    />
    <span v-bind="section('box', { checked: model, indeterminate, disabled })" class="wl-checkbox__box" aria-hidden="true">
      <span v-if="indeterminate" class="wl-checkbox__icon">−</span>
      <span v-else-if="model" class="wl-checkbox__icon">✓</span>
    </span>
    </span>
    <span v-if="$slots.default" class="wl-checkline__label"><slot /></span>
  </label>
</template>
