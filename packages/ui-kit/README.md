# @whitelife-core/ui-kit

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
import { createWlPt } from "@whitelife-core/ui-kit";

// Стили подключаются явно: reset → base → тема
import "@whitelife-core/ui-kit/styles/reset.css";
import "@whitelife-core/ui-kit/styles/base.css";
import "@whitelife-core/ui-kit/themes/white.css";

import App from "./App.vue";

const app = createApp(App);
app.use(PrimeVue, { unstyled: true, pt: createWlPt() });
app.mount("#app");
```

```vue
<script setup lang="ts">
import { WlButton, WlInput, WlTag } from "@whitelife-core/ui-kit";
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
| `@whitelife-core/ui-kit`                   | ESM + `.d.ts`: компоненты, типы, `createWlPt`, `WlTooltip` |
| `@whitelife-core/ui-kit/styles/reset.css`  | минимальный reset (слой `wl.reset`)          |
| `@whitelife-core/ui-kit/styles/base.css`   | токены + стили компонентов (`wl.tokens`, `wl.components`) |
| `@whitelife-core/ui-kit/themes/<theme>.css`| тема: `white` или `graphite`                 |

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

`WlButton`, `WlIcon`, `WlInput`, `WlTextarea`, `WlSelect`, `WlMultiSelect`,
`WlAutocomplete`, `WlCheckbox`, `WlRadio`, `WlSwitch`, `WlTag`, `WlChip`,
`WlBadge`, `WlAvatar`, `WlCard`, `WlTabs`, `WlAlert`, `WlSpinner`,
`WlSkeleton`, `WlProgress`, `WlDialog`, `WlConfirmDialog`, `WlDrawer`,
`WlDivider` — плюс директива `WlTooltip`, `createWlPt` и типы
(`WlSize`, `WlDensity`, `WlButtonVariant`, `WlTabItem`, …).

### Подтверждения: WlConfirmDialog + useWlConfirm

По аналогии с тостами нужны сервис и один экземпляр диалога в корне приложения:

```ts
// main.ts
import { WlConfirmationService } from "@whitelife-core/ui-kit";

app.use(WlConfirmationService);
```

```vue
<script setup lang="ts">
import { WlButton, WlConfirmDialog, useWlConfirm } from "@whitelife-core/ui-kit";

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

Машиночитаемое описание всех 47 компонентов: пропсы (типы, дефолты, enum-значения),
слоты, события и `v-model`. Предназначен для визуальных редакторов (палитра +
инспектор пропсов) и AI-агентов, генерирующих разметку.

```ts
import { wlManifest } from "@whitelife-core/ui-kit";
import type { WlComponentManifest } from "@whitelife-core/ui-kit";

const button = wlManifest.find((entry) => entry.name === "WlButton");
```

Либо как статический JSON (генерируется при сборке в `dist/manifest.json`):

```ts
import manifest from "@whitelife-core/ui-kit/manifest.json";
```

Типы: `WlComponentManifest`, `WlPropManifest`, `WlSlotManifest`, `WlEmitManifest`,
`WlModelManifest`, `WlManifestCategory`, `WlManifestPropType`. Категории:
`actions`, `inputs`, `data`, `containers`, `navigation`, `feedback`, `misc`.
Пропсы типа `icon` принимают значения из `WlIconName`, тип `object` — это
PrimeVue pass-through (`pt`) или сложные объекты вроде `locale`.

## Разработка

```bash
pnpm build      # сборка (vite lib mode → dist/index.js + dist/*.d.ts)
pnpm test       # Vitest + Vue Test Utils
pnpm typecheck  # vue-tsc --noEmit
```
