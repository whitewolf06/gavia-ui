<script setup lang="ts" generic="Value extends string = string">
import type { WlPt } from "../pt-types";
import type { WlNoModelModifiers } from "../model-types";
import { computed, type PropType } from "vue";
import { useWlPt } from "../config";
import WlIcon from "./WlIcon.vue";
import type { WlSegmentedOption } from "../types";

const props = withDefaults(
  defineProps<{
    modelModifiers?: WlNoModelModifiers;
    options?: readonly WlSegmentedOption<Value>[];
    disabled?: boolean;
    pt?: WlPt<"selectbutton">;
  }>(),
  {
    options: () => [],
    disabled: false
  }
);

// Vue validates the string runtime category; options retain the narrower key union in TypeScript.
const model = defineModel<NoInfer<Value> | null, never>({ type: String as unknown as PropType<Value | null>, default: null });
const section = useWlPt("selectbutton", computed(() => props.pt));
function choose(option: WlSegmentedOption<Value>): void {
  if (!props.disabled && !option.disabled) model.value = option.value;
}
</script>

<template>
  <div v-bind="section('root')" class="wl-segmented" role="group" data-wl="segmented">
    <button v-for="option in options" :key="option.value" v-bind="section('pcToggleButton.root', { active: model === option.value, disabled: Boolean(disabled || option.disabled) })"
      type="button" class="wl-segmented__item" :class="{ 'is-active': model === option.value }"
      :disabled="disabled || option.disabled" :aria-pressed="model === option.value"
      @click="choose(option)">
      <span v-bind="section('pcToggleButton.content')" class="wl-segmented__item-content">
      <WlIcon v-if="option.icon" :name="option.icon" :size="15" class="wl-segmented__item-icon" />
      <span class="wl-segmented__item-label">{{ option.label }}</span>
      </span>
    </button>
  </div>
</template>
