<script setup lang="ts">
import { useWlLocale } from "../config";
import { computed, nextTick, ref, watch } from "vue";
import WlIcon from "./WlIcon.vue";
import type { WlCalendarEvent } from "../types";
import type { WlNoModelModifiers } from "../model-types";
const locale = useWlLocale();

const props = withDefaults(
  defineProps<{
    events?: readonly WlCalendarEvent[];
    modelModifiers?: WlNoModelModifiers;
    monthModifiers?: WlNoModelModifiers;
  }>(),
  {
    events: () => []
  }
);

/**
 * v-model — selected date as ISO "YYYY-MM-DD" string (serializable).
 * v-model:month — displayed month as "YYYY-MM"; uncontrolled default = current month.
 */
const selected = defineModel<string, never>({ default: "" });
const viewMonth = defineModel<string, never>("month", { default: "" });

const weekdays = computed(() => Array.from({ length: 7 }, (_, index) => locale.value.dayNamesMin[(index + 1) % 7]));

const pad2 = (n: number): string => String(n).padStart(2, "0");
const toIso = (y: number, mo: number, d: number): string => `${y}-${pad2(mo + 1)}-${pad2(d)}`;

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`;
}

/** Effective "YYYY-MM" (falls back to the current month on missing/invalid input). */
const monthIso = computed(() =>
  /^\d{4}-(0[1-9]|1[0-2])$/.test(viewMonth.value) ? viewMonth.value : currentMonth()
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
  const lead = (new Date(y, mo, 1).getDay() + 6) % 7; // days borrowed from previous month
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
      selected: iso === selected.value,
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
    if (selected.value && nextCells.some((cell) => cell.iso === selected.value)) {
      focusedIso.value = selected.value;
    } else if (!nextCells.some((cell) => cell.iso === focusedIso.value)) {
      focusedIso.value =
        nextCells.find((cell) => cell.today)?.iso ??
        nextCells.find((cell) => cell.inMonth)?.iso ??
        nextCells[0]?.iso ??
        "";
    }
  },
  { immediate: true }
);

function shift(delta: number): void {
  const { y, mo } = monthParts.value;
  const d = new Date(y, mo + delta, 1);
  viewMonth.value = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

function pick(cell: CalCell): void {
  focusedIso.value = cell.iso;
  selected.value = cell.iso;
  if (!cell.inMonth) {
    viewMonth.value = cell.iso.slice(0, 7);
  }
}

function dateFromIso(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year!, month! - 1, day!);
}

function cellLabel(cell: CalCell): string {
  const date = new Intl.DateTimeFormat(locale.value.localeCode, { dateStyle: "long" }).format(
    dateFromIso(cell.iso)
  );
  const events = cell.events.length;
  if (!events) return date;
  const suffix = events === 1 ? locale.value.eventOne : events < 5 ? locale.value.eventFew : locale.value.eventMany;
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
  <div class="wl-cal" data-wl="calendar">
    <div class="wl-cal__head">
      <button type="button" class="wl-cal__nav" :aria-label="locale.prevMonth" @click="shift(-1)">
        <WlIcon name="chevron-left" :size="15" />
      </button>
      <span class="wl-cal__title" aria-live="polite">{{ title }}</span>
      <button type="button" class="wl-cal__nav" :aria-label="locale.nextMonth" @click="shift(1)">
        <WlIcon name="chevron-right" :size="15" />
      </button>
    </div>
    <div class="wl-cal__body" role="grid" :aria-label="title">
      <div class="wl-cal__week" role="row">
        <span v-for="wd in weekdays" :key="wd" class="wl-cal__wd" role="columnheader">
          {{ wd }}
        </span>
      </div>
      <div ref="gridRef" class="wl-cal__grid" role="rowgroup">
        <div v-for="(week, weekIndex) in weeks" :key="weekIndex" class="wl-cal__row" role="row">
          <button
            v-for="cell in week"
            :key="cell.iso"
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
            @focus="focusedIso = cell.iso"
            @click="pick(cell)"
            @keydown="onDayKeydown($event, cell)"
          >
            <span class="wl-cal__dnum">{{ cell.day }}</span>
            <span
              v-for="(ev, eventIndex) in cell.events"
              :key="ev.id ?? `${ev.label}:${eventIndex}`"
              class="wl-cal__ev"
              :class="{ 'wl-cal__ev--blue': ev.tone === 'blue' }"
              >{{ ev.label }}</span
            >
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
