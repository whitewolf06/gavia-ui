<script setup lang="ts" generic="Multiple extends boolean = false">
/** WlCalendar public component contract.
 * @since 0.1.0
 * @slot day - Custom day content.
 */
import { computed, nextTick, ref, useAttrs, watch } from "vue";
import type { WlNoModelModifiers } from "../model-types";
import type { WlCalendarDaySlotProps, WlCalendarModel } from "../picker-types";
import type { WlPt } from "../pt-types";
import type { WlCalendarEvent } from "../types";
import { mergeWlAttrs, useWlLocale, useWlPt } from "../config";
import { wlPlural } from "../utils/format";
import WlIcon from "./WlIcon.vue";
defineOptions({ inheritAttrs: false });
const props = withDefaults(
  defineProps<{
    /**
     * WlCalendarEvent[]: { date (ISO), label, tone?: "blue" | "gray" }.
     * @default []
     */
    events?: readonly WlCalendarEvent[];
    /** Modifier flags accepted by the component's typed model contract. */
    modelModifiers?: WlNoModelModifiers;
    /** Modifier contract for the displayed-month model; built-in modifiers are unsupported. */
    monthModifiers?: WlNoModelModifiers;
    /** Enable selection of more than one value. */
    multiple?: Multiple & boolean;
    /**
     * Disable user interaction with this component.
     * @default false
     */
    disabled?: boolean;
    /** Attributes and callbacks for the component's documented pass-through sections. */
    pt?: WlPt<"calendar">;
  }>(),
  {
    events: () => [], multiple: () => false as Multiple, disabled: false
  }
);

/**
 * v-model — selected ISO "YYYY-MM-DD" date, or ISO date array in multiple mode.
 * v-model:month — displayed month as "YYYY-MM"; uncontrolled default = current month.
 */
const selected = defineModel<WlCalendarModel<NoInfer<Multiple>>, never>({ default: "" as never });
/** Displayed month in YYYY-MM format.
 * Paired with update:month.
 * @default ""
 */
const viewMonth = defineModel<string, never>("month", { default: "" });

defineSlots<{
  /** Custom calendar day content with its date and selection state. */
  day?(props: WlCalendarDaySlotProps): unknown; }>();

const locale = useWlLocale();
const attrs = useAttrs();
const section = useWlPt("calendar", computed(() => props.pt));
const selection = computed<string[]>(() => props.multiple ? Array.isArray(selected.value) ? selected.value : [] : typeof selected.value === "string" && selected.value ? [selected.value] : []);
const dateLabel = computed(() => new Intl.DateTimeFormat(locale.value.localeCode, { dateStyle: "long" }));

const weekdays = computed(() => Array.from(
  { length: 7 },
  (_, index) => locale.value.dayNamesMin[(index + locale.value.firstDayOfWeek) % 7]
));

