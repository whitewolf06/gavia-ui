# Итоговый план работ Gavia UI

> Execution authority: [approved decisions and live task ledger](IMPLEMENTATION.md) override the original recommendations and template permissions below. Vue 3.4 support and Windows primary baselines are retained. No commits or heavy checks are authorised implicitly.


Этот документ — **исполняемый план** по итогам ревью (октябрь 2026, версия 0.12.1). Он написан так, чтобы его можно было отдать агенту-исполнителю (Codex, Claude Code) или выполнять самому задача за задачей.

- Подробное обоснование каждой находки — в тематических файлах `01…13`.
- Сжатый список всех слабых мест — в [WEAK-POINTS.md](WEAK-POINTS.md).
- Готовый текст задачи для агента — в [CODEX-TASK.md](CODEX-TASK.md).
- Все находки одной таблицей — в [00-backlog.md](00-backlog.md).

---

## 0. Правила выполнения

1. **`agents.md` остаётся в силе**, пока его не заменит задача T0.1:
   - не публиковать пакет;
   - не коммитить без одобрения пользователя;
   - не обновлять визуальные эталоны автоматически;
   - не трогать `*.generated.*` руками (только `tokens:sync` / `icons:sync`);
   - не менять исторические фикстуры совместимости.
2. **Одна задача — одна ветка — один PR (или один коммит).** Имя ветки: `review/<task-id>-<slug>`, например `review/T1.1-listbox-a11y`. Сообщение — Conventional Commits.
3. **Быстрые проверки после каждой задачи** — по разрешению пользователя (см. [CODEX-TASK.md](CODEX-TASK.md)):

   ```bash
   pnpm exec vitest run <затронутые тесты>    # из packages/ui-kit
   pnpm --filter gavia-ui typecheck
   pnpm lint                                  # после T0.3
   ```

   Тяжёлые проверки — только по команде пользователя: `build:playground`, `build:pages`, `run pack`, `verify:*`, `test:e2e`, `test:visual`, `test:pages`, `test:coverage`. В отчёте по задаче явно перечислять, какие тяжёлые проверки отложены.
4. **Каждое видимое пользователю изменение** — запись в `## Unreleased` в **обоих** CHANGELOG (до T2.5) и `pnpm changeset`.
5. **Каждое изменение публичного контракта** (props, events, slots, классы, `data-wl*`, токены, pt-секции, exports, peer) — заметка в миграции. До T8.2 это `docs/migration-<версия>.md`, после — раздел в `docs/migration.md`. В 0.x ломать можно только в minor.
6. **Тест до исправления**: для дефектов сначала пишется падающий тест, затем исправление.
7. **Если задача противоречит коду** (код уже изменился, файл переехал), исполнитель не угадывает, а останавливается и описывает расхождение в отчёте.

### Формат задачи

```
### T<фаза>.<номер> — Название   [ID находок] · Приоритет · Трудозатраты · Breaking
Цель / Почему · Файлы · Шаги · Критерии приёмки · Проверки · Миграция · Зависит от
```

Трудозатраты: S — до 2 ч; M — от полудня до 2 дней; L — 3+ дня.

### Фазы и релизы

| Фаза | Содержание | Релиз после фазы |
|---|---|---|
| 0 | Инфраструктура: правила агента, Node, линтер | — |
| 1 | Дефекты P0 (a11y списков и вкладок, бандл, логотип) | **0.13.0** (minor: peer Vue ^3.5) |
| 2 | Витрина и гигиена репозитория | 0.13.x |
| 3 | Доступность и сервисы (Alert, Field, Toast, Menu, модальные окна) | — |
| 4 | Глубина компонентов (Select, Table, ссылки, `tone`, единые API) | **0.14.0** |
| 5 | Производительность (оверлеи, pt, locale, шрифт, Playground) | 0.14.x |
| 6 | Утилиты и composables (`gavia-ui/utils`, `gavia-ui/composables`) | 0.15.0 |
| 7 | Структура: тесты, генератор компонента, CI, Playground через `gavia-ui` | — |
| 8 | Документация | — |
| 9 | Подготовка к 1.0 (решения, локаль, новые компоненты, сайт) | **1.0.0-rc → 1.0.0** |
| 10 | После 1.0 | 1.x |

Порядок важен в двух местах:
- **T0.3 (форматирующий коммит линтера) — до остальных изменений кода**, иначе каждый следующий дифф утонет в форматировании;
- **T7.1 (перенос тестов по компонентам) — до массового написания новых тестов в фазах 4–6** или сразу после фазы 1. Иначе новые тесты придётся переносить. Если хочется раньше, T7.1 можно поднять в фазу 2.

---

## Фаза 0 — инфраструктура (1–2 дня)

### T0.1 — `AGENTS.md`, `CLAUDE.md`, локальное окружение   [AGENT-1…6, 8] · P0 · S · нет

**Почему:** конвенция имени — `AGENTS.md`. Текущие правила запрещают даже точечные проверки, содержат настройки конкретной машины, частично устарели и не дают рецептов.

**Файлы:**
- `agents.md` → `AGENTS.md`;
- новый `CLAUDE.md`;
- новый `AGENTS.local.md` (в `.gitignore`);
- `.npmrc`, `.gitignore`;
- ссылки в `README.md`, `CONTRIBUTING.md`, `ROADMAP.md`, `docs/*.md`.

**Шаги:**
1. `git mv agents.md AGENTS.md`. Содержимое — на основе [`drafts/AGENTS.md`](drafts/AGENTS.md). Перенести все действующие правила текущего `agents.md`, которых нет в черновике: правила визуальных эталонов, Pages, LICENSE/CHANGELOG. Ничего не потерять — сверить по разделам 1–7.
2. Раздел 8 текущего файла (портативный pnpm в `.tools/`, `.pnpm-store`) перенести в `AGENTS.local.md`. Добавить `AGENTS.local.md` в `.gitignore`.
3. В `.npmrc` убрать `store-dir=.pnpm-store`: это локальная настройка, она должна жить в `AGENTS.local.md` или в пользовательском `~/.npmrc`. Остальные строки оставить.
4. `CLAUDE.md` содержит одну строку `@AGENTS.md`.
5. Обновить ссылки `agents.md` → `AGENTS.md` по всему репозиторию: `git grep -n "agents.md"`.

**Критерии приёмки:**
- `git grep -n "agents\.md"` ничего не находит (кроме CHANGELOG-истории, если там есть упоминания — их не трогать);
- в `AGENTS.md` есть: карта репозитория, разрешённые быстрые проверки, тяжёлые по команде, рецепты (компонент, prop, токен, баг, эталоны), Definition of Done, запреты, релизный чек-лист;
- язык: английский (решение AGENT-8). Если пользователь хочет русский — оставить русский, но структуру сохранить.

**Проверки:** только чтение. Тестов нет.

### T0.2 — Node 20+ в CI и `engines`   [CI-2] · P0 · S · нет (для пользователей)

**Файлы:**
- `.github/workflows/publish.yml` (матрица `node-version: [18, 24]`);
- корневой `package.json` (`engines.node`);
- `README.md` (раздел Development), `CONTRIBUTING.md`;
- `packages/ui-kit/tests/css-contract.test.ts` (комментарий про Node 18 — проверить, нужен ли обход).

**Шаги:**
1. Матрица `[20, 22, 24]` (или `[20, 24]`). Шаги с `if: matrix.node-version == 18` перевести на 20, с `== 24` оставить.
2. `"engines": { "node": ">=20.19" }`.
3. Обновить упоминания «Node.js ≥ 18» в README и CONTRIBUTING.

**Критерии:** `git grep -n "node-version: \[18\|>=18\|Node.js ≥ 18"` пусто. CI зелёный (проверяет пользователь после пуша).

### T0.3 — Собственный ESLint-конфиг, форматирующий коммит, CI   [LINT-1, A11Y-P1, LINT-4] · P0 · M · нет

**Почему:** нет ни линтера, ни форматтера. Черновик конфига проверен на копии репозитория: после `eslint --fix` проходят build, typecheck и все 701 тест.

**Файлы:**
- корень: `eslint.config.mjs` (из [`drafts/eslint.config.mjs`](drafts/eslint.config.mjs)), `.editorconfig` (из [`drafts/.editorconfig`](drafts/.editorconfig)), `package.json`;
- `.vscode/settings.json`, `.vscode/extensions.json`;
- `.git-blame-ignore-revs`;
- workflow.

