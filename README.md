<p align="center">
  <img src="docs/brand/gavia-ui-mark-lake.svg" alt="Гагара — знак Gavia UI" width="80" height="80">
</p>

# Gavia UI

[![Покрытие строк unit-тестами — снимок репозитория](docs/quality-coverage.svg)](apps/playground/src/project/quality-report.generated.json)

Библиотека компонентов и дизайн-система для Vue 3 + TypeScript.
Кнопки, поля, таблицы, навигация и оверлеи. Общие токены, пять тем
и рабочие примеры с кодом.

<p align="center">
  <a href="https://whitewolf06.github.io/gavia-ui/"><img src="docs/brand/playground-button.svg" alt="Открыть Playground" width="230" height="44"></a><br>
  · <a href="https://whitewolf06.github.io/gavia-ui/?view=docs">Документация</a>
  · <a href="https://whitewolf06.github.io/gavia-ui/?view=font">Gavia Sans</a>
  · <a href="https://www.npmjs.com/package/gavia-ui">Пакет npm</a>
</p>

[Качество и совместимость](https://whitewolf06.github.io/gavia-ui/?view=docs&section=quality):
unit-тесты, покрытие Vitest/V8, браузеры, доступность, SSR и проверка установленного пакета.
Шкалы 0–100% показывают долю пройденных unit-тестов и покрытие.
Бейдж хранит результат измерения покрытия строк. Дата, версия и источник —
[в JSON-отчёте](apps/playground/src/project/quality-report.generated.json). В опубликованном playground страница качества показывает отчёт CI этой сборки.
Он может отличаться от сохранённого снимка. Статус текущего CI проверяйте отдельно:
[Текущие запуски CI](https://github.com/whitewolf06/gavia-ui/actions).

<a href="https://whitewolf06.github.io/gavia-ui/">
  <img src="docs/brand/gavia-lake-hero-v2.webp" alt="Тихое озеро на рассвете, туманный хвойный берег и гагара — оформление темы Gavia" width="1200">
</a>

В Gavia UI **53 компонента, 113 SVG-иконок, 447 дизайн-токенов
и пять тем:** Gavia, Gavia Dark, Classic, Classic Dark и Newspaper.
В playground можно настроить компоненты, скопировать Vue-код, пройти готовые
сценарии и подобрать свою палитру. У каждого компонента есть руководство
и версия, в которой он впервые появился.

**Gavia Sans 0.6** входит в пакет. Это основной шрифт тем Gavia и Gavia Dark:
кириллица и латиница, шесть весов с прямым и наклонным начертанием, TTF и WOFF2.
Classic, Classic Dark и Newspaper сохраняют свою типографику.
[Подключение темы](docs/theme-gavia.md) · [Образцы и скачивание шрифта](https://whitewolf06.github.io/gavia-ui/?view=font).

**Vue 3 — единственный обязательный peer.** Runtime-зависимостей нет;
стили подключаются явно. Библиотека работает без дополнительных UI-пакетов,
роутера, хранилища состояния и API-клиента.

## Публичные TypeScript-контракты

В версии 0.11.0 тип модели выбора связан с вариантами, колонки таблицы
проверяются по полям строки, а pt, слоты, события и refs получили точные типы.
Некорректные входные значения нормализуются. Нужен TypeScript ≥ 5.4;
при обновлении может потребоваться правка кода приложения.
[Миграция 0.11](docs/migration-0.11.0.md) · [Контракты типов](docs/architecture.md#контракты-типов-данных) ·
[Проверка API установленного пакета](docs/quality.md#проверка-новых-публичных-контрактов).

## Темы

### Основные

**Gavia** и **Gavia Dark** — светлая и тёмная темы с озёрной палитрой,
общими размерами компонентов и шрифтом **Gavia Sans**.

| Тема | Режим | `data-wl-theme` | CSS из пакета |
| --- | --- | --- | --- |
| **Gavia** | Светлая | `gavia` | `gavia-ui/themes/gavia.css` |
| **Gavia Dark** | Тёмная | `gavia-dark` | `gavia-ui/themes/gavia-dark.css` |

Gavia Dark добавлена в 0.10.0.

### Дополнительные

Classic и Classic Dark используют системный шрифт без засечек.
В Newspaper основной текст тоже системный, а заголовки — с засечками.
Компоненты во всех темах общие.

| Тема | Оформление | `data-wl-theme` | CSS из пакета |
| --- | --- | --- | --- |
| **Classic** | Светлая нейтральная | `white` | `gavia-ui/themes/white.css` |
| **Classic Dark** | Тёмная нейтральная | `graphite` | `gavia-ui/themes/graphite.css` |
| **Newspaper** | Светлая, с заголовками с засечками | `newspaper` | `gavia-ui/themes/newspaper.css` |

Выберите CSS темы и её идентификатор из таблицы. Для обеих основных тем также
подключите `gavia-ui/styles/fonts/gavia.css`. Без явного выбора темы библиотека
использует Classic (`white`).

## Быстрый старт

Установите библиотеку в Vue-приложение:

```bash
pnpm add gavia-ui@0.11.0 vue
# либо
npm install gavia-ui@0.11.0 vue
# либо
bun add gavia-ui@0.11.0 vue
```

Подключите стили и шрифт в точке входа, затем выберите тему Gavia:

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
в `index.html`. Gavia Dark подключается через `gavia-ui/themes/gavia-dark.css`
и `data-wl-theme="gavia-dark"`, с тем же шрифтовым CSS. Для Classic, Classic Dark
или Newspaper импортируйте `themes/white.css`, `themes/graphite.css` или
`themes/newspaper.css` и выберите `white`, `graphite` или `newspaper` соответственно.
Без CSS шрифта обе Gavia используют системный шрифт; без выбора темы
библиотека сохраняет Classic (`white`). `WlConfig` для базового подключения не требуется.
[Названия тем и совместимость](docs/migration-themes.md).
[Подробное подключение, API и доступность](https://whitewolf06.github.io/gavia-ui/?view=docs).

## Документация и участие

- [Руководства компонентов](https://whitewolf06.github.io/gavia-ui/?view=docs) — примеры, настройки, API и клавиатурные состояния.
- [Дизайн-система](docs/design-system.md) — токены, типографика, состояния и готовые сценарии.
- [CSS-примитивы](docs/primitives.md) и [адаптивность](docs/responsiveness.md) — компоновка и правила размеров.
- [Темы Gavia / Gavia Dark](docs/theme-gavia.md) и [шрифт Gavia Sans](docs/font-gavia.md) — палитра, подключение, образцы и лицензия.
- [Changelog](CHANGELOG.md), [миграция 0.11](docs/migration-0.11.0.md), [темы 0.10](docs/migration-0.10.0.md), [история ребрендинга](docs/migration-gavia.md) и [проверенные выпуски](docs/releases.md) — история и обновление приложения.
- [Архитектура playground](docs/playground.md) и [публикация Pages](docs/hosting.md).

Создатель и сопровождающий — [Gorbach Dmitry](https://github.com/whitewolf06).
Об ошибках и предложениях пишите в [GitHub Issues](https://github.com/whitewolf06/gavia-ui/issues).
Если хотите изменить код, прочитайте [руководство для участников](CONTRIBUTING.md).

**Код UI Kit — MIT.** Библиотеку можно использовать, изменять и распространять,
в том числе в коммерческих проектах. Сохраняйте текст лицензии и уведомление
об авторских правах. Полные условия — [LICENSE](LICENSE).
**Файлы шрифта — SIL OFL 1.1:** [лицензия гарнитуры](packages/ui-kit/fonts/gavia/OFL.txt).

## Разработка

`packages/ui-kit` — публикуемая библиотека; `apps/playground` — приложение для
разработки и проверки. Требуются Node.js ≥ 18 и pnpm 10.

```bash
pnpm install
pnpm build              # ESM + TypeScript declarations
pnpm dev                # playground
pnpm test               # Vitest + Vue Test Utils
pnpm typecheck
pnpm build:playground
pnpm run pack           # архив библиотеки без публикации
pnpm verify:package     # проверка архива в изолированном Vue-приложении
```

В чистом checkout сначала выполните `pnpm build`: playground использует типы
из `dist`. Для архива библиотеки нужен именно `pnpm run pack`; голый `pnpm pack`
в корне упакует workspace. Проверки браузеров, токенов, иконок и Pages описаны в
[правилах участия](CONTRIBUTING.md), [playground](docs/playground.md)
и [руководстве публикации](docs/hosting.md). Публикация пакета — отдельный шаг:
[правила релизов](docs/releases.md).

## Контракты и темизация

Компоненты используют общий контракт: `variant`, `size`, `density`, явные
состояния, `class`/`style`, слоты и `data-wl`/`data-variant`/`data-size`.
`WlConfig` необязателен; сервисы уведомлений и подтверждений подключаются
отдельно и принадлежат конкретному Vue-приложению. Настройки `pt` объединяются
в порядке default → `WlConfig.pt` → `pt` экземпляра; `class` и `style` объединяются.
[API и интеграция](packages/ui-kit/README.md) · [Публичный DOM и pt](docs/architecture.md#темы-и-публичный-dom).

Темы и локальные настройки используют CSS-переменные `--wl-*`:
foundation → semantic → component. Слои `wl.reset`, `wl.tokens`,
`wl.components` позволяют переопределять оформление в проекте.
Источник токенов — `packages/ui-kit/tokens/source.json`; CSS и каталоги
обновляются через `pnpm tokens:sync`. Для своей темы переопределите токены
и выберите `data-wl-theme`, сохраняя компоненты и их DOM-контракт.
[Токены, темы и готовые сценарии](docs/design-system.md).

[Совместимость, браузеры, доступность и проверки](docs/quality.md).
В приложении можно установить пакет через pnpm, npm или Bun.
Для разработки этого репозитория используйте pnpm.
