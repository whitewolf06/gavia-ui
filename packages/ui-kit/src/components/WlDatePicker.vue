<script setup lang="ts" generic="Mode extends WlDatePickerSelectionMode = 'single'">
/** WlDatePicker public component contract.
 * @since 0.1.0
 */
import { computed, nextTick, ref, useAttrs, watch } from "vue";
import type { WlNoModelModifiers } from "../model-types";
import type { WlDateFormatOptions, WlDateRangePreset, WlDisabledDates } from "../picker-types";
import type { WlPt } from "../pt-types";
import type { WlDatePickerModel, WlDatePickerSelectionMode, WlDateRange, WlDensity, WlSizeSm } from "../types";
import { mergeWlAttrs, useWlLocale, useWlMotion, useWlPt } from "../config";
import { formatWlLocaleText } from "../locale";
import { useAnchoredOverlay } from "../utils/anchoredOverlay";
import { parseWlIsoDate, toWlIsoDate } from "../utils/date";
import { createDateInputFormat } from "../utils/dateInputFormat";
import { splitInputAttrs } from "../utils/inputAttrs";
import { markOverlayLeaving, restoreOverlayEntering } from "../utils/overlayTransition";
import Teleport from "../utils/templateTeleport.vue";
import Transition from "../utils/templateTransition.vue";
import { useWlId } from "../utils/useWlId";
import WlIcon from "./WlIcon.vue";
defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<{
  /** Modifier flags accepted by the component's typed model contract. */
  modelModifiers?: WlNoModelModifiers;
  /**
   * Placeholder.
   * Defaults to WlConfig.locale.datePlaceholder (English when unconfigured).
   * @default undefined
   */
  placeholder?: string;
  /**
   * Field size.
   * @default "md"
   */
  size?: WlSizeSm;
  /**
   * Spacing density for this component family.
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
  /**
   * Calendar icon button.
   * @default false
   */
  showIcon?: boolean;
  /** Minimum date in "YYYY-MM-DD" format. Empty or invalid values do not restrict selection. */
  minDate?: string;
  /** Maximum date in "YYYY-MM-DD" format. Empty or invalid values do not restrict selection. */
  maxDate?: string;
  /**
   * Display and manual input format; the model remains ISO.
   * @default "dd.mm.yyyy"
   */
  displayFormat?: "dd.mm.yyyy" | "yyyy-mm-dd" | "locale";
  /** Intl date-format options used by the localized display mode. */
  formatOptions?: WlDateFormatOptions;
  /** Date list or predicate identifying dates that cannot be selected. */
  disabledDates?: WlDisabledDates;
  /** Consumer-provided predefined date ranges. */
  rangePresets?: readonly WlDateRangePreset[];
  /**
   * single: ISO string/null; range: [start, end|null]/null. The first selection sets the start, the second
   * completes and sorts the range, and the next starts a new one.
   */
  selectionMode?: Mode;
  /**
   * Visible range start label.
   * Defaults to WlConfig.locale.dateFrom (English when unconfigured).
   * @default undefined
   */
  startLabel?: string;
  /**
   * Visible range end label.
   * Defaults to WlConfig.locale.dateTo (English when unconfigured).
   * @default undefined
   */
  endLabel?: string;
  /** Calendar animation; defaults to WlConfig.motion (true). */
  motion?: boolean;
  /** Attributes of internal Gavia UI elements. */
  pt?: WlPt<"datepicker">;
}>(), {
  size: "md", density: "default", disabled: false, invalid: false, showIcon: false,
  selectionMode: () => "single" as Mode,
  motion: undefined, displayFormat: "dd.mm.yyyy"
});
/** ISO date or date-range value determined by selectionMode.
 * Paired with update:modelValue.
 * @default null
 */
const model = defineModel<WlDatePickerModel<NoInfer<Mode>>, never>({ default: null });
const locale = useWlLocale();
const startLabel = computed(() => props.startLabel ?? locale.value.dateFrom);
const endLabel = computed(() => props.endLabel ?? locale.value.dateTo);
const placeholder = computed(() => props.placeholder ?? locale.value.datePlaceholder);

