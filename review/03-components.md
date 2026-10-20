# 03. Компоненты: аудит гибкости и полноты

[← к оглавлению](README.md)

Я прошёл все 53 SFC в `packages/ui-kit/src/components`: props, слоты, события, expose, разметку и ARIA.
Ниже три части:
1. Сквозные проблемы, которые касаются многих компонентов сразу. Это самое ценное: одно решение закрывает десяток мест.
2. Таблица по каждому компоненту.
3. Подробности по ключевым компонентам.

Про новые компоненты — в [04-new-components.md](04-new-components.md). Про доступность в деталях — в [06-accessibility.md](06-accessibility.md).

Легенда приоритетов (общая для всего отчёта):
- **P0** — дефект или дешёвое улучшение с большим эффектом, делать первым.
- **P1** — важно до 1.0.
- **P2** — заметное улучшение, после P1.
- **P3** — по желанию.

Трудозатраты: **S** — до 2 часов, **M** — от полудня до 2 дней, **L** — 3 дня и больше.

---

## 1. Сквозные проблемы

### CMP-1. Шесть разных словарей для «статуса» · P1 · M (breaking → алиасы)

Каждый компонент называет одни и те же смысловые состояния по-своему:

| Где | Значения |
|---|---|
| `WlAlert.variant` | `info` `ok` `warn` `err` |
| `WlPill.variant` | `neutral` `info` `ok` `warn` `err` |
| `WlBadge.variant` | `gray` `accent` `success` `warn` `danger` |
| `WlTag.variant` | `gray` `blue` `green` `amber` `red` |
| Toast severity (store) | `success` `info` `warn` `error` |
| `useWlToast()` | `ok()` `info()` `warn()` `err()` |
| `WlStatCard.tone` | свой набор |
| `WlButton.variant` | `danger`, `danger-quiet`, `soft-danger` |

Пользователь не может запомнить API, а в документации это выглядит как отсутствие системы.

**Решение.**
- Ввести один тип `WlTone = "neutral" | "accent" | "info" | "success" | "warning" | "danger"` и использовать его для смысла во всех статусных компонентах.
- Цветовые варианты `Tag` (`blue`, `green`…) оставить отдельным prop `color`, потому что это не статус.
- В 0.x принимать старые значения как алиасы с dev-предупреждением (`console.warn` только в `import.meta.env.DEV`).
- В 1.0 удалить старые значения.
- В Button свести `danger-quiet` и `soft-danger` к одной схеме, например `variant="soft"` + `tone="danger"`.

### CMP-2. Нет интеграции с роутером · P1 · M

- У `WlBreadcrumbs` есть поле `to`, но оно рендерится как `<a href="...">`. С vue-router это полная перезагрузка страницы.
- `WlNavItem`, `WlSidebar` и `WlCommandPalette` знают только `href`.
- У пунктов `WlMenu` нет ни `href`, ни `to`, только `command`.

Для SPA это первое, обо что спотыкается пользователь.

