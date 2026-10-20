<script setup lang="ts" generic="Value = undefined">
/** WlCheckbox public component contract.
 * @since 0.1.0
 * @slot default - Label next to the checkbox.
 */
import { computed, type Ref, useAttrs } from "vue";
import type { WlNoModelModifiers } from "../model-types";
import type { WlPt } from "../pt-types";
import type { WlDensity, WlSwitchSize } from "../types";
import { useWlPt } from "../config";
import { getWlControlProps, splitInputAttrs } from "../utils/inputAttrs";
import { deepMerge } from "../utils/merge";
import WlIcon from "./WlIcon.vue";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Modifier flags accepted by the component's typed model contract. */
    modelModifiers?: WlNoModelModifiers;
    /** Value associated with this choice in the group model. */
    value?: Value;
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
    /**
     * Disables the checkbox.
     * @default false
     */
    disabled?: boolean;
    /**
     * Indeterminate state.
     * @default false
     */
    indeterminate?: boolean;
    /**
     * Error state.
     * @default false
     */
    invalid?: boolean;
    /** Attributes of internal Gavia UI elements. */
    pt?: WlPt<"checkbox">;
  }>(),
  {
    disabled: false,
    size: "md",
    density: "default",
    indeterminate: false,
    invalid: false
  }
);

/** Boolean checked state, or selected values when the checkbox has an array-mode value.
 * Paired with update:modelValue.
 */
const model: Ref<boolean | unknown[]>
  = defineModel<NoInfer<Value extends undefined ? boolean : Value[]>, never>({ default: false as never });
const attrs = useAttrs();

const attrGroups = computed(() => splitInputAttrs(attrs));
const inputAttrs = computed(() => attrGroups.value.inputAttrs);
const rootAttrs = computed(() => attrGroups.value.rootAttrs);
const controlProps = computed(() => getWlControlProps(inputAttrs.value));
const mergedPt = computed(() => deepMerge({ input: inputAttrs.value }, props.pt));
const section = useWlPt("checkbox", mergedPt);
const arrayMode = computed(() => Array.isArray(model.value) || props.value !== undefined);
const checked = computed(() => Array.isArray(model.value)
  ? model.value.some((item) => Object.is(item, props.value))
  : !arrayMode.value && model.value);
const inputSection = computed(() => section("input", { checked: checked.value, indeterminate: props.indeterminate, disabled: props.disabled }));
function onChange(event: Event): void {
  if (props.disabled || controlProps.value.readonly || event.defaultPrevented) return;
  const next = (event.target as HTMLInputElement).checked;
  if (arrayMode.value) {
    const values = Array.isArray(model.value) ? model.value : [];
    if (next === values.some((item) => Object.is(item, props.value))) return;
    model.value = next ? [...values, props.value] : values.filter((item) => !Object.is(item, props.value));
  } else if (next !== model.value) model.value = next;
}

const rootClass = computed(() => [
  "wl-checkbox",
  props.indeterminate && "is-indeterminate",
  props.invalid && "is-invalid",
  props.disabled && "is-disabled"
]);
</script>

<template>
  <label
    v-bind="rootAttrs"
    class="wl-checkline"
    :class="{ 'is-disabled': disabled }"
    data-wl="checkbox"
    :data-size="size"
    :data-density="density"
  >
    <span :class="rootClass">
      <input
        v-bind="inputSection"
        :id="controlProps.inputId"
        :checked="checked"
        :value="value === undefined ? inputSection.value : value"
        class="wl-check-input"
        type="checkbox"
        :indeterminate="indeterminate"
        :disabled="disabled"
        :aria-invalid="invalid || undefined"
        :name="controlProps.name"
        :required="controlProps.required"
        :readonly="controlProps.readonly"
        :aria-label="controlProps.ariaLabel"
        :aria-labelledby="controlProps.ariaLabelledby"
        @change="onChange"
      />
      <span v-bind="section('box', { checked, indeterminate, disabled })" class="wl-checkbox__box" aria-hidden="true">
        <WlIcon
          v-if="indeterminate || checked"
          v-bind="section('icon', { checked, indeterminate, disabled })"
          class="wl-checkbox__icon"
          :name="indeterminate ? 'minus' : 'check'"
          :size="12"
        />
      </span>
    </span>
    <span v-if="$slots.default" class="wl-checkline__label"><slot></slot></span>
  </label>
</template>
