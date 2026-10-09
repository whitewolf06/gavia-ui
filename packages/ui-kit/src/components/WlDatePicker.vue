<script setup lang="ts" generic="Mode extends WlDatePickerSelectionMode = 'single'">
import { formatWlLocaleText } from "../locale";
import type { WlPt } from "../pt-types";
import type { WlNoModelModifiers } from "../model-types";
import { useWlId } from "../utils/useWlId";
import { computed, nextTick, onBeforeUpdate, ref, useAttrs, watch } from "vue";
import Teleport from "../utils/templateTeleport.vue";
import Transition from "../utils/templateTransition.vue";
import { mergeWlAttrs, useWlLocale, useWlMotion, useWlPt, useWlLocaleText } from "../config";
import type { WlDatePickerModel, WlDatePickerSelectionMode, WlDateRange, WlSizeSm } from "../types";
import { splitInputAttrs } from "../utils/inputAttrs";
import { useAnchoredOverlay } from "../utils/anchoredOverlay";
import { markOverlayLeaving, restoreOverlayEntering } from "../utils/overlayTransition";
import WlIcon from "./WlIcon.vue";
const localeText = useWlLocaleText();
const locale = useWlLocale();

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<{
  modelModifiers?: WlNoModelModifiers;
  placeholder?: string;
  size?: WlSizeSm;
  disabled?: boolean;
  invalid?: boolean;
  showIcon?: boolean;
  minDate?: string;
  maxDate?: string;
  displayFormat?: "dd.mm.yyyy" | "yyyy-mm-dd";
  selectionMode?: Mode;
  startLabel?: string;
  endLabel?: string;
  motion?: boolean;
  pt?: WlPt<"datepicker">;
}>(), {
  placeholder: "дд.мм.гггг", size: "md", disabled: false, invalid: false, showIcon: false,
  selectionMode: () => "single" as Mode, startLabel: "От", endLabel: "До",
  motion: undefined, displayFormat: "dd.mm.yyyy"
});
const model = defineModel<WlDatePickerModel<NoInfer<Mode>>, never>({ default: null });
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
    if (typeof inputAttrs.name === "string") inputAttrs.name = `${inputAttrs.name}-end`;
  }
  const labelId = `${endpoint === 0 ? startId.value : endId.value}-label`;
  if (typeof inputAttrs["aria-labelledby"] === "string") {
    inputAttrs["aria-labelledby"] = `${inputAttrs["aria-labelledby"]} ${labelId}`;
  } else if (typeof inputAttrs["aria-label"] === "string") {
    inputAttrs["aria-label"] = `${inputAttrs["aria-label"]}, ${endpoint === 0 ? localeText('startLabel', props.startLabel, 'dateFrom') : localeText('endLabel', props.endLabel, 'dateTo')}`;
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
const weekdays = computed(() => Array.from({ length: 7 }, (_, index) =>
  locale.value.dayNamesMin[(index + locale.value.firstDayOfWeek) % 7] ?? ""));
function dateDisabled(iso: string): boolean {
  return (minimum.value !== undefined && iso < minimum.value) ||
    (maximum.value !== undefined && iso > maximum.value);
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
  return !range.value ? formatWlLocaleText(locale.value.chooseDateForLabel, { label: localeText('startLabel', props.startLabel, 'dateFrom') })
    : !range.value[1] ? formatWlLocaleText(locale.value.chooseDateForLabel, { label: localeText('endLabel', props.endLabel, 'dateTo') })
    : `${localeText('startLabel', props.startLabel, 'dateFrom')}: ${display(range.value[0])}; ${localeText('endLabel', props.endLabel, 'dateTo')}: ${display(range.value[1])}. ${locale.value.newDateRange}`;
}
// Raw prop presence can change while withDefaults resolves to the same value.
// Keep the transition slot in sync without remounting the open calendar.
const rangeHintText = ref(rangeHint());
onBeforeUpdate(() => { rangeHintText.value = rangeHint(); });
function pad2(value: number): string { return String(value).padStart(2, "0"); }
function toIso(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}
function parseIso(value: string | null | undefined): Date | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return toIso(date) === value ? date : null;
}
function display(value: string | null): string {
  const date = parseIso(value);
  if (date && props.displayFormat === "yyyy-mm-dd") return value!;
  return date ? `${pad2(date.getDate())}.${pad2(date.getMonth() + 1)}.${date.getFullYear()}` : "";
}
function syncText(): void {
  text.value = display(start.value);
  endText.value = display(end.value);
}
watch([model, () => props.displayFormat, isRange], syncText, { immediate: true, deep: true });
watch(() => props.disabled, (locked) => { if (locked) hide(); });
function update(value: string | WlDateRange | null): void {
  model.value = value as WlDatePickerModel<Mode>;
  // Formatting also updates when the parent accepts an unchanged value.
  syncText();
}
function sortedRange(first: string, second: string): WlDateRange {
  return first <= second ? [first, second] : [second, first];
}
function commit(endpoint: 0 | 1 = 0): void {
  if (props.disabled) { syncText(); return; }
  const draft = (endpoint === 0 ? text.value : endText.value).trim();
  if (!draft) {
    update(isRange.value && endpoint === 1 && start.value ? [start.value, null] : null);
    return;
  }
  const match = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(draft);
  const iso = props.displayFormat === "yyyy-mm-dd" ? draft
    : match ? `${match[3]}-${pad2(Number(match[2]))}-${pad2(Number(match[1]))}` : null;
  if (!iso || !parseIso(iso) || dateDisabled(iso)) { syncText(); return; }
  if (!isRange.value) update(iso);
  else if (endpoint === 0) update(end.value ? sortedRange(iso, end.value) : [iso, null]);
  else if (start.value) update(sortedRange(start.value, iso));
  else syncText();
}
function clampDate(iso: string): string {
  if (minimum.value && iso < minimum.value) return minimum.value;
  if (maximum.value && iso > maximum.value) return maximum.value;
  return iso;
}
function setCalendarDate(iso: string): void {
  const date = parseIso(iso);
  if (!date) return;
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
  if (props.disabled) return;
  const target = event.target;
  if (target === endControl.value) activeEndpoint.value = 1;
  else if (target === control.value) activeEndpoint.value = 0;
  const selected = activeEndpoint.value === 1 ? end.value ?? start.value : start.value;
  const iso = clampDate(parseIso(selected) ? selected! : toIso(new Date()));
  setCalendarDate(iso);
  viewMode.value = "days";
  show(event);
  if (focusCalendar) void focusDay(iso);
}
function stepMonth(amount: number): void {
  if (viewMode.value === "years") { viewYear.value += amount * 12; return; }
  if (viewMode.value === "months") { viewYear.value += amount; return; }
  const next = new Date(viewYear.value, viewMonth.value + amount, 1);
  viewYear.value = next.getFullYear();
  viewMonth.value = next.getMonth();
  const candidate = days.value.find((day) => !day.otherMonth && !day.disabled);
  if (candidate) focusedDate.value = candidate.iso;
}
function monthDisabled(month: number): boolean {
  const first = `${viewYear.value}-${pad2(month + 1)}-01`;
  const last = toIso(new Date(viewYear.value, month + 1, 0));
  return (minimum.value !== undefined && last < minimum.value) ||
    (maximum.value !== undefined && first > maximum.value);
}
function yearDisabled(year: number): boolean {
  return (minimum.value !== undefined && `${year}-12-31` < minimum.value) ||
    (maximum.value !== undefined && `${year}-01-01` > maximum.value);
}
function selectMonth(month: number): void {
  viewMonth.value = month;
  viewMode.value = "days";
  const candidate = days.value.find((day) => !day.otherMonth && !day.disabled);
  if (candidate) focusedDate.value = candidate.iso;
}
function selectYear(year: number): void { viewYear.value = year; viewMode.value = "months"; }
function choose(iso: string, disabled: boolean): void {
  if (disabled || props.disabled) return;
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
  if (event.key === "ArrowDown") { event.preventDefault(); open(event, true); }
  if (event.key === "Enter" && event.target instanceof HTMLInputElement) {
    if (visible.value) event.preventDefault();
    commit(endpoint); hide();
  }
  if (event.key === "Escape" && visible.value) hide(event);
}
function onDayKeydown(event: KeyboardEvent, iso: string): void {
  const date = parseIso(iso);
  if (!date) return;
  const weekday = (date.getDay() - locale.value.firstDayOfWeek + 7) % 7;
  const offsets: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7, Home: -weekday, End: 6 - weekday };
  if (event.key in offsets) date.setDate(date.getDate() + offsets[event.key]!);
  else if (event.key === "PageUp" || event.key === "PageDown") {
    const day = date.getDate();
    date.setDate(1);
    date.setMonth(date.getMonth() + (event.key === "PageUp" ? -1 : 1) * (event.shiftKey ? 12 : 1));
    date.setDate(Math.min(day, new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()));
  } else return;
  event.preventDefault();
  const next = clampDate(toIso(date));
  if (!dateDisabled(next)) void focusDay(next);
}
</script>

