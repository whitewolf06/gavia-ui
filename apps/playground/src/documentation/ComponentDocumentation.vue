<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import type { WlComponentManifest } from "../../../../packages/ui-kit/src/manifest";
import ComponentExplorer from "../design-system/ComponentExplorer.vue";
import CodePanel from "../design-system/CodePanel.vue";
import DocumentationContract from "./DocumentationContract.vue";
import DocumentationTabs, { type DocumentationTab } from "./DocumentationTabs.vue";
import { componentDocumentationAccessibility, documentationExample } from "./components/registry";
import { documentationPtSections } from "./components/pt-sections";
const props = defineProps<{ entry: WlComponentManifest }>();
const selectedTab = ref<DocumentationTab>("examples");
const prefix = computed(() => "docs-" + props.entry.name.toLowerCase());
const anchors = computed(() => Object.fromEntries(["props", "events", "slots", "pt"].map((key) => [key, prefix.value + "-" + key])));
const extra = computed(() => documentationExample(props.entry.name));
const accessibility = computed(() => componentDocumentationAccessibility[props.entry.name] ?? []);
const ptSections = computed(() => documentationPtSections[props.entry.name]);
const service = computed(() => props.entry.name === "WlToast" ? "WlToastService" : props.entry.name === "WlConfirmDialog" ? "WlConfirmationService" : undefined);
const setupSource = computed(() => service.value ? [
  'import { createApp } from "vue";',
  'import { ' + service.value + ' } from "gavia-ui";',
  'import App from "./App.vue";',
  'const app = createApp(App);',
  'app.use(' + service.value + ');',
  'app.mount("#app");',
  '',
  '// В корневом App.vue один контейнер ' + props.entry.name + '.',
  '// import { ' + props.entry.name + ' } from "gavia-ui";',
  '// <' + props.entry.name + ' />'
].join("\n") : "");
async function showHeading(id: string): Promise<void> {
  if (!id.startsWith(prefix.value + "-")) return;
  selectedTab.value = id.endsWith("-accessibility") ? "accessibility"
    : ["props", "events", "slots", "pt"].some((key) => id === prefix.value + "-" + key) ? "api" : "examples";
  await nextTick();
  document.getElementById(id)?.scrollIntoView({ block: "start" });
}
function restoreHeading(): void {
  try { void showHeading(decodeURIComponent(window.location.hash.slice(1))); } catch { /* Ignore malformed URL fragments. */ }
}
onMounted(() => { restoreHeading(); window.addEventListener("hashchange", restoreHeading); });
onBeforeUnmount(() => window.removeEventListener("hashchange", restoreHeading));
defineExpose({ showHeading });
</script>
<template>
  <div class="docs-component-guide wl-stack" data-space="xl" :data-docs-component="entry.name">
    <DocumentationTabs v-model="selectedTab" :id-prefix="prefix" :component-name="entry.name">
      <template #outline><slot name="outline" /></template>
    </DocumentationTabs>
    <div v-show="selectedTab === 'examples'" :id="prefix + '-panel-examples'" role="tabpanel" :aria-labelledby="prefix + '-tab-examples'" class="wl-stack" data-space="2xl">
      <p class="wl-text-body wl-text-muted">Настройте props: пример и код используют один набор настроек. Сброс возвращает исходный пример.</p>
      <ComponentExplorer :entry="entry" layout="documentation" :heading-prefix="prefix" />
      <section v-if="extra?.component" class="wl-stack" data-space="lg" :aria-labelledby="prefix + '-examples'" :data-docs-component-extra="entry.name">
        <h2 :id="prefix + '-examples'" class="wl-text-heading">{{ extra.title }}</h2>
        <p class="wl-text-body wl-text-muted">{{ extra.description }}</p>
        <div class="docs-component-extra-preview" data-testid="docs-component-extra-preview"><component :is="extra.component" /></div>
        <div data-testid="docs-component-extra-source"><CodePanel :source="extra.source" title="Vue SFC · расширенный пример" /></div>
      </section>
      <p v-else class="docs-notice" role="alert">Расширенный пример не найден.</p>
      <section v-if="service" class="wl-stack" data-space="lg">
        <h2 :id="prefix + '-service'" class="wl-text-heading">Подключение сервиса</h2>
        <p class="wl-text-body">Установите {{ service }} на экземпляр Vue-приложения и разместите один {{ entry.name }} в App.vue. Состояние одного приложения не передаётся другому. Стили подключаются явно, как описано в установке.</p>
        <CodePanel :source="setupSource" title="main.ts · сервис и контейнер" />
      </section>
    </div>
    <div v-show="selectedTab === 'api'" :id="prefix + '-panel-api'" role="tabpanel" :aria-labelledby="prefix + '-tab-api'">
      <DocumentationContract :entry="entry" :anchors="anchors" :pt-sections="ptSections" />
    </div>
    <div v-show="selectedTab === 'accessibility'" :id="prefix + '-panel-accessibility'" role="tabpanel" :aria-labelledby="prefix + '-tab-accessibility'" class="wl-stack" data-space="lg">
      <h2 :id="prefix + '-accessibility'" class="wl-text-heading">Клавиатура и доступность</h2>
      <ul class="docs-component-rules"><li v-for="rule in accessibility" :key="rule">{{ rule }}</li></ul>
      <p v-if="entry.model" class="wl-text-body">Изменения передаются через <code>v-model{{ entry.model.name === 'modelValue' ? '' : ':' + entry.model.name }}</code>. Подпись и состояние должны оставаться понятными после выбора, отмены и сброса.</p>
      <p class="wl-text-body wl-text-muted">Проверьте клавиатуру, масштабирование и видимость фокуса в своей компоновке. Цвет дополняет подпись состояния; обязательная информация остаётся доступной во всех темах.</p>
    </div>
  </div>
</template>
<style>
.docs-component-guide { min-width: 0; }
.docs-component-extra-preview { min-width: 0; padding: var(--wl-space-lg); border: 1px solid var(--wl-border); border-radius: var(--wl-corner-surface); background: var(--wl-bg); overflow-wrap: anywhere; }
.docs-component-rules { display: grid; gap: var(--wl-space-md); margin: 0; padding-inline-start: var(--wl-space-lg); font-size: var(--wl-type-body-size); line-height: var(--wl-type-body-line-height); }
</style>