**Шаги:**
1. Установить dev-зависимости в корень (одной командой из шапки черновика). Зафиксировать **точные версии**. Проверенные на момент ревью: eslint 10.13, typescript-eslint 8.71, eslint-plugin-vue 10.11, @stylistic 5.x, perfectionist 5.12, vuejs-accessibility 2.6. В сообщении коммита — таблица «пакет → зачем» из [02-code-style-and-lint.md](02-code-style-and-lint.md) (требование `agents.md` об обосновании devDependency).
2. Скопировать конфиг и `.editorconfig`. Добавить скрипты: `"lint": "eslint . --cache"`, `"lint:fix": "eslint . --fix --cache"`. Добавить `.eslintcache` в `.gitignore`.
3. **Первый коммит** — только конфиг, зависимости и скрипты (`chore: add eslint flat config`).
4. **Второй коммит** — результат `pnpm lint:fix` и ничего больше (`style: apply eslint stylistic`). Перед коммитом обязательно:
   - `pnpm build`, `pnpm typecheck`, `pnpm test` должны быть зелёными. Это быстрые проверки на этом шаге, они нужны, чтобы убедиться, что автофикс ничего не сломал. Если пользователь не разрешил — попросить разрешения.
   - Известные опасные автофиксы уже отключены в черновике: `unicorn/prefer-string-replace-all`, `unused-imports` для `WlAutocomplete.vue` и `WlDatePicker.vue` (импорты `Teleport`/`Transition`), `playwright/prefer-web-first-assertions`. **Не включать их обратно** до ручного прохода.
5. Хэш второго коммита записать в `.git-blame-ignore-revs` (третий коммит). Указать в CONTRIBUTING: `git config blame.ignoreRevsFile .git-blame-ignore-revs`.
6. `.vscode/settings.json`:

   ```json
   {
     "prettier.enable": false,
     "editor.formatOnSave": false,
     "editor.codeActionsOnSave": { "source.fixAll.eslint": "explicit", "source.organizeImports": "never" },
     "eslint.validate": ["javascript", "typescript", "vue", "json", "jsonc"]
   }
   ```

   `.vscode/extensions.json`: `dbaeumer.vscode-eslint`, `Vue.volar`.
7. В CI-джобе verify первым шагом после install добавить `pnpm lint`. Пока остаются ручные ошибки, временно понизить нестилистические правила до `warn`, чтобы CI был зелёным. В задаче T0.4 вернуть `error`.

**Критерии приёмки:**
- `pnpm lint` выполняется без ошибок (предупреждения допустимы до T0.4);
- build, typecheck и unit-тесты зелёные после форматирующего коммита;
- дифф второго коммита содержит только форматирование и сортировку импортов (проверить выборочно 5–10 файлов);
- в тестах Playwright после автофикса нет изменения смысла (сверить диффы `apps/playground/e2e/*.ts`, особенно места с `getAttribute`).

**Проверки (тяжёлые, по команде пользователя):** `pnpm test:e2e`, потому что форматирование затронуло e2e-файлы.

### T0.4 — Ручная доводка линтера   [LINT-3] · P1 · M · нет

**Зависит от:** T0.3.

После `--fix` остаётся около 527 ошибок и 906 предупреждений. Основное:
- `@stylistic/max-len` (632) + `vue/max-len` (93): разбить длинные строки;
- `@stylistic/max-statements-per-line` (294): разнести операторы;
- `vitest/no-conditional-expect` (44), `playwright/no-conditional-expect` (57), `playwright/no-conditional-in-test` (43): переписать на явные ветки или `test.each` ([TEST-8](09-testing.md));
- `vitest/valid-expect` (36);
- `@typescript-eslint/no-empty-object-type` (26): `defineSlots<{}>()` → `defineSlots<Record<string, never>>()`, если typecheck это допускает; иначе точечный disable с комментарием;
- `no-restricted-imports` (44): импорты Playground из `packages/ui-kit/src` — решаются в T7.3, до тех пор `warn`;
- `regexp/no-super-linear-backtracking` (8): `apps/playground/src/project/changelog.ts`, `changelog-localization.ts`, `scripts/release-notes.mjs` — переписать регулярки без экспоненциального перебора;
- `unused-imports/no-unused-vars` (8): удалить неиспользуемые типы `CallbackInference` в `components/generic-contracts.ts` (проверить typecheck), `props` в `DocumentationTabs.vue` и `GaviaTypeStudy.vue`;
- статические a11y-замечания в примерах Playground (`vuejs-accessibility/*`).

Делать пакетами по зонам: `packages/ui-kit/src` → `packages/ui-kit/tests` → `apps/playground/src` → `apps/playground/e2e` → `scripts`. Один коммит на зону.

**Критерии:**
- все правила кроме `max-len` переведены в `error`, `pnpm lint` проходит без ошибок;
- `max-len` — `warn` с порогом 140, оставшиеся предупреждения ≤ 50;
- новый `knip`-прогон (`pnpm dlx knip`, без установки) выполнен, мёртвый код удалён или отмечен в отчёте.

---

## Фаза 1 — дефекты P0 (2–4 дня) → релиз 0.13.0

### T1.1 — `useWlListbox`: доступная навигация в списках   [A11Y-1, A11Y-2, UTIL-12, Select double choose] · P0 · S–M · нет

**Почему:**
- в `WlSelect`, `WlMultiSelect`, `WlAutocomplete` активная опция видна только визуально: у опций нет `id`, у combobox нет `aria-activedescendant`, скринридер молчит (проверено по AX-tree Chromium);
- список с `max-height: 240px` (`styles/base.css:849`) не прокручивается за активной опцией;
- в `WlSelect.vue:98` `choose()` вызывается дважды: `@mousedown.prevent="choose(index)" @click="choose(index)"`.

**Файлы:**
- `packages/ui-kit/src/utils/options.ts` (`useListNavigation`);
- `src/components/WlSelect.vue`, `WlMultiSelect.vue`, `WlAutocomplete.vue`;
- тесты: `tests/listbox-accessibility.test.ts` (расширить) или новый `tests/utils/listbox.test.ts`.

**Шаги:**
1. Заменить `useListNavigation` на `useWlListbox` (внутренний, пока не экспортировать):

   ```ts
   export function useWlListbox(options: {
     listId: () => string;              // id элемента role=listbox (сейчас listAttrs.id)
     count: () => number;
     isDisabled?: (index: number) => boolean;   // задел под T4.1
     onSelect: (index: number) => void;
     onClose: (event?: KeyboardEvent) => void;
     list: Ref<HTMLElement | null>;     // контейнер для scrollIntoView
   }): {
     active: Ref<number>;
     optionId: (index: number) => string;          // `${listId()}-option-${index}`
     activeDescendant: ComputedRef<string | undefined>;
     onKeydown: (event: KeyboardEvent) => void;    // ArrowUp/Down, Home/End, Enter, Escape (как сейчас)
   }
   ```

2. `watch(active)` → `nextTick` → найти `#optionId(active)` в `list` и вызвать `scrollIntoView({ block: "nearest" })`, если метод существует (в jsdom его нет — проверить `typeof element.scrollIntoView === "function"`).
3. В шаблонах:
   - опции получают `:id="optionId(index)"`;
   - элемент с `role="combobox"` получает `:aria-activedescendant="visible ? activeDescendant : undefined"`. В Select это корневой `div`, в MultiSelect — `input.wl-multiselect__focus`, в Autocomplete — `input`.
4. Select: оставить на опции `@mousedown.prevent` (без вызова) и `@click="choose(index)"`, как в MultiSelect и Autocomplete (у них `@pointerdown.prevent @click="choose(index)"`).
5. `:key="index"` у опций не трогать в этой задаче (это T4.2).

**Критерии приёмки:**
- unit: после открытия и ArrowDown значение `aria-activedescendant` на combobox совпадает с `id` существующего `[role=option]`, у которого `data-active="true"`;
- unit: при закрытом списке `aria-activedescendant` отсутствует;
- unit: клик по опции Select → ровно одно событие `update:modelValue`;
- unit: шпион на `Element.prototype.scrollIntoView` (заглушка в тесте) вызывается при смене активной опции;
- e2e (новый сценарий в `apps/playground/e2e/components.spec.ts` или отдельный файл): Select с 30 опциями на фикстурной странице `e2e.html` → `End` → последняя опция `toBeInViewport()`;
- поведение мыши и клавиатуры не изменилось: существующие e2e зелёные.

**Проверки:** unit — быстрые; e2e — по команде.

### T1.2 — Уникальные ID и связи в `WlTabs`   [A11Y-3] · P0 · S · нет (ID не являются публичным контрактом)

**Почему:** `WlTabs.vue:63` — `:id="`wl-tab-${item.key}`"`. Две группы вкладок с одинаковыми ключами на странице дают дубли `id`, и `aria-labelledby` панели указывает не туда. У таба нет `aria-controls`, у панели нет `id`.

**Шаги:**
1. `const uid = useWlId();`, затем `tabId(key) = `${uid}-tab-${sanitize(key)}``, `panelId(key) = `${uid}-panel-${sanitize(key)}``. `sanitize` заменяет пробельные символы на `-`.
2. На табе: `:id="tabId(item.key)"`, `:aria-controls="panelId(item.key)"`.
3. На панели: `:id="panelId(item.key)"`, `:aria-labelledby="tabId(item.key)"`, `tabindex="0"` (APG: панель фокусируема, если внутри нет фокусируемых элементов; безопасно ставить всегда).
4. Поиск по репозиторию `wl-tab-`: в тестах и Playground совпадений нет (проверено при ревью), но перепроверить.

