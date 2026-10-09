<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { computed, ref } from "vue";
import { WlButton, WlCalendar, type WlCalendarEvent } from "../../../../../../packages/ui-kit/src";
const date = ref("2026-10-15");
const month = ref("2026-10");
const events: WlCalendarEvent[] = [
  { id: "planning", date: "2026-10-15", label: t("examples.planning_0639"), tone: "blue" },
  { id: "review", date: "2026-10-15", label: t("examples.material_review_0640"), tone: "gray" },
  { id: "release", date: "2026-10-22", label: t("examples.release_preparation_0641"), tone: "blue" },
  { id: "next", date: "2026-11-03", label: t("examples.next_review_0642"), tone: "gray" }
];
const dayEvents = computed(() => events.filter((event) => event.date === date.value));
function selectRelease() { date.value = "2026-10-22"; month.value = "2026-10"; }
function selectNextMonth() { date.value = "2026-11-03"; month.value = "2026-11"; }
function selectToday() { const today = new Date(); const pad = (value: number) => String(value).padStart(2, "0"); date.value = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`; month.value = date.value.slice(0, 7); }
function reset() { date.value = "2026-10-15"; month.value = "2026-10"; }
</script>

<template>
  <div class="wl-stack" data-space="xl" data-input-example="WlCalendar">
    <section class="wl-stack" data-space="md" :aria-label="t('examples.team_calendar_0643')">
      <h4 class="wl-text-title">{{ t("examples.controlled_date_month_and_events_0644") }}</h4>
      <WlCalendar v-model="date" v-model:month="month" :events="events" />
      <p class="wl-text-small wl-text-muted">{{ t("examples.the_selected_date_and_displayed_month_are_separate_models_prog_0645") }}</p>
      <div class="wl-inline" data-space="sm"><WlButton size="sm" @click="selectRelease">{{ t("examples.go_to_release_preparation_0646") }}</WlButton><WlButton size="sm" @click="selectNextMonth">{{ t("examples.go_to_november_review_0647") }}</WlButton><WlButton size="sm" variant="soft" @click="selectToday">{{ t("examples.today_0648") }}</WlButton><WlButton size="sm" @click="reset">{{ t("examples.restore_october_0649") }}</WlButton></div>
    </section>
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">{{ t("examples.events_on_the_selected_day_0650") }}</h4>
      <ul v-if="dayEvents.length" class="wl-stack docs-calendar-events" data-space="sm"><li v-for="event in dayEvents" :key="event.id">{{ event.label }}</li></ul>
      <p v-else class="wl-text-small">{{ t("examples.no_events_on_the_selected_day_0651") }}</p>
      <p class="wl-text-small wl-text-muted">{{ t("examples.arrow_keys_move_focus_between_days_home_end_within_a_week_page_0652") }}</p>
      <p class="wl-text-small" role="status">{{ t("examples.date_0653") }} {{ date }}{{ t("examples.month_0654") }} {{ month }}{{ t("examples.events_0655") }} {{ dayEvents.length }}.</p>
    </section>
  </div>
</template>

<style scoped>
.docs-calendar-events { margin: 0; padding-inline-start: var(--wl-space-lg); overflow-wrap: anywhere; }
</style>