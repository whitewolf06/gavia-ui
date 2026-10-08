<script setup lang="ts">
import type { WlPt } from "../pt-types";
import type { WlTextModelModifiers } from "../model-types";
import { computed, useAttrs, useSlots } from "vue";
import { mergeWlAttrs, useWlPt } from "../config";
import type { WlDensity, WlSizeSm } from "../types";
import { splitInputAttrs } from "../utils/inputAttrs";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    modelModifiers?: WlTextModelModifiers;
    size?: WlSizeSm;
    density?: WlDensity;
    invalid?: boolean;
    disabled?: boolean;
    placeholder?: string;
    type?: string;
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
const model = defineModel<string, "trim">({ default: "", set: (value) => String(value ?? "") });
const slots = useSlots();
const attrs = useAttrs();

const attrGroups = computed(() => splitInputAttrs(attrs));
const innerAttrs = computed(() => attrGroups.value.inputAttrs);
const rootAttrs = computed(() => attrGroups.value.rootAttrs);

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
const section = useWlPt("inputtext", computed(() => props.pt));
</script>

<template>
  <div
    :class="wrapClass"
    v-bind="rootAttrs"
    data-wl="input"
    :data-size="size"
    :data-density="density"
  >
    <span v-if="slots.prefix" class="wl-input-wrap__prefix"><slot name="prefix" /></span>
    <input
      v-bind="mergeWlAttrs(innerAttrs, section('root'))"
      v-model="model"
      :class="inputClass"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-invalid="invalid || undefined"
    />
    <span v-if="slots.suffix" class="wl-input-wrap__suffix"><slot name="suffix" /></span>
  </div>
</template>
