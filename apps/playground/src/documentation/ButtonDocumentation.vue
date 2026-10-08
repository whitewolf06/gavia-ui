<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, type Component } from "vue";
import { WlButton, WlCheckbox, WlSelect } from "../../../../packages/ui-kit/src";
import type { WlComponentManifest, WlPropManifest } from "../../../../packages/ui-kit/src/manifest";
import CanonicalButtonExample from "../design-system/examples/WlButton.vue";
import canonicalSource from "../design-system/examples/WlButton.vue?raw";
import CodePanel from "../design-system/CodePanel.vue";
import ButtonVariants from "./button/Variants.vue";
import variantsSource from "./button/Variants.vue?raw";
import ButtonSizes from "./button/Sizes.vue";
import sizesSource from "./button/Sizes.vue?raw";
import ButtonStates from "./button/States.vue";
import statesSource from "./button/States.vue?raw";
import ButtonSlots from "./button/Slots.vue";
import slotsSource from "./button/Slots.vue?raw";
import ButtonForm from "./button/Form.vue";
import formSource from "./button/Form.vue?raw";
import { consumerSource } from "../design-system/code";
import DocumentationContract from "./DocumentationContract.vue";
import DocumentationTabs, { type DocumentationTab } from "./DocumentationTabs.vue";
import { buttonContractAnchors, buttonDocumentationHeadings as headings, buttonDocumentationToc, buttonPtSections } from "./catalog";

const props = defineProps<{ entry: WlComponentManifest }>();
const enumControls = computed(() => props.entry.props.filter((prop) => prop.type === "enum" && prop.values?.length));
const booleanControls = computed(() => props.entry.props.filter((prop) => prop.type === "boolean"));
function defaults(): Record<string, unknown> {
  return Object.fromEntries(props.entry.props.filter((prop) => prop.type === "enum" || prop.type === "boolean").map((prop) => [prop.name, prop.default]));
}
const preview = ref(defaults());
const revision = ref(0);
const previewElement = ref<HTMLElement | null>(null);
const selectedTab = ref<DocumentationTab>("examples");
const source = computed(() => consumerSource(canonicalSource, preview.value));

interface ButtonExample { name: string; id: string; title: string; description: string; component: Component; source: string; }
const examples: readonly ButtonExample[] = [
  { name: "variants", id: "docs-button-variants", title: "Все варианты", description: "Все допустимые значения variant рядом: основное действие, дополнительные действия и действия с риском удаления.", component: ButtonVariants, source: consumerSource(variantsSource) },
  { name: "sizes", id: "docs-button-sizes", title: "Размеры и плотность", description: "Четыре размера в обычной и компактной плотности. Сравните их сразу или скройте компактный ряд.", component: ButtonSizes, source: consumerSource(sizesSource) },
  { name: "states", id: "docs-button-states", title: "Disabled и loading", description: "Постоянные образцы состояний и управляемое сохранение с завершением, отменой и повтором.", component: ButtonStates, source: consumerSource(statesSource) },
  { name: "slots", id: "docs-button-slot-layout", title: "Иконки и содержимое слотов", description: "Иконка слева, композиция справа, кнопка без текста и default-слот со счётчиком.", component: ButtonSlots, source: consumerSource(slotsSource) },
  { name: "form", id: "docs-button-form", title: "Ширина кнопки и отправка формы", description: "Переключайте block, заполните обязательное поле и сравните нативные button, submit и reset.", component: ButtonForm, source: consumerSource(formSource) }
];

function updateEnum(name: string, value: unknown): void {
  const definition = enumControls.value.find((prop) => prop.name === name);
  if (definition?.values?.some((option) => Object.is(option, value))) {
    preview.value = { ...preview.value, [name]: value };
  }
}
function enumValue(control: WlPropManifest): string | number | undefined {
  const value = preview.value[control.name];
  if (typeof value !== "string" && typeof value !== "number") return undefined;
  return control.values?.some((option) => Object.is(option, value)) ? value : undefined;
}
function updateBoolean(name: string, value: unknown): void {
  preview.value = { ...preview.value, [name]: Boolean(value) };
}
function reset(): void {
  preview.value = defaults();
  revision.value++;
}
async function focusPreview(): Promise<void> {
  await nextTick();
  previewElement.value?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus({ preventScroll: true });
}
async function showHeading(id: string): Promise<void> {
  const heading = buttonDocumentationToc.find((item) => item.id === id) ?? examples.map((example) => ({ ...example, tab: "examples" as const })).find((example) => example.id === id);
  if (!heading) return;
  selectedTab.value = heading.tab;
  await nextTick();
  document.getElementById(id)?.scrollIntoView({ block: "start" });
}
function restoreHeading(): void {
  let id: string;
  try { id = decodeURIComponent(window.location.hash.slice(1)); }
  catch { return; }
  void showHeading(id);
}
onMounted(() => { restoreHeading(); window.addEventListener("hashchange", restoreHeading); });
onBeforeUnmount(() => { window.removeEventListener("hashchange", restoreHeading); });
defineExpose({ showHeading });
</script>

