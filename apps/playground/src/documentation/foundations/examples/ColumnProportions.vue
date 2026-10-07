<template>
  <section class="wl-stack" data-space="lg">
    <div class="proportion-example wl-grid" data-space="md">
      <article class="proportion-example-wide wl-surface wl-stack" data-space="sm"><h3 class="wl-text-subheading">8 из 12</h3><p class="wl-text-body">Основной контент получает две трети ширины.</p></article>
      <aside class="proportion-example-aside wl-surface wl-stack" data-space="sm"><h3 class="wl-text-subheading">4 из 12</h3><p class="wl-text-body">Контекст или дополнительные действия.</p></aside>
      <article class="proportion-example-half wl-surface"><h3 class="wl-text-label">6 из 12</h3></article>
      <article class="proportion-example-half wl-surface"><h3 class="wl-text-label">6 из 12</h3></article>
    </div>
    <p class="wl-text-small wl-text-muted">Одна доля — одна из 12 доступных колонок после вычета gap. Ниже 900 px каждый блок занимает весь ряд.</p>
  </section>
</template>

<style scoped>
/* These classes belong to the application; Gavia does not define wl-col-* helpers. */
.proportion-example { grid-template-columns: repeat(12, minmax(0, 1fr)); }
.proportion-example-wide, .proportion-example-aside, .proportion-example-half { grid-column: span 12; min-width: 0; }
@media (min-width: 900px) {
  .proportion-example-wide { grid-column: span 8; }
  .proportion-example-aside { grid-column: span 4; }
  .proportion-example-half { grid-column: span 6; }
}
</style>
