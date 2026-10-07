<template>
  <article class="hierarchy-example wl-stack" data-space="lg">
    <header class="wl-stack" data-space="sm">
      <p class="wl-text-small wl-text-muted">Рабочие материалы · 3 октября</p>
      <h3 class="wl-text-heading">Подготовка к запуску</h3>
      <p class="wl-text-body">Перед публикацией проверьте настройки проекта и назначьте ответственного. Заголовок объясняет тему, основной текст — следующий шаг.</p>
    </header>
    <section class="wl-stack" data-space="sm">
      <h4 class="wl-text-subheading">Доступ к проекту</h4>
      <p class="wl-text-body">Участники получают права через группу <code class="wl-text-code">project-editors</code>.</p>
      <p class="wl-text-small wl-text-muted">Изменение прав не затронет уже сохранённые материалы.</p>
    </section>
    <dl class="hierarchy-example-meta">
      <div><dt class="wl-text-label">Ответственный</dt><dd class="wl-text-body">Анна Петрова</dd></div>
      <div><dt class="wl-text-label">Статус</dt><dd class="wl-text-body">Готово к проверке</dd></div>
    </dl>
  </article>
</template>

<style scoped>
.hierarchy-example { max-width: 65ch; overflow-wrap: anywhere; }
.hierarchy-example-meta { display: grid; gap: var(--wl-space-md); margin: 0; }
.hierarchy-example-meta dd { margin: var(--wl-space-xs) 0 0; }
</style>
