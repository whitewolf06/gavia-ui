<script setup lang="ts">
import { computed, useAttrs } from "vue";
import MultiSelect from "primevue/multiselect";
import type { WlDensity, WlMultiSelectDisplay, WlSizeSm } from "../types";
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
    filter?: boolean;
    display?: WlMultiSelectDisplay;
    maxSelectedLabels?: number;
    pt?: Record<string, unknown>;
  }>(),
  {
    options: () => [],
    invalid: false,
    disabled: false,
    size: "md",
    density: "default",
    filter: false,
    display: "comma",
    maxSelectedLabels: undefined,
    pt: undefined
  }
);

const model = defineModel<unknown[]>({ default: () => [] });
const attrs = useAttrs();

const attrGroups = computed(() => splitInputAttrs(attrs));
const inputAttrs = computed(() => attrGroups.value.inputAttrs);
const rootAttrs = computed(() => attrGroups.value.rootAttrs);
const controlProps = computed(() => getPrimeControlProps(inputAttrs.value));
const mergedPt = computed(() => deepMerge({ hiddenInput: inputAttrs.value }, props.pt));

const rootClass = computed(() => [
  "wl-multiselect",
  `wl-multiselect--${props.size}`,
  props.invalid && "is-invalid",
  props.disabled && "is-disabled",
  props.density === "compact" && "is-compact"
]);
</script>

<template>
  <MultiSelect
    v-bind="rootAttrs"
    v-model="model"
    :options="options"
    :optionLabel="optionLabel"
    :optionValue="optionValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :invalid="invalid"
    :filter="filter"
    :display="display"
    :maxSelectedLabels="maxSelectedLabels"
    :inputId="controlProps.inputId"
    :name="controlProps.name"
    :ariaLabel="controlProps.ariaLabel"
    :ariaLabelledby="controlProps.ariaLabelledby"
    :pt="mergedPt"
    :class="rootClass"
    data-wl="multiselect"
    :data-size="size"
    :data-density="density"
  />
</template>
