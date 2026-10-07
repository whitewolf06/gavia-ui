<script setup lang="ts">
import { computed, ref } from "vue";
import { WlButton, WlCalendar, type WlCalendarEvent } from "../../../../../../packages/ui-kit/src";
const date = ref("2026-10-15");
const month = ref("2026-10");
const events: WlCalendarEvent[] = [
  { id: "planning", date: "2026-10-15", label: "Планирование", tone: "blue" },
  { id: "review", date: "2026-10-15", label: "Обзор материалов", tone: "gray" },
  { id: "release", date: "2026-10-22", label: "Подготовка релиза", tone: "blue" },
  { id: "next", date: "2026-11-03", label: "Следующий обзор", tone: "gray" }
];
const dayEvents = computed(() => events.filter((event) => event.date === date.value));
function selectRelease() { date.value = "2026-10-22"; month.value = "2026-10"; }
function selectNextMonth() { date.value = "2026-11-03"; month.value = "2026-11"; }
function selectToday() { const today = new Date(); const pad = (value: number) => String(value).padStart(2, "0"); date.value = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`; month.value = date.value.slice(0, 7); }
function reset() { date.value = "2026-10-15"; month.value = "2026-10"; }
</script>

<template>
  <div class="wl-stack" data-space="xl" data-input-example="WlCalendar">
    <section class="wl-stack" data-space="md" aria-label="Календарь команды">
      <h4 class="wl-text-title">Управляемая дата, месяц и события</h4>
      <WlCalendar v-model="date" v-model:month="month" :events="events" />
      <p class="wl-text-small wl-text-muted">Выбранная дата и отображаемый месяц — две отдельные модели. При программном переходе пример задаёт обе.</p>
      <div class="wl-inline" data-space="sm"><WlButton size="sm" @click="selectRelease">К подготовке релиза</WlButton><WlButton size="sm" @click="selectNextMonth">К обзору в ноябре</WlButton><WlButton size="sm" variant="soft" @click="selectToday">Сегодня</WlButton><WlButton size="sm" @click="reset">Вернуть октябрь</WlButton></div>
    </section>
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">События выбранного дня</h4>
      <ul v-if="dayEvents.length" class="wl-stack docs-calendar-events" data-space="sm"><li v-for="event in dayEvents" :key="event.id">{{ event.label }}</li></ul>
      <p v-else class="wl-text-small">На выбранный день событий нет.</p>
      <p class="wl-text-small wl-text-muted">Стрелки перемещают фокус по дням; Home/End — по неделе, PageUp/PageDown — по месяцам. Enter или Space выбирают день.</p>
      <p class="wl-text-small" role="status">Дата: {{ date }}. Месяц: {{ month }}. Событий: {{ dayEvents.length }}.</p>
    </section>
  </div>
</template>

<style scoped>
.docs-calendar-events { margin: 0; padding-inline-start: var(--wl-space-lg); overflow-wrap: anywhere; }
</style>