# Обновление до Gavia UI 0.11.0

Gavia UI 0.11.0 опубликован в npm. Уточнение TypeScript-контрактов может
потребовать изменения кода приложения. Перед обновлением проверьте модель,
обработчики и слоты по примерам ниже.

## Breaking changes: связанные модели и коллекции

Нужны Vue 3.4+ и TypeScript 5.4+: декларации используют встроенный NoInfer.
Классы, CSS-токены, пути тем и имена компонентов сохраняются. Стили по-прежнему
подключаются явно. Не скрывайте ошибки модели приведением к any.

### Select и MultiSelect

Прежде широкий ref<unknown> допускал значение неподходящего типа. Теперь
тип модели выводится из options и optionValue: без резолвера это весь объект,
с ключом — его поле, с функцией — результат функции. Модель не расширяет домен
options. Это проверка типа, а не наличия значения в загруженном списке.
Для очищенного Select используется null; MultiSelect хранит массив.

Было:

```ts
const selected = ref<unknown>(null);
```

Стало:

```vue
<script setup lang="ts">
import { ref } from "vue";
import { WlSelect, WlMultiSelect } from "gavia-ui";
import type { WlSelectModel, WlMultiSelectModel } from "gavia-ui";
interface Material { id: number; name: string; }
const options: readonly Material[] = [{ id: 1, name: "Материал" }];
const selected = ref<WlSelectModel<Material, "id">>(null);
const selectedMany = ref<WlMultiSelectModel<Material, "id">>([]);
</script>
<template>
  <WlSelect v-model="selected" :options="options" option-label="name" option-value="id" />
  <WlMultiSelect v-model="selectedMany" :options="options" option-label="name" option-value="id" />
</template>
```

Здесь selected имеет тип number | null, selectedMany — number[]. Обработчик
update:modelValue принимает тот же домен. Непереданная модель Select допустима;
если приложение отдельно использует undefined как начальное состояние, включите
его в собственный ref. MultiSelect сохраняет исходный default [].

### Autocomplete

Single допускает свободный текст: модель — Suggestion | string | null.
Multiple хранит Suggestion[] | null. При динамическом boolean multiple модель
должна охватывать оба режима. Поддержка forceSelection не добавлялась.

```ts
import { ref } from "vue";
import type { WlAutocompleteModel } from "gavia-ui";
interface Suggestion { id: number; name: string; }
const selected = ref<WlAutocompleteModel<Suggestion>>(null);
const selectedMany = ref<WlAutocompleteModel<Suggestion, true>>([]);
const selectedDynamic = ref<WlAutocompleteModel<Suggestion, boolean>>(null);
function label(value: Suggestion | string): string {
  return typeof value === "string" ? value : value.name;
}
```

В single callback optionLabel обязан обработать строку пользователя. Ключ
option-label="name" можно оставить: свободная строка отображается напрямую.
Для selectedMany передайте multiple в компонент. В single внешний null/undefined
очищает текст; в multiple []/null очищает выбор. Строковый ввод больше не теряется
при label-ключе.

### DatePicker: режим range

Раньше явный generic range допускал отсутствие selectionMode, хотя сам generic
не переключает компонент во время выполнения. Теперь для range обязателен
фактический prop. Для модели WlDateRange | null укажите режим явно:

```vue
<WlDatePicker v-model="range" selection-mode="range" />
```

Модель, обработчики и слоты DatePicker сохраняют свои типы. Без range компонент
по-прежнему использует single; явно заданный тип должен соответствовать режиму.

### Таблица

Обычная колонка должна указывать существующее строковое поле Row. Колонку действий
или вычисляемое поле пометьте kind: "virtual". Для конкретных строк замените
широкий WlTableColumn[] на WlTableColumn<MyRow>[] или satisfies.

```ts
import type { WlTableColumn } from "gavia-ui";
interface Material { id: number; name: string; }
const columns = [
  { key: "name", label: "Название" },
  { key: "actions", label: "Действия", kind: "virtual" }
] as const satisfies readonly WlTableColumn<Material, "actions">[];
```

WlTable выводит Row из value. В cell-name значение имеет тип string; в виртуальном
cell-actions значение остаётся unknown: используйте известные поля row или
проверяйте значение. Старый словарный WlTableRow сохраняет широкие строковые ключи.

### Навигация и события

Sidebar/CommandPalette сохраняют дополнительные поля item/data/group в событиях
и слотах. Описания групп принимают readonly items; keywords CommandPalette также
readonly. Menu/Accordion/Tabs/Radio/Segmented проверяют callbacks и модели по
домену данных. Опечатка в ключе или неподходящий обработчик теперь даёт ошибку типов.

При literal options модель Segmented должна хранить соответствующий union
значений плюс null, Tabs — union ключей плюс пустую строку для начального состояния.
Например, вместо ref<string | null> используйте ref<"list" | "grid" | null>;
для двух Tabs — ref<"overview" | "details" | "">.

Обработчик выбора не должен изменять group.items или item.keywords из payload.
Если нужно изменить список, храните состояние приложения отдельно или копируйте:

