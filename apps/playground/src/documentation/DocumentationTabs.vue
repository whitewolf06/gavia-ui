<script setup lang="ts">
import { usePlaygroundI18n } from "../i18n";
const { t } = usePlaygroundI18n();
import { nextTick, ref } from "vue";
export type DocumentationTab = "examples" | "api" | "accessibility";
const props = defineProps<{ modelValue: DocumentationTab; idPrefix: string; componentName: string; label?: string }>();
const emit = defineEmits<{ "update:modelValue": [value: DocumentationTab] }>();
const element = ref<HTMLElement | null>(null);
const tabs = [
  { key: "examples", label: t('documentation.strings.s0694') },
  { key: "api", label: "API" },
  { key: "accessibility", label: t('documentation.strings.s0695') }
] as const;
async function navigate(event: KeyboardEvent, index: number): Promise<void> {
  const next = event.key === "ArrowRight" ? (index + 1) % tabs.length
    : event.key === "ArrowLeft" ? (index + tabs.length - 1) % tabs.length
    : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : undefined;
  if (next === undefined) return;
  event.preventDefault();
  const key = tabs[next]!.key;
  emit("update:modelValue", key);
  await nextTick();
  element.value?.querySelector<HTMLButtonElement>('[data-docs-tab="' + key + '"]')?.focus();
}
</script>
<template>
  <div ref="element" class="docs-tabs" role="tablist" :aria-label="label ?? t('documentation.strings.s0696') + componentName" data-testid="docs-component-tabs">
    <button v-for="(tab, index) in tabs" :id="idPrefix + '-tab-' + tab.key" :key="tab.key" type="button" role="tab" class="docs-tab" :data-docs-tab="tab.key" :aria-selected="modelValue === tab.key" :aria-controls="idPrefix + '-panel-' + tab.key" :tabindex="modelValue === tab.key ? 0 : -1" @click="emit('update:modelValue', tab.key)" @keydown="navigate($event, index)">{{ tab.label }}</button>
  </div>
  <slot name="outline" />
</template>
<style>
.docs-tabs { display: flex; flex-wrap: wrap; gap: var(--wl-space-xs); }
.docs-tab { min-height: 44px; padding: var(--wl-space-sm) var(--wl-space-md); border: 0; border-radius: var(--wl-corner-control); background: transparent; color: var(--wl-text-muted); font: inherit; cursor: pointer; }
.docs-tab[aria-selected="true"] { background: var(--wl-accent-soft); color: var(--wl-text-accent); }
.docs-tab:not([aria-selected="true"]):hover { color: var(--wl-text); background: var(--wl-bg-soft); }
.docs-tab:focus-visible { outline: 2px solid var(--wl-focus-color); outline-offset: 2px; }
</style>
