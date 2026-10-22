<script setup lang="ts">
/** WlNumberInput public component contract.
 * @since 0.1.0
 * @slot prefix - Custom prefix content.
 * @slot suffix - Custom suffix content.
 */
import { computed, ref, useAttrs, watch } from "vue";
import type { WlNoModelModifiers } from "../model-types";
import type { WlPt } from "../pt-types";
import type { WlDensity, WlSizeSm } from "../types";
import { mergeWlAttrs, useWlLocale, useWlPt } from "../config";
import { formatWlNumber } from "../utils/format";
import { getWlControlProps, splitInputAttrs } from "../utils/inputAttrs";
import { clamp as clampNumber, roundToStep } from "../utils/number";
import { parseWlNumber } from "../utils/parseNumber";
import WlIcon from "./WlIcon.vue";
defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Modifier flags accepted by the component's typed model contract. */
    modelModifiers?: WlNoModelModifiers;
    /**
     * Minimum.
     * @default 0
     */
    min?: number;
    /**
     * Maximum.
     * @default 99
     */
    max?: number;
    /**
     * Numeric step.
     * @default 1
     */
    step?: number;
    /**
     * Field size.
     * @default "md"
     */
    size?: WlSizeSm;
    /**
     * Density.
     * @default "default"
     */
    density?: WlDensity;
    /**
     * Disables the field.
     * @default false
     */
    disabled?: boolean;
    /**
     * Error state.
     * @default false
     */
    invalid?: boolean;
    /** Input aria-label. */
    ariaLabel?: string;
    /**
     * Accessible decrement button name.
     * Defaults to WlConfig.locale.decrease (English when unconfigured).
     * @default undefined
     */
    decrementLabel?: string;
    /**
     * Accessible increment button name.
     * Defaults to WlConfig.locale.increase (English when unconfigured).
     * @default undefined
     */
    incrementLabel?: string;
    /** Enable localized number parsing and display formatting. */
    format?: boolean;
    /** Locale override for numeric display formatting. */
    locale?: string;
    /** Decimal precision used by numeric formatting. */
    precision?: number;
    /** ISO currency code used by number formatting. */
    currency?: string;
    /** Intl.NumberFormat options for the displayed numeric value. */
    numberFormat?: Intl.NumberFormatOptions;
    /** Text displayed before the numeric value. */
    prefix?: string;
    /** Text displayed after the numeric value. */
    suffix?: string;
    /** Attributes and callbacks for the component's documented pass-through sections. */
    pt?: WlPt<"numberinput">;
  }>(),
  {
    min: 0,
    max: 99,
    step: 1,
    size: "md",
    density: "default",
    disabled: false,
    invalid: false,
    format: undefined
  }
);

/** Numeric value, normalized to the configured bounds and step.
 * Paired with update:modelValue.
 * @default 0
 */
const model = defineModel<number, never>({ default: 0 });

defineSlots<{
  /** Content before the numeric input; receives the current value. */
  prefix?(props: { value: number }): unknown;
  /** Content after the numeric input; receives the current value. */
  suffix?(props: { value: number }): unknown; }>();
const appLocale = useWlLocale();
const section = useWlPt("numberinput", computed(() => props.pt));
const attrs = useAttrs();

const attrGroups = computed(() => splitInputAttrs(attrs));
const innerAttrs = computed(() => attrGroups.value.inputAttrs);
const rootAttrs = computed(() => attrGroups.value.rootAttrs);
const readonly = computed(() => !!getWlControlProps(mergeWlAttrs(innerAttrs.value, section("input"))).readonly);
const inputMode = computed(
  () =>
    (typeof innerAttrs.value.inputmode === "string"
      ? innerAttrs.value.inputmode
      : "numeric") as "none" | "text" | "decimal" | "numeric" | "tel" | "search" | "email" | "url"
);

const focused = ref(false);
const formatNumbers = computed(() => props.format ?? (props.locale !== undefined || props.precision !== undefined
  || props.currency !== undefined || props.numberFormat !== undefined));
const localeCode = computed(() => props.locale ?? appLocale.value.localeCode ?? "en");
const precisionValue = computed(() => props.precision !== undefined && Number.isFinite(props.precision)
  ? Math.max(0, Math.min(20, Math.floor(props.precision)))
  : undefined);
