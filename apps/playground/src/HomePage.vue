<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { WlThemeName } from "../../../packages/ui-kit/src/types";
import { withPlaygroundTheme } from "./themes";
import { WlButton, WlIcon, WlSegmented } from "../../../packages/ui-kit/src";
import { wlManifest } from "../../../packages/ui-kit/src/manifest";
import { WL_ICON_NAMES } from "../../../packages/ui-kit/src/icons.generated";
import { wlDesignThemes, wlDesignTokens } from "../../../packages/ui-kit/src/design-system";
import gaviaMarkUrl from "../../../docs/brand/gavia-ui-mark-v2.png";
import gaviaHeroUrl from "../../../docs/brand/gavia-lake-hero-v2.webp";
import gaviaForestUrl from "../../../docs/brand/gavia-forest-card-v1.webp";
import gaviaReedsUrl from "../../../docs/brand/gavia-reeds-card-v1.webp";
import { gaviaProjectInfo as project } from "./project/project-info";
import { installationManagers, getInstallCommand, type PackageManager } from "./project/installation";
import CodePanel from "./design-system/CodePanel.vue";
import QualitySummary from "./project/QualitySummary.vue";
import { usePageAnchor } from "./usePageAnchor";
import ButtonExample from "./design-system/examples/WlButton.vue";
import buttonExampleSource from "./design-system/examples/WlButton.vue?raw";
import { consumerSource } from "./design-system/code";

const props = defineProps<{ theme: WlThemeName }>();
const themedHref = (href: string): string => withPlaygroundTheme(href, props.theme);
const pageElement = ref<HTMLElement | null>(null);
usePageAnchor(pageElement);

const emit = defineEmits<{
  navigate: [view: "docs" | "font" | "system" | "project" | "theme-builder"];
  catalog: [];
  component: [name: string];
  quality: [];
}>();
const installManager = ref<string | null>("pnpm");
const installCommand = computed(() => getInstallCommand((installManager.value ?? "pnpm") as PackageManager));
const copied = ref(false);
const pending = ref(false);
const manual = ref(false);
watch(installManager, () => { copied.value = false; manual.value = false; });
async function copyInstall(): Promise<void> {
  copied.value = false;
  manual.value = false;
  pending.value = true;
  const command = installCommand.value;
  try {
    await navigator.clipboard.writeText(command);
    copied.value = command === installCommand.value;
  } catch {
    manual.value = command === installCommand.value;
  } finally {
    pending.value = false;
  }
}
const sections = [
  { view: "docs", number: "01", icon: "book", title: "Документация", description: "Подключение, основы и руководства по всем компонентам: настройки, примеры, API и доступность." },
  { view: "system", number: "02", icon: "image", title: "Дизайн-система", description: "Токены, типографика, состояния и готовые сценарии. Единые правила в пяти темах." },
  { view: "project", number: "03", icon: "file", title: "Changelog", description: "История выпусков, подготовленные изменения и заметки о переходе между версиями." }
] as const;
const metrics = [
  { label: "Компонентов", value: wlManifest.length, icon: "box", caption: "Готовых к использованию" },
  { label: "Иконок", value: WL_ICON_NAMES.length, icon: "image", caption: "Единый стиль" },
  { label: "Токенов", value: wlDesignTokens.length, icon: "database", caption: "Цвета, отступы, типографика" },
  { label: "Темы", value: wlDesignThemes.length, icon: "grid", caption: "Светлая, тёмная и другие" }
] as const;
const buttonPreview = { variant: "primary" } as const;
const buttonSource = consumerSource(buttonExampleSource, buttonPreview);
const setupSource = `import { createApp } from "vue";
import App from "./App.vue";

// Стили подключаются явно: reset → base → примитивы → тема.
import "gavia-ui/styles/reset.css";
import "gavia-ui/styles/base.css";
import "gavia-ui/styles/primitives.css";
import "gavia-ui/themes/white.css";

document.documentElement.dataset.wlTheme = "white";
createApp(App).mount("#app");`;
</script>

