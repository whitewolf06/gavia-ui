<script setup lang="ts">
import { usePlaygroundI18n } from "./i18n";
const { t } = usePlaygroundI18n();
import { computed, ref, watch } from "vue";
import type { WlThemeName } from "../../../packages/ui-kit/src/types";
import { withPlaygroundTheme } from "./themes";
import { WlButton, WlIcon, WlIconButton, WlSegmented } from "../../../packages/ui-kit/src";
import { wlManifest } from "../../../packages/ui-kit/src/manifest";
import { WL_ICON_NAMES } from "../../../packages/ui-kit/src/icons.generated";
import { wlDesignThemes, wlDesignTokens } from "../../../packages/ui-kit/src/design-system";
import gaviaMarkUrl from "../../../docs/brand/gavia-ui-mark-v2.png";
import gaviaHeroUrl from "../../../docs/brand/gavia-lake-hero-v2.webp";
import gaviaNightHeroUrl from "../../../docs/brand/gavia-lake-night-v2.webp";
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
const isDarkTheme = computed(() => wlDesignThemes.find((item) => item.name === props.theme)?.colorScheme === "dark");
const nightArtReady = ref(false);
const themeToggleLabel = computed(() => isDarkTheme.value ? t('shell.HomePage.text54') : t('shell.HomePage.text55'));
const themedHref = (href: string): string => withPlaygroundTheme(href, props.theme);
const pageElement = ref<HTMLElement | null>(null);
usePageAnchor(pageElement);

const emit = defineEmits<{
  navigate: [view: "docs" | "font" | "system" | "project" | "theme-builder"];
  catalog: [];
  component: [name: string];
  quality: [];
  "toggle-theme": [];
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
  { view: "docs", number: "01", icon: "book", title: t('shell.HomePage.text56'), description: t('shell.HomePage.text57') },
  { view: "system", number: "02", icon: "image", title: t('shell.HomePage.text58'), description: t('shell.HomePage.text59') },
  { view: "project", number: "03", icon: "file", title: "Changelog", description: t('shell.HomePage.text60') }
] as const;
const metrics = [
  { label: t('shell.HomePage.text61'), value: wlManifest.length, icon: "box", caption: "" },
  { label: t('shell.HomePage.text62'), value: WL_ICON_NAMES.length, icon: "image", caption: "" },
  { label: t('shell.HomePage.text63'), value: wlDesignTokens.length, icon: "database", caption: t('shell.HomePage.text64') },
  { label: t('shell.HomePage.text65'), value: wlDesignThemes.length, icon: "grid", caption: t('shell.HomePage.text66') }
] as const;
const buttonPreview = { variant: "primary" } as const;
const buttonSource = consumerSource(buttonExampleSource, buttonPreview);
const setupSource = t('shell.HomePage.text67');
</script>

