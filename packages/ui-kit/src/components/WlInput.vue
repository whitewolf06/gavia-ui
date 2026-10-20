<script setup lang="ts">
/** WlInput public component contract.
 * @since 0.1.0
 * @slot prefix - Content inside the field on the left.
 * @slot suffix - Content inside the field on the right.
 */
import { computed, nextTick, ref, useAttrs, useSlots } from "vue";
import type { WlTextModelModifiers } from "../model-types";
import type { WlPt } from "../pt-types";
import type { WlDensity, WlSizeSm } from "../types";
import { mergeWlAttrs, useWlLocale, useWlPt } from "../config";
import { getWlControlProps, splitInputAttrs } from "../utils/inputAttrs";
import { useWlInputCounter } from "../utils/inputCounter";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Modifier flags accepted by the component's typed model contract. */
    modelModifiers?: WlTextModelModifiers;
    /**
     * Field size.
     * @default "md"
     */
    size?: WlSizeSm;
    /**
     * Compact mode reduces field height.
     * @default "default"
     */
    density?: WlDensity;
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
    /** Show a clear action for the current value. */
    clearable?: boolean;
    /** Indicate pending work supplied by the application. */
    loading?: boolean;
    /** Display the text length counter and connect it to the control description. */
    showCount?: boolean;
    /** Placeholder. */
    placeholder?: string;
    /**
     * Input element type attribute.
     * @default "text"
     */
    type?: string;
    /** Attributes of internal Gavia UI elements. */
    pt?: WlPt<"inputtext">;
  }>(),
  {
    size: "md",
    density: "default",
    invalid: false,
    disabled: false,
    type: "text"
  }
);

// Native type="number" v-model coerces to a number; WlInput keeps its string contract.
/** Text value; supports the trim model modifier.
 * Paired with update:modelValue.
 * @default ""
 */
const model = defineModel<string, "trim">({ default: "", set: (value) => String(value ?? "") });
const slots = useSlots();
const attrs = useAttrs();

const attrGroups = computed(() => splitInputAttrs(attrs));
const innerAttrs = computed(() => attrGroups.value.inputAttrs);
const rootAttrs = computed(() => attrGroups.value.rootAttrs);
const control = ref<HTMLInputElement | null>(null);
const locale = useWlLocale();
const counter = useWlInputCounter(model, () => mergeWlAttrs(innerAttrs.value, section("root")), () => !!props.showCount);
const describedBy = counter.describedBy;
function clear(): void {
  if (props.disabled || props.loading || getWlControlProps(innerAttrs.value).readonly) return;
  model.value = "";
  nextTick(() => control.value?.focus());
}

const wrapClass = computed(() => [
  "wl-input-wrap",
  slots.prefix && "wl-input-wrap--has-prefix",
  slots.suffix && "wl-input-wrap--has-suffix",
  (props.clearable || props.loading) && "wl-input-wrap--has-btn"
]);

const inputClass = computed(() => [
  "wl-input",
  `wl-input--${props.size}`,
  props.invalid && "is-invalid",
  props.disabled && "is-disabled",
  props.density === "compact" && "is-compact"
]);
const section = useWlPt("inputtext", computed(() => props.pt));
</script>

<template>
  <div
    :class="wrapClass"
    v-bind="rootAttrs"
    data-wl="input"
    :data-size="size"
    :data-density="density"
    :data-counter="showCount || undefined"
  >
    <span v-if="slots.prefix" class="wl-input-wrap__prefix"><slot name="prefix"></slot></span>
    <input
      ref="control"
      v-bind="mergeWlAttrs(innerAttrs, section('root'))"
      v-model="model"
      :class="inputClass"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-invalid="invalid || undefined"
      :aria-describedby="describedBy"
      :aria-busy="loading || undefined"
    />
    <span v-if="slots.suffix" class="wl-input-wrap__suffix"><slot name="suffix"></slot></span>
    <span
      v-if="loading"
      v-bind="section('loadingIcon')"
      class="wl-input-wrap__spinner wl-btn__spinner"
      aria-hidden="true"
    ></span>
    <button
      v-else-if="clearable && model"
      v-bind="section('clearButton')"
      type="button"
      class="wl-input-wrap__btn"
      :disabled="disabled || getWlControlProps(innerAttrs).readonly"
      :aria-label="locale.clear"
      @click="clear"
    >×</button>
    <span
      v-if="showCount"
      :id="counter.id"
      v-bind="section('counter')"
      class="wl-input-counter"
    >{{ counter.text.value }}</span>
  </div>
</template>
