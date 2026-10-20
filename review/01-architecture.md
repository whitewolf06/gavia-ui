# 01. Архитектура

[← к оглавлению](README.md)

## Оценка: 8/10

### Что сделано хорошо (и стоит показывать в портфолио)

- **Границы пакетов.** `packages/ui-kit` — только библиотека, `apps/playground` — витрина и стенд проверок. Роутер, API, стор и бизнес-логика вынесены за пределы библиотеки, и это зафиксировано в `agents.md`.
- **Ноль runtime-зависимостей**, Vue — единственный peer. Это проверяется скриптом `verify:dependencies` и подтверждается publint.
- **Разделение ответственности:**
  - компонент отвечает за DOM, props и emits;
  - `utils/options`, `anchoredOverlay`, `overlayLifecycle`, `bodyScrollLock` — за поведение;
  - сервисы toast/confirm живут на уровне Vue-приложения, и две app на странице не делят очередь.
- **Токен-пайплайн:** `tokens/source.json` → CSS, JSON-каталог, TS-типы. Слои foundation → semantic → component, проверка циклов и контраста, «замороженные» значения 0.5.
- **CSS-архитектура:** `@layer wl.reset / wl.tokens / wl.components`, один класс на селектор, нет `!important`, всё в `--wl-*`. Пользователю легко переопределять стили.
- **`pt` (pass-through)** с цепочкой defaults → `WlConfig.pt` → локальный `pt`. Строгие типы (`WlPtStrict`) ловят опечатки.
- **Машиночитаемый манифест** (`dist/manifest.json`) и каталог токенов. Редкая и полезная вещь для IDE и AI-агентов.
- **SSR-гигиена:** нет DOM при импорте, `useWlId` совместим с 3.4 и 3.5, SSR-тест FilterBar, гидрация в `verify:package:browser`.

### Слабые места

#### ARCH-1. Дорогое добавление компонента: ~25 файлов · P1 · M

На примере самого нового компонента, `WlTimePicker`, нужно затронуть:
- `src/components/WlTimePicker.vue`, `components/index.ts`, `native-contracts.ts`;
- `pt-types.ts`, `manifest/inputs.ts`, `manifest/types.ts`, `styles/base.css`;
- пример `design-system/examples/WlTimePicker.vue`, страницу `documentation/components/inputs/WlTimePicker.vue`, `inputs.ts`, `pt-sections.ts`;
- i18n: `documentation.en.json`, `documentation.ru.json`, `changelog.*.json`;
- unit- и типовые тесты: 5 файлов; e2e: 4 файла;
- README пакета.

**Последствия:** высокий порог для контрибьютора и высокий риск, что агент «забудет» одно из мест. Отчасти это ловится тестами, но поздно.

**Решение:**
1. Генератор `pnpm new:component <Name> --category <inputs|data|…>` (Node-скрипт без зависимостей, шаблоны в `scripts/templates/`).
2. Чек-лист в `AGENTS.md` со списком файлов (см. [12-agent-rules.md](12-agent-rules.md)).
3. Сократить ручные реестры: `components/index.ts` и часть `pt-sections.ts` можно генерировать из манифеста, как уже генерируются иконки и токены.

#### ARCH-2. Хрупкий слой типовых контрактов · P1 · S (документировать) / M (страховка)

`components/generic-contracts.ts` и `native-contracts.ts` переобъявляют типы SFC через выражения вида `NonNullable<Result["__ctx"]>`, где `__ctx` — **внутреннее** поле, которое генерирует vue-tsc. Это даёт отличный вывод типов (модель Select из `options`/`optionValue`, ключи таблицы), но любой мажор vue-tsc может сломать его без предупреждения. Сейчас 2.x, уже вышел 3.x.

**Что сделать:**
- Описать этот риск и способ проверки в `architecture.md`.
- Зафиксировать vue-tsc точной версией (`2.2.10`, без `^`) и обновлять его отдельным PR с прогоном consumer-фикстур (`verify:package`).
- Следить за `defineComponent` с generic в самом Vue: когда официальный путь позволит отказаться от `__ctx`, перейти на него.

#### ARCH-3. Нереактивный `WlConfig` · P1 · S

`WlConfig.install` делает `app.provide(configKey, options)` с обычным объектом. `useWlLocale()` и `useWlMotion()` — это `computed` поверх нереактивного объекта, поэтому смена языка или motion на лету сработает, только если пользователь сам передал `reactive({...})`.

Playground переключает EN/RU именно так: в `apps/playground/src/bootstrap.ts` конфигурация создаётся через `shallowReactive(...)`, а locale меняется через `watch`. То есть обход существует, но знает о нём только автор. В документации это не описано, и обычный пользователь передаст простой объект.

**Решение:** внутри `install` оборачивать в `shallowReactive`. Экспортировать `useWlConfig()` с методами `setLocale`, `setMotion` (или задокументировать `reactive()`). Добавить тест «смена locale после монтирования меняет тексты».

