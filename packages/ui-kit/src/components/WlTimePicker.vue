<script setup lang="ts">
/** WlTimePicker public component contract.
 * @since 0.8.0
 */
import { computed, ref, useAttrs, watch } from "vue";
import type { WlNoModelModifiers } from "../model-types";
import type { WlTimeInterval, WlTimePickerHourFormat } from "../picker-types";
import type { WlPt } from "../pt-types";
import type { WlDensity, WlSizeSm } from "../types";
import { mergeWlAttrs, useWlLocale, useWlPt } from "../config";
import { splitInputAttrs } from "../utils/inputAttrs";
import { createTimeInputFormat, timeInInterval, timeSeconds, timeValue } from "../utils/timeInputFormat";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<{
  /** Modifier flags accepted by the component's typed model contract. */
  modelModifiers?: WlNoModelModifiers;
  /** Lower HH:mm boundary; minTime > maxTime defines an overnight range. */
  minTime?: string;
  /** Upper HH:mm boundary. */
  maxTime?: string;
  /**
   * Increment in seconds, or any for unrestricted step precision.
   * @default 60
   */
  step?: number | string;
  /**
   * Choose native, twelve-hour or twenty-four-hour time presentation.
   * @default "auto"
   */
  hourFormat?: WlTimePickerHourFormat;
  /** Allowed time intervals; values outside them cannot be selected. */
  allowedIntervals?: readonly WlTimeInterval[];
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
   * Disables selection.
   * @default false
   */
  disabled?: boolean;
  /**
   * External error state.
   * @default false
   */
  invalid?: boolean;
  /** Root and input attributes. */
  pt?: WlPt<"timepicker">;
}>(), { size: "md", density: "default", disabled: false, invalid: false, step: 60, hourFormat: "auto" });
/** A local wall-clock time, with optional seconds; no date or timezone is added. */
const model = defineModel<string | null, never>({ default: null });
const attrs = useAttrs();
const attrGroups = computed(() => splitInputAttrs(attrs));
const section = useWlPt("timepicker", computed(() => props.pt));
const locale = useWlLocale();
const step = computed(() => Number.isFinite(Number(props.step)) && Number(props.step) > 0
  ? Math.max(1, Math.round(Number(props.step)))
  : 60);
const anyStep = computed(() => props.step === "any");
const precision = computed(() => anyStep.value || step.value % 60 !== 0);
const native = computed(() => props.hourFormat === "auto");
const formatted = computed(() => createTimeInputFormat(locale.value.localeCode, props.hourFormat === 12 ? 12 : 24, precision.value));
const min = computed(() => {
  const value = props.minTime ?? attrGroups.value.inputAttrs.min;
  return typeof value === "string" && isTime(value) ? value : undefined;
});
const max = computed(() => {
  const value = props.maxTime ?? attrGroups.value.inputAttrs.max;
  return typeof value === "string" && isTime(value) ? value : undefined;
});
const control = ref<HTMLInputElement | null>(null);
const draft = ref("");
function isTime(value: string): boolean {
  return timeSeconds(value) !== null;
}
function allowed(value: string): boolean {
  const total = timeSeconds(value);
  if (total === null) return false;
  const lower = min.value ? timeSeconds(min.value) : null;
  const upper = max.value ? timeSeconds(max.value) : null;
  const inBounds = lower !== null && upper !== null
    ? timeInInterval(total, lower, upper)
    : (lower === null || total >= lower) && (upper === null || total <= upper);
  const inIntervals = props.allowedIntervals === undefined || props.allowedIntervals.some((interval) => {
    const start = timeSeconds(interval.start);
    const end = timeSeconds(interval.end);
    return start !== null && end !== null && timeInInterval(total, start, end);
  });
  return inBounds && inIntervals && (anyStep.value || ((total - (lower ?? 0) + 86400) % 86400) % step.value === 0);
}
function display(value: string | null): string {
  return value && isTime(value) ? native.value ? timeValue(timeSeconds(value)!, precision.value) : formatted.value.format(value) : "";
}
watch([model, native, formatted], () => {
  draft.value = display(model.value);
}, { immediate: true });
function onInput(event: Event): void {
  const target = event.target as HTMLInputElement;
  if (props.disabled || target.readOnly)
    return;
  draft.value = target.value;
  if (draft.value === "")
    model.value = null;
  else {
    const value = native.value ? draft.value : formatted.value.parse(draft.value);
    if (value && allowed(value)) model.value = timeValue(timeSeconds(value)!, precision.value);
  }
}
function commit(): void {
  const value = native.value ? draft.value : formatted.value.parse(draft.value);
  if (draft.value && (!value || !allowed(value))) {
    draft.value = display(model.value);
    if (control.value)
      control.value.value = draft.value;
  }
}
</script>

<template>
  <div
    v-bind="mergeWlAttrs(attrGroups.rootAttrs, section('root'))"
    class="wl-time-picker wl-input-wrap"
    data-wl="time-picker"
    :data-size="size"
    :data-density="density"
  >
    <input
      ref="control"
      v-bind="mergeWlAttrs(attrGroups.inputAttrs, section('input'))"
      :type="native ? 'time' : 'text'"
      :inputmode="native ? undefined : 'text'"
      :value="draft"
      :min="min"
      :max="max"
      :step="native ? anyStep ? 'any' : step : undefined"
      :disabled="disabled"
      class="wl-input"
      :class="[`wl-input--${size}`, { 'is-invalid': invalid, 'is-compact': density === 'compact' }]"
      :aria-invalid="invalid || undefined"
      @input="onInput"
      @blur="commit"
      @keydown.enter="commit"
    />
  </div>
</template>
