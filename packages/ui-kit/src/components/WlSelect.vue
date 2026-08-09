<script setup lang="ts">
import { computed, useAttrs } from "vue";
import Select from "primevue/select";
import type { WlDensity, WlSizeSm } from "../types";
import { getPrimeControlProps, splitInputAttrs } from "../utils/inputAttrs";
import { deepMerge } from "../utils/merge";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    options?: unknown[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    optionLabel?: string | ((option: any) => string);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    optionValue?: string | ((option: any) => any);
    placeholder?: string;
    invalid?: boolean;
    disabled?: boolean;
    size?: WlSizeSm;
    density?: WlDensity;
    pt?: Record<string, unknown>;
  }>(),
  {
    options: () => [],
    invalid: false,
    disabled: false,
    size: "md",
    density: "default"
  }
);

const model = defineModel<unknown>();
const attrs = useAttrs();

const attrGroups = computed(() => splitInputAttrs(attrs));
const inputAttrs = computed(() => attrGroups.value.inputAttrs);
const rootAttrs = computed(() => attrGroups.value.rootAttrs);
const controlProps = computed(() => getPrimeControlProps(inputAttrs.value));
const mergedPt = computed(() => deepMerge({ label: inputAttrs.value }, props.pt));

const rootClass = computed(() => [
  "wl-select",
  `wl-select--${props.size}`,
  props.invalid && "is-invalid",
  props.disabled && "is-disabled",
  props.density === "compact" && "is-compact"
]);
</script>

<template>
  <Select
    v-bind="rootAttrs"
    v-model="model"
    :options="options"
    :optionLabel="optionLabel"
    :optionValue="optionValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :invalid="invalid"
    :inputId="controlProps.inputId"
    :name="controlProps.name"
    :ariaLabel="controlProps.ariaLabel"
    :ariaLabelledby="controlProps.ariaLabelledby"
    :pt="mergedPt"
    :class="rootClass"
    data-wl="select"
    :data-size="size"
    :data-density="density"
  />
</template>
