# Слабые места Gavia UI — сводка с доказательствами

[← к оглавлению](README.md) · [План работ](PLAN.md)

Все слабые места в одном списке, по степени серьёзности. У каждого:
- **доказательство** — файл и строка, замер или команда, которой это проверено;
- ID находки (подробности — в тематическом файле);
- задача плана, которая это исправляет.

Номера строк даны для `origin/main` на `e60cf78` (0.12.1).

**Уровни:**
- 🔴 **критично** — видимый дефект для пользователей библиотеки или заметная проблема для каждого посетителя;
- 🟠 **высоко** — снижает качество или доверие, видно специалисту;
- 🟡 **средне** — неудобство, техдолг, мешает росту;
- ⚪ **низко** — косметика.

---

## 🔴 Критично

| # | Слабое место | Доказательство | ID → задача |
|---|---|---|---|
| 1 | **Скринридер не озвучивает навигацию в Select, MultiSelect и Autocomplete** — выбрать значение с клавиатуры вслепую нельзя | У опций нет `id`, у combobox нет `aria-activedescendant` (`grep activedescendant` находит его только в `WlCommandPalette.vue:266`). Chromium AX-tree после ArrowDown: фокус на `combobox`, `aria-activedescendant = null` | A11Y-1 → T1.1 |
| 2 | **Активная опция уходит за край списка** при навигации клавиатурой | `styles/base.css:849` `max-height: 240px; overflow-y: auto`; `scrollIntoView` есть только в `WlCommandPalette.vue:189` | A11Y-2 → T1.1 |
| 3 | **Дубли ID в `WlTabs`** при двух группах вкладок с одинаковыми ключами; `aria-labelledby` панели указывает не туда | `WlTabs.vue:63` `:id="`wl-tab-${item.key}`"`, `:78` `aria-labelledby` по той же схеме; `useWlId` не используется | A11Y-3 → T1.2 |
| 4 | **+14.7 КБ gzip в бандле каждого пользователя** при импорте любого компонента с ID | `utils/useWlId.ts:1` `import * as Vue from "vue"` + `:9` `Reflect.get(Vue, "useId")`. Замер: Vue + `WlSelect` 53.8 КБ → 39.1 КБ при прямом `import { useId }` | PERF-1 → T1.4 |
| 5 | **Сайт документации весит ~1.2 МБ на главной и ~1 МБ на странице компонента** | Логотип `docs/brand/gavia-ui-mark-v2.png` 410 КБ (`App.vue:15`, `HomePage.vue:12`) на каждой странице; главный JS-чанк 908 КБ / 235 КБ gzip, в нём ~640 КБ словарей **обоих** языков и компилятор vue-i18n; ночная иллюстрация грузится в светлой теме | PG-PERF-1, PG-PERF-2, PG-PERF-4 → T1.6, T5.4, T5.5 |
| 6 | **Нет линтера и форматтера** | В репозитории нет конфигов ESLint, Prettier, Biome и `.editorconfig`. Пробный прогон ESLint: ~6 900 находок, 388 файлов меняются при автофиксе | LINT-1 → T0.3 |

## 🟠 Высоко