**Критерии:**
- unit: два экземпляра `WlTabs` с одинаковыми `items` → все `id` в `document` уникальны, `aria-controls` и `aria-labelledby` указывают на существующие элементы;
- клавиатура (стрелки, Home/End) работает как раньше.

### T1.3 — Контракт уникальности ID для всех компонентов   [TEST-4] · P0 · S · нет

**Зависит от:** T1.2.

**Шаги:** новый тест `tests/contracts/unique-ids.test.ts` (или `tests/unique-ids-contract.test.ts`, если T7.1 ещё не сделан):
1. Для каждого компонента из манифеста (`wlManifest`) смонтировать **два** экземпляра в один `document.body` с минимальными props из манифеста или фикстур. Оверлеи открыть (`visible: true` / expose `show`).
2. Собрать `document.querySelectorAll("[id]")` и проверить уникальность.
3. Собрать все `aria-labelledby`, `aria-describedby`, `aria-controls`, `aria-activedescendant`, `for` и проверить, что каждый ID существует.

**Критерии:** тест проходит для всех 53 компонентов. Компоненты, которые нельзя смонтировать без сложных props, перечислены явно с причиной, а не пропущены молча.

### T1.4 — Peer `vue ^3.5`, `useId` без namespace-импорта   [PERF-1] · P0 · M · **да** (minor 0.13.0)

**Почему:** `utils/useWlId.ts:1,9` — `import * as Vue from "vue"` + `Reflect.get(Vue, "useId")` делает весь Vue неудаляемым при tree-shaking. Замер: Vue + `WlSelect` = **53.8 КБ gzip**, после замены на прямой импорт `useId` — **39.1 КБ**.

**Файлы (по `git grep` на момент ревью):**
- `packages/ui-kit/src/utils/useWlId.ts` — `import { useId } from "vue"; export function useWlId(): string { return useId(); }` (или убрать обёртку и импортировать `useId` напрямую в компонентах);
- `packages/ui-kit/package.json` — `peerDependencies.vue: "^3.5.0"`, `devDependencies.vue` → минимальный 3.5.x (например, `3.5.0`) для проверки нижней границы;
- `packages/ui-kit/tsconfig.json` — `vueCompilerOptions.target: 3.5`;
- `scripts/verify-package.mjs:130` — `target: 3.4` → `3.5`;
- `.github/workflows/publish.yml` — consumer npm `vue: "3.4.0"` → `"3.5.0"`; строка `--vue 3.4.0` → `--vue 3.5.0`; пути артефактов `pnpm-vue-3.4.38-browser.json` → по новой версии;
- `.changeset/README.md` (строки 13–16, на русском — заодно перевести);
- `packages/ui-kit/README.md:158` (таблица peer);
- `docs/quality.md:44`, `docs/architecture.md:47` (текущие утверждения; исторические упоминания в releases и migration не трогать);
- тесты: удалить `tests/vue34-id.test.ts`, обновить комментарии в `code-highlighting.test.ts`, `responsive-*.test.ts`, `filter-bar-ssr-contract.test.ts`, `mounting-types.ts` («kit tests Vue 3.4»);
- `pnpm.packageExtensions` для `@vue/test-utils@2.4.6` в корневом `package.json` — проверить, нужен ли ещё; при необходимости обновить VTU до 2.5.x.

**Шаги:**
1. Обновить версии, `pnpm install`.
2. Переписать `useWlId`.
3. Обновить CI, скрипты и документацию по списку.
4. Миграция `docs/migration-0.13.0.md`: «Минимальная версия Vue — 3.5.0. Причина: нативный `useId` (SSR-стабильные ID) и меньший бандл. Действие: обновить `vue` до ^3.5».
5. Changeset `minor`.

**Критерии:**
- `git grep -n "import \* as Vue"` в `packages/ui-kit/src` пусто;
- typecheck, unit, `verify:compatibility` зелёные. Гейт совместимости может отреагировать на смену peer: если так, оформить ограниченный миграционный контракт по образцу 0.11 и **не** переписывать базовые снапшоты;
- `verify:package` с Vue 3.5.0 проходит (тяжёлая проверка, по команде);
- размер подтверждён в T1.5.

### T1.5 — Бюджет размера бандла в CI   [PERF-8, CI-3 (часть)] · P1 · S · нет

**Зависит от:** T1.4 (лимиты считать после исправления).

