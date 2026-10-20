<script setup lang="ts">
/** WlSlider public component contract.
 * @since 0.1.0
 */
import { computed, useAttrs } from "vue";
import type { WlNoModelModifiers } from "../model-types";
import type { WlPt } from "../pt-types";
import type { WlDensity, WlSizeSm } from "../types";
import { mergeWlAttrs, useWlLocale, useWlPt } from "../config";
import { getWlControlProps, splitInputAttrs } from "../utils/inputAttrs";
import { clamp, finiteOr, toPercent } from "../utils/number";
import { useWlId } from "../utils/useWlId";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<{
  /** Modifier flags accepted by the component's typed model contract. */
  modelModifiers?: WlNoModelModifiers;
  /**
   * Minimum.
   * @default 0
   */
  min?: number;
  /**
   * Maximum.
   * @default 100
   */
  max?: number;
  /**
   * Step.
   * @default 1
   */
  step?: number;
  /**
   * Disables the slider.
   * @default false
   */
  disabled?: boolean;
  /**
   * Expose a validation error state on the control.
   * @default false
   */
  invalid?: boolean;
  /**
   * Use two slider handles with a start/end value pair.
   * @default false
   */
  range?: boolean;
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
  /** aria-label. */
  ariaLabel?: string;
  /** Human-readable value text for assistive technology. */
  ariaValueText?: string | ((value: number, index: 0 | 1) => string);
  /** Accessible label for the range start control. */
  startLabel?: string;
  /** Accessible label for the range end control. */
  endLabel?: string;
  /**
   * Labeled positions displayed along the slider track.
   * @default []
   */
  marks?: readonly (number | { value: number; label?: string })[];
  /** Attributes and callbacks for the component's documented pass-through sections. */
  pt?: WlPt<"slider">;
}>(), { min: 0, max: 100, step: 1, disabled: false, invalid: false, range: false, size: "md", density: "default", marks: () => [] });

/** Numeric value, or a pair of start/end values in range mode.
 * Paired with update:modelValue.
 * @default 0
 */
const model = defineModel<number | [number, number], never>({ default: 0 });
const attrs = useAttrs();
const attrGroups = computed(() => splitInputAttrs(attrs));
const section = useWlPt("slider", computed(() => props.pt));
const locale = useWlLocale();
const uid = `wl-slider-${useWlId()}`;
const minimum = computed(() => Number.isFinite(props.min) ? props.min : 0);
const maximum = computed(() => Math.max(minimum.value, Number.isFinite(props.max) ? props.max : 100));
const increment = computed(() => Number.isFinite(props.step) && props.step > 0 ? props.step : 1);
const currentValue = computed(() => clamp(finiteOr(model.value, minimum.value), minimum.value, maximum.value));
const currentRange = computed<[number, number]>(() => {
  const values = Array.isArray(model.value) ? model.value : [minimum.value, maximum.value];
  const start = clamp(finiteOr(values[0], minimum.value), minimum.value, maximum.value);
  const end = clamp(finiteOr(values[1], maximum.value), minimum.value, maximum.value);
  return [Math.min(start, end), Math.max(start, end)];
});
const pct = computed(() => toPercent(currentValue.value, minimum.value, maximum.value));
const rangeStyle = computed(() => ({
  "--wl-slider-start": `${toPercent(currentRange.value[0], minimum.value, maximum.value)}%`,
  "--wl-slider-end": `${toPercent(currentRange.value[1], minimum.value, maximum.value)}%`
}));
const marks = computed(() => props.marks.map((mark) => typeof mark === "number" ? { value: mark, label: String(mark) } : mark)
  .filter((mark) => Number.isFinite(mark.value) && mark.value >= minimum.value && mark.value <= maximum.value));
