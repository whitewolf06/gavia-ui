<script setup lang="ts" generic="TOption = unknown, TResolver extends WlOptionValueResolver<NoInfer<TOption>> | undefined = undefined">
/** WlRadioGroup public component contract.
 * @slot legend - Custom legend content.
 * @slot option - Custom option content.
 */
import { computed, ref, type Ref, watch } from "vue";
import type { WlNoModelModifiers } from "../model-types";
import type { WlPt } from "../pt-types";
import type { WlOptionDisabled, WlOptionKeyResolver, WlOptionLabel, WlOptionValue, WlOptionValueResolver } from "../selection-types";
import type { WlDensity, WlSizeSm } from "../types";
import { useWlPt } from "../config";
import { optionDisabled as resolveDisabled, optionKey as resolveKey, optionLabel as resolveLabel, optionValue as resolveValue } from "../utils/options";
import { useWlRovingFocus } from "../utils/rovingFocus";
import { useWlId } from "../utils/useWlId";

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
  pt?: WlPt<"radiogroup">;
}>(), {
  options: () => [], orientation: "vertical", variant: "default", size: "md", density: "default",
  disabled: false, invalid: false, loading: false
});
/** Selected option value for the radio group.
 * Paired with update:modelValue.
 */
const model: Ref<WlOptionValue<TOption, TResolver> | undefined>
  = defineModel<WlOptionValue<NoInfer<TOption>, NoInfer<TResolver>>, never>({ default: undefined as never });
defineSlots<{
  /** Custom accessible group legend. */
  legend?(props: Record<never, never>): unknown;
  /** Custom option content with its value and interaction state. */
  option?(props: { option: TOption; index: number; checked: boolean; disabled: boolean }): unknown;
}>();
const root = ref<HTMLFieldSetElement | null>(null);
const section = useWlPt("radiogroup", computed(() => props.pt));
const prefix = `wl-radio-group-${useWlId()}`;
const name = computed(() => props.name ?? prefix);
function valueOf(option: TOption): WlOptionValue<TOption, TResolver> {
  return resolveValue(option, props.optionValue as TResolver);
}
function isDisabled(option: TOption): boolean {
  return props.disabled || props.loading || resolveDisabled(option, props.optionDisabled);
}
function checked(option: TOption): boolean {
  return Object.is(model.value, valueOf(option));
}
const roving = useWlRovingFocus({
  count: () => props.options.length,
  isDisabled: (index) => index < 0 || index >= props.options.length || isDisabled(props.options[index]!),
  focus: (index) => root.value?.querySelectorAll<HTMLInputElement>('input[type="radio"]')[index]?.focus(),
  orientation: () => props.orientation
});
watch(() => [model.value, props.options, props.disabled, props.loading], () => {
  const index = props.options.findIndex((option) => !isDisabled(option) && checked(option));
  if (index >= 0) roving.active.value = index;
}, { immediate: true });
function choose(index: number): void {
  const option = props.options[index];
  if (index < 0 || index >= props.options.length || isDisabled(option!)) return;
  roving.active.value = index;
  if (!checked(option!)) model.value = valueOf(option!);
}
function onKeydown(event: KeyboardEvent, index: number): void {
  roving.active.value = index;
  const previous = roving.active.value;
  roving.onKeydown(event);
  if (event.defaultPrevented && (previous !== roving.active.value || event.key === "Home" || event.key === "End")) choose(roving.active.value);
}
</script>

<template>
  <fieldset
    ref="root"
    v-bind="section('root')"
    class="wl-choice-group wl-radio-group"
    role="radiogroup"
    data-wl="radio-group"
    :data-variant="variant"
    :data-size="size"
    :data-density="density"
    :data-orientation="orientation"
    :aria-orientation="orientation"
    :aria-labelledby="($attrs['aria-labelledby'] as string | undefined) ?? (legend || $slots.legend ? `${prefix}-legend` : undefined)"
    :disabled="disabled || loading"
    :aria-invalid="invalid || undefined"
    :aria-busy="loading || undefined"
  >
    <legend
      v-if="legend || $slots.legend"
      :id="`${prefix}-legend`"
      v-bind="section('legend')"
      class="wl-choice-group__legend"
    ><slot name="legend">{{ legend }}</slot></legend>
    <div v-bind="section('options')" class="wl-choice-group__options">
      <label
        v-for="(option, index) in options"
        :key="resolveKey(option, props.optionKey, index, valueOf(option))"
        v-bind="section('option', { checked: checked(option), disabled: isDisabled(option) })"
        class="wl-checkline wl-checkline--radio"
        :class="{ 'is-disabled': isDisabled(option) }"
      >
        <span class="wl-radio" :class="{ 'is-disabled': isDisabled(option), 'is-invalid': invalid }">
          <input
            :id="`${prefix}-${index}`"
            v-bind="section('input', { checked: checked(option), disabled: isDisabled(option) })"
            class="wl-check-input"
            type="radio"
            :name="name"
            :value="valueOf(option)"
            :checked="checked(option)"
            :disabled="isDisabled(option)"
            :aria-invalid="invalid || undefined"
            :tabindex="roving.tabIndex(index)"
            @change="choose(index)"
            @focus="roving.active.value = index"
            @keydown="onKeydown($event, index)"
          />
          <span class="wl-radio__box" aria-hidden="true"><span class="wl-radio__icon"></span></span>
        </span>
        <span class="wl-checkline__label"><slot
          name="option"
          :option="option"
          :index="index"
          :checked="checked(option)"
          :disabled="isDisabled(option)"
        >{{ resolveLabel(option, props.optionLabel) }}</slot></span>
      </label>
    </div>
  </fieldset>
</template>
