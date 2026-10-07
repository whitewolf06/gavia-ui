<script setup lang="ts">
import { computed, defineAsyncComponent, nextTick, ref, watch, type Component } from "vue";
import { WlButton, WlCheckbox, WlInput, WlNumberInput, WlSelect } from "../../../../packages/ui-kit/src";
import type { WlComponentManifest } from "../../../../packages/ui-kit/src/manifest";
import CodePanel from "./CodePanel.vue";
import { consumerSource } from "./code";
import { documentationControls, stateCases, stateControls } from "./states";
import { acceptsDocumentationValue, documentationComplexProps, documentationDefaults, documentationPresets, type DocumentationControl } from "./documentation-controls";
const props = withDefaults(defineProps<{ entry: WlComponentManifest; layout?: "compact" | "documentation"; headingPrefix?: string }>(), { layout: "compact" });
const documentationLayout = computed(() => props.layout === "documentation");
const headingPrefix = computed(() => props.headingPrefix ?? "docs-" + props.entry.name.toLowerCase());
const modules = import.meta.glob<{ default: Component }>("./examples/*.vue");
const sources = import.meta.glob<string>("./examples/*.vue", { query: "?raw", import: "default", eager: true });
const examples = Object.fromEntries(Object.entries(modules).map(([path, loader]) => [path, defineAsyncComponent(loader)]));
const example = computed(() => examples[`./examples/${props.entry.name}.vue`]);
const canonicalSource = computed(() => sources[`./examples/${props.entry.name}.vue`] ?? "");
const controls = computed<DocumentationControl[]>(() => documentationLayout.value
  ? documentationControls(props.entry, canonicalSource.value)
  : stateControls(props.entry).map((control) => ({ ...control, editor: control.type === "boolean" ? "checkbox" : "select" })));
const canonicalDefaults = computed(() => documentationDefaults(props.entry, canonicalSource.value));
const complexProps = computed(() => documentationComplexProps(props.entry, controls.value));
const presets = computed(() => documentationLayout.value ? documentationPresets(props.entry) : []);
const presetId = ref("default");
const cases = computed(() => stateCases(props.entry));
const overrides = ref<Record<string, unknown>>({});
const revision = ref(0);
const preview = ref<HTMLElement | null>(null);
const focused = ref(false);
const hovered = ref(false);
const missingFocusTarget = ref(false);
function controlValue(name: string, fallback?: unknown): unknown {
  return Object.prototype.hasOwnProperty.call(overrides.value, name)
    ? overrides.value[name] : canonicalDefaults.value[name] ?? fallback;
}
function textValue(control: DocumentationControl): string {
  const value = controlValue(control.name, control.default);
  return typeof value === "string" ? value : "";
}
function numericValue(control: DocumentationControl): number | undefined {
  const value = controlValue(control.name, control.default);
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}
function numberBounds(control: DocumentationControl): { min: number; max: number } {
  const min = control.name === "max" ? controlValue("min") : undefined;
  const max = control.name === "min" ? controlValue("max") : undefined;
  return {
    min: typeof min === "number" ? min : control.numberMin ?? -1e12,
    max: typeof max === "number" ? max : control.numberMax ?? 1e12
  };
}
function setValue(control: DocumentationControl, value: unknown): void {
  if (!acceptsDocumentationValue(control, value)) return;
  if (control.editor === "number") {
    const bounds = numberBounds(control);
    if (typeof value !== "number" || value < bounds.min || value > bounds.max) return;
  }
  overrides.value = { ...overrides.value, [control.name]: value };
}
function initializeNumber(control: DocumentationControl): void {
  const bounds = numberBounds(control);
  setValue(control, Math.max(bounds.min, Math.min(bounds.max, 0)));
}
function clearOverride(name: string): void {
  const next = { ...overrides.value };
  delete next[name];
  // Restoring one bound must not leave the other override outside the canonical range.
  const restored = canonicalDefaults.value[name];
  if (name === "min" && typeof restored === "number" && typeof next.max === "number" && next.max < restored) delete next.max;
  if (name === "max" && typeof restored === "number" && typeof next.min === "number" && next.min > restored) delete next.min;
  overrides.value = next;
}
function iconOptions(control: DocumentationControl): { label: string; value: string | number }[] {
  return [{ label: "Без иконки", value: "" }, ...(control.values ?? []).map((value) => ({ label: String(value), value }))];
}
function choosePreset(value: unknown): void {
  if (typeof value !== "string" || value !== "default" && !presets.value.some((preset) => preset.id === value)) return;
  const next = { ...overrides.value };
  for (const preset of presets.value) for (const key of Object.keys(preset.props)) delete next[key];
  const preset = presets.value.find((item) => item.id === value);
  overrides.value = { ...next, ...(preset?.props ?? {}) };
  presetId.value = value;
}
function focusOut(event: FocusEvent): void {
  focused.value = event.relatedTarget instanceof Node && Boolean(preview.value?.contains(event.relatedTarget));
}
const source = computed(() => consumerSource(canonicalSource.value, overrides.value));
function reset(): void { overrides.value = {}; presetId.value = "default"; revision.value++; focused.value = false; hovered.value = false; missingFocusTarget.value = false; }
watch(() => props.entry.name, reset);
function chooseCase(value: Record<string, unknown>): void { overrides.value = { ...value }; revision.value++; }
async function focusPreview(): Promise<void> {
  await nextTick();
  const candidates = preview.value?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled):not([type="hidden"]), textarea:not(:disabled), select:not(:disabled), [tabindex="0"]:not([aria-disabled="true"]), a[href]');
  const target = Array.from(candidates ?? []).find((element) => element.getClientRects().length > 0 && !element.closest('[hidden], [inert], [aria-hidden="true"]') && getComputedStyle(element).visibility !== 'hidden');
  missingFocusTarget.value = !target;
  target?.focus({ preventScroll: true });
}
</script>