<template>
  <div v-bind="mergeWlAttrs(attrGroups.rootAttrs, section('root'))" class="wl-dp"
    :class="{ 'is-invalid': props.invalid, 'is-disabled': props.disabled, 'wl-dp--range': isRange }"
    :data-size="props.size" :data-selection-mode="props.selectionMode" data-wl="date-picker"
    :role="isRange ? 'group' : undefined" :aria-label="isRange ? attrGroups.inputAttrs['aria-label'] as string : undefined"
    @click="open" @keydown="onKeydown">
    <template v-if="isRange">
      <label class="wl-dp__endpoint" :for="startId">
        <span :id="`${startId}-label`" v-bind="section('startLabel')" class="wl-dp__endpoint-label">{{ localeText('startLabel', props.startLabel, 'dateFrom') }}</span>
        <input ref="control" v-bind="mergeWlAttrs(endpointAttrs(0), section('pcInputText.root'))"
          v-model="text" class="wl-input wl-dp__input" :class="[`wl-input--${props.size}`, { 'is-invalid': props.invalid }]"
          type="text" :placeholder="localeText('placeholder', props.placeholder, 'datePlaceholder')" :disabled="props.disabled" :aria-invalid="props.invalid || undefined"
          :aria-expanded="visible" :aria-controls="visible ? panelId : undefined" aria-haspopup="dialog"
          autocomplete="off" @blur="commit(0)" />
      </label>
      <label class="wl-dp__endpoint" :for="endId">
        <span :id="`${endId}-label`" v-bind="section('endLabel')" class="wl-dp__endpoint-label">{{ localeText('endLabel', props.endLabel, 'dateTo') }}</span>
        <input ref="endControl" v-bind="mergeWlAttrs(endpointAttrs(1), section('endInput'))"
          v-model="endText" class="wl-input wl-dp__input" :class="[`wl-input--${props.size}`, { 'is-invalid': props.invalid }]"
          type="text" :placeholder="localeText('placeholder', props.placeholder, 'datePlaceholder')" :disabled="props.disabled" :aria-invalid="props.invalid || undefined"
          :aria-expanded="visible" :aria-controls="visible ? panelId : undefined" aria-haspopup="dialog"
          autocomplete="off" @blur="commit(1)" />
      </label>
    </template>
    <input v-else ref="control" v-bind="mergeWlAttrs(attrGroups.inputAttrs, section('pcInputText.root'))"
      v-model="text" class="wl-input wl-dp__input" :class="[`wl-input--${props.size}`, { 'is-invalid': props.invalid, 'wl-dp__input--btn': props.showIcon }]"
      type="text" :placeholder="localeText('placeholder', props.placeholder, 'datePlaceholder')" :disabled="props.disabled" :aria-invalid="props.invalid || undefined"
      :aria-expanded="visible" :aria-controls="visible ? panelId : undefined" aria-haspopup="dialog"
      autocomplete="off" @blur="commit(0)" />
    <button v-if="props.showIcon" v-bind="section('dropdown')" type="button" class="wl-dp__trigger"
      :disabled="props.disabled" :aria-label="locale.chooseDate" :aria-expanded="visible"
      :aria-controls="visible ? panelId : undefined" aria-haspopup="dialog">
      <WlIcon name="calendar" :size="18" v-bind="section('dropdownIcon')" class="wl-dp__trigger-icon" />
    </button>
  </div>
  <Teleport to="body">
    <Transition name="wl-pop-motion" :css="motion"
      @before-leave="markOverlayLeaving" @before-enter="restoreOverlayEntering"
      @leave-cancelled="restoreOverlayEntering">
    <div v-if="visible" :id="panelId" ref="panel" v-bind="section('panel')" class="wl-overlay wl-dp__panel" :style="style"
      role="dialog" :aria-label="locale.chooseDate">
      <div v-bind="section('calendarContainer')" class="wl-dp__container">
        <div v-bind="section('calendar')" class="wl-dp__calendar">
        <div v-bind="section('header')" class="wl-dp__header">
          <button v-bind="section('pcPrevButton.root')" type="button" class="wl-dp__nav"
            :aria-label="locale.prevMonth" @click="stepMonth(-1)"><WlIcon name="chevron-left" :size="16" v-bind="section('pcPrevButton.icon')" /></button>
          <div v-bind="section('title')" class="wl-dp__title">
            <template v-if="viewMode === 'years'">{{ firstVisibleYear }}–{{ firstVisibleYear + 11 }}</template>
            <template v-else>
              <button v-if="viewMode === 'days'" v-bind="section('selectMonth')" type="button" class="wl-dp__view-btn"
                :aria-label="formatWlLocaleText(locale.chooseMonthCurrent, { month: locale.monthNames[viewMonth]! })" @click="viewMode = 'months'">{{ locale.monthNames[viewMonth] }}</button>
              <button v-bind="section('selectYear')" type="button" class="wl-dp__view-btn"
                :aria-label="formatWlLocaleText(locale.chooseYearCurrent, { year: viewYear })" @click="viewMode = 'years'">{{ viewYear }}</button>
            </template>
          </div>
          <button v-bind="section('pcNextButton.root')" type="button" class="wl-dp__nav"
            :aria-label="locale.nextMonth" @click="stepMonth(1)"><WlIcon name="chevron-right" :size="16" v-bind="section('pcNextButton.icon')" /></button>
        </div>
        <p v-if="isRange" v-bind="section('rangeHint')" class="wl-dp__range-hint" aria-live="polite">{{ rangeHintText }}</p>
        <table v-if="viewMode === 'days'" v-bind="section('dayView')" class="wl-dp__table" role="grid"
          :aria-multiselectable="isRange || undefined" :aria-label="`${locale.monthNames[viewMonth]} ${viewYear}`">
          <thead><tr><th v-for="(day, index) in weekdays" :key="index" v-bind="section('tableHeaderCell')" class="wl-dp__wd-cell" scope="col">
            <span v-bind="section('weekDay')" class="wl-dp__weekday">{{ day }}</span></th></tr></thead>
          <tbody><tr v-for="week in 6" :key="week">
            <td v-for="day in days.slice((week - 1) * 7, week * 7)" :key="day.iso" v-bind="section('dayCell')" class="wl-dp__day-cell"
              :aria-selected="day.selected || day.inRange">
              <button v-bind="section('day', { selected: day.selected, inRange: day.inRange, today: day.today, otherMonth: day.otherMonth, disabled: day.disabled })"
                type="button" class="wl-dp__day" :data-date="day.iso"
                :class="{ 'is-selected': day.selected, 'is-in-range': day.inRange, 'is-today': day.today, 'is-muted': day.otherMonth, 'is-disabled': day.disabled }"
                :disabled="day.disabled" :aria-label="day.iso" :aria-selected="day.selected || day.inRange"
                :tabindex="day.iso === focusedDate && !day.disabled ? 0 : -1"
                @focus="focusedDate = day.iso" @keydown="onDayKeydown($event, day.iso)"
                @click="choose(day.iso, day.disabled)">{{ day.label }}</button>
            </td>
          </tr></tbody>
        </table>
        <div v-else-if="viewMode === 'months'" v-bind="section('monthView')" class="wl-dp__choices" role="group" :aria-label="formatWlLocaleText(locale.monthsOfYear, { year: viewYear })">
          <button v-for="(month, index) in locale.monthNames" :key="index" v-bind="section('month', { selected: index === viewMonth, disabled: monthDisabled(index) })"
            type="button" class="wl-dp__choice" :class="{ 'is-selected': index === viewMonth }" :disabled="monthDisabled(index)"
            @click="selectMonth(index)">{{ month }}</button>
        </div>
        <div v-else v-bind="section('yearView')" class="wl-dp__choices" role="group" :aria-label="formatWlLocaleText(locale.yearsRange, { start: firstVisibleYear, end: firstVisibleYear + 11 })">
          <button v-for="year in 12" :key="firstVisibleYear + year - 1" v-bind="section('year', { selected: firstVisibleYear + year - 1 === viewYear, disabled: yearDisabled(firstVisibleYear + year - 1) })"
            type="button" class="wl-dp__choice" :class="{ 'is-selected': firstVisibleYear + year - 1 === viewYear }"
            :disabled="yearDisabled(firstVisibleYear + year - 1)" @click="selectYear(firstVisibleYear + year - 1)">{{ firstVisibleYear + year - 1 }}</button>
        </div>
        </div>
      </div>
    </div>
    </Transition>
  </Teleport>
</template>
