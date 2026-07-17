# WhiteLife UI

Современная техническая основа для UI WhiteLife и других проектов: библиотека компонентов
`@whitelife/ui-kit` (Vue 3 + TypeScript, PrimeVue 4 в unstyled-режиме) и изолированный
playground для разработки и проверки.

## Структура

```
packages/ui-kit   — публикуемый пакет @whitelife/ui-kit
apps/playground   — изолированное приложение для разработки и проверки
```

Требования: Node.js >= 18, pnpm 10 (единственный package manager в репозитории).

```bash
pnpm install            # установка всех зависимостей workspace
pnpm build              # сборка библиотеки (ESM + TypeScript declarations)
pnpm test               # тесты библиотеки (Vitest + Vue Test Utils)
pnpm dev                # playground в dev-режиме
pnpm build:playground   # сборка playground
pnpm pack               # tar-архив пакета (без публикации)
```

---

# @whitelife/ui-kit

## Установка

```bash
pnpm add @whitelife/ui-kit
```

### Peer dependencies

Пакет не тащит за собой фреймворк — приложение-потребитель предоставляет его само,
поэтому дублирующихся экземпляров Vue и PrimeVue не возникает:

| Пакет        | Версия | Обязательность            |
| ------------ | ------ | ------------------------- |
| `vue`        | ^3.4   | обязательный peer         |
| `primevue`   | ^4     | обязательный peer         |
| `primeicons` | ^7     | опциональный peer (иконки)|

## Подключение (минимальная интеграция)

Четыре шага, без смены стека потребителя (Vue 3 + PrimeVue Unstyled + Vite):

```ts
// main.ts
import { createApp } from "vue";
import PrimeVue from "primevue/config";

// 2. PrimeVue в unstyled-режиме (настраивает потребитель, не библиотека)
// 3. Стили подключаются явно: reset → base → тема
import "@whitelife/ui-kit/styles/reset.css";
import "@whitelife/ui-kit/styles/base.css";
import "@whitelife/ui-kit/themes/white.css";

import App from "./App.vue";

const app = createApp(App);
app.use(PrimeVue, { unstyled: true });
app.mount("#app");
```

```vue
<!-- 4. Именованный импорт компонентов -->
<script setup lang="ts">
import { WlButton, WlInput, WlTag } from "@whitelife/ui-kit";
</script>

<template>
  <WlButton variant="primary" size="md">Создать</WlButton>
  <WlInput v-model="text" placeholder="Название задачи" />
  <WlTag variant="blue">Релиз 2.0</WlTag>
</template>
```

UI-kit **не** вызывает `app.use(PrimeVue)` сам и не управляет конфигурацией приложения.

## Subpath exports

```jsonc
{
  "@whitelife/ui-kit":                 "ESM + .d.ts (компоненты, типы, createWlPt)",
  "@whitelife/ui-kit/styles/base.css": "токены + стили компонентов (CSS Layers)",
  "@whitelife/ui-kit/styles/reset.css":"минимальный reset (отдельный слой)",
  "@whitelife/ui-kit/themes/<theme>.css": "тема: white | graphite"
}
```

## Система стилизации

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
import "@whitelife/ui-kit/themes/graphite.css";
```

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

## PrimeVue pass-through (`pt`)

`pt` — открытая, расширяемая настройка, а не закрытая внутри библиотеки:

```ts
import { createWlPt } from "@whitelife/ui-kit";

// глобально, при подключении PrimeVue
app.use(PrimeVue, {
  unstyled: true,
  pt: createWlPt({
    button: { root: { "data-test": "app-button" } },
  }),
});
```

```vue
<!-- точечно, на одном экземпляре -->
<WlButton :pt="{ root: { 'aria-label': 'Создать задачу' } }">Создать</WlButton>
```

`createWlPt()` возвращает дефолтную pt-карту библиотеки; переданный объект
глубоко мёржится поверх. `pt` prop компонента мёржится последним и побеждает.

## Правила потребления

- Reset и стили **не** импортируются автоматически — подключайте явно.
- Типографика, цвета и поведение меняются токенами, а не форком компонентов.
- В библиотеке нет Pinia, роутера, API-клиентов и бизнес-логики — и не будет.
