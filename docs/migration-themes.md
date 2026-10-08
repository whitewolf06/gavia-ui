# Названия тем и Gavia Dark

Gavia Dark и новые подписи Classic / Classic Dark добавлены в 0.10.0.
При обновлении с 0.9.1 существующее подключение четырёх тем продолжает работать.
[Руководство перехода на 0.10.0](migration-0.10.0.md).

## Названия и идентификаторы

| Название в интерфейсе и каталоге | `data-wl-theme`, `WlThemeName` | Импорт CSS |
| --- | --- | --- |
| Gavia | `gavia` | `gavia-ui/themes/gavia.css` |
| Gavia Dark | `gavia-dark` | `gavia-ui/themes/gavia-dark.css` |
| Classic, прежде White | `white` | `gavia-ui/themes/white.css` |
| Classic Dark, прежде Graphite | `graphite` | `gavia-ui/themes/graphite.css` |
| Newspaper | `newspaper` | `gavia-ui/themes/newspaper.css` |

Classic / Classic Dark — названия для отображения. Идентификаторы
`white` / `graphite`, пути CSS, параметры `theme=white` / `theme=graphite`,
значения токенов и порядок существующих тем в каталоге сохраняются.
Не заменяйте идентификаторы на `classic` / `classic-dark`.
Базовые значения библиотеки и аргумент по умолчанию `resolveWlToken` /
`getWlThemeTokens` остаются Classic (`white`); playground по умолчанию использует Gavia.

## Каталог и типы

В `wlDesignThemes` добавлен пятый элемент Gavia Dark с `name: "gavia-dark"`.
Публичный readonly tuple вырос с четырёх до пяти элементов; literal labels
`"White"` / `"Graphite"` изменились на `"Classic"` / `"Classic Dark"`.
Код, фиксирующий старую длину tuple или точный тип прежней подписи, требует правки.
Сохранение прежних идентификаторов не гарантирует совместимость такого inferred типа.
Исторические снимки контрактов не переписываются ради прохождения проверки.

Используйте `WlDesignTheme` / `WlThemeName` и поле `name` для выбора темы,
а `label` — для отображения. Не привязывайте бизнес-логику к подписи или индексу:

```ts
import { wlDesignThemes, type WlDesignTheme, type WlThemeName } from "gavia-ui";

const themes: readonly WlDesignTheme[] = wlDesignThemes;
const selectedTheme: WlThemeName = "gavia-dark";
const selected = themes.find((theme) => theme.name === selectedTheme);
```

## Подключение Gavia Dark

```ts
import "gavia-ui/styles/reset.css";
import "gavia-ui/styles/fonts/gavia.css";
import "gavia-ui/styles/base.css";
import "gavia-ui/themes/gavia-dark.css";

document.documentElement.dataset.wlTheme = "gavia-dark";
```

Gavia Sans используется в обеих Gavia. Classic, Classic Dark и Newspaper
сохраняют прежнюю типографику. Без шрифтового CSS обе Gavia используют системный
fallback; JavaScript библиотеки не загружает CSS автоматически.

Для переключения всех пяти импортируйте `themes/white.css` первым, затем
`themes/graphite.css`, `themes/newspaper.css`, `themes/gavia.css` и
`themes/gavia-dark.css`. Выбирайте тему на `html`, чтобы телепортированные оверлеи
наследовали её. Прежние URL и сохранённые черновики с `white` / `graphite`
не требуют переименования.

Перед обновлением проверьте выбор пяти тем, ссылки с `theme`, контраст, шрифты,
состояния контролов и открытые оверлеи. [Темы](theme-gavia.md) ·
[каталог и токены](design-system.md#темы-и-совместимость) · [методика проверок](quality.md).
