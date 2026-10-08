<script setup lang="ts">
import { WlIcon, WlStatCard } from "../../../../packages/ui-kit/src";
import QualityMeter from "./QualityMeter.vue";
import report from "./quality-report.generated.json";

defineProps<{ href: string }>();
const emit = defineEmits<{ navigate: [] }>();
const formatNumber = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 });
const testResult = `${formatNumber.format(report.tests.passed)} / ${formatNumber.format(report.tests.total)}`;
const unitPassRate = report.tests.passed / report.tests.total * 100;
const lineCoverage = `${formatNumber.format(report.coverage.lines)}%`;
const measuredDate = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric", month: "long", year: "numeric", timeZone: "UTC"
}).format(new Date(report.measuredAt));
const reportSource = report.source.environment === "ci" ? "Прогон CI" : "Локальный прогон";

function navigate(event: MouseEvent): void {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  emit("navigate");
}
</script>

<template>
  <section class="pg-quality-summary wl-stack" data-space="lg" aria-labelledby="home-quality-title" data-testid="home-quality">
    <div class="pg-quality-summary-heading">
      <div class="wl-stack" data-space="xs">
        <h2 id="home-quality-title" class="wl-text-title">Качество и совместимость</h2>
        <p class="wl-text-small wl-text-muted">Проверки компонентов, доступности, работы в браузерах и установки пакета.</p>
      </div>
      <a :href="href" class="wl-btn wl-btn--secondary wl-btn--md pg-quality-summary-link"
        data-wl="button" data-variant="secondary" data-size="md" data-density="default"
        @click="navigate">
        <span class="wl-btn__label">Результаты проверок</span><WlIcon name="arrow-right" :size="16" />
      </a>
    </div>
    <div class="pg-quality-summary-metrics">
      <WlStatCard icon="check" label="Unit-тесты" :value="testResult" description="Пройдено / всего в этом прогоне">
        <template #footer><QualityMeter :value="unitPassRate" label="Пройденные unit-тесты в этом прогоне" /></template>
      </WlStatCard>
      <WlStatCard icon="chart-bar" label="Покрытие строк" :value="lineCoverage" description="Vitest / V8 · код библиотеки">
        <template #footer><QualityMeter :value="report.coverage.lines" label="Покрытие строк unit-тестами" /></template>
      </WlStatCard>
    </div>
    <p class="wl-text-small wl-text-muted">
      Результаты unit-тестов: <time :datetime="report.measuredAt" :title="report.measuredAt">{{ measuredDate }} (UTC)</time>
      · v{{ report.version }} · {{ reportSource }}{{ report.source.dirty ? ' рабочей версии' : '' }}.
      Актуальные результаты CI — на странице качества.
    </p>
  </section>
</template>

<style>
.pg-quality-summary-heading { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--wl-space-lg); }
.pg-quality-summary-link { flex: none; max-width: 100%; text-decoration: none; }
.pg-quality-summary-metrics { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--wl-space-lg); }
@media (max-width: 560px) {
  .pg-quality-summary-metrics { grid-template-columns: minmax(0, 1fr); }
}
</style>
