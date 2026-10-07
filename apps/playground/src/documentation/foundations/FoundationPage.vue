<script setup lang="ts">
import { computed, type Component } from "vue";
import { WlButton, wlBreakpoints, resolveWlToken } from "../../../../../packages/ui-kit/src";
import type { DocumentationFoundationSection } from "../../navigation";
import { documentationFoundationPages } from "../catalog";
import FoundationExample from "./FoundationExample.vue";
import ResponsiveDocumentation from "./ResponsiveDocumentation.vue";
import TypographyScale from "./examples/TypographyScale.vue";
import typographySource from "./examples/TypographyScale.vue?raw";
import TextHierarchy from "./examples/TextHierarchy.vue";
import hierarchySource from "./examples/TextHierarchy.vue?raw";
import Containers from "./examples/Containers.vue";
import containersSource from "./examples/Containers.vue?raw";
import EqualColumns from "./examples/EqualColumns.vue";
import equalColumnsSource from "./examples/EqualColumns.vue?raw";
import ColumnProportions from "./examples/ColumnProportions.vue";
import proportionsSource from "./examples/ColumnProportions.vue?raw";
import ResponsiveGrid from "./examples/ResponsiveGrid.vue";
import gridSource from "./examples/ResponsiveGrid.vue?raw";
import GridGapAlignment from "./examples/GridGapAlignment.vue";
import alignmentSource from "./examples/GridGapAlignment.vue?raw";
import NestedGrid from "./examples/NestedGrid.vue";
import nestedSource from "./examples/NestedGrid.vue?raw";
import PageComposition from "./examples/PageComposition.vue";
import compositionSource from "./examples/PageComposition.vue?raw";
import Spacing from "./examples/Spacing.vue";
import spacingSource from "./examples/Spacing.vue?raw";
import CssHelpers from "./examples/CssHelpers.vue";
import helpersSource from "./examples/CssHelpers.vue?raw";
import StackingLayers from "./examples/StackingLayers.vue";
import layersSource from "./examples/StackingLayers.vue?raw";
import ContentWriting from "./examples/ContentWriting.vue";
import writingSource from "./examples/ContentWriting.vue?raw";
import ContentStates from "./examples/ContentStates.vue";
import statesSource from "./examples/ContentStates.vue?raw";

const props = defineProps<{ section: DocumentationFoundationSection }>();
const emit = defineEmits<{
  component: [name: string | undefined];
  navigate: [view: "system" | "project" | "components"];
}>();
const metadata = computed(() => documentationFoundationPages[props.section]);
const implementations: Record<string, { example: Component; source: string }> = {
  "typography-scale": { example: TypographyScale, source: typographySource },
  "text-hierarchy": { example: TextHierarchy, source: hierarchySource },
  containers: { example: Containers, source: containersSource },
  "equal-columns": { example: EqualColumns, source: equalColumnsSource },
  "column-proportions": { example: ColumnProportions, source: proportionsSource },
  "responsive-grid": { example: ResponsiveGrid, source: gridSource },
  "gap-alignment": { example: GridGapAlignment, source: alignmentSource },
  "nested-grid": { example: NestedGrid, source: nestedSource },
  "page-composition": { example: PageComposition, source: compositionSource },
  spacing: { example: Spacing, source: spacingSource },
  "css-helpers": { example: CssHelpers, source: helpersSource },
  "stacking-layers": { example: StackingLayers, source: layersSource },
  "content-writing": { example: ContentWriting, source: writingSource },
  "content-states": { example: ContentStates, source: statesSource }
};
const examples = computed(() => metadata.value.examples.map((sample) => {
  const implementation = implementations[sample.name];
  if (!implementation) throw new Error("Missing documentation example: " + sample.name);
  return { ...sample, ...implementation };
}));
const layers = [
  { name: "Базовое содержимое", token: "--wl-layer-base", purpose: "Локальный базовый слой страницы." },
  { name: "Sticky", token: "--wl-layer-sticky", purpose: "Прикреплённые области страницы." },
  { name: "Sidebar", token: "--wl-layer-navigation", purpose: "Основная навигация на desktop." },
  { name: "Маска", token: "--wl-layer-mask", purpose: "Диалог и подложка модального оверлея." },
  { name: "Popover", token: "--wl-layer-popover", purpose: "Drawer, меню и всплывающая панель." },
  { name: "Мобильная навигация", token: "--wl-layer-navigation-modal", purpose: "Sidebar в мобильном модальном режиме." },
  { name: "Command palette", token: "--wl-layer-command", purpose: "Поиск и быстрые переходы." },
  { name: "Панель фильтров", token: "--wl-layer-filter", purpose: "Оверлей фильтров." },
  { name: "Toast", token: "--wl-layer-toast", purpose: "Уведомления над остальными штатными слоями." }
] as const;
</script>

