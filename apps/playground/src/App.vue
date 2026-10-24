<script setup lang="ts">
import type { DocumentationSearchEntry } from "./documentation/search";
import type * as DocumentationSearchModule from "./documentation/search";
import { createPlaygroundLocaleUrl, ensurePlaygroundMessages, parsePlaygroundLocale, playgroundLocale, type PlaygroundLocale, preparePlaygroundPage, setPlaygroundLocale, usePlaygroundI18n } from "./i18n";
import { updatePlaygroundSeo } from "./seo";
const { t, locale } = usePlaygroundI18n();
import type { WlCommandPaletteGroup, WlCommandPaletteItem, WlThemeName } from "gavia-ui";
import { WlButton } from "gavia-ui";
import { useWlTheme } from "gavia-ui/composables";
import { computed, defineAsyncComponent, inject, nextTick, onBeforeUnmount, onMounted, provide, ref, shallowRef, watch } from "vue";
import { routerKey } from "vue-router";
import gaviaMarkUrl from "../../../docs/brand/gavia-ui-mark-lake.svg";
import { createPlaygroundNavigationUrl as createPlaygroundUrl, type DocumentationSection, isDocumentationSection, parsePlaygroundRoute, type PlaygroundRoute, type PlaygroundView } from "./navigation";
import { playgroundPageLoaders, preloadPlaygroundPage } from "./page-loaders";
import { playgroundNavigationKey } from "./playground-navigation";
import PlaygroundHeader from "./PlaygroundHeader.vue";
import { savePlaygroundPreference } from "./preferences";
import FontDownloadLink from "./project/FontDownloadLink.vue";
import { gaviaProjectInfo as project } from "./project/project-info";
import { createPlaygroundThemeTransition } from "./theme-transition";
import { createPlaygroundThemeUrl, getPlaygroundThemeToggleTarget, isPlaygroundTheme, isPlaygroundThemePreference, parsePlaygroundThemePreference, playgroundThemeOptions, playgroundThemePair, playgroundThemePreference, type PlaygroundThemePreference, resolvePlaygroundTheme } from "./themes";
import { createPageAnchorRestorer, pageAnchorRestorerKey } from "./usePageAnchor";
const WlCommandPalette = defineAsyncComponent(() => import("gavia-ui").then((module) => module.WlCommandPalette));
const WlToast = defineAsyncComponent(() => import("gavia-ui").then((module) => module.WlToast));
const WlConfirmDialog = defineAsyncComponent(() => import("gavia-ui").then((module) => module.WlConfirmDialog));
const HomePage = defineAsyncComponent(playgroundPageLoaders.home);
const DocsPage = defineAsyncComponent(playgroundPageLoaders.docs);
const DesignSystem = defineAsyncComponent(playgroundPageLoaders.system);
const ProjectInfo = defineAsyncComponent(playgroundPageLoaders.project);
const ThemeBuilderPage = defineAsyncComponent(playgroundPageLoaders["theme-builder"]);
const FontPage = defineAsyncComponent(playgroundPageLoaders.font);
const headerElement = ref<HTMLElement | null>(null);
let restoreScrollPadding: (() => void) | undefined;
const pageAnchor = createPageAnchorRestorer();
provide(pageAnchorRestorerKey, pageAnchor);
let appMounted = false;
const themeTransition = createPlaygroundThemeTransition();
const router = inject(routerKey, undefined);
let ownedRouterWrites = 0;
let stopRouter: (() => void) | undefined;
async function writeLocation(url: URL, replace = false): Promise<void> {
  if (!router) {
    window.history[replace ? "replaceState" : "pushState"](null, "", url);
    return;
  }
  ownedRouterWrites++;
  try {
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    const path = url.pathname.slice(base.length) + url.search + url.hash;
    await router[replace ? "replace" : "push"](path);
  } finally { ownedRouterWrites--; }
}
function cancelHistoryAnchor(): void {
  pageAnchor.cancel();
}
function restorePageAnchor(route: PlaygroundRoute, href: string, revision: number, id?: string): void {
  pageAnchor.restore({
    id,
    href,
    scope: route.view === "docs" ? ".docs-content" : route.view === "font" ? ".wl-type-page" : route.view === "system" ? ".ds-main" : undefined,
    isCurrent: () => appMounted && navigationRevision === revision && activeRoute.value === route
  });
}
function routeFromLocation(): PlaygroundRoute {
  return parsePlaygroundRoute(typeof window === "undefined" ? "" : window.location.search, typeof window === "undefined" ? "" : window.location.hash, typeof window === "undefined" ? "" : window.location.pathname);
}
const activeRoute = ref<PlaygroundRoute>(routeFromLocation());
const activeView = computed(() => activeRoute.value.view);
// The shortcut demonstration owns Ctrl K; the header search still opens by click.
const globalSearchShortcut = computed(() => !(activeRoute.value.view === "docs" && activeRoute.value.component === "WlCommandPalette"));
const catalogRetry = shallowRef<(() => Promise<void>) | undefined>();
const pageLoading = ref(false);
let pageLoadingTimer: ReturnType<typeof setTimeout> | undefined;
let navigationRevision = 0;
function beginPageLoad(revision: number): void {
  clearTimeout(pageLoadingTimer);
  pageLoading.value = false;
  catalogRetry.value = undefined;
  // Cached routes should not flash a loader or interrupt screen-reader speech.
  pageLoadingTimer = setTimeout(() => {
    if (appMounted && revision === navigationRevision) pageLoading.value = true;
  }, 150);
}
function endPageLoad(revision: number): void {
  if (revision !== navigationRevision) return;
  clearTimeout(pageLoadingTimer);
  pageLoading.value = false;
}
async function readView(): Promise<void> {
  const revision = ++navigationRevision;
  beginPageLoad(revision);
  cancelPendingThemeChange();
  cancelHistoryAnchor();
  const requestedRoute = routeFromLocation();
  const requestedLocale = parsePlaygroundLocale(window.location.search);
  try {
    const [prepared] = await Promise.all([
      preparePlaygroundPage(requestedRoute.view, requestedLocale), preloadPlaygroundPage(requestedRoute.view)
    ]);
    if (!prepared || !appMounted || revision !== navigationRevision) return;
    if (!await setPlaygroundLocale(requestedLocale) || revision !== navigationRevision) return;
    catalogRetry.value = undefined;
  } catch {
    if (appMounted && revision === navigationRevision) catalogRetry.value = readView;
    return;
  } finally {
    endPageLoad(revision);
  }
  activeRoute.value = routeFromLocation();
  themePreference.value = parsePlaygroundThemePreference(window.location.search);
  const locationTheme = currentResolvedTheme();
  classicLightTheme = rememberClassicLightTheme(locationTheme, theme.value, classicLightTheme);
  requestedTheme = locationTheme;
  requestedThemePreference = themePreference.value;
  requestedClassicLightTheme = classicLightTheme;
  theme.value = locationTheme;
  // Back/Forward can change an asynchronous page before restoring its anchor.
  if (!["home", "docs", "font", "system", "project"].includes(activeRoute.value.view)) return;
  const route = activeRoute.value;
  const hash = window.location.hash;
  const href = window.location.href;
  if (!hash) return;
  let id: string;
  try {
    id = decodeURIComponent(hash.slice(1));
  } catch {
    return;
  }
  void nextTick(() => {
    if (!appMounted || navigationRevision !== revision
      || window.location.href !== href || activeRoute.value !== route) return;
    // The controller waits for initial document/font readiness, then aligns the current target.
    restorePageAnchor(route, href, revision, id);
  });
}
async function navigate(route: PlaygroundRoute, anchor?: string): Promise<void> {
  const revision = ++navigationRevision;
  beginPageLoad(revision);
  cancelPendingThemeChange();
  cancelHistoryAnchor();
  try {
    const [prepared] = await Promise.all([preparePlaygroundPage(route.view), preloadPlaygroundPage(route.view)]);
    if (!prepared || !appMounted || revision !== navigationRevision) return;
    catalogRetry.value = undefined;
  } catch {
    if (appMounted && revision === navigationRevision) catalogRetry.value = () => navigate(route, anchor);
    return;
  } finally {
    endPageLoad(revision);
  }
  const url = createPlaygroundUrl(new URL(window.location.href), route);
  if (anchor) url.hash = anchor;
  activeRoute.value = parsePlaygroundRoute(url.search, url.hash, url.pathname);
  const navigationRoute = activeRoute.value;
  if (url.href !== window.location.href) await writeLocation(url);
  await nextTick();
  if (!appMounted || navigationRevision !== revision
    || activeRoute.value !== navigationRoute || window.location.href !== url.href) return;
  restorePageAnchor(navigationRoute, url.href, revision, anchor);
}
function showView(view: PlaygroundView): Promise<void> {
  return navigate({ view });
}
function openDocs(component?: string): Promise<void> {
  return navigate({ view: "docs", component });
}
function openDocsSection(section?: DocumentationSection): Promise<void> {
  return navigate({ view: "docs", section });
}
function openQualityLink(event: MouseEvent): void {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  void openDocsSection("quality");
}
function qualityRouteHref(): string {
  const current = new URL(typeof window === "undefined" ? "https://whitewolf06.github.io/gavia-ui/" : window.location.href);
  const target = createPlaygroundThemeUrl(createPlaygroundUrl(current, { view: "docs", section: "quality" }), themePreference.value);
  return target.pathname + target.search + target.hash;
}
function openDocsCatalog(): Promise<void> {
  return navigate({ view: "docs" }, "docs-components");
}
function openDocsOverview(anchor: string): Promise<void> {
  return navigate({ view: "docs" }, anchor);
}
function openDocsAnchor(anchor: string): Promise<void> {
  return navigate({ view: "docs", component: activeRoute.value.component, section: activeRoute.value.section }, anchor);
}
async function readInitialView(): Promise<void> {
  const revision = ++navigationRevision;
  const route = activeRoute.value;
  // A history traversal can change the URL while startup modules are loading.
  // Explicit visit preferences win over the refs captured before that traversal.
  const initialUrl = new URL(window.location.href);
  const initialTheme = initialUrl.searchParams.get("theme");
  const preferenceUrl = createPlaygroundUrl(
    createPlaygroundLocaleUrl(
      createPlaygroundThemeUrl(initialUrl, isPlaygroundThemePreference(initialTheme) ? initialTheme : themePreference.value),
      parsePlaygroundLocale(initialUrl.search, initialUrl.pathname)
    ),
    route
  );
  preferenceUrl.hash = initialUrl.hash;
  try {
    if (preferenceUrl.href !== window.location.href) await writeLocation(preferenceUrl, true);
  } catch {
    if (appMounted && navigationRevision === revision && activeRoute.value === route) catalogRetry.value = readInitialView;
    return;
  }
  if (!appMounted || navigationRevision !== revision || activeRoute.value !== route
    || window.location.href !== preferenceUrl.href) return;
  await readView();
}
onMounted(() => {
  appMounted = true;
  void readInitialView();
  if (router) stopRouter = router.afterEach(() => {
    if (!ownedRouterWrites) void readView();
  });
  else window.addEventListener("popstate", readView);
  const rootStyle = document.documentElement.style;
  const previous = rootStyle.scrollPaddingTop;
  const previousHeaderOffset = rootStyle.getPropertyValue("--wl-playground-header-offset");
  const update = () => {
    const offset = String((headerElement.value?.offsetHeight ?? 60) + 16) + "px";
    rootStyle.scrollPaddingTop = offset;
    rootStyle.setProperty("--wl-playground-header-offset", offset);
  };
  const observer = new ResizeObserver(update);
  if (headerElement.value) observer.observe(headerElement.value);
  update();
  restoreScrollPadding = () => {
    observer.disconnect();
    rootStyle.scrollPaddingTop = previous;
    if (previousHeaderOffset) rootStyle.setProperty("--wl-playground-header-offset", previousHeaderOffset);
    else rootStyle.removeProperty("--wl-playground-header-offset");
  };
});
onBeforeUnmount(() => {
  appMounted = false;
  navigationRevision++;
  clearTimeout(pageLoadingTimer);
  cancelHistoryAnchor();
  themeTransition.dispose();
  stopRouter?.();
  window.removeEventListener("popstate", readView);
  restoreScrollPadding?.();
});
const commandPaletteVisible = ref(false);
const commandPaletteQuery = ref("");
const searchEntries = shallowRef<DocumentationSearchEntry[]>([]);
const searchModule = shallowRef<typeof DocumentationSearchModule>();
const commandPaletteGroups = computed<WlCommandPaletteGroup[]>(() => [
  {
    id: "pages",
    label: t("shell.App.text1"),
    showWhenEmpty: true,
    items: [
      {
        id: "page-home",
        label: t("shell.App.text2"),
        description: t("shell.App.text3"),
        icon: "home",
        keywords: [t("shell.App.text4"), t("shell.App.text5")],
        data: { view: "home" }
      },
      {
        id: "page-docs",
        label: t("shell.App.text6"),
        description: t("shell.App.text7"),
        icon: "file",
        keywords: ["docs", t("shell.App.text8"), "api", t("shell.App.text9")],
        data: { view: "docs" }
      },
      {
        id: "page-components",
        label: t("shell.App.text10"),
        description: t("shell.App.text11"),
        icon: "file",
        keywords: [t("shell.App.text12"), t("shell.App.text13")],
        data: { catalog: true }
      },
      {
        id: "page-quality",
        label: t("shell.App.text14"),
        description: t("shell.App.text15"),
        icon: "check",
        keywords: ["quality", "coverage", t("shell.App.text16"), t("shell.App.text17"), t("shell.App.text18"), "ssr", t("shell.App.text19")],
        data: { view: "docs", section: "quality" }
      },
      {
        id: "page-font",
        label: t("shell.App.text20"),
        description: t("shell.App.text21"),
        icon: "book",
        keywords: ["font", t("shell.App.text22"), t("shell.App.text23"), t("shell.App.text24"), t("shell.App.text25")],
        data: { view: "font" }
      },
      {
        id: "page-design-system",
        label: t("shell.App.text26"),
        description: t("shell.App.text27"),
        icon: "image",
        keywords: [t("shell.App.text28"), t("shell.App.text29"), t("shell.App.text30")],
        data: { view: "system" }
      },
      {
        id: "page-colors",
        label: t("shell.App.text31"),
        description: t("shell.App.text32"),
        icon: "image",
        keywords: [t("shell.App.text33"), t("shell.App.text34"), t("shell.App.text35")],
        data: { view: "docs", section: "colors" }
      },
      {
        id: "page-icons",
        label: t("shell.App.text36"),
        description: t("shell.App.text37"),
        icon: "image",
        keywords: ["svg", t("shell.App.text38"), t("shell.App.text39"), "icons"],
        data: { view: "docs", section: "icons" }
      },
      {
        id: "page-theme-builder",
        label: t("shell.App.text40"),
        description: t("shell.App.text41"),
        icon: "sliders-h",
        keywords: [t("shell.App.text42"), t("shell.App.text43"), "theme", t("shell.App.text44")],
        data: { view: "theme-builder" }
      },
      {
        id: "page-project",
        label: "Changelog",
        description: t("shell.App.text45"),
        icon: "history",
        keywords: [t("shell.App.text46"), t("shell.App.text47"), t("shell.App.text48"), "changelog"],
        data: { view: "project" }
      }
    ]
  },
  {
    id: "documentation",
    label: locale.value === "ru" ? "Документация" : "Documentation",
    showWhenEmpty: false,
    filter: false,
    items: (searchModule.value?.searchDocumentation(searchEntries.value, commandPaletteQuery.value) ?? []).map((entry) => ({
      id: `document-${entry.id}`,
      label: entry.title,
      description: entry.description,
      icon: "file",
      href: entry.href,
      data: entry.component ? { component: entry.component } : entry.section ? { view: "docs", section: entry.section } : undefined
    }))
  }
]);

