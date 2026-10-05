<script setup lang="ts">
import { computed, nextTick, ref, useAttrs, watch } from "vue";
import { mergeWlAttrs, useWlLocale, useWlMotion, useWlPt } from "../config";
import type { WlSizeSm } from "../types";
import { splitInputAttrs } from "../utils/inputAttrs";
import { useAnchoredOverlay } from "../utils/anchoredOverlay";
import { markOverlayLeaving, restoreOverlayEntering } from "../utils/overlayTransition";
import WlIcon from "./WlIcon.vue";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<{
  placeholder?: string;
  size?: WlSizeSm;
  disabled?: boolean;
  invalid?: boolean;
  showIcon?: boolean;
  minDate?: string;
  maxDate?: string;
  displayFormat?: "dd.mm.yyyy" | "yyyy-mm-dd";
  motion?: boolean;
  pt?: Record<string, unknown>;
}>(), {
  placeholder: "дд.мм.гггг", size: "md", disabled: false, invalid: false, showIcon: false,
  motion: undefined, displayFormat: "dd.mm.yyyy"
});
const model = defineModel<string | null>({ default: null });
const attrs = useAttrs();
const attrGroups = computed(() => splitInputAttrs(attrs));
const locale = useWlLocale();
const section = useWlPt("datepicker", computed(() => props.pt));
const motion = useWlMotion(computed(() => props.motion));
const control = ref<HTMLInputElement | null>(null);
const text = ref("");
const initial = parseIso(model.value) ?? new Date();
const viewYear = ref(initial.getFullYear());
const viewMonth = ref(initial.getMonth());
const viewMode = ref<"days" | "months" | "years">("days");
const firstVisibleYear = computed(() => Math.floor(viewYear.value / 12) * 12);
const { visible, panel, style, show, hide } = useAnchoredOverlay();
const weekdays = computed(() => Array.from({ length: 7 }, (_, index) =>
  locale.value.dayNamesMin[(index + locale.value.firstDayOfWeek) % 7] ?? ""));
const days = computed(() => {
  const first = new Date(viewYear.value, viewMonth.value, 1);
  const offset = (first.getDay() - locale.value.firstDayOfWeek + 7) % 7;
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(viewYear.value, viewMonth.value, index + 1 - offset);
    const iso = toIso(date);
    return {
      date, iso, label: date.getDate(), otherMonth: date.getMonth() !== viewMonth.value,
      selected: iso === model.value, today: iso === toIso(new Date()),
      disabled: (props.minDate !== undefined && iso < props.minDate) ||
        (props.maxDate !== undefined && iso > props.maxDate)
    };
  });
});
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
watch([model, () => props.displayFormat], ([value]) => { text.value = display(value); }, { immediate: true });
function commit(): void {
  if (!text.value.trim()) { model.value = null; return; }
  const match = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(text.value.trim());
  const iso = props.displayFormat === "yyyy-mm-dd" ? text.value.trim()
    : match ? `${match[3]}-${pad2(Number(match[2]))}-${pad2(Number(match[1]))}` : null;
  if (iso && parseIso(iso) && (!props.minDate || iso >= props.minDate) && (!props.maxDate || iso <= props.maxDate)) {
    model.value = iso;
  } else {
    text.value = display(model.value);
  }
}
function open(event: Event): void {
  if (props.disabled) return;
  const selected = parseIso(model.value);
  if (selected) { viewYear.value = selected.getFullYear(); viewMonth.value = selected.getMonth(); }
  viewMode.value = "days";
  show(event);
}
function stepMonth(amount: number): void {
  if (viewMode.value === "years") { viewYear.value += amount * 12; return; }
  if (viewMode.value === "months") { viewYear.value += amount; return; }
  const next = new Date(viewYear.value, viewMonth.value + amount, 1);
  viewYear.value = next.getFullYear();
  viewMonth.value = next.getMonth();
}
function monthDisabled(month: number): boolean {
  const first = `${viewYear.value}-${pad2(month + 1)}-01`;
  const last = toIso(new Date(viewYear.value, month + 1, 0));
  return (props.minDate !== undefined && last < props.minDate) ||
    (props.maxDate !== undefined && first > props.maxDate);
}
function yearDisabled(year: number): boolean {
  return (props.minDate !== undefined && `${year}-12-31` < props.minDate) ||
    (props.maxDate !== undefined && `${year}-01-01` > props.maxDate);
}
function selectMonth(month: number): void {
  viewMonth.value = month;
  viewMode.value = "days";
}
function selectYear(year: number): void {
  viewYear.value = year;
  viewMode.value = "months";
}
function choose(iso: string, disabled: boolean): void {
  if (disabled) return;
  model.value = iso;
  hide();
  nextTick(() => control.value?.focus());
}
function onKeydown(event: KeyboardEvent): void {
  if (event.key === "ArrowDown") { event.preventDefault(); open(event); }
  if (event.key === "Enter") { commit(); hide(); }
  if (event.key === "Escape") hide(event);
}
</script>

