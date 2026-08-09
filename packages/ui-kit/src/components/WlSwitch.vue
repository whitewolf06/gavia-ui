<script setup lang="ts">
import { computed, useAttrs } from "vue";
import ToggleSwitch from "primevue/toggleswitch";
import type { WlSwitchSize } from "../types";
import { getPrimeControlProps, splitInputAttrs } from "../utils/inputAttrs";
import { deepMerge } from "../utils/merge";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    size?: WlSwitchSize;
    disabled?: boolean;
    invalid?: boolean;
    pt?: Record<string, unknown>;
  }>(),
  {
    size: "md",
    disabled: false,
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
    <ToggleSwitch
      v-model="model"
      :disabled="disabled"
      :invalid="invalid"
      :inputId="controlProps.inputId"
      :name="controlProps.name"
      :readonly="controlProps.readonly"
      :ariaLabel="controlProps.ariaLabel"
      :ariaLabelledby="controlProps.ariaLabelledby"
      :pt="mergedPt"
      :class="rootClass"
    />
    <span v-if="$slots.default" class="wl-switch-wrap__label"><slot /></span>
  </label>
</template>
