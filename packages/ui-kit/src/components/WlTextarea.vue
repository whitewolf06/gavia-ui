<script setup lang="ts">
/** WlTextarea public component contract.
 * @since 0.1.0
 */
import { computed, nextTick, onMounted, ref, useAttrs, watch } from "vue";
import type { WlTextModelModifiers } from "../model-types";
import type { WlPt } from "../pt-types";
import type { WlDensity, WlSizeSm } from "../types";
import { mergeWlAttrs, useWlPt } from "../config";
import { useWlInputCounter } from "../utils/inputCounter";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Modifier flags accepted by the component's typed model contract. */
    modelModifiers?: WlTextModelModifiers;
    /**
     * Error state.
     * @default false
     */
    invalid?: boolean;
    /**
     * Disables the field.
     * @default false
     */
    disabled?: boolean;
    /**
     * Row count.
     * @default 3
     */
    rows?: number;
    /**
     * Adjust height to content.
     * @default false
     */
    autoResize?: boolean;
    /** Maximum visible textarea rows when automatic resizing is enabled. */
    maxRows?: number;
    /**
     * Size within the component family's documented scale.
     * @default "md"
     */
    size?: WlSizeSm;
    /**
     * Spacing density for this component family.
     * @default "default"
     */
    density?: WlDensity;
    /** Display the text length counter and connect it to the control description. */
    showCount?: boolean;
    /** Placeholder. */
    placeholder?: string;
    /** Attributes of internal Gavia UI elements. */
    pt?: WlPt<"textarea">;
  }>(),
  {
    invalid: false,
    disabled: false,
    rows: 3,
    autoResize: false,
    size: "md",
    density: "default"
  }
);

/** Multiline text value; supports the trim model modifier.
 * Paired with update:modelValue.
 * @default ""
 */
const model = defineModel<string, "trim">({ default: "" });
const control = ref<HTMLTextAreaElement | null>(null);
const section = useWlPt("textarea", computed(() => props.pt));
const attrs = useAttrs();
const counter = useWlInputCounter(model, () => attrs, () => !!props.showCount);
const controlAttrs = computed(() => mergeWlAttrs(attrs, section("root"), { "aria-describedby": counter.describedBy.value }));
async function resize(): Promise<void> {
  if (!props.autoResize) return;
  await nextTick();
  if (!control.value) return;
  control.value.style.height = "auto";
  let height = control.value.scrollHeight;
  if (props.maxRows !== undefined && Number.isFinite(props.maxRows) && props.maxRows > 0) {
    const style = getComputedStyle(control.value);
    const lineHeight = Number.parseFloat(style.lineHeight) || (Number.parseFloat(style.fontSize) || 16) * 1.5;
    const padding = (Number.parseFloat(style.paddingTop) || 0) + (Number.parseFloat(style.paddingBottom) || 0);
    const border = style.boxSizing === "border-box"
      ? (Number.parseFloat(style.borderTopWidth) || 0) + (Number.parseFloat(style.borderBottomWidth) || 0)
      : 0;
    const maximum = lineHeight * Math.floor(props.maxRows) + padding + border;
    height = Math.min(height + border, maximum);
    control.value.style.overflowY = control.value.scrollHeight + border > maximum ? "auto" : "hidden";
  }
  control.value.style.height = `${height}px`;
}
watch([model, () => props.autoResize, () => props.maxRows, () => props.size, () => props.density], resize);
onMounted(resize);

const rootClass = computed(() => [
  "wl-textarea",
  `wl-textarea--${props.size}`,
  props.invalid && "is-invalid",
  props.disabled && "is-disabled",
  props.density === "compact" && "is-compact"
]);
</script>

<template>
  <div v-if="showCount" class="wl-textarea-wrap">
    <textarea
      ref="control"
      v-bind="controlAttrs"
      v-model="model"
      :class="rootClass"
      :rows="rows"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-invalid="invalid || undefined"
      data-wl="textarea"
      :data-size="size"
      :data-density="density"
    ></textarea>
    <span :id="counter.id" v-bind="section('counter')" class="wl-input-counter">{{ counter.text.value }}</span>
  </div>
  <textarea
    v-else
    ref="control"
    v-bind="controlAttrs"
    v-model="model"
    :class="rootClass"
    :rows="rows"
    :placeholder="placeholder"
    :disabled="disabled"
    :aria-invalid="invalid || undefined"
    data-wl="textarea"
    :data-size="size"
    :data-density="density"
  ></textarea>
</template>
