<script setup lang="ts">
import { resolveWlToken } from "../../../../../../packages/ui-kit/src";
const layers = [
  { label: "Base", token: "--wl-layer-base" },
  { label: "Sticky", token: "--wl-layer-sticky" },
  { label: "Popover", token: "--wl-layer-popover" }
] as const;
</script>

<template>
  <section class="wl-stack" data-space="lg">
    <div class="layers-example wl-isolate" role="img" aria-label="Локальное перекрытие слоёв: base снизу, sticky посередине, popover сверху">
      <div v-for="(layer, index) in layers" :key="layer.token" class="layers-example-card" :style="{ zIndex: 'var(' + layer.token + ')', insetInlineStart: 'calc(var(--wl-space-lg) * ' + index + ')', top: 'calc(var(--wl-space-2xl) * ' + index + ')' }">
        <h3 class="wl-text-label">{{ layer.label }} · {{ resolveWlToken(layer.token) }}</h3>
        <code class="wl-text-code">{{ layer.token }}</code>
      </div>
    </div>
    <p class="wl-text-small wl-text-muted">Иллюстрация изолирована с isolation: isolate. Порядок действует внутри неё; элементы не перекрывают меню или другие части документации.</p>
  </section>
</template>

<style scoped>
.layers-example { position: relative; min-width: 0; height: 260px; border: 1px dashed var(--wl-border); border-radius: var(--wl-corner-control); background: var(--wl-bg-soft); }
.layers-example-card { position: absolute; width: calc(100% - var(--wl-space-2xl)); min-width: 0; min-height: 128px; padding: var(--wl-space-md); display: grid; align-content: start; gap: var(--wl-space-sm); border: 1px solid var(--wl-border); border-radius: var(--wl-corner-control); background: var(--wl-bg); color: var(--wl-text); overflow-wrap: anywhere; box-shadow: var(--wl-elevation-floating); }
</style>
