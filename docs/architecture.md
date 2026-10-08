# Архитектура Gavia UI

## Границы пакета

`packages/ui-kit` содержит Vue 3-компоненты, типы, манифест, темы и CSS.
`apps/playground` показывает их работу и используется для браузерных проверок.
Маршруты, API, хранилище и бизнес-правила остаются в приложении.
Единственный обязательный peer — `vue`; он не включается в ESM-бандл.

Точка входа `src/index.ts` экспортирует стабильные `Wl*` имена. Все 53
компонента описаны в `src/manifest`. Относительные импорты связывают файлы
внутри пакета; alias `@/` внутри пакета не используется. Стили импортирует
потребитель явно: `styles/reset.css`, `styles/base.css`, файл темы.

## Разделение ответственности и SOLID

- **Single responsibility.** Компонент обрабатывает props, события, слоты и
  разметку. `utils/options.ts` отвечает за выбор и клавиатуру,
  `utils/anchoredOverlay.ts` — за привязку панели и закрытие,
  `utils/overlayLifecycle.ts` — за модальный фокус и прокрутку. Сервисы хранят
  состояние уведомлений/подтверждений на уровне Vue-приложения.
- **Open/closed.** Варианты задаются props, содержимое — слотами, DOM-атрибуты
  внутренних разделов — `pt`, внешний вид — `--wl-*` токенами. Для новой темы
  переопределяют токены, не копируют компоненты.
- **Liskov substitution.** При замене реализации компонента сохраняют его
  публичный `v-model`, props, emits, слоты, классы `wl-*`, `data-wl` и состояния.
  Контрактные тесты и манифест проверяют эту границу.
- **Interface segregation.** Компонент принимает только нужные ему props;
  необязательные `WlConfig`, `WlToastService` и `WlConfirmationService`
  подключаются отдельно. Не заставляйте простое поле зависеть от оверлеев.
- **Dependency inversion.** Composables получают состояние через `provide`/
  `inject` Vue и типизированный контракт сервиса. Общее поведение не импортирует
  конкретный компонент. Поэтому два Vue-приложения на странице не делят очередь
  уведомлений или подтверждение.

При импорте компоненты не обращаются к `window`/`document`, поэтому пакет
можно импортировать на сервере. DOM используется после монтирования
или в обработчиках. Для нового компонента сначала опишите публичный контракт
в манифесте, затем напишите реализацию и проверки: props и модель, события
и слоты, клавиатура и фокус, мобильный экран, при необходимости — SSR.

## Контракты типов данных

Изменения типов выпущены в 0.11.0. При подготовке выпуска локально проверены
исходники, playground и установленный архив с Vue 3.4.0 / TypeScript 5.4.5
и Vue 3.5.40 / TypeScript 5.8.3. Также прошли unit-тесты, SSR и браузерный
потребитель. Совместимость с прежним API проверяется отдельно от новых типов.

### Выбор значений и подсказки

`WlSelect` / `WlMultiSelect` выводят тип модели из `options` и `optionValue`.
Без резолвера модель хранит `TOption`, с ключом — тип поля,
с функцией — тип её результата. `NoInfer` не позволяет неподходящей модели
расширить тип вариантов. Можно передать readonly-список: библиотека его не меняет.

`WlSelectModel<Option, Resolver>` включает `null` для очищенного выбора; `WlMultiSelectModel<Option, Resolver>` — массив значений. Непереданная модель Select допустима, MultiSelect сохраняет default `[]`.

`WlAutocompleteModel<Option>` — `Option | string | null`: свободный ввод возвращает строку, выбор — подсказку. В `multiple` используется `WlAutocompleteModel<Option, true>` — `Option[] | null`. Динамический boolean-режим требует модели обоих вариантов. Функция `optionLabel` в single обрабатывает и строку; ключ поля применяется к объектным подсказкам, свободный текст отображается напрямую. В single внешний `null` / `undefined` очищает текст; в multiple `[]` / `null` очищает выбор. `forceSelection` и пользовательские option-слоты не реализованы.

```ts
import { ref } from "vue";
import type { WlAutocompleteModel, WlSelectModel } from "gavia-ui";
interface Material { id: number; label: string; }
const options: readonly Material[] = [{ id: 1, label: "Дерево" }];
const selected = ref<WlSelectModel<Material, "id">>(null);
const suggested = ref<WlAutocompleteModel<Material>>(null);
const label = (item: Material | string) => typeof item === "string" ? item : item.label;
```

