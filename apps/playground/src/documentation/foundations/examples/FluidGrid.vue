<script setup lang="ts">
import { ref } from "vue";
import { WlSelect } from "../../../../../../packages/ui-kit/src";
const minimum = ref("240px");
const gap = ref("20px");
const gutter = ref("24px");
const minimumOptions = ["180px", "240px", "320px"];
const gapOptions = ["12px", "20px", "32px"];
const gutterOptions = ["8px", "24px", "40px"];
</script>

<template>
  <section class="wl-stack" data-space="lg">
    <div class="fluid-grid-controls wl-grid" data-space="md">
      <div class="wl-stack" data-space="xs"><label for="responsive-minimum" class="wl-text-label">Минимум колонки</label><WlSelect id="responsive-minimum" v-model="minimum" aria-label="Минимум колонки" :options="minimumOptions" /></div>
      <div class="wl-stack" data-space="xs"><label for="responsive-gap" class="wl-text-label">Gap сетки</label><WlSelect id="responsive-gap" v-model="gap" aria-label="Gap сетки" :options="gapOptions" /></div>
      <div class="wl-stack" data-space="xs"><label for="responsive-gutter" class="wl-text-label">Боковой gutter</label><WlSelect id="responsive-gutter" v-model="gutter" aria-label="Боковой gutter" :options="gutterOptions" /></div>
    </div>
    <div class="fluid-grid-container wl-container wl-container--fluid" :style="{ '--wl-layout-grid-min': minimum, '--wl-layout-grid-gap': gap, '--wl-layout-page-gutter': gutter }">
      <!-- No data-space: this grid uses --wl-layout-grid-gap instead. -->
      <div class="wl-grid">
        <article v-for="index in 4" :key="index" class="wl-surface wl-stack" data-space="sm"><h3 class="wl-text-subheading">Карточка {{ index }}</h3><p class="wl-text-small">Auto-fit считает место внутри этой сетки.</p></article>
      </div>
    </div>
    <p class="wl-text-small wl-text-muted" role="status">Минимум: {{ minimum }} · gap: {{ gap }} · gutter: {{ gutter }}. Значения действуют только внутри примера.</p>
  </section>
</template>

<style scoped>
.fluid-grid-controls { grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr)); }
.fluid-grid-container { padding-block: var(--wl-space-md); background: var(--wl-bg-soft); border-radius: var(--wl-corner-surface); }
</style>
