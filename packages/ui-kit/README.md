<p align="center">
  <img src="https://raw.githubusercontent.com/whitewolf06/gavia-ui/main/docs/brand/gavia-ui-mark-lake.svg" alt="Гагара — знак Gavia UI" width="64" height="64">
</p>

# Gavia UI

Бесплатная библиотека компонентов и дизайн-система для **Vue 3 + TypeScript**.
В составе: **53 компонента, 113 SVG-иконок, 447 дизайн-токенов, четыре темы
и гарнитура Gavia Sans 0.6**. Runtime-зависимостей нет; Vue 3 — единственный
обязательный peer. Стили подключаются явно.

<p align="center">
  <a href="https://whitewolf06.github.io/gavia-ui/"><img src="https://raw.githubusercontent.com/whitewolf06/gavia-ui/main/docs/brand/playground-button.svg" alt="Открыть Playground" width="230" height="44"></a><br>
  · <a href="https://whitewolf06.github.io/gavia-ui/?view=docs">Документация</a>
  · <a href="https://whitewolf06.github.io/gavia-ui/?view=font">Gavia Sans</a>
  · <a href="https://github.com/whitewolf06/gavia-ui">GitHub</a>
</p>

Версия **0.9.1**. [История изменений](CHANGELOG.md) ·
[Миграция 0.9](https://github.com/whitewolf06/gavia-ui/blob/main/docs/migration-0.9.md) ·
[История ребрендинга](https://github.com/whitewolf06/gavia-ui/blob/main/docs/migration-gavia.md).
Код UI Kit — [MIT](LICENSE), файлы шрифта —
[SIL OFL 1.1](https://github.com/whitewolf06/gavia-ui/blob/main/packages/ui-kit/fonts/gavia/OFL.txt).

## Быстрый старт

```bash
pnpm add gavia-ui@0.9.1 vue
# либо
npm install gavia-ui@0.9.1 vue
# либо
bun add gavia-ui@0.9.1 vue
```

```ts
// main.ts
import { createApp } from "vue";
import "gavia-ui/styles/reset.css";
import "gavia-ui/styles/fonts/gavia.css";
import "gavia-ui/styles/base.css";
import "gavia-ui/styles/primitives.css"; // необязательные классы компоновки и типографики
import "gavia-ui/themes/gavia.css";
import App from "./App.vue";

document.documentElement.dataset.wlTheme = "gavia";
createApp(App).mount("#app");
```

```vue
<script setup lang="ts">
import { WlButton } from "gavia-ui";
</script>

<template>
  <WlButton>Создать проект</WlButton>
</template>
```

Вместо строки `dataset.wlTheme` можно указать `<html data-wl-theme="gavia">`
в `index.html`. Gavia использует Gavia Sans; без шрифтового CSS доступен системный
fallback. Без выбора темы библиотека сохраняет White. Для White, Graphite или
Newspaper импортируйте соответствующий CSS и выберите одноимённый `data-wl-theme`.
`WlConfig` для базового подключения не требуется.

## Шрифт Gavia Sans

Gavia Sans 0.6 входит в пакет: кириллица и латиница, шесть весов
100 / 300 / 400 / 500 / 600 / 700 с прямым и наклонным начертанием, WOFF2 и TTF.
Она служит основным шрифтом **только темы Gavia**; White, Graphite и Newspaper
сохраняют свою типографику. Подключение явное: `import "gavia-ui/styles/fonts/gavia.css";`.

Файлы доступны через `gavia-ui/fonts/gavia/<file>` и применимы без Vue.
[Образцы и скачивание Gavia-Sans-0.6.zip](https://whitewolf06.github.io/gavia-ui/?view=font) ·
[Подключение и лицензия](https://github.com/whitewolf06/gavia-ui/blob/main/docs/font-gavia.md).
Старое CSS-имя `Gavia` зарегистрировано как совместимый алиас; пути импорта
и имена файлов `Gavia-*.ttf` / `Gavia-*.woff2` сохранены.

## Дизайн-система

Общие роли типографики, шкала расстояний, поверхности, состояния и UI-паттерны
описаны в [руководстве](https://github.com/whitewolf06/gavia-ui/blob/main/docs/design-system.md). Playground `?view=system`
показывает 447 токенов, четыре темы и контракты 53 компонентов.

Опциональная компоновка и типографика: явный импорт
`gavia-ui/styles/primitives.css`. Экспорты `wlDesignTokens`,
`wlDesignThemes`, `wlSpacing`, `wlTypography`, `wlBreakpoints`, `resolveWlToken`,
`getWlThemeTokens` работают без DOM. JSON-каталог доступен по
`gavia-ui/design-tokens.json`. Исходник токенов обновляется через
`pnpm tokens:sync`, проверяется через `pnpm tokens:check`.

Старые CSS-токены сохраняют имена и значения. Для доступного контраста кнопки
primary/danger используют новые роли `--wl-action-primary-*` и
`--wl-action-danger-*`. Собственные цвета кнопок настраивайте через bg/hover/text
и проверяйте их сочетания. Во всех темах добавлена видимая обводка фокуса.
Подсказки полей, заголовки и пустые состояния используют `--wl-text-muted`.

Независимая библиотека компонентов Gavia UI: Vue 3 + TypeScript (strict), собственный DOM
и поведение; стили — обычный CSS с custom properties
`--wl-*` и CSS Layers. Без Pinia, роутера, API-клиентов и бизнес-логики.

## Peer dependencies

| Пакет        | Версия | Обязательность             |
| ------------ | ------ | -------------------------- |
| `vue`        | ^3.4   | обязательный peer          |

## Необязательная конфигурация

WlConfig задаёт глобальные pt, локаль и анимацию. Сервисы подключайте, если
используете уведомления или диалог подтверждения:

```ts
// main.ts
import { createApp } from "vue";
import { WlConfig, WlToastService, WlConfirmationService, wlLocaleRu } from "gavia-ui";

// Стили подключаются явно: reset → шрифт → base → тема
import "gavia-ui/styles/reset.css";
import "gavia-ui/styles/fonts/gavia.css";
import "gavia-ui/styles/base.css";
import "gavia-ui/themes/gavia.css";

import App from "./App.vue";

document.documentElement.dataset.wlTheme = "gavia";
const app = createApp(App);
app.use(WlConfig, { locale: wlLocaleRu });
app.use(WlToastService);
app.use(WlConfirmationService);
app.mount("#app");
```

```vue
<script setup lang="ts">
import { ref } from "vue";
import { WlButton, WlInput, WlTag } from "gavia-ui";

const text = ref("");
</script>

<template>
  <WlButton variant="primary" size="md">Создать</WlButton>
  <WlInput v-model="text" placeholder="Название задачи" />
  <WlTag variant="blue">Релиз 2.0</WlTag>
</template>
```

Библиотека не импортирует CSS из JS. `WlConfig` необязателен; русская локаль и
стандартная карта `pt` используются по умолчанию. Сервисы устанавливаются только
если нужны соответствующие компоненты. См. [миграцию 0.5](https://github.com/whitewolf06/gavia-ui/blob/main/docs/migration-0.5.md).

## Exports

| Subpath | Содержимое |
| --- | --- |
| `gavia-ui` | ESM + `.d.ts`: компоненты, типы, `createWlPt`, `WlTooltip`, manifest и токены |
| `gavia-ui/styles/reset.css` | минимальный reset (слой `wl.reset`) |
| `gavia-ui/styles/base.css` | токены + стили компонентов (`wl.tokens`, `wl.components`) |
| `gavia-ui/styles/primitives.css` | необязательные классы компоновки и типографики |
| `gavia-ui/styles/fonts/gavia.css` | явное подключение Gavia Sans и совместимого CSS-алиаса `Gavia` |
| `gavia-ui/fonts/gavia/<file>` | WOFF2, TTF и лицензии шрифта |
| `gavia-ui/themes/<theme>.css` | `gavia`, `white`, `graphite` или `newspaper` |
| `gavia-ui/manifest.json` | JSON-контракты всех 53 компонентов |
| `gavia-ui/design-tokens.json` | JSON-каталог токенов, тем, типографики и шкал |
| `gavia-ui/package.json` | метаданные пакета |

## Токены и темы

Три уровня custom properties в namespace `--wl-*`:

1. **Foundation** — сырые значения: палитра (`--wl-gray-*`, `--wl-blue-*`, …),
   радиусы, тени, длительности, шрифты.
2. **Semantic** — роли: `--wl-bg`, `--wl-text`, `--wl-accent`, `--wl-success`, …
   Ссылаются на foundation; именно их переопределяют темы.
3. **Component** — `--wl-btn-height`, `--wl-input-radius`, `--wl-focus-ring`, …
   Ссылаются на semantic; позволяют точечно настраивать компоненты.

Тема — отдельный CSS-файл с переопределением semantic/foundation токенов.
Переключение — атрибутом `data-wl-theme` (темы импортированы заранее):

```html
<html data-wl-theme="graphite">
```

Если используете одну тему, импортируйте её CSS и установите соответствующий атрибут:

```ts
import "gavia-ui/themes/newspaper.css";
```

```html
<html data-wl-theme="newspaper">
```

`newspaper` — светлая газетная тема с почти белой бумажной палитрой, антиквенными
заголовками, sans-serif интерфейсным текстом, тонкими линейками и сдержанными
spot-цветами.

```css
[data-wl-theme="my-brand"] {
  --wl-accent: #7c3aed;
  --wl-accent-hover: #6d28d9;
  --wl-accent-soft: #f3effd;
  --wl-accent-border: #ddd0f8;
}
```

Локальная настройка поддерева:

```css
.compact-panel {
  --wl-btn-height: 30px;
  --wl-input-height: 30px;
}
```

## Единый контракт компонентов

- `variant`, `size` (`xs`/`sm`/`md`/`lg` где применимо), `density` (`default`/`compact`);
- состояния `disabled` / `loading` / `invalid` — явные props;
- `class` / `style` пробрасываются на корневой элемент;
- слоты (`default`, `icon`, `prefix`, `suffix`, …);
- data-атрибуты на корне: `data-wl="<name>"`, `data-variant`, `data-size`;
- стабильные классы с низкой специфичностью: `.wl-btn`, `.wl-btn--primary`,
  `.wl-btn--sm`, состояния — `.is-loading`, `.is-disabled`.

### Нативные атрибуты полей

У составных полей `WlInput`, `WlPasswordInput`, `WlNumberInput`, `WlSelect`,
`WlMultiSelect`, `WlAutocomplete`, `WlDatePicker`, `WlCheckbox`, `WlRadio` и
`WlSwitch` атрибуты `id`, `name`, `form`, `required`, `readonly`, `aria-*` и
обработчики фокуса/ввода попадают на реальный фокусируемый control. `class`,
`style` и `data-*` остаются на корне компонента. Это позволяет напрямую связывать
поля с `WlField` и нативной формой без поиска внутреннего DOM.

`WlField` отдаёт в default-slot `id` и его алиас `inputId`, а также
`ariaDescribedby`, `ariaInvalid`, `invalid` и `required`.

### Жизненный цикл оверлеев

`WlDialog`, `WlDrawer`, `WlPopover` и popup-`WlMenu` эмитят единые события
`open` / `close`. Диалог, дровер и поповер поддерживают `closeOnEscape`,
dismiss-поведение и доступную подпись; диалог и дровер также позволяют управлять
`blockScroll`. Собственные мобильные оверлеи кита закрываются только верхним
слоем, удерживают фокус внутри и корректно возвращают его в триггер.
При блокировке страницы место существующей вертикальной полосы прокрутки
сохраняется, чтобы контент не смещался при открытии и закрытии.

### Анимация оверлеев

Появление и закрытие диалогов, дроверов, всплывающих меню и панелей выбора,
палитры команд, уведомлений и подсказок анимируются по умолчанию. Настройка
приложения действует на все эти элементы:

```ts
app.use(WlConfig, { motion: false });
```

Локальный `motion` имеет приоритет над `WlConfig.motion`. Его принимают
`WlDialog`, `WlConfirmDialog`, `WlDrawer`, `WlPopover`, popup-`WlMenu`,
`WlSelect`, `WlMultiSelect`, `WlAutocomplete`, `WlDatePicker`,
`WlCommandPalette` и `WlToast`:

```vue
<WlDrawer v-model:visible="open" :motion="false" />
```

Для директивы подсказки используйте объект
`v-wl-tooltip="{ value: 'Помощь', motion: false }"`. Значение `true` локально
включает анимацию даже при `WlConfig.motion: false`. При системной настройке
`prefers-reduced-motion: reduce` длительности переходов сокращаются почти до
нуля; подсказка удаляется сразу. Скорость можно настроить токенами
`--wl-dur-3`, `--wl-dur-4` и `--wl-dur-5`.

## Pass-through (`pt`)

`createWlPt()` возвращает дефолтную карту и может объединять переопределения.
Порядок применения: дефолты → конфигурация приложения → `pt` экземпляра.
`class` и `style` объединяются, прочие атрибуты заменяются последним значением.

```ts
app.use(WlConfig, {
  pt: {
    button: { root: { "data-test": "app-button" } }
  }
});
```

```vue
<WlButton :pt="{ root: { 'aria-label': 'Создать задачу' } }">Создать</WlButton>
```

## Компоненты

| Группа | Компоненты |
| --- | --- |
| Действия | `WlButton`, `WlIconButton`, `WlButtonGroup`, `WlSegmented`, `WlMenu`, `WlNavItem` |
| Ввод данных | `WlTimePicker`, `WlFilePicker`, `WlInput`, `WlPasswordInput`, `WlNumberInput`, `WlTextarea`, `WlSelect`, `WlMultiSelect`, `WlAutocomplete`, `WlCheckbox`, `WlRadio`, `WlSwitch`, `WlSlider`, `WlDatePicker`, `WlCalendar`, `WlColorPicker`, `WlFileUpload` |
| Данные | `WlTable`, `WlPagination`, `WlBadge`, `WlTag`, `WlChip`, `WlPill`, `WlAvatar`, `WlStatCard`, `WlProgress`, `WlSkeleton`, `WlEmpty` |
| Контейнеры | `WlCard`, `WlAccordion`, `WlTabs`, `WlDialog`, `WlDrawer`, `WlPopover`, `WlDivider` |
| Составные элементы | `WlPageHeader`, `WlFilterBar`, `WlSidebar`, `WlCommandPalette` |
| Навигация | `WlBreadcrumbs`, `WlSteps` |
| Обратная связь | `WlAlert`, `WlToast`, `WlConfirmDialog`, `WlSpinner` |
| Дополнительно | `WlField`, `WlIcon` |

У каждого компонента есть [руководство в playground](https://whitewolf06.github.io/gavia-ui/?view=docs):
живой пример, настройки, копируемый Vue-код, API, доступность и версия первой поставки.
Дополнительно экспортируются директива `WlTooltip`, `createWlPt` и типы
(`WlSize`, `WlDensity`, `WlButtonVariant`, `WlTabItem`, …).

### Подтверждения: WlConfirmDialog + useWlConfirm

По аналогии с тостами нужны сервис и один экземпляр диалога в корне приложения:

```ts
// main.ts
import { WlConfirmationService } from "gavia-ui";

app.use(WlConfirmationService);
```

```vue
<script setup lang="ts">
import { WlButton, WlConfirmDialog, useWlConfirm } from "gavia-ui";

const { confirm, confirmDanger } = useWlConfirm();

function remove(): void {
  confirmDanger({
    header: "Удалить задачу?",
    message: "Действие необратимо.",
    acceptLabel: "Удалить",
    accept: () => { /* ... */ }
  });
}
</script>

<template>
  <WlConfirmDialog />
  <WlButton variant="danger" @click="remove">Удалить…</WlButton>
</template>
```

`confirm` рисует primary-кнопку подтверждения, `confirmDanger` — danger с
иконкой предупреждения; подписи по умолчанию берутся из локали кита
(`wlLocaleRu.accept` / `wlLocaleRu.reject`).

## Component manifest

Машиночитаемое описание всех 53 компонентов: пропсы (типы, дефолты, enum-значения),
слоты, события, `v-model` и `introducedIn` — первая публичная версия, содержащая
компонент. Предназначен для визуальных редакторов (палитра +
инспектор пропсов) и AI-агентов, генерирующих разметку.

```ts
import { wlManifest } from "gavia-ui";
import type { WlComponentManifest } from "gavia-ui";

const button = wlManifest.find((entry) => entry.name === "WlButton");
```

Либо как статический JSON (генерируется при сборке в `dist/manifest.json`):

```ts
import manifest from "gavia-ui/manifest.json";
```

Типы: `WlComponentManifest`, `WlPropManifest`, `WlSlotManifest`, `WlEmitManifest`,
`WlModelManifest`, `WlManifestCategory`, `WlManifestPropType`. Категории:
`actions`, `inputs`, `data`, `containers`, `composites`, `navigation`, `feedback`, `misc`.
Пропсы типа `icon` принимают значения из `WlIconName`, тип `object` — это
pass-through (`pt`) или сложные объекты вроде `locale`.

## Разработка

```bash
pnpm build      # сборка (vite lib mode → dist/index.js + dist/*.d.ts)
pnpm test       # Vitest + Vue Test Utils
pnpm typecheck  # vue-tsc --noEmit
pnpm test:e2e   # desktop/mobile, Chromium/Firefox/WebKit
pnpm test:visual # сравнение эталонов трёх тем на desktop/mobile
pnpm icons:check
pnpm tokens:check
pnpm verify:package
pnpm verify:dependencies
```

[Совместимость, браузеры, доступность и проверки](https://github.com/whitewolf06/gavia-ui/blob/main/docs/quality.md).
Потребители могут использовать pnpm, npm и Bun; разработка репозитория — pnpm.
