<p><img src="docs/brand/gavia-ui-mark-v2.png" alt="Gavia UI" width="72" height="72"></p>

# Gavia UI

A free, open source Vue 3 component library and design system.

Независимая библиотека компонентов Vue 3 + TypeScript: 51 компонент,
47 встроенных SVG-иконок, 416 дизайн-токенов и три темы — White, Graphite,
Newspaper. В репозитории есть изолированный playground с живыми примерами и
готовыми сценариями для форм, таблиц, навигации и оверлеев.

**MIT:** бесплатно для личных и коммерческих проектов. Можно использовать,
изменять и распространять при сохранении текста лицензии и уведомления
об авторских правах. Полные условия — [LICENSE](LICENSE).

Runtime-зависимостей нет. **Vue 3 — единственный обязательный peer**.
Стили подключаются явно. PrimeVue, PrimeIcons, роутер, хранилище состояния
и API-клиенты для работы библиотеки не нужны.

Пакет [gavia-ui](https://www.npmjs.com/package/gavia-ui) опубликован в публичном npm.
Первый выпуск `0.7.0` — 2026-10-05 (Москва). Публичные `Wl*`, классы и токены сохраняются;
[переход на Gavia UI](docs/migration-gavia.md).

Версия `0.7.0`: [изменения и переход](docs/migration-0.7.md).
Первый публичный npm-релиз опубликован; установка в Vue-приложении: `pnpm add gavia-ui@0.7.0`.
История дизайн-системы 0.6.0 — [миграция 0.6](docs/migration-0.6.md).
[Дизайн-система](docs/design-system.md) · [Changelog](CHANGELOG.md)
· [Правила участия](CONTRIBUTING.md)

## Создатель и публичная витрина

Создатель и сопровождающий — [Gorbach Dmitry](https://github.com/whitewolf06).
Участие в развитии проекта описано в [CONTRIBUTING.md](CONTRIBUTING.md).

Playground объединяет компоненты, дизайн-систему, живые SFC-примеры и страницу
«О проекте» с лицензией, автором и полной историей изменений. Changelog на сайте
собирается непосредственно из корневого `CHANGELOG.md`; отдельную копию для UI
вести не нужно. Перейти к странице локально: `/?view=project`.

Публичная витрина опубликована в GitHub Pages: [Gavia UI](https://whitewolf06.github.io/gavia-ui/).
[Автор и changelog](https://whitewolf06.github.io/gavia-ui/?view=project) доступны на сайте.
[Настройка и проверка публикации](docs/hosting.md).

## Структура

```
packages/ui-kit   — публикуемый пакет gavia-ui
apps/playground   — изолированное приложение для разработки и проверки
```

Требования: Node.js >= 18, pnpm 10 (единственный package manager в репозитории).

```bash
pnpm install            # установка всех зависимостей workspace
pnpm build              # сборка библиотеки (ESM + TypeScript declarations)
pnpm test               # тесты библиотеки (Vitest + Vue Test Utils)
pnpm dev                # playground в dev-режиме
pnpm build:playground   # сборка playground
pnpm build:pages        # production-сборка для /gavia-ui/
pnpm test:pages         # desktop/mobile smoke production-сборки Pages
pnpm typecheck          # проверка типов библиотеки и playground
pnpm test:e2e           # Chromium, Firefox, WebKit и мобильный Chromium
pnpm test:visual        # сравнение desktop/mobile с эталонами трёх тем (Windows)
pnpm icons:check        # проверка SVG-каталога и сгенерированного реестра
pnpm tokens:sync        # обновление CSS, тем и каталогов из source.json
pnpm tokens:check       # слои, ссылки, контраст и актуальность дизайн-токенов
pnpm run pack          # tar-архив пакета (без публикации); важно: именно `run pack`, см. ниже
pnpm verify:package     # изолированный потребитель архива с одним Vue
pnpm verify:dependencies # отсутствие PrimeVue/PrimeIcons в коде и зависимостях
```

После установки в чистом checkout сначала выполните `pnpm build`: playground
использует публичные типы пакета из `dist`. Сборка требуется перед `typecheck`,
запуском витрины и браузерными тестами; CI выполняет её в каждом таком job.

> **Примечание.** pnpm выполняет одноимённую builtin-команду вместо script'а:
> голый `pnpm pack` в корне упакует корневой проект, а не библиотеку.
> Для архива `gavia-ui` используйте `pnpm run pack`.

---

## Пакет gavia-ui

### Установка

Пакет [gavia-ui@0.7.0](https://www.npmjs.com/package/gavia-ui) доступен в публичном **npm**:

```bash
pnpm add gavia-ui@0.7.0 vue
```

GitHub PAT и специальный scope registry для нового пакета не требуются.
Архив также можно собрать из исходников:

```bash
git clone https://github.com/whitewolf06/gavia-ui.git
cd gavia-ui
pnpm install
pnpm build
pnpm run pack
# В приложении-потребителе:
pnpm add /absolute/path/to/gavia-ui/packages/ui-kit/gavia-ui-0.7.0.tgz vue
```

Текущая версия кода — `0.7.0`; имя архива определяется версией в манифесте.
История и действия при обновлении — [CHANGELOG.md](CHANGELOG.md).
Порядок следующих выпусков — [docs/releases.md](docs/releases.md).

### Peer dependencies

Пакет не тащит за собой фреймворк — приложение-потребитель предоставляет его само,
поэтому дублирующего экземпляра Vue не возникает:

| Пакет        | Версия | Обязательность            |
| ------------ | ------ | ------------------------- |
| `vue`        | ^3.4   | обязательный peer         |

## Подключение (минимальная интеграция)

Библиотека использует Vue 3 и не требует установки других UI-пакетов:

```ts
// main.ts
import { createApp } from "vue";
import { WlConfig, WlToastService, WlConfirmationService, wlLocaleRu } from "gavia-ui";

// Стили подключаются явно: reset → base → тема
import "gavia-ui/styles/reset.css";
import "gavia-ui/styles/base.css";
import "gavia-ui/themes/white.css";

import App from "./App.vue";

const app = createApp(App);
app.use(WlConfig, { locale: wlLocaleRu });
app.use(WlToastService);
app.use(WlConfirmationService);
app.mount("#app");
```

```vue
<!-- Именованный импорт компонентов -->
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

`WlConfig` необязателен: без него используются стандартные `pt` и русская локаль.
Сервисы уведомлений и подтверждений устанавливаются отдельно, если используются.
Их состояние принадлежит каждому экземпляру Vue-приложения. Переход с версии 0.3
описан в [руководстве по миграции](docs/migration-0.5.md).

Анимация всплывающих элементов включена по умолчанию. Отключить её во всём
приложении можно через `app.use(WlConfig, { motion: false })`, а для отдельного
компонента — через `:motion="false"`. Поддерживаются системные настройки
уменьшения движения. Подробности — в [документации пакета](packages/ui-kit/README.md#анимация-оверлеев).

## Subpath exports

```jsonc
{
  "gavia-ui":                 "ESM + .d.ts (компоненты, типы, createWlPt)",
  "gavia-ui/styles/base.css": "токены + стили компонентов (CSS Layers)",
  "gavia-ui/styles/reset.css":"минимальный reset (отдельный слой)",
  "gavia-ui/themes/<theme>.css": "тема: white | graphite | newspaper"
}
```

## Система стилизации

### Дизайн-система

В playground выберите **Дизайн-система** (или откройте `?view=system`): основы,
типографика, отступы, каталог токенов, контракты всех компонентов, рабочие
паттерны и отчёт контраста White / Graphite / Newspaper. Для каждого компонента
есть живой Vue-пример, применимые состояния и код с копированием. Шесть рецептов
показывают список с CRUD, форму, настройки, деталь, пошаговую форму и вложения.
Отдельно доступны сложный контент и вложенные оверлеи. Правила и интеграция —
[docs/design-system.md](docs/design-system.md).

`tokens/source.json` — единый источник для CSS, тем, типизированного API
`wlDesignTokens` / `resolveWlToken` и экспорта `gavia-ui/design-tokens.json`.
Примитивы `wl-stack`, `wl-inline`, `wl-grid`, `wl-surface`, `wl-text-*` доступны
через явный импорт `gavia-ui/styles/primitives.css`.

### Токены `--wl-*`

Все переменные живут в namespace `--wl-*` и разделены на три уровня:

1. **Foundation** — сырые значения: палитра (`--wl-gray-*`, `--wl-blue-*`), радиусы,
   тени, длительности, шрифты. Меняются редко.
2. **Semantic** — смысловые роли: `--wl-bg`, `--wl-text`, `--wl-accent`,
   `--wl-success`, … Ссылаются на foundation. Именно их переопределяют темы.
3. **Component** — токены уровня компонента: `--wl-btn-height`, `--wl-input-radius`, …
   Ссылаются на semantic. Позволяют точечно настраивать компонент.

### Темы

Тема — это набор semantic/foundation токенов, поставляемый отдельным CSS-файлом.
Переключение двумя способами:

```html
<!-- 1. Атрибут (темы должны быть импортированы заранее) -->
<html data-wl-theme="graphite">
```

```ts
// 2. Явный импорт только одной темы
import "gavia-ui/themes/graphite.css";
```

Газетная тема из комплекта:

```ts
import "gavia-ui/themes/newspaper.css";
```

```html
<html data-wl-theme="newspaper">
```

Она сочетает почти белый бумажный фон, почти чёрные «чернила», антиквенные
заголовки с нейтральным sans-serif интерфейсным текстом, тонкие границы и
сдержанную геометрию. Компоненты и их DOM-контракт при этом не меняются.

### Своя тема без форка

Новый проект создаёт свою тему **заменой токенов** — без форка компонентов
и без изменения исходников библиотеки:

```css
/* my-theme.css */
[data-wl-theme="my-brand"] {
  --wl-accent: #7c3aed;
  --wl-accent-hover: #6d28d9;
  --wl-accent-soft: #f3effd;
  --wl-accent-border: #ddd0f8;
  --wl-radius: 10px;
}
```

### Переопределение токенов

```css
/* глобально */
:root {
  --wl-btn-height: 36px;
}

/* локально, на поддереве */
.compact-panel {
  --wl-btn-height: 30px;
  --wl-input-height: 30px;
}
```

### CSS Layers

Стили разложены по слоям: `@layer wl.reset, wl.tokens, wl.components;`
Стили проекта-потребителя (вне слоёв или в слоях ниже) предсказуемо
переопределяют стили kit — военные действия специфичности не нужны.

## Единый контракт компонентов

Каждый компонент поддерживает одинаковый набор входов:

| Вход              | Описание                                                        |
| ----------------- | --------------------------------------------------------------- |
| `variant`         | внешний вид: `primary`, `secondary`, `ghost`, `soft`, `danger`, … |
| `size`            | размер: `xs`, `sm`, `md`, `lg`                                  |
| `density`         | плотность: `default`, `compact`                                 |
| states            | `disabled`, `loading`, `invalid` — явные props                  |
| `class` / `style` | пробрасываются на корневой элемент (fallthrough)                |
| slots             | контентные слоты (`default`, `icon`, `prefix`, `suffix`, …)     |
| data-attributes   | `data-wl="<name>"`, `data-variant`, `data-size` на корне        |

CSS-классы стабильны, namespaced и с низкой специфичностью:
`wl-btn`, `wl-btn--primary`, `wl-btn--sm`, состояния — `is-loading`, `is-disabled`.

## Pass-through (`pt`)

`pt` — открытая, расширяемая настройка, а не закрытая внутри библиотеки:

```ts
import { WlConfig } from "gavia-ui";

app.use(WlConfig, {
  pt: {
    button: { root: { "data-test": "app-button" } },
  },
});
```

```vue
<!-- точечно, на одном экземпляре -->
<WlButton :pt="{ root: { 'aria-label': 'Создать задачу' } }">Создать</WlButton>
```

`createWlPt()` возвращает дефолтную карту и принимает переопределения для
совместимости. Порядок применения к каждому DOM-разделу: дефолт → `WlConfig.pt`
→ `pt` экземпляра. `class` и `style` объединяются; прочие атрибуты последнего
уровня перекрывают предыдущие. Разделы перечислены в
[архитектурном руководстве](docs/architecture.md#pt-и-публичный-dom).

## Правила потребления

- Reset и стили **не** импортируются автоматически — подключайте явно.
- Типографика, цвета и поведение меняются токенами, а не форком компонентов.
- В библиотеке нет Pinia, роутера, API-клиентов и бизнес-логики — и не будет.
- Исходные SVG и пакетное добавление иконок: [docs/icons.md](docs/icons.md).
- Архитектурные правила и практическое применение SOLID: [docs/architecture.md](docs/architecture.md).
