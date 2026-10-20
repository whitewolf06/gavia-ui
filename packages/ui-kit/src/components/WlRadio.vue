<script setup lang="ts" generic="Value = unknown">
/** WlRadio public component contract.
 * @since 0.1.0
 * @slot default - Label next to the radio button.
 */
import { computed, type Ref, useAttrs } from "vue";
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
    /** Option value (any type). */
    value: NoInfer<Value>;
    /**
     * Size within the component family's documented scale.
     * @default "md"
     */
    size?: WlSwitchSize;
    /**
     * Spacing density for this component family.
     * @default "default"
     */
    density?: WlDensity;
    /** Native group name. */
    name?: string;
    /**
     * Disables the radio button.
     * @default false
     */
    disabled?: boolean;
    /**
     * Error state.
     * @default false
     */
    invalid?: boolean;
    /** Attributes of internal Gavia UI elements. */
    pt?: WlPt<"radiobutton">;
  }>(),
  {
    disabled: false,
    size: "md",
    density: "default",
    invalid: false
  }
);

// The empty default stabilizes generated emits; never bridges Vue 3.4/3.5 default typing.
/** Selected value shared by the radio group.
 * Paired with update:modelValue.
 */
const model: Ref<Value | undefined> = defineModel<Value, never>({ default: undefined as never });
const attrs = useAttrs();

const attrGroups = computed(() => splitInputAttrs(attrs));
const inputAttrs = computed(() => attrGroups.value.inputAttrs);
const rootAttrs = computed(() => attrGroups.value.rootAttrs);
const controlProps = computed(() => getWlControlProps(inputAttrs.value));
const mergedPt = computed(() => deepMerge({ input: inputAttrs.value }, props.pt));
const section = useWlPt("radiobutton", mergedPt);

const rootClass = computed(() => [
  "wl-radio",
  props.invalid && "is-invalid",
  props.disabled && "is-disabled"
]);
</script>

<template>
  <label
    v-bind="rootAttrs"
    class="wl-checkline wl-checkline--radio"
    :class="{ 'is-disabled': disabled }"
    data-wl="radio"
    :data-size="size"
    :data-density="density"
  >
    <span :class="rootClass">
      <input
        v-bind="section('input', { checked: model === value, disabled })"
        :id="controlProps.inputId"
        v-model="model"
        class="wl-check-input"
        type="radio"
        :value="value"
        :name="name ?? controlProps.name"
        :disabled="disabled"
        :aria-invalid="invalid || undefined"
        :readonly="controlProps.readonly"
        :aria-label="controlProps.ariaLabel"
        :aria-labelledby="controlProps.ariaLabelledby"
      />
      <span v-bind="section('box', { checked: model === value, disabled })" class="wl-radio__box" aria-hidden="true">
        <span v-bind="section('icon')" class="wl-radio__icon"></span>
      </span>
    </span>
    <span v-if="$slots.default" class="wl-checkline__label"><slot></slot></span>
  </label>
</template>
