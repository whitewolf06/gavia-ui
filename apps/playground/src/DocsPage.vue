<script setup lang="ts">
import { usePlaygroundI18n } from "./i18n";
const { t } = usePlaygroundI18n();
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { WlButton, WlIcon, WlSegmented, type WlThemeName } from "../../../packages/ui-kit/src";
import { getLocalizedManifest } from "./documentation/manifest";
const wlManifest = getLocalizedManifest();
import CodePanel from "./design-system/CodePanel.vue";
import { usePageAnchor } from "./usePageAnchor";
import ButtonDocumentation from "./documentation/ButtonDocumentation.vue";
import ComponentDocumentation from "./documentation/ComponentDocumentation.vue";
import { useDocumentationScrollspy } from "./documentation/useDocumentationScrollspy";
import FoundationPage from "./documentation/foundations/FoundationPage.vue";
import { createPlaygroundUrl, isDocumentationAssetSection, isDocumentationFoundationSection, isDocumentationQualitySection, type DocumentationSection } from "./navigation";
import { withPlaygroundTheme } from "./themes";
import DocumentationAssetsPage from "./documentation/assets/DocumentationAssetsPage.vue";
import { documentationAssets, documentationAssetPages } from "./documentation/assets/assets";
import PlaygroundPageHeader from "./PlaygroundPageHeader.vue";
import DocumentationQualityPage from "./documentation/quality/DocumentationQualityPage.vue";
import { documentationQualityPage } from "./documentation/quality/quality";
import { documentationCategories, documentationFoundations, documentationFoundationPages, documentationOverviewHeadings, foundationHeadings, installationSource, type DocumentationHeading } from "./documentation/catalog";

import { installationManagers, getInstallCommand, type PackageManager } from "./project/installation";
const installManager = ref<string | null>("pnpm");
const installationCommand = computed(() => getInstallCommand((installManager.value ?? "pnpm") as PackageManager, true));

const props = withDefaults(defineProps<{ component?: string; section?: DocumentationSection; theme?: WlThemeName }>(), { theme: "gavia" });
const foundationSection = computed(() => isDocumentationFoundationSection(props.section) ? props.section : undefined);
const assetSection = computed(() => isDocumentationAssetSection(props.section) ? props.section : undefined);
const qualitySection = computed(() => isDocumentationQualitySection(props.section) ? props.section : undefined);
const pageElement = ref<HTMLElement | null>(null);
const contentElement = ref<HTMLElement | null>(null);
const headingIds = computed(() => qualitySection.value ? documentationQualityPage.headings.map((heading) => heading.id)
  : foundationSection.value ? foundationHeadings(foundationSection.value).map((heading) => heading.id)
  : assetSection.value ? documentationAssets.find((asset) => asset.key === assetSection.value)?.headings.map((heading) => heading.id)
  : props.component === "WlButton" ? ["docs-button-preview-title", "docs-button-usage", "docs-button-variants", "docs-button-sizes", "docs-button-states", "docs-button-slot-layout", "docs-button-form", "docs-button-props", "docs-button-events", "docs-button-slots", "docs-button-pt", "docs-button-accessibility"]
  : props.component ? ["preview", "examples", "service", "props", "events", "slots", "pt", "accessibility"].map((key) => "docs-" + props.component!.toLowerCase() + "-" + key) : documentationOverviewHeadings.map((heading) => heading.id));
const { activeId, headings: currentHeadings } = useDocumentationScrollspy({ root: contentElement, key: () => [props.component, props.section], headingIds: () => headingIds.value });
usePageAnchor(pageElement);

