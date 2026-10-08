<script setup lang="ts">
import { ref } from "vue";
import { WlButton } from "../../../../../../packages/ui-kit/src";
const folders = ["Все материалы", "Мои материалы", "Архив"];
const selected = ref("Все материалы");
</script>

<template>
  <div class="composition-example wl-grid" data-space="lg">
    <aside class="wl-surface wl-stack" data-space="md" aria-label="Разделы материалов">
      <h3 class="wl-text-subheading">Материалы</h3>
      <WlButton v-for="folder in folders" :key="folder" block :variant="selected === folder ? 'primary' : 'ghost'" :aria-pressed="selected === folder" @click="selected = folder">{{ folder }}</WlButton>
    </aside>
    <section class="wl-surface wl-stack" data-space="lg">
      <header class="wl-stack" data-space="sm"><h3 class="wl-text-subheading">{{ selected }}</h3><p class="wl-text-body wl-text-muted">В sidebar выбирается раздел, в основной области показывается его содержимое.</p></header>
      <div class="wl-grid" data-space="md"><article class="composition-example-card wl-stack" data-space="sm"><h4 class="wl-text-label">Инструкция</h4><p class="wl-text-small">Порядок областей сохраняется на мобильном экране.</p></article><article class="composition-example-card wl-stack" data-space="sm"><h4 class="wl-text-label">Шаблон</h4><p class="wl-text-small">Основная колонка может сжиматься благодаря minmax(0, 1fr).</p></article></div>
      <p class="wl-text-small wl-text-muted" role="status">Раздел: {{ selected }}</p>
    </section>
  </div>
</template>

<style scoped>
.composition-example { grid-template-columns: minmax(0, 1fr); }
.composition-example-card { min-width: 0; padding: var(--wl-space-md); border-radius: var(--wl-corner-control); background: var(--wl-bg-soft); }
@media (min-width: 900px) { .composition-example { grid-template-columns: 200px minmax(0, 1fr); } }
</style>
