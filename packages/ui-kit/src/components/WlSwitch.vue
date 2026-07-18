<script setup lang="ts">
import { computed } from "vue";
import ToggleSwitch from "primevue/toggleswitch";
import type { WlSwitchSize } from "../types";

const props = withDefaults(
  defineProps<{
    size?: WlSwitchSize;
    disabled?: boolean;
    pt?: Record<string, unknown>;
  }>(),
  {
    size: "md",
    disabled: false
  }
);

const model = defineModel<boolean>({ default: false });

const rootClass = computed(() => [
  "wl-switch",
  `wl-switch--${props.size}`,
  model.value && "is-checked",
  props.disabled && "is-disabled"
]);
</script>

<template>
  <label class="wl-switch-wrap" :class="{ 'is-disabled': disabled }" data-wl="switch" :data-size="size">
    <ToggleSwitch v-model="model" :disabled="disabled" :pt="pt" :class="rootClass" />
    <span v-if="$slots.default" class="wl-switch-wrap__label"><slot /></span>
  </label>
</template>