<template>
  <div class="ds-explorer" :class="documentationLayout ? 'docs-explorer-workspace' : 'wl-stack'" data-space="lg" data-testid="ds-explorer" :data-component="entry.name">
    <section class="ds-explorer-settings wl-stack" :class="{ 'docs-explorer-settings': documentationLayout }" data-space="lg" :aria-labelledby="documentationLayout ? headingPrefix + '-controls' : undefined">
      <div class="wl-inline" :data-space="documentationLayout ? 'sm' : 'md'">
        <h2 v-if="documentationLayout" :id="headingPrefix + '-controls'" class="wl-text-subheading">Настройки</h2>
        <h4 v-else class="wl-text-subheading">Живой пример</h4>
        <WlButton size="sm" variant="ghost" aria-label="Сбросить пример" @click="reset">{{ documentationLayout ? 'Сбросить' : 'Сбросить пример' }}</WlButton>
      </div>
      <div v-if="controls.length" class="ds-explorer-controls">
        <div v-for="control in controls" :key="control.name" class="ds-explorer-control wl-stack" data-space="xs">
          <WlCheckbox v-if="control.editor === 'checkbox'" :model-value="Boolean(controlValue(control.name, control.default))" :aria-describedby="documentationLayout && control.description ? headingPrefix + '-control-' + control.name : undefined" @update:model-value="setValue(control, $event)">{{ control.name }}</WlCheckbox>
          <template v-else>
            <span class="wl-text-small">{{ control.name }}</span>
            <WlInput v-if="control.editor === 'text'" :model-value="textValue(control)" :type="control.inputType ?? 'text'" :aria-label="'Пример: ' + control.name" :placeholder="controlValue(control.name, control.default) === undefined ? 'Не задано' : undefined" :aria-describedby="control.description ? headingPrefix + '-control-' + control.name : undefined" @update:model-value="setValue(control, $event)" />
            <template v-else-if="control.editor === 'number'">
              <WlNumberInput v-if="numericValue(control) !== undefined" :model-value="numericValue(control)!" :min="numberBounds(control).min" :max="numberBounds(control).max" :step="control.numberStep ?? 1" :aria-label="'Пример: ' + control.name" :aria-describedby="control.description ? headingPrefix + '-control-' + control.name : undefined" @update:model-value="setValue(control, $event)" />
              <div v-else class="wl-inline" data-space="sm"><span class="wl-text-small wl-text-muted">Не задано</span><WlButton size="sm" variant="secondary" :aria-label="'Задать ' + control.name" @click="initializeNumber(control)">Задать</WlButton></div>
            </template>
            <WlSelect v-else-if="control.editor === 'icon'" :model-value="controlValue(control.name, control.default)" :aria-label="'Пример: ' + control.name" placeholder="Не задано" :aria-describedby="control.description ? headingPrefix + '-control-' + control.name : undefined" :options="iconOptions(control)" option-label="label" option-value="value" @update:model-value="setValue(control, $event)" />
            <WlSelect v-else :model-value="controlValue(control.name, control.default ?? control.values?.[0])" :aria-label="'Пример: ' + control.name" :aria-describedby="documentationLayout && control.description ? headingPrefix + '-control-' + control.name : undefined" :options="[...(control.values ?? [])]" @update:model-value="setValue(control, $event)" />
          </template>
          <WlButton v-if="documentationLayout && Object.prototype.hasOwnProperty.call(overrides, control.name)" size="sm" variant="ghost" :aria-label="'Сбросить ' + control.name" @click="clearOverride(control.name)">По примеру</WlButton>
          <p v-if="documentationLayout && control.description" :id="headingPrefix + '-control-' + control.name" class="wl-text-small wl-text-muted">{{ control.description }}</p>
        </div>
      </div>
      <p v-else-if="documentationLayout" class="wl-text-small wl-text-muted">{{ entry.name === 'WlToast' || entry.name === 'WlConfirmDialog' ? 'Контейнер настраивается один раз в App.vue. На этой странице можно проверить вызовы сервиса.' : 'Данные и содержимое заданы в SFC-примере. Их структуру, параметры и слоты смотрите во вкладке API.' }}</p>
      <div v-if="presets.length" class="wl-stack" data-space="xs">
        <span class="wl-text-small">Данные примера</span>
        <WlSelect :model-value="presetId" aria-label="Пример: данные" :options="[{ label: 'Исходные данные', value: 'default' }, ...presets.map((preset) => ({ label: preset.label, value: preset.id }))]" option-label="label" option-value="value" @update:model-value="choosePreset" />
        <p class="wl-text-small wl-text-muted">Готовый набор сохраняет структуру данных; массив можно изменить в SFC ниже.</p>
      </div>
      <p v-if="documentationLayout && complexProps.length" class="wl-text-small wl-text-muted">Параметры <code>{{ complexProps.join(', ') }}</code>, модели, обработчики и слоты настраиваются в <a :href="'#' + headingPrefix + '-props'">API</a> и копируемом SFC. Составные данные не редактируются как произвольный JSON.</p>
      <p v-if="documentationLayout && (entry.name === 'WlMenu' || entry.name === 'WlAutocomplete')" class="wl-text-small wl-text-muted">{{ entry.name === 'WlMenu' ? 'Popup-меню с кнопкой открытия' : 'Множественный выбор с массивом значений' }} показан в <a :href="'#' + headingPrefix + '-examples'">расширенном примере ниже</a>.</p>
    </section>
    <div class="ds-explorer-output wl-stack" data-space="lg">
      <section class="wl-stack" :data-space="documentationLayout ? 'md' : 'lg'" :aria-labelledby="documentationLayout ? headingPrefix + '-preview' : undefined">
        <h2 v-if="documentationLayout" :id="headingPrefix + '-preview'" class="wl-text-subheading">Живой пример</h2>
        <div ref="preview" class="ds-example-preview" data-testid="ds-example-preview" @focusin="focused = true" @focusout="focusOut" @mouseenter="hovered = true" @mouseleave="hovered = false">
          <component :is="example" v-if="example" :key="entry.name + '-' + revision" :preview="overrides" />
          <p v-else role="alert">Пример не найден.</p>
        </div>
        <div class="wl-inline" data-space="sm"><WlButton size="sm" variant="ghost" @click="focusPreview">Проверить фокус</WlButton><span class="wl-text-small wl-text-muted" role="status">{{ missingFocusTarget ? 'В примере нет доступного элемента для фокуса.' : 'Фокус: ' + (focused ? 'в примере' : 'вне примера') + ' · указатель: ' + (hovered ? 'в примере' : 'вне примера') }}</span></div>
        <p class="wl-text-small wl-text-muted">Hover и нажатие проверяйте мышью; focus — клавиатурой. Выбор, открытие и закрытие работают через настоящий v-model. Переключатели {{ documentationLayout ? 'слева' : 'выше' }} можно сочетать.</p>
      </section>
      <section v-if="documentationLayout" class="wl-stack" data-space="md" :aria-labelledby="headingPrefix + '-source'" data-testid="ds-example-source">
        <h2 v-if="documentationLayout" :id="headingPrefix + '-source'" class="wl-text-subheading">Код для приложения</h2>
        <CodePanel :source="source" :expanded="documentationLayout" :title="documentationLayout ? 'Vue SFC · текущие настройки' : undefined" />
      </section>
      <details v-if="!documentationLayout" class="ds-state-matrix">
        <summary>Матрица вариантов и состояний · {{ cases.length }}</summary>
        <div class="wl-inline" data-space="sm"><WlButton v-for="item in cases" :key="item.id" size="sm" variant="secondary" :data-case="item.id" @click="chooseCase(item.props)">{{ item.label }}</WlButton></div>
      </details>
      <p v-if="entry.name === 'WlToast' || entry.name === 'WlConfirmDialog'" class="wl-text-small wl-text-muted">Сервис использует единственный контейнер в App.vue. Его motion и pt задаются там; состояние изолировано по Vue-приложению.</p>
      <CodePanel v-if="!documentationLayout" :source="source" />
    </div>
  </div>