```vue
<WlSelect v-model="selected" :options="options" option-label="label" option-value="id" />
<WlAutocomplete v-model="suggested" :suggestions="options" :option-label="label" />
```

Явный generic не задаёт runtime-режим. Публичные экспорты требуют `optionValue` при явном типе резолвера, `multiple` при режиме, отличном от default false, и `selectionMode` для DatePicker range. Типовой facade ссылается на тот же компонент, без обёртки рендера; сохраняет контекст Vue, события, слоты и expose. Обычные шаблоны выводят generics из props.

### Таблица

`WlTable<Row>` принимает readonly-массив объектов. Интерфейсу строки
не нужна index signature. Слот `cell-<field>` получает `row: Row`
и `value: Row[field]`. Значение виртуальной колонки остаётся `unknown`:
проверьте его тип или используйте известные поля `row`.

```ts
import type { WlTableColumn } from "gavia-ui";
interface Material { id: number; label: string; }
const columns = [
  { key: "label", label: "Название" },
  { key: "actions", label: "Действия", kind: "virtual" }
] as const satisfies readonly WlTableColumn<Material, "actions">[];
```

WlTableColumn<Row> — поле строки либо явно помеченная виртуальная колонка. Второй generic ограничивает имена виртуальных колонок; обычные поля всегда проверяются по keyof Row. Компонент выводит Row из value, а колонки не расширяют его: опечатка не становится виртуальным полем. При типизированных строках замените широкий WlTableColumn[] на readonly WlTableColumn<MyRow>[] или satisfies. Для старых словарей WlTableRow ключи остаются широкими.

### Секции pt

`WlPt<"select">` и соответствующие типы остальных компонентов добавляют подсказки известных секций, сохраняя динамические расширения. Для проверки опечаток в именах и вложенных узлах используйте `WlPtStrict` / `WlPtConfigStrict` через `satisfies`.

```ts
import type { WlPtStrict } from "gavia-ui";
const selectPt = {
  root: { "aria-describedby": "material-help" },
  option: ({ context }) => ({ class: { selected: context.selected } })
} satisfies WlPtStrict<"select">;
```

`WlPtConfig` сохраняет открытые динамические записи и произвольные extension-значения; известные секции получают точные типы. Результат `createWlPt()` больше не обещает, что любой неизвестный ключ содержит дерево DOM-атрибутов: пользовательские расширения остаются unknown и требуют проверки при чтении.

Leaf-секция принимает атрибуты или функцию, возвращающую атрибуты. Вложенные `pcChip`, `pcInputText` и подобные узлы — объекты секций, не функции. Колбэк получает только `{ context }` с фактически переданными флагами; props и внутреннее состояние не предоставляются. `class` / `style` и порядок слияния не меняются. У tooltip директива применяет class/style и примитивные атрибуты; DOM-события и vnode hooks в её pt не подключаются, в отличие от секций Vue-компонентов.

### Связанные модели и навигация

`WlRadio<Value>` выводит домен из модели группы, а `value` должен ему соответствовать. Непереданная модель сохраняет `undefined`; update передаёт Value, не добавляя undefined к домену. `null` / `undefined` допустимы в update, если явно включены в Value. `WlSegmented<Value>` выводит домен из options и сохраняет `null` default; `WlTabs<Item>` выводит ключи из items и сохраняет пустой default `""`. Узкие модели учитывают эти исходные состояния.

`WlSidebarItem<Data>` / `WlCommandPaletteItem<Data>` и generics компонентов сохраняют данные и дополнительные поля item в select-событиях и слотах. Группы принимают readonly items, `keywords` также readonly. Sidebar связывает active key с Item["key"]; optional вход не добавляет undefined к update-событию ключа. Второй generic Sidebar/CommandPalette сохраняет дополнительные поля группы в событиях и слотах; обычное использование выводит их из groups. Старые поля key в Sidebar item/footer-item слотах сохранены. Бизнес-данные `unknown` проверяйте на входе приложения.

WlAccordion<Item> сохраняет дополнительные поля item в слоте, а openKeys принимает ключи items. WlMenu<Item> передаёт полный item в command. Для строгого callback используйте интерфейс, расширяющий WlMenuItem<MyItem>. Описания Menu, Accordion, Breadcrumbs, Steps, Calendar и палитры цветов принимают readonly-массивы.

Для refs используйте WlMenuExpose, WlPopoverExpose, WlFilePickerExpose, WlFilterBarExpose, WlSidebarExpose / WlCommandPaletteExpose с документированными методами. Generic SFC — callable-контракт; прежний `InstanceType<typeof Component>` может перестать подходить. Имена компонентов, DOM, CSS и runtime-сервисы остаются прежними.

