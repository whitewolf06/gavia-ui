<script setup lang="ts">
import { computed } from "vue";
import { useWlPt } from "../config";
import WlIcon from "./WlIcon.vue";
import type { WlSegmentedOption } from "../types";

const props = withDefaults(
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
const section = useWlPt("selectbutton", computed(() => props.pt));
</script>

<template>
  <div v-bind="section('root')" class="wl-segmented" role="group" data-wl="segmented">
    <button v-for="option in options" :key="option.value" v-bind="section('pcToggleButton.root', { active: model === option.value, disabled: disabled || option.disabled })"
      type="button" class="wl-segmented__item" :class="{ 'is-active': model === option.value }"
      :disabled="disabled || option.disabled" :aria-pressed="model === option.value"
      @click="model = option.value">
      <span v-bind="section('pcToggleButton.content')" class="wl-segmented__item-content">
      <WlIcon v-if="option.icon" :name="option.icon" :size="15" class="wl-segmented__item-icon" />
      <span class="wl-segmented__item-label">{{ option.label }}</span>
      </span>
    </button>
  </div>
</template>