</template>
<style>
.ds-explorer-controls { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--wl-space-md); align-items: end; }
.ds-example-preview { min-width: 0; padding: var(--wl-space-lg); background: var(--wl-bg); border: 1px solid var(--wl-border); border-radius: var(--wl-corner-surface); overflow-wrap: anywhere; }
.ds-state-matrix { font-size: var(--wl-type-small-size); }
.ds-state-matrix summary { cursor: pointer; padding-block: var(--wl-space-sm); color: var(--wl-text-muted); }
.ds-state-matrix > div { padding-top: var(--wl-space-sm); }
.ds-explorer-control, .ds-explorer-settings, .ds-explorer-output { min-width: 0; }
.docs-explorer-workspace { display: grid; grid-template-columns: minmax(180px, 240px) minmax(0, 1fr); gap: var(--wl-space-xl); align-items: start; min-width: 0; }
.docs-explorer-settings { padding: var(--wl-space-lg); border: 1px solid var(--wl-border); border-radius: var(--wl-corner-surface); background: var(--wl-bg-soft); }
.docs-explorer-settings .ds-explorer-controls { grid-template-columns: minmax(0, 1fr); align-items: start; gap: var(--wl-space-lg); }
.docs-explorer-settings .wl-select, .docs-explorer-settings .wl-input-wrap, .docs-explorer-settings .wl-stepper { width: 100%; min-width: 0; }
.docs-explorer-settings code { overflow-wrap: anywhere; }
@media (max-width: 860px) { .docs-explorer-workspace { grid-template-columns: minmax(0, 1fr); } }
</style>
