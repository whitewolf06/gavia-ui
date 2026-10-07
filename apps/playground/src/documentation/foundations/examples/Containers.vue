<template>
  <section class="container-example wl-stack" data-space="lg">
    <div class="container-example-band">
      <div class="wl-container"><div class="container-example-body"><h3 class="wl-text-label">Обычный</h3><code>wl-container</code><p class="wl-text-small">Центрирование, page-max и боковой gutter.</p></div></div>
    </div>
    <div class="container-example-band">
      <div class="wl-container wl-container--narrow"><div class="container-example-body"><h3 class="wl-text-label">Для чтения</h3><code>wl-container--narrow</code><p class="wl-text-small">Максимум --wl-layout-reading-max: удобно для статьи или инструкции.</p></div></div>
    </div>
    <div class="container-example-band">
      <div class="wl-container wl-container--fluid"><div class="container-example-body"><h3 class="wl-text-label">Широкая рабочая область</h3><code>wl-container--fluid</code><p class="wl-text-small">Вся доступная ширина; боковые отступы сохранены.</p></div></div>
    </div>
    <div class="container-example-band">
      <div class="wl-container wl-container--full"><div class="container-example-body"><h3 class="wl-text-label">До края</h3><code>wl-container--full</code><p class="wl-text-small">Без ограничения ширины и без gutter; внутренний padding задаёт содержимое.</p></div></div>
    </div>
  </section>
</template>

<style scoped>
.container-example { min-width: 0; }
.container-example-band { background: var(--wl-accent-soft); border: 1px dashed var(--wl-accent); min-width: 0; }
.container-example-body { min-width: 0; background: var(--wl-bg-soft); color: var(--wl-text); padding: var(--wl-space-md); display: grid; gap: var(--wl-space-sm); overflow-wrap: anywhere; }
.container-example code { font: var(--wl-type-code-size)/var(--wl-type-code-line-height) var(--wl-mono); }
</style>
