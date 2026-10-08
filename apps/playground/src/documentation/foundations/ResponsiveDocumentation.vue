<script setup lang="ts">
import { WlButton, wlBreakpoints } from "../../../../../packages/ui-kit/src";
import { documentationFoundationPages } from "../catalog";
import CodePanel from "../../design-system/CodePanel.vue";
import FoundationExample from "./FoundationExample.vue";
import ViewportLayout from "./examples/ViewportLayout.vue";
import viewportSource from "./examples/ViewportLayout.vue?raw";
import FluidGrid from "./examples/FluidGrid.vue";
import fluidSource from "./examples/FluidGrid.vue?raw";
import ContainerCard from "./examples/ContainerCard.vue";
import containerSource from "./examples/ContainerCard.vue?raw";
import MediaBehavior from "./examples/MediaBehavior.vue";
import behaviorSource from "./examples/MediaBehavior.vue?raw";
const emit = defineEmits<{ component: [name: string | undefined]; navigate: [view: "system" | "project" | "components"] }>();
const metadata = documentationFoundationPages.responsive;
const examples = [
  { ...metadata.examples[0]!, example: ViewportLayout, source: viewportSource },
  { ...metadata.examples[1]!, example: FluidGrid, source: fluidSource },
  { ...metadata.examples[2]!, example: ContainerCard, source: containerSource },
  { ...metadata.examples[3]!, example: MediaBehavior, source: behaviorSource }
];
const localCss = [
  '/* A local application layout; no global token mutation. */',
  '.project-page {',
  '  --wl-layout-page-max: 1440px;',
  '  --wl-layout-page-gutter: clamp(12px, 3vw, 32px);',
  '  --wl-layout-grid-min: 280px;',
  '  --wl-layout-grid-gap: var(--wl-space-lg);',
  '}',
  '.project-layout { display: grid; grid-template-columns: minmax(0, 1fr); }',
  '@media (min-width: 820px) {',
  '  .project-layout { grid-template-columns: 240px minmax(0, 1fr); }',
  '}'
].join("\n");
</script>

