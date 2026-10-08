<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import WlButton from "../../../packages/ui-kit/src/components/WlButton.vue";
import WlDrawer from "../../../packages/ui-kit/src/components/WlDrawer.vue";
import WlIcon from "../../../packages/ui-kit/src/components/WlIcon.vue";
import WlSelect from "../../../packages/ui-kit/src/components/WlSelect.vue";
import type { WlIconName } from "../../../packages/ui-kit/src/icons.generated";
import type { WlThemeName } from "../../../packages/ui-kit/src/types";
import type { PlaygroundView } from "./navigation";
import { isPlaygroundTheme, withPlaygroundTheme } from "./themes";

const props = defineProps<{
  activeView: PlaygroundView;
  theme: WlThemeName;
  themeOptions: Array<{ label: string; value: string }>;
  version: string;
  logo: string;
}>();
const emit = defineEmits<{
  navigate: [view: PlaygroundView];
  theme: [theme: WlThemeName];
  search: [];
}>();
const sections = [
  { view: "home", label: "Главная", icon: "home" },
  { view: "docs", label: "Документация", icon: "book" },
  { view: "font", label: "Шрифт", icon: "book" },
  { view: "system", label: "Дизайн-система", icon: "grid" },
  { view: "theme-builder", label: "Подбор темы", icon: "sliders-h" },
  { view: "project", label: "Changelog", icon: "history" }
] as const satisfies ReadonlyArray<{ view: PlaygroundView; label: string; icon: WlIconName }>;

const menuVisible = ref(false);
const desktopNavigation = ref<HTMLElement | null>(null);
let compactViewport: MediaQueryList | undefined;
let menuFocusFrame: number | undefined;

function cancelMenuFocus(): void {
  if (menuFocusFrame !== undefined) window.cancelAnimationFrame(menuFocusFrame);
  menuFocusFrame = undefined;
}
function restoreMenuFocus(): void {
  cancelMenuFocus();
  // A mask closes on pointer-down; restore after the pointer's native focus change.
  menuFocusFrame = window.requestAnimationFrame(() => {
    menuFocusFrame = undefined;
    if (menuVisible.value) return;
    const selector = compactViewport?.matches ? ".pg-menu-trigger" : '[aria-current="page"]';
    const container = compactViewport?.matches ? desktopNavigation.value?.parentElement : desktopNavigation.value;
    container?.querySelector<HTMLElement>(selector)?.focus({ preventScroll: true });
  });
}
function openMenu(): void {
  cancelMenuFocus();
  menuVisible.value = true;
}
function syncViewport(): void {
  if (compactViewport?.matches || !menuVisible.value) return;
  menuVisible.value = false;
}
function navigate(view: PlaygroundView): void {
  menuVisible.value = false;
  emit("navigate", view);
}
function selectTheme(value: unknown): void {
  if (isPlaygroundTheme(value)) emit("theme", value);
}
watch(() => props.activeView, () => { menuVisible.value = false; });
onMounted(() => {
  compactViewport = window.matchMedia("(max-width: 1180px)");
  compactViewport.addEventListener("change", syncViewport);
});
onBeforeUnmount(() => { cancelMenuFocus(); compactViewport?.removeEventListener("change", syncViewport); });
</script>