async function chooseLocale(value: PlaygroundLocale): Promise<void> {
  const revision = ++navigationRevision;
  beginPageLoad(revision);
  cancelPendingThemeChange();
  try {
    if (!await setPlaygroundLocale(value) || !appMounted || revision !== navigationRevision) return;
    catalogRetry.value = undefined;
  } catch {
    if (appMounted && revision === navigationRevision) catalogRetry.value = () => chooseLocale(value);
    return;
  } finally {
    endPageLoad(revision);
  }
  const target = createPlaygroundUrl(createPlaygroundLocaleUrl(new URL(window.location.href), value), activeRoute.value);
  target.hash = window.location.hash;
  if (target.href !== window.location.href) await writeLocation(target);
  savePlaygroundPreference("locale", value);
}
let commandPaletteRevision = 0;
async function setCommandPaletteVisible(value: boolean): Promise<void> {
  const revision = ++commandPaletteRevision;
  if (!value) {
    commandPaletteVisible.value = false;
    return;
  }
  try {
    await ensurePlaygroundMessages(["documentation"]);
    const search = await import("./documentation/search");
    const entries = await search.loadDocumentationSearch(playgroundLocale.value);
    if (revision !== commandPaletteRevision) return;
    searchModule.value = search;
    searchEntries.value = entries;
    commandPaletteVisible.value = true;
    catalogRetry.value = undefined;
  } catch { catalogRetry.value = () => setCommandPaletteVisible(value); }
}
watch([activeRoute, playgroundLocale], () => updatePlaygroundSeo(activeRoute.value), { immediate: true });