const attrs = useAttrs();
const attrGroups = computed(() => splitInputAttrs(attrs));
const section = useWlPt("datepicker", computed(() => props.pt));
const motion = useWlMotion(computed(() => props.motion));
const isRange = computed(() => props.selectionMode === "range");
const range = computed<WlDateRange | null>(() => Array.isArray(model.value) ? model.value as WlDateRange : null);
const single = computed(() => typeof model.value === "string" ? model.value : null);
const start = computed(() => isRange.value ? range.value?.[0] ?? null : single.value);
const end = computed(() => isRange.value ? range.value?.[1] ?? null : null);
const uid = useWlId();
const startId = computed(() => String(attrGroups.value.inputAttrs.id ?? `wl-datepicker-${uid}`));
const endId = computed(() => `${startId.value}-end`);
const panelId = `wl-datepicker-panel-${uid}`;
function endpointAttrs(endpoint: 0 | 1): Record<string, unknown> {
  const inputAttrs = { ...attrGroups.value.inputAttrs };
  inputAttrs.id = endpoint === 0 ? startId.value : endId.value;
  if (endpoint === 1) {
    delete inputAttrs.autofocus;
    if (typeof inputAttrs.name === "string")
      inputAttrs.name = `${inputAttrs.name}-end`;
  }
  const labelId = `${endpoint === 0 ? startId.value : endId.value}-endpoint-label`;
  if (typeof inputAttrs["aria-labelledby"] === "string") {
    inputAttrs["aria-labelledby"] = `${inputAttrs["aria-labelledby"]} ${labelId}`;
  } else
    if (typeof inputAttrs["aria-label"] === "string") {
      inputAttrs["aria-label"] = `${inputAttrs["aria-label"]}, ${endpoint === 0 ? startLabel.value : endLabel.value}`;
    }
  return inputAttrs;
}
const control = ref<HTMLInputElement | null>(null);
const endControl = ref<HTMLInputElement | null>(null);
const activeEndpoint = ref<0 | 1>(0);
const text = ref("");
const endText = ref("");
const initial = parseIso(start.value) ?? new Date();
const viewYear = ref(initial.getFullYear());
const viewMonth = ref(initial.getMonth());
const viewMode = ref<"days" | "months" | "years">("days");
const focusedDate = ref(toIso(initial));
const firstVisibleYear = computed(() => Math.floor(viewYear.value / 12) * 12);
const { visible, panel, style, show, hide } = useAnchoredOverlay();
const minimum = computed(() => parseIso(props.minDate) ? props.minDate : undefined);
const maximum = computed(() => parseIso(props.maxDate) ? props.maxDate : undefined);
const localizedFormat = computed(() => createDateInputFormat(locale.value.localeCode, props.formatOptions));
const disabledSet = computed(() => new Set(Array.isArray(props.disabledDates) ? props.disabledDates : []));
const weekdays = computed(() => Array.from({ length: 7 }, (_, index) =>
  locale.value.dayNamesMin[(index + locale.value.firstDayOfWeek) % 7] ?? ""));