const emit = defineEmits<{
  component: [name: string | undefined];
  section: [name: DocumentationSection | undefined];
  overview: [anchor: string];
  navigate: [view: "system" | "project" | "components"];
}>();
const entry = computed(() => props.section ? undefined : wlManifest.find((item) => item.name === props.component));
const categoryLabel = computed(() => documentationCategories.find((category) => category.key === entry.value?.category)?.label);
const pageIntroduction = computed(() => {
  const metadata = qualitySection.value ? documentationQualityPage
    : assetSection.value ? documentationAssetPages[assetSection.value]
    : foundationSection.value ? documentationFoundationPages[foundationSection.value] : undefined;
  const title = metadata?.label ?? entry.value?.name ?? t('documentation.strings.s0827');
  const description = metadata?.description ?? entry.value?.description
    ?? t('documentation.strings.s0828');
  return { title, description, breadcrumbs: metadata || entry.value
    ? [{ label: t('documentation.strings.s0827'), route: { view: "docs" as const } }, { label: title }]
    : [{ label: t('documentation.strings.s0827') }] };
});
const groups = documentationCategories.map((category) => ({
  ...category,
  entries: wlManifest.filter((item) => item.category === category.key)
})).filter((category) => category.entries.length > 0);
const overviewSections = documentationOverviewHeadings;
const [installHeading, foundationsHeading, componentsHeading, tokensHeading, iconsHeading, migrationHeading] = documentationOverviewHeadings;
const isMobile = ref(false);
const mobileMenuOpen = ref(false);
const menuElement = ref<HTMLDetailsElement | null>(null);
function closeMobileMenu(): void {
  mobileMenuOpen.value = false;
  if (isMobile.value && menuElement.value) menuElement.value.open = false;
}
let mobileMedia: MediaQueryList | undefined;
function updateMobile(): void { isMobile.value = mobileMedia?.matches ?? false; }
function toggleMenu(event: Event): void {
  if (isMobile.value) mobileMenuOpen.value = (event.currentTarget as HTMLDetailsElement).open;
}
function overviewHref(heading: DocumentationHeading): string {
  const current = new URL(typeof window === "undefined" ? "http://localhost/" : window.location.href);
  const target = createPlaygroundUrl(current, { view: "docs" });
  target.hash = heading.id;
  return withPlaygroundTheme(target.pathname + target.search + target.hash, props.theme);
}
const qualityHref = computed(() => {
  const current = new URL(typeof window === "undefined" ? "http://localhost/" : window.location.href);
  const target = createPlaygroundUrl(current, { view: "docs", section: "quality" });
  return withPlaygroundTheme(target.pathname + target.search, props.theme);
});
function navigateQuality(event: MouseEvent): void {
  if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  closeMobileMenu();
  emit("section", "quality");
}
function navigateOverview(event: MouseEvent, heading: DocumentationHeading): void {
  // Preserve the native new-tab/window and context-menu behavior of a real link.
  if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  closeMobileMenu();
  emit("overview", heading.id);
}
async function navigateAnchor(heading: DocumentationHeading): Promise<void> {
  closeMobileMenu();
  await nextTick();
  document.getElementById(heading.id)?.scrollIntoView({ block: "start" });
}
watch(() => [props.component, props.section], closeMobileMenu);
onMounted(() => {
  mobileMedia = window.matchMedia("(max-width: 760px)");
  updateMobile();
  mobileMedia.addEventListener("change", updateMobile);
});
onBeforeUnmount(() => { mobileMedia?.removeEventListener("change", updateMobile); });
</script>

