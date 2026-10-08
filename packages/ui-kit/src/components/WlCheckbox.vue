<script setup lang="ts">
import type { WlPt } from "../pt-types";
import type { WlNoModelModifiers } from "../model-types";
import { computed, useAttrs } from "vue";
import { useWlPt } from "../config";
import { getWlControlProps, splitInputAttrs } from "../utils/inputAttrs";
import { deepMerge } from "../utils/merge";
import WlIcon from "./WlIcon.vue";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    modelModifiers?: WlNoModelModifiers;
    disabled?: boolean;
    indeterminate?: boolean;
    invalid?: boolean;
    pt?: WlPt<"checkbox">;
  }>(),
  {
    disabled: false,
    indeterminate: false,
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
      <WlIcon
        v-if="indeterminate || model"
        v-bind="section('icon', { checked: model, indeterminate, disabled })"
        class="wl-checkbox__icon"
        :name="indeterminate ? 'minus' : 'check'"
        :size="12"
      />
    </span>
    </span>
    <span v-if="$slots.default" class="wl-checkline__label"><slot /></span>
  </label>
</template>