const formatOptions = computed<Intl.NumberFormatOptions>(() => ({
  ...props.numberFormat,
  ...(props.currency ? { style: "currency", currency: props.currency } : {}),
  ...(precisionValue.value === undefined
    ? {}
    : {
        minimumFractionDigits: precisionValue.value,
        maximumFractionDigits: precisionValue.value
      })
}));
function display(value: number): string {
  if (!formatNumbers.value)
    return String(value);
  return formatWlNumber(localeCode.value, value, focused.value
    ? { useGrouping: false, maximumFractionDigits: precisionValue.value ?? 20 }
    : formatOptions.value);
}
const draft = ref(display(model.value));
watch([model, localeCode, formatNumbers, formatOptions], () => {
  draft.value = display(model.value);
});

// Unbounded limits remain supported; NaN and reversed bounds cannot leak into updates.
const minimum = computed(() => Number.isFinite(props.min) || props.min === -Infinity ? props.min : 0);
const maximum = computed(() => Math.max(minimum.value,
  Number.isFinite(props.max) || props.max === Infinity ? props.max : 99));
const increment = computed(() => Number.isFinite(props.step) && props.step > 0 ? props.step : 1);

function clamp(value: number): number {
  const finite = Number.isFinite(value)
    ? value
    : value === Infinity ? Number.MAX_VALUE : value === -Infinity ? -Number.MAX_VALUE : 0;
  const rounded = precisionValue.value === undefined ? finite : roundToStep(finite, 10 ** -precisionValue.value);
  return clampNumber(rounded, minimum.value, maximum.value);
}

function commit(next: number): void {
  if (props.disabled || readonly.value) {
    draft.value = display(model.value);
    return;
  }
  const value = clamp(next);
  draft.value = display(value);
  if (value !== model.value)
    model.value = value;
}

function bump(direction: 1 | -1): void {
  if (props.disabled || readonly.value)
    return;
  const value = Number.isFinite(model.value) ? model.value : clamp(model.value);
  commit(value + direction * increment.value);
}

function commitDraft(): void {
  const parsed = formatNumbers.value ? parseWlNumber(localeCode.value, draft.value) : Number.parseFloat(draft.value.replace(",", "."));
  commit(Number.isNaN(parsed) ? model.value : parsed);
}
function onFocus(): void {
  focused.value = true;
  draft.value = display(model.value);
}
function onBlur(): void {
  focused.value = false;
  commitDraft();
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === "ArrowUp") {
    event.preventDefault();
    bump(1);
  } else
    if (event.key === "ArrowDown") {
      event.preventDefault();
      bump(-1);
    }
}
</script>

<template>
  <div
    class="wl-stepper"
    :class="{ 'is-disabled': disabled }"
    v-bind="mergeWlAttrs(rootAttrs, section('root'))"
    data-wl="number-input"
    :data-size="size"
    :data-density="density"
  >
    <button
      v-bind="section('decrementButton')"
      type="button"
      class="wl-stepper__btn"
      :disabled="disabled || readonly"
      :aria-label="decrementLabel ?? appLocale.decrease"
      @click="bump(-1)"
    >
      <WlIcon v-bind="section('decrementIcon')" name="minus" :size="14" />
    </button>
    <span v-if="prefix || $slots.prefix" v-bind="section('prefix')" class="wl-stepper__prefix">
      <slot name="prefix" :value="model">{{ prefix }}</slot>
    </span>
    <input
      v-model="draft"
      class="wl-input wl-stepper__input"
      :class="[
        `wl-input--${size}`,
        invalid && 'is-invalid',
        disabled && 'is-disabled',
        density === 'compact' && 'is-compact'
      ]"
      v-bind="mergeWlAttrs(innerAttrs, section('input'))"
      type="text"
      role="spinbutton"
      :inputmode="inputMode"
      :disabled="disabled"
      :aria-label="ariaLabel"
      :aria-invalid="invalid || undefined"
      :aria-valuemin="Number.isFinite(minimum) ? minimum : undefined"
      :aria-valuemax="Number.isFinite(maximum) ? maximum : undefined"
      :aria-valuenow="model"
      :aria-valuetext="formatNumbers ? display(model) : undefined"
      @focus="onFocus"
      @blur="onBlur"
      @keydown.enter="commitDraft"
      @keydown="onKeydown"
    />
    <span v-if="suffix || $slots.suffix" v-bind="section('suffix')" class="wl-stepper__suffix">
      <slot name="suffix" :value="model">{{ suffix }}</slot>
    </span>
    <button
      v-bind="section('incrementButton')"
      type="button"
      class="wl-stepper__btn"
      :disabled="disabled || readonly"
      :aria-label="incrementLabel ?? appLocale.increase"
      @click="bump(1)"
    >
      <WlIcon v-bind="section('incrementIcon')" name="plus" :size="14" />
    </button>
  </div>
</template>
