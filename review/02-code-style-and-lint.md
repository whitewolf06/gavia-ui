# 02. Качество кода, линтер и форматирование

[← к оглавлению](README.md)

## Что сейчас

**Хорошо:**
- strict TypeScript с `noUncheckedIndexedAccess`, `noImplicitOverride`;
- ни одного `any`, `@ts-ignore` или TODO в `packages/ui-kit/src`;
- комментарии объясняют «почему», а не «что»;
- модули небольшие: самый крупный компонент — `WlDatePicker`, 343 строки.

**Плохо:**
- **Нет ESLint, Prettier, Biome и `.editorconfig`.** Стиль держится на дисциплине автора и агентов.
- **Плотный однострочный стиль:** несколько операторов в строке, склеенные атрибуты шаблона, условные цепочки на 3–4 строки внутри `computed`. 28 строк длиннее 160 символов только в компонентах.
- 46 приведений `as unknown as` в `src`. Часть оправдана generic-контрактами, часть — следствие отсутствия правила.
- Нет автоматической проверки правил `agents.md`, которые можно проверять статически:
  - запрет `@/` в ui-kit;
  - запрет PrimeVue;
  - импорты Playground из `../../../packages/ui-kit/src` вместо `gavia-ui`.

## LINT-1. Свой flat-конфиг ESLint в стиле antfu · P0 · M

Вы хотите набор, похожий на `@antfu/eslint-config`, но без зависимости от чужого конфига. Это хорошее решение: конфиг antfu меняется по вкусу автора, а мажоры ломают правила. Свой конфиг — это те же плагины, собранные один раз.

### Что взять у antfu (идеи, а не пакет)

- **Без Prettier**: форматирование через `@stylistic/eslint-plugin`. Один инструмент и один проход; `--fix` форматирует и линтит.
- Flat config, один файл в корне на весь монорепозиторий.
- Сортировка импортов (`perfectionist`), удаление неиспользуемых импортов (`unused-imports`).
- Разные наборы правил для разных зон: исходники, тесты, e2e, скрипты, JSON.
- `--fix` при сохранении в VS Code вместо форматтера.

### Почему не Biome / oxlint

Biome быстрый и даёт форматтер одним пакетом, но шаблоны Vue он поддерживает ограниченно. Для библиотеки Vue-компонентов главная ценность — `eslint-plugin-vue` и `eslint-plugin-vuejs-accessibility`, которые проверяют именно `<template>`. oxlint можно добавить позже как быстрый предварительный проход, но не вместо ESLint.

### Состав (только devDependencies корня)

| Пакет | Зачем |
|---|---|
| `eslint`, `@eslint/js`, `globals` | ядро |
| `typescript-eslint` | правила TS, парсер для `<script lang="ts">` |
| `eslint-plugin-vue` (+ `vue-eslint-parser`) | шаблоны, порядок макросов, атрибуты |
| `eslint-plugin-vuejs-accessibility` | статическая a11y шаблонов (alt, label, role, интерактивность) |
| `@stylistic/eslint-plugin` | форматирование вместо Prettier |
| `eslint-plugin-perfectionist` | сортировка импортов и экспортов (только они, без сортировки ключей объектов) |
| `eslint-plugin-unused-imports` | автоудаление неиспользуемых импортов при `--fix` |
| `eslint-plugin-regexp` | ошибки в регулярках (их много в скриптах токенов и иконок) |
| `eslint-plugin-unicorn` (выборочно) | `prefer-node-protocol`, `no-useless-spread`, `prefer-string-replace-all`… |
| `@vitest/eslint-plugin` | правила для unit-тестов |
| `eslint-plugin-playwright` | правила для e2e (`no-wait-for-timeout`, `prefer-web-first-assertions`) |
| `eslint-plugin-jsonc` + `jsonc-eslint-parser` | JSON: сортировка ключей `package.json` как у antfu, проверка i18n-словарей |
| `eslint-plugin-n` | скрипты в `scripts/*.mjs` (Node API, `node:`-протокол) |

