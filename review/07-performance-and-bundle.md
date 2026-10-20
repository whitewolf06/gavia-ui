# 07. Производительность: runtime, бандл потребителя, Playground

[← к оглавлению](README.md)

## Как измерялось

- Сборка `dist` версии 0.12.1 (`pnpm build`) в отдельной копии репозитория в облаке.
- Отдельное Vite-приложение-потребитель: `vue` в бандле, минификация esbuild, флаги `__VUE_OPTIONS_API__=false`, `__VUE_PROD_DEVTOOLS__=false`; Vue 3.5.40.
- Playground: `vite build --sourcemap` + source-map-explorer; вес страниц — Playwright с подсчётом ответов (оценка в gzip).

---

## Библиотека в бандле потребителя

| Сценарий | gzip |
|---|---|
| Только Vue (createApp + Teleport + Transition) | 24.7 КБ |
| `WlButton` (vue external) | ≈2.4 КБ — tree-shaking работает |
| Vue + `WlSelect` — **как есть** | **53.8 КБ** |
| Vue + `WlSelect` — с исправлением PERF-1 | **39.1 КБ** |
| Вся библиотека (vue external) | 69 КБ |

### PERF-1. `import * as Vue` в `useWlId` — +14.7 КБ у каждого пользователя · **P0** · S

```ts
// utils/useWlId.ts
import * as Vue from "vue";
const nativeUseId = Reflect.get(Vue, "useId");
```

Динамический доступ к namespace-объекту заставляет Rollup, Vite и esbuild считать использованными **все** экспорты Vue. В бандл попадают TransitionGroup, KeepAlive, Suspense, хелперы SSR и так далее. Это происходит, как только пользователь импортирует любой компонент с ID: Select, MultiSelect, Autocomplete, DatePicker, Dialog, Drawer, Field, FilterBar, CommandPalette. Я проверил, заменив namespace-импорт на `import { useId } from "vue"`: **53.8 → 39.1 КБ gzip**.

**Варианты исправления:**
1. **Рекомендуемый:** поднять peer до `vue: ^3.5.0` (вышел в сентябре 2024; ветка 3.4 давно без поддержки) и импортировать `useId` напрямую. Ветка с `WeakMap`-счётчиком для 3.4 удаляется. Это minor с явной заметкой в миграции (в 0.x допустимо).
2. Если 3.4 нужно сохранить: отказаться от `useId` совсем и генерировать ID своим счётчиком на `appContext` (как сейчас в fallback-ветке) с префиксом `app.config.idPrefix`. Без namespace-импорта.

