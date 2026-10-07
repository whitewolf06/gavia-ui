<template>
  <section class="wl-surface wl-stack" data-space="lg">
    <header class="wl-stack" data-space="sm"><h3 class="wl-text-subheading">Сводка материалов</h3><p class="wl-text-small wl-text-muted">Поверхность объединяет связанные части. Разделитель отделяет описание от данных.</p></header>
    <hr class="wl-rule" />
    <div class="helpers-example-scroll wl-scroll-area" tabindex="0" role="region" aria-label="Сводка материалов, прокручиваемая таблица">
      <table class="helpers-example-table">
        <caption class="wl-visually-hidden">Материалы: название, статус и ответственный</caption>
        <thead><tr><th scope="col">Название</th><th scope="col">Статус</th><th scope="col">Ответственный</th></tr></thead>
        <tbody><tr><th scope="row">Инструкция по подключению</th><td>На проверке</td><td>Команда интерфейсов</td></tr><tr><th scope="row">Шаблон рабочего пространства</th><td>Готово</td><td>Команда продукта</td></tr></tbody>
      </table>
    </div>
    <p class="wl-text-small wl-text-muted">Tab переводит фокус в таблицу; стрелки прокручивают её при недостатке ширины. Остальная страница сохраняет свою ширину.</p>
  </section>
</template>

<style scoped>
.helpers-example-scroll { border: 1px solid var(--wl-border); border-radius: var(--wl-corner-control); }
.helpers-example-scroll:focus-visible { outline: 2px solid var(--wl-focus-color); outline-offset: 2px; }
.helpers-example-table { width: 100%; min-width: 600px; border-collapse: collapse; text-align: left; font-size: var(--wl-type-small-size); }
.helpers-example-table th, .helpers-example-table td { padding: var(--wl-space-md); border-bottom: 1px solid var(--wl-border); }
.helpers-example-table thead { background: var(--wl-bg-soft); }
.helpers-example-table tbody tr:last-child th, .helpers-example-table tbody tr:last-child td { border-bottom: 0; }
</style>
