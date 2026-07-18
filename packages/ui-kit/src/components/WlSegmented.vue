<script setup lang="ts">
import SelectButton from "primevue/selectbutton";
import WlIcon from "./WlIcon.vue";
import type { WlSegmentedOption } from "../types";

withDefaults(
  defineProps<{
    options?: WlSegmentedOption[];
    disabled?: boolean;
    pt?: Record<string, unknown>;
  }>(),
  {
    options: () => [],
    disabled: false
  }
);

const model = defineModel<string | null>({ default: null });
</script>

<template>
  <SelectButton
    v-model="model"
    :options="options"
    option-label="label"
    option-value="value"
    option-disabled="disabled"
    :allow-empty="false"
    :disabled="disabled"
    :pt="pt"
    class="wl-segmented"
    data-wl="segmented"
  >
    <template #option="{ option }">
      <WlIcon v-if="option.icon" :name="option.icon" :size="15" class="wl-segmented__item-icon" />
      <span class="wl-segmented__item-label">{{ option.label }}</span>
    </template>
  </SelectButton>
</template>