<template>
  <main ref="pageElement" class="home-page" data-testid="home-page" aria-labelledby="home-title">
    <header class="home-hero">
      <img class="home-hero-art" :src="gaviaHeroUrl" alt="" aria-hidden="true" width="2172" height="724" fetchpriority="high" decoding="async" />
      <div class="home-hero-content wl-container">
      <div class="home-intro wl-stack" data-space="lg">
        <div class="home-kicker wl-inline" data-space="sm">
          <span class="home-chip">Vue 3 + TypeScript</span>
          <span class="wl-text-small wl-text-muted" title="Версия исходников">v<span data-testid="project-version">{{ project.version }}</span></span>
        </div>
        <h1 id="home-title" class="home-title">Gavia UI</h1>
        <p class="home-tagline">Ясный язык для ваших интерфейсов.</p>
        <p class="home-lead wl-text-body wl-text-muted">Компоненты, общие токены и живые примеры для Vue-приложений. От первой кнопки до согласованного интерфейса в пяти темах.</p>
        <nav class="wl-inline" data-space="md" aria-label="Начать работу с Gavia UI">
          <a class="home-action wl-btn wl-btn--primary wl-btn--md" data-wl="button" data-variant="primary" data-size="md" data-density="default" :href="themedHref('?view=docs')" @click.prevent="emit('navigate', 'docs')">Читать документацию <WlIcon name="arrow-right" :size="18" /></a>
          <a class="home-action wl-btn wl-btn--secondary wl-btn--md" data-wl="button" data-variant="secondary" data-size="md" data-density="default" :href="themedHref('?view=docs#docs-components')" @click.prevent="emit('catalog')">Все компоненты</a>
        </nav>
        <div class="home-font-entry">
          <WlButton size="sm" variant="soft" @click="emit('navigate', 'font')"><template #icon><WlIcon name="book" :size="16" /></template>Шрифт Gavia Sans</WlButton>
          <span class="wl-text-small">6 весов · 12 начертаний</span>
        </div>
        <p class="home-credit wl-text-small wl-text-muted">Автор — <a class="home-text-link" :href="project.author.url">{{ project.author.name }}</a>. <a class="home-text-link" :href="project.licenseUrl">{{ project.license }}</a> · <a class="home-text-link" :href="project.repositoryUrl">GitHub <WlIcon name="external-link" :size="13" /></a></p>
      </div>
      </div>
    </header>

    <div class="home-content wl-container wl-stack" data-space="3xl">
    <div class="home-onboarding">
      <section class="home-install-card wl-stack" data-space="lg" aria-labelledby="home-install-title" data-testid="project-npm-status">
        <div class="home-install-brand">
          <span class="home-mark home-mark-mask" aria-hidden="true" :style="{ maskImage: 'url(' + gaviaMarkUrl + ')', WebkitMaskImage: 'url(' + gaviaMarkUrl + ')' }" />
          <div class="wl-stack" data-space="xs"><p class="wl-text-subheading">Начните с установки</p><p v-if="project.npmPublished" class="wl-text-small wl-text-muted">Пакет <a class="home-text-link" :href="project.packageUrl">{{ project.packageName }}@{{ project.publishedVersion }}</a> опубликован в публичном npm.</p><p v-else class="wl-text-small wl-text-muted">Первый выпуск {{ project.packageName }} в публичном npm ещё не опубликован. Установка из исходников описана в инструкции ниже.</p></div>
        </div>
        <h2 id="home-install-title" class="wl-text-heading">Добавьте Gavia UI в проект</h2>
        <WlSegmented v-if="project.npmPublished" v-model="installManager" :options="installationManagers" aria-label="Менеджер пакетов для установки" />
        <code v-if="project.npmPublished" class="home-install-command wl-text-code" data-testid="home-install">{{ installCommand }}</code>
        <div class="wl-inline" data-space="md">
          <WlButton v-if="project.npmPublished" size="sm" variant="secondary" :loading="pending" @click="copyInstall"><template #icon><WlIcon :name="copied ? 'check' : 'copy'" :size="16" /></template>{{ copied ? 'Скопировано' : 'Копировать команду' }}</WlButton>
          <a class="home-text-link wl-text-small" href="#home-quickstart">Пример подключения</a>
        </div>
        <p class="home-copy-status wl-text-small wl-text-muted" role="status">{{ copied ? 'Команда установки скопирована.' : manual ? 'Буфер обмена недоступен. Скопируйте команду из поля ниже.' : 'Vue 3 должен быть установлен в вашем приложении.' }}</p>
        <textarea v-if="manual" class="home-manual-copy" readonly :value="installCommand" aria-label="Команда установки для ручного копирования" @focus="($event.target as HTMLTextAreaElement).select()" />
      </section>
    <dl class="home-metrics" aria-label="Состав библиотеки">
      <div v-for="metric in metrics" :key="metric.label" class="home-metric">
        <dt class="home-metric-label"><span class="home-metric-icon" aria-hidden="true"><WlIcon :name="metric.icon" :size="25" /></span>{{ metric.label }}</dt>
        <dd class="home-metric-value">{{ metric.value }}</dd>
        <dd class="home-metric-caption wl-text-small wl-text-muted">{{ metric.caption }}</dd>
      </div>
    </dl>
    </div>

    <section class="wl-stack" data-space="lg" aria-labelledby="home-sections-title">
      <div class="home-section-heading"><h2 id="home-sections-title" class="wl-text-title">Найдите нужный раздел</h2><span class="wl-text-small wl-text-muted">Документы · примеры · правила</span></div>
      <nav class="home-sections" aria-label="Разделы Gavia UI">
        <a v-for="section in sections" :key="section.view" class="home-section-card wl-stack" data-space="lg" :href="themedHref(`?view=${section.view === 'project' ? 'changelog' : section.view}`)" @click.prevent="emit('navigate', section.view)">
          <div class="home-card-top"><span class="home-card-icon"><WlIcon :name="section.icon" :size="22" /></span><span class="home-card-number wl-text-code">{{ section.number }}</span></div>
          <div class="wl-stack" data-space="sm"><h3 class="wl-text-heading">{{ section.title }}</h3><p class="wl-text-small wl-text-muted">{{ section.description }}</p></div>
          <span class="home-card-arrow" aria-hidden="true"><WlIcon name="arrow-right" :size="20" /></span>
        </a>
      </nav>
      <p class="wl-text-small wl-text-muted">Хотите свою палитру? <a class="home-text-link" :href="themedHref('?view=theme-builder')" @click.prevent="emit('navigate', 'theme-builder')">Подобрать тему <WlIcon name="arrow-right" :size="14" /></a></p>
    </section>

    <section id="home-project" class="home-project wl-stack" data-space="lg" aria-labelledby="home-project-title" data-testid="home-project-info">
      <h2 id="home-project-title" class="wl-text-title">Свободно для ваших проектов</h2>
      <div class="home-project-grid">
        <article class="home-project-panel home-project-panel--forest">
          <img class="home-project-art" :src="gaviaForestUrl" alt="" aria-hidden="true" width="2172" height="724" loading="lazy" decoding="async" />
          <span class="home-project-icon" aria-hidden="true"><WlIcon name="heart" :size="25" /></span>
          <div class="home-project-copy wl-stack" data-space="md">
            <h3 class="wl-text-heading">Бесплатно, включая коммерческое использование</h3>
            <p class="wl-text-body wl-text-muted">Gavia UI можно использовать в личных и коммерческих проектах, изменять и распространять с сохранением текста MIT и уведомления об авторских правах.</p>
            <nav class="wl-stack" data-space="sm" aria-label="Документация подключения">
              <a class="home-text-link wl-text-small" :href="project.instructionsUrl">Подключение и инструкции</a>
              <a class="home-text-link wl-text-small" :href="project.documentationBaseUrl + 'docs/design-system.md'">Правила дизайн-системы</a>
              <a class="home-text-link wl-text-small" :href="project.documentationBaseUrl + 'docs/migration-gavia.md'">Переход на Gavia UI</a>
            </nav>
          </div>
        </article>
        <article class="home-project-panel home-project-panel--reeds">
          <img class="home-project-art" :src="gaviaReedsUrl" alt="" aria-hidden="true" width="2172" height="724" loading="lazy" decoding="async" />
          <span class="home-project-icon" aria-hidden="true"><WlIcon name="users" :size="25" /></span>
          <div class="home-project-copy wl-stack" data-space="md">
            <h3 class="wl-text-heading">Участвуйте в развитии</h3>
            <p class="wl-text-body wl-text-muted">Идеи, сообщения об ошибках и улучшения принимаются в <a class="home-text-link" :href="project.repositoryUrl + '/issues'">GitHub Issues</a>. Порядок работы с кодом и проверками описан в <a class="home-text-link" :href="project.contributingUrl">руководстве для участников</a>.</p>
            <p class="wl-text-small wl-text-muted">В Changelog собраны выпущенные версии и подготовленные изменения. Перед обновлением проверьте заметки о миграции.</p>
          </div>
        </article>
      </div>
    </section>

    <section id="home-quickstart" class="home-quickstart wl-stack" data-space="lg" aria-labelledby="home-quickstart-title">
      <div class="home-section-heading"><div class="wl-stack" data-space="xs"><h2 id="home-quickstart-title" class="wl-text-title">Первая кнопка — без лишних настроек</h2><p class="wl-text-small wl-text-muted">Подключите стили и тему явно, затем импортируйте компонент. В примере используется Classic. Для Gavia и Gavia Dark дополнительно подключите шрифтовой CSS и выберите тему gavia или gavia-dark. Gavia Dark подготовлена для следующего выпуска.</p></div><a class="home-text-link wl-text-small" :href="themedHref('?view=docs&component=WlButton')" @click.prevent="emit('component', 'WlButton')">Документация WlButton <WlIcon name="arrow-right" :size="16" /></a></div>
      <div class="home-quickstart-grid">
        <article class="home-setup-panel wl-stack" data-space="lg" aria-labelledby="home-setup-title"><div class="wl-stack" data-space="sm"><p class="home-panel-label wl-text-small">01 / main.ts</p><h3 id="home-setup-title" class="wl-text-subheading">Стили и тема</h3><p class="wl-text-small wl-text-muted">Для базовых компонентов установка плагина не требуется.</p></div><CodePanel :source="setupSource" title="Показать main.ts" /></article>
        <article class="home-button-panel wl-stack" data-space="lg" aria-labelledby="home-button-title"><div class="wl-stack" data-space="sm"><p class="home-panel-label wl-text-small">02 / App.vue</p><h3 id="home-button-title" class="wl-text-subheading">Попробуйте компонент</h3></div><div class="home-button-preview"><ButtonExample :preview="buttonPreview" /></div><CodePanel :source="buttonSource" title="Показать App.vue" /></article>
      </div>
    </section>
    <QualitySummary :href="themedHref('?view=docs&section=quality')" @navigate="emit('quality')" />
    </div>
  </main>
