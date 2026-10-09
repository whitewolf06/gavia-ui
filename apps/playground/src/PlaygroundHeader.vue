<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { usePlaygroundI18n, type PlaygroundLocale } from "./i18n";
import WlButton from "../../../packages/ui-kit/src/components/WlButton.vue";
import WlDrawer from "../../../packages/ui-kit/src/components/WlDrawer.vue";
import WlIcon from "../../../packages/ui-kit/src/components/WlIcon.vue";
import WlMenu from "../../../packages/ui-kit/src/components/WlMenu.vue";
import WlSelect from "../../../packages/ui-kit/src/components/WlSelect.vue";
import type { WlIconName } from "../../../packages/ui-kit/src/icons.generated";
import type { WlMenuExpose, WlMenuItem } from "../../../packages/ui-kit/src/navigation-types";
import type { WlThemeName } from "../../../packages/ui-kit/src/types";
import type { PlaygroundView, PlaygroundRoute } from "./navigation";
import { isPlaygroundTheme, withPlaygroundTheme } from "./themes";

const { t, locale } = usePlaygroundI18n();
const props = defineProps<{
  activeView: PlaygroundView;
  route?: PlaygroundRoute;
  theme: WlThemeName;
  themeOptions: Array<{ label: string; value: string }>;
  version: string;
  logo: string;
}>();
const emit = defineEmits<{
  navigate: [view: PlaygroundView];
  theme: [theme: WlThemeName];
  search: [];
  locale: [locale: PlaygroundLocale];
}>();
const sections = computed(() => [
  { view: "home", label: t("shell.PlaygroundHeader.text122"), icon: "home" },
  { view: "docs", label: t("shell.PlaygroundHeader.text123"), icon: "book" },
  { view: "font", label: t("shell.PlaygroundHeader.text124"), icon: "book" },
  { view: "system", label: t("shell.PlaygroundHeader.text125"), icon: "grid" },
  { view: "theme-builder", label: t("shell.PlaygroundHeader.text126"), icon: "sliders-h" },
  { view: "project", label: "Changelog", icon: "history" }
] as const satisfies ReadonlyArray<{ view: PlaygroundView; label: string; icon: WlIconName }>);
const languageOptions = [{ label: "EN", value: "en" }, { label: "RU", value: "ru" }];
const headerElement = ref<HTMLElement | null>(null);
const desktopNavigation = ref<HTMLElement | null>(null);
const measurement = ref<HTMLElement | null>(null);
const overflowMenu = ref<WlMenuExpose | null>(null);
const visibleCount = ref<number>(sections.value.length);
const visibleSections = computed(() => sections.value.slice(0, visibleCount.value));
const overflowSections = computed(() => sections.value.slice(visibleCount.value));
const overflowCurrent = computed(() => overflowSections.value.some((section) => section.view === props.activeView));
const overflowItems = computed<WlMenuItem[]>(() => overflowSections.value.map((section) => ({
  key: section.view, label: section.label, icon: section.icon, command: () => navigate(section.view)
})));
const overflowOpen = ref(false);
const menuVisible = ref(false);
let compactViewport: MediaQueryList | undefined;
let resizeObserver: ResizeObserver | undefined;
let measurementFrame: number | undefined;
let menuFocusFrame: number | undefined;
let mounted = false;
let lastNavigationFocus: HTMLElement | null = null;

function rememberNavigationFocus(event: FocusEvent): void {
  const target = event.target instanceof HTMLElement ? event.target : null;
  if (target === document.body) return;
  lastNavigationFocus = target && (desktopNavigation.value?.contains(target)
    || headerElement.value?.querySelector(".pg-menu-trigger")?.contains(target)) ? target : null;
}
function clearNavigationFocus(event: PointerEvent): void {
  if (!(event.target instanceof Node) || !lastNavigationFocus?.contains(event.target)) lastNavigationFocus = null;
}