<template>
  <main ref="pageElement" class="home-page" data-testid="home-page" aria-labelledby="home-title">
    <header class="home-hero">
      <img class="home-hero-layer" :class="{ 'home-hero-art': !isDarkTheme }" :src="gaviaHeroUrl" alt="" aria-hidden="true" width="2172" height="724" :fetchpriority="isDarkTheme ? 'auto' : 'high'" decoding="async" />
      <img class="home-hero-layer home-hero-layer--night" :class="{ 'home-hero-art': isDarkTheme, 'home-hero-layer--visible': isDarkTheme && nightArtReady }" :src="gaviaNightHeroUrl" alt="" aria-hidden="true" width="2172" height="724" :fetchpriority="isDarkTheme ? 'high' : 'auto'" decoding="async" @load="nightArtReady = true" />
      <div class="home-hero-tools wl-container">
        <WlIconButton class="home-theme-toggle" :class="{ 'home-theme-toggle--light': !isDarkTheme }" variant="ghost" :aria-label="themeToggleLabel" :title="themeToggleLabel" @click="emit('toggle-theme')">
          <svg class="home-theme-symbol" :class="isDarkTheme ? 'home-theme-symbol--dark' : 'home-theme-symbol--light'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
            <g class="home-theme-sun">
              <g class="home-theme-outline"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></g>
              <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </g>
            <g class="home-theme-moon">
              <path class="home-theme-outline" d="M20.4 14.3A8.8 8.8 0 0 1 9.7 3.6a8.8 8.8 0 1 0 10.7 10.7Z" />
              <path d="M20.4 14.3A8.8 8.8 0 0 1 9.7 3.6a8.8 8.8 0 1 0 10.7 10.7Z" />
            </g>
          </svg>
        </WlIconButton>
      </div>
      <div class="home-hero-content wl-container">
      <div class="home-intro wl-stack" data-space="lg">
        <div class="home-kicker wl-inline" data-space="sm">
          <span class="home-chip">Vue 3 + TypeScript</span>
          <span class="wl-text-small wl-text-muted" :title="t('shell.HomePage.text68')">v<span data-testid="project-version">{{ project.version }}</span></span>
        </div>
        <h1 id="home-title" class="home-title">Gavia UI</h1>
        <p class="home-tagline">{{ t('shell.HomePage.text69') }}</p>
        <p class="home-lead wl-text-body wl-text-muted">{{ t('shell.HomePage.text70') }}</p>
        <nav class="wl-inline" data-space="md" :aria-label="t('shell.HomePage.text71')">
          <a class="home-action wl-btn wl-btn--primary wl-btn--md" data-wl="button" data-variant="primary" data-size="md" data-density="default" :href="themedHref('?view=docs')" @click.prevent="emit('navigate', 'docs')">{{ t('shell.HomePage.text72') }} <WlIcon name="arrow-right" :size="18" /></a>
          <a class="home-action wl-btn wl-btn--secondary wl-btn--md" data-wl="button" data-variant="secondary" data-size="md" data-density="default" :href="themedHref('?view=docs#docs-components')" @click.prevent="emit('catalog')">{{ t('shell.HomePage.text73') }}</a>
        </nav>
        <div class="home-font-entry">
          <WlButton size="sm" variant="soft" @click="emit('navigate', 'font')"><template #icon><WlIcon name="book" :size="16" /></template>{{ t('shell.HomePage.text74') }}</WlButton>
          <span class="wl-text-small">{{ t('shell.HomePage.text75') }}</span>
        </div>
        <p class="home-credit wl-text-small wl-text-muted">{{ t('shell.HomePage.text76') }} <a class="home-text-link" :href="project.author.url">{{ project.author.name }}</a>. <a class="home-text-link" :href="project.licenseUrl">{{ project.license }}</a> · <a class="home-text-link" :href="project.repositoryUrl">GitHub <WlIcon name="external-link" :size="13" /></a></p>
      </div>
      </div>
    </header>

    <div class="home-content wl-container wl-stack" data-space="3xl">
    <div class="home-onboarding">
      <section class="home-install-card wl-stack" data-space="lg" aria-labelledby="home-install-title" data-testid="project-npm-status">
        <div class="home-install-brand">
          <span class="home-mark home-mark-mask" aria-hidden="true" :style="{ maskImage: 'url(' + gaviaMarkUrl + ')', WebkitMaskImage: 'url(' + gaviaMarkUrl + ')' }" />
          <div class="wl-stack" data-space="xs"><p v-if="project.npmPublished" class="wl-text-small wl-text-muted">{{ t('shell.HomePage.text77') }} <a class="home-text-link" :href="project.packageUrl">{{ project.packageName }}@{{ project.publishedVersion }}</a> {{ t('shell.HomePage.text78') }}</p><p v-else class="wl-text-small wl-text-muted">{{ project.packageName }} {{ t('shell.HomePage.text79') }}</p></div>
        </div>
        <h2 id="home-install-title" class="wl-text-heading">{{ t('shell.HomePage.text80') }}</h2>
        <WlSegmented v-if="project.npmPublished" v-model="installManager" :options="installationManagers" :aria-label="t('shell.HomePage.text81')" />
        <code v-if="project.npmPublished" class="home-install-command wl-text-code" data-testid="home-install">{{ installCommand }}</code>
        <div class="wl-inline" data-space="md">
          <WlButton v-if="project.npmPublished" size="sm" variant="secondary" :loading="pending" @click="copyInstall"><template #icon><WlIcon :name="copied ? 'check' : 'copy'" :size="16" /></template>{{ copied ? t('shell.HomePage.text82') : t('shell.HomePage.text83') }}</WlButton>
          <a class="home-text-link wl-text-small" href="#home-quickstart">{{ t('shell.HomePage.text84') }}</a>
        </div>
        <p class="home-copy-status wl-text-small wl-text-muted" role="status">{{ copied ? t('shell.HomePage.text85') : manual ? t('shell.HomePage.text86') : t('shell.HomePage.text87') }}</p>
        <textarea v-if="manual" class="home-manual-copy" readonly :value="installCommand" :aria-label="t('shell.HomePage.text88')" @focus="($event.target as HTMLTextAreaElement).select()" />
      </section>
    <dl class="home-metrics" :aria-label="t('shell.HomePage.text89')">
      <div v-for="metric in metrics" :key="metric.label" class="home-metric">
        <dt class="home-metric-label"><span class="home-metric-icon" aria-hidden="true"><WlIcon :name="metric.icon" :size="25" /></span>{{ metric.label }}</dt>
        <dd class="home-metric-value">{{ metric.value }}</dd>
        <dd v-if="metric.caption" class="home-metric-caption wl-text-small wl-text-muted">{{ metric.caption }}</dd>
      </div>
    </dl>
    </div>

    <section class="wl-stack" data-space="lg" aria-labelledby="home-sections-title">
      <div class="home-section-heading"><h2 id="home-sections-title" class="wl-text-title">{{ t('shell.HomePage.text90') }}</h2></div>
      <nav class="home-sections" :aria-label="t('shell.HomePage.text91')">
        <a v-for="section in sections" :key="section.view" class="home-section-card wl-stack" data-space="lg" :href="themedHref(`?view=${section.view === 'project' ? 'changelog' : section.view}`)" @click.prevent="emit('navigate', section.view)">
          <div class="home-card-top"><span class="home-card-icon"><WlIcon :name="section.icon" :size="22" /></span><span class="home-card-number wl-text-code">{{ section.number }}</span></div>
          <div class="wl-stack" data-space="sm"><h3 class="wl-text-heading">{{ section.title }}</h3><p class="wl-text-small wl-text-muted">{{ section.description }}</p></div>
          <span class="home-card-arrow" aria-hidden="true"><WlIcon name="arrow-right" :size="20" /></span>
        </a>
      </nav>
      <p class="wl-text-small wl-text-muted">{{ t('shell.HomePage.text92') }} <a class="home-text-link" :href="themedHref('?view=theme-builder')" @click.prevent="emit('navigate', 'theme-builder')">{{ t('shell.HomePage.text93') }} <WlIcon name="arrow-right" :size="14" /></a>.</p>
    </section>

    <section id="home-author" class="home-author wl-stack" data-space="md" aria-labelledby="home-author-title">
      <h2 id="home-author-title" class="wl-text-title">{{ t('shell.author.title') }}</h2>
      <p class="wl-text-body">{{ t('shell.author.intro') }}</p>
      <p class="wl-text-body">{{ t('shell.author.reason') }}</p>
      <p class="wl-text-body">{{ t('shell.author.history') }}</p>
      <p class="wl-text-body">{{ t('shell.author.interests') }}</p>
      <p class="wl-text-body">{{ t('shell.author.contact') }} <a class="home-text-link" href="https://gorbach-dev.ru/">{{ t('shell.author.site') }}</a>.</p>
    </section>

    <section id="home-project" class="home-project wl-stack" data-space="lg" aria-labelledby="home-project-title" data-testid="home-project-info">
      <h2 id="home-project-title" class="wl-text-title">{{ t('shell.HomePage.text94') }}</h2>
      <div class="home-project-grid">
        <article class="home-project-panel home-project-panel--forest">
          <img class="home-project-art" :class="{ 'home-project-art--dark': isDarkTheme }" :src="gaviaForestUrl" alt="" aria-hidden="true" width="2172" height="724" loading="lazy" decoding="async" />
          <span class="home-project-icon" aria-hidden="true"><WlIcon name="heart" :size="25" /></span>
          <div class="home-project-copy wl-stack" data-space="md">
            <h3 class="wl-text-heading">{{ t('shell.HomePage.text95') }}</h3>
            <p class="wl-text-body wl-text-muted">{{ t('shell.HomePage.text96') }}</p>
            <nav class="wl-stack" data-space="sm" :aria-label="t('shell.HomePage.text97')">
              <a class="home-text-link wl-text-small" :href="project.instructionsUrl" target="_blank" rel="noopener noreferrer" :title="t('shell.HomePage.text98')">{{ t('shell.HomePage.text99') }} <span class="home-external-link-tail">{{ t('shell.HomePage.text100') }} <WlIcon name="external-link" :size="13" aria-hidden="true" /></span></a>
              <a class="home-text-link wl-text-small" :href="project.documentationBaseUrl + 'docs/design-system.md'" target="_blank" rel="noopener noreferrer" :title="t('shell.HomePage.text101')">{{ t('shell.HomePage.text102') }} <span class="home-external-link-tail">{{ t('shell.HomePage.text103') }} <WlIcon name="external-link" :size="13" aria-hidden="true" /></span></a>
              <a class="home-text-link wl-text-small" :href="project.documentationBaseUrl + 'docs/migration-gavia.md'" target="_blank" rel="noopener noreferrer" :title="t('shell.HomePage.text104')">{{ t('shell.HomePage.text105') }} <span class="home-external-link-tail">UI <WlIcon name="external-link" :size="13" aria-hidden="true" /></span></a>
            </nav>
          </div>
        </article>
        <article class="home-project-panel home-project-panel--reeds">
          <img class="home-project-art" :class="{ 'home-project-art--dark': isDarkTheme }" :src="gaviaReedsUrl" alt="" aria-hidden="true" width="2172" height="724" loading="lazy" decoding="async" />
          <span class="home-project-icon" aria-hidden="true"><WlIcon name="users" :size="25" /></span>
          <div class="home-project-copy wl-stack" data-space="md">
            <h3 class="wl-text-heading">{{ t('shell.HomePage.text106') }}</h3>
            <p class="wl-text-body wl-text-muted">{{ t('shell.HomePage.text107') }} <a class="home-text-link" :href="project.repositoryUrl + '/issues'" target="_blank" rel="noopener noreferrer" :title="t('shell.HomePage.text108')">GitHub <span class="home-external-link-tail">Issues <WlIcon name="external-link" :size="13" aria-hidden="true" /></span></a>{{ t('shell.HomePage.text109') }} <a class="home-text-link" :href="project.contributingUrl" target="_blank" rel="noopener noreferrer" :title="t('shell.HomePage.text110')">{{ t('shell.HomePage.text111') }} <span class="home-external-link-tail">{{ t('shell.HomePage.text112') }} <WlIcon name="external-link" :size="13" aria-hidden="true" /></span></a>.</p>
            <p class="wl-text-small wl-text-muted">{{ t('shell.HomePage.text113') }}</p>
          </div>
        </article>
      </div>
    </section>

    <section id="home-quickstart" class="home-quickstart wl-stack" data-space="lg" aria-labelledby="home-quickstart-title">
      <div class="home-section-heading"><div class="wl-stack" data-space="xs"><h2 id="home-quickstart-title" class="wl-text-title">{{ t('shell.HomePage.text114') }}</h2><p class="wl-text-small wl-text-muted">{{ t('shell.HomePage.text115') }}</p></div><a class="home-text-link wl-text-small" :href="themedHref('?view=docs&component=WlButton')" @click.prevent="emit('component', 'WlButton')">{{ t('shell.HomePage.text116') }} <WlIcon name="arrow-right" :size="16" /></a></div>
      <div class="home-quickstart-grid">
        <article class="home-setup-panel wl-stack" data-space="lg" aria-labelledby="home-setup-title"><div class="wl-stack" data-space="sm"><p class="home-panel-label wl-text-small">01 / main.ts</p><h3 id="home-setup-title" class="wl-text-subheading">{{ t('shell.HomePage.text117') }}</h3><p class="wl-text-small wl-text-muted">{{ t('shell.HomePage.text118') }}</p></div><CodePanel :source="setupSource" :title="t('shell.HomePage.text119')" /></article>
        <article class="home-button-panel wl-stack" data-space="lg" aria-labelledby="home-button-title"><div class="wl-stack" data-space="sm"><p class="home-panel-label wl-text-small">02 / App.vue</p><h3 id="home-button-title" class="wl-text-subheading">{{ t('shell.HomePage.text120') }}</h3></div><div class="home-button-preview"><ButtonExample :preview="buttonPreview" /></div><CodePanel :source="buttonSource" :title="t('shell.HomePage.text121')" /></article>
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
.home-hero-layer { position: absolute; inset: 0; z-index: -2; display: block; width: 100%; height: 100%; object-fit: cover; object-position: right center; }
.home-hero-layer--night { z-index: -1; opacity: 0; transition: opacity calc(var(--wl-motion-slow) * 2.5) var(--wl-ease); }
.home-hero-layer--visible { opacity: 1; }
.home-hero-tools { position: absolute; inset-block-start: var(--wl-space-lg); inset-inline: 0; z-index: 1; display: flex; justify-content: flex-end; pointer-events: none; }
.home-theme-toggle { min-width: 44px; min-height: 44px; pointer-events: auto; background: transparent; border-color: transparent; color: var(--wl-accent); }
.home-theme-toggle--light { color: color-mix(in srgb, var(--wl-accent) 60%, white); }
.home-theme-toggle:hover { background: transparent; color: color-mix(in srgb, var(--wl-accent) 60%, white); }
.home-theme-symbol { display: block; }
.home-theme-outline { stroke: var(--wl-gray-950); stroke-width: 3.4; opacity: 0; }
.home-theme-toggle--light .home-theme-outline { opacity: 1; }
.home-theme-sun, .home-theme-moon { transform-origin: center; transform-box: view-box; transition: opacity calc(var(--wl-motion-slow) * 2.5) var(--wl-ease), transform calc(var(--wl-motion-slow) * 2.5) var(--wl-ease); }
.home-theme-symbol--light .home-theme-sun { opacity: 0; transform: rotate(-45deg) scale(0.6); }
.home-theme-symbol--dark .home-theme-moon { opacity: 0; transform: rotate(35deg) scale(0.6); }
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
.home-external-link-tail { white-space: nowrap; }
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
.home-author { max-width: 76ch; }
.home-project { scroll-margin-block-start: var(--wl-space-4xl); }
.home-project-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--wl-space-lg); }
.home-project-panel { position: relative; isolation: isolate; overflow: hidden; display: grid; grid-template-columns: 48px minmax(0, 1fr); align-items: start; gap: var(--wl-space-lg); min-width: 0; padding: var(--wl-space-xl); border: 1px solid var(--wl-border); border-radius: var(--wl-corner-surface); background: var(--wl-bg); }
.home-project-art { position: absolute; inset: 0; z-index: -1; display: block; width: 100%; height: 100%; object-fit: cover; object-position: right bottom; opacity: 0.5; mix-blend-mode: multiply; }
.home-project-art--dark { filter: grayscale(1) invert(1); mix-blend-mode: screen; opacity: 0.3; mask-image: linear-gradient(110deg, transparent, rgb(0 0 0 / 0.35) 30%, #000 75%); }
.home-project-panel--reeds .home-project-art--dark { opacity: 0.24; }
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
  .home-hero-layer { height: 240px; }
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
@media (prefers-reduced-motion: reduce) {
  .home-action, .home-section-card, .home-hero-layer--night, .home-theme-sun, .home-theme-moon { transition: none; }
}
</style>