async function onCommandPaletteSelect(item: WlCommandPaletteItem): Promise<void> {
  const data = item.data as { component?: string; catalog?: boolean; view?: PlaygroundView; section?: DocumentationSection } | undefined;
  if (data?.component) await openDocs(data.component);
  else if (data?.catalog) await openDocsCatalog();
  else if (data?.view === "docs" && isDocumentationSection(data.section)) await openDocsSection(data.section);
  else if (data?.view) await showView(data.view);
}
const themePreference = playgroundThemePreference;
const themeController = useWlTheme({
  themes: () => playgroundThemePair(themePreference.value),
  preference: "system",
  target: () => null
});
const theme = ref<WlThemeName>(resolvePlaygroundTheme(themePreference.value));
provide(playgroundNavigationKey, { navigate, theme, themePreference });
const themeOptions = computed(() => [{ value: "system", label: t("shell.theme.system") }, ...playgroundThemeOptions]);
let classicLightTheme: "white" | "newspaper" = "white";
let requestedTheme = theme.value;
let requestedThemePreference = themePreference.value;
let requestedClassicLightTheme: "white" | "newspaper" = classicLightTheme;

function rememberClassicLightTheme(value: WlThemeName, previous: WlThemeName, remembered: "white" | "newspaper"): "white" | "newspaper" {
  if (value === "newspaper") return "newspaper";
  if (value === previous) return remembered;
  return value === "graphite" && previous === "newspaper" ? remembered : "white";
}
function cancelPendingThemeChange(): void {
  themeTransition.cancel();
  requestedTheme = theme.value;
  requestedThemePreference = themePreference.value;
  requestedClassicLightTheme = classicLightTheme;
}
function toggleThemeVariant(): void {
  chooseTheme(getPlaygroundThemeToggleTarget(requestedTheme, requestedClassicLightTheme));
}
function currentResolvedTheme(): WlThemeName {
  const value = themeController.theme.value;
  return isPlaygroundTheme(value) ? value : "gavia";
}
function syncSystemTheme(): void {
  if (themePreference.value !== "system" || requestedThemePreference !== "system") return;
  cancelPendingThemeChange();
  theme.value = currentResolvedTheme();
  requestedTheme = theme.value;
}
watch(themeController.resolved, syncSystemTheme, { flush: "sync" });
function updateThemeUrl(value: PlaygroundThemePreference): void {
  const url = createPlaygroundThemeUrl(new URL(window.location.href), value);
  if (url.href !== window.location.href) void writeLocation(url, true);
}
function chooseTheme(value: unknown): void {
  if (!isPlaygroundThemePreference(value)) return;
  const resolvedTheme = resolvePlaygroundTheme(value, themeController.resolved.value === "dark");
  if (requestedTheme === resolvedTheme && requestedThemePreference === value) {
    // Do not write a pending theme into the URL before its guarded DOM update.
    if (theme.value === resolvedTheme && themePreference.value === value) {
      updateThemeUrl(value);
      savePlaygroundPreference("theme", value);
    }
    return;
  }
  requestedClassicLightTheme = rememberClassicLightTheme(resolvedTheme, requestedTheme, requestedClassicLightTheme);
  requestedTheme = resolvedTheme;
  requestedThemePreference = value;
  const nextClassicLightTheme = requestedClassicLightTheme;
  themeTransition.run(async () => {
    classicLightTheme = nextClassicLightTheme;
    themePreference.value = value;
    // Re-read the OS preference if it changed while the snapshot was captured.
    theme.value = currentResolvedTheme();
    requestedTheme = theme.value;
    updateThemeUrl(value);
    savePlaygroundPreference("theme", value);
    // Native capture must see Vue's updated hero layers, icon and header selector.
    await nextTick();
  });
}
watch(theme, (value) => {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.wlTheme = value;
  document.documentElement.style.colorScheme = value === "gavia-dark" || value === "graphite" ? "dark" : "light";
}, { immediate: true, flush: "sync" });
</script>