### Нативные атрибуты, события и модели

Публичные type-only представления сохраняют исходные props, slots, events и методы ref. Они не создают runtime-обёртки и не превращают DOM-атрибуты в props. Текстовые поля принимают name/form/required/maxlength, textarea — также rows/cols/wrap. События ввода и клавиатуры получают Event/KeyboardEvent, а не значение модели. Kit size, value и checked остаются под контролем компонента. Class/style/data-атрибуты полей идут на оболочку, id/ARIA и listeners — на контрол. `WlFieldSlotProps` описывает связь подписи, подсказки и ошибки: связывайте inputId с id и ariaDescribedby с aria-describedby явно.

Select/MultiSelect — proxy-контролы: их атрибуты не обещают native required/readonly/text validation. name сохраняет существующую сериализацию: Select — строковое значение hidden input, MultiSelect — текст отображаемого выбора. Для отправки типизированных значений используйте v-model приложения. Атрибуты target/rel/download у NavItem допустимы вместе с href, когда он рендерит ссылку. FilePicker не обещает autofocus скрытого input; choose() вызывается из пользовательского действия. TimePicker сохраняет точность до минуты, поэтому native step не переопределяет 60 секунд.

Input/PasswordInput/Textarea поддерживают строковый `.trim`; query CommandPalette также допускает `.trim`. `.number` нарушает их string-контракт, а `.lazy` не реализован. Модели дат, выбора, массивов, чисел, файлов, boolean и ключей не поддерживают встроенные модификаторы. Используйте `WlTextModelModifiers` / `WlNoModelModifiers`, а преобразование доменных значений выполняйте в приложении. Неподдерживаемые варианты проверяются compile-only fixtures, включая реальные v-model в Vue.

### Локаль, сервисы и оверлеи

`WlLocaleInput` принимает частичную локаль с readonly names. Известные подписи имеют тип string, расширения приложения остаются unknown. `normalizeWlLocale()` игнорирует undefined и неверные известные значения, проверяет семь названий дней, двенадцать месяцев и firstDayOfWeek 0–6. Результат `WlResolvedLocale` содержит все известные поля; прежний минимальный `WlLocale` остаётся допустимым.

`useWlToast({ group: "editor" })` адресует сообщения соответствующему WlToast; clear() очищает только эту группу. Confirm принимает group в options; closeGroup(group) закрывает только соответствующий запрос. Прежний close() остаётся глобальным. У Drawer/Popover/Menu/Toast consumer class/style/data/ARIA явно передаются на существующий DOM-root внутри Teleport. FilterBar использует общий SSR-совместимый генератор id.

### Защита значений во время выполнения

Отключённые Select/MultiSelect/Autocomplete не меняют модель через открытый список, chip или отложенный complete. NumberInput/Pagination блокируют отложенный commit после отключения. FileUpload в single принимает один файл и отклоняет остальные с reason=count; недопустимая замена сохраняет прежний выбор. Компонент не удаляет файлы с диска и не загружает их в сеть.

Pagination нормализует номера/количество страниц до целых, окно siblings ограничено 100. NumberInput сохраняет ±Infinity как отсутствие границы, заменяет NaN и неверное направление бесконечной границы, а step ≤ 0 / nonfinite — на 1. Обратный диапазон схлопывается к minimum. Slider, Progress, StatCard и счётчик FilterBar не выводят NaN/Infinity в CSS/ARIA. TimePicker игнорирует неверные HH:mm bounds и сохраняет диапазон через полночь. Тип number сам по себе этих ограничений не гарантирует.

### Совместимость и миграция

Сужение unknown-моделей, callback label с поддержкой свободной строки, явные virtual columns, домены ключей, модификаторы и callable generics — изменения TypeScript-контракта. Они требуют отдельного minor в 0.x и отметки Breaking changes; включать их в patch как «только типы» нельзя.