<template>
  <article class="docs-foundation-page wl-stack" data-space="2xl" data-testid="docs-foundation-page" data-docs-section="responsive">
    <section class="wl-stack" data-space="md" aria-labelledby="docs-responsive-rules">
      <h2 id="docs-responsive-rules" class="docs-foundation-anchor wl-text-heading">{{ metadata.rulesHeading.title }}</h2>
      <ul class="docs-foundation-rules"><li v-for="rule in metadata.rules" :key="rule">{{ rule }}</li></ul>
      <p class="wl-text-small wl-text-muted">Подключите <code>gavia-ui/styles/primitives.css</code> после base.css. Пример и код для копирования используют один SFC.</p>
    </section>
    <section class="wl-stack" data-space="md" aria-labelledby="docs-responsive-breakpoints">
      <h2 id="docs-responsive-breakpoints" class="docs-foundation-anchor wl-text-heading">Брейкпоинты Gavia UI</h2>
      <div class="docs-table-scroll" tabindex="0" role="region" aria-label="Брейкпоинты Gavia UI"><table class="docs-contract-table"><thead><tr><th scope="col">Имя</th><th scope="col">Ширина</th><th scope="col">Применение в примере</th></tr></thead><tbody><tr v-for="(width, name) in wlBreakpoints" :key="name"><th scope="row"><code>{{ name }}</code></th><td>{{ width }} px</td><td>{{ name === 'sm' ? 'Две колонки' : name === 'md' ? 'Три колонки и широкий режим фильтра' : 'Четыре колонки' }}</td></tr></tbody></table></div>
      <p class="wl-text-body"><code>wlBreakpoints</code> — экспортируемый числовой каталог для приложения. Значения хранятся в <code>packages/ui-kit/tokens/source.json</code>, генератор обновляет TypeScript-каталог. Они не привязаны к моделям устройств и не переписывают готовые media queries.</p>
      <p class="wl-text-small wl-text-muted">Media queries используют числовую границу. <code>var()</code> работает в значениях свойств, а не в условиях размеров <code>@media</code> или <code>@container</code>. <a class="docs-text-link" href="https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties">CSS custom properties — MDN</a>.</p>
    </section>
    <FoundationExample v-for="sample in examples" :key="sample.name" v-bind="sample" />
    <section class="wl-stack" data-space="md" aria-labelledby="docs-responsive-overrides">
      <h2 id="docs-responsive-overrides" class="docs-foundation-anchor wl-text-heading">Как переопределять</h2>
      <p class="wl-text-body">Для отдельной страницы задайте токены на её корне: ширину контейнера, gutter, минимум колонки и gap. <code>wl-grid</code> с <code>data-space</code> берёт gap из выбранной роли; без него — из <code>--wl-layout-grid-gap</code>. Эти значения наследуются локально и не меняют условия media queries.</p>
      <CodePanel :source="localCss" language="css" title="CSS · локальная настройка страницы" :expanded="true" />
      <p class="wl-text-body">Если страницу нужно перестроить на 820 px, используйте обычное локальное условие, как выше. При изменении поведения передайте то же число в <code>matchMedia</code>. Для ширины самого блока установите <code>container-type: inline-size</code>, назовите контейнер и применяйте <code>@container</code> к его потомкам. <a class="docs-text-link" href="https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries">Container queries — MDN</a>.</p>
      <p class="wl-text-body">В исходниках Gavia UI каталог можно изменить в <code>tokens/source.json → breakpoints</code> и выполнить <code>pnpm tokens:sync</code>, затем <code>pnpm tokens:check</code>. Генератор обновит каталог; ручные <code>@media</code> в CSS и компонентах нужно согласовать отдельно. Глобального runtime-переключателя брейкпоинтов у библиотеки нет.</p>
    </section>
    <section class="wl-stack" data-space="md" aria-labelledby="docs-responsive-components">
      <h2 id="docs-responsive-components" class="docs-foundation-anchor wl-text-heading">Границы готовых компонентов</h2>
      <div class="docs-table-scroll" tabindex="0" role="region" aria-label="Встроенная адаптация компонентов"><table class="docs-contract-table"><thead><tr><th scope="col">Элемент</th><th scope="col">Текущая граница</th><th scope="col">Что учитывать</th></tr></thead><tbody><tr><th scope="row">WlPageHeader</th><td>До 720 px</td><td>Перестройка расположения через CSS.</td></tr><tr><th scope="row">WlFilterBar</th><td>До 720 px</td><td>CSS и matchMedia совместно управляют мобильной панелью, inert/aria-hidden и блокировкой прокрутки.</td></tr><tr><th scope="row">WlSidebar</th><td>До 900 px</td><td>CSS задаёт мобильную раскладку; приложение управляет mobileOpen/pinned/collapsible.</td></tr></tbody></table></div>
      <p class="wl-text-body">Публичного prop для изменения этих границ сейчас нет. Токены ширины sidebar/drawer настраивают размер панели, а не момент переключения. У WlFilterBar нельзя переносить границу только CSS: поведение, доступность и блокировка прокрутки должны переключаться вместе.</p>
      <p class="wl-text-small wl-text-muted">Шапка и Docs этого playground имеют собственные условия по месту для навигации. Эти условия выбраны для навигации сайта; у компонентов библиотеки свои границы. Диалоги ограничены шириной viewport, длинные группы действий могут прокручиваться внутри своей области.</p>
      <p class="wl-text-small wl-text-muted">JavaScript-пример подписывается только после onMounted, удаляет listener в onBeforeUnmount и не читает window при импорте или SSR. При сужении сохраняется сфокусированный фильтр; при расширении фокус с исчезающей кнопки переносится в поле. <a class="docs-text-link" href="https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia">matchMedia</a> и <a class="docs-text-link" href="https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryList/change_event">событие change — MDN</a>.</p>
    </section>
    <section class="wl-stack" data-space="md" aria-labelledby="docs-responsive-checks">
      <h2 id="docs-responsive-checks" class="docs-foundation-anchor wl-text-heading">Что проверять</h2>
      <ul class="docs-foundation-rules"><li>Проверьте узкий экран, границу условия и ширину сразу до/после неё; отдельно — карточку в узком родителе.</li><li>Длинные подписи, локализация, увеличение масштаба и перенос кнопок не должны создавать горизонтальную прокрутку страницы.</li><li>Порядок перехода по Tab совпадает с порядком DOM. После перестройки фокус остаётся доступным, введённые данные не пропадают.</li><li>Оверлеи, маска, inert/aria-hidden и блокировка прокрутки переключаются вместе с поведением; проверьте Escape и возврат фокуса.</li><li>CSS отвечает за компоновку без JavaScript. Динамические слушатели нужны только для поведения и удаляются при закрытии страницы.</li></ul>
    </section>
    <footer class="docs-foundation-footer wl-stack" data-space="md"><h2 id="docs-responsive-next" class="docs-foundation-anchor wl-text-subheading">Продолжить</h2><div class="wl-inline" data-space="sm"><WlButton size="sm" @click="emit('component', 'WlFilterBar')">WlFilterBar</WlButton><WlButton size="sm" @click="emit('component', 'WlSidebar')">WlSidebar</WlButton><WlButton size="sm" @click="emit('navigate', 'system')">Дизайн-система и токены</WlButton></div><a class="docs-text-link wl-text-small" href="https://github.com/whitewolf06/gavia-ui/blob/main/docs/responsiveness.md">Руководство по адаптивности</a></footer>
  </article>
</template>