<template>
  <main ref="pageElement" class="docs-page" data-testid="docs-page" :aria-label="t('documentation.strings.s0829')">
    <div class="docs-layout">
      <PlaygroundPageHeader class="docs-page-header" :title="pageIntroduction.title" :description="pageIntroduction.description" :breadcrumbs="pageIntroduction.breadcrumbs">
        <template v-if="entry" #meta><span>{{ t('documentation.strings.s0830') }} {{ categoryLabel }}</span><span class="docs-version">{{ t('documentation.strings.s0831') }} {{ entry.introducedIn }}</span></template>
        <template v-if="entry" #actions>
          <WlButton v-if="entry.name === 'WlIcon'" size="sm" @click="emit('section', 'icons')">{{ t('documentation.strings.s0004') }}</WlButton>
          <WlButton class="docs-design-rules" size="sm" variant="secondary" @click="emit('navigate', 'system')">{{ t('documentation.strings.s0832') }}</WlButton>
        </template>
      </PlaygroundPageHeader>
      <aside class="docs-sidebar" :aria-label="t('documentation.strings.s0833')">
        <details ref="menuElement" class="docs-menu" :open="!isMobile || mobileMenuOpen" @toggle="toggleMenu">
          <summary class="docs-menu-summary">{{ t('documentation.strings.s0833') }}</summary>
          <div class="docs-menu-content wl-stack" data-space="lg">
            <section class="docs-nav-section wl-stack" data-space="sm" :aria-label="t('documentation.strings.s0834')">
              <h2 class="docs-sidebar-heading"><span class="docs-sidebar-mark docs-sidebar-book"><WlIcon class="docs-sidebar-icon docs-sidebar-icon--book" name="book" :size="16" /></span>{{ t('documentation.strings.s0834') }}</h2>
              <nav class="docs-subnav" :aria-label="t('documentation.strings.s0835')"><ul class="docs-toc-list"><li v-for="heading in overviewSections" :key="heading.id"><a class="docs-anchor-link" :href="overviewHref(heading)" :aria-current="!component && !section && activeId === heading.id ? 'location' : undefined" @click="navigateOverview($event, heading)"><span class="docs-toc-indicator" aria-hidden="true"><WlIcon name="chevron-right" :size="10" /></span>{{ heading.title }}</a></li></ul></nav>
              <div class="docs-foundation-nav">
                <a class="docs-component-link docs-quality-link" :href="qualityHref" :aria-current="qualitySection ? 'page' : undefined" @click="navigateQuality">{{ documentationQualityPage.label }}</a>
                <nav v-if="qualitySection" class="docs-subnav" :aria-label="t('documentation.strings.s0836')"><ul class="docs-toc-list"><li v-for="heading in documentationQualityPage.headings" :key="heading.id"><a class="docs-anchor-link" :href="'#' + heading.id" :aria-current="activeId === heading.id ? 'location' : undefined" @click="navigateAnchor(heading)"><span class="docs-toc-indicator" aria-hidden="true"><WlIcon name="chevron-right" :size="10" /></span>{{ heading.title }}</a></li></ul></nav>
              </div>
            </section>
            <nav class="docs-nav-section wl-stack" data-space="xs" :aria-label="t('documentation.strings.s0837')">
              <h2 class="docs-sidebar-heading"><span class="docs-sidebar-mark"><WlIcon class="docs-sidebar-icon" name="grid" :size="16" /></span>{{ t('documentation.strings.s0837') }}</h2>
              <div v-for="foundation in documentationFoundations" :key="foundation.key" class="docs-foundation-nav">
                <button type="button" class="docs-component-link" :aria-current="section === foundation.key ? 'page' : undefined" @click="emit('section', foundation.key)">{{ foundation.label }}</button>
                <nav v-if="section === foundation.key" class="docs-subnav" :aria-label="t('documentation.strings.s0836')"><ul class="docs-toc-list"><li v-for="heading in foundationHeadings(foundation.key)" :key="heading.id"><a class="docs-anchor-link" :href="'#' + heading.id" :aria-current="activeId === heading.id ? 'location' : undefined" @click="navigateAnchor(heading)"><span class="docs-toc-indicator" aria-hidden="true"><WlIcon name="chevron-right" :size="10" /></span>{{ heading.title }}</a></li></ul></nav>
              </div>
            </nav>
            <nav class="docs-nav-section wl-stack" data-space="xs" :aria-label="t('documentation.strings.s0838')">
              <h2 class="docs-sidebar-heading"><span class="docs-sidebar-mark"><WlIcon class="docs-sidebar-icon" name="image" :size="16" /></span>{{ t('documentation.strings.s0838') }}</h2>
              <div v-for="asset in documentationAssets" :key="asset.key" class="docs-foundation-nav">
                <button type="button" class="docs-component-link" :aria-current="section === asset.key ? 'page' : undefined" @click="emit('section', asset.key)">{{ asset.label }}</button>
                <nav v-if="section === asset.key" class="docs-subnav" :aria-label="t('documentation.strings.s0836')"><ul class="docs-toc-list"><li v-for="heading in asset.headings" :key="heading.id"><a class="docs-anchor-link" :href="'#' + heading.id" :aria-current="activeId === heading.id ? 'location' : undefined" @click="navigateAnchor(heading)"><span class="docs-toc-indicator" aria-hidden="true"><WlIcon name="chevron-right" :size="10" /></span>{{ heading.title }}</a></li></ul></nav>
              </div>
            </nav>
            <section class="docs-nav-section wl-stack" data-space="md" :aria-label="t('documentation.strings.s0839')">
              <h2 class="docs-sidebar-heading"><span class="docs-sidebar-mark"><WlIcon class="docs-sidebar-icon" name="box" :size="16" /></span>{{ t('documentation.strings.s0839') }}</h2>
              <nav class="docs-catalog" :aria-label="t('documentation.strings.s0840')">
                <section v-for="group in groups" :key="group.key" class="docs-catalog-group">
                  <h3 class="docs-category-label">{{ group.label }}</h3>
                  <ul class="docs-catalog-list">
                    <li v-for="item in group.entries" :key="item.name">
                      <button type="button" class="docs-component-link" :aria-label="item.name" :aria-describedby="'docs-catalog-version-' + item.name" :aria-current="component === item.name ? 'page' : undefined" @click="emit('component', item.name)">
                        <span class="docs-component-name">{{ item.name }}</span>
                        <span :id="'docs-catalog-version-' + item.name" class="docs-component-version" :title="t('documentation.strings.s0841') + item.introducedIn">{{ t('documentation.strings.s0842') }} {{ item.introducedIn }}</span>
                      </button>
                    </li>
                  </ul>
                </section>
              </nav>
            </section>
          </div>
        </details>
      </aside>

      <div ref="contentElement" class="docs-content wl-stack" data-space="2xl">
        <DocumentationQualityPage v-if="qualitySection" />
        <DocumentationAssetsPage v-else-if="assetSection" :key="assetSection" :section="assetSection" :theme="theme" />
        <FoundationPage v-else-if="foundationSection" :key="foundationSection" :section="foundationSection" @component="emit('component', $event)" @navigate="emit('navigate', $event)" />
        <template v-else-if="entry">

          <component :is="entry.name === 'WlButton' ? ButtonDocumentation : ComponentDocumentation" :key="entry.name" :entry="entry">
            <template #outline>
              <nav v-if="currentHeadings.length" class="docs-section-links docs-component-outline" :aria-label="t('documentation.strings.s0836')"><a v-for="heading in currentHeadings" :key="heading.id" class="docs-anchor-link" :href="'#' + heading.id" @click="navigateAnchor(heading)">{{ heading.title }}</a></nav>
            </template>
          </component>
        </template>

        <template v-else>
          <p v-if="component" class="docs-notice wl-text-small" role="alert">{{ t('documentation.strings.s0843') }}{{ component }}{{ t('documentation.strings.s0844') }}</p>
          <nav class="docs-section-links" :aria-label="t('documentation.strings.s0845')"><a v-for="section in overviewSections" :key="section.id" class="docs-anchor-link" :href="'#' + section.id">{{ section.title }}</a></nav>
          <section class="docs-overview-section wl-stack" data-space="lg">
            <div class="wl-stack" data-space="sm"><p class="docs-eyebrow">{{ t('documentation.strings.s0846') }}</p><h2 :id="installHeading.id" class="wl-text-heading">{{ installHeading.title }}</h2><p class="wl-text-body wl-text-muted">{{ t('documentation.strings.s0847') }}</p></div>
            <WlSegmented v-model="installManager" :options="installationManagers" :aria-label="t('documentation.strings.s0848')" />
            <CodePanel :source="installationCommand" :title="t('documentation.strings.s1280', { manager: installManager ?? 'pnpm' })" :expanded="true" />
            <CodePanel :source="installationSource" :title="t('documentation.strings.s0849')" :expanded="true" />
            <p class="wl-text-small wl-text-muted">{{ t('documentation.strings.s0850') }} <code>gavia-ui/themes/</code> {{ t('documentation.strings.s0851') }} <code>data-wl-theme</code> {{ t('documentation.strings.s0852') }} <code>gavia-ui/styles/fonts/gavia.css</code>.</p>
          </section>

          <section class="docs-overview-section wl-stack" data-space="lg">
            <div class="wl-stack" data-space="sm"><h2 :id="foundationsHeading.id" class="wl-text-heading">{{ foundationsHeading.title }}</h2><p class="wl-text-body wl-text-muted">{{ t('documentation.strings.s0853') }}</p></div>
            <div class="wl-grid" data-space="lg">
              <article v-for="foundation in documentationFoundations" :key="foundation.key" class="wl-surface wl-stack" data-space="md">
                <h3 class="wl-text-subheading">{{ foundation.label }}</h3><p class="wl-text-body wl-text-muted">{{ foundation.description }}</p>
                <div><WlButton size="sm" @click="emit('section', foundation.key)">{{ t('documentation.strings.s1281', { section: foundation.label }) }}</WlButton></div>
              </article>
            </div>
          </section>
          <section class="docs-overview-section wl-stack" data-space="lg">
            <div class="wl-stack" data-space="sm"><p class="docs-eyebrow">{{ t('documentation.strings.s0855') }}</p><h2 :id="componentsHeading.id" class="wl-text-heading">{{ componentsHeading.title }}</h2><p class="wl-text-body wl-text-muted">{{ t('documentation.strings.s0856') }} {{ wlManifest.length }} {{ t('documentation.strings.s0857') }}</p></div>
            <article class="docs-pilot-card wl-stack" data-space="md">
              <p class="docs-eyebrow">{{ t('documentation.strings.s0858') }}</p><h3 class="wl-text-heading">WlButton</h3>
              <p class="wl-text-body wl-text-muted">{{ t('documentation.strings.s0859') }}</p>
              <div class="wl-inline" data-space="sm"><WlButton variant="primary" @click="emit('component', 'WlButton')">{{ t('documentation.strings.s0860') }}</WlButton><WlButton variant="ghost" @click="emit('component', 'WlInput')">{{ t('documentation.strings.s0861') }}</WlButton><WlButton variant="ghost" @click="emit('component', 'WlDialog')">{{ t('documentation.strings.s0862') }}</WlButton></div>
            </article>
          </section>

          <section class="docs-overview-section wl-stack" data-space="md">
            <p class="docs-eyebrow">{{ t('documentation.strings.s0863') }}</p><h2 :id="tokensHeading.id" class="wl-text-heading">{{ tokensHeading.title }}</h2>
            <p class="wl-text-body wl-text-muted">{{ t('documentation.strings.s0864') }} <code>--wl-*</code>{{ t('documentation.strings.s0865') }} <code>data-wl-theme</code>{{ t('documentation.strings.s0866') }}</p>
            <div class="wl-inline" data-space="sm"><WlButton size="sm" @click="emit('section', 'colors')">{{ t('documentation.strings.s0018') }}</WlButton><WlButton size="sm" variant="ghost" @click="emit('navigate', 'system')">{{ t('documentation.strings.s0867') }}</WlButton><a class="docs-text-link" href="https://github.com/whitewolf06/gavia-ui/blob/main/docs/design-system.md">{{ t('documentation.strings.s0868') }}</a></div>
          </section>

          <section class="docs-overview-section wl-stack" data-space="md">
            <p class="docs-eyebrow">{{ t('documentation.strings.s0869') }}</p><h2 :id="iconsHeading.id" class="wl-text-heading">{{ iconsHeading.title }}</h2>
            <p class="wl-text-body wl-text-muted">{{ t('documentation.strings.s0870') }} <code>name</code> {{ t('documentation.strings.s0871') }} <code>icons:sync</code> {{ t('documentation.strings.s0089') }} <code>icons:check</code>.</p>
            <div class="wl-inline" data-space="sm"><WlButton size="sm" @click="emit('section', 'icons')">{{ t('documentation.strings.s0872') }}</WlButton><a class="docs-text-link" href="https://github.com/whitewolf06/gavia-ui/blob/main/docs/icons.md">{{ t('documentation.strings.s0873') }}</a></div>
          </section>

          <section class="docs-overview-section wl-stack" data-space="md">
            <p class="docs-eyebrow">{{ t('documentation.strings.s0874') }}</p><h2 :id="migrationHeading.id" class="wl-text-heading">{{ migrationHeading.title }}</h2>
            <p class="wl-text-body wl-text-muted">{{ t('documentation.strings.s0875') }}</p>
            <ul class="docs-migration-links"><li><a class="docs-text-link" href="https://github.com/whitewolf06/gavia-ui/blob/main/docs/migration-gavia.md">{{ t('documentation.strings.s0876') }}</a></li><li><a class="docs-text-link" href="https://github.com/whitewolf06/gavia-ui/blob/main/docs/migration-0.8.md">{{ t('documentation.strings.s0877') }}</a></li><li><a class="docs-text-link" href="https://github.com/whitewolf06/gavia-ui/blob/main/docs/migration-0.5.md">{{ t('documentation.strings.s0878') }}</a></li></ul>
            <div class="wl-inline" data-space="sm"><WlButton size="sm" @click="emit('navigate', 'project')">Changelog</WlButton></div>
          </section>
        </template>
      </div>
    </div>
  </main>
