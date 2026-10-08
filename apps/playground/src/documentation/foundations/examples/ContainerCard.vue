<script setup lang="ts">
import { ref } from "vue";
import { WlSelect, WlIcon } from "../../../../../../packages/ui-kit/src";
const width = ref("420px");
const widthOptions = ["280px", "420px", "640px"];
</script>

<template>
  <section class="wl-stack" data-space="lg">
    <div class="container-card-control wl-stack" data-space="xs"><label for="responsive-container-width" class="wl-text-label">Ширина контейнера</label><WlSelect id="responsive-container-width" v-model="width" aria-label="Ширина контейнера" :options="widthOptions" /></div>
    <div class="container-card-host" :style="{ width: 'min(100%, ' + width + ')' }">
      <article class="container-card-body wl-surface">
        <div class="container-card-illustration" aria-hidden="true"><WlIcon name="grid" :size="36" /></div>
        <div class="wl-stack" data-space="sm"><h3 class="container-card-heading wl-text-subheading">Карточка в узком и широком контейнере</h3><p class="wl-text-body">В узком sidebar карточка занимает одну колонку, в широкой области — две. Ширина окна остаётся прежней.</p></div>
      </article>
    </div>
    <p class="wl-text-small wl-text-muted" role="status">Запрошено: {{ width }}. Контейнер ограничен шириной родителя; две колонки появляются при фактической ширине от 420 px.</p>
  </section>
</template>

<style scoped>
.container-card-control { max-width: 240px; }
.container-card-host { container-type: inline-size; container-name: gavia-card; max-width: 100%; }
.container-card-body { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--wl-space-lg); }
.container-card-illustration { display: grid; place-items: center; min-height: 96px; border-radius: var(--wl-corner-surface); color: var(--wl-text-accent); background: var(--wl-accent-soft); }
@container gavia-card (min-width: 420px) {
  .container-card-body { grid-template-columns: 96px minmax(0, 1fr); align-items: center; }
}
@container gavia-card (min-width: 560px) {
  .container-card-heading { font-size: var(--wl-type-heading-size); }
}
</style>