Это около 15 dev-пакетов. Runtime-граница библиотеки не меняется, и требование `agents.md` («Любая новая devDependency — с обоснованием в коммите») выполняется одной таблицей выше.

Черновик готового конфига: [`drafts/eslint.config.mjs`](drafts/eslint.config.mjs). Он повторяет текущий стиль кода (двойные кавычки, точки с запятой, без висячих запятых, отступ 2), поэтому `--fix` даст минимальный шум.

### Черновик проверен на копии репозитория

Я поставил эти пакеты в отдельную копию репозитория в облаке (ваш репозиторий не трогал) и прогнал конфиг. Версии на момент проверки: eslint 10.13, typescript-eslint 8.71, eslint-plugin-vue 10.11, @stylistic 5.x, perfectionist 5.12, vuejs-accessibility 2.6.

| Шаг | Результат |
|---|---|
| `eslint .` (472 файла) | ~6 900 находок, из них ~4 500 исправляются автоматически |
| `eslint . --fix` | 388 файлов изменено (+7 146 / −3 526 строк) |
| После `--fix` | 527 ошибок и 906 предупреждений вручную, в основном `max-len` (632+93) и `max-statements-per-line` (294) |
| `pnpm build`, `pnpm typecheck`, `pnpm test` после `--fix` | **зелёные** (701/701) |

Три правила пришлось поправить, потому что их автофикс ломал код. Это уже учтено в черновике:
1. `unicorn/prefer-string-replace-all` — `replaceAll` есть только в ES2021, а `lib` и `target` проекта — ES2020. Typecheck падал. Правило убрано.
2. `unused-imports/no-unused-imports` удалял `import Teleport from "../utils/templateTeleport.vue"` и `Transition`: это обход Volar, а имена совпадают со встроенными компонентами, поэтому парсер не видит их использования в шаблоне. Для двух файлов правило отключено. Лучшее решение — переименовать импорты в `WlTeleport` / `WlTransition`.
3. `playwright/prefer-web-first-assertions` при автофиксе превращал строковый ID в локатор (`const hintId = input`) и менял смысл теста. Правило выключено до ручного прохода.

Что линтер нашёл по существу (помимо стиля):
- неиспользуемые типы `CallbackInference` в `generic-contracts.ts` (4 шт.);
- неиспользуемые `props` в `DocumentationTabs.vue` и `GaviaTypeStudy.vue`;
- регулярные выражения с риском катастрофического бэктрекинга в парсере changelog (`changelog.ts`, `changelog-localization.ts`) и в `scripts/release-notes.mjs`;
- 57 + 44 условных `expect` в тестах (`no-conditional-expect`): тест может пройти, не проверив ничего;
- 26 пустых объектных типов `{}` (`no-empty-object-type`), в том числе `defineSlots<{}>()`;
- несколько статических a11y-замечаний в примерах Playground (поля без подписи, кликабельные элементы без клавиатуры).

### Правила проекта, которые стоит закодировать

| Правило из `agents.md` / ревью | Как проверять |
|---|---|
| Внутри ui-kit нет `@/` | `no-restricted-imports` с паттерном `@/*` |
| Нет PrimeVue | `no-restricted-imports`: `primevue`, `primeicons` |
| Компонент не трогает `window`/`document` при импорте | `no-restricted-syntax` для `.ts`-модулей ui-kit: обращение к `window`/`document`/`navigator`/`localStorage` прямо на верхнем уровне модуля (эвристика; верхний уровень `<script setup>` — это `setup()`, его не трогаем) |
| Playground импортирует библиотеку по имени пакета | `no-restricted-imports` с паттерном `**/packages/ui-kit/src/**` в `apps/playground` (сначала `warn`, после алиаса — `error`) |
| Нет `any` | `@typescript-eslint/no-explicit-any: error` |
| Один оператор в строке | `@stylistic/max-statements-per-line: { max: 1 }` |
| Порядок блоков SFC | `vue/block-order: script, template, style` |
| Только `<script setup>` | `vue/component-api-style: ["script-setup"]` |
| `v-html` только в `WlIcon` | `vue/no-v-html: error` + `eslint-disable-next-line` с комментарием в одном месте |
| Иконка-кнопка с именем | `vuejs-accessibility/*` + свой тест (A11Y-5) |
| Тесты не ждут по таймеру | `playwright/no-wait-for-timeout: error` |

