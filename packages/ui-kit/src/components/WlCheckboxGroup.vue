<script setup lang="ts" generic="TOption = unknown, TResolver extends WlOptionValueResolver<NoInfer<TOption>> | undefined = undefined">
/** WlCheckboxGroup public component contract.
 * @slot legend - Custom legend content.
 * @slot option - Custom option content.
 */
import { computed, type Ref } from "vue";
import type { WlNoModelModifiers } from "../model-types";
import type { WlPt } from "../pt-types";
import type { WlMultiSelectModel, WlOptionDisabled, WlOptionKeyResolver, WlOptionLabel, WlOptionValue, WlOptionValueResolver } from "../selection-types";
import type { WlDensity, WlSizeSm } from "../types";
import { mergeWlAttrs, useWlPt } from "../config";
import { optionDisabled as resolveDisabled, optionLabel as resolveLabel, optionKey as resolveOptionKey, optionValue as resolveValue } from "../utils/options";
import { useWlId } from "../utils/useWlId";
import WlCheckbox from "./WlCheckbox.vue";

const props = withDefaults(defineProps<{
  /** Modifier flags accepted by the component's typed model contract. */
  modelModifiers?: WlNoModelModifiers;
  /**
   * Readonly options from which the user can select.
   * @default []
   */
  options?: readonly TOption[];
  /** Resolve the visible text of an option. */
  optionLabel?: WlOptionLabel<NoInfer<TOption>>;
  /** Resolve the value stored in the selection model. */
  optionValue?: TResolver;
  /** Resolve whether an option is disabled. */
  optionDisabled?: WlOptionDisabled<NoInfer<TOption>>;
  /** Resolve stable option identity; provide keys when options may be reordered. */
  optionKey?: WlOptionKeyResolver<NoInfer<TOption>>;
  /** Visible accessible name for the choice group. */
  legend?: string;
  /** Name used by the component's native form controls. */
  name?: string;
  /**
   * Layout direction and applicable arrow-key navigation direction.
   * @default "vertical"
   */
  orientation?: "horizontal" | "vertical";
  /**
   * Visual treatment within this component family.
   * @default "default"
   */
  variant?: "default";
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
  /**
   * Disable user interaction with this component.
   * @default false
   */
  disabled?: boolean;
  /**
   * Expose a validation error state on the control.
   * @default false
   */
  invalid?: boolean;
  /**
   * Indicate pending work supplied by the application.
   * @default false
   */
  loading?: boolean;
  /** Attributes and callbacks for the component's documented pass-through sections. */
  pt?: WlPt<"checkboxgroup">;
}>(), {
  options: () => [], orientation: "vertical", variant: "default", size: "md", density: "default",
  disabled: false, invalid: false, loading: false
});
/** Selected option values for the checkbox group.
 * Paired with update:modelValue.
 * @default []
 */
const model: Ref<WlMultiSelectModel<TOption, TResolver>>
  = defineModel<WlMultiSelectModel<NoInfer<TOption>, NoInfer<TResolver>>, never>({ default: () => [] });
defineSlots<{
  /** Custom accessible group legend. */
  legend?(props: Record<never, never>): unknown;
  /** Custom option content with its value and interaction state. */
  option?(props: { option: TOption; index: number; checked: boolean; disabled: boolean }): unknown;
}>();
const section = useWlPt("checkboxgroup", computed(() => props.pt));
const prefix = `wl-checkbox-group-${useWlId()}`;
function valueOf(option: TOption): WlOptionValue<TOption, TResolver> {
  return resolveValue(option, props.optionValue as TResolver);
}
function isDisabled(option: TOption): boolean {
  return props.disabled || props.loading || resolveDisabled(option, props.optionDisabled);
}
function checked(option: TOption): boolean {
  return model.value.some((value) => Object.is(value, valueOf(option)));
}
function inputPt(option: TOption): WlPt<"checkbox"> {
  const context = { checked: checked(option), disabled: isDisabled(option) };
  return { input: mergeWlAttrs(section("input", context), { value: valueOf(option) }) };
}
function change(option: TOption, next: boolean | unknown[]): void {
  if (typeof next !== "boolean") return;
  if (isDisabled(option) || next === checked(option)) return;
  const value = valueOf(option);
  model.value = next ? [...model.value, value] : model.value.filter((item) => !Object.is(item, value));
}
</script>

<template>
  <fieldset
    v-bind="section('root')"
    class="wl-choice-group wl-checkbox-group"
    data-wl="checkbox-group"
    :data-variant="variant"
    :data-size="size"
    :data-density="density"
    :data-orientation="orientation"
    :disabled="disabled || loading"
    :aria-invalid="invalid || undefined"
    :aria-busy="loading || undefined"
  >
    <legend
      v-if="legend || $slots.legend"
      v-bind="section('legend')"
      class="wl-choice-group__legend"
    ><slot name="legend">{{ legend }}</slot></legend>
    <div v-bind="section('options')" class="wl-choice-group__options">
      <WlCheckbox
        v-for="(option, index) in options"
        :id="`${prefix}-${index}`"
        :key="resolveOptionKey(option, props.optionKey, index, valueOf(option))"
        v-bind="section('option', { checked: checked(option), disabled: isDisabled(option) })"
        :model-value="checked(option)"
        :disabled="isDisabled(option)"
        :invalid="invalid"
        :name="name"
        :pt="inputPt(option)"
        @update:model-value="change(option, $event)"
      ><slot
        name="option"
        :option="option"
        :index="index"
        :checked="checked(option)"
        :disabled="isDisabled(option)"
      >{{ resolveLabel(option, props.optionLabel) }}</slot></WlCheckbox>
    </div>
  </fieldset>
</template>