**Шаги:**
1. Скрипт `scripts/check-size.mjs` без новых зависимостей. Vite уже есть: собрать 4 фикстуры потребителя с `vue` в бандле, prod-флаги Vue, esbuild-минификация (как в ревью, см. [07](07-performance-and-bundle.md#как-измерялось)):
   - `WlButton`;
   - `WlSelect`;
   - форма: `WlInput`, `WlSelect`, `WlDatePicker`, `WlField`, `WlButton`;
   - `import * as all from "gavia-ui"`.
2. Сравнить gzip с лимитами в `scripts/size-limits.json`: первичные значения = замер + ~5% запаса.
3. Скрипт `"size": "node scripts/check-size.mjs"`, шаг в CI после `pnpm build`.
4. Вывод в виде таблицы: фикстура, размер, лимит, разница.

**Критерии:**
- `pnpm size` падает, если вернуть `import * as Vue` (проверить локально и откатить);
- в README можно показать размер `WlButton` / `WlSelect` (T2.1).

### T1.6 — Логотип Playground: PNG 410 КБ → SVG   [PG-PERF-1] · P0 · S · нет

**Почему:** `apps/playground/src/App.vue:15` и `HomePage.vue:12` импортируют `docs/brand/gavia-ui-mark-v2.png` (410 КБ) и используют его как `mask-image` (`PlaygroundHeader.vue:202`, `HomePage.vue:134`). По `docs/brand/README.md`, силуэт `gavia-ui-mark-lake.svg` совпадает с v2, а глаз прозрачный, значит, SVG подходит как маска.

**Шаги:**
1. Заменить импорт на `../../../docs/brand/gavia-ui-mark-lake.svg` в обоих файлах.
2. Визуально сравнить шапку и главную в пяти темах (скриншоты до и после).
3. Если силуэт заметно отличается — экспортировать v2 в WebP 128×128 (~3–5 КБ) и использовать его.

**Критерии:**
- в `apps/playground/dist/assets` после сборки нет `gavia-ui-mark-v2-*.png`;
- визуальные эталоны с шапкой изменились **только** в области логотипа. Обновлять эталоны по правилам `AGENTS.md`: сначала просмотреть diff, затем, с одобрения пользователя, `--update-snapshots`.

### T1.7 — Мелкие остатки PrimeVue   [CMP-7 (часть), TEST-11] · P2 · S · нет

**Шаги:**
1. `WlPagination.vue`:
   - удалить `@update:first="onFirst"` на `<nav>` (строка 99) — это обработчик события PrimeVue на нативном элементе;
   - переименовать `changePageCallback` в понятное имя (`goToPage`) или убрать алиас (строка 72).
2. `tests/setup.ts`: комментарии «PrimeVue TabList needs it», «PrimeVue DatePicker overlay needs it». Выяснить, нужны ли моки `ResizeObserver` и `matchMedia`: временно убрать и прогнать unit. Если нужны — переписать комментарий с актуальной причиной (какой компонент или тест).

**Критерии:** `git grep -ni "primevue" packages/ui-kit/src packages/ui-kit/tests/setup.ts` пусто (не считая `prime-removal-regression.test.ts`, который проверяет отсутствие PrimeVue).

### Релиз 0.13.0 (по команде пользователя)

Полный чек-лист из `AGENTS.md`. Заметки:
- breaking — только peer Vue ^3.5;
- исправления — a11y списков и вкладок;
- уменьшение бандла с цифрами.

---

## Фаза 2 — витрина и гигиена (1 неделя)

### T2.1 — Первый экран README   [DOC-1, OSS-6] · P0 · S · нет

**Файлы:** `README.md`; при необходимости `docs/brand/` (скриншот).

**Шаги:**
1. Новый порядок:
   1. логотип и заголовок;
   2. однострочник;
   3. бейджи: npm version, CI (после T7.4 — workflow `CI`), coverage, bundle size (из T1.5), license;
   4. скриншот или GIF 4–6 компонентов в Gavia и Gavia Dark со ссылкой на сайт;
   5. ссылки Docs / Playground / Theme builder / Русский;
   6. **Why Gavia UI** — 5–6 пунктов, только реальные свойства (текст-основа в [11-markdown-docs.md → DOC-1](11-markdown-docs.md));
   7. Quick start **без версии** (`pnpm add gavia-ui vue`);
   8. Темы;
   9. Документация;
   10. Contributing;
   11. Автор;
   12. Лицензии.
2. Абзац о том, как устроен бейдж покрытия и чем снимок отличается от CI, перенести в `docs/quality.md`.
3. Раздел «Public TypeScript contracts» (про 0.11) сократить до одной строки со ссылкой на миграцию или перенести в «Upgrading».
4. Скриншот: Playwright-скрипт снимает витрину компонентов в двух темах и сохраняет `docs/brand/readme-preview.webp` (≤ 200 КБ).

**Критерии:**
- первый экран GitHub (≈ 900 px) показывает: что это, как выглядит, почему, как установить;
- в README нет захардкоженных версий пакета.

### T2.2 — Файлы сообщества   [OSS-1, OSS-3] · P0 · S · нет

**Файлы (новые или изменённые):**
- `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1, контакт — e-mail автора или ссылка на сайт);
- `SECURITY.md`: поддерживаемые версии (последний minor 0.x), канал — GitHub Private vulnerability reporting;
- `.github/PULL_REQUEST_TEMPLATE.md`: что изменено, как проверено, скриншоты для визуальных изменений, breaking и миграция, changeset, docs en/ru;
- `.github/ISSUE_TEMPLATE/bug_report.yml`, `feature_request.yml` → **на английском** (сейчас «Ошибка», «Предложение»); плюс `config.yml` со ссылкой на Discussions;
- `.mailmap`: свести `WhiteWolf` и `Gorbach Dmitry` к одному имени и e-mail (уточнить у пользователя предпочтительное).

**Критерии:**
- GitHub → Insights → Community Standards — все пункты зелёные (проверяет пользователь);
- `git shortlog -sne` показывает одного автора.

### T2.3 — CONTRIBUTING для внешнего участника   [DOC-6] · P1 · S · нет

**Зависит от:** T0.1, T0.3.

Содержимое (подробно — [11-markdown-docs.md → DOC-6](11-markdown-docs.md)):
- окружение (Node 20+, `corepack enable`, `pnpm install`, `pnpm build`);
- карта репозитория (ссылка на `AGENTS.md`);
- быстрые и тяжёлые проверки;
- как добавить компонент (рецепт, позже генератор T7.2);
- Conventional Commits и changesets;
- визуальные эталоны (позже Docker, T7.6);
- `.git-blame-ignore-revs`;
- Code of Conduct, Security.

### T2.4 — Расхождения версий и устаревшие утверждения   [DOC-4, AGENT-4, CMP-3 (документация)] · P1 · S · нет

**Шаги:**
1. Убрать версии из команд установки (README корня — Quick start; README пакета — «Source and package archive version: **0.12.0**»). Версию показывает бейдж npm.
2. Утверждение «все компоненты разделяют `variant`, `size`, `density`, `pt`» (README корня → «Contracts and theming», `AGENTS.md`) заменить точным: какие оси есть у какой категории. Список компонентов без `pt` и `size` — в [03-components.md → CMP-3](03-components.md).
3. `AGENTS.md`: актуальный список `exports` (сверить с `packages/ui-kit/package.json`).
4. Удалить русские HTML-якоря `<a id="...">` в английских документах. Сначала `git grep -n '<a id="'`, и заменить ссылки на них на якоря заголовков.
5. Playground: в шапке показывать опубликованную версию или подписывать «source»; в Installation документации использовать тему `gavia` (сейчас `white`).
6. Тест или скрипт: версия в README и на сайте совпадает с опубликованной или с `package.json` по понятному правилу.

**Критерии:** `git grep -nE "gavia-ui@0\.[0-9]+\.[0-9]+" README.md packages/ui-kit/README.md` пусто.

### T2.5 — Генерировать копии CHANGELOG, LICENSE и README пакета   [REL-1, DOC-10] · P1 · M · нет

**Шаги:**
1. `packages/ui-kit/scripts/prepack.mjs`:
   - копирует `../../LICENSE`;
   - генерирует `CHANGELOG.md` пакета из корневого (относительные ссылки `docs/...` → `https://github.com/whitewolf06/gavia-ui/blob/main/docs/...`);
   - опционально собирает короткий README пакета из шаблона.
2. `"prepack": "node scripts/prepack.mjs"` в `packages/ui-kit/package.json`. Проверить, что `pnpm run pack` и `npm publish <tgz>` в CI используют уже собранный архив: генерация должна происходить на шаге `pnpm run pack`.
3. Удалить копии из git, добавить в `.gitignore` (`packages/ui-kit/LICENSE`, `packages/ui-kit/CHANGELOG.md`).
4. Удалить или упростить тест синхронизации копий.
5. Обновить `AGENTS.md` / CONTRIBUTING: «Changelog — только в корне».

**Критерии:**
- `tar -tzf gavia-ui-*.tgz` содержит `LICENSE`, `CHANGELOG.md`, `README.md`;
- ссылки в CHANGELOG пакета абсолютные;
- `verify:package` проходит (по команде).

### T2.6 — Облегчить npm-пакет   [PKG-1] · P1 · S · условно (состав пакета)

**Шаги:**
1. Из `files` исключить `fonts/gavia/*.ttf` и `fonts/gavia/qa-report.json`: `"!fonts/gavia/*.ttf"`, `"!fonts/gavia/qa-report.json"` или явный список.
2. TTF прикладывать к GitHub Release (шаг в release-workflow: zip `fonts/gavia/*.ttf` + OFL).
3. Заметка в миграции: «TTF-файлы шрифта больше не входят в npm-пакет, они доступны в GitHub Releases и на странице шрифта».
4. Проверить страницу шрифта Playground: `gaviaFontDownload` (`apps/playground/build/font-download.ts`) берёт файлы из репозитория, не из пакета. Не сломать скачивание.

**Критерии:** архив ≤ ~400 КБ (сейчас 1.35 МБ); `font-assets.test.ts` и e2e страницы шрифта зелёные.

### T2.7 — Проверки пакета в CI и Renovate   [CI-3, CI-4 (настройка), PKG-3] · P1 · S · нет

**Шаги:**
1. В CI после `pnpm run pack`:
   - `pnpm dlx publint packages/ui-kit/<tgz>`;
   - `pnpm dlx @arethetypeswrong/cli <tgz> --profile esm-only`. Сейчас `node16 (from ESM)` даёт Internal resolution error. До T9.5 запускать с `--ignore-rules internal-resolution-error` и комментарием.
2. В `packages/ui-kit/package.json` верхнеуровневые `"types": "./dist/index.d.ts"`, `"module": "./dist/index.js"` (PKG-3).
3. `renovate.json`:
   - расписание раз в неделю;
   - группы: (vite, @vitejs/plugin-vue, vitest, @vitest/*, vite-plugin-dts), (typescript, vue-tsc), (@playwright/test, @axe-core/playwright), (eslint и плагины);
   - automerge только для patch dev-зависимостей;
   - `vue` в `packages/ui-kit` devDependencies **игнорировать** (это нижняя граница peer);
   - для `.github/workflows` — пин по SHA.

**Критерии:** CI зелёный; Renovate открыл Dependency Dashboard (проверяет пользователь).

---

## Фаза 3 — доступность и сервисы (1–2 недели)

### T3.1 — `WlAlert`: правильная live-семантика   [A11Y-4] · P1 · S · нет (поведение скринридера меняется — отметить в CHANGELOG)

`WlAlert.vue:37` — всегда `role="alert"`.

**Шаги:**
- prop `live?: "assertive" | "polite" | "off"`;
- по умолчанию `info`/`ok` → `role="status"`, `warn`/`err` → `role="alert"`;
- `live="off"` → без роли.

**Тест:** роль для каждого варианта и для явного `live`.

### T3.2 — Гарантированные доступные имена   [A11Y-5] · P1 · M · нет

**Шаги:**
1. `WlIconButton`: dev-предупреждение (`if (import.meta.env?.DEV)` — проверить, что Vite library mode корректно оставляет ветку для потребителя; альтернатива — `process.env.NODE_ENV !== "production"`), если после монтирования у кнопки нет `aria-label`, `aria-labelledby` и текстового содержимого. В типах: JSDoc «required when no default slot».
2. `WlField`: в слот передавать `labelId` (id элемента `<label>`; у `label` появляется `:id`). `WlSelect`, `WlMultiSelect`, `WlAutocomplete`, `WlDatePicker`, `WlTimePicker` принимают `aria-labelledby` (уже через attrs) — проверить и задокументировать пример `<WlField v-slot="f"><WlSelect :aria-labelledby="f.labelId" .../></WlField>`. Опционально: Field через `provide` сообщает `labelId`, и списочные компоненты используют его автоматически, если `aria-label`/`aria-labelledby` не заданы явно.
3. `WlBadge dot`, `WlIconButton dot/count`: prop `label` / `countLabel` или locale-строка, визуально скрытый текст (`.wl-visually-hidden`).
4. `WlAvatar presence`: визуально скрытый текст статуса из locale (`WlAvatarPresence` = `online` | `busy` | `offline`).
5. `WlProgress`: props `ariaLabel` / `ariaLabelledby` в типах и документации, `aria-valuetext` при `showValue`.

**Тесты:** у каждого компонента из списка есть доступное имя в типовом использовании; пример Field + Select даёт combobox с именем метки.

### T3.3 — `inert` для фона модальных окон   [A11Y-6] · P1 · S · нет

**Шаги:** в `useOverlayLifecycle` при `trapFocus && modal`:
- ставить `inert` на прямых детей `document.body`, кроме контейнера текущего оверлея и уже открытых оверлеев выше по стеку;
- счётчик ссылок, как в `bodyScrollLock`;
- снимать при закрытии;
- не трогать элементы, у которых `inert` был до нас.

**Тесты:** unit — после открытия модального Dialog соседний элемент `inert`, после закрытия нет; вложенные модалки не снимают `inert` друг у друга. E2E — Tab не уходит из диалога (уже есть) и фон недоступен.

### T3.4 — Toast: настраиваемое API и доступность   [A11Y-9, Toast из 03] · P1 · M · нет (новые методы; старые — алиасы)

**Файлы:** `services/toast.ts`, `composables/useWlToast.ts`, `components/WlToast.vue`, типы, документация.

**Шаги:**
1. `useWlToast()` получает методы `success`/`info`/`warning`/`error` (старые `ok`/`warn`/`err` — алиасы). Каждый метод принимает `(summary, options?: { detail?, life?, action?: { label, onClick } })` и **возвращает `id`**.
2. Методы `update(id, patch)`, `dismiss(id)`, `promise(promise, { loading, success, error })`.
3. Время жизни по умолчанию: 5000 мс, ошибки — 8000 мс (или sticky при `life: 0`); `WlToastService.install(app, { life })` для глобального значения.
4. Пауза таймера при `mouseenter`/`focusin` на сообщении, продолжение при уходе.
5. `WlToast`: props `position` (`top-right` | `top-center` | `bottom-right` | `bottom-center` | …), `max`. Для `error` контейнер сообщения получает `role="alert"`, для остальных — `role="status"`. Общий `aria-live` с контейнера убрать (иначе дублирование).
6. Кнопка действия — `WlButton size="sm" variant="ghost"`.

**Критерии:** unit на каждый пункт (fake timers), старое API работает, документация и пример обновлены.

### T3.5 — `WlMenu`: roving tabindex   [A11Y-13] · P1 · S · нет

**Почему:** все пункты меню с `tabindex="0"` (`WlMenu.vue:66`), Tab проходит по каждому.

**Шаги:**
- активный пункт `tabindex="0"`, остальные `-1`; стрелки и Home/End двигают фокус;
- Tab в popup-меню закрывает его и пропускает фокус дальше;
- использовать `useWlRovingFocus` (если T6.6 ещё не сделан — внутренний минимальный, затем заменить).

**Тест:** Tab из меню — одна остановка; стрелки работают; disabled пропускаются.

### T3.6 — `WlField`: ошибка и подсказка   [A11Y-12] · P2 · S · нет

**Шаги:**
- показывать hint и error одновременно, `aria-describedby="<hintId> <errorId>"`;
- убрать `role="alert"` с ошибки по умолчанию; prop `announceError` (по умолчанию `false`) для живой валидации;
- в документации — паттерн «сводка ошибок при отправке».

### T3.7 — `WlSteps` как список   [A11Y-8] · P2 · S · нет (классы сохраняются)

`ol` / `li` вместо `div` / `span`. Те же классы `wl-steps__*`, CSS не меняется (проверить сбросы списка в `reset.css` и `base.css`). Скрытый текст состояния («completed», «current») из locale.

### T3.8 — Полный `FOCUSABLE_SELECTOR`   [A11Y-11] · P2 · S · нет

Добавить:
- `[contenteditable]:not([contenteditable="false"])`;
- `summary`;
- `audio[controls]`, `video[controls]`;
- `iframe`, `object`, `embed`;
- `area[href]`.

Тест: Tab-цикл в диалоге с `<details>` и `contenteditable`.

### T3.9 — Реактивный `WlConfig`   [ARCH-3] · P1 · S · нет

**Шаги:**
- в `WlConfig.install` оборачивать опции в `shallowReactive` (если пользователь уже передал reactive — не оборачивать повторно);
- экспортировать `useWlConfig()` → `{ setLocale, setMotion, setPt }`;
- Playground перевести на `useWlConfig().setLocale` (сейчас `bootstrap.ts` делает `shallowReactive` и `watch` сам).

**Тест:** смена locale после монтирования меняет тексты в Select/Dialog.

---

## Фаза 4 — глубина компонентов (3–4 недели) → релиз 0.14.0

### T4.1 — Select / MultiSelect / Autocomplete: слоты, `clearable`, disabled-опции, typeahead, объявления   [CMP-6, A11Y-10, A11Y-7] · P1 · M–L · нет

**Зависит от:** T1.1. Желательно T6.3 (`useWlAnnouncer`) — можно сделать внутренний минимальный.

**Шаги:**
1. Слоты (`defineSlots` с типами по `TOption`):
   - Select: `option({ option, index, selected, active })`, `value({ option, placeholder })`, `empty()`, `header()`, `footer()`;
   - MultiSelect: + `chip({ option, remove })`;
   - Autocomplete: `option`, `empty`, `chip`.
2. `clearable` у Select и Autocomplete (single): кнопка очистки с `aria-label` из locale, ставит `null`, возвращает фокус.
3. `optionDisabled?: keyof TOption | ((option) => boolean)`. Опция получает `aria-disabled="true"`, пропускается навигацией, не выбирается.
4. Typeahead в `useWlListbox`: буфер символов на 500 мс, поиск по `optionLabel` с начала (`startsWith`, `toLocaleLowerCase`), циклически от текущей опции. PageUp / PageDown: ±10.
5. Объявления: после изменения запроса (Autocomplete, фильтр MultiSelect, CommandPalette) с задержкой 500 мс — «N results» / «No results» (locale + плюрализация из T6.1).
6. Тип слотов проверить в `tests/*.types.ts` (позитивные и негативные).
7. Пример и документация (en/ru) с опцией-аватаром.

**Критерии:**
- unit на каждый пункт;
- типовые тесты слотов;
- e2e: typeahead и disabled-опция;
- обратная совместимость: без слотов отрисовка идентична, визуальные эталоны не меняются.

### T4.2 — Ключи по данным: `rowKey`, `optionKey`   [CMP-8] · P1 · S · нет

**Шаги:**
- `WlTable`: `rowKey?: keyof Row | ((row: Row, index: number) => PropertyKey)`; при отсутствии — индекс, как сейчас;
- списки: `optionKey` по образцу `optionValue`, по умолчанию значение из `optionValue`, если оно примитив, иначе индекс;
- Breadcrumbs, Steps, Pagination — ключи по `href`/`label` + индекс.

**Тест:** таблица с инпутом в ячейке, удаление первой строки → значение инпута второй строки остаётся у неё.

### T4.3 — Table: минимальный набор до 1.0   [Table из 03] · P1 · M · нет

**Шаги:**
- `caption` (prop и слот) / `ariaLabel`;
- слот заголовка `header-<key>`;
- `align: "start" | "center" | "end"` в колонке (numeric сохранить);
- `rowClass`;
- `sortable` в колонке + `v-model:sort` (`{ key, direction } | null`), кнопка в заголовке с `aria-sort`; сортирует пользователь, опционально проп `sortFn`;
- выбор строк: `selectionMode: "multiple" | "single"` + `v-model:selection` (массив ключей из `rowKey`), чекбокс «выбрать всё» с `indeterminate`.

**Критерии:** unit + e2e на клавиатуру в заголовке; документация. Большие функции (фиксированные колонки, раскрытие, виртуализация) — в NEW-7 после 1.0.

### T4.4 — Интеграция с роутером: `linkComponent` и `WlLink`   [CMP-2, NEW-3] · P1 · M · нет

**Шаги:**
1. `WlConfigOptions.linkComponent?: Component` (например, `RouterLink`, передаёт приложение; библиотека vue-router не импортирует).
2. Новый `WlLink`:
   - props `to?: unknown`, `href?: string`, `external?: boolean`, `disabled?: boolean`;
   - если есть `to` и `linkComponent` — рендерит его с `to` и `custom`-режимом или как обёртку;
   - иначе `<a :href>`;
   - `external` → `target="_blank" rel="noopener noreferrer"` + визуально скрытое «(opens in a new tab)» из locale.
3. Использовать `WlLink` в `WlBreadcrumbs` (сейчас `to` → `href`), `WlNavItem` (+ prop `to`), `WlSidebar` (поле `to` в `WlSidebarItem`), `WlCommandPalette` (поле `to`), `WlMenu` (поля `href`/`to` в `WlMenuItemBase`; сейчас пункт — `<a>` без `href`).
4. `active` для ссылок роутера: если `linkComponent` даёт `isActive` в слоте (`RouterLink custom`), использовать его. Иначе — текущий prop `active`.
5. Компонент в манифест, пример (с фейковым `linkComponent`), документация, рецепт «Vue Router».

**Критерии:**
- unit: с фейковым `linkComponent` Breadcrumbs, NavItem, Sidebar и Menu рендерят его с `to`; без него — `<a href>`;
- e2e в Playground: ссылки не перезагружают страницу (если Playground получит роутер в T9.7 — проверить там).

### T4.5 — Единый словарь статусов `tone`   [CMP-1] · P1 · M · **да → алиасы в 0.14, удаление в 1.0**

**Шаги:**
1. `export type WlTone = "neutral" | "accent" | "info" | "success" | "warning" | "danger";`
2. Prop `tone` у Alert, Pill, Badge, StatCard, Toast-сообщений, ConfirmDialog (`danger`), Progress (`variant` → `tone`), Button (`tone="danger"` вместо `danger` / `danger-quiet` / `soft-danger`, при этом `variant` = форма: primary/secondary/ghost/soft/link).
3. Старые значения `variant` (`ok`, `warn`, `err`, `gray`…) принимать и маппить на `tone` с dev-предупреждением «deprecated, use tone="…"». CSS-классы сохранить (контракт): новый `tone` выставляет те же классы и добавляет `data-tone`.
4. `WlTag`: `color` (gray/blue/green/amber/red) остаётся отдельной осью и не путается с `tone`.
5. Миграция 0.14 + JSDoc `@deprecated`.

**Критерии:**
- старые значения работают и предупреждают в dev;
- визуальные эталоны без изменений;
- типовые тесты: `tone` принимает только `WlTone`.

### T4.6 — Контракт осей и единые API семейств   [CMP-3, CMP-5] · P1 · M · нет

**Шаги:**
1. Описать в `docs/architecture.md` таблицу «категория → обязательные оси» (inputs: `size`, `density`, `invalid`, `disabled`, `pt`; overlays: `visible`, `modal`, `dismissible`, `closeOnEscape`, `motion`, `pt`, события `open`/`close`/`afterLeave`; статусные: `tone`).
2. Закрыть пробелы:
   - `size`: Textarea, Checkbox, Radio, Switch (sm/md);
   - `density`: DatePicker;
   - `pt`: Field, NumberInput, PasswordInput, Slider, Accordion, Alert, CommandPalette, Sidebar, FileUpload, FilterBar, Chip, Pill, Steps.
3. Drawer ← Dialog: `closable`, `width`/`size`, `afterLeave`. Значения `dismissable` по умолчанию оставить (меняют поведение), но задокументировать различие.
4. Контрактный тест по манифесту: компоненты категории объявляют обязательные оси.

### T4.7 — Мелкие улучшения компонентов   [таблица в 03] · P2 · S–M каждый · нет

Выбирать по потребности; каждый пункт — отдельная задача.

| Компонент | Улучшение |
|---|---|
| Avatar | Fallback на инициалы при ошибке загрузки (`@error`), `getWlInitials` (T6.5), `shape: "square"` |
| Badge | `max` («99+», через `formatWlCount`), слот |
| Progress | `indeterminate` |
| Popover / Menu | `placement` (`bottom-start` / `bottom-end` / `top-*`), сейчас только выравнивание по левому краю якоря |
| Tabs | disabled-вкладки, вертикальная ориентация, `lazy` / `keepAlive` панелей; убрать запись модели в `watchEffect` при монтировании (выбор первой вкладки — без emit или документировать) |
| Accordion | слот заголовка, `defaultOpenKeys` |
| Input | `clearable` |
| Textarea | счётчик `maxlength` |
| NumberInput | форматирование через `Intl.NumberFormat` (locale, `precision`, валюта), prefix/suffix |
| Slider | диапазон (два бегунка), `aria-valuetext`, метки |
| Dialog | `size` пресеты, `fullscreen` на мобильных, `initialFocus` prop (есть внутри lifecycle) |
| Confirm | Promise API: `const ok = await confirm({...})` |
| DatePicker | формат отображения через `Intl`, `disabledDates` |
| TimePicker | `step` (секунды), `hourCycle` |

---

## Фаза 5 — производительность (1–2 недели)

### T5.1 — Оверлеи: слушатели только при открытии   [PERF-2] · P1 · S · нет

**Файлы:** `utils/anchoredOverlay.ts` (строки 89–93), `utils/overlayLifecycle.ts` (строка 193).

**Шаги:**
1. `pointerdown`/`keydown`/`resize`/`scroll` вешать в `show()` (или в `watch(visible)` при `true`), снимать в `hide()` и `onBeforeUnmount`.
2. `position()` через `requestAnimationFrame` (флаг «кадр запланирован»).
3. z-index якоря (цикл `getComputedStyle` по предкам) — один раз при открытии.
4. `ResizeObserver` на панели, пока открыта (пересчёт позиции при изменении высоты, например при фильтрации Autocomplete).
5. `useOverlayLifecycle`: `keydown` на `document` — только при `active`.

**Критерии:**
- unit: 10 закрытых Select → 0 вызовов `document.addEventListener` от оверлеев; open → слушатели есть; close → сняты;
- e2e оверлеев зелёные.

### T5.2 — Быстрый путь `useWlPt` и кэш locale   [PERF-3, PERF-4] · P2 · S · нет

**Шаги:**
- если `config.pt?.[component]` и локальный `pt` не заданы — `section()` возвращает заранее посчитанный объект дефолтов (заморозить);
- кэш по имени секции для вызовов без контекста;
- `normalizeWlLocale` выполнять один раз на значение locale (`WeakMap`), компоненты используют общий `computed` из provide.

**Тест:** поведение pt без изменений (существующие pt-тесты); бенчмарк в отчёте (рендер Select на 500 опций до и после) — не в CI.

### T5.3 — Переменный шрифт   [PERF-7, PG-PERF-5] · P1 · M · нет (имена `font-family` и веса те же)

**Файлы:** `scripts/fonts/build_font.py`, `verify_fonts.py`, `packages/ui-kit/styles/fonts/gavia.css`, `fonts/gavia/manifest.json`, `font-assets.test.ts`.

**Шаги:**
1. Собирать `Gavia-Variable.woff2` и `Gavia-Variable-Italic.woff2` (`font-weight: 100 900`).
2. Сабсеты `unicode-range`: latin, latin-ext, cyrillic (+ знаки).
3. В `gavia.css` переменные `@font-face` идут первыми. Статические оставить на один минорный цикл, либо удалить с заметкой в миграции.
4. Метрики fallback (`size-adjust`, `ascent-override`, `descent-override`) для системного шрифта, чтобы уменьшить CLS.
5. Playground: `<link rel="preload">` для основного сабсета.

**Критерии:**
- суммарный вес шрифтов главной Playground ≤ 80 КБ (сейчас 151 КБ);
- визуальные эталоны Gavia не изменились или изменились в пределах субпиксельного рендеринга — просмотреть diff;
- `verify_fonts.py` и `font-assets.test.ts` обновлены и зелёные.

### T5.4 — Playground: ленивые словари и предкомпиляция   [PG-PERF-2] · P1 · M · нет

**Файлы:** `apps/playground/src/i18n/index.ts`, `vite.config.ts`, `package.json` Playground.

**Шаги:**
1. Shell-словари текущего языка — сразу; `documentation`, `examples`, `tokens`, `changelog` — через `import()` при входе на страницу; другой язык — при переключении.
2. `@intlify/unplugin-vue-i18n` (dev-зависимость Playground) для предкомпиляции JSON; alias `vue-i18n` → runtime-only сборка.
3. `tokens.generated.ts` импортировать только в страницах токенов, цветов и конструкторе тем.

**Критерии:**
- главный чанк ≤ 80 КБ gzip (сейчас 235 КБ);
- переключение языка без мерцания ключей (показывать предыдущий текст до загрузки);
- e2e `locale.spec.ts`, `preferences.spec.ts` зелёные.

### T5.5 — Playground: изображения и чанки   [PG-PERF-3, PG-PERF-4] · P2 · S–M · нет

**Шаги:**
- ночная иллюстрация — только в тёмной теме (проверено: сейчас обе грузятся в светлой);
- `srcset` 640/1024/1600;
- `loading="lazy"` для карточек;
- `CodePanel` (88 КБ) и `DocsPage` (334 КБ): исходники примеров (`import.meta.glob(..., { query: "?raw", eager: true })` в `RecipeGallery.vue`) грузить лениво; DocsPage разбить по категориям.

**Критерии:** главная ≤ 400 КБ передачи (сейчас ~1.2 МБ после T1.6 — ~0.8 МБ).

### T5.6 — Один стек оверлеев   [ARCH-5] · P2 · S · нет

Объединить `overlayStack` из `overlayLifecycle.ts` и модуль `overlayStack.ts` в один стек с полями `{ token, panel, anchor, modal, trapFocus }`. Тесты `nested-anchored-overlays`, `overlays`, `overlay-*` — зелёные без изменений.

---

## Фаза 6 — утилиты и composables (2–3 недели) → релиз 0.15.0

**Общее для фазы:**
- новые entry points `gavia-ui/utils` (без Vue) и `gavia-ui/composables`;
- `vite.config.ts`: `build.lib.entry: { index: "src/index.ts", utils: "src/utils/public.ts", composables: "src/composables/index.ts" }`, `fileName: (format, name) => `${name}.js``;
- `package.json` `exports`: `"./utils"`, `"./composables"` с `types`;
- проверить, что `dts` генерирует декларации для всех entry;
- `verify:package` импортирует новые entry;
- внутренние компоненты используют те же модули.

### T6.1 — Плюрализация и числа   [UTIL-1, UTIL-2] · P1 · S · нет

- `wlPlural(locale, count, forms)` на `Intl.PluralRules` с кэшем;
- `formatWlNumber`, `formatWlBytes` (`style: "unit"`), `formatWlCount(n, { max })`, `formatWlPercent`;
- locale-словарь библиотеки: `selectedItems` принимает объект форм `{ one, few, many, other }`, строка остаётся как fallback;
- заменить `humanSize` в `WlFileUpload` и ключи `fileByteUnit`, `fileKilobyteUnit`, `fileMegabyteUnit`, `decimalSeparator` (оставить в типе как deprecated).

**Тесты:** ru/en для 0, 1, 2, 5, 11, 21, 1.5; байты 0, 1023, 1024, 1.5 МБ.

### T6.2 — Контраст и hex в одном месте   [UTIL-5, ARCH-6] · P1 · M · нет

`normalizeWlHex`, `getWlContrastRatio`, `meetsWlContrast`. Перевести на них:
- `WlColorPicker`;
- `packages/ui-kit/scripts/token-tools.mjs` (импорт из собранного `dist/utils.js` или общий `.mjs`-модуль, который импортирует и TS-код);
- `apps/playground/src/theme-builder/palette.ts`.

**Тест:** значения контраста совпадают с текущими (снапшот на палитрах тем).

### T6.3 — `useWlAnnouncer`   [UTIL-10] · P1 · S · нет

Одна live-область на приложение (лениво в `body`, SSR-безопасно), `announce(text, "polite" | "assertive")`, очистка и повтор одинакового текста. Использовать в T4.1 и T3.4.

### T6.4 — `useWlTheme` + `wlThemeInitScript`   [UTIL-9] · P1 · M · нет

Перенести логику из `apps/playground/src/themes.ts`, `preferences.ts`, `theme-transition.ts`:
- `preference: "light" | "dark" | "system"`;
- `resolved`;
- хранилище (опционально);
- плавная смена с учётом `prefers-reduced-motion`;
- inline-скрипт для `index.html` без вспышки темы.

Playground переходит на эту реализацию. Компонент `WlThemeSwitcher` (NEW-24) — опционально.

### T6.5 — Даты, инициалы, числа, attrs   [UTIL-3, UTIL-4, UTIL-6, UTIL-7, CMP-9] · P1–P2 · M · нет

- даты: `parseWlIsoDate`, `toWlIsoDate`, `formatWlDate`, `formatWlRelativeTime`, `getWlMonthNames`, `getWlWeekdayNames`, `getWlFirstDayOfWeek` — вынести из DatePicker и Calendar;
- `getWlInitials`;
- `clamp`, `finiteOr`, `toPercent`, `roundToStep` — заменить 22 вхождения `Number.isFinite` с ручным ограничением в 7 компонентах;
- публичные `mergeWlAttrs`, `deepMerge`.

### T6.6 — `useWlRovingFocus`, публичный `useWlListbox`   [UTIL-11, UTIL-12] · P1 · M · нет

Roving tabindex (ориентация, `loop`, пропуск disabled) → перевести Tabs, Segmented, Menu (T3.5). `useWlListbox` из T1.1 сделать публичным с документацией.

### T6.7 — Прочие composables   [UTIL-13…17] · P2–P3 · S–M · нет

- `useWlClipboard`;
- `useWlControllable` / `useWlDisclosure` (заменить ручной паттерн в Accordion);
- публичные `useWlFocusTrap`, `useWlScrollLock`, `useWlDismiss`, `useWlAnchoredPosition` (после T5.1 и T5.6);
- `useWlMediaQuery`, `useWlBreakpoint`, `useWlReducedMotion`;
- `useWlHotkey`.

---

## Фаза 7 — структура репозитория (1–2 недели)

### T7.1 — Тесты по компонентам   [TEST-1] · P1 · M · нет

**Шаги:**
- `git mv` в структуру `tests/components/`, `tests/contracts/`, `tests/types/`, `tests/utils/`, `tests/assets/`;
- разнести `stage5a`, `stage5b`, `pickers-0.8`, `basic-components`, `forms`, `data`, `navigation`, `overlays` по файлам компонентов без изменения содержимого тестов;
- обновить `vitest` `include` и `tsconfig`.

**Критерии:** число тестов до и после одинаковое (701 + добавленные в фазах 1–6); покрытие не упало.

### T7.2 — Генератор компонента   [ARCH-1] · P1 · M · нет

`scripts/new-component.mjs` + шаблоны `scripts/templates/component/*`. Создаёт или дополняет:
- SFC, экспорт, контракт типов, pt-секцию;
- запись манифеста;
- CSS-заготовку в отдельном блоке `@layer wl.components`;
- пример, страницу документации, ключи en/ru;
- заготовки unit- и e2e-тестов.

Скрипт `"new:component"`. Проверить на временном компоненте `WlScratch` и удалить его.

**Критерии:** после генерации typecheck и тесты проходят без ручных правок (тесты-заготовки — `it.todo`).

### T7.3 — Playground через `gavia-ui`   [ARCH-7, PG-4] · P2 · S · нет

- alias `gavia-ui` → `packages/ui-kit/src/index.ts` в `apps/playground/vite.config.ts` и `tsconfig` (`paths`);
- заменить 209 импортов `../../../packages/ui-kit/src/...`;
- для внутренних модулей, которых нет в публичном API (например, прямой импорт `WlCommandPalette.vue` для `defineAsyncComponent`), использовать публичный экспорт или осознанно оставить внутренний импорт с комментарием;
- правило линтера Playground → `error`.

**Внимание:** README говорит «playground uses types from dist». Определиться, `src` или `dist`, и привести документацию к одному варианту.

### T7.4 — Разбить CI   [CI-1, CI-6] · P1 · M · нет

- `.github/actions/setup/action.yml` (composite: pnpm, node, cache, install, опционально build);
- `ci.yml` (PR/main, `concurrency` с `cancel-in-progress`);
- `pages.yml` (`workflow_run` после успешного CI на main или `needs` внутри ci.yml — выбрать вариант, сохраняющий текущую гарантию «только после всех гейтов того же коммита» и проверку HEAD);
- `release.yml` (теги; пин actions по SHA; `id-token: write` только здесь);
- кэш Playwright-браузеров.

**Критерии:** набор проверок не уменьшился (сверить список шагов до и после); бейдж CI в README.

### T7.5 — Тесты Playground отдельно; дописать покрытие; ускорить   [TEST-2, ARCH-8, TEST-3, TEST-5, TEST-9] · P1–P2 · M · нет

- `apps/playground/vitest.config.ts`, перенос 12 файлов (`playground-*`, `theme-builder`, `documentation-*`, `code-highlighting`, `responsive-*`, `example-source`, `project-changelog`);
- корневой `pnpm test` запускает оба проекта;
- дописать Tooltip (сейчас 69% строк, 45% функций), Tabs, Dialog — по списку в [09-testing.md → TEST-3](09-testing.md);
- `environment: "node"` для тестов без DOM;
- в CI e2e на `vite build && vite preview`.

### T7.6 — Визуальные эталоны в Docker   [CI-5] · P2 · M · нет

Эталоны снимаются в официальном образе Playwright (Linux) и локально, и в CI. Скрипт `test:visual:docker`. Переснять **все** эталоны отдельным PR, просмотреть diff каждой темы.

---

## Фаза 8 — документация (1–2 недели, можно параллельно фазам 5–7)

### T8.1 — Пользовательская и мейнтейнерская документация   [DOC-2] · P1 · M

Структура `docs/guide/`, `docs/reference/`, `docs/maintainers/`. Журналы прогонов («During local 0.11.0 preparation…») убрать из пользовательских страниц.

### T8.2 — Один `migration.md`   [DOC-3] · P1 · S

Объединить 13 файлов `docs/migration-*.md` и `baseline-0.3.md` в разделы. Старые файлы — короткие ссылки на новый раздел или удаление с обновлением ссылок (`git grep -n "migration-"`).

### T8.3 — ROADMAP как план   [DOC-5] · P1 · S

Now / Next / Later / Non-goals на основе этого плана. История Stage 0–5b — в `docs/maintainers/history.md`.

### T8.4 — Английский во всём публичном   [DOC-7, OSS-2] · P1 · S–M

Issue-шаблоны (T2.2), `.changeset/README.md`, `AGENTS.md` (T0.1), строки в тестах по возможности. `README.ru.md` — по желанию.

### T8.5 — JSDoc у публичного API и API-таблицы на сайте   [DOC-8, PG-2] · P1–P2 · M

- JSDoc ко всем публичным props, событиям и слотам (`@default`, `@since`, `@deprecated`);
- `vue-component-meta` (dev-зависимость Playground) для генерации API-таблиц с реальными типами вместо `array` / `union` / `object`;
- v-model показывать как `update:modelValue` с типом.

### T8.6 — Раздел Accessibility и навигация сайта   [PG-5, PG-6, A11Y-P4] · P2 · M

- таблица «клавиша → действие», роли и атрибуты, что делает пользователь, ссылка на APG;
- навигация по компонентам слева, оглавление «On this page» справа;
- бейдж «New» вместо «Since 0.1.0» у 44 из 53;
- в примерах заголовки уровнем ниже заголовка раздела.

### T8.7 — CHANGELOG и releases   [REL-2, REL-3, PG-8] · P2 · S

- Keep a Changelog без дублирующего раздела `### Changesets`;
- `docs/releases.md` → процедура (≤ 80 строк), журналы — в GitHub Releases;
- changelog на сайте — только английский (если согласовано).

### T8.8 — Бренд-ассеты   [DOC-9] · P2 · S

В репозитории оставить финальные WebP и SVG; PNG-исходники, промпты и варианты v1 / preview вынести (отдельный репозиторий или архив). Обновить `docs/brand/README.md`.

---

## Фаза 9 — подготовка к 1.0 (1–2 месяца)

### T9.1 — RFC решений к 1.0   [ARCH-9] · P1 · S

`docs/rfc/0001-v1-decisions.md` + GitHub Discussion. Вопросы:
- префикс `Wl` (рекомендация: оставить и объяснить);
- fallback-язык (en);
- имена pt-секций;
- `dismissible`;
- `tone`;
- минимальный Vue 3.5 (сделано в T1.4);
- Node 20.19+.

Зафиксировать решения до начала T9.2–T9.3.

### T9.2 — Локализация: английский fallback, текст только из locale   [CMP-4, ARCH-4, UTIL-8] · P1 · M · **да (1.0)**

- русские дефолты props (13 компонентов: Alert, Autocomplete, ColorPicker, CommandPalette, DatePicker, FilePicker, FilterBar, NumberInput, PasswordInput, Sidebar, Spinner, Table, Tag) → `undefined`;
- текст `props.x ?? locale.value.x`;
- удалить `useWlLocaleText`;
- fallback-локаль `wlLocaleEn`;
- `createWlLocaleFromIntl(code, overrides)`: месяцы, дни недели, первый день недели, числа и единицы из `Intl`;
- миграция: «если приложение рассчитывало на русские тексты без `WlConfig`, подключите `wlLocaleRu`».

### T9.3 — Нормализация имён pt-секций и удаление алиасов   [CMP-7] · P1 · M · **да (1.0)**

- `pcCloseButton.*` → `closeButton.*`;
- `pcChip.*` → `chip.*`;
- `pcToggleButton.*` → `item.*`;
- ключи компонентов: `datatable` → `table`, `inputtext` → `input`, `toggleswitch` → `switch`, `selectbutton` → `segmented`, `paginator` → `pagination`, `progressbar` → `progress`, `radiobutton` → `radio`, `breadcrumb` → `breadcrumbs`, `tablist` / `tabpanels` / `tabpanel` → `tabs.*`. Полный текущий список ключей (по вызовам `useWlPt` на момент ревью): autocomplete, avatar, badge, breadcrumb, button, card, checkbox, confirmdialog, datatable, datepicker, dialog, divider, drawer, filepicker, inputtext, menu, multiselect, paginator, popover, progressbar, radiobutton, select, selectbutton, skeleton, tablist, tabpanel, tabpanels, tag, textarea, timepicker, toast, toggleswitch;
- `WlIconButton` использует ключ `button` — тот же, что `WlButton`, поэтому `WlConfig.pt.button` меняет обе кнопки сразу. Дать `WlIconButton` собственный ключ `iconButton` (старый остаётся на переходный период);
- в 0.15 — алиасы с dev-предупреждением, в 1.0 — удаление;
- то же для `dismissable` → `dismissible` и старых значений `variant` из T4.5.

### T9.4 — Новые компоненты базового набора   [NEW-1, NEW-2, NEW-4, NEW-5, NEW-6] · P1 · M–L каждый · нет

Через генератор T7.2, по одному PR на компонент:
1. `WlCheckboxGroup` / `WlRadioGroup` + массивный режим `WlCheckbox`;
2. `WlTooltip`-компонент;
3. подменю, `menuitemcheckbox` / `menuitemradio`, `WlContextMenu`;
4. `WlToolbar`;
5. `WlTagsInput`.

Описание каждого — в [04-new-components.md](04-new-components.md).

### T9.5 — Типы для `node16`/`nodenext`   [PKG-2] · P2 · S · нет

Декларации с расширениями `.js` в относительных импортах. attw в CI без исключений.

### T9.6 — Поведенческие a11y-тесты и ручная проверка   [A11Y-P2, A11Y-P3] · P1 · M · нет

- `toMatchAriaSnapshot` в e2e для интерактивных компонентов (открыт / активная опция / выбрано);
- ручная проверка NVDA + Firefox и VoiceOver + Safari (macOS и iOS) по 10 ключевым компонентам, протокол в `docs/quality.md` с датой и версиями.

### T9.7 — Сайт: пути, пререндер, StackBlitz, examples   [PG-3, PG-7, OSS-4] · P1–P2 · L · нет

- маршруты-пути вместо query (свой роутер или vue-router как зависимость **Playground**), редиректы со старых `?view=`;
- пререндер маршрутов из sitemap Playwright-скриптом;
- страница «Why Gavia UI»;
- `examples/vite-starter`, `examples/nuxt-starter`, `examples/custom-theme`;
- кнопка «Open in StackBlitz»;
- `llms.txt` из манифеста.

### T9.8 — Релиз 1.0   [REL-4, OSS-5] · P1 · L

- `1.0.0-rc.1` → RFC-период 2–4 недели → `1.0.0`;
- анонс (Habr, dev.to, Reddit r/vuejs, Vue Land);
- topics и social preview репозитория;
- заявка в awesome-vue.

---

## Фаза 10 — после 1.0

NEW-7 DataTable, NEW-8 VirtualList (и виртуализация в списках), NEW-9 Tree, NEW-10 Descriptions, NEW-11 List, NEW-12…24 (Kbd, CopyButton, OTP, Stepper, AvatarGroup, Splitter, SkipLink, VisuallyHidden, RelativeTime, Banner, Rating, DateTimePicker, ThemeSwitcher); PERF-5 иконки; PERF-6 CSS по компонентам; LINT-2 Stylelint; TEST-6 Vitest Browser Mode; TEST-7 тесты через роли; TEST-10 мутационное тестирование; вынести ESLint-конфиг в отдельный пакет `@whitewolf06/eslint-config` для других пет-проектов.

---

## Сводка зависимостей

```
T0.1 ─┬─> всё (правила работы)
T0.3 ─┴─> все задачи с кодом (форматирование до правок)
T1.1 ──> T4.1 ──> (T6.3 желательно до T4.1)
T1.2 ──> T1.3
T1.4 ──> T1.5
T2.1 <── T1.5 (бейдж размера), T7.4 (бейдж CI)
T3.5 <── T6.6 (можно минимальный внутренний раньше)
T4.4 ──> T9.7 (ссылки роутера на сайте)
T4.5 ──> T9.3 (удаление алиасов)
T5.1, T5.6 ──> T6.7 (публичные оверлейные composables)
T6.1 ──> T4.1 (объявления «N results»), T4.7 (Badge max)
T7.1 — до массовых новых тестов (после фазы 1)
T7.2 ──> T9.4
T9.1 ──> T9.2, T9.3
```

## Как отмечать прогресс

В [00-backlog.md](00-backlog.md) у каждой находки можно ставить статус:
- `✅` с хэшем коммита или номером PR;
- `🚧`;
- `⏭` — отложено, с причиной.

Отчёт по каждой задаче:
- что сделано;
- какие быстрые проверки пройдены;
- какие тяжёлые отложены;
- изменён ли публичный контракт и где описана миграция.