**Защита от регрессии:** [PERF-8](#perf-8-бюджет-размера-в-ci--p1--s).

### PERF-2. Глобальные слушатели на каждый экземпляр оверлея · P1 · S

`useAnchoredOverlay()` в `onMounted` вешает 4 слушателя на `document`/`window`: `pointerdown`, `keydown`, `resize`, `scroll` (capture). Это происходит **для каждого** Select, MultiSelect, Autocomplete, DatePicker, Menu и Popover, даже закрытого.
- На странице документации Select около 12 combobox — это ~48 глобальных слушателей.
- Таблица на 100 строк с Select в ячейке — 400 слушателей; каждый `scroll` вызывает 100 функций `position()`.

**Исправление:**
- вешать слушатели в `show()` и снимать в `hide()` (и в `onBeforeUnmount` на всякий случай);
- `position()` вызывать через `requestAnimationFrame` (один кадр на серию scroll-событий);
- z-index якоря (сейчас цикл `getComputedStyle` по **всем** предкам) вычислять один раз при открытии, а не на каждом scroll;
- пересчитывать позицию при изменении размеров панели (`ResizeObserver` на панели, пока открыта): у Autocomplete высота меняется при фильтрации.

То же касается `useOverlayLifecycle`: `keydown` на `document` вешается при монтировании, а нужен только при `active`.

### PERF-3. `pt`-слияние на каждый рендер · P2 · S

`useWlPt()` возвращает функцию `section(name, context)`. Каждый вызов:
- 3× `atPath()` (split по точке + reduce);
- 3× `resolveSection()`;
- `mergeWlAttrs()` с новыми массивами `class`/`style`.

В `WlSelect` секции вызываются для каждой опции на каждый рендер (`section('option', {...})`, `section('optionLabel')`): для 200 опций это 400+ слияний при каждом движении стрелки.

**Исправление:**
- Быстрый путь: если ни `WlConfig.pt[component]`, ни локальный `pt` не заданы, вернуть заранее посчитанные дефолты секции. Это частый случай.
- Кэш по `(section)` для секций без контекста, сбрасываемый при изменении `props.pt`.
- В итоге 0 аллокаций для пользователей без pt.

### PERF-4. Нормализация locale в каждом экземпляре · P2 · S

`useWlLocale()` создаёт в **каждом** компоненте `computed(() => normalizeWlLocale(config.locale))`. Это слияние словаря на ~100 ключей и `Intl.getCanonicalLocales`. Результат одинаков для всего приложения.

**Исправление:** нормализовать один раз в `WlConfig.install` (или `WeakMap<localeInput, normalized>`), в компонентах только `inject`.

### PERF-5. Иконки: вся карта в любом компоненте с шевроном · P3 · S

`WlIcon` импортирует `WL_ICONS` (113 SVG, ~4 КБ gzip), поэтому любой компонент, использующий `WlIcon`, тянет весь набор. Немного, но для чистоты:
- внутренние компоненты могут импортировать нужные SVG-строки напрямую (`import { chevronDown } from "../icons.generated"`) и рендерить через лёгкий `WlSvg`;
- `WlIcon` по имени остаётся для пользователей.

Генерацию `icons.generated.ts` нужно поменять на именованные экспорты + карту.

### PERF-6. CSS одним файлом · P2 · M

`styles/base.css` — 113 КБ (16 КБ gzip) со всеми 53 компонентами. Пользователь, которому нужны 5 компонентов, грузит стили всех.

**Варианты:**
- Минимальный: оставить как есть, но поставлять минифицированную копию `styles/base.min.css`. Бандлеры и так минифицируют, поэтому выигрыш только для CDN и `<link>`.
- Правильный: разбить на `styles/components/<name>.css` + `styles/tokens.css`, а `base.css` собирать из них (`@import` или конкатенация на сборке). Пользователь выбирает: всё или по компонентам. CSS-слои это не ломает.

### PERF-7. Шрифт: 12 статических WOFF2 · P1 · M

`fonts/gavia/*.woff2`: 12 файлов по ~37–41 КБ (~470 КБ на все начертания). Исходник (`scripts/fonts/sources/Onest-Variable.ttf`) переменный.

**Исправление:**
- Собирать **переменный** WOFF2 (`Gavia-Variable.woff2` + `Gavia-Variable-Italic.woff2`, `font-weight: 100 900`). Скорее всего, ~60–90 КБ на всё вместо 470.
- Разбить на `unicode-range`-сабсеты: латиница / кириллица / знаки. Русскоязычной странице не нужна расширенная латиница и наоборот.
- Статические начертания оставить как fallback (или убрать).
- В `styles/fonts/gavia.css` добавить `size-adjust` / `ascent-override` для системного fallback, чтобы уменьшить скачок вёрстки (CLS) при `font-display: swap`.

### PERF-8. Бюджет размера в CI · P1 · S

Сейчас ничто не ловит регрессии вроде PERF-1. Добавить проверку: `size-limit` (+ `@size-limit/preset-small-lib`) или собственный скрипт на esbuild или Vite, который собирает фикстуры потребителя (уже есть `scripts/fixtures/package-consumer`) и сравнивает с лимитами:

| Фикстура | Лимит (gzip, с Vue) |
|---|---|
| `WlButton` | ≤ 26 КБ |
| `WlSelect` | ≤ 41 КБ |
| Форма (Input, Select, DatePicker, Field, Button) | ≤ 50 КБ |
| Всё | ≤ 95 КБ |

Плюс бейдж в README («gzip: N КБ»).

---

## npm-пакет

### PKG-1. Вес архива 1.35 МБ / 3.17 МБ в распакованном виде · P1 · S

| Что | Размер | Нужно в npm? |
|---|---|---|
| `fonts/gavia/*.ttf` (12 шт.) | ~1.25 МБ | **нет**: для веба нужен WOFF2; TTF — в GitHub Release для десктопа |
| `fonts/gavia/qa-report.json` | 123 КБ | **нет**: артефакт QA |
| `dist/design-system/tokens.generated.d.ts` | 179 КБ | да, но можно сократить: вынести данные в `.json`, а в `.d.ts` оставить только тип |
| `dist/design-tokens.json` | 161 КБ | да (публичный экспорт) |
| `dist/manifest.json` | 98 КБ | да |

После чистки архив станет примерно в 4 раза меньше.

### PKG-2. Типы не резолвятся в `node16`/`nodenext` · P2 · S

arethetypeswrong: `bundler` 🟢, `node16 (from ESM)` → **Internal resolution error**: в сгенерированных `.d.ts` относительные импорты без расширения `.js`. Затрагивает пользователей с `moduleResolution: "node16" | "nodenext"`: часть Node-скриптов, тесты без бандлера, некоторые конфигурации Nuxt-модулей.

**Исправление:** собирать декларации так, чтобы импорты были с `.js`. Варианты: `vite-plugin-dts` с `beforeWriteFile`-заменой, `tsc` 5.7+ с `rewriteRelativeImportExtensions`, или `vue-tsc --declaration --emitDeclarationOnly` + постобработка. Добавить `attw --pack` в CI.

### PKG-3. Верхнеуровневое поле `types` · P3 · S

Нет `"types": "./dist/index.d.ts"` (и `"module"`) вне `exports`. Старые резолверы TS (`node10`) не найдут типы. Одна строка.

### PKG-4. Мелочи в `package.json` · P3 · S

- `"engines"` в пакете библиотеки не нужен (это для разработки), а вот `"sideEffects": ["**/*.css"]` — правильно.
- Добавить `"funding"` (если нужно) и уточнить `"keywords"`: `vue-components`, `ui-library`, `accessibility`, `design-tokens`, `ssr`.
- Старые архивы `whitelife-*.tgz` в `packages/ui-kit` на локальной машине (в git их нет, они игнорируются) можно удалить. Локальный `dist` датирован 27 сентября и собран ещё до ухода с PrimeVue: перед `pnpm dev` его стоит пересобрать.

---

## Playground (сайт документации)

Измерено на `vite build` + статическом сервере, Chromium, 1440×900:

| Страница | Запросов | Передано (≈gzip) |
|---|---|---|
| Главная | 30 | **~1.2 МБ**: PNG 401 КБ, JS 319 КБ, WebP 293 КБ, шрифты 151 КБ |
| Документация → компонент | 31 | **~1 МБ**: JS 397 КБ, PNG 401 КБ, шрифты 151 КБ |

### PG-PERF-1. Логотип в шапке — PNG на 410 КБ · **P0** · S

`App.vue`: `import gaviaMarkUrl from "../../../docs/brand/gavia-ui-mark-v2.png"` — 410 КБ на каждой странице ради картинки ~32 px. В `docs/brand` уже есть `gavia-ui-mark-lake.svg`. Если нужна именно растровая v2: экспортировать 64×64 и 128×128 WebP/AVIF по ~3 КБ. Минус ~400 КБ на каждой странице.

### PG-PERF-2. Главный JS-чанк 908 КБ (235 КБ gzip) · **P1** · M

По source map:

| Содержимое | Размер (min) |
|---|---|
| Все i18n JSON **обоих языков** (shell, documentation, examples, tokens, changelog) | ~640 КБ |
| `packages/ui-kit/src/design-system/tokens.generated.ts` | 113 КБ |
| Vue runtime | ~85 КБ |
| vue-i18n + **компилятор сообщений** `@intlify/message-compiler` | ~55 КБ |

**Исправление:**
1. Загружать словари по языку и разделу: `import(`./messages/${ns}.${lang}.json`)`. Shell сразу, остальное — при входе на страницу.
2. Предкомпилировать сообщения через `@intlify/unplugin-vue-i18n` и подключить runtime-only сборку vue-i18n (алиас `vue-i18n/dist/vue-i18n.runtime.esm-bundler.js`). Компилятор уходит из бандла, это быстрее и CSP-безопасно.
3. `tokens.generated.ts` импортировать только на страницах токенов и цветов и в конструкторе тем.

Ожидаемо главный чанк будет ~60–80 КБ gzip.

### PG-PERF-3. `DocsPage` 334 КБ, `CodePanel` 88 КБ · P2 · M

- Подсветка кода: собственный токенайзер (`highlighting/tokenizer.ts`) — это хорошо, но `CodePanel` весит 88 КБ. Стоит проверить, что попадает в чанк. Вероятно, исходники всех примеров через `?raw`. Грузить исходник примера только при раскрытии панели кода.
- `DocsPage`: разделить по категориям компонентов (actions, inputs, data…) через `defineAsyncComponent`.

### PG-PERF-4. Изображения главной · P2 · S

Герой-изображение WebP 112 КБ, ночная версия ещё 111 КБ, и **обе грузятся** на главной. Ночную нужно грузить только в тёмной теме (`<picture>` с `media="(prefers-color-scheme: dark)"` или по `data-wl-theme`). Добавить `srcset` с 640/1024/1600 px для мобильных. Карточки — `loading="lazy"`.

### PG-PERF-5. Шрифты Playground · P2 · S

На главной грузятся 4 статических начертания (Regular, Medium, SemiBold, Bold) — 151 КБ. Один переменный WOFF2 из PERF-7 заменит их все (и курсивы на других страницах). Для него стоит добавить `<link rel="preload" as="font" type="font/woff2" crossorigin>`, чтобы текст не перерисовывался.

Проверено: на главной в **светлой** теме загружаются обе иллюстрации — дневная `gavia-lake-hero-v2` и ночная `gavia-lake-night-v2` (см. PG-PERF-4).