<template>
  <header ref="headerElement" class="pg-top">
    <PlaygroundHeader
      :active-view="activeView"
      :route="activeRoute"
      :theme="theme"
      :theme-preference="themePreference"
      :theme-options="themeOptions"
      :version="project.version"
      :logo="gaviaMarkUrl"
      @navigate="showView"
      @locale="chooseLocale"
      @theme="chooseTheme"
      @search="setCommandPaletteVisible(true)"
    />
    <div v-if="pageLoading" class="pg-page-loading" role="status">
      <span class="pg-page-loading-track" aria-hidden="true"></span>
      <span class="pg-page-loading-label">{{ t('shell.page.loading') }}</span>
    </div>
  </header>
  <WlCommandPalette
    v-model:query="commandPaletteQuery"
    :visible="commandPaletteVisible"
    :groups="commandPaletteGroups"
    :shortcut="globalSearchShortcut"
    @update:visible="setCommandPaletteVisible"
    @select="onCommandPaletteSelect"
  >
    <template #footer>{{ t('shell.App.text50') }}</template>
  </WlCommandPalette>
  <div
    v-if="catalogRetry"
    class="pg-page-error wl-container wl-inline"
    role="alert"
    data-space="sm"
  >
    <p>{{ t('shell.catalog.error') }}</p>
    <WlButton size="sm" variant="ghost" @click="catalogRetry()">{{ t('shell.code.retry') }}</WlButton>
  </div>
  <HomePage
    v-if="activeView === 'home'"
    :key="locale"
    :theme="theme"
    @route="navigate"
    @navigate="showView"
    @component="openDocs"
    @catalog="openDocsCatalog"
    @quality="openDocsSection('quality')"
    @toggle-theme="toggleThemeVariant"
  />
  <DocsPage
    v-else-if="activeView === 'docs'"
    :key="locale"
    :component="activeRoute.component"
    :section="activeRoute.section"
    :theme="theme"
    @section="openDocsSection"
    @component="openDocs"
    @overview="openDocsOverview"
    @anchor="openDocsAnchor"
    @navigate="showView"
  />
  <FontPage
    v-else-if="activeView === 'font'"
    :key="locale"
    :theme="theme"
    @navigate="showView"
  />
  <DesignSystem
    v-else-if="activeView === 'system'"
    :key="locale"
    :theme="theme"
    @component="openDocs"
  />
  <ThemeBuilderPage v-else-if="activeView === 'theme-builder'" :key="locale" :theme="theme" />
  <ProjectInfo v-else-if="activeView === 'project'" :key="locale" />
  <footer class="pg-footer">
    <span>Gavia UI · v{{ project.version }} · <a :href="project.licenseUrl">MIT</a></span>
    <span>{{ t('shell.App.text51') }} <a :href="project.author.url">{{ t('shell.author.name') }}</a></span>
    <a :href="project.repositoryUrl">GitHub</a>
    <a :href="qualityRouteHref()" @click="openQualityLink">{{ t('shell.App.text52') }}</a>
    <FontDownloadLink variant="secondary">{{ t('shell.App.text53') }}</FontDownloadLink>
  </footer>
  <WlToast />
  <WlConfirmDialog />
