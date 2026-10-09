<script setup lang="ts">
import { usePlaygroundI18n } from "../i18n";
const { t } = usePlaygroundI18n();
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
  { name: "variants", id: "docs-button-variants", title: t('documentation.strings.s0066'), description: t('documentation.strings.s0067'), component: ButtonVariants, source: consumerSource(variantsSource) },
  { name: "sizes", id: "docs-button-sizes", title: t('documentation.strings.s0068'), description: t('documentation.strings.s0069'), component: ButtonSizes, source: consumerSource(sizesSource) },
  { name: "states", id: "docs-button-states", title: t('documentation.strings.s0070'), description: t('documentation.strings.s0071'), component: ButtonStates, source: consumerSource(statesSource) },
  { name: "slots", id: "docs-button-slot-layout", title: t('documentation.strings.s0072'), description: t('documentation.strings.s0073'), component: ButtonSlots, source: consumerSource(slotsSource) },
  { name: "form", id: "docs-button-form", title: t('documentation.strings.s0074'), description: t('documentation.strings.s0075'), component: ButtonForm, source: consumerSource(formSource) }
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
    <DocumentationTabs v-model="selectedTab" id-prefix="docs-button" component-name="WlButton" :label="t('documentation.strings.s0076')">
      <template #outline><slot name="outline" /></template>
    </DocumentationTabs>

    <div v-show="selectedTab === 'examples'" id="docs-button-panel-examples" role="tabpanel" aria-labelledby="docs-button-tab-examples" class="wl-stack" data-space="xl">
      <p class="wl-text-body wl-text-muted">{{ t('documentation.strings.s0077') }}</p>
      <div class="docs-button-workspace">
        <section class="docs-controls wl-stack" data-space="lg" :aria-labelledby="headings.controls.id">
          <div class="wl-inline" data-space="sm"><h2 :id="headings.controls.id" class="wl-text-subheading">{{ headings.controls.title }}</h2><WlButton size="sm" variant="ghost" @click="reset">{{ t('documentation.strings.s0078') }}</WlButton></div>
          <div v-for="control in enumControls" :key="control.name" class="docs-control-label">
            <span>{{ control.name }}</span>
            <WlSelect :id="'docs-control-' + control.name" class="docs-control-select" :aria-label="control.name" :aria-describedby="'docs-control-description-' + control.name" :data-testid="'docs-control-' + control.name" :model-value="enumValue(control)" :options="[...(control.values ?? [])]" @update:model-value="updateEnum(control.name, $event)" />
            <span :id="'docs-control-description-' + control.name" class="wl-text-small wl-text-muted">{{ control.description }}</span>
          </div>
          <div class="docs-control-flags wl-stack" data-space="md">
            <WlCheckbox v-for="control in booleanControls" :key="control.name" :model-value="Boolean(preview[control.name])" :data-testid="'docs-control-' + control.name" @update:model-value="updateBoolean(control.name, $event)">{{ control.name }}</WlCheckbox>
          </div>
          <p class="wl-text-small wl-text-muted">{{ t('documentation.strings.s0079') }} <code>default</code>{{ t('documentation.strings.s0080') }} <code>plus</code> {{ t('documentation.strings.s0081') }} <code>icon</code>.</p>
        </section>

        <div class="docs-button-output wl-stack" data-space="lg">
          <section class="wl-stack" data-space="md" :aria-labelledby="headings.preview.id">
            <h2 :id="headings.preview.id" class="wl-text-subheading">{{ headings.preview.title }}</h2>
            <div ref="previewElement" class="docs-button-preview" data-testid="docs-button-preview">
              <CanonicalButtonExample :key="revision" :preview="preview" />
            </div>
            <div class="wl-inline" data-space="sm">
              <WlButton size="sm" variant="ghost" :disabled="Boolean(preview.disabled || preview.loading)" @click="focusPreview">{{ t('documentation.strings.s0082') }}</WlButton>
              <span class="wl-text-small wl-text-muted">{{ t('documentation.strings.s0083') }}</span>
            </div>
            <p class="wl-text-small wl-text-muted">{{ t('documentation.strings.s0084') }}</p>
          </section>
          <section class="wl-stack" data-space="md" :aria-labelledby="headings.source.id" data-testid="docs-button-source">
            <h2 :id="headings.source.id" class="wl-text-subheading">{{ headings.source.title }}</h2>
            <CodePanel :source="source" :title="t('documentation.strings.s0085')" :expanded="true" />
          </section>
        </div>
      </div>
      <section v-for="example in examples" :key="example.name" class="docs-button-example wl-stack" data-space="lg" :data-docs-button-example="example.name" :aria-labelledby="example.id">
        <div class="wl-stack" data-space="sm">
          <h2 :id="example.id" class="wl-text-heading" :data-testid="'docs-button-example-heading-' + example.name">{{ example.title }}</h2>
          <p class="wl-text-body wl-text-muted">{{ example.description }}</p>
        </div>
        <div class="docs-button-example-preview" data-testid="docs-button-example-preview" role="region" :aria-label="example.title + t('documentation.strings.s0086')"><component :is="example.component" /></div>
        <div data-testid="docs-button-example-source"><CodePanel :source="example.source" :title="t('documentation.strings.s0002')" /></div>
      </section>
      <section class="docs-guide wl-stack" data-space="md">
        <h2 :id="headings.usage.id" class="wl-text-heading">{{ headings.usage.title }}</h2>
        <ul class="docs-guide-list">
          <li><strong>primary</strong> {{ t('documentation.strings.s0087') }} <strong>secondary</strong> {{ t('documentation.strings.s0088') }}</li>
          <li><strong>ghost</strong> {{ t('documentation.strings.s0089') }} <strong>link</strong> {{ t('documentation.strings.s0090') }}</li>
          <li><strong>block</strong> {{ t('documentation.strings.s0091') }} <strong>size</strong> {{ t('documentation.strings.s0089') }} <strong>density</strong> {{ t('documentation.strings.s0092') }}</li>
        </ul>
        <p class="wl-text-small wl-text-muted">{{ t('documentation.strings.s0093') }} <code>button</code>.</p>
      </section>
    </div>

    <div v-show="selectedTab === 'api'" id="docs-button-panel-api" role="tabpanel" aria-labelledby="docs-button-tab-api">
      <DocumentationContract :entry="entry" :pt-sections="buttonPtSections" :anchors="buttonContractAnchors" pt-key="button" />
    </div>

    <section v-show="selectedTab === 'accessibility'" id="docs-button-panel-accessibility" class="docs-guide wl-stack" data-space="lg" role="tabpanel" tabindex="0" aria-labelledby="docs-button-tab-accessibility">
      <h2 :id="headings.accessibility.id" class="wl-text-heading">{{ headings.accessibility.title }}</h2>
      <ul class="docs-guide-list">
        <li>{{ t('documentation.strings.s0094') }}</li>
        <li>{{ t('documentation.strings.s0095') }} <code>disabled</code> {{ t('documentation.strings.s0096') }} <code>loading</code> {{ t('documentation.strings.s0097') }} <code>disabled</code> {{ t('documentation.strings.s0098') }}</li>
        <li><code>loading</code> {{ t('documentation.strings.s0099') }} <code>aria-busy="true"</code>{{ t('documentation.strings.s0100') }} <code>aria-hidden="true"</code>{{ t('documentation.strings.s0101') }}</li>
        <li>{{ t('documentation.strings.s0102') }}</li>
        <li>{{ t('documentation.strings.s0103') }} <code>aria-label</code>{{ t('documentation.strings.s0104') }}</li>
        <li>{{ t('documentation.strings.s0105') }} <code>type="submit"</code> {{ t('documentation.strings.s0096') }} <code>type="reset"</code> {{ t('documentation.strings.s0106') }} <code>type="button"</code>{{ t('documentation.strings.s0107') }}</li>
      </ul>
      <p class="wl-text-small wl-text-muted">{{ t('documentation.strings.s0108') }}</p>
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