const baseLabel = computed(() => props.ariaLabel ?? getWlControlProps(attrGroups.value.inputAttrs).ariaLabel);
const startText = computed(() => props.startLabel ?? `${baseLabel.value ?? locale.value.slider} ${locale.value.rangeStart}`);
const endText = computed(() => props.endLabel ?? `${baseLabel.value ?? locale.value.slider} ${locale.value.rangeEnd}`);
function valueText(value: number, index: 0 | 1 = 0): string | undefined {
  if (typeof props.ariaValueText === "function") return props.ariaValueText(value, index);
  return props.ariaValueText ?? (typeof attrGroups.value.inputAttrs["aria-valuetext"] === "string"
    ? attrGroups.value.inputAttrs["aria-valuetext"]
    : undefined);
}
function rangeAttrs(index: 0 | 1): Record<string, unknown> {
  const base = attrGroups.value.inputAttrs;
  return mergeWlAttrs(base, section("input"), section(index === 0 ? "startInput" : "endInput"), {
    id: index === 0 && typeof base.id === "string" ? base.id : `${uid}-${index}`,
    "aria-labelledby": typeof base["aria-labelledby"] === "string" ? `${base["aria-labelledby"]} ${uid}-label-${index}` : undefined
  });
}
function onInput(event: Event, index?: 0 | 1): void {
  if (props.disabled) return;
  const value = Number((event.target as HTMLInputElement).value);
  if (!Number.isFinite(value)) return;
  if (index === undefined) model.value = clamp(value, minimum.value, maximum.value);
  else {
    const values: [number, number] = [...currentRange.value];
    values[index] = index === 0 ? clamp(value, minimum.value, values[1]) : clamp(value, values[0], maximum.value);
    if (values[0] === currentRange.value[0] && values[1] === currentRange.value[1]) return;
    model.value = values;
  }
}
</script>

<template>
  <div
    v-if="range || marks.length"
    v-bind="mergeWlAttrs(attrGroups.rootAttrs, section('root'))"
    class="wl-slider-wrap"
    :class="{ 'wl-slider-range': range, 'is-disabled': disabled, 'is-invalid': invalid, 'is-compact': density === 'compact' }"
    data-wl="slider"
    :data-size="size"
    :data-density="density"
    :data-range="range"
    :style="range ? rangeStyle : undefined"
  >
    <template v-if="range">
      <span :id="`${uid}-label-0`" class="wl-sr-only">{{ startLabel ?? locale.rangeStart }}</span>
      <span :id="`${uid}-label-1`" class="wl-sr-only">{{ endLabel ?? locale.rangeEnd }}</span>
      <input
        v-for="index in ([0, 1] as const)"
        :key="index"
        v-bind="rangeAttrs(index)"
        type="range"
        class="wl-slider wl-slider__thumb"
        :class="{ 'is-disabled': disabled, 'is-invalid': invalid }"
        :style="{ '--wl-slider-pct': `${toPercent(currentRange[index], minimum, maximum)}%` }"
        :min="minimum"
        :max="maximum"
        :aria-valuemin="index === 0 ? minimum : currentRange[0]"
        :aria-valuemax="index === 0 ? currentRange[1] : maximum"
        :step="increment"
        :value="currentRange[index]"
        :disabled="disabled"
        :aria-label="index === 0 ? startText : endText"
        :aria-valuetext="valueText(currentRange[index], index)"
        :aria-invalid="invalid || undefined"
        @input="onInput($event, index)"
      />
    </template>
    <input
      v-else
      v-bind="mergeWlAttrs(attrGroups.inputAttrs, section('input'))"
      type="range"
      class="wl-slider"
      :class="{ 'is-disabled': disabled, 'is-invalid': invalid }"
      :style="{ '--wl-slider-pct': `${pct}%` }"
      :min="minimum"
      :max="maximum"
      :step="increment"
      :value="currentValue"
      :disabled="disabled"
      :aria-label="baseLabel"
      :aria-valuetext="valueText(currentValue)"
      :aria-invalid="invalid || undefined"
      @input="onInput($event)"
    />
    <div
      v-if="marks.length"
      v-bind="section('marks')"
      class="wl-slider__marks"
      aria-hidden="true"
    >
      <span
        v-for="(mark, index) in marks"
        :key="`${mark.value}-${index}`"
        v-bind="section('mark')"
        class="wl-slider__mark"
        :style="{ left: `${toPercent(mark.value, minimum, maximum)}%` }"
      ><span v-bind="section('label')">{{ mark.label }}</span></span>
    </div>
  </div>
  <input
    v-else
    v-bind="mergeWlAttrs(attrGroups.rootAttrs, attrGroups.inputAttrs, section('root'), section('input'))"
    type="range"
    class="wl-slider"
    :class="{ 'is-disabled': disabled, 'is-invalid': invalid, 'is-compact': density === 'compact' }"
    :style="{ '--wl-slider-pct': `${pct}%` }"
    :min="minimum"
    :max="maximum"
    :step="increment"
    :value="currentValue"
    :disabled="disabled"
    :aria-label="baseLabel"
    :aria-valuetext="valueText(currentValue)"
    :aria-invalid="invalid || undefined"
    data-wl="slider"
    :data-size="size"
    :data-density="density"
    @input="onInput($event)"
  />
</template>
