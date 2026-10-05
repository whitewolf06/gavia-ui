<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { mergeWlAttrs, useWlPt } from "../config";
import { useNativeFilePicker } from "../composables/useNativeFilePicker";
import { splitInputAttrs } from "../utils/inputAttrs";
import type { WlDensity, WlSizeSm } from "../types";
import WlButton from "./WlButton.vue";
import WlIcon from "./WlIcon.vue";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<{
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  chooseLabel?: string;
  ariaLabel?: string;
  size?: WlSizeSm;
  density?: WlDensity;
  pt?: Record<string, unknown>;
}>(), {
  multiple: false, disabled: false, chooseLabel: "Выбрать файлы", size: "md", density: "default"
});
const emit = defineEmits<{ select: [files: File[]]; cancel: [] }>();
const attrs = useAttrs();
const attrGroups = computed(() => splitInputAttrs(attrs));
function belongsToTrigger(key: string): boolean {
  return key === "id" || key === "tabindex" || key.startsWith("aria-")
    || /^on(?:Click|Focus|Blur|Key|Mouse|Pointer)/.test(key);
}
const triggerAttrs = computed(() => Object.fromEntries(Object.entries(attrGroups.value.inputAttrs).filter(([key]) => belongsToTrigger(key))));
const pickerAttrs = computed(() => Object.fromEntries(Object.entries(attrGroups.value.inputAttrs).filter(([key]) => !belongsToTrigger(key))));
const section = useWlPt("filepicker", computed(() => props.pt));
const { input, choose, clear, onChange, onCancel } = useNativeFilePicker(
  () => props.disabled, (files) => emit("select", files), () => emit("cancel")
);
defineExpose({ choose, clear });
</script>

<template>
  <div v-bind="mergeWlAttrs(attrGroups.rootAttrs, section('root'))" class="wl-file-picker"
    data-wl="file-picker" :data-size="size" :data-density="density">
    <slot name="trigger" :choose="choose" :clear="clear" :disabled="disabled" :attrs="triggerAttrs">
      <WlButton v-bind="triggerAttrs" :size="size" :density="density" :disabled="disabled"
        :aria-label="ariaLabel ?? chooseLabel" :pt="{ root: section('trigger') }" @click="choose">
        <template #icon><WlIcon name="upload" :size="16" /></template>
        {{ chooseLabel }}
      </WlButton>
    </slot>
    <input ref="input" v-bind="mergeWlAttrs(pickerAttrs, section('input'))"
      type="file" hidden tabindex="-1" :accept="accept" :multiple="multiple" :disabled="disabled"
      @change="onChange" @cancel="onCancel" />
  </div>
</template>