<template>
  <div class="pg-header-inner wl-container">
    <a class="pg-brand" :href="withPlaygroundTheme('?', theme)" aria-label="Gavia UI — главная" @click.prevent="navigate('home')">
      <span class="pg-logo pg-logo-mask" aria-hidden="true" :style="{ maskImage: 'url(' + logo + ')', WebkitMaskImage: 'url(' + logo + ')' }" />
      <b class="pg-title">Gavia UI</b>
      <span class="pg-kit-version" :aria-label="'Версия UI Kit ' + version">v{{ version }}</span>
    </a>
    <nav ref="desktopNavigation" class="pg-views" aria-label="Основная навигация Gavia UI">
      <WlButton v-for="section in sections" :key="section.view" size="sm" variant="ghost"
        :aria-current="activeView === section.view ? 'page' : undefined" @click="navigate(section.view)">
        <template #icon><WlIcon :name="section.icon" :size="14" /></template>{{ section.label }}
      </WlButton>
    </nav>
    <div class="pg-actions">
      <WlButton class="pg-search" size="sm" variant="secondary" aria-label="Поиск" title="Поиск" @click="emit('search')">
        <template #icon><WlIcon name="search" :size="18" /></template>
        Поиск
      </WlButton>
      <div class="pg-theme-control">
        <WlSelect class="pg-theme" size="sm" :model-value="theme" :options="themeOptions"
          option-label="label" option-value="value" aria-label="Тема оформления"
          :title="'Тема оформления: ' + theme" data-testid="pg-theme-selector" @update:model-value="selectTheme" />
        <WlIcon class="pg-theme-icon" name="lightbulb" :size="18" />
      </div>
    </div>
    <WlButton class="pg-menu-trigger" size="sm" variant="primary" aria-label="Открыть меню разделов"
      title="Разделы Gavia UI" aria-haspopup="dialog" aria-controls="pg-adaptive-navigation" :aria-expanded="menuVisible"
      @click="openMenu">
      <template #icon><WlIcon name="bars" :size="18" /></template>Меню
    </WlButton>
  </div>
  <WlDrawer v-model:visible="menuVisible" header="Разделы Gavia UI" position="right" @close="restoreMenuFocus"
    :pt="{ root: { id: 'pg-adaptive-navigation', style: { width: 'min(360px, 100%)' } } }">
    <nav class="pg-menu-links" aria-label="Разделы Gavia UI">
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
.pg-header-inner { min-height: 64px; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: var(--wl-space-md); padding-block: var(--wl-space-md); }
.pg-brand { color: var(--wl-text); text-decoration: none; border-radius: var(--wl-radius-sm); display: inline-flex; justify-self: start; align-items: center; gap: 8px; white-space: nowrap; }
.pg-brand:focus-visible { outline: 2px solid var(--wl-focus-color); outline-offset: 4px; }
.pg-logo { width: 36px; height: 36px; display: block; object-fit: contain; flex: none; }
.pg-logo-mask { background-color: var(--wl-action-primary-bg); mask-size: contain; mask-repeat: no-repeat; mask-position: center; }
.pg-title { display: block; font-family: var(--wl-font-heading); font-size: 20px; font-weight: 600; line-height: 1.2; letter-spacing: -0.02em; }
.pg-kit-version { display: block; flex: none; padding: 3px 6px; border: 1px solid var(--wl-border); border-radius: var(--wl-radius-sm); color: var(--wl-text-2); font-family: var(--wl-mono); font-size: 11px; line-height: 1; }
.pg-views { display: flex; flex-wrap: nowrap; justify-content: center; gap: 4px; min-width: 0; }
.pg-views [aria-current="page"] { background: var(--wl-accent-soft); color: var(--wl-text); }
.pg-actions { display: flex; justify-content: flex-end; align-items: center; gap: var(--wl-space-md); min-width: 0; }
.pg-theme-control { position: relative; width: 140px; flex: none; }
.pg-theme-control :deep(.pg-theme) { width: 100%; min-width: 0; }
.pg-theme-icon { display: none; pointer-events: none; }
.pg-menu-trigger { display: none; }
.pg-menu-links { display: grid; gap: var(--wl-space-sm); }
.pg-menu-links :deep(.wl-btn) { justify-content: flex-start; min-height: 44px; }
.pg-menu-meta { color: var(--wl-text-muted); font-size: var(--wl-type-small-size); }
@media (max-width: 1180px) {
  .pg-header-inner { grid-template-columns: auto minmax(0, 1fr) auto; }
  .pg-views { display: none; }
  .pg-brand { grid-column: 1; grid-row: 1; }
  .pg-actions { grid-column: 2; grid-row: 1; }
  .pg-menu-trigger { display: inline-flex; grid-column: 3; grid-row: 1; min-height: 40px; }
}
@media (max-width: 700px) {
  .pg-header-inner { padding: var(--wl-space-sm) var(--wl-space-md); gap: var(--wl-space-sm); }
  .pg-logo { width: 32px; height: 32px; }
  .pg-actions { gap: 4px; }
  .pg-search, .pg-menu-trigger { width: 44px; height: 44px; min-height: 44px; padding: 0; justify-content: center; }
  .pg-search :deep(.wl-btn__label), .pg-menu-trigger :deep(.wl-btn__label) { display: none; }
  .pg-theme-control { width: 44px; height: 44px; }
  .pg-theme-control :deep(.pg-theme) { height: 44px; min-height: 44px; padding: 0; }
  .pg-theme-control :deep(.wl-select__label) { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  .pg-theme-control :deep(.wl-select__dropdown) { display: none; }
  .pg-theme-icon { display: block; position: absolute; inset-inline-start: 50%; top: 50%; transform: translate(-50%, -50%); color: var(--wl-text); }
}
@media (max-width: 400px) {
  .pg-brand { gap: 4px; }
  .pg-logo { width: 28px; height: 28px; }
  .pg-kit-version { font-size: 10px; padding-inline: 4px; }
}
@media (max-width: 370px) {
  .pg-brand { display: grid; grid-template-columns: 28px auto; column-gap: 6px; row-gap: 2px; }
  .pg-logo { grid-column: 1; grid-row: 1 / 3; }
  .pg-title { grid-column: 2; grid-row: 1; }
  .pg-kit-version { grid-column: 2; grid-row: 2; justify-self: start; }
}
</style>
