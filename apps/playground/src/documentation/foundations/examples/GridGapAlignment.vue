<script setup lang="ts">
import { ref } from "vue";
import { WlSelect } from "../../../../../../packages/ui-kit/src";
const space = ref("lg");
const alignment = ref("stretch");
const spaceOptions = ["sm", "md", "lg", "xl", "2xl"];
const alignmentOptions = [
  { label: "По началу", value: "start" },
  { label: "По центру", value: "center" },
  { label: "Растянуть", value: "stretch" }
];
</script>

<template>
  <section class="wl-stack" data-space="lg">
    <div class="alignment-example-controls wl-grid" data-space="md">
      <div class="wl-stack" data-space="xs"><label for="layout-gap" class="wl-text-label">Промежуток</label><WlSelect id="layout-gap" v-model="space" aria-label="Промежуток" :options="spaceOptions" /></div>
      <div class="wl-stack" data-space="xs"><label for="layout-alignment" class="wl-text-label">Выравнивание</label><WlSelect id="layout-alignment" v-model="alignment" aria-label="Выравнивание" :options="alignmentOptions" option-label="label" option-value="value" /></div>
    </div>
    <div class="alignment-example-grid wl-grid" :data-space="space" :style="{ alignItems: alignment }">
      <article class="wl-surface wl-stack" data-space="sm"><h3 class="wl-text-subheading">Короткая карточка</h3><p class="wl-text-body">Одна короткая мысль.</p></article>
      <article class="wl-surface wl-stack" data-space="sm"><h3 class="wl-text-subheading">Больше содержимого</h3><p class="wl-text-body">В этой карточке больше текста. Самая высокая карточка задаёт высоту ряда.</p><p class="wl-text-small wl-text-muted">Stretch растягивает соседей; start и center сохраняют их собственную высоту.</p></article>
    </div>
    <p class="wl-text-small wl-text-muted" role="status">Gap: {{ space }} · align-items: {{ alignment }}</p>
  </section>
</template>

<style scoped>
.alignment-example-controls { grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr)); }
.alignment-example-grid { grid-template-columns: minmax(0, 1fr); }
@media (min-width: 640px) { .alignment-example-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