<template>
  <ResponsiveDocumentation v-if="section === 'responsive'" @component="emit('component', $event)" @navigate="emit('navigate', $event)" />
  <article v-else class="docs-foundation-page wl-stack" data-space="2xl" data-testid="docs-foundation-page" :data-docs-section="section">
    <header class="wl-stack" data-space="md"><p class="docs-eyebrow">Документация / Основы</p><h1 class="wl-text-title">{{ metadata.label }}</h1><p class="wl-text-body wl-text-muted">{{ metadata.description }}</p></header>
    <section class="wl-stack" data-space="md" :aria-labelledby="metadata.rulesHeading.id">
      <h2 :id="metadata.rulesHeading.id" class="docs-foundation-anchor wl-text-heading">{{ metadata.rulesHeading.title }}</h2>
      <ul class="docs-foundation-rules"><li v-for="rule in metadata.rules" :key="rule">{{ rule }}</li></ul>
      <p class="wl-text-small wl-text-muted">Подключите <code>gavia-ui/styles/primitives.css</code> после base.css. Живые примеры и копируемый код используют один SFC; оформление наследует выбранную тему.</p>
    </section>
    <section v-if="metadata.breakpointsHeading" class="docs-foundation-breakpoints wl-stack" data-space="sm" :aria-labelledby="metadata.breakpointsHeading.id">
      <h2 :id="metadata.breakpointsHeading.id" class="docs-foundation-anchor wl-text-subheading">{{ metadata.breakpointsHeading.title }}</h2>
      <div class="wl-inline" data-space="lg"><code v-for="(width, name) in wlBreakpoints" :key="name" class="wl-text-code">{{ name }}: {{ width }} px</code></div>
      <p class="wl-text-body">Начинайте с одной колонки. Добавляйте две или три там, где достаточно места для содержимого; media queries описывают ширину viewport, auto-fit — доступную ширину сетки.</p>
      <p class="wl-text-small wl-text-muted">В media queries используйте числовую границу из wlBreakpoints; CSS custom properties не подставляются в условия. Для локального CSS достаточно обычного media query, слушатель resize не нужен.</p>
    </section>
    <FoundationExample v-for="sample in examples" :key="sample.name" v-bind="sample" />
    <section v-if="metadata.layersHeading" class="wl-stack" data-space="md" :aria-labelledby="metadata.layersHeading.id">
      <h2 :id="metadata.layersHeading.id" class="docs-foundation-anchor wl-text-heading">{{ metadata.layersHeading.title }}</h2>
      <p class="wl-text-body">Уровни ниже вычислены из текущего каталога токенов Gavia UI. Для своего sticky-блока используйте <code>--wl-layer-sticky</code>; общий слой меняйте токеном, локальное перекрытие ограничивайте <code>wl-isolate</code>.</p>
      <div class="docs-table-scroll" tabindex="0" role="region" aria-label="Уровни z-index Gavia UI">
        <table class="docs-contract-table"><thead><tr><th scope="col">Роль</th><th scope="col">Токен</th><th scope="col">Уровень</th><th scope="col">Назначение</th></tr></thead><tbody><tr v-for="layer in layers" :key="layer.token"><th scope="row">{{ layer.name }}</th><td><code>{{ layer.token }}</code></td><td>{{ resolveWlToken(layer.token) }}</td><td>{{ layer.purpose }}</td></tr></tbody></table>
      </div>
      <p class="wl-text-small wl-text-muted">Большое значение внутри дочернего stacking context не выводит элемент выше его родителя. Transform, opacity меньше 1 и isolation создают такие контексты. Оверлейные компоненты управляют своим позиционированием и слоями; не повышайте всё приложение до произвольного z-index.</p>
    </section>
    <footer class="docs-foundation-footer wl-stack" data-space="md">
      <h2 :id="metadata.continueHeading.id" class="docs-foundation-anchor wl-text-subheading">{{ metadata.continueHeading.title }}</h2>
      <div class="wl-inline" data-space="sm"><WlButton size="sm" @click="emit('component', undefined)">Обзор компонентов</WlButton><WlButton size="sm" @click="emit('navigate', 'components')">Рабочая галерея</WlButton><WlButton size="sm" variant="ghost" @click="emit('navigate', 'system')">Дизайн-система и токены</WlButton></div>
      <a class="docs-text-link wl-text-small" href="https://github.com/whitewolf06/gavia-ui/blob/main/docs/design-system.md">Все правила дизайн-системы</a>
    </footer>
  </article>
</template>

<style>
.docs-foundation-page { min-width: 0; }
.docs-foundation-anchor { scroll-margin-top: var(--wl-space-lg); }
.docs-foundation-rules { display: grid; gap: var(--wl-space-md); padding-left: var(--wl-space-lg); margin: 0; font-size: var(--wl-type-body-size); line-height: var(--wl-type-body-line-height); }
.docs-foundation-breakpoints { padding: var(--wl-space-lg); border: 1px solid var(--wl-border); border-radius: var(--wl-corner-surface); background: var(--wl-bg-soft); }
.docs-foundation-footer { padding-top: var(--wl-space-xl); border-top: 1px solid var(--wl-border); }
</style>