| # | Слабое место | Доказательство | ID → задача |
|---|---|---|---|
| 7 | Списочные компоненты **без слотов**: нельзя кастомизировать опцию, значение, пустое состояние | `defineSlots<{}>()` в `WlSelect`, `WlMultiSelect`, `WlAutocomplete` | CMP-6 → T4.1 |
| 8 | **Нет интеграции с роутером** | `WlBreadcrumbs`: `to` → `<a :href>` (полная перезагрузка); у `WlMenuItemBase` нет `href`/`to`, пункт — `<a>` без `href`; NavItem, Sidebar, CommandPalette — только `href` | CMP-2 → T4.4 |
| 9 | **Шесть разных словарей статусов** | Alert `info/ok/warn/err`; Pill `neutral/info/ok/warn/err`; Badge `gray/accent/success/warn/danger`; Tag `gray/blue/green/amber/red`; Toast `success/info/warn/error`; `useWlToast` `ok/info/warn/err`; Button `danger`, `danger-quiet`, `soft-danger` (`types.ts:5–17, 48`) | CMP-1 → T4.5 |
| 10 | **Toast почти не настраивается и нарушает WCAG 2.2.1** | `services/toast.ts:40` `add(message, life = 2200)`; `useWlToast` не передаёт `life`; нет sticky, action, паузы, `update`/`dismiss`; ошибки объявляются `polite` (контейнер `aria-live="polite"`) | A11Y-9 → T3.4 |
| 11 | **Таблица без `rowKey`**: состояние ячеек «переезжает» при удалении или сортировке строк | `WlTable.vue:45` `:key="rowIndex"`; то же `:key="index"` у опций (`WlSelect.vue:95`, `WlMultiSelect.vue:132`, `WlAutocomplete.vue:157`) | CMP-8 → T4.2 |
| 12 | **Документированный контракт не соблюдается** | README и `agents.md`: «у всех компонентов `variant`, `size`, `density`, `pt`». Факт: без `pt` — 22 компонента, без `size` — 36, без `density` — 40 | CMP-3 → T2.4, T4.6 |
| 13 | **Русские тексты зашиты в дефолты props** + хрупкий обход `useWlLocaleText` (чтение `instance.vnode.props`) | 13 компонентов: Alert, Autocomplete, ColorPicker, CommandPalette, DatePicker, FilePicker, FilterBar, NumberInput, PasswordInput, Sidebar, Spinner, Table, Tag; fallback-локаль библиотеки — русская при английской документации | CMP-4 → T9.2 |
| 14 | **`WlAlert` всегда `role="alert"`** — статичный info-блок «кричит» при рендере | `WlAlert.vue:37` | A11Y-4 → T3.1 |
| 15 | **Нет гарантированного доступного имени** у IconButton, Select в Field, точек и счётчиков, presence | `WlIconButton`: `ariaLabel?` необязателен; `WlField` не передаёт `labelId` в слот (только `id`, `inputId`, `ariaDescribedby`, `ariaInvalid`, `invalid`, `required`), а `<label for>` не называет `div[role=combobox]` | A11Y-5 → T3.2 |
| 16 | **Меню: Tab проходит по каждому пункту** | `WlMenu.vue:66` `:tabindex="item.disabled ? -1 : 0"` у всех пунктов | A11Y-13 → T3.5 |
| 17 | **Фон модальных окон не `inert`** | `useOverlayLifecycle` ставит фокус-ловушку и `aria-modal`, но `inert` нигде не используется | A11Y-6 → T3.3 |
| 18 | **Глобальные слушатели на каждый экземпляр закрытого оверлея**; позиционирование на каждый scroll без rAF и с обходом всех предков | `utils/anchoredOverlay.ts:89–93` (4 слушателя в `onMounted`), `position()` вызывает `getComputedStyle` по всем предкам; `overlayLifecycle.ts:193` — `keydown` при монтировании | PERF-2 → T5.1 |
| 19 | **npm-пакет 1.35 МБ** — в основном не нужные вебу TTF | `pnpm pack`: 12 TTF ≈ 1.25 МБ, `fonts/gavia/qa-report.json` 123 КБ | PKG-1 → T2.6 |
| 20 | **12 статических WOFF2 (~470 КБ)** при переменном исходнике | `fonts/gavia/*.woff2` по 37–41 КБ; `scripts/fonts/sources/Onest-Variable.ttf` | PERF-7 → T5.3 |
| 21 | **README не продаёт проект**: почти сразу после заголовка идёт объяснение, как устроен бейдж покрытия | `README.md`, строки после описания: «The 0–100% scales show… The badge stores a line coverage measurement…» | DOC-1 → T2.1 |
| 22 | **API-таблицы на сайте показывают `array` / `union` / `object`** вместо реальных типов — главная сила библиотеки не видна | Вкладка API у `WlSelect` (снимок в ревью); Events: «No public events» при наличии `update:modelValue` | PG-2 → T8.5 |
| 23 | **Node 18 (EOL с апреля 2025) в CI и `engines`**, тулчейн отстаёт на 1–2 мажора | `publish.yml` матрица `[18, 24]`; `pnpm -r outdated`: vite 6.4 → 8.3, vitest 3.2 → 5.0, TS 5.8 → 7.0, plugin-vue 5 → 6, jsdom 26 → 30 | CI-2, CI-4 → T0.2, T2.7 |
| 24 | **Правила агента мешают работе**: запрещены даже точечные проверки; в общем контракте лежат настройки конкретной машины; файл называется не по конвенции | `agents.md` §6 (запрет `test` и т. д. до команды), §8 (`.tools/`, `.pnpm-store`), имя `agents.md`; `.npmrc` с `store-dir=.pnpm-store` в git | AGENT-1…3 → T0.1 |
| 25 | **Высокая стоимость добавления компонента** — около 25 файлов | `git grep -l WlTimePicker` — 25 файлов без CHANGELOG и docs | ARCH-1 → T7.2 |
| 26 | **Слой типовых контрактов опирается на внутреннее поле vue-tsc `__ctx`** | `components/generic-contracts.ts` (`NonNullable<Result["__ctx"]>`) | ARCH-2 → T9.1 (документировать), T2.7 (Renovate группирует vue-tsc) |
| 27 | **`WlConfig` не реактивен**; Playground обходит это сам, а пользователю об этом не сказано | `config.ts` `app.provide(configKey, options)`; `apps/playground/src/bootstrap.ts:7–8` `shallowReactive` + `watch` | ARCH-3 → T3.9 |