<template>
  <div class="docs-button wl-stack" data-space="xl" data-docs-component="WlButton">
    <DocumentationTabs v-model="selectedTab" id-prefix="docs-button" component-name="WlButton" label="Разделы WlButton">
      <template #outline><slot name="outline" /></template>
    </DocumentationTabs>

    <div v-show="selectedTab === 'examples'" id="docs-button-panel-examples" role="tabpanel" aria-labelledby="docs-button-tab-examples" class="wl-stack" data-space="xl">
      <p class="wl-text-body wl-text-muted">Настройте props: пример и код используют один набор настроек.</p>
      <div class="docs-button-workspace">
        <section class="docs-controls wl-stack" data-space="lg" :aria-labelledby="headings.controls.id">
          <div class="wl-inline" data-space="sm"><h2 :id="headings.controls.id" class="wl-text-subheading">{{ headings.controls.title }}</h2><WlButton size="sm" variant="ghost" @click="reset">Сбросить</WlButton></div>
          <div v-for="control in enumControls" :key="control.name" class="docs-control-label">
            <span>{{ control.name }}</span>
            <WlSelect :id="'docs-control-' + control.name" class="docs-control-select" :aria-label="control.name" :aria-describedby="'docs-control-description-' + control.name" :data-testid="'docs-control-' + control.name" :model-value="enumValue(control)" :options="[...(control.values ?? [])]" @update:model-value="updateEnum(control.name, $event)" />
            <span :id="'docs-control-description-' + control.name" class="wl-text-small wl-text-muted">{{ control.description }}</span>
          </div>
          <div class="docs-control-flags wl-stack" data-space="md">
            <WlCheckbox v-for="control in booleanControls" :key="control.name" :model-value="Boolean(preview[control.name])" :data-testid="'docs-control-' + control.name" @update:model-value="updateBoolean(control.name, $event)">{{ control.name }}</WlCheckbox>
          </div>
          <p class="wl-text-small wl-text-muted">Подпись «Добавить» передаётся в <code>default</code>-слот, иконка <code>plus</code> — в <code>icon</code>.</p>
        </section>

        <div class="docs-button-output wl-stack" data-space="lg">
          <section class="wl-stack" data-space="md" :aria-labelledby="headings.preview.id">
            <h2 :id="headings.preview.id" class="wl-text-subheading">{{ headings.preview.title }}</h2>
            <div ref="previewElement" class="docs-button-preview" data-testid="docs-button-preview">
              <CanonicalButtonExample :key="revision" :preview="preview" />
            </div>
            <div class="wl-inline" data-space="sm">
              <WlButton size="sm" variant="ghost" :disabled="Boolean(preview.disabled || preview.loading)" @click="focusPreview">Фокус на примере</WlButton>
              <span class="wl-text-small wl-text-muted">Tab → Enter или Space</span>
            </div>
            <p class="wl-text-small wl-text-muted">Loading заменяет иконку спиннером и блокирует повторный click. Disabled тоже блокирует действие. В этом примере нет формы: submit и reset меняют атрибут type, а поведение формы проверяйте в приложении.</p>
          </section>
          <section class="wl-stack" data-space="md" :aria-labelledby="headings.source.id" data-testid="docs-button-source">
            <h2 :id="headings.source.id" class="wl-text-subheading">{{ headings.source.title }}</h2>
            <CodePanel :source="source" title="Vue SFC · текущие настройки" :expanded="true" />
          </section>
        </div>
      </div>
      <section v-for="example in examples" :key="example.name" class="docs-button-example wl-stack" data-space="lg" :data-docs-button-example="example.name" :aria-labelledby="example.id">
        <div class="wl-stack" data-space="sm">
          <h2 :id="example.id" class="wl-text-heading" :data-testid="'docs-button-example-heading-' + example.name">{{ example.title }}</h2>
          <p class="wl-text-body wl-text-muted">{{ example.description }}</p>
        </div>
        <div class="docs-button-example-preview" data-testid="docs-button-example-preview" role="region" :aria-label="example.title + ' — живой пример'"><component :is="example.component" /></div>
        <div data-testid="docs-button-example-source"><CodePanel :source="example.source" title="Vue SFC · пример для приложения" /></div>
      </section>
      <section class="docs-guide wl-stack" data-space="md">
        <h2 :id="headings.usage.id" class="wl-text-heading">{{ headings.usage.title }}</h2>
        <ul class="docs-guide-list">
          <li><strong>primary</strong> — основное действие группы; <strong>secondary</strong> — дополнительное.</li>
          <li><strong>ghost</strong> и <strong>link</strong> — менее заметные действия; danger-варианты — действия с риском удаления.</li>
          <li><strong>block</strong> заполняет доступную ширину; <strong>size</strong> и <strong>density</strong> меняют геометрию без изменения DOM-контракта.</li>
        </ul>
        <p class="wl-text-small wl-text-muted">Полный список вариантов берётся из манифеста в настройках и API. Для перехода по URL используйте ссылку; WlButton рендерит нативный <code>button</code>.</p>
      </section>
    </div>

    <div v-show="selectedTab === 'api'" id="docs-button-panel-api" role="tabpanel" aria-labelledby="docs-button-tab-api">
      <DocumentationContract :entry="entry" :pt-sections="buttonPtSections" :anchors="buttonContractAnchors" pt-key="button" />
    </div>

    <section v-show="selectedTab === 'accessibility'" id="docs-button-panel-accessibility" class="docs-guide wl-stack" data-space="lg" role="tabpanel" tabindex="0" aria-labelledby="docs-button-tab-accessibility">
      <h2 :id="headings.accessibility.id" class="wl-text-heading">{{ headings.accessibility.title }}</h2>
      <ul class="docs-guide-list">
        <li>Доступная кнопка получает фокус по Tab и активируется Enter или Space. Видимый focus сохраняется во всех темах.</li>
        <li>При <code>disabled</code> или <code>loading</code> нативный <code>disabled</code> блокирует click и исключает кнопку из Tab-порядка.</li>
        <li><code>loading</code> задаёт <code>aria-busy="true"</code>. Спиннер имеет <code>aria-hidden="true"</code>; текст кнопки остаётся её доступным именем.</li>
        <li>Объясняйте причину недоступности рядом с действием. Не передавайте смысл только цветом или иконкой.</li>
        <li>У кнопки только с иконкой должно быть доступное имя, например <code>aria-label</code>. Для этого сценария также есть WlIconButton.</li>
        <li>Внутри формы задавайте <code>type="submit"</code> или <code>type="reset"</code> намеренно; по умолчанию используется безопасный <code>type="button"</code>.</li>
      </ul>
      <p class="wl-text-small wl-text-muted">Проверка на этой странице: вернитесь к примерам, нажмите «Фокус на примере», нажмите Enter/Space и проверьте счётчик. Затем включите disabled или loading: действие перестанет выполняться.</p>
    </section>
  </div>