Новые декларации используют встроенный NoInfer и требуют TypeScript 5.4 или новее ([официальные release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html#the-noinfer-utility-type)). Архив локально прошёл строгую компиляцию с Vue 3.4.0 + TypeScript 5.4.5 и Vue 3.5.40 + TypeScript 5.8.3: strictTemplates и TSX включены, skipLibCheck отключён. На Vue 3.5.40 проверены desktop/mobile и SSR-гидратация.

Замените `ref<unknown>(null)` на домен поля, например `ref<number | null>(null)`; MultiSelect — на `ref<number[]>([])`. Для изменения коллекций храните mutable-массив приложения отдельно от readonly-описания компонента. Не скрывайте ошибки приведением к `any`.

Снимок 0.9.1 и его потребитель сохраняются неизменными. Для перехода на 0.11 согласован отдельный контракт миграции: модель multiple Autocomplete, конкретные readonly-поля select-payload навигации, unknown-тип произвольных расширений createWlPt, обязательный selectionMode для range DatePicker и единственная замена Select ref<unknown> на ref<number | null> в копии примера. Gate сравнивает полный адаптированный контракт; исходные расхождения остаются в отчёте. Остальные props/events/slots/expose и весь CSS/exports/tokens/pt inventory проверяются без исключений. Generic-режимы сравниваются по соответствующим веткам, Table — в прежнем словарном домене WlTableRow. Разрешение ограничено baseline и версией 0.11, не распространяется на будущие выпуски. [Практические действия потребителя](migration-0.11.0.md).

## Темы и публичный DOM

Дизайн-система описана в [design-system.md](design-system.md). Её источник —
`tokens/source.json`; генератор проверяет ссылочную модель и контраст и создаёт
CSS, типизированный каталог и JSON. `src/design-system` содержит только данные
и чистые функции разрешения значений: DOM и Vue-состояние ему не нужны.
Необязательные CSS-примитивы типографики/компоновки импортируются явно.
Playground читает те же каталоги и манифест, сохраняя собственную ответственность
за демонстрационные сценарии. Бизнес-правила паттернов не входят в пакет.

Foundation → semantic → component — направление ссылок CSS-токенов. Все
переменные начинаются с `--wl-`. Слои `wl.reset`, `wl.tokens`, `wl.components`
сохраняют предсказуемый каскад. `wl-*` классы и `data-wl`, `data-size`,
`data-variant` являются частью контракта. Новое публичное имя требует
миграционной заметки.

`pt` настраивает атрибуты конкретных DOM-разделов. Для каждого раздела
порядок: `createWlPt()` → `WlConfig.pt` → `pt` экземпляра. `class` и `style`
объединяются, остальные атрибуты последнего уровня заменяют предыдущие.
Колбэк раздела получает `{ context }` с состоянием элемента. Оставшиеся имена
`pc*` сохранены для совместимости с прежними `pt`-настройками, хотя элементы
теперь создаёт Gavia UI.

Переходы оверлеев используют Vue `Transition`/`TransitionGroup` и токены
`--wl-dur-*`. `WlConfig.motion` задаёт общий режим для Vue-приложения,
локальный `motion` prop имеет приоритет; подсказка принимает тот же параметр
в объекте директивы. Анимация не должна менять модель, события открытия/закрытия,
стек фокуса или срок жизни сервисного сообщения. После закрытия элемент
удаляется из DOM; при `prefers-reduced-motion: reduce` длительность почти нулевая.
`utils/bodyScrollLock.ts` держит общий счётчик модальных блокировок и резервирует
место существующей полосы прокрутки; последний закрытый оверлей возвращает
исходные inline-стили страницы.

Разделы, имеющие стандартные значения в `createWlPt()`:

| Ключ конфигурации | Разделы |
| --- | --- |
| `checkbox` | `input`, `box`, `icon` |
| `radiobutton` | `input`, `box`, `icon` |
| `toggleswitch` | `input`, `slider`, `handle` |
| `select` | `label`, `clearIcon`, `dropdown`, `dropdownIcon`, `overlay`, `listContainer`, `list`, `option`, `optionLabel`, `emptyMessage` |
| `multiselect` | `labelContainer`, `label`, `clearIcon`, `chipItem`, `pcChip.root`, `pcChip.label`, `pcChip.removeIcon`, `dropdown`, `dropdownIcon`, `overlay`, `header`, `pcFilter.root`, `filterIcon`, `listContainer`, `list`, `option`, `optionLabel`, `emptyMessage` |
| `autocomplete` | `inputMultiple`, `chipItem`, `pcChip.root`, `pcChip.label`, `pcChip.removeIcon`, `input`, `inputChip`, `dropdown`, `dropdownIcon`, `overlay`, `listContainer`, `list`, `option`, `emptyMessage` |
| `card` | `header`, `body`, `caption`, `title`, `subtitle`, `content`, `footer` |
| `dialog` | `mask`, `header`, `title`, `headerActions`, `content`, `footer`, `pcCloseButton.root`, `pcCloseButton.icon` |
| `confirmdialog` | `mask`, `header`, `title`, `content`, `icon`, `message`, `footer` |
| `drawer` | `mask`, `header`, `title`, `content`, `footer`, `pcCloseButton.root`, `pcCloseButton.icon` |
| `progressbar` | `value`, `label` |
| `avatar` | `label`, `image` |
| `tag` | `label` |
| `divider` | `content` |
| `tablist`, `tabpanels`, `tabpanel` | `content`, `tabList`, `activeBar`; `root`; `root` |
| `tooltip` | `root`, `text`, `arrow` |
| `selectbutton` | `pcToggleButton.root`, `pcToggleButton.content` |
| `breadcrumb` | `list`, `item`, `separator` |
| `menu` | `list`, `submenuLabel`, `item`, `itemContent`, `itemLink`, `separator` |
| `popover` | `content` |
| `toast` | `message`, `messageContent`, `messageIcon`, `messageText`, `summary`, `detail`, `closeButton`, `closeIcon` |
| `datatable` | `table`, `thead`, `tbody`, `bodyRow`, `emptyMessage`, `emptyMessageCell`, `mask`, `loadingIcon` |
| `datepicker` | `pcInputText.root`, `startLabel`, `endLabel`, `endInput`, `rangeHint`, `dropdown`, `dropdownIcon`, `panel`, `calendarContainer`, `calendar`, `header`, `title`, `selectMonth`, `selectYear`, `pcPrevButton.root`, `pcPrevButton.icon`, `pcNextButton.root`, `pcNextButton.icon`, `dayView`, `monthView`, `month`, `yearView`, `year`, `tableHeaderCell`, `weekDay`, `dayCell`, `day` |

Разделы применяются там, где соответствующий DOM существует. Например,
`footer` диалога появляется при наличии слота `footer`. Исторические default-записи `clearIcon` у Select/MultiSelect сохранены для совместимости конфигурации, но эти DOM-секции компонентами сейчас не разрешаются и не входят в строгий тип секций.

## Проверка изменения

`@playwright/test` закреплён на `1.58.2`: Vitest проверяет контракт и логику,
а браузерные сценарии проверяют фокус, позиционирование оверлеев, мобильную
ширину, пять тем и всю партию иконок. `vue-tsc` в playground проверяет
потребительские шаблоны на этапе разработки.

В тестах jsdom пути для `node:fs` получайте через `fileURLToPath` и `URL`
из `node:url`. Глобальный `URL` в этом окружении принадлежит jsdom и не
принимается файловыми API Node 18; передавайте в них строковый путь.

`pnpm build`, `pnpm typecheck`, `pnpm test`, `pnpm build:playground`,
`pnpm run pack`, `pnpm verify:package`, `pnpm verify:dependencies`,
`pnpm icons:check`, `pnpm test:e2e`.
Дополнительно `pnpm tokens:check` проверяет пять тем и актуальность генерации.
`verify:package` устанавливает архив в изолированного потребителя с одним Vue,
проверяет типы и сборку, включая все копируемые SFC-примеры и рецепты из витрины.
Их источник общий с кодом для копирования, без отдельной копии разметки.
Браузерные тесты проверяют Chromium, Firefox, WebKit,
мобильный Chromium и снимки тем. Прохождение статической сборки не заменяет
проверку взаимодействия.

В чистом checkout сборка предшествует проверке типов и запуску браузеров:
playground использует публичные типы и точку входа пакета из `dist`.
В тестах демонстрационных запросов и прогресса устанавливайте Playwright Clock
перед сценарием и приостанавливайте его после загрузки примера. Время продвигайте
явно; отмена должна проверять и промежуточный прогресс, и отсутствие позднего
результата. Клик не должен соревноваться с коротким таймером загрузки.
Бюджет пакетной проверки витрины учитывает загрузку страницы и три действия
для каждого ленивого примера. Таймаут отдельных проверок состояния остаётся
5 секунд; добавление примеров увеличивает только общий бюджет пакета.

`pnpm test:visual` сравнивает PNG с принятыми эталонами в пяти темах на desktop/mobile;
эталоны и окружение Windows/Chromium описаны в `docs/design-system.md`.
Витрина разделяет обязанности: ComponentExplorer получает контракт и управляет
его применимыми props; SFC-пример содержит интеграцию компонента; RecipeGallery
выбирает сценарий; каждый рецепт владеет своим черновиком и демонстрационными
данными; CodePanel отвечает только за показ/копирование кода. Запросы и
бизнес-правила рецептов не попадают в runtime библиотеки.

Дополнительные проверки контрактов, архива, SSR, покрытия и размеров описаны в [quality.md](quality.md).
