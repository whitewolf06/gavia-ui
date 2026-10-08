<script setup lang="ts">
import { computed, defineAsyncComponent, nextTick, onBeforeUnmount, onMounted, provide, ref, watch } from "vue";
import { createPlaygroundUrl, isDocumentationSection, parsePlaygroundRoute, type DocumentationSection, type PlaygroundRoute, type PlaygroundView } from "./navigation";
import { wlManifest } from "../../../packages/ui-kit/src/manifest";
import type { WlCommandPaletteGroup, WlCommandPaletteItem, WlThemeName } from "../../../packages/ui-kit/src";
import PlaygroundHeader from "./PlaygroundHeader.vue";
import FontDownloadLink from "./project/FontDownloadLink.vue";
import { playgroundNavigationKey } from "./playground-navigation";
import { createPlaygroundThemeUrl, getPlaygroundThemeToggleTarget, isPlaygroundTheme, parsePlaygroundTheme, playgroundThemeOptions } from "./themes";
import { createPlaygroundThemeTransition } from "./theme-transition";
import gaviaMarkUrl from "../../../docs/brand/gavia-ui-mark-v2.png";
import { gaviaProjectInfo as project } from "./project/project-info";
const WlCommandPalette = defineAsyncComponent(() => import("../../../packages/ui-kit/src/components/WlCommandPalette.vue"));
const WlToast = defineAsyncComponent(() => import("../../../packages/ui-kit/src/components/WlToast.vue"));
const WlConfirmDialog = defineAsyncComponent(() => import("../../../packages/ui-kit/src/components/WlConfirmDialog.vue"));
const HomePage = defineAsyncComponent(() => import("./HomePage.vue"));
const DocsPage = defineAsyncComponent(() => import("./DocsPage.vue"));
const DesignSystem = defineAsyncComponent(() => import("./DesignSystem.vue"));
const ProjectInfo = defineAsyncComponent(() => import("./ProjectInfo.vue"));
const ThemeBuilderPage = defineAsyncComponent(() => import("./ThemeBuilderPage.vue"));
const FontPage = defineAsyncComponent(() => import("./type-study/GaviaTypeStudy.vue"));
const headerElement = ref<HTMLElement | null>(null);
let restoreScrollPadding: (() => void) | undefined;
let historyAnchorFrame: number | undefined;
let appMounted = false;
const themeTransition = createPlaygroundThemeTransition();
function cancelHistoryAnchor(): void {
  if (historyAnchorFrame !== undefined) window.cancelAnimationFrame(historyAnchorFrame);
  historyAnchorFrame = undefined;
}
function routeFromLocation(): PlaygroundRoute {
  return parsePlaygroundRoute(typeof window === "undefined" ? "" : window.location.search, typeof window === "undefined" ? "" : window.location.hash);
}
const activeRoute = ref<PlaygroundRoute>(routeFromLocation());
const activeView = computed(() => activeRoute.value.view);
// The shortcut demonstration owns Ctrl K; the header search still opens by click.
const globalSearchShortcut = computed(() => !(activeRoute.value.view === "docs" && activeRoute.value.component === "WlCommandPalette"));
function readView(): void {
  cancelPendingThemeChange();
  cancelHistoryAnchor();
  activeRoute.value = routeFromLocation();
  const locationTheme = parsePlaygroundTheme(window.location.search);
  classicLightTheme = rememberClassicLightTheme(locationTheme, theme.value, classicLightTheme);
  requestedTheme = locationTheme;
  requestedClassicLightTheme = classicLightTheme;
  theme.value = locationTheme;
  // Back/Forward can change an asynchronous page before restoring its anchor.
  if (activeRoute.value.view !== "docs" && activeRoute.value.view !== "font") return;
  const route = activeRoute.value;
  const hash = window.location.hash;
  if (!hash) return;
  let id: string;
  try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
  void nextTick(() => {
    if (!appMounted || window.location.hash !== hash || activeRoute.value !== route) return;
    // Native persisted-scroll restoration follows popstate; align after that step.
    historyAnchorFrame = window.requestAnimationFrame(() => {
      historyAnchorFrame = undefined;
      if (!appMounted || window.location.hash !== hash || activeRoute.value !== route) return;
      const target = document.getElementById(id);
      const pageSelector = route.view === "font" ? ".wl-type-page" : ".docs-content";
      if (target?.closest(pageSelector)) target.scrollIntoView({ block: "start", behavior: "instant" });
    });
  });
}
async function navigate(route: PlaygroundRoute, anchor?: string): Promise<void> {
  cancelPendingThemeChange();
  cancelHistoryAnchor();
  const url = createPlaygroundUrl(new URL(window.location.href), route);
  if (anchor) url.hash = anchor;
  activeRoute.value = parsePlaygroundRoute(url.search, url.hash);
  const navigationRoute = activeRoute.value;
  if (url.href !== window.location.href) window.history.pushState(null, "", url);
  await nextTick();
  if (activeRoute.value !== navigationRoute || window.location.href !== url.href) return;
  const target = anchor ? document.getElementById(anchor) : null;
  if (target) target.scrollIntoView({ block: "start" });
  else window.scrollTo({ top: 0 });
}
function showView(view: PlaygroundView): Promise<void> { return navigate({ view }); }
function openDocs(component?: string): Promise<void> { return navigate({ view: "docs", component }); }
function openDocsSection(section?: DocumentationSection): Promise<void> { return navigate({ view: "docs", section }); }
function openQualityLink(event: MouseEvent): void {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  void openDocsSection("quality");
}
function qualityRouteHref(): string {
  const current = new URL(typeof window === "undefined" ? "https://whitewolf06.github.io/gavia-ui/" : window.location.href);
  return createPlaygroundThemeUrl(createPlaygroundUrl(current, { view: "docs", section: "quality" }), theme.value).href;
}
function openDocsCatalog(): Promise<void> { return navigate({ view: "docs" }, "docs-components"); }
function openDocsOverview(anchor: string): Promise<void> { return navigate({ view: "docs" }, anchor); }
onMounted(() => {
  appMounted = true;
  readView();
  if (new URLSearchParams(window.location.search).get("view") === "components") {
    window.history.replaceState(null, "", createPlaygroundUrl(new URL(window.location.href), activeRoute.value));
  }
  window.addEventListener("popstate", readView);
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
  cancelHistoryAnchor();
  themeTransition.dispose();
  window.removeEventListener("popstate", readView);
  restoreScrollPadding?.();
});
const commandPaletteVisible = ref(false);
const commandPaletteQuery = ref("");
const commandPaletteGroups: WlCommandPaletteGroup[] = [
  {
    id: "pages",
    label: "Быстрые переходы",
    showWhenEmpty: true,
    items: [
      {
        id: "page-home",
        label: "Главная Gavia UI",
        description: "Установка, версия и разделы библиотеки",
        icon: "home",
        keywords: ["начало", "установка"],
        data: { view: "home" }
      },
      {
        id: "page-docs",
        label: "Документация",
        description: "Компоненты, API и интерактивные примеры",
        icon: "file",
        keywords: ["docs", "параметры", "api", "код"],
        data: { view: "docs" }
      },
      {
        id: "page-components",
        label: "Все компоненты",
        description: "Примеры и API всех компонентов",
        icon: "file",
        keywords: ["страницы", "каталог"],
        data: { catalog: true }
      },
      {
        id: "page-quality",
        label: "Качество и совместимость",
        description: "Тесты, покрытие, браузеры и поддержка Vue",
        icon: "check",
        keywords: ["quality", "coverage", "тесты", "проверки", "доступность", "ssr", "совместимость"],
        data: { view: "docs", section: "quality" }
      },
      {
        id: "page-font",
        label: "Шрифт Gavia Sans",
        description: "Гарнитура 0.6: шесть весов, курсив, кириллица и латиница",
        icon: "book",
        keywords: ["font", "шрифт", "цифры", "начертания", "типографика"],
        data: { view: "font" }
      },
      {
        id: "page-design-system",
        label: "Дизайн-система",
        description: "Основы, типографика, токены и паттерны",
        icon: "image",
        keywords: ["правила", "стиль", "дизайн"],
        data: { view: "system" }
      },
      {
        id: "page-colors",
        label: "Цвета и токены",
        description: "Семантические цвета и подключение пяти тем",
        icon: "image",
        keywords: ["страницы", "тема", "палитра"],
        data: { view: "docs", section: "colors" }
      },
      {
        id: "page-icons",
        label: "Иконки",
        description: "Полный SVG-каталог, размеры и доступность",
        icon: "image",
        keywords: ["svg", "иконография", "каталог", "icons"],
        data: { view: "docs", section: "icons" }
      },
      {
        id: "page-theme-builder",
        label: "Подбор темы",
        description: "Цвета темы, примеры компонентов и экспорт настроек",
        icon: "sliders-h",
        keywords: ["редактор", "цвет", "theme", "палитра"],
        data: { view: "theme-builder" }
      },
      {
        id: "page-project",
        label: "Changelog",
        description: "Версии, исправления и заметки по обновлению",
        icon: "history",
        keywords: ["версия", "история", "изменения", "changelog"],
        data: { view: "project" }
      }
    ]
  },
  {
    id: "components",
    label: "Компоненты",
    showWhenEmpty: false,
    items: wlManifest.map((entry) => ({
      id: `component-${entry.name}`,
      label: entry.name,
      description: entry.description,
      icon: "file",
      keywords: [entry.category, entry.introducedIn],
      data: { component: entry.name }
    }))
  }
];