</template>

<style>
.docs-button { min-width: 0; }
.docs-button-workspace { display: grid; grid-template-columns: minmax(180px, 240px) minmax(0, 1fr); gap: var(--wl-space-xl); align-items: start; }
.docs-controls { min-width: 0; padding: var(--wl-space-lg); border: 1px solid var(--wl-border); border-radius: var(--wl-corner-surface); background: var(--wl-bg-soft); }
.docs-control-label { display: grid; gap: var(--wl-space-xs); min-width: 0; font-size: var(--wl-type-small-size); }
.docs-control-select { width: 100%; min-width: 0; }
.docs-control-flags { padding-top: var(--wl-space-xs); }
.docs-button-output { min-width: 0; }
.docs-button-preview { min-width: 0; padding: var(--wl-space-xl); border: 1px solid var(--wl-border); border-radius: var(--wl-corner-surface); background: var(--wl-bg); overflow-wrap: anywhere; }
.docs-button-example { min-width: 0; }
.docs-button-example-preview { min-width: 0; padding: var(--wl-space-lg); border: 1px solid var(--wl-border); border-radius: var(--wl-corner-surface); background: var(--wl-bg); overflow-wrap: anywhere; }
.docs-guide { min-width: 0; }
.docs-guide-list { display: grid; gap: var(--wl-space-sm); margin: 0; padding-left: var(--wl-space-lg); font-size: var(--wl-type-body-size); line-height: var(--wl-type-body-line-height); }
@media (max-width: 860px) { .docs-button-workspace { grid-template-columns: minmax(0, 1fr); } }
</style>
