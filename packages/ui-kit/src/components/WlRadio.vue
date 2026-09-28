<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { useWlPt } from "../config";
import { getWlControlProps, splitInputAttrs } from "../utils/inputAttrs";
import { deepMerge } from "../utils/merge";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    value: unknown;
    name?: string;
    disabled?: boolean;
    invalid?: boolean;
    pt?: Record<string, unknown>;
  }>(),
  {
    disabled: false,
    invalid: false
  }
);

const model = defineModel<unknown>();
const attrs = useAttrs();

const attrGroups = computed(() => splitInputAttrs(attrs));
const inputAttrs = computed(() => attrGroups.value.inputAttrs);
const rootAttrs = computed(() => attrGroups.value.rootAttrs);
const controlProps = computed(() => getWlControlProps(inputAttrs.value));
const mergedPt = computed(() => deepMerge({ input: inputAttrs.value }, props.pt));
const section = useWlPt("radiobutton", mergedPt);

const rootClass = computed(() => [
  "wl-radio",
  props.invalid && "is-invalid",
  props.disabled && "is-disabled"
]);
</script>

<template>
  <label
    v-bind="rootAttrs"
    class="wl-checkline wl-checkline--radio"
    :class="{ 'is-disabled': disabled }"
    data-wl="radio"
  >
    <span :class="rootClass">
    <input
      v-bind="section('input', { checked: model === value, disabled })"
      class="wl-check-input"
      type="radio"
      v-model="model"
      :value="value"
      :name="name ?? controlProps.name"
      :disabled="disabled"
      :aria-invalid="invalid || undefined"
      :id="controlProps.inputId"
      :readonly="controlProps.readonly"
      :aria-label="controlProps.ariaLabel"
      :aria-labelledby="controlProps.ariaLabelledby"
    />
    <span v-bind="section('box', { checked: model === value, disabled })" class="wl-radio__box" aria-hidden="true">
      <span v-bind="section('icon')" class="wl-radio__icon" />
    </span>
    </span>
    <span v-if="$slots.default" class="wl-checkline__label"><slot /></span>
  </label>
</template>