### План внедрения (чтобы не утонуть в правках)

1. Добавить конфиг, `.editorconfig` ([`drafts/.editorconfig`](drafts/.editorconfig)) и скрипты:

   ```json
   "lint": "eslint . --cache",
   "lint:fix": "eslint . --fix --cache"
   ```

2. Включить все стилистические правила и выполнить **один** коммит `style: apply eslint stylistic` только с результатами `--fix`.
3. Хэш этого коммита записать в `.git-blame-ignore-revs`, чтобы `git blame` не «терял» авторство строк.
4. Остальные (нестилистические) правила сначала `warn`. Исправлять пакетами по зонам (ui-kit/src → tests → playground → scripts) и переводить в `error`.
5. Добавить шаг `pnpm lint` в CI-джобу verify (первым, он самый быстрый).
6. VS Code (`.vscode/settings.json` в репозитории, как у antfu):

   ```json
   {
     "prettier.enable": false,
     "editor.formatOnSave": false,
     "editor.codeActionsOnSave": { "source.fixAll.eslint": "explicit", "source.organizeImports": "never" },
     "eslint.validate": ["javascript", "typescript", "vue", "json", "jsonc"]
   }
   ```

   И `.vscode/extensions.json` с `dbaeumer.vscode-eslint` и `Vue.volar`.
7. Опционально `simple-git-hooks` + `lint-staged` (`eslint --fix` на изменённых файлах). Это ещё две маленькие dev-зависимости. Можно обойтись CI-проверкой.

### Переиспользование в других пет-проектах

Когда конфиг устоится, его можно вынести в отдельный пакет `@whitewolf06/eslint-config` с фабрикой как у antfu:

```js
export default whitewolf({ vue: true, a11y: true, playwright: true })
```

Это ваш собственный «antfu», и ещё один аккуратный пакет в портфолио. Начинать лучше внутри репозитория: так проще экспериментировать.

## LINT-2. Stylelint для CSS · P2 · S

`base.css` — это 4 300 строк. Часть контракта уже проверяется тестом `css-contract.test.ts`:
- только `--wl-*`;
- нет `!important`;
- слои.

Stylelint даст то же правилами и подсветкой в редакторе плюс:
- `selector-max-specificity: 0,1,0` (сейчас в `agents.md` «один класс» — правило без автоматической проверки);
- `declaration-no-important`;
- `custom-property-pattern: ^wl-`;
- `color-no-hex` вне токенов (цвет только через `var(--wl-*)`);
- `no-duplicate-selectors`, `declaration-block-no-duplicate-properties`.

Пакеты: `stylelint` + `stylelint-config-standard` (2 dev-зависимости). Тест `css-contract` можно сократить до того, что stylelint не умеет (порядок слоёв).

## LINT-3. Ручная чистка после линтера · P2 · M

- Пройти `as unknown as` (46 шт.) и оставить только те, что нужны generic-контрактам, с комментарием «почему».
- Длинные однострочные `computed` с вложенными тернарными операторами разбить на функции. Пример: `WlSlider.pct`, `utils/options.optionLabel`.
- Мёртвый код и остатки PrimeVue (CMP-7).
- `knip` (одна dev-зависимость) один раз: найти неиспользуемые экспорты, файлы и зависимости. Вероятно, найдёт остатки после миграции с PrimeVue и Playground-хелперы.

## LINT-4. Читаемость шаблонов · P2 · S

Правила `vue/max-attributes-per-line` (singleline: 3, multiline: 1) и `vue/first-attribute-linebreak` автоматически разложат склеенные атрибуты вроде:

```vue
<div v-if="visible" ref="panel" v-bind="section('overlay')" class="wl-overlay wl-select-overlay" :style="style">
```

Дифф получится большим, но это делается в том же форматирующем коммите.
