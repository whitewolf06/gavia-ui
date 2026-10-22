<script setup lang="ts">
/** WlFilePicker public component contract.
 * @since 0.8.0
 * @slot trigger - Custom button; parameters { choose, clear, disabled, attrs }. attrs connects focus and ARIA attributes.
 */
import { computed, useAttrs } from "vue";
import type { WlFilePickerExpose } from "../input-expose-types";
import type { WlPt } from "../pt-types";
import type { WlDensity, WlSizeSm } from "../types";
import { useNativeFilePicker } from "../composables/useNativeFilePicker";
import { mergeWlAttrs, useWlLocale, useWlPt } from "../config";
import { splitInputAttrs } from "../utils/inputAttrs";
import WlButton from "./WlButton.vue";
import WlIcon from "./WlIcon.vue";
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<{
  /** Extensions or MIME types for the file picker. The application validates files. */
  accept?: string;
  /**
   * Allows multiple file selection.
   * @default false
   */
  multiple?: boolean;
  /**
   * Disables the trigger and choose().
   * @default false
   */
  disabled?: boolean;
  /**
   * Default button label.
   * Defaults to WlConfig.locale.chooseFiles (English when unconfigured).
   * @default undefined
   */
  chooseLabel?: string;
  /** Default button accessible name. */
  ariaLabel?: string;
  /**
   * Button size.
   * @default "md"
   */
  size?: WlSizeSm;
  /**
   * Button density.
   * @default "default"
   */
  density?: WlDensity;
  /** Root, trigger and input attributes. */
  pt?: WlPt<"filepicker">;
}>(), {
  multiple: false, disabled: false, size: "md", density: "default"
});

const emit = defineEmits<{
  /** Unmodified files from the current selection. The component does not merge them with the previous list. */
  select: [files: File[]];
  /** Selection cancelled. The application's file list stays unchanged. */
  cancel: []; }>();

const locale = useWlLocale();
const chooseLabel = computed(() => props.chooseLabel ?? locale.value.chooseFiles);

const attrs = useAttrs();
const attrGroups = computed(() => splitInputAttrs(attrs));
function belongsToTrigger(key: string): boolean {
  return key === "id" || key === "tabindex" || key.startsWith("aria-")
    || /^on(?:Click|Focus|Blur|Key|Mouse|Pointer)/.test(key);
}
const triggerAttrs = computed(() => Object.fromEntries(
  Object.entries(attrGroups.value.inputAttrs).filter(([key]) => belongsToTrigger(key))
));
const pickerAttrs = computed(() => Object.fromEntries(
  Object.entries(attrGroups.value.inputAttrs).filter(([key]) => !belongsToTrigger(key))
));
const section = useWlPt("filepicker", computed(() => props.pt));
const { input, choose, clear, onChange, onCancel } = useNativeFilePicker(
  () => props.disabled, (files) => emit("select", files), () => emit("cancel")
);
defineExpose<WlFilePickerExpose>({ choose, clear });
</script>

<template>
  <div
    v-bind="mergeWlAttrs(attrGroups.rootAttrs, section('root'))"
    class="wl-file-picker"
    data-wl="file-picker"
    :data-size="size"
    :data-density="density"
  >
    <slot
      name="trigger"
      :choose="choose"
      :clear="clear"
      :disabled="disabled"
      :attrs="triggerAttrs"
    >
      <WlButton
        v-bind="triggerAttrs"
        :size="size"
        :density="density"
        :disabled="disabled"
        :aria-label="ariaLabel ?? chooseLabel"
        :pt="{ root: section('trigger') }"
        @click="choose"
      >
        <template #icon><WlIcon name="upload" :size="16" /></template>
        {{ chooseLabel }}
      </WlButton>
    </slot>
    <input
      ref="input"
      v-bind="mergeWlAttrs(pickerAttrs, section('input'))"
      type="file"
      hidden
      tabindex="-1"
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled"
      @change="onChange"
      @cancel="onCancel"
    />
  </div>
</template>