</template>

<style>
.home-page {
  overflow-wrap: anywhere;
  font-family: var(--wl-font);
}
.home-hero { position: relative; isolation: isolate; min-height: 450px; padding-block: 40px; overflow: hidden; background: var(--wl-bg); border-bottom: 1px solid var(--wl-border); }
.home-hero-art { position: absolute; inset: 0; z-index: -2; display: block; width: 100%; height: 100%; object-fit: cover; object-position: right center; }
.home-hero-content { display: grid; grid-template-columns: minmax(0, 520px) minmax(0, 1fr); gap: var(--wl-space-2xl); align-items: center; }
.home-content { padding-top: var(--wl-space-2xl); padding-bottom: var(--wl-space-4xl); }
.home-intro { min-width: 0; padding: var(--wl-space-2xl); border: 1px solid var(--wl-border); border-radius: var(--wl-corner-surface); background: var(--wl-bg); box-shadow: var(--wl-elevation-surface); gap: var(--wl-space-md); }
.home-onboarding { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: stretch; gap: var(--wl-space-lg); }
.home-font-entry { display: flex; flex-wrap: wrap; align-items: center; gap: var(--wl-space-md); color: var(--wl-text); }
.home-chip { padding: var(--wl-space-xs) var(--wl-space-sm); border: 1px solid var(--wl-accent-border); border-radius: var(--wl-corner-control); background: var(--wl-accent-soft); color: var(--wl-text); font-size: var(--wl-type-small-size); }
.home-title { margin: 0; font-family: var(--wl-type-display-family); font-size: clamp(var(--wl-type-display-size), 6.5vw, 80px); font-weight: var(--wl-type-display-weight); line-height: 1.06; letter-spacing: -0.045em; color: var(--wl-text); }
.home-tagline { margin: 0; font-family: var(--wl-type-heading-family); font-size: var(--wl-type-heading-size); line-height: var(--wl-type-heading-line-height); color: var(--wl-text); }
.home-lead { max-width: 56ch; color: var(--wl-text); }
.home-action { max-width: 100%; text-decoration: none; }
.home-text-link { display: inline; color: var(--wl-text-accent); text-decoration: underline; text-underline-offset: 0.18em; }
.home-text-link:hover { color: var(--wl-text-accent-hover); }
.home-text-link .wl-icon { display: inline-block; vertical-align: -0.15em; }
.home-text-link:focus-visible, .home-section-card:focus-visible, .home-manual-copy:focus-visible { outline: 2px solid var(--wl-focus-color); outline-offset: 4px; }
.home-credit { line-height: var(--wl-type-body-line-height); color: var(--wl-text); }
.home-install-card { min-width: 0; border: 1px solid var(--wl-accent-border); border-radius: var(--wl-corner-surface); padding: var(--wl-space-xl); background: var(--wl-accent-soft); gap: var(--wl-space-md); }
.home-install-brand { display: flex; align-items: center; gap: var(--wl-space-md); min-width: 0; }
.home-mark { flex: none; width: 80px; height: 80px; object-fit: contain; }
.home-mark-mask { display: block; background: var(--wl-action-primary-bg); mask-size: contain; mask-position: center; mask-repeat: no-repeat; -webkit-mask-size: contain; -webkit-mask-position: center; -webkit-mask-repeat: no-repeat; }
.home-install-command { display: block; padding: var(--wl-space-md); border: 1px solid var(--wl-border); border-radius: var(--wl-corner-control); background: var(--wl-bg); color: var(--wl-text); font-size: var(--wl-type-code-size); line-height: var(--wl-type-code-line-height); white-space: pre-wrap; overflow-wrap: anywhere; }
.home-copy-status { min-height: 1.6em; }
.home-manual-copy { display: block; width: 100%; min-height: 80px; resize: vertical; border: 1px solid var(--wl-border); border-radius: var(--wl-corner-control); background: var(--wl-bg); color: var(--wl-text); padding: var(--wl-space-md); font: 13px/1.6 var(--wl-mono); }
.home-metrics { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-template-rows: repeat(2, minmax(0, 1fr)); gap: var(--wl-space-lg); margin: 0; }
.home-metric { position: relative; display: flex; flex-direction: column; justify-content: start; gap: var(--wl-space-2xs); min-width: 0; padding: var(--wl-space-lg) var(--wl-space-lg) var(--wl-space-lg) 80px; border: 1px solid var(--wl-border); border-radius: var(--wl-corner-surface); background: var(--wl-bg-raised); }

