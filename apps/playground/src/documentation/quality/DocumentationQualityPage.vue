<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t, locale } = usePlaygroundI18n();
import { WlCard, WlStatCard, WlTable } from "../../../../../packages/ui-kit/src";
import QualityMeter from "../../project/QualityMeter.vue";
import qualityReport from "../../project/quality-report.generated.json";
import { gaviaProjectInfo } from "../../project/project-info";
import {
  qualityDocumentationHeadings as headings, qualityCheckColumns, qualityCheckRows,
  qualityEnvironmentColumns, qualityEnvironmentRows
} from "./quality";

const report = qualityReport;
function formatRevision(revision: string | null): string {
  return revision?.slice(0, 8) ?? t('documentation.strings.s0768');
}
const percentages = new Intl.NumberFormat(locale.value === "ru" ? "ru-RU" : "en-US", { maximumFractionDigits: 2 });
const metrics = [
  { key: "lines", icon: "file", label: t('documentation.strings.s0769'), description: t('documentation.strings.s0770') },
  { key: "statements", icon: "code", label: t('documentation.strings.s0771'), description: t('documentation.strings.s0772') },
  { key: "branches", icon: "sliders-h", label: t('documentation.strings.s0773'), description: t('documentation.strings.s0774') },
  { key: "functions", icon: "task", label: t('documentation.strings.s0775'), description: t('documentation.strings.s0776') }
] as const;
const measuredAt = new Date(report.measuredAt);
const measuredLabel = new Intl.DateTimeFormat(locale.value === "ru" ? "ru-RU" : "en-US", {
  dateStyle: "long", timeStyle: "short", timeZone: "UTC"
}).format(measuredAt) + " (UTC)";
const reportSource = report.source.environment === "ci" ? t('documentation.strings.s0777') : t('documentation.strings.s0778');
const qualitySourceUrl = gaviaProjectInfo.documentationBaseUrl + "docs/quality.md";
const workflowUrl = gaviaProjectInfo.repositoryUrl + "/actions/workflows/publish.yml";
</script>

