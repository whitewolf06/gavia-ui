<script setup lang="ts">
import { ref, watch } from "vue";
import { WlButton } from "../../../../packages/ui-kit/src";
const props = defineProps<{ source: string; title?: string }>();
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
</script>

<template>
  <div class="ds-source wl-stack" data-space="sm">
    <div class="wl-inline" data-space="sm">
      <WlButton size="sm" variant="secondary" :loading="pending" @click="copy">{{ copied ? 'Скопировано' : 'Копировать код' }}</WlButton>
      <span class="wl-text-small wl-text-muted" role="status">{{ copied ? 'Vue-код скопирован.' : manual ? 'Буфер обмена недоступен. Скопируйте код из поля ниже.' : '' }}</span>
    </div>
    <textarea v-if="manual" class="ds-source-manual" readonly :value="source" aria-label="Код для ручного копирования" @focus="($event.target as HTMLTextAreaElement).select()" />
    <details>
      <summary class="ds-source-summary">{{ title ?? 'Показать Vue-код' }}</summary>
      <pre class="ds-source-code"><code>{{ source }}</code></pre>
    </details>
  </div>
</template>

<style>
.ds-source { min-width: 0; }
.ds-source-summary { cursor: pointer; color: var(--wl-text-muted); padding-block: var(--wl-space-sm); font-size: var(--wl-type-small-size); }
.ds-source-code { margin: 0; padding: var(--wl-space-lg); background: var(--wl-bg-soft); border: 1px solid var(--wl-border); border-radius: var(--wl-corner-surface); font: 12px/20px var(--wl-mono); color: var(--wl-text); overflow: auto; max-height: 480px; white-space: pre; }
.ds-source-manual { width: 100%; min-height: 180px; background: var(--wl-bg); color: var(--wl-text); border: 1px solid var(--wl-border); border-radius: var(--wl-corner-control); padding: var(--wl-space-md); font: 12px/20px var(--wl-mono); }
</style>