.home-metric-icon { position: absolute; inset-block-start: var(--wl-space-lg); inset-inline-start: var(--wl-space-lg); display: inline-flex; justify-content: center; align-items: center; width: 44px; height: 44px; border-radius: 50%; color: var(--wl-text); background: var(--wl-accent-soft); }

.home-metric-value { order: -1; margin: 0; color: var(--wl-text); font-family: var(--wl-type-display-family); font-size: clamp(34px, 3vw, 42px); font-weight: 500; line-height: 1.1; letter-spacing: -0.025em; font-variant-numeric: lining-nums tabular-nums; }
.home-metric-label { color: var(--wl-text); font-size: var(--wl-type-body-size); line-height: var(--wl-type-body-line-height); }
.home-metric-caption { margin: 0; }
.home-section-heading { display: flex; align-items: baseline; justify-content: space-between; flex-wrap: wrap; gap: var(--wl-space-md); }
.home-sections { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--wl-space-lg); }
.home-section-card { position: relative; min-width: 0; padding: var(--wl-space-md); border: 1px solid var(--wl-border); border-radius: var(--wl-corner-surface); background: var(--wl-bg); color: var(--wl-text); text-decoration: none; gap: var(--wl-space-sm); transition: background-color 150ms ease, border-color 150ms ease; }
.home-section-card:hover { background: var(--wl-bg-soft); border-color: var(--wl-accent); }
.home-card-top { display: flex; align-items: center; gap: var(--wl-space-lg); margin-bottom: var(--wl-space-2xs); }
.home-card-icon { display: inline-flex; justify-content: center; align-items: center; flex: none; width: 44px; height: 44px; border-radius: var(--wl-corner-control); background: var(--wl-accent-soft); color: var(--wl-text); }
.home-card-number { color: var(--wl-text-muted); font-size: var(--wl-type-small-size); }
.home-section-card h3 { font-weight: 600; }
.home-section-card p { padding-inline-end: 46px; }
.home-card-arrow { position: absolute; inset-inline-end: var(--wl-space-md); inset-block-end: var(--wl-space-md); display: inline-flex; justify-content: center; align-items: center; width: 40px; height: 40px; border-radius: 50%; color: var(--wl-text); background: color-mix(in srgb, var(--wl-text) 6%, transparent); }
.home-project { scroll-margin-block-start: var(--wl-space-4xl); }
.home-project-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--wl-space-lg); }
.home-project-panel { position: relative; isolation: isolate; overflow: hidden; display: grid; grid-template-columns: 48px minmax(0, 1fr); align-items: start; gap: var(--wl-space-lg); min-width: 0; padding: var(--wl-space-xl); border: 1px solid var(--wl-border); border-radius: var(--wl-corner-surface); background: var(--wl-bg); }
.home-project-art { position: absolute; inset: 0; z-index: -1; display: block; width: 100%; height: 100%; object-fit: cover; object-position: right bottom; opacity: 0.5; mix-blend-mode: multiply; }
.home-project-icon { display: inline-flex; justify-content: center; align-items: center; width: 48px; height: 48px; border-radius: 50%; color: var(--wl-text); background: color-mix(in srgb, var(--wl-text) 9%, transparent); }
.home-project-copy { min-width: 0; }
:where(.home-project-copy) .wl-text-muted, :where(.home-project-copy) .home-text-link { color: var(--wl-text); }
.home-project-copy h3 { font-size: 18px; font-weight: 600; }
.home-quickstart { scroll-margin-block-start: var(--wl-space-4xl); }
.home-quickstart-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--wl-space-lg); }
.home-setup-panel, .home-button-panel { min-width: 0; padding: var(--wl-space-xl); border: 1px solid var(--wl-border); border-radius: var(--wl-corner-surface); background: var(--wl-bg); }
.home-panel-label { color: var(--wl-text-muted); font-family: var(--wl-mono); }
.home-button-preview { padding: var(--wl-space-lg); border-radius: var(--wl-corner-control); background: var(--wl-bg-soft); }