async function onCommandPaletteSelect(item: WlCommandPaletteItem): Promise<void> {
  const data = item.data as { component?: string; catalog?: boolean; view?: PlaygroundView; section?: DocumentationSection } | undefined;
  if (data?.component) await openDocs(data.component);
  else if (data?.catalog) await openDocsCatalog();
  else if (data?.view === "docs" && isDocumentationSection(data.section)) await openDocsSection(data.section);
  else if (data?.view) await showView(data.view);
}
const theme = ref<WlThemeName>(parsePlaygroundTheme(typeof window === "undefined" ? "" : window.location.search));
provide(playgroundNavigationKey, { navigate, theme });
const themeOptions = playgroundThemeOptions;
let classicLightTheme: "white" | "newspaper" = "white";
let requestedTheme = theme.value;
let requestedClassicLightTheme: "white" | "newspaper" = classicLightTheme;

function rememberClassicLightTheme(value: WlThemeName, previous: WlThemeName, remembered: "white" | "newspaper"): "white" | "newspaper" {
  if (value === "newspaper") return "newspaper";
  if (value === previous) return remembered;
  return value === "graphite" && previous === "newspaper" ? remembered : "white";
}
function cancelPendingThemeChange(): void {
  themeTransition.cancel();
  requestedTheme = theme.value;
  requestedClassicLightTheme = classicLightTheme;
}
function toggleThemeVariant(): void {
  chooseTheme(getPlaygroundThemeToggleTarget(requestedTheme, requestedClassicLightTheme));
}
function updateThemeUrl(value: WlThemeName): void {
  const url = createPlaygroundThemeUrl(new URL(window.location.href), value);
  if (url.href !== window.location.href) window.history.replaceState(null, "", url);
}
function chooseTheme(value: unknown): void {
  if (!isPlaygroundTheme(value)) return;
  if (requestedTheme === value) {
    // Do not write a pending theme into the URL before its guarded DOM update.
    if (theme.value === value) updateThemeUrl(value);
    return;
  }
  requestedClassicLightTheme = rememberClassicLightTheme(value, requestedTheme, requestedClassicLightTheme);
  requestedTheme = value;
  const nextClassicLightTheme = requestedClassicLightTheme;
  themeTransition.run(async () => {
    classicLightTheme = nextClassicLightTheme;
    theme.value = value;
    updateThemeUrl(value);
    // Native capture must see Vue's updated hero layers, icon and header selector.
    await nextTick();
  });
}
watch(theme, (value) => {
  document.documentElement.dataset.wlTheme = value;
}, { immediate: true, flush: "sync" });
</script>
<template>
  <header ref="headerElement" class="pg-top">
    <PlaygroundHeader :active-view="activeView" :theme="theme" :theme-options="themeOptions"
      :version="project.version" :logo="gaviaMarkUrl" @navigate="showView"
      @theme="chooseTheme" @search="commandPaletteVisible = true" />
  </header>
  <WlCommandPalette v-model:visible="commandPaletteVisible" v-model:query="commandPaletteQuery"
    :groups="commandPaletteGroups" :shortcut="globalSearchShortcut" @select="onCommandPaletteSelect">
    <template #footer>Введите название раздела или компонента</template>
  </WlCommandPalette>
  <HomePage v-if="activeView === 'home'" :theme="theme" @navigate="showView" @component="openDocs" @catalog="openDocsCatalog" @quality="openDocsSection('quality')" @toggle-theme="toggleThemeVariant" />
  <DocsPage v-else-if="activeView === 'docs'" :component="activeRoute.component" :section="activeRoute.section" :theme="theme"
    @section="openDocsSection" @component="openDocs" @overview="openDocsOverview" @navigate="showView" />
  <FontPage v-else-if="activeView === 'font'" :theme="theme" @navigate="showView" />
  <DesignSystem v-else-if="activeView === 'system'" :theme="theme" @component="openDocs" />
  <ThemeBuilderPage v-else-if="activeView === 'theme-builder'" :theme="theme" />
  <ProjectInfo v-else-if="activeView === 'project'" />
  <footer class="pg-footer">
    <span>Gavia UI · v{{ project.version }} · <a :href="project.licenseUrl">MIT</a></span>
    <span>Автор: <a :href="project.author.url">{{ project.author.name }}</a></span>
    <a :href="project.repositoryUrl">GitHub</a>
    <a :href="qualityRouteHref()" @click="openQualityLink">Качество и совместимость</a>
    <FontDownloadLink variant="secondary">Скачать шрифт Gavia Sans</FontDownloadLink>
  </footer>
  <WlToast />
  <WlConfirmDialog />
</template>
<style>
.pg-top { border-bottom: 1px solid var(--wl-border); position: sticky; top: 0; background: var(--wl-bg); z-index: var(--wl-layer-sticky); }
.pg-footer { display: flex; align-items: center; flex-wrap: wrap; justify-content: center; gap: 12px 24px; padding: 24px; border-top: 1px solid var(--wl-border); color: var(--wl-text-2); font-size: var(--wl-type-small-size); }
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