const pad2 = (n: number): string => String(n).padStart(2, "0");
const toIso = (y: number, mo: number, d: number): string => `${y}-${pad2(mo + 1)}-${pad2(d)}`;

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`;
}

/** Effective "YYYY-MM" (falls back to the current month on missing/invalid input). */
const monthIso = computed(() =>
  /^\d{4}-(?:0[1-9]|1[0-2])$/.test(viewMonth.value) ? viewMonth.value : currentMonth()
);

const monthParts = computed(() => {
  const [y, m] = monthIso.value.split("-").map(Number);
  return { y: y!, mo: m! - 1 };
});

const title = computed(() => `${locale.value.monthNames[monthParts.value.mo]} ${monthParts.value.y}`);

const now = new Date();
const todayIso = toIso(now.getFullYear(), now.getMonth(), now.getDate());

const eventsByDate = computed(() => {
  const map = new Map<string, WlCalendarEvent[]>();
  for (const ev of props.events) {
    const list = map.get(ev.date);
    if (list) list.push(ev);
    else map.set(ev.date, [ev]);
  }
  return map;
});

interface CalCell {
  iso: string;
  day: number;
  inMonth: boolean;
  today: boolean;
  selected: boolean;
  events: WlCalendarEvent[];
}

/** Mon-first grid; adjacent-month days included to complete the weeks. */
const cells = computed<CalCell[]>(() => {
  const { y, mo } = monthParts.value;
  const lead = (new Date(y, mo, 1).getDay() - locale.value.firstDayOfWeek + 7) % 7;
  const daysIn = new Date(y, mo + 1, 0).getDate();
  const daysInPrev = new Date(y, mo, 0).getDate();
  const total = Math.ceil((lead + daysIn) / 7) * 7;

  const out: CalCell[] = [];
  for (let i = 0; i < total; i++) {
    let cy = y;
    let cm = mo;
    let cd: number;
    let inMonth = true;
    if (i < lead) {
      cd = daysInPrev - lead + 1 + i;
      cm = mo - 1;
      inMonth = false;
    } else if (i < lead + daysIn) {
      cd = i - lead + 1;
    } else {
      cd = i - lead - daysIn + 1;
      cm = mo + 1;
      inMonth = false;
    }
    if (cm < 0) {
      cm = 11;
      cy = y - 1;
    } else if (cm > 11) {
      cm = 0;
      cy = y + 1;
    }
    const iso = toIso(cy, cm, cd);
    out.push({
      iso,
      day: cd,
      inMonth,
      today: iso === todayIso,
      selected: selection.value.includes(iso),
      events: eventsByDate.value.get(iso) ?? []
    });
  }
  return out;
});

const weeks = computed(() => {
  const out: CalCell[][] = [];
  for (let index = 0; index < cells.value.length; index += 7) {
    out.push(cells.value.slice(index, index + 7));
  }
  return out;
});

const gridRef = ref<HTMLElement | null>(null);
const focusedIso = ref("");

watch(
  [cells, selected],
  ([nextCells]) => {
    if (!props.multiple && selection.value[0] && nextCells.some((cell) => cell.iso === selection.value[0])) {
      focusedIso.value = selection.value[0];
    } else if (!nextCells.some((cell) => cell.iso === focusedIso.value)) {
      focusedIso.value
        = selection.value.find((iso) => nextCells.some((cell) => cell.iso === iso))
          ?? nextCells.find((cell) => cell.today)?.iso
          ?? nextCells.find((cell) => cell.inMonth)?.iso
          ?? nextCells[0]?.iso
          ?? "";
    }
  },
  { immediate: true }
);

function shift(delta: number): void {
  if (props.disabled) return;
  const { y, mo } = monthParts.value;
  const d = new Date(y, mo + delta, 1);
  viewMonth.value = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

function pick(cell: CalCell): void {
  if (props.disabled) return;
  focusedIso.value = cell.iso;
  selected.value = (props.multiple
    ? selection.value.includes(cell.iso) ? selection.value.filter((iso) => iso !== cell.iso) : [...selection.value, cell.iso]
    : cell.iso) as WlCalendarModel<Multiple>;
  if (!cell.inMonth) {
    viewMonth.value = cell.iso.slice(0, 7);
  }
}

function dateFromIso(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year!, month! - 1, day!);
}

function cellLabel(cell: CalCell): string {
  const date = dateLabel.value.format(dateFromIso(cell.iso));
  const events = cell.events.length;
  if (!events) return date;
  const suffix = wlPlural(locale.value.localeCode, events, {
    one: locale.value.eventOne, few: locale.value.eventFew, other: locale.value.eventMany
  });
  return `${date}, ${events} ${suffix}`;
}

async function focusDate(iso: string, revealMonth = false): Promise<void> {
  focusedIso.value = iso;
  if (revealMonth) viewMonth.value = iso.slice(0, 7);
  await nextTick();
  gridRef.value?.querySelector<HTMLElement>(`[data-date="${iso}"]`)?.focus();
}

function shiftedIso(iso: string, months: number): string {
  const source = dateFromIso(iso);
  const year = source.getFullYear();
  const month = source.getMonth() + months;
  const day = source.getDate();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const target = new Date(year, month, Math.min(day, lastDay));
  return toIso(target.getFullYear(), target.getMonth(), target.getDate());
}

function onDayKeydown(event: KeyboardEvent, cell: CalCell): void {
  if (props.disabled) return;
  const index = cells.value.findIndex((entry) => entry.iso === cell.iso);
  let targetIndex = index;

  if (event.key === "ArrowLeft") targetIndex -= 1;
  else if (event.key === "ArrowRight") targetIndex += 1;
  else if (event.key === "ArrowUp") targetIndex -= 7;
  else if (event.key === "ArrowDown") targetIndex += 7;
  else if (event.key === "Home") targetIndex -= index % 7;
  else if (event.key === "End") targetIndex += 6 - (index % 7);
  else if (event.key === "PageUp" || event.key === "PageDown") {
    event.preventDefault();
    void focusDate(shiftedIso(cell.iso, event.key === "PageUp" ? -1 : 1), true);
    return;
  } else if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    pick(cell);
    return;
  } else {
    return;
  }

  event.preventDefault();
  const target = cells.value[targetIndex];
  if (target) {
    void focusDate(target.iso);
    return;
  }

  const date = dateFromIso(cell.iso);
  date.setDate(date.getDate() + (targetIndex - index));
  void focusDate(toIso(date.getFullYear(), date.getMonth(), date.getDate()), true);
}
</script>

<template>
  <div
    v-bind="mergeWlAttrs(section('root'), attrs)"
    class="wl-cal"
    data-wl="calendar"
    :aria-disabled="props.disabled || undefined"
  >
    <div v-bind="section('header')" class="wl-cal__head">
      <button
        type="button"
        v-bind="section('prevButton')"
        class="wl-cal__nav"
        :aria-label="locale.prevMonth"
        :disabled="props.disabled"
        @click="shift(-1)"
      >
        <WlIcon name="chevron-left" :size="15" />
      </button>
      <span v-bind="section('title')" class="wl-cal__title" aria-live="polite">{{ title }}</span>
      <button
        type="button"
        v-bind="section('nextButton')"
        class="wl-cal__nav"
        :aria-label="locale.nextMonth"
        :disabled="props.disabled"
        @click="shift(1)"
      >
        <WlIcon name="chevron-right" :size="15" />
      </button>
    </div>
    <div
      v-bind="section('body')"
      class="wl-cal__body"
      role="grid"
      :aria-label="title"
      :aria-multiselectable="props.multiple || undefined"
    >
      <div v-bind="section('week')" class="wl-cal__week" role="row">
        <span
          v-for="wd in weekdays"
          :key="wd"
          v-bind="section('weekday')"
          class="wl-cal__wd"
          role="columnheader"
        >
          {{ wd }}
        </span>
      </div>
      <div
        ref="gridRef"
        v-bind="section('grid')"
        class="wl-cal__grid"
        role="rowgroup"
      >
        <div
          v-for="(week, weekIndex) in weeks"
          :key="weekIndex"
          v-bind="section('row')"
          class="wl-cal__row"
          role="row"
        >
          <button
            v-for="cell in week"
            :key="cell.iso"
            v-bind="section('day', { selected: cell.selected, today: cell.today, otherMonth: !cell.inMonth, disabled: props.disabled })"
            type="button"
            class="wl-cal__day"
            :class="{
              'is-muted': !cell.inMonth,
              'is-today': cell.today,
              'is-selected': cell.selected
            }"
            role="gridcell"
            :data-date="cell.iso"
            :tabindex="cell.iso === focusedIso ? 0 : -1"
            :aria-label="cellLabel(cell)"
            :aria-selected="cell.selected"
            :aria-current="cell.today ? 'date' : undefined"
            :disabled="props.disabled"
            @focus="focusedIso = cell.iso"
            @click="pick(cell)"
            @keydown="onDayKeydown($event, cell)"
          >
            <slot name="day" v-bind="cell">
              <span v-bind="section('dayNumber')" class="wl-cal__dnum">{{ cell.day }}</span>
              <span
                v-for="(ev, eventIndex) in cell.events"
                :key="ev.id ?? `${ev.label}:${eventIndex}`"
                v-bind="section('event')"
                class="wl-cal__ev"
                :class="{ 'wl-cal__ev--blue': ev.tone === 'blue' }"
              >{{ ev.label }}</span>
            </slot>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