function dateDisabled(iso: string): boolean {
  return (minimum.value !== undefined && iso < minimum.value)
    || (maximum.value !== undefined && iso > maximum.value)
    || (typeof props.disabledDates === "function" ? props.disabledDates(iso) : disabledSet.value.has(iso));
}
const days = computed(() => {
  const first = new Date(viewYear.value, viewMonth.value, 1);
  const offset = (first.getDay() - locale.value.firstDayOfWeek + 7) % 7;
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(viewYear.value, viewMonth.value, index + 1 - offset);
    const iso = toIso(date);
    return {
      date, iso, label: date.getDate(), otherMonth: date.getMonth() !== viewMonth.value,
      selected: iso === start.value || iso === end.value,
      inRange: !!(isRange.value && start.value && end.value && iso > start.value && iso < end.value),
      today: iso === toIso(new Date()), disabled: dateDisabled(iso)
    };
  });
});
function rangeHint(): string {
  return !range.value
    ? formatWlLocaleText(locale.value.chooseDateForLabel, { label: startLabel.value })
    : !range.value[1]
        ? formatWlLocaleText(locale.value.chooseDateForLabel, { label: endLabel.value })
        : `${startLabel.value}: ${display(range.value[0])}; ${endLabel.value}: ${display(range.value[1])}. ${locale.value.newDateRange}`;
}
const rangeHintText = computed(rangeHint);
function pad2(value: number): string {
  return String(value).padStart(2, "0");
}
function toIso(date: Date): string {
  return toWlIsoDate(date);
}
function parseIso(value: string | null | undefined): Date | null {
  if (!value)
    return null;
  return parseWlIsoDate(value);
}
function display(value: string | null): string {
  const date = parseIso(value);
  if (date && props.displayFormat === "yyyy-mm-dd")
    return value!;
  if (date && props.displayFormat === "locale") return localizedFormat.value.format(value!);
  return date ? `${pad2(date.getDate())}.${pad2(date.getMonth() + 1)}.${date.getFullYear()}` : "";
}
function syncText(): void {
  text.value = display(start.value);
  endText.value = display(end.value);
}
watch([model, () => props.displayFormat, localizedFormat, isRange], syncText, { immediate: true, deep: true });
watch(() => props.disabled, (locked) => {
  if (locked)
    hide();
});
function update(value: string | WlDateRange | null): void {
  model.value = value as WlDatePickerModel<Mode>;
  // Formatting also updates when the parent accepts an unchanged value.
  syncText();
}
function sortedRange(first: string, second: string): WlDateRange {
  return first <= second ? [first, second] : [second, first];
}
const presetCycle = ref(0);
function presetValue(preset: WlDateRangePreset): WlDateRange | null {
  const value = typeof preset.value === "function" ? preset.value() : preset.value;
  return parseIso(value[0]) && parseIso(value[1]) && !dateDisabled(value[0]) && !dateDisabled(value[1])
    ? sortedRange(value[0], value[1])
    : null;
}
const resolvedPresets = computed(() => {
  void presetCycle.value;
  return (props.rangePresets ?? []).map((preset) => ({ preset, disabled: preset.disabled || !presetValue(preset) }));
});
function choosePreset(preset: WlDateRangePreset): void {
  if (props.disabled || preset.disabled || !isRange.value) return;
  const value = presetValue(preset);
  if (!value) return;
  update(value);
  hide();
  nextTick(() => control.value?.focus());
}
function commit(endpoint: 0 | 1 = 0): void {
  if (props.disabled) {
    syncText();

    return;
  }
  const draft = (endpoint === 0 ? text.value : endText.value).trim();
  if (!draft) {
    update(isRange.value && endpoint === 1 && start.value ? [start.value, null] : null);
    return;
  }
  const match = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(draft);
  const iso = props.displayFormat === "yyyy-mm-dd"
    ? draft
    : props.displayFormat === "locale"
      ? localizedFormat.value.parse(draft, endpoint === 0 ? start.value : end.value)
      : match ? `${match[3]}-${pad2(Number(match[2]))}-${pad2(Number(match[1]))}` : null;
  if (!iso || !parseIso(iso) || dateDisabled(iso)) {
    syncText();

    return;
  }
  if (!isRange.value)
    update(iso);
  else
    if (endpoint === 0)
      update(end.value ? sortedRange(iso, end.value) : [iso, null]);
    else
      if (start.value)
        update(sortedRange(start.value, iso));
      else
        syncText();
}
function clampDate(iso: string): string {
  if (minimum.value && iso < minimum.value)
    return minimum.value;
  if (maximum.value && iso > maximum.value)
    return maximum.value;
  return iso;
}
function setCalendarDate(iso: string): void {
  const date = parseIso(iso);
  if (!date)
    return;
  focusedDate.value = iso;
  viewYear.value = date.getFullYear();
  viewMonth.value = date.getMonth();
}
async function focusDay(iso: string): Promise<void> {
  setCalendarDate(iso);
  await nextTick();
  panel.value?.querySelector<HTMLButtonElement>(`[data-date="${iso}"]`)?.focus();
}
function open(event: Event, focusCalendar = false): void {
  if (props.disabled)
    return;
  presetCycle.value += 1;
  const target = event.target;
  if (target === endControl.value)
    activeEndpoint.value = 1;
  else
    if (target === control.value)
      activeEndpoint.value = 0;
  const selected = activeEndpoint.value === 1 ? end.value ?? start.value : start.value;
  let iso = clampDate(parseIso(selected) ? selected! : toIso(new Date()));
  setCalendarDate(iso);
  if (dateDisabled(iso)) {
    const available = days.value.find((day) => !day.otherMonth && !day.disabled) ?? days.value.find((day) => !day.disabled);
    if (available) {
      iso = available.iso;
      setCalendarDate(iso);
    }
  }
  viewMode.value = "days";
  show(event);
  if (focusCalendar && !dateDisabled(iso))
    void focusDay(iso);
}
function stepMonth(amount: number): void {
  if (viewMode.value === "years") {
    viewYear.value += amount * 12;

    return;
  }
  if (viewMode.value === "months") {
    viewYear.value += amount;

    return;
  }
  const next = new Date(viewYear.value, viewMonth.value + amount, 1);
  viewYear.value = next.getFullYear();
  viewMonth.value = next.getMonth();
  const candidate = days.value.find((day) => !day.otherMonth && !day.disabled);
  if (candidate)
    focusedDate.value = candidate.iso;
}
function monthDisabled(month: number): boolean {
  const first = `${viewYear.value}-${pad2(month + 1)}-01`;
  const last = toIso(new Date(viewYear.value, month + 1, 0));
  return (minimum.value !== undefined && last < minimum.value)
    || (maximum.value !== undefined && first > maximum.value);
}
function yearDisabled(year: number): boolean {
  return (minimum.value !== undefined && `${year}-12-31` < minimum.value)
    || (maximum.value !== undefined && `${year}-01-01` > maximum.value);
}
function selectMonth(month: number): void {
  viewMonth.value = month;
  viewMode.value = "days";
  const candidate = days.value.find((day) => !day.otherMonth && !day.disabled);
  if (candidate)
    focusedDate.value = candidate.iso;
}
function selectYear(year: number): void {
  viewYear.value = year;

  viewMode.value = "months";
}
function choose(iso: string, disabled: boolean): void {
  if (disabled || props.disabled)
    return;
  if (isRange.value && (!range.value || range.value[1] !== null)) {
    update([iso, null]);
    activeEndpoint.value = 1;
    void focusDay(iso);
    return;
  }
  update(isRange.value && range.value ? sortedRange(range.value[0], iso) : iso);
  hide();
  nextTick(() => (activeEndpoint.value === 1 ? endControl.value : control.value)?.focus());
}
function onKeydown(event: KeyboardEvent): void {
  const endpoint = event.target === endControl.value ? 1 : 0;
  activeEndpoint.value = endpoint;
  if (event.key === "ArrowDown") {
    event.preventDefault();

    open(event, true);
  }
  if (event.key === "Enter" && event.target instanceof HTMLInputElement) {
    if (visible.value)
      event.preventDefault();
    commit(endpoint);

    hide();
  }
  if (event.key === "Escape" && visible.value)
    hide(event);
}
function onDayKeydown(event: KeyboardEvent, iso: string): void {
  const date = parseIso(iso);
  if (!date)
    return;
  const weekday = (date.getDay() - locale.value.firstDayOfWeek + 7) % 7;
  const offsets: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7, Home: -weekday, End: 6 - weekday };
  if (event.key in offsets)
    date.setDate(date.getDate() + offsets[event.key]!);
  else
    if (event.key === "PageUp" || event.key === "PageDown") {
      const day = date.getDate();
      date.setDate(1);
      date.setMonth(date.getMonth() + (event.key === "PageUp" ? -1 : 1) * (event.shiftKey ? 12 : 1));
      date.setDate(Math.min(day, new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()));
    } else
      return;
  event.preventDefault();
  const direction = event.key === "Home" ? 1 : event.key === "End" ? -1 : toIso(date) < iso ? -1 : 1;
  const stride = event.key === "ArrowUp" || event.key === "ArrowDown" ? 7 : 1;
  const bounded = parseIso(clampDate(toIso(date)));
  if (bounded) date.setTime(bounded.getTime());
  for (let attempt = 0; attempt < 366; attempt++) {
    const next = toIso(date);
    if ((minimum.value && next < minimum.value) || (maximum.value && next > maximum.value)) return;
    if (!dateDisabled(next)) {
      void focusDay(next);
      return;
    }
    date.setDate(date.getDate() + direction * stride);
  }
}
</script>

