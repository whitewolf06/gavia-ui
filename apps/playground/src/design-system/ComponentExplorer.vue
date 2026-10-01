<script setup lang="ts">
import { computed, defineAsyncComponent, nextTick, ref, watch, type Component } from "vue";
import { WlButton, WlCheckbox } from "../../../../packages/ui-kit/src";
import type { WlComponentManifest } from "../../../../packages/ui-kit/src/manifest";
import CodePanel from "./CodePanel.vue";
import { consumerSource } from "./code";
import { stateCases, stateControls } from "./states";
const props = defineProps<{ entry: WlComponentManifest }>();
const modules = import.meta.glob<{ default: Component }>("./examples/*.vue");
const sources = import.meta.glob<string>("./examples/*.vue", { query: "?raw", import: "default", eager: true });
const examples = Object.fromEntries(Object.entries(modules).map(([path, loader]) => [path, defineAsyncComponent(loader)]));
const example = computed(() => examples[`./examples/${props.entry.name}.vue`]);
const controls = computed(() => stateControls(props.entry));
const cases = computed(() => stateCases(props.entry));
const overrides = ref<Record<string, unknown>>({});
const revision = ref(0);
const preview = ref<HTMLElement | null>(null);
const focused = ref(false);
const hovered = ref(false);
const exampleDefaults: Record<string, Record<string, unknown>> = {
  WlAvatar: { presence: "online" }, WlMultiSelect: { display: "chip" },
  WlTag: { removable: true }, WlAlert: { closable: true }, WlIcon: { size: 24 }
};
function controlValue(name: string, fallback: unknown): unknown {
  return overrides.value[name] ?? exampleDefaults[props.entry.name]?.[name] ?? fallback ?? (name === "motion" ? true : undefined);
}
function focusOut(event: FocusEvent): void {
  focused.value = event.relatedTarget instanceof Node && Boolean(preview.value?.contains(event.relatedTarget));
}
const source = computed(() => consumerSource(sources[`./examples/${props.entry.name}.vue`] ?? "", overrides.value));
function reset(): void { overrides.value = {}; revision.value++; focused.value = false; hovered.value = false; }
watch(() => props.entry.name, reset);
function chooseCase(value: Record<string, unknown>): void { overrides.value = { ...value }; revision.value++; }
function setEnum(key: string, event: Event): void {
  const target = event.target as HTMLSelectElement;
  const definition = controls.value.find((item) => item.name === key)!;
  const value = definition.values?.find((item) => String(item) === target.value);
  overrides.value = { ...overrides.value, [key]: value };
}
async function focusPreview(): Promise<void> {
  await nextTick();
  preview.value?.querySelector<HTMLElement>('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex="0"]:not([aria-disabled="true"]), a[href]')?.focus({ preventScroll: true });
}
</script>

<template>
  <div class="ds-explorer wl-stack" data-space="lg" data-testid="ds-explorer" :data-component="entry.name">
    <div class="wl-inline" data-space="md">
      <h4 class="wl-text-subheading">Живой пример</h4><WlButton size="sm" variant="ghost" @click="reset">Сбросить пример</WlButton>
    </div>
    <div v-if="controls.length" class="ds-explorer-controls">
      <template v-for="control in controls" :key="control.name">
        <WlCheckbox v-if="control.type === 'boolean'" :model-value="Boolean(controlValue(control.name, control.default))" @update:model-value="overrides = { ...overrides, [control.name]: $event }">{{ control.name }}</WlCheckbox>
        <label v-else class="wl-stack wl-text-small" data-space="xs">{{ control.name }}
          <select class="ds-native-select" :value="controlValue(control.name, control.default ?? control.values?.[0])" :aria-label="`Пример: ${control.name}`" @change="setEnum(control.name, $event)"><option v-for="value in control.values" :key="String(value)" :value="value">{{ value }}</option></select>
        </label>
      </template>
    </div>
    <div ref="preview" class="ds-example-preview" data-testid="ds-example-preview" @focusin="focused = true" @focusout="focusOut" @mouseenter="hovered = true" @mouseleave="hovered = false">
      <component :is="example" v-if="example" :key="`${entry.name}-${revision}`" :preview="overrides" />
      <p v-else role="alert">Пример не найден.</p>
    </div>
    <div class="wl-inline" data-space="sm"><WlButton size="sm" variant="ghost" @click="focusPreview">Проверить фокус</WlButton><span class="wl-text-small wl-text-muted" role="status">Фокус: {{ focused ? 'в примере' : 'вне примера' }} · указатель: {{ hovered ? 'в примере' : 'вне примера' }}</span></div>
    <p class="wl-text-small wl-text-muted">Hover и нажатие проверяйте мышью; focus — клавиатурой. Выбор, открытие и закрытие работают через настоящий v-model. Переключатели выше можно сочетать.</p>
    <details class="ds-state-matrix">
      <summary>Матрица вариантов и состояний · {{ cases.length }}</summary>
      <div class="wl-inline" data-space="sm"><WlButton v-for="item in cases" :key="item.id" size="sm" variant="secondary" :data-case="item.id" @click="chooseCase(item.props)">{{ item.label }}</WlButton></div>
    </details>
    <p v-if="entry.name === 'WlToast' || entry.name === 'WlConfirmDialog'" class="wl-text-small wl-text-muted">Сервис использует единственный контейнер в App.vue. Его motion и pt задаются там; состояние изолировано по Vue-приложению.</p>
    <CodePanel :source="source" />
  </div>
</template>

<style>
.ds-explorer-controls { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--wl-space-md); align-items: end; }
.ds-example-preview { min-width: 0; padding: var(--wl-space-lg); background: var(--wl-bg); border: 1px solid var(--wl-border); border-radius: var(--wl-corner-surface); overflow-wrap: anywhere; }
.ds-state-matrix { font-size: var(--wl-type-small-size); }
.ds-state-matrix summary { cursor: pointer; padding-block: var(--wl-space-sm); color: var(--wl-text-muted); }
.ds-state-matrix > div { padding-top: var(--wl-space-sm); }
</style>
