# Gavia UI 0.9: шрифт и новая тема

Обновите зависимость после публикации версии 0.9.1:

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
Шрифтовой CSS не импортируется автоматически из JavaScript.
Прежнее имя CSS-семейства Gavia остаётся alias для Gavia Sans; файловые
пути gavia-ui/styles/fonts/gavia.css и gavia-ui/fonts/gavia/* сохранены.
Файлы шрифта лицензированы отдельно под SIL OFL 1.1; код UI-кита — MIT.

WlDatePicker по умолчанию сохраняет строковую модель YYYY-MM-DD|null.
Для нового режима selectionMode="range" используйте тип WlDateRange
([start, end|null]) и не передавайте диапазон в одиночный режим.

[Подключение шрифта](font-gavia.md) · [Изменения](../CHANGELOG.md) ·
[Проверка публикации](releases.md)
