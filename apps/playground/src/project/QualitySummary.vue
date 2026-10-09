<script setup lang="ts">
import { usePlaygroundI18n } from "../i18n";
const { t, locale } = usePlaygroundI18n();
import { WlIcon, WlStatCard } from "../../../../packages/ui-kit/src";
import QualityMeter from "./QualityMeter.vue";
import report from "./quality-report.generated.json";

defineProps<{ href: string }>();
const emit = defineEmits<{ navigate: [] }>();
const formatNumber = new Intl.NumberFormat(locale.value === "ru" ? "ru-RU" : "en-US", { maximumFractionDigits: 2 });
const testResult = `${formatNumber.format(report.tests.passed)} / ${formatNumber.format(report.tests.total)}`;
const unitPassRate = report.tests.passed / report.tests.total * 100;
const lineCoverage = `${formatNumber.format(report.coverage.lines)}%`;
const measuredDate = new Intl.DateTimeFormat(locale.value === "ru" ? "ru-RU" : "en-US", {
  day: "numeric", month: "long", year: "numeric", timeZone: "UTC"
}).format(new Date(report.measuredAt));
const reportSource = report.source.environment === "ci" ? t('shell.project.QualitySummary.text481') : t('shell.project.QualitySummary.text482');

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
        <h2 id="home-quality-title" class="wl-text-title">{{ t('shell.project.QualitySummary.text483') }}</h2>
        <p class="wl-text-small wl-text-muted">{{ t('shell.project.QualitySummary.text484') }}</p>
      </div>
      <a :href="href" class="wl-btn wl-btn--secondary wl-btn--md pg-quality-summary-link"
        data-wl="button" data-variant="secondary" data-size="md" data-density="default"
        @click="navigate">
        <span class="wl-btn__label">{{ t('shell.project.QualitySummary.text485') }}</span><WlIcon name="arrow-right" :size="16" />
      </a>
    </div>
    <div class="pg-quality-summary-metrics">
      <WlStatCard icon="check" :label="t('shell.project.QualitySummary.text486')" :value="testResult" :description="t('shell.project.QualitySummary.text487')">
        <template #footer><QualityMeter :value="unitPassRate" :label="t('shell.project.QualitySummary.text488')" /></template>
      </WlStatCard>
      <WlStatCard icon="chart-bar" :label="t('shell.project.QualitySummary.text489')" :value="lineCoverage" :description="t('shell.project.QualitySummary.text490')">
        <template #footer><QualityMeter :value="report.coverage.lines" :label="t('shell.project.QualitySummary.text491')" /></template>
      </WlStatCard>
    </div>
    <p class="wl-text-small wl-text-muted">
{{ t('shell.project.QualitySummary.text492') }} <time :datetime="report.measuredAt" :title="report.measuredAt">{{ measuredDate }} (UTC)</time>
      · v{{ report.version }} · {{ reportSource }}{{ report.source.dirty ? t('shell.project.QualitySummary.text493') : '' }}{{ t('shell.project.QualitySummary.text494') }} </p>
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