## 🟡 Средне

| # | Слабое место | Доказательство | ID → задача |
|---|---|---|---|
| 28 | Тесты разложены по истории (`stage5a`, `stage5b`, `pickers-0.8`, `prime-removal-regression`) | `packages/ui-kit/tests/` | TEST-1 → T7.1 |
| 29 | 12 тестов библиотеки импортируют код Playground | `grep -rl apps/playground packages/ui-kit/tests` → 12 файлов | TEST-2 → T7.5 |
| 30 | Tooltip покрыт слабо | `directives/tooltip.ts`: 69% строк, 51% веток, 45% функций | TEST-3 → T7.5 |
| 31 | ~100 условных `expect`: тест может пройти, ничего не проверив | ESLint: `vitest/no-conditional-expect` 44, `playwright/no-conditional-expect` 57, `playwright/no-conditional-in-test` 43 | TEST-8 → T0.4 |
| 32 | Нет тестов, которые бы поймали пункты 1–4 и 18 (уникальность ID, AX-tree, размер бандла, слушатели) | — | TEST-4 → T1.3, T1.5, T5.1 |
| 33 | Монолитный workflow на 433 строки с именем `publish`, setup повторён 7 раз | `.github/workflows/publish.yml` | CI-1 → T7.4 |
| 34 | Нет проверок размера, `publint` и attw в CI; типы ломаются при `moduleResolution: node16` | attw: `node16 (from ESM)` → Internal resolution error | CI-3, PKG-2 → T1.5, T2.7, T9.5 |
| 35 | Ручная синхронизация копий: 2 CHANGELOG, 2 LICENSE, версии в README | `package.json` 0.12.1, README корня и пакета — 0.12.0; на сайте `v0.12.1` в шапке и `0.12.0` в установке | REL-1, DOC-4 → T2.4, T2.5 |
| 36 | Пользовательская документация смешана с журналами проверок | `docs/quality.md`: «During local 0.11.0 preparation on October 8, 2026…»; `docs/architecture.md`: «Release preparation locally checked…» | DOC-2 → T8.1 |
| 37 | 13 файлов миграций для 0.x; `releases.md` — журнал на 501 строку; CHANGELOG дублирует каждую запись разделом `### Changesets` | `docs/migration-*.md`, `docs/releases.md`, `CHANGELOG.md` | DOC-3, REL-2, REL-3 → T8.2, T8.7 |
| 38 | ROADMAP — история, а не план; CONTRIBUTING — 22 строки | `ROADMAP.md` (Stage 0–5b, ветка `codex/remove-primevue`), `CONTRIBUTING.md` | DOC-5, DOC-6 → T8.3, T2.3 |
| 39 | Смешение языков в публичной части | `agents.md`, `.github/ISSUE_TEMPLATE/*` («Ошибка», «Предложение»), `.changeset/README.md` — по-русски; docs — по-английски | DOC-7 → T8.4, T2.2 |
| 40 | Нет файлов сообщества | Нет `CODE_OF_CONDUCT.md`, `SECURITY.md`, PR-шаблона; два имени автора в истории (`WhiteWolf` 23, `Gorbach Dmitry` 75) | OSS-1 → T2.2 |
| 41 | Логика дублируется между библиотекой, Playground и скриптами (контраст ×3, тема, даты, ограничение чисел ×22) | `apps/playground/src/theme-builder/palette.ts`, `packages/ui-kit/scripts/token-tools.mjs`, `WlColorPicker`; `themes.ts`/`preferences.ts`/`theme-transition.ts`; 22 вхождения `Number.isFinite` в 7 компонентах | ARCH-6 → T6.2, T6.4, T6.5 |
| 42 | Playground импортирует библиотеку по относительным путям (209 мест), а не через `gavia-ui` | `../../../packages/ui-kit/src/...` | ARCH-7 → T7.3 |
| 43 | Нет плюрализации и Intl-форматирования | `formatWlLocaleText` — только подстановка `{key}`; `selectedItems: "{count} выбрано"`; `humanSize` и ручные `КБ`/`МБ`/`decimalSeparator` в `WlFileUpload` | UTIL-1, UTIL-2 → T6.1 |
| 44 | Разные API у похожих компонентов | Dialog: `dismissable` по умолчанию `false`, есть `closable`, `width`, `afterLeave`; Drawer: `dismissable` `true`, нет `closable`, `width`, `afterLeave` | CMP-5 → T4.6 |
| 45 | Остатки PrimeVue | `WlPagination.vue:99` `@update:first` на `<nav>`, `:72` `changePageCallback`; pt-ключи `pcCloseButton`, `datatable`, `selectbutton`…; `dismissable`; комментарии в `tests/setup.ts` | CMP-7 → T1.7, T9.3 |
| 46 | `WlIconButton` и `WlButton` делят pt-ключ `button` | `useWlPt("button", …)` в обоих | CMP-7 → T9.3 |
| 47 | `pt` пересчитывается на каждый рендер для каждой секции и опции; locale нормализуется в каждом экземпляре | `config.ts` `useWlPt` → `resolveWlPt` → `mergeWlAttrs` на каждый вызов; `useWlLocale` → `computed(normalizeWlLocale)` на экземпляр | PERF-3, PERF-4 → T5.2 |
| 48 | Два стека оверлеев | `overlayLifecycle.ts` (`overlayStack: symbol[]`) и `overlayStack.ts` | ARCH-5 → T5.6 |
| 49 | Маршруты сайта на query-параметрах и самописный роутер в `App.vue` (402 строки) | `?view=docs&component=WlSelect&lang=en&theme=gavia` | PG-3 → T9.7 |
| 50 | Визуальные эталоны снимаются только на Windows | `publish.yml` job `visual: runs-on: windows-2022` | CI-5 → T7.6 |
| 51 | Unit-прогон ~65 с, из них ~69 с суммарно — подготовка jsdom, хотя треть файлов DOM не нужна | `pnpm test:coverage` | TEST-5 → T7.5 |
| 52 | `docs/brand` ~13 МБ: PNG-исходники, промпты генерации, черновые логотипы | `du -sh docs/brand` | DOC-9 → T8.8 |
| 53 | Ошибка поля с `role="alert"`, подсказка исчезает при ошибке | `WlField.vue:44`; `v-else-if="hint"` | A11Y-12 → T3.6 |

