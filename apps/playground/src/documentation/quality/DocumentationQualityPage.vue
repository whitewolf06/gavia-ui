<script setup lang="ts">
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
  return revision?.slice(0, 8) ?? "не указана";
}
const percentages = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 });
const metrics = [
  { key: "lines", icon: "file", label: "Строки", description: "Выполненные строки кода" },
  { key: "statements", icon: "code", label: "Инструкции", description: "Выполненные инструкции" },
  { key: "branches", icon: "sliders-h", label: "Ветвления", description: "Проверенные исходы условий" },
  { key: "functions", icon: "task", label: "Функции", description: "Вызванные функции" }
] as const;
const measuredAt = new Date(report.measuredAt);
const measuredLabel = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "long", timeStyle: "short", timeZone: "UTC"
}).format(measuredAt) + " (UTC)";
const reportSource = report.source.environment === "ci" ? "Отчёт CI" : "Локальный отчёт";
const qualitySourceUrl = gaviaProjectInfo.documentationBaseUrl + "docs/quality.md";
const workflowUrl = gaviaProjectInfo.repositoryUrl + "/actions/workflows/publish.yml";
</script>

<template>
  <article class="docs-quality-page wl-stack" data-space="2xl" data-testid="docs-quality-page" data-docs-section="quality">
    <section class="wl-stack" data-space="lg" :aria-labelledby="headings.measurement.id">
      <div class="wl-stack" data-space="sm">
        <h2 :id="headings.measurement.id" class="quality-anchor wl-text-heading">{{ headings.measurement.title }}</h2>
        <p class="wl-text-body wl-text-muted">Покрытие показывает, какая часть кода выполнена unit-тестами в измеренном прогоне.</p>
      </div>
      <div class="quality-metrics" role="group" aria-label="Покрытие unit-тестами" data-testid="quality-coverage">
        <WlStatCard v-for="metric in metrics" :key="metric.key" :icon="metric.icon" :label="metric.label" :value="percentages.format(report.coverage[metric.key]) + '%'" :description="metric.description" :data-coverage-metric="metric.key">
          <template #footer><QualityMeter :value="report.coverage[metric.key]" :label="'Покрытие unit-тестами: ' + metric.label" /></template>
        </WlStatCard>
      </div>
      <WlCard>
        <div class="wl-stack" data-space="sm">
          <p class="wl-text-body"><strong data-testid="quality-unit-count">{{ report.tests.passed }} / {{ report.tests.total }}</strong> unit-тестов прошли в этом измерении.</p>
          <p class="wl-text-small wl-text-muted" data-testid="quality-report-source">{{ reportSource }} · версия {{ report.version }} · <time :datetime="report.measuredAt" :title="report.measuredAt">{{ measuredLabel }}</time></p>
          <p class="wl-text-small wl-text-muted">Ревизия <code>{{ formatRevision(report.source.revision) }}</code><span v-if="report.source.dirty"> · рабочая копия с незакоммиченными изменениями</span>.</p>
          <p class="wl-text-small">В расчёт входят компоненты, утилиты, разрешение имён иконок и токенов. E2E, визуальные сравнения и Axe выполняются отдельно. Декларации типов, сгенерированные каталоги, метаданные manifest и точки реэкспорта исключены.</p>
          <div class="wl-inline" data-space="lg"><a class="quality-link" :href="workflowUrl">Запуски и артефакты GitHub Actions</a><a class="quality-link" :href="qualitySourceUrl">Методика проверок</a></div>
        </div>
      </WlCard>
    </section>

    <section class="wl-stack" data-space="md" :aria-labelledby="headings.checks.id">
      <h2 :id="headings.checks.id" class="quality-anchor wl-text-heading">{{ headings.checks.title }}</h2>
      <WlTable class="quality-table" :columns="qualityCheckColumns" :value="qualityCheckRows" :pt="{ table: { 'aria-labelledby': headings.checks.id } }" />
      <p class="wl-text-small wl-text-muted">Таблица описывает состав проверок. Состояние конкретного CI-запуска смотрите в GitHub Actions; локальный отчёт покрытия его не подтверждает. Изменения PNG принимаются после просмотра expected/actual/diff.</p>
    </section>

    <section class="wl-stack" data-space="md" :aria-labelledby="headings.environment.id">
      <h2 :id="headings.environment.id" class="quality-anchor wl-text-heading">{{ headings.environment.title }}</h2>
      <WlTable class="quality-table" :columns="qualityEnvironmentColumns" :value="qualityEnvironmentRows" :pt="{ table: { 'aria-labelledby': headings.environment.id } }" />
      <p class="wl-text-body">Диапазон браузеров определён по поддержке ES2020, CSS Layers, :has(), color-mix и container queries. Автоматические проверки используют закреплённые версии Playwright; полный набор на каждой исторической минимальной версии отдельно не запускался.</p>
      <p class="wl-text-small wl-text-muted">WebKit проверяет движок и не заменяет отдельный Safari/iOS-прогон. IE и старые WebView не поддерживаются. CSS подключается явно; библиотека не устанавливает глобальные полифиллы.</p>
    </section>

    <section class="wl-stack" data-space="lg" :aria-labelledby="headings.accessibility.id">
      <h2 :id="headings.accessibility.id" class="quality-anchor wl-text-heading">{{ headings.accessibility.title }}</h2>
      <div class="quality-cards">
        <WlCard>
          <template #title><h3 class="wl-text-subheading">Доступность в приложении</h3></template>
          <div class="wl-stack" data-space="sm">
            <p class="wl-text-body">Целевой уровень — WCAG 2.2 AA. Axe проверяет имена и связи ARIA, контраст и видимый DOM, включая открытые списки и диалоги в четырёх темах.</p>
            <p class="wl-text-small wl-text-muted">Автоматический скан не подтверждает полное соответствие WCAG. При интеграции нужны ручные проверки клавиатуры, масштабирования, NVDA и VoiceOver. Эти прогоны не входят в приведённое unit-покрытие.</p>
          </div>
        </WlCard>
        <WlCard>
          <template #title><h3 class="wl-text-subheading">SSR и оверлеи</h3></template>
          <div class="wl-stack" data-space="sm">
            <p class="wl-text-body">Проверяется Vue SSR и гидратация с сохранением DOM и идентификаторов. В Vue 3.4 порядок синхронного серверного дерева и гидратации должен совпадать; порядок асинхронных ветвей отдельно не гарантируется.</p>
            <p class="wl-text-small wl-text-muted">Оверлеи используют Teleport в body: сервер вставляет <code>context.teleports.body</code> в начало body перед корнем приложения. Если фреймворк обслуживает только собственный teleport-target, используйте его ClientOnly для оверлеев и проверьте интеграцию. Интеграцию с Nuxt и его модулями проверяйте в приложении.</p>
          </div>
        </WlCard>
      </div>
    </section>

    <section class="wl-stack" data-space="lg" :aria-labelledby="headings.versions.id">
      <h2 :id="headings.versions.id" class="quality-anchor wl-text-heading">{{ headings.versions.title }}</h2>
      <p class="wl-text-body">Все компоненты выпускаются одной версией Gavia UI. «С версии» в каталоге означает первый выпуск компонента; последующие изменения перечислены в changelog.</p>
      <div class="quality-cards">
        <WlCard><template #title><h3 class="wl-text-subheading">Patch</h3></template><p class="wl-text-body">Исправления сохраняют публичный контракт и прежний код потребителя.</p></WlCard>
        <WlCard><template #title><h3 class="wl-text-subheading">Minor и major</h3></template><p class="wl-text-body">Minor добавляет возможности. В 0.x необходимое несовместимое изменение допускается только в minor с явной отметкой Breaking changes и руководством миграции. После 1.0 оно требует major.</p></WlCard>
      </div>
      <p class="wl-text-small wl-text-muted">Публичный контракт включает props, события и payload, slots, v-model, exposed-методы, exports, CSS-классы, data-wl, токены и pt-секции. Проверка типов защищает форму API; unit/E2E проверяют поведение. Миграционная заметка сама по себе не отключает проверку совместимости.</p>
      <div class="wl-inline" data-space="lg"><a class="quality-link" :href="gaviaProjectInfo.changelogUrl">Changelog</a><a class="quality-link" :href="qualitySourceUrl">Политика совместимости</a></div>
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