</template>
<style>
.docs-page { width: 100%; max-width: var(--wl-layout-page-max); margin-inline: auto; padding: var(--wl-space-2xl) var(--wl-layout-page-gutter); color: var(--wl-text); }
.docs-page-header { grid-column: 1; grid-row: 1; }
.docs-layout { display: grid; grid-template-columns: minmax(0, 1fr) 244px; grid-template-rows: auto minmax(0, 1fr); gap: var(--wl-space-2xl); align-items: start; }
.docs-sidebar { grid-column: 2; grid-row: 1 / span 2; min-width: 0; position: sticky; top: var(--wl-playground-header-offset, 80px); max-height: calc(100dvh - var(--wl-playground-header-offset, 80px) - var(--wl-space-xl)); overflow: auto; padding: var(--wl-space-xs) var(--wl-space-xs) var(--wl-space-xs) var(--wl-space-lg); border-inline-start: 1px solid var(--wl-border); }
.docs-sidebar-heading { display: flex; align-items: center; min-height: var(--wl-space-xl); gap: var(--wl-space-sm); margin: 0; color: var(--wl-text); font-size: var(--wl-type-small-size); line-height: var(--wl-type-small-line-height); font-weight: var(--wl-type-label-weight); }
.docs-sidebar-icon { flex: none; color: var(--wl-text-muted); }
.docs-sidebar-mark { display: inline-flex; align-items: center; justify-content: center; flex: none; inline-size: var(--wl-space-xl); block-size: var(--wl-space-xl); }
.docs-sidebar-book { padding: var(--wl-space-xs); border-radius: var(--wl-corner-control); background: var(--wl-accent-soft); }
.docs-sidebar-icon--book { color: var(--wl-text-accent); }
.docs-menu { min-width: 0; }
.docs-menu-summary { display: none; padding: var(--wl-space-md); border: 1px solid var(--wl-border); border-radius: var(--wl-corner-control); color: var(--wl-text); background: var(--wl-bg-soft); font: inherit; cursor: pointer; }
.docs-menu-summary:focus-visible { outline: 2px solid var(--wl-focus-color); outline-offset: 2px; }
.docs-nav-section { min-width: 0; }
.docs-nav-section + .docs-nav-section { border-block-start: 1px solid var(--wl-border); padding-block-start: var(--wl-space-lg); }
.docs-toc-list { margin: var(--wl-space-xs) 0 var(--wl-space-sm); padding: 0; list-style: none; }
.docs-toc-list a { position: relative; display: block; padding: var(--wl-space-xs) var(--wl-space-sm); border-radius: var(--wl-corner-control); color: var(--wl-text-muted); font: var(--wl-type-small-size)/1.5 var(--wl-font); text-decoration: none; overflow-wrap: anywhere; transition: padding-inline-start var(--wl-motion-normal) var(--wl-motion-ease), color var(--wl-motion-fast) var(--wl-motion-ease), background-color var(--wl-motion-fast) var(--wl-motion-ease); }
.docs-toc-indicator { position: absolute; inset-inline-start: var(--wl-space-sm); inset-block-start: var(--wl-space-xs); display: inline-flex; align-items: center; justify-content: center; inline-size: var(--wl-space-sm); block-size: 1.5em; opacity: 0; transform: translateX(calc(-1 * var(--wl-space-2xs))); pointer-events: none; transition: opacity var(--wl-motion-normal) var(--wl-motion-ease), transform var(--wl-motion-normal) var(--wl-motion-ease); }
.docs-toc-list .docs-anchor-link[aria-current="location"] { padding-inline-start: calc(var(--wl-space-sm) * 2); color: var(--wl-text-accent); font-weight: var(--wl-type-label-weight); background: transparent; }
.docs-anchor-link[aria-current="location"] .docs-toc-indicator { opacity: 1; transform: translateX(0); }
.docs-component-outline { margin-block: var(--wl-space-sm); }
.docs-component-header-actions { padding-block-start: var(--wl-space-xs); }
.docs-design-rules { background: var(--wl-bg-soft); }
.docs-toc-list a:hover { color: var(--wl-text-accent); background: var(--wl-bg-soft); }
.docs-toc-list a:focus-visible { outline: 2px solid var(--wl-focus-color); outline-offset: 2px; border-radius: var(--wl-corner-control); }
.docs-catalog { min-width: 0; padding: var(--wl-space-xs); margin-inline: calc(-1 * var(--wl-space-xs)); }
.docs-catalog-group { margin-bottom: var(--wl-space-md); }
.docs-catalog-group + .docs-catalog-group { padding-block-start: var(--wl-space-md); border-block-start: 1px solid var(--wl-border); }
.docs-category-label { margin: 0 0 var(--wl-space-sm); padding-inline: var(--wl-space-sm); color: var(--wl-text); font-size: var(--wl-type-body-size); line-height: var(--wl-type-body-line-height); font-weight: 600; }
.docs-catalog-list { margin: 0; padding: 0; list-style: none; }
.docs-component-link { display: flex; align-items: center; justify-content: space-between; gap: var(--wl-space-sm); width: 100%; min-height: 36px; padding: var(--wl-space-sm); border: 0; border-radius: var(--wl-corner-control); background: transparent; color: var(--wl-text); font: var(--wl-type-small-size)/1.4 var(--wl-font); text-align: left; cursor: pointer; }
.docs-foundation-nav .docs-component-link { min-height: var(--wl-space-2xl); padding-block: calc(var(--wl-space-sm) - var(--wl-space-2xs)); }
.docs-catalog-list .docs-component-link { min-height: 30px; padding: 6px var(--wl-space-sm); line-height: 1.25; }
.docs-component-name { min-width: 0; overflow-wrap: anywhere; }
.docs-component-version { flex: none; color: inherit; font-size: 11px; font-weight: 400; font-variant-numeric: tabular-nums; white-space: nowrap; }
@media (pointer: coarse) { .docs-foundation-nav .docs-component-link, .docs-catalog-list .docs-component-link { min-height: 36px; } }
.docs-quality-link { text-decoration: none; }
.docs-component-link:hover { background: var(--wl-bg-soft); }
.docs-component-link[aria-current="page"] { color: var(--wl-text-accent); background: var(--wl-accent-soft); }
.docs-pilot-mark { padding: 2px var(--wl-space-xs); border-radius: var(--wl-corner-control); color: var(--wl-text-muted); font-size: 10px; }
.docs-content { grid-column: 1; grid-row: 2; min-width: 0; overflow-wrap: anywhere; }
.docs-eyebrow { font-size: var(--wl-type-small-size); color: var(--wl-text-muted); }
.docs-version { font-size: var(--wl-type-small-size); padding: var(--wl-space-xs) var(--wl-space-sm); border: 1px solid var(--wl-border); border-radius: var(--wl-corner-control); color: var(--wl-text-muted); }
.docs-section-links { display: flex; flex-wrap: wrap; gap: var(--wl-space-sm) var(--wl-space-lg); padding-block: var(--wl-space-sm); }
.docs-section-links a, .docs-text-link { color: var(--wl-text-accent); text-underline-offset: 3px; }
.docs-component-link:focus-visible, .docs-section-links a:focus-visible, .docs-text-link:focus-visible { outline: 2px solid var(--wl-focus-color); outline-offset: 2px; }
.docs-overview-section { scroll-margin-top: 90px; min-width: 0; padding-top: var(--wl-space-lg); border-top: 1px solid var(--wl-border); }
.docs-pilot-card { padding: var(--wl-space-xl); background: var(--wl-bg-soft); border: 1px solid var(--wl-border); border-radius: var(--wl-corner-surface); }
.docs-notice { padding: var(--wl-space-lg); border: 1px solid var(--wl-border); border-radius: var(--wl-corner-surface); background: var(--wl-bg-soft); }
.docs-migration-links { display: grid; gap: var(--wl-space-sm); margin: 0; padding-left: var(--wl-space-lg); font-size: var(--wl-type-small-size); }
@media (prefers-reduced-motion: reduce) { .docs-toc-list a, .docs-toc-indicator { transition: none; } }
@media (max-width: 1100px) { .docs-layout { grid-template-columns: minmax(0, 1fr) 224px; gap: var(--wl-space-xl); } }
@media (max-width: 760px) { .docs-page { padding-block: var(--wl-space-xl); } .docs-layout { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto auto auto; gap: var(--wl-space-xl); } .docs-sidebar { grid-column: 1; grid-row: 2; position: static; max-height: none; overflow: visible; padding: 0; border-inline-start: 0; } .docs-content { grid-column: 1; grid-row: 3; } .docs-menu-summary { display: list-item; list-style-position: inside; } .docs-menu-content { max-height: 65dvh; overflow: auto; padding: var(--wl-space-lg) var(--wl-space-xs) var(--wl-space-xs); } .docs-catalog { max-height: none; min-height: 0; } }
</style>
