<script setup lang="ts">
import { computed } from "vue";
import WlIcon from "./WlIcon.vue";
import type { WlCalendarEvent } from "../types";

const props = withDefaults(
  defineProps<{
    events?: WlCalendarEvent[];
  }>(),
  {
    events: () => []
  }
);

/**
 * v-model — selected date as ISO "YYYY-MM-DD" string (serializable).
 * v-model:month — displayed month as "YYYY-MM"; uncontrolled default = current month.
 */
const selected = defineModel<string>({ default: "" });
const viewMonth = defineModel<string>("month", { default: "" });

const MONTHS_RU = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь"
];
const WEEKDAYS_RU = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const pad2 = (n: number): string => String(n).padStart(2, "0");
const toIso = (y: number, mo: number, d: number): string => `${y}-${pad2(mo + 1)}-${pad2(d)}`;

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`;
}

/** Effective "YYYY-MM" (falls back to the current month on missing/invalid input). */
const monthIso = computed(() => (/^\d{4}-\d{2}$/.test(viewMonth.value) ? viewMonth.value : currentMonth()));

const monthParts = computed(() => {
  const [y, m] = monthIso.value.split("-").map(Number);
  return { y: y!, mo: m! - 1 };
});

const title = computed(() => `${MONTHS_RU[monthParts.value.mo]} ${monthParts.value.y}`);

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

function shift(delta: number): void {
  const { y, mo } = monthParts.value;
  const d = new Date(y, mo + delta, 1);
  viewMonth.value = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

function pick(cell: CalCell): void {
  selected.value = cell.iso;
  if (!cell.inMonth) {
    viewMonth.value = cell.iso.slice(0, 7);
  }
}
</script>

<template>
  <div class="wl-cal" data-wl="calendar">
    <div class="wl-cal__head">
      <button type="button" class="wl-cal__nav" aria-label="Предыдущий месяц" @click="shift(-1)">
        <WlIcon name="chevron-left" :size="15" />
      </button>
      <span class="wl-cal__title" aria-live="polite">{{ title }}</span>
      <button type="button" class="wl-cal__nav" aria-label="Следующий месяц" @click="shift(1)">
        <WlIcon name="chevron-right" :size="15" />
      </button>
    </div>
    <div class="wl-cal__week">
      <span v-for="wd in WEEKDAYS_RU" :key="wd" class="wl-cal__wd">{{ wd }}</span>
    </div>
    <div class="wl-cal__grid">
      <button
        v-for="cell in cells"
        :key="cell.iso"
        type="button"
        class="wl-cal__day"
        :class="{
          'is-muted': !cell.inMonth,
          'is-today': cell.today,
          'is-selected': cell.selected
        }"
        :data-date="cell.iso"
        :aria-pressed="cell.selected"
        @click="pick(cell)"
      >
        <span class="wl-cal__dnum">{{ cell.day }}</span>
        <span
          v-for="ev in cell.events"
          :key="ev.label"
          class="wl-cal__ev"
          :class="{ 'wl-cal__ev--blue': ev.tone === 'blue' }"
          >{{ ev.label }}</span
        >
      </button>
    </div>
  </div>
</template>
