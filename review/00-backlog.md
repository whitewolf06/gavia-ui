# 00. Сводный бэклог всех находок

> Execution authority: [approved decisions and live task ledger](IMPLEMENTATION.md) override the original recommendations and template permissions below. Vue 3.4 support and Windows primary baselines are retained. No commits or heavy checks are authorised implicitly.


[← к оглавлению](README.md)

Все находки ревью в одной таблице, отсортированные по приоритету. Подробности — в файле из колонки «Где». Колонка «Задача» — номер задачи в [PLAN.md](PLAN.md), которая закрывает находку (Ф10 — фаза «после 1.0»).

**Проверки и результаты:** текущий статус каждой задачи и ограничения приёмки находятся в [реестре выполнения](IMPLEMENTATION.md#execution-ledger). Связь каждой находки с задачей в последней колонке сохраняется. Статус кода не означает релизную готовность.

**Status source:** Keep task IDs in the mapping column. Record current status, verification evidence and remaining scope only in [the execution ledger](IMPLEMENTATION.md#execution-ledger), avoiding a second status copy here.

**Приоритет:**
- **P0** — дефект или дешёвое улучшение с большим эффектом, делать первым;
- **P1** — важно до 1.0;
- **P2** — заметное улучшение;
- **P3** — по желанию.

**Трудозатраты:** S — до 2 часов; M — от полудня до 2 дней; L — 3+ дня.

**Breaking:** «да» — меняет публичный контракт (нужны алиасы, миграция или 1.0).

## P0 — сначала

| ID | Что | Трудозатраты | Breaking | Где | Задача |
|---|---|---|---|---|---|
| A11Y-1 | Combobox (Select/MultiSelect/Autocomplete) без `aria-activedescendant` и `id` опций — скринридер молчит при навигации | S | нет | [06](06-accessibility.md) | T1.1 |
| A11Y-2 | Активная опция не прокручивается в видимую область (`max-height: 240px`) | S | нет | [06](06-accessibility.md) | T1.1 |
| A11Y-3 | Дубли ID в `WlTabs` (`wl-tab-${key}`), нет `aria-controls` | S | нет | [06](06-accessibility.md) | T1.2 |
| UTIL-12 | Внутренний `useWlListbox` (ID опций, activedescendant, scroll, затем typeahead) | S→M | нет | [05](05-composables-and-utils.md) | T1.1, T6.6 |
| TEST-4 | Тесты на A11Y-1/2/3, контракт «уникальные ID при двух экземплярах», один emit на клик | M | нет | [09](09-testing.md) | T1.3 |
| PERF-1 | `import * as Vue` в `useWlId` → +14.7 КБ gzip у пользователей; поднять peer до Vue 3.5 | S | да (peer) | [07](07-performance-and-bundle.md) | T1.4 |
| PG-PERF-1 | Логотип в шапке Playground — PNG 410 КБ → SVG/WebP | S | нет | [07](07-performance-and-bundle.md) | T1.6 |
| CI-2 | Node 18 (EOL) → 20/22/24, `engines >=20.19` | S | нет | [08](08-build-ci-release.md) | T0.2 |
| LINT-1 | Собственный ESLint flat-конфиг в духе antfu (черновик проверен), `.editorconfig`, CI-шаг | M | нет | [02](02-code-style-and-lint.md) | T0.3 |
| A11Y-P1 | `eslint-plugin-vuejs-accessibility` в составе LINT-1 | S | нет | [06](06-accessibility.md) | T0.3 |
| DOC-1 | Первый экран README: что, как выглядит, почему, quick start | S | нет | [11](11-markdown-docs.md) | T2.1 |
| AGENT-1 | `agents.md` → `AGENTS.md` + `CLAUDE.md` (`@AGENTS.md`) | S | нет | [12](12-agent-rules.md) | T0.1 |
| AGENT-2 | Разрешить быстрые точечные проверки, тяжёлые — по команде | S | нет | [12](12-agent-rules.md) | T0.1 |
| OSS-1 | CODE_OF_CONDUCT, SECURITY, PR-шаблон, английские issue-шаблоны, `.mailmap` | S | нет | [13](13-open-source-and-portfolio.md) | T2.2 |
| — | Select: двойной `choose` (mousedown + click) | S | нет | [03](03-components.md) | T1.1 |

## P1 — до 1.0

| ID | Что | Трудозатраты | Breaking | Где | Задача |
|---|---|---|---|---|---|
| CMP-1 | Один словарь статусов `tone` вместо шести (`ok/err`, `success/danger`, цвета…) | M | да → алиасы | [03](03-components.md) | T4.5 |
| CMP-2 | Интеграция с роутером: `WlConfig.linkComponent` + `WlLink`; `to` в Breadcrumbs, NavItem, Sidebar, Menu, CommandPalette | M | нет | [03](03-components.md) | T4.4 |
| CMP-3 | Контракт осей (`size`/`density`/`pt`) по категориям; закрыть пробелы (Textarea size, Checkbox/Radio/Switch size, pt у 22 компонентов) | S/M | нет | [03](03-components.md) | T2.4, T4.6 |
| CMP-4 | Убрать русские дефолты из props, текст только из locale, удалить `useWlLocaleText` | M | да (1.0) | [03](03-components.md) | T9.2 |
| CMP-5 | Единые API у семейств (Dialog ↔ Drawer: closable, width, afterLeave, dismissible) | S–M | частично | [03](03-components.md) | T4.6 |
| CMP-6 | Слоты у Select/MultiSelect/Autocomplete (option, value, empty, header, footer, chip) + `clearable` | M | нет | [03](03-components.md) | T4.1 |
| CMP-8 | `rowKey` у Table, `optionKey` у списков вместо `:key="index"` | S | нет | [03](03-components.md) | T4.2 |
| — | Table: `caption`/`ariaLabel`, слот заголовка, `align`, сортировка, выбор строк | M–L | нет | [03](03-components.md) | T4.3 |
| — | Toast API: `life`, sticky, action, `update`/`dismiss`/`promise`, позиция, пауза на hover | M | нет (алиасы) | [03](03-components.md) | T3.4 |
| A11Y-4 | `WlAlert`: `role="status"` для info/success, `live` prop | S | нет | [06](06-accessibility.md) | T3.1 |
| A11Y-5 | Гарантированные имена: IconButton, Select внутри Field (`labelId`), Badge dot, presence, Progress | S–M | нет | [06](06-accessibility.md) | T3.2 |
| A11Y-6 | `inert` на фоне модальных окон | S | нет | [06](06-accessibility.md) | T3.3 |
| A11Y-7 | Объявления «найдено N» в Autocomplete/CommandPalette/фильтре | S | нет | [06](06-accessibility.md) | T4.1 |
| A11Y-9 | Тосты: время жизни ≥ 5 с, пауза, `role="alert"` для ошибок | S | нет | [06](06-accessibility.md) | T3.4 |
| A11Y-10 | Typeahead, PageUp/PageDown, disabled-опции в списках | M | нет | [06](06-accessibility.md) | T4.1 |
| A11Y-13 | `WlMenu`: roving tabindex (одна остановка Tab), закрытие popup по Tab | S | нет | [06](06-accessibility.md) | T3.5 |
| A11Y-P2 | Поведенческие a11y-тесты (`toMatchAriaSnapshot`, AX-tree) | M | нет | [06](06-accessibility.md) | T9.6 |
| A11Y-P3 | Ручная проверка NVDA и VoiceOver перед 1.0 | M | нет | [06](06-accessibility.md) | T9.6 |
| NEW-1 | `WlCheckboxGroup` / `WlRadioGroup` (+ режим массива у Checkbox) | M | нет | [04](04-new-components.md) | T9.4 |
| NEW-2 | `WlTooltip`-компонент | S–M | нет | [04](04-new-components.md) | T9.4 |
| NEW-3 | `WlLink` | S | нет | [04](04-new-components.md) | T4.4 |
| NEW-4 | Подменю, checkbox- и radio-пункты, ContextMenu | M–L | нет | [04](04-new-components.md) | T9.4 |
| NEW-5 | `WlToolbar` (roving focus) | S | нет | [04](04-new-components.md) | T9.4 |
| NEW-6 | `WlTagsInput` | M | нет | [04](04-new-components.md) | T9.4 |
| UTIL-1 | Плюрализация `wlPlural` (Intl.PluralRules), формы в locale | S | нет | [05](05-composables-and-utils.md) | T6.1 |
| UTIL-2 | `formatWlNumber` / `formatWlBytes` / `formatWlCount` («99+») | S | нет | [05](05-composables-and-utils.md) | T6.1 |
| UTIL-3 | Даты: parse/format/relative, месяцы и дни недели из Intl | M | нет | [05](05-composables-and-utils.md) | T6.5 |
| UTIL-5 | Один модуль контраста и hex вместо трёх копий | M | нет | [05](05-composables-and-utils.md) | T6.2 |
| UTIL-4 (color) | `getWlColorFromString(name, palette?)`: stable token-palette color; optional Avatar example without changing defaults | S | нет | [05](05-composables-and-utils.md) | T6.2 |
| UTIL-8 | `createWlLocaleFromIntl` — словарь до ~40 строк | M | нет | [05](05-composables-and-utils.md) | T9.2 |
| UTIL-9 | `useWlTheme` + `wlThemeInitScript` (перенос из Playground) | M | нет | [05](05-composables-and-utils.md) | T6.4 |
| UTIL-10 | `useWlAnnouncer` (live region) | S | нет | [05](05-composables-and-utils.md) | T6.3 |
| UTIL-11 | `useWlRovingFocus` | M | нет | [05](05-composables-and-utils.md) | T6.6 |
| ARCH-1 | Генератор `pnpm new:component` + чек-лист (~25 файлов на компонент) | M | нет | [01](01-architecture.md) | T7.2 |
| ARCH-2 | Риск `__ctx` в типовых контрактах: документировать, зафиксировать vue-tsc | S/M | нет | [01](01-architecture.md) | T9.1 |
| ARCH-3 | Реактивный `WlConfig` (смена locale и motion на лету) | S | нет | [01](01-architecture.md) | T3.9 |
| ARCH-4 | Английский fallback, один источник текста | M | да (1.0) | [01](01-architecture.md) | T9.2 |
| ARCH-9 | RFC решений к 1.0: префикс, fallback, имена pt, dismissible, tone, Vue 3.5 | S | — | [01](01-architecture.md) | T9.1 |
| PERF-2 | Глобальные слушатели только у открытых оверлеев, rAF, ResizeObserver | S | нет | [07](07-performance-and-bundle.md) | T5.1 |
| PERF-7 | Переменный WOFF2 + unicode-range | M | нет | [07](07-performance-and-bundle.md) | T5.3 |
| PERF-8 | Бюджет размера в CI | S | нет | [07](07-performance-and-bundle.md) | T1.5 |
| PKG-1 | Убрать TTF и `qa-report.json` из npm (1.35 МБ → ~0.35 МБ) | S | нет* | [07](07-performance-and-bundle.md) | T2.6 |
| PG-PERF-2 | Playground: ленивые словари, предкомпиляция vue-i18n, токены не в главном чанке | M | нет | [07](07-performance-and-bundle.md) | T5.4 |
| PG-2 | API-таблицы с реальными типами (`vue-component-meta`), JSDoc | M | нет | [10](10-playground-docs.md) | T8.5 |
| PG-7 | StackBlitz, «Why Gavia UI», рецепты в меню | S–M | нет | [10](10-playground-docs.md) | T9.7 |
| CI-1 | Разбить `publish.yml` на ci / pages / release + composite action | M | нет | [08](08-build-ci-release.md) | T7.4 |
| CI-3 | lint, size, attw, publint в CI | S | нет | [08](08-build-ci-release.md) | T1.5, T2.7 |
| CI-4 | Renovate + поэтапное обновление тулчейна (Vite 8, Vitest 5, TS 7, vue-tsc 3) | S/M | нет | [08](08-build-ci-release.md) | T2.7 |
| REL-1 | Генерировать копии CHANGELOG и LICENSE в `prepack`, убрать версии из README | M | нет | [08](08-build-ci-release.md) | T2.5 |
| REL-4 | Путь к 1.0: 0.13 → 0.14 → rc → 1.0 | L | — | [08](08-build-ci-release.md) | T9.8 |
| TEST-1 | Структура тестов по компонентам | M | нет | [09](09-testing.md) | T7.1 |
| TEST-2 | Тесты Playground — в `apps/playground` | S | нет | [09](09-testing.md) | T7.5 |
| TEST-3 | Дописать Tooltip (69% строк), Tabs, Dialog | S–M | нет | [09](09-testing.md) | T7.5 |
| DOC-2 | Разделить пользовательскую и мейнтейнерскую документацию | M | нет | [11](11-markdown-docs.md) | T8.1 |
| DOC-3 | 13 файлов миграций → один `migration.md` | S | нет | [11](11-markdown-docs.md) | T8.2 |
| DOC-4 | Устаревшие сведения и расхождения версий | S | нет | [11](11-markdown-docs.md) | T2.4 |
| DOC-5 | ROADMAP как план (Now/Next/Later/Non-goals) | S | нет | [11](11-markdown-docs.md) | T8.3 |
| DOC-6 | Полноценный CONTRIBUTING | S | нет | [11](11-markdown-docs.md) | T2.3 |
| DOC-7 | Английский во всём публичном | S–M | нет | [11](11-markdown-docs.md) | T8.4 |
| AGENT-3 | Локальное окружение → `AGENTS.local.md`; убрать `store-dir` из `.npmrc` | S | нет | [12](12-agent-rules.md) | T0.1 |
| AGENT-4 | Устаревшие утверждения в `agents.md` | S | нет | [12](12-agent-rules.md) | T2.4, T0.1 |
| AGENT-5 | Рецепты: компонент, prop, токен, баг, эталоны | M | нет | [12](12-agent-rules.md) | T0.1 |
| AGENT-6 | Карта репозитория и Definition of Done | S | нет | [12](12-agent-rules.md) | T0.1 |
| AGENT-8 | `AGENTS.md` на английском | S | нет | [12](12-agent-rules.md) | T0.1 |
| AGENT-9 | Перенести проверяемые правила в линтер | — | нет | [12](12-agent-rules.md) | T0.3 |
| OSS-2 | Единый язык | S–M | нет | [13](13-open-source-and-portfolio.md) | T8.4 |
| OSS-3 | Метки, good first issues, Discussions | S | нет | [13](13-open-source-and-portfolio.md) | T2.2 |
| OSS-4 | `examples/` + StackBlitz | M | нет | [13](13-open-source-and-portfolio.md) | T9.7 |
| OSS-6 | Позиционирование в README | S | нет | [13](13-open-source-and-portfolio.md) | T2.1 |

\* Убрать TTF из npm формально меняет состав пакета. Если кто-то импортирует `gavia-ui/fonts/gavia/*.ttf`, нужна заметка в миграции.

## P2 — после основного

| ID | Что | Трудозатраты | Где | Задача |
|---|---|---|---|---|
| CMP-7 | Остатки PrimeVue: мёртвый `@update:first`, имена pt (`pcCloseButton`, `datatable`…), `dismissable` | S (+алиасы) | [03](03-components.md) | T1.7, T9.3 |
| CMP-9 | Вынести защитную математику (22 вхождения `Number.isFinite`) | S | [03](03-components.md) | T6.5 |
| — | Confirm: Promise API `await confirm()` | S | [03](03-components.md) | T4.7 |
| A11Y-8 | `WlSteps` → `ol/li`, текстовый статус шага | S | [06](06-accessibility.md) | T3.7 |
| A11Y-11 | Полный `FOCUSABLE_SELECTOR` | S | [06](06-accessibility.md) | T3.8 |
| A11Y-12 | Ошибка поля без `role="alert"`, подсказка + ошибка вместе | S | [06](06-accessibility.md) | T3.6 |
| A11Y-P4 | Таблицы клавиш и ARIA в документации | M | [06](06-accessibility.md) | T8.6 |
| NEW-7 | `WlDataTable` (или расширение Table) (после 1.0) | L | [04](04-new-components.md) | Ф10 |
| NEW-8 | `WlVirtualList` (и виртуализация в списках) (после 1.0) | M | [04](04-new-components.md) | Ф10 |
| NEW-9…11 | Tree, Descriptions, List | S–L | [04](04-new-components.md) | Ф10 |
| NEW-12…21, 23, 24 | Kbd, CopyButton, OTP, Stepper, AvatarGroup, Splitter, SkipLink, VisuallyHidden, RelativeTime, Banner, DateTimePicker, ThemeSwitcher | S–M | [04](04-new-components.md) | Ф10 |
| UTIL-4 (initials), 6, 7, 13–16 | Инициалы, числа, mergeAttrs, clipboard, controllable, публичные оверлейные composables, media query | S–M | [05](05-composables-and-utils.md) | T6.5, T6.7 |
| ARCH-5 | Один стек оверлеев | S | [01](01-architecture.md) | T5.6 |
| ARCH-6 | Убрать дублирование библиотека ↔ Playground ↔ скрипты | M | [01](01-architecture.md) | T6.2, T6.4, T6.5 |
| ARCH-7 | Playground импортирует `gavia-ui`, а не `../../../packages/ui-kit/src` | S | [01](01-architecture.md) | T7.3 |
| ARCH-8 | = TEST-2 | S | [01](01-architecture.md) | T7.5 |
| LINT-2 | Stylelint | S | [02](02-code-style-and-lint.md) | Ф10 |
| LINT-3 | Ручная чистка: `as unknown as`, длинные выражения, knip | M | [02](02-code-style-and-lint.md) | T0.4 |
| LINT-4 | Читаемость шаблонов | S | [02](02-code-style-and-lint.md) | T0.3 |
| PERF-3 | Быстрый путь в `useWlPt` | S | [07](07-performance-and-bundle.md) | T5.2 |
| PERF-4 | Locale нормализуется один раз на приложение | S | [07](07-performance-and-bundle.md) | T5.2 |
| PERF-6 | CSS по компонентам | M | [07](07-performance-and-bundle.md) | Ф10 |
| PKG-2 | Типы для `node16`/`nodenext` (расширения в `.d.ts`), attw в CI | S | [07](07-performance-and-bundle.md) | T9.5 |
| PG-PERF-3…5 | Чанки DocsPage и CodePanel, картинки главной, шрифты | S–M | [07](07-performance-and-bundle.md) | T5.3, T5.5 |
| PG-3 | Пути вместо query + пререндер | L | [10](10-playground-docs.md) | T9.7 |
| PG-4 | = ARCH-7 | S | [10](10-playground-docs.md) | T7.3 |
| PG-5 | Раздел Accessibility на сайте | M | [10](10-playground-docs.md) | T8.6 |
| PG-6 | Навигация слева, оглавление справа, «Since», иерархия заголовков | S | [10](10-playground-docs.md) | T8.6 |
| CI-5 | Визуальные эталоны в Docker (Linux) | M | [08](08-build-ci-release.md) | T7.6 |
| CI-6 | SHA-пины для release, кэш браузеров, concurrency | S | [08](08-build-ci-release.md) | T7.4 |
| REL-2 | CHANGELOG без дублей, Keep a Changelog | S | [08](08-build-ci-release.md) | T8.7 |
| REL-3 | `releases.md` → GitHub Releases | S | [08](08-build-ci-release.md) | T8.7 |
| TEST-5 | Быстрее unit: node-окружение где можно, happy-dom | S | [09](09-testing.md) | T7.5 |
| TEST-6 | Vitest Browser Mode для оверлеев | M | [09](09-testing.md) | Ф10 |
| TEST-8 | Убрать условные `expect` | S | [09](09-testing.md) | T0.4 |
| TEST-9 | E2E на production-сборке | S | [09](09-testing.md) | T7.5 |
| DOC-8 | JSDoc у публичных props, событий, слотов | M | [11](11-markdown-docs.md) | T8.5 |
| DOC-9 | `docs/brand`: только финальные WebP и SVG | S | [11](11-markdown-docs.md) | T8.8 |
| AGENT-7 | Конвенции коммитов и стиля | S | [12](12-agent-rules.md) | T0.1 |
| OSS-5 | Видимость: topics, social preview, анонсы | S | [13](13-open-source-and-portfolio.md) | T9.8 |

## P3 — по желанию

| ID | Что | Где | Задача |
|---|---|---|---|
| PERF-5 | Иконки без полной карты во внутренних компонентах | [07](07-performance-and-bundle.md) | Ф10 |
| PKG-3, PKG-4 | `types` верхнего уровня, keywords, локальная чистка старых `.tgz` и `dist` | [07](07-performance-and-bundle.md) | T2.7, вне плана |
| PG-8 | Changelog без i18n-копий | [10](10-playground-docs.md) | T8.7 |
| UTIL-17 | `useWlHotkey` | [05](05-composables-and-utils.md) | T6.7 |
| NEW-22 | Rating | [04](04-new-components.md) | Ф10 |
| TEST-7 | Тесты через роли | [09](09-testing.md) | Ф10 |
| TEST-10 | Мутационное тестирование (Stryker) | [09](09-testing.md) | Ф10 |
| TEST-11 | Комментарии PrimeVue в `setup.ts`, язык строк | [09](09-testing.md) | T1.7 |
| DOC-10 | Короткий README пакета, генерация в `prepack` | [11](11-markdown-docs.md) | T2.5 |
