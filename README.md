# WhiteLife UI

Современная техническая основа для UI WhiteLife и других проектов: библиотека компонентов
`@whitelife-core/ui-kit` (Vue 3 + TypeScript, собственные компоненты) и изолированный
playground для разработки и проверки.

## Структура

```
packages/ui-kit   — публикуемый пакет @whitelife-core/ui-kit
apps/playground   — изолированное приложение для разработки и проверки
```

Требования: Node.js >= 18, pnpm 10 (единственный package manager в репозитории).

```bash
pnpm install            # установка всех зависимостей workspace
pnpm build              # сборка библиотеки (ESM + TypeScript declarations)
pnpm test               # тесты библиотеки (Vitest + Vue Test Utils)
pnpm dev                # playground в dev-режиме
pnpm build:playground   # сборка playground
pnpm typecheck          # проверка типов библиотеки
pnpm test:e2e           # Chromium, Firefox, WebKit и мобильный Chromium
pnpm test:visual        # сравнение desktop/mobile с эталонами трёх тем (Windows)
pnpm icons:check        # проверка SVG-каталога и сгенерированного реестра
pnpm tokens:sync        # обновление CSS, тем и каталогов из source.json
pnpm tokens:check       # слои, ссылки, контраст и актуальность дизайн-токенов
pnpm run pack          # tar-архив пакета (без публикации); важно: именно `run pack`, см. ниже
pnpm verify:package     # изолированный потребитель архива с одним Vue
pnpm verify:dependencies # отсутствие PrimeVue/PrimeIcons в коде и зависимостях
```

> **Примечание.** pnpm выполняет одноимённую builtin-команду вместо script'а:
> голый `pnpm pack` в корне упакует корневой проект, а не библиотеку.
> Для архива `@whitelife-core/ui-kit` используйте `pnpm run pack`.

---

# @whitelife-core/ui-kit

## Установка

Пакет публикуется приватно в **GitHub Packages** (видимость — как у репозитория).
Перед первой установкой создайте в проекте `.npmrc`:

```
@whitelife-core:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

и задайте в окружении `NODE_AUTH_TOKEN` — GitHub PAT со скоупом `read:packages`.
Файл можно коммитить: токена в нём нет. Дальше обычная установка:

```bash
pnpm add @whitelife-core/ui-kit
```

### Релиз новой версии (для мейнтейнера)

1. Поднять `version` в `packages/ui-kit/package.json`, прогнать проверки
   (`pnpm build && pnpm test && pnpm run pack`), закоммитить.
2. `git tag v<version> && git push origin main --tags`.
3. GitHub Action `.github/workflows/publish.yml` соберёт, протестирует
   и опубликует пакет в GitHub Packages автоматически.

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
import { WlConfig, WlToastService, WlConfirmationService, wlLocaleRu } from "@whitelife-core/ui-kit";

// Стили подключаются явно: reset → base → тема
import "@whitelife-core/ui-kit/styles/reset.css";
import "@whitelife-core/ui-kit/styles/base.css";
import "@whitelife-core/ui-kit/themes/white.css";

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
import { WlButton, WlInput, WlTag } from "@whitelife-core/ui-kit";
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
  "@whitelife-core/ui-kit":                 "ESM + .d.ts (компоненты, типы, createWlPt)",
  "@whitelife-core/ui-kit/styles/base.css": "токены + стили компонентов (CSS Layers)",
  "@whitelife-core/ui-kit/styles/reset.css":"минимальный reset (отдельный слой)",
  "@whitelife-core/ui-kit/themes/<theme>.css": "тема: white | graphite | newspaper"
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
`wlDesignTokens` / `resolveWlToken` и экспорта `@whitelife-core/ui-kit/design-tokens.json`.
Примитивы `wl-stack`, `wl-inline`, `wl-grid`, `wl-surface`, `wl-text-*` доступны
через явный импорт `@whitelife-core/ui-kit/styles/primitives.css`.

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
import "@whitelife-core/ui-kit/themes/graphite.css";
```

Газетная тема из комплекта:

```ts
import "@whitelife-core/ui-kit/themes/newspaper.css";
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
import { WlConfig } from "@whitelife-core/ui-kit";

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
