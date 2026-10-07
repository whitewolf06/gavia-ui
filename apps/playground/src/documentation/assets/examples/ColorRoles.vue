<template>
  <section class="color-roles-example wl-stack" data-space="lg">
    <article class="color-roles-example-surface wl-stack" data-space="md"><h4 class="wl-text-subheading">Материалы команды</h4><p class="wl-text-body">Основной текст использует --wl-text на поверхности --wl-bg.</p><p class="wl-text-small wl-text-muted">Пояснение наследует --wl-text-muted; граница — --wl-border.</p></article>
    <div class="color-roles-example-accent wl-stack" data-space="sm"><h4 class="wl-text-label">Выбранный раздел</h4><p class="wl-text-small">Мягкое выделение: --wl-accent-soft и --wl-accent-border. Название остаётся видимым текстом.</p></div>
    <p class="color-roles-example-help wl-text-small">Дополнительная область использует --wl-bg-soft. CSS остаётся одинаковым при смене темы.</p>
  </section>
</template>

<style scoped>
.color-roles-example { min-width: 0; }
.color-roles-example-surface { min-width: 0; padding: var(--wl-space-lg); background: var(--wl-bg); color: var(--wl-text); border: 1px solid var(--wl-border); border-radius: var(--wl-corner-surface); }
.color-roles-example-accent { min-width: 0; padding: var(--wl-space-md); background: var(--wl-accent-soft); color: var(--wl-text); border: 1px solid var(--wl-accent-border); border-radius: var(--wl-corner-control); }
.color-roles-example-help { padding: var(--wl-space-md); background: var(--wl-bg-soft); color: var(--wl-text-muted); border-radius: var(--wl-corner-control); }
</style>
