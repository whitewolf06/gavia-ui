<script setup lang="ts">
const steps = ["Исследование", "Прототип", "Разработка", "Проверка"];
</script>

<template>
  <section class="wl-stack" data-space="lg">
    <p class="wl-text-small wl-text-muted">Число колонок зависит от ширины окна, даже если пример расположен в узкой колонке документации.</p>
    <div class="viewport-layout-example wl-grid" data-space="md">
      <article v-for="(step, index) in steps" :key="step" class="wl-surface wl-stack" data-space="sm">
        <span class="wl-text-code wl-text-muted">0{{ index + 1 }}</span>
        <h3 class="wl-text-subheading">{{ step }}</h3>
        <p class="wl-text-small">Карточки сохраняют порядок чтения при перестройке.</p>
      </article>
    </div>
    <p class="wl-text-small" role="status">Текущий брейкпоинт:
      <span class="viewport-tier viewport-tier--base">до 640 px · 1 колонка</span>
      <span class="viewport-tier viewport-tier--sm">sm · от 640 px · 2 колонки</span>
      <span class="viewport-tier viewport-tier--md">md · от 900 px · 3 колонки</span>
      <span class="viewport-tier viewport-tier--lg">lg · от 1200 px · 4 колонки</span>
    </p>
  </section>
</template>

<style scoped>
.viewport-layout-example { grid-template-columns: minmax(0, 1fr); }
.viewport-tier { display: none; }
.viewport-tier--base { display: inline; }
/* Numeric values follow wlBreakpoints; CSS cannot read that TypeScript object. */
@media (min-width: 640px) {
  .viewport-layout-example { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .viewport-tier--base { display: none; }
  .viewport-tier--sm { display: inline; }
}
@media (min-width: 900px) {
  .viewport-layout-example { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .viewport-tier--sm { display: none; }
  .viewport-tier--md { display: inline; }
}
@media (min-width: 1200px) {
  .viewport-layout-example { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .viewport-tier--md { display: none; }
  .viewport-tier--lg { display: inline; }
}
</style>
