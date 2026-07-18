<script setup lang="ts">
import { computed } from "vue";
import Select from "primevue/select";
import type { WlDensity, WlSizeSm } from "../types";

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
    v-model="model"
    :options="options"
    :optionLabel="optionLabel"
    :optionValue="optionValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :invalid="invalid"
    :pt="pt"
    :class="rootClass"
    data-wl="select"
    :data-size="size"
  />
</template>
