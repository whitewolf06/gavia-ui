<script setup lang="ts">
import { computed, useSlots } from "vue";
import InputText from "primevue/inputtext";
import type { WlDensity, WlSizeSm } from "../types";

const props = withDefaults(
  defineProps<{
    size?: WlSizeSm;
    density?: WlDensity;
    invalid?: boolean;
    disabled?: boolean;
    placeholder?: string;
    type?: string;
    pt?: Record<string, unknown>;
  }>(),
  {
    size: "md",
    density: "default",
    invalid: false,
    disabled: false,
    type: "text"
  }
);

const model = defineModel<string>({ default: "" });
const slots = useSlots();

const wrapClass = computed(() => [
  "wl-input-wrap",
  slots.prefix && "wl-input-wrap--has-prefix",
  slots.suffix && "wl-input-wrap--has-suffix"
]);

const inputClass = computed(() => [
  "wl-input",
  `wl-input--${props.size}`,
  props.invalid && "is-invalid",
  props.disabled && "is-disabled",
  props.density === "compact" && "is-compact"
]);
</script>

<template>
  <div :class="wrapClass" data-wl="input" :data-size="size">
    <span v-if="slots.prefix" class="wl-input-wrap__prefix"><slot name="prefix" /></span>
    <InputText
      v-model="model"
      :class="inputClass"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :invalid="invalid"
      :pt="pt"
    />
    <span v-if="slots.suffix" class="wl-input-wrap__suffix"><slot name="suffix" /></span>
  </div>
</template>