<template>
  <div v-bind="mergeWlAttrs(attrGroups.rootAttrs, section('root'))" class="wl-dp" :data-size="size" data-wl="date-picker">
    <input ref="control" v-bind="mergeWlAttrs(attrGroups.inputAttrs, section('pcInputText.root'))"
      v-model="text" class="wl-input" :class="[`wl-input--${size}`, { 'is-invalid': invalid, 'wl-dp__input--btn': showIcon }]"
      type="text" :placeholder="placeholder" :disabled="disabled" :aria-invalid="invalid || undefined"
      autocomplete="off" @blur="commit" @keydown="onKeydown" @click="open" />
    <button v-if="showIcon" v-bind="section('dropdown')" type="button" class="wl-dp__trigger"
      :disabled="disabled" :aria-label="locale.chooseDate" @click="open">
      <WlIcon name="calendar" :size="18" v-bind="section('dropdownIcon')" class="wl-dp__trigger-icon" />
    </button>
  </div>
  <Teleport to="body">
    <Transition name="wl-pop-motion" :css="motion"
      @before-leave="markOverlayLeaving" @before-enter="restoreOverlayEntering"
      @leave-cancelled="restoreOverlayEntering">
    <div v-if="visible" ref="panel" v-bind="section('panel')" class="wl-overlay wl-dp__panel" :style="style">
      <div v-bind="section('calendarContainer')" class="wl-dp__container">
        <div v-bind="section('calendar')" class="wl-dp__calendar">
        <div v-bind="section('header')" class="wl-dp__header">
          <button v-bind="section('pcPrevButton.root')" type="button" class="wl-dp__nav"
            :aria-label="locale.prevMonth" @click="stepMonth(-1)"><WlIcon name="chevron-left" :size="16" v-bind="section('pcPrevButton.icon')" /></button>
          <div v-bind="section('title')" class="wl-dp__title">
            <template v-if="viewMode === 'years'">{{ firstVisibleYear }}–{{ firstVisibleYear + 11 }}</template>
            <template v-else>
              <button v-if="viewMode === 'days'" v-bind="section('selectMonth')" type="button" class="wl-dp__view-btn"
                :aria-label="`Выбрать месяц, сейчас ${locale.monthNames[viewMonth]}`" @click="viewMode = 'months'">{{ locale.monthNames[viewMonth] }}</button>
              <button v-bind="section('selectYear')" type="button" class="wl-dp__view-btn"
                :aria-label="`Выбрать год, сейчас ${viewYear}`" @click="viewMode = 'years'">{{ viewYear }}</button>
            </template>
          </div>
          <button v-bind="section('pcNextButton.root')" type="button" class="wl-dp__nav"
            :aria-label="locale.nextMonth" @click="stepMonth(1)"><WlIcon name="chevron-right" :size="16" v-bind="section('pcNextButton.icon')" /></button>
        </div>
        <table v-if="viewMode === 'days'" v-bind="section('dayView')" class="wl-dp__table" role="grid">
          <thead><tr><th v-for="(day, index) in weekdays" :key="index" v-bind="section('tableHeaderCell')" class="wl-dp__wd-cell" scope="col">
            <span v-bind="section('weekDay')" class="wl-dp__weekday">{{ day }}</span></th></tr></thead>
          <tbody><tr v-for="week in 6" :key="week">
            <td v-for="day in days.slice((week - 1) * 7, week * 7)" :key="day.iso" v-bind="section('dayCell')" class="wl-dp__day-cell">
              <button v-bind="section('day', { selected: day.selected, today: day.today, otherMonth: day.otherMonth, disabled: day.disabled })"
                type="button" class="wl-dp__day"
                :class="{ 'is-selected': day.selected, 'is-today': day.today, 'is-muted': day.otherMonth, 'is-disabled': day.disabled }"
                :disabled="day.disabled" :aria-label="day.iso" :aria-selected="day.selected"
                @click="choose(day.iso, day.disabled)">{{ day.label }}</button>
            </td>
          </tr></tbody>
        </table>
        <div v-else-if="viewMode === 'months'" v-bind="section('monthView')" class="wl-dp__choices" role="group" :aria-label="`Месяцы ${viewYear}`">
          <button v-for="(month, index) in locale.monthNames" :key="index" v-bind="section('month', { selected: index === viewMonth, disabled: monthDisabled(index) })"
            type="button" class="wl-dp__choice" :class="{ 'is-selected': index === viewMonth }" :disabled="monthDisabled(index)"
            @click="selectMonth(index)">{{ month }}</button>
        </div>
        <div v-else v-bind="section('yearView')" class="wl-dp__choices" role="group" :aria-label="`Годы ${firstVisibleYear}–${firstVisibleYear + 11}`">
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
