# @whitelife/ui-kit

Библиотека компонентов WhiteLife: Vue 3 + TypeScript (strict), PrimeVue 4 в
unstyled-режиме как headless-база, стили — обычный CSS с custom properties
`--wl-*` и CSS Layers. Без Pinia, роутера, API-клиентов и бизнес-логики.

## Peer dependencies

| Пакет        | Версия | Обязательность             |
| ------------ | ------ | -------------------------- |
| `vue`        | ^3.4   | обязательный peer          |
| `primevue`   | ^4     | обязательный peer          |
| `primeicons` | ^7     | опциональный peer (иконки) |

## Подключение

```ts
// main.ts
import { createApp } from "vue";
import PrimeVue from "primevue/config";
import { createWlPt } from "@whitelife/ui-kit";

// Стили подключаются явно: reset → base → тема
import "@whitelife/ui-kit/styles/reset.css";
import "@whitelife/ui-kit/styles/base.css";
import "@whitelife/ui-kit/themes/white.css";

import App from "./App.vue";

const app = createApp(App);
app.use(PrimeVue, { unstyled: true, pt: createWlPt() });
app.mount("#app");
```

```vue
<script setup lang="ts">
import { WlButton, WlInput, WlTag } from "@whitelife/ui-kit";
</script>

<template>
  <WlButton variant="primary" size="md">Создать</WlButton>
  <WlInput v-model="text" placeholder="Название задачи" />
  <WlTag variant="blue">Релиз 2.0</WlTag>
</template>
```

Библиотека **не** вызывает `app.use(PrimeVue)` сама и не импортирует CSS из JS.

## Exports

| Subpath                               | Содержимое                                   |
| ------------------------------------- | -------------------------------------------- |
| `@whitelife/ui-kit`                   | ESM + `.d.ts`: компоненты, типы, `createWlPt`, `WlTooltip` |
| `@whitelife/ui-kit/styles/reset.css`  | минимальный reset (слой `wl.reset`)          |
| `@whitelife/ui-kit/styles/base.css`   | токены + стили компонентов (`wl.tokens`, `wl.components`) |
| `@whitelife/ui-kit/themes/<theme>.css`| тема: `white` или `graphite`                 |

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

или явным импортом одной темы. Своя тема создаётся заменой токенов, без форка:

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

## Pass-through (`pt`)

`createWlPt()` возвращает дефолтную pt-карту библиотеки. Переданный объект
глубоко мёржится поверх дефолтов; `pt` prop компонента мёржится последним
(сам PrimeVue) и побеждает:

```ts
app.use(PrimeVue, {
  unstyled: true,
  pt: createWlPt({
    button: { root: { "data-test": "app-button" } }
  })
});
```

```vue
<WlButton :pt="{ root: { 'aria-label': 'Создать задачу' } }">Создать</WlButton>
```

## Компоненты

`WlButton`, `WlIcon`, `WlInput`, `WlTextarea`, `WlSelect`, `WlCheckbox`,
`WlRadio`, `WlSwitch`, `WlTag`, `WlChip`, `WlBadge`, `WlAvatar`, `WlCard`,
`WlTabs`, `WlAlert`, `WlSpinner`, `WlSkeleton`, `WlProgress`, `WlDialog`,
`WlDrawer`, `WlDivider` — плюс директива `WlTooltip`, `createWlPt` и типы
(`WlSize`, `WlDensity`, `WlButtonVariant`, `WlTabItem`, …).

## Разработка

```bash
pnpm build      # сборка (vite lib mode → dist/index.js + dist/*.d.ts)
pnpm test       # Vitest + Vue Test Utils
pnpm typecheck  # vue-tsc --noEmit
```
