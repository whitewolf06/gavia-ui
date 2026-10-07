<template>
  <div class="wl-grid" data-space="lg">
    <article v-for="number in 4" :key="number" class="wl-surface wl-stack" data-space="sm">
      <h3 class="wl-text-subheading">Колонка {{ number }}</h3>
      <p class="wl-text-body">Карточки равной ширины, минимум каждой — --wl-layout-grid-min.</p>
      <p class="wl-text-small wl-text-muted">Промежуток берётся из data-space="lg". Последняя строка сохраняет те же колонки.</p>
    </article>
  </div>
</template>