</template>

<style>
.pg-top { border-bottom: 1px solid var(--wl-border); position: sticky; top: 0; background: var(--wl-bg); z-index: var(--wl-layer-sticky); }
.pg-page-loading {
  position: absolute;
  inset: auto 0 -2px;
  height: 2px;
  overflow: visible;
  pointer-events: none;
}
.pg-page-loading-track { display: block; height: 100%; overflow: hidden; background: var(--wl-border); }
.pg-page-loading-track::after {
  content: "";
  display: block;
  width: 35%;
  height: 100%;
  background: var(--wl-text-accent);
  animation: pg-page-loading 1.2s ease-in-out infinite;
}
.pg-page-loading-label {
  position: absolute;
  top: 14px;
  right: 24px;
  padding: 8px 14px;
  border: 1px solid var(--wl-border);
  border-radius: 24px;
  background: var(--wl-bg);
  color: var(--wl-text-2);
  box-shadow: 0 4px 16px rgb(0 0 0 / 6%);
  font-size: var(--wl-type-small-size);
}
.pg-page-error { padding-block: 16px; }
@keyframes pg-page-loading {
  from { transform: translateX(-100%); }
  to { transform: translateX(385%); }
}
@media (prefers-reduced-motion: reduce) {
  .pg-page-loading-track::after { width: 100%; animation: none; }
}
.pg-footer {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px 24px;
  padding: 24px;
  border-top: 1px solid var(--wl-border);
  color: var(--wl-text-2);
  font-size: var(--wl-type-small-size);
}
.pg-footer a { color: var(--wl-text-accent); text-underline-offset: 3px; }
.pg-footer a:focus-visible { outline: 2px solid var(--wl-focus-color); outline-offset: 3px; }
/* Temporary suppression prevents component transitions leaking into the snapshot. */
html[data-wl-playground-theme-transition="native"] :where(body, body *),
html[data-wl-playground-theme-transition="native"] :where(body, body *)::before,
html[data-wl-playground-theme-transition="native"] :where(body, body *)::after {
  transition: none;
}
/* Older browsers retain only the hero image/symbol crossfade during the update. */
html[data-wl-playground-theme-transition="instant"] :where(body, body *):not(.home-hero-layer--night, .home-theme-sun, .home-theme-moon),
html[data-wl-playground-theme-transition="instant"] :where(body, body *)::before,
html[data-wl-playground-theme-transition="instant"] :where(body, body *)::after {
  transition: none;
}
html[data-wl-playground-theme-transition="native"]::view-transition,
html[data-wl-playground-theme-transition="native"]::view-transition-group(*),
html[data-wl-playground-theme-transition="native"]::view-transition-image-pair(*),
html[data-wl-playground-theme-transition="native"]::view-transition-old(*),
html[data-wl-playground-theme-transition="native"]::view-transition-new(*) {
  pointer-events: none;
}
html[data-wl-playground-theme-transition="native"]::view-transition-group(root) {
  animation: none;
}
html[data-wl-playground-theme-transition="native"]::view-transition-image-pair(root) {
  isolation: isolate;
}
html[data-wl-playground-theme-transition="native"]::view-transition-old(root) {
  animation: none;
  opacity: 1;
  mix-blend-mode: normal;
}
html[data-wl-playground-theme-transition="native"]::view-transition-new(root) {
  animation: wl-playground-theme-in calc(var(--wl-motion-slow) * 2.5) ease-in-out both;
  mix-blend-mode: normal;
}
@keyframes wl-playground-theme-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  html[data-wl-playground-theme-transition="native"]::view-transition-new(root) {
    animation: none;
  }
}
</style>
