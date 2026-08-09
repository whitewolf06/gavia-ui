<script setup lang="ts">
import { computed, useAttrs } from "vue";
import RadioButton from "primevue/radiobutton";
import { getPrimeControlProps, splitInputAttrs } from "../utils/inputAttrs";
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
const controlProps = computed(() => getPrimeControlProps(inputAttrs.value));
const mergedPt = computed(() => deepMerge({ input: inputAttrs.value }, props.pt));

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
    <RadioButton
      v-model="model"
      :value="value"
      :name="name ?? controlProps.name"
      :disabled="disabled"
      :invalid="invalid"
      :inputId="controlProps.inputId"
      :readonly="controlProps.readonly"
      :ariaLabel="controlProps.ariaLabel"
      :ariaLabelledby="controlProps.ariaLabelledby"
      :pt="mergedPt"
      :class="rootClass"
    />
    <span v-if="$slots.default" class="wl-checkline__label"><slot /></span>
  </label>
</template>