## ⚪ Низко

| # | Слабое место | Доказательство | ID → задача |
|---|---|---|---|
| 54 | Select вызывает `choose()` дважды (mousedown + click) | `WlSelect.vue:98` | — → T1.1 |
| 55 | `WlSteps` без списочной семантики | `div`/`span` вместо `ol`/`li` | A11Y-8 → T3.7 |
| 56 | Неполный `FOCUSABLE_SELECTOR` | `overlayLifecycle.ts:5` — нет `contenteditable`, `summary`, `iframe`, медиа с `controls` | A11Y-11 → T3.8 |
| 57 | Вся карта иконок в любом компоненте с шевроном | `WlIcon.vue` импортирует `WL_ICONS` (113 SVG, ~4 КБ gzip) | PERF-5 → фаза 10 |
| 58 | Нет верхнеуровневого `types` в `package.json` | `packages/ui-kit/package.json` | PKG-3 → T2.7 |
| 59 | «Since 0.1.0» у 44 из 53 компонентов в боковой панели сайта; навигация по компонентам справа; заголовки примеров крупнее заголовков раздела | Снимки страницы `WlSelect` | PG-6 → T8.6 |
| 60 | Changelog хранится трижды (`CHANGELOG.md` + `changelog.en.json` + `changelog.ru.json`) | `apps/playground/src/i18n/messages/changelog.*.json` | PG-8 → T8.7 |
| 61 | Локальная машина: старые `whitelife-*.tgz` в `packages/ui-kit`, `dist` от 27 сентября (ещё с PrimeVue), 2 незапушенных коммита | Локальная папка | PKG-4 → вне плана: удалить архивы, пересобрать `dist`, сделать push |

---

## Что **не** является слабым местом (чтобы не «исправить» лишнее)

- `vue@3.4.38` в devDependencies пакета — намеренная нижняя граница для проверки peer. Меняется **только** вместе с T1.4.
- Исторические фикстуры совместимости (`tests/fixtures/compatibility-*`) неизменяемы.
- Директива `v-html` в `WlIcon` безопасна: SVG из собственного проверенного каталога (`icons:check`).
- Классы `wl-*`, атрибуты `data-wl*` и токены `--wl-*` — публичный контракт. Префикс `Wl` при бренде Gavia — осознанное историческое решение, менять не рекомендуется (ARCH-9).
- Отдельные `templateTeleport.vue` и `templateTransition.vue` — обход Volar для generic SFC, а не мусор. Их импорты нельзя удалять автофиксом линтера (учтено в черновике конфига).
- Отсутствие роутера, стора и API-клиента в библиотеке — правильная граница, а не пробел.