**Решение (без зависимости от vue-router):**
- `WlConfig.linkComponent?: Component` — например, `RouterLink`, который передаёт приложение.
- Внутренний `WlLink` (см. [NEW-3](04-new-components.md#new-3-wllink--s)): рендерит `linkComponent` с `to`, если он задан, иначе `<a href>`, а для внешних ссылок — `<a target rel>`.
- Все навигационные компоненты используют `WlLink`.
- Поле `to` в типах становится `unknown` / `RouteLocationRaw`-совместимым через generic, `href` остаётся.

### CMP-3. Контракт «у всех компонентов есть variant/size/density/pt» не соблюдается · P1 · S (документация) / M (код)

В README и `agents.md` сказано, что все компоненты разделяют `variant`, `size`, `density`, `pt`. Фактически:
- **без `pt` (22):** Accordion, Alert, ButtonGroup, Calendar, Chip, ColorPicker, CommandPalette, Empty, Field, FileUpload, FilterBar, Icon, NavItem, NumberInput, PageHeader, PasswordInput, Pill, Sidebar, Slider, Spinner, StatCard, Steps;
- **без `size` (36)** и **без `density` (40)**. Для части компонентов это нормально (Divider, Skeleton), но у NumberInput и PasswordInput есть `size`, а у Textarea — нет, у DatePicker нет `density`, у Checkbox, Radio и Switch нет `size`. Значит, формы с `size="sm"` не собрать однородно.

**Решение:**
- Описать в `architecture.md`, какие оси обязательны для какой категории компонентов. Пример: «поля ввода: `size` + `density` + `invalid` + `disabled` + `pt`; статусные: `tone`; контейнеры: `pt`».
- Закрыть пробелы: Textarea `size`; Checkbox/Radio/Switch `size: sm|md`; DatePicker `density`; `pt` у Field, NumberInput, PasswordInput, Slider, Accordion, Alert, CommandPalette, Sidebar, FileUpload.
- Добавить контрактный тест: «каждый компонент категории inputs объявляет `size`, `density`, `pt`». Манифест для этого уже есть.

### CMP-4. Русские строки зашиты в дефолты props · P1 · M (breaking → 1.0)

13 компонентов содержат русские дефолты прямо в `withDefaults` (Alert, Autocomplete, ColorPicker, CommandPalette, DatePicker, FilePicker, FilterBar, NumberInput, PasswordInput, Sidebar, Spinner, Table, Tag):
- `emptyMessage: "Нет данных"`;
- `placeholder: "дд.мм.гггг"`;
- `closeLabel: "Закрыть"`;
- `chooseLabel: "Выбрать файлы"`;
- `ariaLabel: "Фильтры"`;
- и так далее.

Чтобы эти дефолты не перекрывали `wlLocaleEn`, сделан обходной `useWlLocaleText()`, который читает сырые `instance.vnode.props` и угадывает, передал ли пользователь prop.

Чем это плохо:
- В типах и автодокументации дефолтом значится русская строка.
- Логика хрупкая: kebab/camel, `v-bind="obj"`.
- Нельзя поставить английский как fallback библиотеки.

**Решение (1.0):**
- Дефолт `undefined`, текст всегда берётся из locale: `props.x ?? locale.value.x`.
- `useWlLocaleText` удалить.
- Fallback-локаль библиотеки — английская. Русская подключается как `wlLocaleRu` (она уже есть).

### CMP-5. Разные API у похожих компонентов · P1 · S–M

| | `WlDialog` | `WlDrawer` |
|---|---|---|
| `dismissable` по умолчанию | `false` | `true` |
| `closable` | есть | нет (крестик всегда, если есть header) |
| ширина | `width` | нет (только CSS) |
| `afterLeave` | есть | нет |

Похожая история:
- у `WlPopover` и `WlMenu` есть `show/hide/toggle` через expose, а у Select нет `open/close`;
- `WlChip` использует `active` + `update:active` без `defineModel`, а Tabs и Segmented — `v-model`.

**Решение:** таблица «семейств» в `architecture.md` (оверлеи, поля, переключатели) с обязательным общим набором props, событий и expose. Привести Drawer к Dialog. Добавить контрактный тест на семейство.

### CMP-6. Нет кастомизации через слоты у списковых компонентов · P1 · M

`WlSelect`, `WlMultiSelect` и `WlAutocomplete` объявляют `defineSlots<{}>()` — слотов нет совсем. Значит, нельзя:
- нарисовать опцию с аватаром, иконкой или подписью;
- нарисовать выбранное значение по-своему;
- задать своё пустое состояние или футер («Создать новый…»).

Это самый частый запрос к любой UI-библиотеке. `WlCommandPalette` уже делает это правильно: `item`, `item-icon`, `group`, `empty`, `footer`. Нужно перенести тот же набор: `option`, `value`, `empty`, `header`, `footer`, `chip` (MultiSelect).

### CMP-7. Остатки PrimeVue в коде и API · P2 · S

- `WlPagination`: на `<nav>` висит `@update:first="onFirst"`. Это обработчик события PrimeVue Paginator на нативном элементе, мёртвый код. Там же есть `changePageCallback = onFirst`.
- Имена pt-секций: `pcCloseButton.root`, `pcChip.removeIcon`, `pcToggleButton.content`, `datatable`, `inputtext`, `toggleswitch`, `selectbutton`, `paginator`. Пользователь Gavia не знает, что такое «pc» и почему Segmented называется `selectbutton`.
- `WlIconButton` использует pt-ключ `button`, тот же, что `WlButton` (`useWlPt("button", …)` в обоих). Настройка `WlConfig.pt.button` неожиданно меняет и иконочные кнопки.
- `dismissable` — орфография PrimeVue (по-английски правильно `dismissible`).
- `tests/setup.ts` объясняет моки через PrimeVue.

**Решение:** почистить мёртвый код сейчас. Имена pt-секций и `dismissable` нормализовать к 1.0: старые ключи принимать как алиасы ещё один минорный цикл.

### CMP-8. Нет `rowKey` / `itemKey` и ключей по данным · P1 · S

`WlTable` (строки), `WlSelect`/`WlMultiSelect` (опции), `WlBreadcrumbs`, `WlSteps` и `WlPagination` используют `:key="index"`. Для таблицы со слотами (инпуты, чекбоксы в ячейках) это реальный баг: при удалении или сортировке строк состояние «переезжает» на соседнюю строку.

**Решение:** `rowKey?: keyof Row | ((row: Row) => PropertyKey)` у Table и `optionKey` у списков. Без ключа — как сейчас.

### CMP-9. Повторяющаяся «защитная» математика · P2 · S

Паттерн `Number.isFinite(x) ? Math.min(Math.max(...)) : fallback` скопирован в 7 компонентов: NumberInput (7 раз), Slider (6), Pagination (4), FileUpload, Progress, StatCard, FilterBar. Его нужно вынести в `utils/number.ts` (`clamp`, `finiteOr`, `toPercent`) — см. [UTIL-6](05-composables-and-utils.md).

---

## 2. Таблица по компонентам

Колонки:
- «Гибкость» — насколько компонент подстраивается без форка (слоты, pt, props);
- «Пробелы» — чего не хватает для типовых сценариев;
- «Дефекты» — то, что работает неправильно.

### Actions

| Компонент | Гибкость | Пробелы | Дефекты |
|---|---|---|---|
| WlButton | хорошая: 8 вариантов, 4 размера, loading, block, `icon`-слот, pt | `as`/`href` (кнопка-ссылка), `iconPosition: end`, `tone` | — |
| WlButtonGroup | минимальная | `size`/`variant` для детей через provide, `attached` | — |
| WlIconButton | средняя | `tone`, `loading`, `href` | **`ariaLabel` необязателен** — кнопка из одной иконки без имени (A11Y-5); `active` без `aria-pressed`; `count` без доступного текста |
| WlMenu | хорошая: generic items, expose, `command` | **подменю**, `href`/`to` у пунктов, чекбокс/радио-пункты, `placement`/`align` | — |
| WlNavItem | средняя | `to` (роутер), слоты `icon`/`badge` | — |
| WlSegmented | средняя | стрелочная навигация (roving tabindex), `size`, `block` | `role="group"` + `aria-pressed` допустимо, но APG рекомендует radiogroup или roving |

### Inputs

| Компонент | Гибкость | Пробелы | Дефекты |
|---|---|---|---|
| WlInput | хорошая: prefix/suffix, модификаторы, pt | `clearable`, `loading`, счётчик символов | — |
| WlTextarea | средняя: `autoResize` | `size`, `density`, `maxRows`, счётчик `maxlength` | — |
| WlPasswordInput | средняя | `size` есть, нет `pt`; индикатор силы (опционально); `autocomplete` по умолчанию `current-password`/`new-password` | — |
| WlNumberInput | средняя | **форматирование по locale** (разделители, валюта, `Intl.NumberFormat`), `precision`, prefix/suffix, `pt` | — |
| WlSelect | **слабая**: нет слотов | слоты (CMP-6), `clearable`, disabled-опции, группы, `loading`, `filter`, `open/close` в expose, typeahead | **нет `aria-activedescendant`** (A11Y-1), **нет прокрутки к активной опции** (A11Y-2), двойной `choose` (mousedown + click), `:key="index"` |
| WlMultiSelect | средняя: `filter`, `display: chip/comma` | слоты, «выбрать всё», disabled-опции, группы | A11Y-1, A11Y-2; сводка «{count} выбрано» без плюрализации (UTIL-1) |
| WlAutocomplete | средняя: free text, multiple, dropdown | слоты, debounce `complete` (сейчас на совести пользователя), `loading`, объявление числа результатов (A11Y-7) | A11Y-1, A11Y-2 |
| WlCheckbox | средняя | **группа с массивом** (`value` + `v-model: T[]`), `size` | — |
| WlRadio | средняя: generic `value` | **WlRadioGroup** (options, legend, orientation), `size` | группировку и подпись группы делает пользователь сам |
| WlSwitch | хорошая | `labelPosition`, `loading` | — |
| WlSlider | слабая | **диапазон (два бегунка)**, метки и деления, вывод значения, `aria-valuetext`, `size`, `pt` | — |
| WlDatePicker | хорошая: single/range, min/max, клавиатура | форматы через `Intl` (сейчас 2 жёстких формата), `disabledDates`, пресеты диапазонов, datetime | дефолты RU (CMP-4) |
| WlTimePicker | минимальная: нативный `<input type=time>` | шаг (секунды фиксированы `step=60`), 12/24 ч, интервалы | — |
| WlCalendar | средняя: события | слот дня, multiple-select, `pt` | — |
| WlColorPicker | средняя | альфа-канал, свой цвет (HSV), `pt` | — |
| WlFilePicker | хорошая: слот `trigger` с `choose/clear` | — | — |
| WlFileUpload | средняя | слот строки файла, прогресс по файлу (статус передаёт пользователь), превью изображений, `pt` | размеры в `humanSize` считаются вручную, а не через `Intl.NumberFormat` (UTIL-2) |

### Data

| Компонент | Гибкость | Пробелы | Дефекты |
|---|---|---|---|
| WlTable | средняя: слоты ячеек с типами | **`rowKey`**, сортировка, выбор строк, sticky header, `caption`/`aria-label`, слот заголовка колонки, `rowClass`, выравнивание, пустое и loading-состояния через слоты (empty есть) | `:key="rowIndex"` (CMP-8) |
| WlPagination | хорошая: siblings, compact | выбор размера страницы, «показано 1–20 из 340» | мёртвый `@update:first` (CMP-7) |
| WlAvatar | средняя | **fallback при ошибке загрузки изображения**, автоинициалы из имени (UTIL-4), `shape: square`, группа аватаров | presence скрыт от скринридера (`aria-hidden`), статус не озвучивается |
| WlBadge | слабая | слот, `max` («99+»), доступная подпись для `dot` | — |
| WlChip | средняя | `v-model:active`, `removable`, `size`, `pt` | — |
| WlTag | средняя | `icon`, `size`, `color` vs `tone` (CMP-1) | — |
| WlPill | слабая | `tone`, `pt`, `dot` | — |
| WlProgress | средняя | **indeterminate**, `max`, доступная подпись (`aria-label` / `aria-labelledby` в props) | — |
| WlSkeleton | хорошая | готовые пресеты (text, avatar) — опционально | — |
| WlStatCard | средняя | тренд/дельта (+12%), `value: number` с форматированием | — |
| WlEmpty | хорошая | — | — |

### Containers

| Компонент | Гибкость | Пробелы | Дефекты |
|---|---|---|---|
| WlCard | хорошая: header/title/subtitle/footer, pt | `as`, кликабельная карточка-ссылка, `padding`/`variant` (outlined/elevated) | — |
| WlAccordion | средняя | слот заголовка (сейчас только текст `item.title`), иконка, `defaultOpenKeys`, `pt` | — |
| WlDialog | хорошая | `size` пресеты (sm/md/lg/full), `fullscreen` на мобильных, `initialFocus` prop (есть внутри lifecycle, но не выведен) | фон не `inert` (A11Y-6) |
| WlDrawer | средняя | `closable`, `size`/`width`, `afterLeave` (CMP-5) | A11Y-6 |
| WlPopover | средняя | **`placement` / `align`** (сейчас только снизу/сверху от левого края якоря), стрелка, триггер по hover/focus | — |
| WlTabs | средняя | вертикальная ориентация, disabled-вкладки, `lazy`/`keepAlive` панелей, вкладки-ссылки | **ID не уникальны**: `id="wl-tab-${item.key}"` — две группы табов с ключом `general` на одной странице дают дубли ID и неверный `aria-labelledby` (A11Y-3); у таба нет `aria-controls`, у панели нет `id`; `watchEffect` сам пишет модель на монтировании |
| WlDivider | средняя | вертикальная ориентация | — |

### Composites

| Компонент | Гибкость | Пробелы | Дефекты |
|---|---|---|---|
| WlCommandPalette | **отличная**: generic, слоты, loading, shortcut | `pt` | — (эталон для остальных списков) |
| WlFilterBar | отличная: expose, слоты со scoped API | `pt` | — |
| WlPageHeader | хорошая: 6 слотов, `headingLevel` | `pt` | — |
| WlSidebar | хорошая: группы, pin, collapse, mobile | `to` (CMP-2), `pt` | — |

### Navigation / Feedback / Misc

| Компонент | Гибкость | Пробелы | Дефекты |
|---|---|---|---|
| WlBreadcrumbs | слабая | слот пункта, разделитель, сворачивание длинных цепочек | `to` рендерится как `href` (CMP-2) |
| WlSteps | слабая | описание шага, ошибка, кликабельные шаги, вертикальная ориентация | разметка из `div`/`span`, а не `ol` (A11Y-8) |
| WlAlert | средняя | слот иконки, `tone`, `live` | **`role="alert"` всегда**: даже статичный info-блок озвучивается ассертивно при рендере (A11Y-4) |
| WlToast + `useWlToast` | **слабая** | **`life` нельзя задать из `useWlToast`** (жёстко 2200 мс), нет sticky, action-кнопки, позиции, паузы при наведении, возврата `id` для `update`/`dismiss`, лимита очереди, promise-тостов | 2.2 с слишком мало для чтения (WCAG 2.2.1); ошибки объявляются `polite`, должны — `assertive` (A11Y-9) |
| WlConfirmDialog + `useWlConfirm` | средняя | **Promise API** (`await confirm()` → `boolean`), кастомный контент через слот, `danger` как `tone` | — |
| WlSpinner | хорошая | — | — |
| WlField | средняя | **`labelId` в слоте** (чтобы Select/Autocomplete на `div` получали имя от метки, A11Y-5), подсказка **и** ошибка одновременно, метка «необязательно», горизонтальная раскладка, слот метки | ошибка с `role="alert"` при первом рендере уже показанной ошибки «кричит» |
| WlIcon | средняя | регистрация своих иконок (`WlConfig.icons`), `title` для смысловых иконок | — |

---

## 3. Подробнее по ключевым

### Select / MultiSelect / Autocomplete — главный кандидат на доработку (P0–P1)

Порядок работ:
1. **P0, S:** вынести навигацию в `useWlListbox`. Его задачи:
   - `id` для каждой опции (`${listId}-opt-${index}`);
   - `aria-activedescendant` на combobox;
   - `scrollIntoView({ block: "nearest" })` при смене активной опции;
   - убрать двойной вызов `choose` (оставить `@mousedown.prevent` + `@click`, а не оба `choose`).
2. **P1, M:** typeahead — набор символов переходит к опции; сброс через 500 мс.
3. **P1, M:** disabled-опции (`optionDisabled` по аналогии с `optionLabel`) с пропуском при навигации.
4. **P1, M:** слоты (CMP-6) и `clearable`.
5. **P2, M:** группы (`optionGroupLabel` / `optionGroupChildren`) и `loading`.
6. **P2, L:** виртуализация длинных списков через `WlVirtualList` ([NEW-8](04-new-components.md)).

### Table (P1)

Минимум до 1.0: `rowKey`, `caption` / `ariaLabel`, слот `header-${key}`, `align`, `sortable` в колонке + `v-model:sort` (сортирует пользователь или встроенный компаратор), выбор строк `v-model:selection` с чекбоксами.

Не стоит превращать Table в монстра. Можно оставить `WlTable` простой, а функции данных собрать в отдельном `WlDataTable` (см. [NEW-7](04-new-components.md)).

### Toast (P1)

Предлагаемый API:

```ts
const toast = useWlToast();
const id = toast.success("Сохранено", { detail, life: 5000, action: { label: "Отменить", onClick } });
toast.update(id, { ... });
toast.dismiss(id);
toast.promise(save(), { loading: "Сохраняю…", success: "Готово", error: (e) => e.message });
```

Ещё нужно:
- `WlToast` с `position` и `max`;
- пауза таймера на hover и focus;
- `role="status"` для обычных сообщений и `role="alert"` для ошибок;
- дефолтное время жизни ≥ 5 с и `life: 0` для sticky.

Старые `ok/err` оставить алиасами.

### Confirm (P2)

```ts
if (await confirm({ message, tone: "danger" })) { ... }
```

Callback-API (`accept`/`reject`) оставить. Promise-обёртка — это 10 строк.