<template>
  <article class="docs-quality-page wl-stack" data-space="2xl" data-testid="docs-quality-page" data-docs-section="quality">
    <section class="wl-stack" data-space="lg" :aria-labelledby="headings.measurement.id">
      <div class="wl-stack" data-space="sm">
        <h2 :id="headings.measurement.id" class="quality-anchor wl-text-heading">{{ headings.measurement.title }}</h2>
        <p class="wl-text-body wl-text-muted">{{ t('documentation.strings.s0779') }}</p>
      </div>
      <div class="quality-metrics" role="group" :aria-label="t('documentation.strings.s0780')" data-testid="quality-coverage">
        <WlStatCard v-for="metric in metrics" :key="metric.key" :icon="metric.icon" :label="metric.label" :value="percentages.format(report.coverage[metric.key]) + '%'" :description="metric.description" :data-coverage-metric="metric.key">
          <template #footer><QualityMeter :value="report.coverage[metric.key]" :label="t('documentation.strings.s0781') + metric.label" /></template>
        </WlStatCard>
      </div>
      <WlCard>
        <div class="wl-stack" data-space="sm">
          <p class="wl-text-body"><strong data-testid="quality-unit-count">{{ report.tests.passed }} / {{ report.tests.total }}</strong> {{ t('documentation.strings.s0782') }}</p>
          <p class="wl-text-small wl-text-muted" data-testid="quality-report-source">{{ reportSource }} {{ t('documentation.strings.s0783') }} {{ report.version }} · <time :datetime="report.measuredAt" :title="report.measuredAt">{{ measuredLabel }}</time></p>
          <p class="wl-text-small wl-text-muted">{{ t('documentation.strings.s0784') }} <code>{{ formatRevision(report.source.revision) }}</code><span v-if="report.source.dirty"> {{ t('documentation.strings.s0785') }}</span>.</p>
          <p class="wl-text-small">{{ t('documentation.strings.s0786') }}</p>
          <div class="wl-inline" data-space="lg"><a class="quality-link" :href="workflowUrl">{{ t('documentation.strings.s0787') }}</a><a class="quality-link" :href="qualitySourceUrl">{{ t('documentation.strings.s0788') }}</a></div>
        </div>
      </WlCard>
    </section>

    <section class="wl-stack" data-space="md" :aria-labelledby="headings.checks.id">
      <h2 :id="headings.checks.id" class="quality-anchor wl-text-heading">{{ headings.checks.title }}</h2>
      <WlTable class="quality-table" :columns="qualityCheckColumns" :value="qualityCheckRows" :pt="{ table: { 'aria-labelledby': headings.checks.id } }" />
      <p class="wl-text-small wl-text-muted">{{ t('documentation.strings.s0789') }}</p>
    </section>

    <section class="wl-stack" data-space="md" :aria-labelledby="headings.environment.id">
      <h2 :id="headings.environment.id" class="quality-anchor wl-text-heading">{{ headings.environment.title }}</h2>
      <WlTable class="quality-table" :columns="qualityEnvironmentColumns" :value="qualityEnvironmentRows" :pt="{ table: { 'aria-labelledby': headings.environment.id } }" />
      <p class="wl-text-body">{{ t('documentation.strings.s0790') }}</p>
      <p class="wl-text-small wl-text-muted">{{ t('documentation.strings.s0791') }}</p>
    </section>

    <section class="wl-stack" data-space="lg" :aria-labelledby="headings.accessibility.id">
      <h2 :id="headings.accessibility.id" class="quality-anchor wl-text-heading">{{ headings.accessibility.title }}</h2>
      <div class="quality-cards">
        <WlCard>
          <template #title><h3 class="wl-text-subheading">{{ t('documentation.strings.s0792') }}</h3></template>
          <div class="wl-stack" data-space="sm">
            <p class="wl-text-body">{{ t('documentation.strings.s0793') }}</p>
            <p class="wl-text-small wl-text-muted">{{ t('documentation.strings.s0794') }}</p>
          </div>
        </WlCard>
        <WlCard>
          <template #title><h3 class="wl-text-subheading">{{ t('documentation.strings.s0795') }}</h3></template>
          <div class="wl-stack" data-space="sm">
            <p class="wl-text-body">{{ t('documentation.strings.s0796') }}</p>
            <p class="wl-text-small wl-text-muted">{{ t('documentation.strings.s0797') }} <code>context.teleports.body</code> {{ t('documentation.strings.s0798') }}</p>
          </div>
        </WlCard>
      </div>
    </section>

    <section class="wl-stack" data-space="lg" :aria-labelledby="headings.versions.id">
      <h2 :id="headings.versions.id" class="quality-anchor wl-text-heading">{{ headings.versions.title }}</h2>
      <p class="wl-text-body">{{ t('documentation.strings.s0799') }}</p>
      <div class="quality-cards">
        <WlCard><template #title><h3 class="wl-text-subheading">Patch</h3></template><p class="wl-text-body">{{ t('documentation.strings.s0800') }}</p></WlCard>
        <WlCard><template #title><h3 class="wl-text-subheading">{{ t('documentation.strings.s0801') }}</h3></template><p class="wl-text-body">{{ t('documentation.strings.s0802') }}</p></WlCard>
      </div>
      <p class="wl-text-small wl-text-muted">{{ t('documentation.strings.s0803') }}</p>
      <div class="wl-inline" data-space="lg"><a class="quality-link" :href="gaviaProjectInfo.changelogUrl">Changelog</a><a class="quality-link" :href="qualitySourceUrl">{{ t('documentation.strings.s0804') }}</a></div>
    </section>
  </article>
</template>

<style scoped>
.docs-quality-page { min-width: 0; }
.quality-anchor { scroll-margin-top: calc(var(--wl-playground-header-offset, 80px) + var(--wl-space-lg)); }
.quality-metrics { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--wl-space-md); }
.quality-metrics :deep(.wl-card__body), .quality-metrics :deep(.wl-card__content) { height: 100%; }
.quality-metrics :deep(.wl-card__content) { display: flex; flex-direction: column; }
.quality-metrics :deep(.wl-stat-card__footer) { margin-top: auto; padding-top: var(--wl-space-md); }
.quality-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--wl-layout-grid-min)), 1fr)); gap: var(--wl-space-lg); }
.quality-table :deep(.wl-table__th), .quality-table :deep(.wl-table__td) { white-space: normal; overflow-wrap: anywhere; }
.quality-link { color: var(--wl-text-accent); text-underline-offset: 3px; }
.quality-link:hover { color: var(--wl-text-accent-hover); }
.quality-link:focus-visible { outline: 2px solid var(--wl-focus-color); outline-offset: 2px; border-radius: var(--wl-corner-control); }
@media (min-width: 1280px) { .quality-metrics { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
@media (max-width: 480px) {
  .quality-table :deep(.wl-table__th:first-child), .quality-table :deep(.wl-table__td:first-child) { min-width: 7rem; overflow-wrap: normal; }
}
@media (max-width: 380px) { .quality-metrics { grid-template-columns: minmax(0, 1fr); } }
</style>
