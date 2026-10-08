# Обновление до Gavia UI 0.10.0

В 0.10.0 добавлена пятая тема Gavia Dark, White и Graphite получили названия
Classic и Classic Dark. Обновлены проверки совместимости и качества,
playground и отображение узких уведомлений. Публикация и результаты проверок
описаны в [истории релизов](releases.md).

## Breaking changes: типы каталога тем

`wlDesignThemes` — публичный readonly tuple. В 0.10.0 он содержит пять элементов
вместо четырёх; literal labels `"White"` / `"Graphite"` заменены на `"Classic"` /
`"Classic Dark"`. Код с точной длиной tuple, типом старой подписи или проверкой
подписи как идентификатора требует изменения. В исчерпывающих ветвлениях по
`WlThemeName` добавьте `gavia-dark`.

Идентификаторы `white` / `graphite`, прежние CSS-пути и позиции четырёх тем
сохранены. Gavia Dark добавлена в конец публичного каталога; группировка тем
в playground не меняет его порядок. Выбирайте тему через `name`, а `label`
используйте для отображения:

```ts
import { wlDesignThemes, type WlDesignTheme, type WlThemeName } from "gavia-ui";

const themes: readonly WlDesignTheme[] = wlDesignThemes;
const selectedTheme: WlThemeName = "gavia-dark";
const selected = themes.find((theme) => theme.name === selectedTheme);
```

[Подробная миграция каталога](migration-themes.md). Старые query-ссылки и черновики
с `white` / `graphite` переименовывать не требуется. Исторические снимки
контрактов сохраняются.

## Установка и подключение

Vue `^3.4.0` остаётся единственным обязательным peer. Runtime-зависимостей у
UI-кита нет; PrimeVue и PrimeIcons для подключения не нужны. Менеджер установки
потребителя не меняет API:

```bash
pnpm add gavia-ui@0.10.0 vue
# либо
npm install gavia-ui@0.10.0 vue
# либо
bun add gavia-ui@0.10.0 vue
```

Reset, CSS и шрифт подключаются явно. Для переключения всех пяти тем:

```ts
import { createApp } from "vue";
import App from "./App.vue";
import "gavia-ui/styles/reset.css";
import "gavia-ui/styles/fonts/gavia.css";
import "gavia-ui/styles/base.css";
import "gavia-ui/themes/white.css";
import "gavia-ui/themes/graphite.css";
import "gavia-ui/themes/newspaper.css";
import "gavia-ui/themes/gavia.css";
import "gavia-ui/themes/gavia-dark.css";

document.documentElement.dataset.wlTheme = "gavia";
createApp(App).mount("#app");
```

| Тема | `data-wl-theme` | CSS из пакета |
| --- | --- | --- |
| Gavia | `gavia` | `gavia-ui/themes/gavia.css` |
| Gavia Dark | `gavia-dark` | `gavia-ui/themes/gavia-dark.css` |
| Classic, прежде White | `white` | `gavia-ui/themes/white.css` |
| Classic Dark, прежде Graphite | `graphite` | `gavia-ui/themes/graphite.css` |
| Newspaper | `newspaper` | `gavia-ui/themes/newspaper.css` |

Для одной темы достаточно её CSS. При нескольких темах импортируйте `white.css`
первым: он задаёт fallback на `:root`. Выбор на `html` применяется и к
телепортированным оверлеям. Без явного выбора библиотека сохраняет Classic
(`white`); defaults `resolveWlToken` / `getWlThemeTokens` также прежние.

Основные Gavia / Gavia Dark используют Gavia Sans 0.6 и общую геометрию;
без `styles/fonts/gavia.css` доступен системный fallback. Classic / Classic Dark
сохраняют системный sans, Newspaper — системный текст и заголовки с засечками.
Код использует моноширинный стек `--wl-mono`. [Шрифт](font-gavia.md) ·
[Палитра и подключение](theme-gavia.md).

## Исправления и качество

- Поддержка Vue 3.4 уточнена в declarations и SSR-идентификаторах; Vue 3.5
  использует нативные идентификаторы. Для Vue 3.4 порядок синхронного SSR-дерева
  и гидратации должен совпадать; асинхронные ветви отдельно не гарантируются.
- Select, MultiSelect и Autocomplete получили имена и связи ARIA для списков.
  WlAlert переносит действия по доступной ширине, сохраняя читаемость текста.
- Playground показывает основные и дополнительные темы, дневной/ночной hero,
  быстрый переключатель и внешние ссылки информационных карточек. View Transitions
  даёт единый временный переход страницы; fallback использует crossfade hero,
  `prefers-reduced-motion` отключает переходы.
- Раздел «Качество и совместимость» показывает фактические unit-тесты,
  покрытие, время, версию и источник измерения. Эти показатели не заменяют
  результаты browser/visual/axe или подтверждение публикации.
- В процесс выпуска включены проверки прежнего TypeScript/CSS/pt-контракта,
  установленного архива, Node import, SSR/hydration, размера и покрытия;
  Changesets готовит версии, а CI хранит витрины теговых выпусков.

После обновления проверьте темы и собственные overrides, шрифты, ARIA/фокус,
оверлеи и узкие уведомления в приложении. Для SSR вставляйте
`context.teleports.body` перед корнем приложения; подробности и ограничения —
[совместимость и проверки](quality.md). [Изменения выпуска](../CHANGELOG.md).