#### ARCH-4. Локализация: русский fallback и дефолты в props · P1 · M (breaking в 1.0)

Подробно — в [CMP-4](03-components.md). Архитектурное решение: **один источник текста — locale**, props только переопределяют. Fallback библиотеки — английский, а `wlLocaleRu` подключается явно. В связке с [UTIL-8](05-composables-and-utils.md) (генерация из `Intl`) словарь сокращается до ~40 строк.

#### ARCH-5. Два стека оверлеев · P2 · S

- `utils/overlayLifecycle.ts` содержит свой массив `overlayStack: symbol[]` для порядка Escape и Tab.
- `utils/overlayStack.ts` ведёт стек слоёв `addOverlayLayer` / `isTopOverlayLayer` для «кто верхний» и `ownsOverlayTarget`.

Оба используются одновременно (`activate()` кладёт токен в оба). Сейчас это работает, но это два источника правды. При добавлении новых оверлеев (Tooltip-компонент, подменю, ContextMenu) возрастёт риск рассинхронизации. **Решение:** оставить один `overlayStack` с полями `{ token, panel, anchor, modal, trapFocus }`.

#### ARCH-6. Дублирование логики между библиотекой, Playground и скриптами · P2 · M

| Логика | Где сейчас |
|---|---|
| Контраст / нормализация hex | `apps/playground/src/theme-builder/palette.ts`, `packages/ui-kit/scripts/token-tools.mjs`, `WlColorPicker` |
| Тема (system / light / dark, сохранение, без вспышки) | `apps/playground/src/themes.ts`, `preferences.ts`, `theme-transition.ts` |
| ISO-даты | `WlDatePicker`, `WlCalendar` |
| Ограничение и проверка чисел | 7 компонентов |

**Решение:** перенести в `src/utils` и `src/composables` и публиковать как `gavia-ui/utils` / `gavia-ui/composables` — см. [05-composables-and-utils.md](05-composables-and-utils.md).

#### ARCH-7. Playground не использует пакет как пользователь · P2 · S

209 импортов вида `../../../packages/ui-kit/src/...` в `apps/playground/src`. Витрина импортирует внутренние модули, а не публичный entry `gavia-ui`. Поэтому она не ловит проблемы публичного API: забытый экспорт, неверный тип в `.d.ts`.

**Решение:** в `apps/playground/vite.config.ts` и `tsconfig` сделать alias `gavia-ui` → `packages/ui-kit/src/index.ts`. Это сохраняет быстрый HMR без сборки. Все импорты перевести на `from "gavia-ui"`. Внутренности (например, `WlCommandPalette.vue` для `defineAsyncComponent`) брать через публичный экспорт. Правило линтера — в [LINT-1](02-code-style-and-lint.md).

#### ARCH-8. Тесты Playground живут в пакете библиотеки · P2 · S

12 файлов в `packages/ui-kit/tests` импортируют код из `apps/playground`: `playground-examples`, `playground-navigation`, `playground-preferences`, `playground-theme`, `theme-builder`, `documentation-*`, `code-highlighting`, `responsive-documentation`, `example-source` и другие. Это нарушает границу, заявленную в самом `architecture.md`. **Решение:** `apps/playground/vitest.config.ts` + перенос. Подробнее — [TEST-2](09-testing.md).

#### ARCH-9. Решения, которые нужно принять до 1.0 · P1 · S (решить) / M–L (сделать)

Это не дефекты, но после 1.0 менять их будет дорого:

| Вопрос | Варианты | Рекомендация |
|---|---|---|
| Префикс `Wl` / `wl-` / `--wl-` при бренде Gavia | а) оставить; б) `Gv*` + алиасы на переходный период | Оставить и объяснить в README («стабильный namespace исторически от WhiteLife»). Переименование 53 компонентов, 447 токенов и всех классов ради бренда не окупится |
| Fallback-язык | ru / en | **en** (ARCH-4) |
| Имена pt-секций (`pcCloseButton`, `datatable`, `selectbutton`…) | оставить / нормализовать | Нормализовать к именам компонентов Gavia, старые — алиасы на 1 минорный цикл (CMP-7) |
| `dismissable` | оставить / `dismissible` | `dismissible` + алиас |
| Словарь статусов | как есть / `tone` | `tone` (CMP-1) |
| Минимальный Vue | 3.4 / 3.5 | **3.5** (PERF-1): убирает обход `useId` и +14.7 КБ у пользователей |
| Минимальный Node для разработки | 18 / 20.19+ | **20.19+** (CI-2) |

Предлагаю завести `docs/rfc/0001-v1-decisions.md` (или GitHub Discussion), зафиксировать решения и выпустить 0.13–0.14 с dev-предупреждениями о будущих изменениях, а затем 1.0.
