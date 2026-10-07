# Gavia UI 0.9: шрифт и новая тема

Обновите зависимость до опубликованной версии 0.9.1:

```bash
pnpm add gavia-ui@0.9.1 vue
```

Публичные Wl-компоненты, CSS-классы, токены и прежние imports сохранены.
Vue остаётся единственным обязательным peer; runtime-зависимостей нет.
White остаётся базовой темой библиотеки. Новая Gavia включается явно:

```ts
import "gavia-ui/styles/reset.css";
import "gavia-ui/styles/fonts/gavia.css";
import "gavia-ui/styles/base.css";
import "gavia-ui/styles/primitives.css";
import "gavia-ui/themes/gavia.css";

document.documentElement.dataset.wlTheme = "gavia";
```

Gavia Sans меняет типографику только темы Gavia. Для White, Graphite или
Newspaper сохраните соответствующий импорт темы и data-wl-theme.
Шрифтовой CSS не импортируется автоматически из JavaScript. Тема Gavia
также выбирает точный рендеринг через новый `--wl-type-text-rendering`
(основан на `--wl-font-text-rendering`); настройки остальных тем сохранены.
Прежнее имя CSS-семейства Gavia остаётся alias для Gavia Sans; файловые
пути gavia-ui/styles/fonts/gavia.css и gavia-ui/fonts/gavia/* сохранены.
Файлы шрифта лицензированы отдельно под SIL OFL 1.1; код UI-кита — MIT.

WlDatePicker по умолчанию сохраняет строковую модель YYYY-MM-DD|null.
Для нового режима selectionMode="range" используйте тип WlDateRange
([start, end|null]) и не передавайте диапазон в одиночный режим.

[Подключение шрифта](font-gavia.md) · [Изменения](../CHANGELOG.md) ·
[Проверка публикации](releases.md)

## Следующие совместимые исправления 0.9.x

Новые семантические токены --wl-text-accent/--wl-text-accent-hover отделяют цвет
текста от фона primary-кнопки. Если переопределяете собственную палитру, проверьте
их контраст на bg/bg-raised/accent-soft; прежние имена токенов сохранены.
В Graphite текст акцента светлее для читаемости на мягких поверхностях.
Управление стилями по --wl-accent остаётся действующим для фоновых акцентов.
