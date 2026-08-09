<script setup lang="ts">
import { computed, useAttrs } from "vue";
import Checkbox from "primevue/checkbox";
import { getPrimeControlProps, splitInputAttrs } from "../utils/inputAttrs";
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
const controlProps = computed(() => getPrimeControlProps(inputAttrs.value));
const mergedPt = computed(() => deepMerge({ input: inputAttrs.value }, props.pt));

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
    <Checkbox
      v-model="model"
      :binary="true"
      :indeterminate="indeterminate"
      :disabled="disabled"
      :invalid="invalid"
      :inputId="controlProps.inputId"
      :name="controlProps.name"
      :required="controlProps.required"
      :readonly="controlProps.readonly"
      :ariaLabel="controlProps.ariaLabel"
      :ariaLabelledby="controlProps.ariaLabelledby"
      :pt="mergedPt"
      :class="rootClass"
    />
    <span v-if="$slots.default" class="wl-checkline__label"><slot /></span>
  </label>
</template>