@media (max-width: 760px) {
  .home-hero { min-height: 0; padding-block: 0 var(--wl-space-2xl); }
  .home-hero-art { height: 240px; }
  .home-hero-content { grid-template-columns: minmax(0, 1fr); align-items: start; padding-block-start: calc(240px + var(--wl-space-xl)); }

}
@media (max-width: 900px) { .home-onboarding { grid-template-columns: minmax(0, 1fr); } }
@media (max-width: 760px) {
  .home-hero-content, .home-quickstart-grid, .home-project-grid, .home-sections { grid-template-columns: minmax(0, 1fr); }
  .home-title { font-size: clamp(var(--wl-type-display-size), 10vw, 72px); }
  .home-project-panel { gap: var(--wl-space-md); }
}
@media (max-width: 480px) {
  .home-hero-content, .home-content { padding-inline: var(--wl-space-md); }
  .home-content { gap: var(--wl-space-xl); }
  .home-intro, .home-install-card, .home-setup-panel, .home-button-panel, .home-project-panel { padding: var(--wl-space-lg); }
  .home-mark { width: 56px; height: 56px; }
  .home-metrics { gap: var(--wl-space-sm); }
  .home-metric { justify-content: start; padding: 68px var(--wl-space-md) var(--wl-space-md); }
  .home-metric-icon { inset-block-start: var(--wl-space-md); inset-inline-start: var(--wl-space-md); }
  .home-project-panel { grid-template-columns: 36px minmax(0, 1fr); gap: var(--wl-space-sm); }
  .home-project-icon { width: 36px; height: 36px; }
}
@media (prefers-reduced-motion: reduce) { .home-action, .home-section-card { transition: none; } }
</style>
