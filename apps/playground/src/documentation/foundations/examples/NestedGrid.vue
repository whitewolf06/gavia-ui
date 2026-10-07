<template>
  <div class="wl-grid" data-space="xl">
    <section v-for="category in ['В работе', 'На проверке']" :key="category" class="wl-surface wl-stack" data-space="lg">
      <h3 class="wl-text-subheading">{{ category }}</h3>
      <div class="wl-grid" data-space="sm">
        <article v-for="number in 2" :key="number" class="nested-example-item wl-stack" data-space="sm"><h4 class="wl-text-label">Материал {{ number }}</h4><p class="wl-text-small">Внутренняя сетка зависит от ширины этой группы.</p></article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.nested-example-item { min-width: 0; padding: var(--wl-space-md); border: 1px solid var(--wl-border); border-radius: var(--wl-corner-control); background: var(--wl-bg-soft); }
</style>
