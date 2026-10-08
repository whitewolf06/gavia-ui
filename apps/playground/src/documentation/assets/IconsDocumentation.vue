<script setup lang="ts">
import { computed, ref } from "vue";
import { WL_ICON_NAMES, WlButton, WlIcon, WlInput, type WlIconName } from "../../../../../packages/ui-kit/src";
import CodePanel from "../../design-system/CodePanel.vue";
import { consumerSource } from "../../design-system/code";
import AssetExample from "./AssetExample.vue";
import { iconDocumentationHeadings as headings } from "./assets";
import IconPlayground from "./examples/IconPlayground.vue";
import playgroundSource from "./examples/IconPlayground.vue?raw";
import IconAccessibility from "./examples/IconAccessibility.vue";
import accessibilitySource from "./examples/IconAccessibility.vue?raw";
import IconCompatibility from "./examples/IconCompatibility.vue";
import compatibilitySource from "./examples/IconCompatibility.vue?raw";

const selectedName = ref<WlIconName>("folder");
const selectedSize = ref(24);
const query = ref("");
const matchingNames = computed(() => WL_ICON_NAMES.filter((name) => name.includes(query.value.trim().toLowerCase())));
const code = consumerSource(playgroundSource);
</script>

<template>
  <div class="docs-icons wl-stack" data-space="2xl">
    <section class="wl-stack" data-space="lg" :aria-labelledby="headings.playground.id" data-asset-example="icon-playground">
      <h2 :id="headings.playground.id" class="docs-assets-anchor wl-text-heading">{{ headings.playground.title }}</h2>
      <p class="wl-text-body wl-text-muted">Выберите имя и сравните размеры. SVG использует viewBox 0 0 24 24; currentColor берётся из ближайшего контейнера.</p>
      <div class="docs-asset-preview" data-testid="docs-asset-preview"><IconPlayground v-model:name="selectedName" v-model:size="selectedSize" /></div>
      <div data-testid="docs-asset-source"><CodePanel :source="code" title="Vue SFC · интерактивный выбор иконки" :expanded="true" /></div>
    </section>
    <section class="wl-stack" data-space="lg" :aria-labelledby="headings.catalog.id">
      <h2 :id="headings.catalog.id" class="docs-assets-anchor wl-text-heading">{{ headings.catalog.title }}</h2>
      <div class="docs-icons-search wl-stack" data-space="sm"><label for="docs-icon-search" class="wl-text-label">Поиск по имени</label><WlInput id="docs-icon-search" v-model="query" placeholder="Например, folder" /><p class="wl-text-small wl-text-muted" role="status" data-testid="docs-icon-count">Показано: {{ matchingNames.length }} / {{ WL_ICON_NAMES.length }} · Выбрано: {{ selectedName }} · Размер каталога: {{ selectedSize }} px</p></div>
      <ul class="docs-icons-grid" aria-label="Все иконки Gavia UI" data-testid="docs-icon-catalog">
        <li v-for="name in matchingNames" :key="name"><button type="button" class="docs-icon-choice" :data-icon-name="name" :aria-label="'Выбрать иконку ' + name" :aria-pressed="selectedName === name" @click="selectedName = name"><WlIcon :name="name" :size="selectedSize" /><code class="wl-text-code">{{ name }}</code></button></li>
      </ul>
      <p v-if="!matchingNames.length" class="wl-text-body">Иконки не найдены. Измените название или проверьте список синонимов.</p>
      <div><WlButton v-if="query" size="sm" variant="ghost" @click="query = ''">Сбросить поиск</WlButton></div>
    </section>
    <section class="wl-stack" data-space="lg" :aria-labelledby="headings.accessibility.id">
      <h2 :id="headings.accessibility.id" class="docs-assets-anchor wl-text-heading">{{ headings.accessibility.title }}</h2>
      <ul class="docs-icons-rules"><li>WlIcon по умолчанию декоративный: SVG имеет aria-hidden="true". Видимая подпись действия или объекта передаёт смысл.</li><li>Самостоятельному изображению задайте доступное имя на контейнере с role="img". Если имя задаётся самому SVG, явно передайте aria-hidden="false".</li><li>У кнопки только с иконкой должно быть доступное имя. WlIconButton принимает aria-label; текстовая кнопка использует свою видимую подпись.</li></ul>
      <AssetExample name="icon-accessibility" title="Смысл и действие" :example="IconAccessibility" :source="accessibilitySource" />
    </section>
    <section class="wl-stack" data-space="lg" :aria-labelledby="headings.compatibility.id">
      <h2 :id="headings.compatibility.id" class="docs-assets-anchor wl-text-heading">{{ headings.compatibility.title }}</h2>
      <p class="wl-text-body">Size принимает число в пикселях или CSS-строку. Resolver принимает каноническое имя или синоним, включая прежние pi-name и pi pi-name. При неизвестном имени WlIcon показывает default-слот.</p>
      <AssetExample name="icon-compatibility" title="Совместимые имена и резервный знак" :example="IconCompatibility" :source="compatibilitySource" />
    </section>
    <section class="wl-stack" data-space="md" :aria-labelledby="headings.pipeline.id">
      <h2 :id="headings.pipeline.id" class="docs-assets-anchor wl-text-heading">{{ headings.pipeline.title }}</h2>
      <p class="wl-text-body">Исходники находятся в packages/ui-kit/icons/&lt;name&gt;.svg. Подготовьте новые иконки в общем стиле; <code>pnpm icons:sync</code> проверит SVG и обновит реестр, <code>pnpm icons:check</code> проверит актуальность.</p>
      <p class="wl-text-small wl-text-muted">Разборчивость проверяйте на 16, 20 и 24 px во всех темах. Размер и цвет задаёт компонент; внешние ресурсы и обработчики в SVG не используются.</p>
      <a class="docs-assets-link" href="https://github.com/whitewolf06/gavia-ui/blob/main/docs/icons.md">Как подготовить и добавить SVG</a>
    </section>
  </div>
</template>

<style>
.docs-icons { min-width: 0; }
.docs-icons-search { max-width: 420px; }
.docs-icons-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 112px), 1fr)); gap: var(--wl-space-sm); margin: 0; padding: 0; list-style: none; }
.docs-icons-grid li { min-width: 0; }
.docs-icon-choice { width: 100%; min-width: 0; min-height: 104px; padding: var(--wl-space-md); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--wl-space-md); border: 1px solid var(--wl-border); border-radius: var(--wl-corner-control); background: var(--wl-bg); color: var(--wl-text); cursor: pointer; }
.docs-icon-choice code { font-size: var(--wl-type-small-size); overflow-wrap: anywhere; }
.docs-icon-choice:hover { background: var(--wl-bg-soft); }
.docs-icon-choice[aria-pressed="true"] { border-color: var(--wl-accent); background: var(--wl-accent-soft); }
.docs-icon-choice:focus-visible { outline: 2px solid var(--wl-focus-color); outline-offset: 2px; }
.docs-icons-rules { display: grid; gap: var(--wl-space-md); margin: 0; padding-left: var(--wl-space-lg); font-size: var(--wl-type-body-size); line-height: var(--wl-type-body-line-height); }
</style>