```ts
import type { WlCommandPaletteItem } from "gavia-ui";
function copyKeywords(item: WlCommandPaletteItem): string[] {
  return [...(item.keywords ?? [])];
}
```

Вместо group.items.sort(...) сортируйте [...group.items].sort(...).
Вместо item.keywords?.push("tag") создавайте [...(item.keywords ?? []), "tag"]
и обновляйте собственное состояние приложения.

Это не полный DeepReadonly: типы собственных data сохраняются. Readonly относится
к коллекциям описаний, которые компонент читает.

### Секции pt и расширения

Известные секции pt получили подсказки и реальные контексты. Динамические ключи
по-прежнему допустимы. createWlPt() возвращает unknown для произвольного расширения:
не обращайтесь к нему как к дереву DOM-атрибутов без проверки. Для собственных
метаданных удобнее сохранить типизированную переменную в приложении.

```ts
import { createWlPt } from "gavia-ui";
import type { WlPtStrict } from "gavia-ui";
const selectPt = {
  option: ({ context }) => ({ class: { selected: context.selected } })
} satisfies WlPtStrict<"select">;
const appMetadata = { feature: "editor" };
const pt = createWlPt({ select: selectPt, appMetadata });
// Типизированные метаданные приложения доступны через appMetadata.
```

WlPtStrict/WlPtConfigStrict — явная проверка через satisfies. Они не заменяют
открытую настройку по умолчанию. Вложенные pcChip/pcInputText — узлы, а не callbacks
всего дерева. Tooltip управляется директивой: его pt принимает DOM-атрибуты,
но не Vue listeners, vnode hooks, key/ref. Старые default clearIcon у Select и
MultiSelect сохранены; отдельных применяемых DOM-секций clearIcon нет.

### Модификаторы, DOM-атрибуты и refs

Input/PasswordInput/Textarea и query CommandPalette поддерживают .trim.
.number/.lazy для них не реализованы; модели выбора, дат, файлов, чисел, boolean
и ключей не поддерживают встроенные модификаторы. Преобразуйте доменные значения
в приложении и удалите неподдерживаемые модификаторы.

Нативные attrs/events соответствуют реальному контролу. Обработчики input/change
получают Event, клавиатуры — KeyboardEvent; значения модели приходят через
update:modelValue. Kit size/value/checked управляет компонент. Для Field явно
свяжите inputId с id и ariaDescribedby с aria-describedby.

DatePicker использует minDate/maxDate вместо native min/max; readonly ограничивает
текстовый ввод, а полный запрет выбора задаёт disabled. У TimePicker удалите step:
контрол использует 60 секунд. WlNavItem рендерит ссылку при непустом href; пустая
строка переключает его на кнопку, поэтому target/rel передавайте с непустой ссылкой.

Generic-компонент может быть callable вместо конструктора: InstanceType подходит
не каждому экспорту. Для императивных методов используйте публичный Expose-контракт:

```ts
import { ref } from "vue";
import type { WlSidebarExpose } from "gavia-ui";
const sidebar = ref<WlSidebarExpose | null>(null);
function showNavigation(): void { sidebar.value?.openMobile(); }
```

Аналогично доступны WlCommandPaletteExpose, WlMenuExpose, WlPopoverExpose,
WlFilePickerExpose и WlFilterBarExpose. Если generic задаётся явно, передайте
соответствующий фактический prop: resolver optionValue, multiple либо
selectionMode="range". Тип без соответствующего режима не меняет runtime.

## Исправления поведения

Disabled блокирует выбор через открытые списки/chips и отложенные обработчики.
Single FileUpload принимает один файл; отклонённая замена сохраняет прежний выбор.
NaN/Infinity и некорректные числовые границы нормализуются перед выводом CSS/ARIA.
Locale принимает частичные readonly-настройки, игнорируя неверные известные поля.
Teleport attrs передаются на существующий DOM-root; FilterBar использует SSR id.
Для групповых Toast/Confirm добавлены адресные helpers; прежний close() Confirm
остаётся глобальным. Эти изменения описаны в [changelog](../CHANGELOG.md).

## Проверка совместимости

Снимок API 0.9.1 и исходный Vue-потребитель сохраняются неизменными. Для подготовки
0.11 используется отдельный, ограниченный версиями контракт миграции: только
модель multiple Autocomplete, конкретные readonly-поля navigation select-payload,
произвольные расширения результата createWlPt, обязательный selectionMode для
range DatePicker и единственная правка Select ref.
Исходные расхождения остаются в отчёте. Адаптированный контракт проверяется целиком:
дополнительная потеря prop/event/slot/ref/CSS/токена останавливает gate.

Новые TS/Vue/TSX примеры проверяются отдельно против устанавливаемого архива на
Vue 3.4 / TypeScript 5.4 и Vue 3.5. Проверка типов не заменяет unit, SSR, browser
или визуальную проверку приложения. Локальные результаты и пределы проверок —
[качество и совместимость](quality.md#проверка-новых-публичных-контрактов).
