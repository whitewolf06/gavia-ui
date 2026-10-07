<script setup lang="ts">
import { ref, watch } from "vue";
import { WlButton, WlIcon } from "../../../../packages/ui-kit/src";
import CodeHighlight from "./CodeHighlight.vue";
import type { CodeLanguage } from "./highlighting/tokenizer";
const props = defineProps<{ source: string; title?: string; expanded?: boolean; language?: CodeLanguage }>();
const copied = ref(false);
const pending = ref(false);
const manual = ref(false);
watch(() => props.source, () => { copied.value = false; manual.value = false; });
async function copy(): Promise<void> {
  pending.value = true;
  copied.value = false;
  manual.value = false;
  const source = props.source;
  try {
    await navigator.clipboard.writeText(source);
    if (source === props.source) copied.value = true;
  } catch {
    if (source === props.source) manual.value = true;
  } finally {
    pending.value = false;
  }
}
defineExpose({ copy });
</script>

<template>
  <div class="ds-source wl-stack" data-space="sm">
    <div class="ds-source-frame">
      <details :open="expanded">
        <summary class="ds-source-summary">{{ title ?? 'Показать Vue-код' }}</summary>
        <pre class="ds-source-code" tabindex="0" role="region" :aria-label="title ?? 'Исходный код'"><CodeHighlight :source="source" :language="language" /></pre>
      </details>
      <!-- Keep copy reachable when details are collapsed; the button belongs to the code frame. -->
      <div class="ds-source-copy" :class="{ 'is-pending': pending }">
        <WlButton class="ds-source-copy-button" size="sm" variant="ghost" :loading="pending"
          :aria-label="copied ? 'Скопировано' : 'Копировать код'" :title="copied ? 'Скопировано' : 'Копировать код'" @click="copy">
          <template #icon><WlIcon :name="copied ? 'check' : 'copy'" :size="16" /></template>
        </WlButton>
      </div>
    </div>
    <span class="wl-text-small wl-text-muted" role="status">{{ copied ? 'Код скопирован.' : manual ? 'Буфер обмена недоступен. Скопируйте код из поля ниже.' : '' }}</span>
    <textarea v-if="manual" class="ds-source-manual" readonly :value="source" aria-label="Код для ручного копирования" @focus="($event.target as HTMLTextAreaElement).select()" />
  </div>
</template>

<style>
.ds-source { min-width: 0; }
.ds-source-frame { position: relative; min-width: 0; border: 1px solid var(--wl-border); border-radius: var(--wl-corner-surface); background: var(--wl-bg-soft); }
.ds-source-summary { cursor: pointer; color: var(--wl-text-muted); padding: var(--wl-space-md) var(--wl-space-lg); padding-inline-end: calc(var(--wl-control-height-sm) + var(--wl-space-lg)); min-height: calc(var(--wl-control-height-sm) + var(--wl-space-md)); font-size: var(--wl-type-small-size); line-height: 1.6; overflow-wrap: anywhere; }
.ds-source-code { margin: 0; padding: var(--wl-space-sm) var(--wl-space-lg) var(--wl-space-lg); color: var(--wl-text); overflow: auto; max-height: 480px; white-space: pre; tab-size: 2; }
.ds-source-code, .ds-source-manual { font-family: "Cascadia Code", "SFMono-Regular", "Cascadia Mono", Consolas, Menlo, "Liberation Mono", var(--wl-mono), monospace; font-size: 13px; line-height: 1.7; font-variant-ligatures: none; letter-spacing: 0; }
.ds-source-code:focus-visible, .ds-source-summary:focus-visible, .ds-source-manual:focus-visible { outline: 2px solid var(--wl-focus-color); outline-offset: 2px; }
.ds-source-copy { position: absolute; inset-block-start: var(--wl-space-xs); inset-inline-end: var(--wl-space-xs); opacity: 1; transition: opacity 120ms ease; }
.ds-source-copy-button { width: var(--wl-control-height-sm); padding: 0; background: var(--wl-bg-soft); color: var(--wl-text-muted); }
.ds-source-copy-button:hover { color: var(--wl-text); background: var(--wl-bg-hover); }
.ds-source-manual { width: 100%; min-height: 180px; background: var(--wl-bg); color: var(--wl-text); border: 1px solid var(--wl-border); border-radius: var(--wl-corner-control); padding: var(--wl-space-md); }
@media (hover: hover) and (pointer: fine) {
  .ds-source-copy { opacity: 0; pointer-events: none; }
  .ds-source-frame:hover .ds-source-copy, .ds-source-frame:focus-within .ds-source-copy, .ds-source-copy.is-pending { opacity: 1; pointer-events: auto; }
}
@media (hover: none), (pointer: coarse), (any-pointer: coarse) { .ds-source-copy { opacity: 1; pointer-events: auto; } }
@media (prefers-reduced-motion: reduce) { .ds-source-copy { transition: none; } }
</style>