<template>
  <!-- Native endpoint controls own focus; this wrapper delegates their click and keyboard events. -->
  <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
  <div
    v-bind="mergeWlAttrs(attrGroups.rootAttrs, section('root'))"
    class="wl-dp"
    :class="{ 'is-invalid': props.invalid, 'is-disabled': props.disabled, 'wl-dp--range': isRange }"
    :data-size="props.size"
    :data-density="props.density"
    :data-selection-mode="props.selectionMode"
    data-wl="date-picker"
    :role="isRange ? 'group' : undefined"
    :aria-label="isRange ? attrGroups.inputAttrs['aria-label'] as string : undefined"
    @click="open"
    @keydown="onKeydown"
  >
    <template v-if="isRange">
      <label class="wl-dp__endpoint" :for="startId">
        <span
          :id="`${startId}-endpoint-label`"
          v-bind="section('startLabel')"
          class="wl-dp__endpoint-label"
        >{{ startLabel }}</span>
        <input
          ref="control"
          v-bind="mergeWlAttrs(endpointAttrs(0), section('inputText.root'))"
          v-model="text"
          class="wl-input wl-dp__input"
          :class="[`wl-input--${props.size}`, { 'is-invalid': props.invalid, 'is-compact': props.density === 'compact' }]"
          type="text"
          :placeholder="placeholder"
          :disabled="props.disabled"
          :aria-invalid="props.invalid || undefined"
          :aria-expanded="visible"
          :aria-controls="visible ? panelId : undefined"
          aria-haspopup="dialog"
          autocomplete="off"
          @blur="commit(0)"
        />
      </label>
      <label class="wl-dp__endpoint" :for="endId">
        <span
          :id="`${endId}-endpoint-label`"
          v-bind="section('endLabel')"
          class="wl-dp__endpoint-label"
        >{{ endLabel }}</span>
        <input
          ref="endControl"
          v-bind="mergeWlAttrs(endpointAttrs(1), section('endInput'))"
          v-model="endText"
          class="wl-input wl-dp__input"
          :class="[`wl-input--${props.size}`, { 'is-invalid': props.invalid, 'is-compact': props.density === 'compact' }]"
          type="text"
          :placeholder="placeholder"
          :disabled="props.disabled"
          :aria-invalid="props.invalid || undefined"
          :aria-expanded="visible"
          :aria-controls="visible ? panelId : undefined"
          aria-haspopup="dialog"
          autocomplete="off"
          @blur="commit(1)"
        />
      </label>
    </template>
    <input
      v-else
      ref="control"
      v-bind="mergeWlAttrs(attrGroups.inputAttrs, section('inputText.root'))"
      v-model="text"
      class="wl-input wl-dp__input"
      :class="[
        `wl-input--${props.size}`,
        { 'is-invalid': props.invalid, 'is-compact': props.density === 'compact', 'wl-dp__input--btn': props.showIcon }
      ]"
      type="text"
      :placeholder="placeholder"
      :disabled="props.disabled"
      :aria-invalid="props.invalid || undefined"
      :aria-expanded="visible"
      :aria-controls="visible ? panelId : undefined"
      aria-haspopup="dialog"
      autocomplete="off"
      @blur="commit(0)"
    />
    <button
      v-if="props.showIcon"
      v-bind="section('dropdown')"
      type="button"
      class="wl-dp__trigger"
      :disabled="props.disabled"
      :aria-label="locale.chooseDate"
      :aria-expanded="visible"
      :aria-controls="visible ? panelId : undefined"
      aria-haspopup="dialog"
    >
      <WlIcon
        name="calendar"
        :size="18"
        v-bind="section('dropdownIcon')"
        class="wl-dp__trigger-icon"
      />
    </button>
  </div>
  <Teleport to="body">
    <Transition
      name="wl-pop-motion"
      :css="motion"
      @before-leave="markOverlayLeaving"
      @before-enter="restoreOverlayEntering"
      @leave-cancelled="restoreOverlayEntering"
    >
      <div
        v-if="visible"
        :id="panelId"
        ref="panel"
        v-bind="section('panel')"
        class="wl-overlay wl-dp__panel"
        :style="style"
        role="dialog"
        :aria-label="locale.chooseDate"
      >
        <div
          v-if="isRange && resolvedPresets.length"
          v-bind="section('presets')"
          class="wl-dp__presets"
          role="group"
          :aria-label="locale.dateRangePresets"
        >
          <button
            v-for="({ preset, disabled: presetDisabled }, index) in resolvedPresets"
            :key="index"
            v-bind="section('preset')"
            type="button"
            class="wl-dp__preset"
            :disabled="props.disabled || presetDisabled"
            @click="choosePreset(preset)"
          >{{ preset.label }}</button>
        </div>
        <div v-bind="section('calendarContainer')" class="wl-dp__container">
          <div v-bind="section('calendar')" class="wl-dp__calendar">
            <div v-bind="section('header')" class="wl-dp__header">
              <button
                v-bind="section('prevButton.root')"
                type="button"
                class="wl-dp__nav"
                :aria-label="locale.prevMonth"
                @click="stepMonth(-1)"
              ><WlIcon name="chevron-left" :size="16" v-bind="section('prevButton.icon')" /></button>
              <div v-bind="section('title')" class="wl-dp__title">
                <template v-if="viewMode === 'years'">{{ firstVisibleYear }}–{{ firstVisibleYear + 11 }}</template>
                <template v-else>
                  <button
                    v-if="viewMode === 'days'"
                    v-bind="section('selectMonth')"
                    type="button"
                    class="wl-dp__view-btn"
                    :aria-label="formatWlLocaleText(locale.chooseMonthCurrent, { month: locale.monthNames[viewMonth]! })"
                    @click="viewMode = 'months'"
                  >{{ locale.monthNames[viewMonth] }}</button>
                  <button
                    v-bind="section('selectYear')"
                    type="button"
                    class="wl-dp__view-btn"
                    :aria-label="formatWlLocaleText(locale.chooseYearCurrent, { year: viewYear })"
                    @click="viewMode = 'years'"
                  >{{ viewYear }}</button>
                </template>
              </div>
              <button
                v-bind="section('nextButton.root')"
                type="button"
                class="wl-dp__nav"
                :aria-label="locale.nextMonth"
                @click="stepMonth(1)"
              ><WlIcon name="chevron-right" :size="16" v-bind="section('nextButton.icon')" /></button>
            </div>
            <p
              v-if="isRange"
              v-bind="section('rangeHint')"
              class="wl-dp__range-hint"
              aria-live="polite"
            >{{ rangeHintText }}</p>
            <table
              v-if="viewMode === 'days'"
              v-bind="section('dayView')"
              class="wl-dp__table"
              role="grid"
              :aria-multiselectable="isRange || undefined"
              :aria-label="`${locale.monthNames[viewMonth]} ${viewYear}`"
            >
              <thead><tr><th
                v-for="(day, index) in weekdays"
                :key="index"
                v-bind="section('tableHeaderCell')"
                class="wl-dp__wd-cell"
                scope="col"
              >
                <span v-bind="section('weekDay')" class="wl-dp__weekday">{{ day }}</span></th></tr></thead>
              <tbody><tr v-for="week in 6" :key="week">
                <td
                  v-for="day in days.slice((week - 1) * 7, week * 7)"
                  :key="day.iso"
                  v-bind="section('dayCell')"
                  class="wl-dp__day-cell"
                  :aria-selected="day.selected || day.inRange"
                >
                  <button
                    v-bind="section('day', {
                      selected: day.selected, inRange: day.inRange, today: day.today,
                      otherMonth: day.otherMonth, disabled: day.disabled
                    })"
                    type="button"
                    class="wl-dp__day"
                    :data-date="day.iso"
                    :class="{
                      'is-selected': day.selected, 'is-in-range': day.inRange, 'is-today': day.today,
                      'is-muted': day.otherMonth, 'is-disabled': day.disabled
                    }"
                    :disabled="day.disabled"
                    :aria-label="day.iso"
                    :aria-selected="day.selected || day.inRange"
                    :tabindex="day.iso === focusedDate && !day.disabled ? 0 : -1"
                    @focus="focusedDate = day.iso"
                    @keydown="onDayKeydown($event, day.iso)"
                    @click="choose(day.iso, day.disabled)"
                  >{{ day.label }}</button>
                </td>
              </tr></tbody>
            </table>
            <div
              v-else-if="viewMode === 'months'"
              v-bind="section('monthView')"
              class="wl-dp__choices"
              role="group"
              :aria-label="formatWlLocaleText(locale.monthsOfYear, { year: viewYear })"
            >
              <button
                v-for="(month, index) in locale.monthNames"
                :key="index"
                v-bind="section('month', { selected: index === viewMonth, disabled: monthDisabled(index) })"
                type="button"
                class="wl-dp__choice"
                :class="{ 'is-selected': index === viewMonth }"
                :disabled="monthDisabled(index)"
                @click="selectMonth(index)"
              >{{ month }}</button>
            </div>
            <div
              v-else
              v-bind="section('yearView')"
              class="wl-dp__choices"
              role="group"
              :aria-label="formatWlLocaleText(locale.yearsRange, { start: firstVisibleYear, end: firstVisibleYear + 11 })"
            >
              <button
                v-for="year in 12"
                :key="firstVisibleYear + year - 1"
                v-bind="section('year', {
                  selected: firstVisibleYear + year - 1 === viewYear,
                  disabled: yearDisabled(firstVisibleYear + year - 1)
                })"
                type="button"
                class="wl-dp__choice"
                :class="{ 'is-selected': firstVisibleYear + year - 1 === viewYear }"
                :disabled="yearDisabled(firstVisibleYear + year - 1)"
                @click="selectYear(firstVisibleYear + year - 1)"
              >{{ firstVisibleYear + year - 1 }}</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