function cancelMenuFocus(): void {
  if (menuFocusFrame !== undefined) window.cancelAnimationFrame(menuFocusFrame);
  menuFocusFrame = undefined;
}
function restoreMenuFocus(): void {
  cancelMenuFocus();
  menuFocusFrame = window.requestAnimationFrame(() => {
    menuFocusFrame = undefined;
    if (menuVisible.value || overflowOpen.value) return;
    const selector = compactViewport?.matches ? ".pg-menu-trigger" : '.pg-views [aria-current="page"], .pg-overflow-trigger';
    headerElement.value?.querySelector<HTMLElement>(selector)?.focus({ preventScroll: true });
  });
}
function closeOverflow(): void {
  overflowMenu.value?.hide();
  overflowOpen.value = false;
}
function measureNavigation(): void {
  if (!desktopNavigation.value || !measurement.value || compactViewport?.matches) return;
  const buttons = [...measurement.value.querySelectorAll<HTMLElement>("[data-nav-measure]")];
  const widths = buttons.map((button) => button.getBoundingClientRect().width);
  const count: number = sections.value.length;
  if (widths.length !== count + 1) return;
  const available = desktopNavigation.value.clientWidth;
  const gap = Number.parseFloat(getComputedStyle(desktopNavigation.value).columnGap) || 0;
  const total = widths.slice(0, count).reduce((sum, width) => sum + width, 0) + gap * (count - 1);
  let nextCount = count;
  if (total > available) {
    nextCount = count - 1;
    while (nextCount > 0 && widths.slice(0, nextCount).reduce((sum, width) => sum + width, 0)
      + gap * nextCount + widths[count]! > available) nextCount--;
  }
  if (nextCount === visibleCount.value) return;
  const focusedElement = document.activeElement === document.body ? lastNavigationFocus : document.activeElement;
  const focusedButton = [...desktopNavigation.value.querySelectorAll<HTMLElement>("button")]
    .findIndex((button) => button.contains(focusedElement));
  const focusedOverflow = focusedButton === visibleCount.value;
  const removedFocusedButton = focusedButton >= 0 && (focusedOverflow
    ? nextCount === count
    : focusedButton >= nextCount);
  const restoreFocus = overflowOpen.value || removedFocusedButton;
  closeOverflow();
  visibleCount.value = nextCount;
  if (restoreFocus) void nextTick(restoreMenuFocus);
}
function scheduleMeasurement(): void {
  if (!mounted || measurementFrame !== undefined) return;
  measurementFrame = window.requestAnimationFrame(() => {
    measurementFrame = undefined;
    measureNavigation();
  });
}
function syncViewport(): void {
  // A control hidden by the media query can blur before its change event arrives.
  const focusedElement = document.activeElement === document.body ? lastNavigationFocus : document.activeElement;
  const focusedControl = compactViewport?.matches
    ? desktopNavigation.value?.contains(focusedElement)
    : headerElement.value?.querySelector(".pg-menu-trigger")?.contains(focusedElement);
  const wasOpen = menuVisible.value || overflowOpen.value || focusedControl;
  menuVisible.value = false;
  closeOverflow();
  scheduleMeasurement();
  if (wasOpen) void nextTick(restoreMenuFocus);
}
function openMenu(): void {
  cancelMenuFocus();
  closeOverflow();
  menuVisible.value = true;
}
function openOverflow(event: Event): void {
  cancelMenuFocus();
  if (event.currentTarget instanceof HTMLElement) event.currentTarget.focus({ preventScroll: true });
  if (event instanceof KeyboardEvent) overflowMenu.value?.show(event);
  else overflowMenu.value?.toggle(event);
}
async function focusOverflow(): Promise<void> {
  overflowOpen.value = true;
  await nextTick();
  const links = [...document.querySelectorAll<HTMLElement>('#pg-overflow-navigation [role="menuitem"]')];
  links.forEach((link, index) => {
    if (overflowSections.value[index]?.view === props.activeView) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  links[0]?.focus({ preventScroll: true });
}
function activateMenuItem(event: KeyboardEvent): void {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  if (event.currentTarget instanceof HTMLElement) event.currentTarget.click();
}
function navigate(view: PlaygroundView): void {
  const fromOverflow = overflowOpen.value;
  closeOverflow();
  menuVisible.value = false;
  emit("navigate", view);
  if (fromOverflow) void nextTick(restoreMenuFocus);
}
function selectTheme(value: unknown): void {
  if (isPlaygroundTheme(value)) emit("theme", value);
}
function selectLocale(value: unknown): void {
  if (value === "en" || value === "ru") emit("locale", value);
}
watch(() => props.activeView, () => { menuVisible.value = false; closeOverflow(); });
watch(() => [props.theme, locale.value], () => { void nextTick(scheduleMeasurement); });
onMounted(() => {
  mounted = true;
  compactViewport = window.matchMedia("(max-width: 760px)");
  compactViewport.addEventListener("change", syncViewport);
  document.addEventListener("focusin", rememberNavigationFocus);
  document.addEventListener("pointerdown", clearNavigationFocus);
  resizeObserver = new ResizeObserver(scheduleMeasurement);
  for (const element of [headerElement.value, desktopNavigation.value, measurement.value]) {
    if (element) resizeObserver.observe(element);
  }
  void document.fonts.ready.then(scheduleMeasurement);
  scheduleMeasurement();
});
onBeforeUnmount(() => {
  mounted = false;
  cancelMenuFocus();
  if (measurementFrame !== undefined) window.cancelAnimationFrame(measurementFrame);
  resizeObserver?.disconnect();
  compactViewport?.removeEventListener("change", syncViewport);
  document.removeEventListener("focusin", rememberNavigationFocus);
  document.removeEventListener("pointerdown", clearNavigationFocus);
});
</script>

<template>
  <div ref="headerElement" class="pg-header-inner wl-container">
    <a class="pg-brand" :href="withPlaygroundTheme('?', theme)" :aria-label="t('shell.PlaygroundHeader.text127')" @click.prevent="navigate('home')">
      <span class="pg-logo pg-logo-mask" aria-hidden="true" :style="{ maskImage: 'url(' + logo + ')', WebkitMaskImage: 'url(' + logo + ')' }" />
      <b class="pg-title">Gavia UI</b>
      <span class="pg-kit-version" :aria-label="t('shell.PlaygroundHeader.text128') + version">v{{ version }}</span>
    </a>
    <nav ref="desktopNavigation" class="pg-views" :aria-label="t('shell.PlaygroundHeader.text129')">
      <WlButton v-for="section in visibleSections" :key="section.view" size="sm" variant="ghost"
        :aria-current="activeView === section.view ? 'page' : undefined" @click="navigate(section.view)">
        <template #icon><WlIcon :name="section.icon" :size="14" /></template>{{ section.label }}
      </WlButton>
      <WlButton v-if="overflowSections.length" class="pg-overflow-trigger" size="sm" variant="ghost"
        :aria-label="t('shell.header.moreSections')" :aria-current="overflowCurrent ? 'page' : undefined"
        aria-haspopup="menu" aria-controls="pg-overflow-navigation" :aria-expanded="overflowOpen"
        @click="openOverflow" @keydown.down.prevent="openOverflow">
        {{ t('shell.header.more') }}<WlIcon name="chevron-down" :size="14" />
      </WlButton>
    </nav>
    <div class="pg-actions">
      <div class="pg-utility-controls">
        <WlButton class="pg-search" size="sm" variant="secondary" :aria-label="t('shell.PlaygroundHeader.text130')"
          :title="t('shell.PlaygroundHeader.text131')" @click="emit('search')">
          <template #icon><WlIcon name="search" :size="16" /></template><span class="pg-search-text">{{ t('shell.PlaygroundHeader.text132') }}</span>
        </WlButton>
        <div class="pg-theme-control">
          <WlSelect class="pg-theme" size="sm" :model-value="theme" :options="themeOptions"
            option-label="label" option-value="value" :aria-label="t('shell.PlaygroundHeader.text133')"
            :title="t('shell.PlaygroundHeader.text134') + theme" data-testid="pg-theme-selector" @update:model-value="selectTheme" />
          <WlIcon class="pg-theme-mobile-icon" name="sliders-h" :size="18" />
        </div>
      </div>
      <WlSelect class="pg-language" size="sm" :model-value="locale" :options="languageOptions"
        option-label="label" option-value="value" :aria-label="t('shell.language')" data-testid="pg-language-selector"
        @update:model-value="selectLocale" />
    </div>
    <WlButton class="pg-menu-trigger" size="sm" variant="secondary" :aria-label="t('shell.PlaygroundHeader.text135')"
      :title="t('shell.PlaygroundHeader.text136')" aria-haspopup="dialog" aria-controls="pg-adaptive-navigation" :aria-expanded="menuVisible"
      @click="openMenu"><template #icon><WlIcon name="bars" :size="18" /></template></WlButton>
    <div class="pg-measure-clip" aria-hidden="true" inert>
      <div ref="measurement" class="pg-nav-measure">
        <WlButton v-for="section in sections" :key="section.view" size="sm" variant="ghost" data-nav-measure="section" tabindex="-1">
          <template #icon><WlIcon :name="section.icon" :size="14" /></template>{{ section.label }}
        </WlButton>
        <WlButton class="pg-overflow-trigger" size="sm" variant="ghost" data-nav-measure="overflow" tabindex="-1">
          {{ t('shell.header.more') }}<WlIcon name="chevron-down" :size="14" />
        </WlButton>
      </div>
    </div>
  </div>
  <WlMenu :key="visibleCount" ref="overflowMenu" class="pg-overflow-menu" popup :items="overflowItems"
    :aria-label="t('shell.PlaygroundHeader.text138')"
    :pt="{ list: { id: 'pg-overflow-navigation' }, itemLink: { onKeydown: activateMenuItem } }"
    @open="focusOverflow" @close="overflowOpen = false" />
  <WlDrawer v-model:visible="menuVisible" :header="t('shell.PlaygroundHeader.text138')" position="right" @close="restoreMenuFocus"
    :pt="{ root: { id: 'pg-adaptive-navigation', style: { width: 'min(360px, 100%)' } } }">
    <nav class="pg-menu-links" :aria-label="t('shell.PlaygroundHeader.text139')">
      <WlButton v-for="section in sections" :key="section.view" block
        :variant="activeView === section.view ? 'soft' : 'ghost'"
        :aria-current="activeView === section.view ? 'page' : undefined" @click="navigate(section.view)">
        <template #icon><WlIcon :name="section.icon" :size="18" /></template>{{ section.label }}
      </WlButton>
    </nav>
    <template #footer><span class="pg-menu-meta">Gavia UI · v{{ version }}</span></template>
  </WlDrawer>
</template>

<style scoped>
.pg-header-inner { max-width: 1440px; min-height: 64px; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: var(--wl-space-md); padding-block: var(--wl-space-md); }
.pg-brand { color: var(--wl-text); text-decoration: none; border-radius: var(--wl-radius-sm); display: inline-flex; justify-self: start; align-items: center; gap: 8px; white-space: nowrap; }
.pg-brand:focus-visible { outline: 2px solid var(--wl-focus-color); outline-offset: 4px; }
.pg-logo { width: 36px; height: 36px; display: block; flex: none; }
.pg-logo-mask { background-color: var(--wl-action-primary-bg); mask-size: contain; mask-repeat: no-repeat; mask-position: center; }
.pg-title { display: block; font-family: var(--wl-font-heading); font-size: 20px; font-weight: 600; line-height: 1.2; letter-spacing: -0.02em; }
.pg-kit-version { display: block; flex: none; padding: 3px 6px; border: 1px solid var(--wl-border); border-radius: var(--wl-radius-sm); color: var(--wl-text-2); font-family: var(--wl-mono); font-size: 11px; line-height: 1; }
.pg-views, .pg-nav-measure { display: flex; flex-wrap: nowrap; align-items: center; gap: 4px; }
.pg-views { justify-content: center; min-width: 0; }
.pg-views :deep(.wl-btn), .pg-nav-measure :deep(.wl-btn) { flex: none; white-space: nowrap; }
.pg-views [aria-current="page"] { background: var(--wl-accent-soft); color: var(--wl-text); }
.pg-overflow-trigger :deep(.wl-btn__label) { display: inline-flex; align-items: center; gap: 6px; }
:global(.pg-overflow-menu [aria-current="page"]) { background: var(--wl-accent-soft); color: var(--wl-text); }
.pg-actions { display: flex; align-items: center; gap: 8px; }
.pg-utility-controls { display: grid; grid-template-columns: repeat(2, 120px); gap: 8px; }
.pg-search, :deep(.pg-theme) { width: 100%; min-width: 0; }
.pg-search { justify-content: flex-start; text-align: left; color: var(--wl-text-2); background: var(--wl-bg-raised); }
.pg-theme-control { position: relative; min-width: 0; display: flex; align-items: center; }
.pg-theme-mobile-icon { display: none; }
:deep(.pg-language) { width: 68px; min-width: 0; flex: none; }
.pg-menu-trigger { display: none; }
.pg-menu-links { display: grid; gap: var(--wl-space-sm); }
.pg-menu-links :deep(.wl-btn) { justify-content: flex-start; min-height: 44px; }
.pg-menu-meta { color: var(--wl-text-muted); font-size: var(--wl-type-small-size); }
.pg-measure-clip { position: fixed; top: 0; left: 0; width: 0; height: 0; overflow: hidden; visibility: hidden; pointer-events: none; }
.pg-nav-measure { width: max-content; }
@media (max-width: 760px) {
  .pg-header-inner { grid-template-columns: minmax(0, 1fr) auto 44px; gap: 4px; padding: var(--wl-space-sm); }
  .pg-brand { gap: 6px; min-width: 0; }
  .pg-logo { width: 32px; height: 32px; }
  .pg-kit-version, .pg-views, .pg-search-text { display: none; }
  .pg-actions { gap: 4px; }
  .pg-utility-controls { grid-template-columns: repeat(2, 44px); gap: 4px; }
  :deep(.pg-language) { height: 44px; min-height: 44px; }
  .pg-menu-trigger { display: inline-flex; width: 44px; height: 44px; min-height: 44px; padding: 0; justify-content: center; }
  .pg-search, :deep(.pg-theme) { height: 44px; min-height: 44px; }
  .pg-search { padding: 0; justify-content: center; }
  .pg-search :deep(.wl-btn__label) { display: none; }
  :deep(.pg-theme) { padding: 0; }
  :deep(.pg-theme .wl-select__label), :deep(.pg-theme .wl-select__dropdown) { display: none; }
  .pg-theme-mobile-icon { display: block; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none; }
}
@media (max-width: 400px) {
  .pg-logo { width: 28px; height: 28px; }
  .pg-title { font-size: 18px; }
}
@media (max-width: 360px) {
  .pg-title { display: none; }
}
</style>
