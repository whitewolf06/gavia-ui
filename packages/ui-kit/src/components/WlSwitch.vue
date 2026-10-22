<script setup lang="ts">
/** WlSwitch public component contract.
 * @since 0.1.0
 * @slot default - Label next to the switch.
 */
import { computed, useAttrs } from "vue";
import type { WlNoModelModifiers } from "../model-types";
import type { WlPt } from "../pt-types";
import type { WlDensity, WlSwitchSize } from "../types";
import { useWlPt } from "../config";
import { getWlControlProps, splitInputAttrs } from "../utils/inputAttrs";
import { deepMerge } from "../utils/merge";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Modifier flags accepted by the component's typed model contract. */
    modelModifiers?: WlNoModelModifiers;
    /**
     * Size.
     * @default "md"
     */
    size?: WlSwitchSize;
    /**
     * Disables the switch.
     * @default false
     */
    disabled?: boolean;
    /**
     * Error state.
     * @default false
     */
    invalid?: boolean;
    /**
     * Indicate pending work supplied by the application.
     * @default false
     */
    loading?: boolean;
    /**
     * Place the visible label before or after the switch.
     * @default "end"
     */
    labelPosition?: "start" | "end";
    /**
     * Spacing density for this component family.
     * @default "default"
     */
    density?: WlDensity;
    /** Attributes of internal Gavia UI elements. */
    pt?: WlPt<"switch">;
  }>(),
  {
    size: "md",
    disabled: false,
    invalid: false,
    loading: false,
    labelPosition: "end",
    density: "default"
  }
);

/** Boolean checked state.
 * Paired with update:modelValue.
 * @default false
 */
const model = defineModel<boolean, never>({ default: false, set: (value) => props.disabled || props.loading ? model.value : value });
const attrs = useAttrs();

const attrGroups = computed(() => splitInputAttrs(attrs));
const inputAttrs = computed(() => attrGroups.value.inputAttrs);
const rootAttrs = computed(() => attrGroups.value.rootAttrs);
const controlProps = computed(() => getWlControlProps(inputAttrs.value));
const mergedPt = computed(() => deepMerge({ input: inputAttrs.value }, props.pt));
const section = useWlPt("switch", mergedPt);

const rootClass = computed(() => [
  "wl-switch",
  `wl-switch--${props.size}`,
  model.value && "is-checked",
  props.invalid && "is-invalid",
  (props.disabled || props.loading) && "is-disabled",
  props.loading && "is-loading",
  props.density === "compact" && "is-compact"
]);
</script>

<template>
  <label
    v-bind="rootAttrs"
    class="wl-switch-wrap"
    :class="{ 'is-disabled': disabled || loading }"
    data-wl="switch"
    :data-size="size"
    :data-density="density"
    :data-label-position="labelPosition"
  >
    <span :class="rootClass">
      <input
        v-bind="section('input', { checked: model, disabled })"
        :id="controlProps.inputId"
        v-model="model"
        class="wl-check-input"
        type="checkbox"
        role="switch"
        :aria-checked="model"
        :disabled="disabled || loading"
        :aria-busy="loading || undefined"
        :aria-invalid="invalid || undefined"
        :name="controlProps.name"
        :readonly="controlProps.readonly"
        :aria-label="controlProps.ariaLabel"
        :aria-labelledby="controlProps.ariaLabelledby"
      />
      <span v-bind="section('slider', { checked: model, disabled })" class="wl-switch__slider" aria-hidden="true">
        <span v-bind="section('handle')" class="wl-switch__handle">
          <span v-if="loading" class="wl-switch__spinner" aria-hidden="true"></span>
        </span>
      </span>
    </span>
    <span v-if="$slots.default" class="wl-switch-wrap__label"><slot></slot></span>
  </label>
</template>
