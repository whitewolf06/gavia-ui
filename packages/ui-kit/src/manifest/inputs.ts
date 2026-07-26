import { defineComponentManifest } from "./types";
import {
  WL_COLOR_PICKER_SIZES,
  WL_DENSITIES,
  WL_MULTISELECT_DISPLAYS,
  WL_SIZES_SM,
  WL_SWITCH_SIZES
} from "./values";

export const inputsManifest = defineComponentManifest([
  {
    name: "WlInput",
    category: "inputs",
    description: "Текстовое поле на PrimeVue InputText со слотами prefix/suffix.",
    props: [
      { name: "size", type: "enum", default: "md", values: WL_SIZES_SM, description: "Размер поля." },
      {
        name: "density",
        type: "enum",
        default: "default",
        values: WL_DENSITIES,
        description: "Плотность (compact уменьшает высоту)."
      },
      { name: "invalid", type: "boolean", default: false, description: "Состояние ошибки." },
      { name: "disabled", type: "boolean", default: false, description: "Отключает поле." },
      { name: "placeholder", type: "string", description: "Плейсхолдер." },
      { name: "type", type: "string", default: "text", description: "Нативный type инпута." },
      { name: "pt", type: "object", description: "PrimeVue pass-through." }
    ],
    slots: [
      { name: "prefix", description: "Содержимое слева внутри поля." },
      { name: "suffix", description: "Содержимое справа внутри поля." }
    ],
    emits: [],
    model: { name: "modelValue", type: "string", description: "Текст поля (default \"\")." }
  },
  {
    name: "WlPasswordInput",
    category: "inputs",
    description: "Поле пароля с кнопкой показать/скрыть.",
    props: [
      { name: "size", type: "enum", default: "md", values: WL_SIZES_SM, description: "Размер поля." },
      { name: "density", type: "enum", default: "default", values: WL_DENSITIES, description: "Плотность." },
      { name: "invalid", type: "boolean", default: false, description: "Состояние ошибки." },
      { name: "disabled", type: "boolean", default: false, description: "Отключает поле." },
      { name: "placeholder", type: "string", default: "Пароль", description: "Плейсхолдер." },
      { name: "ariaLabel", type: "string", description: "aria-label инпута." }
    ],
    slots: [],
    emits: [],
    model: { name: "modelValue", type: "string", description: "Значение пароля (default \"\")." }
  },
  {
    name: "WlNumberInput",
    category: "inputs",
    description: "Числовой степпер с кнопками +/- и вводом с клавиатуры (значение клампится в [min, max]).",
    props: [
      { name: "min", type: "number", default: 0, description: "Минимум." },
      { name: "max", type: "number", default: 99, description: "Максимум." },
      { name: "step", type: "number", default: 1, description: "Шаг степпера." },
      { name: "size", type: "enum", default: "md", values: WL_SIZES_SM, description: "Размер поля." },
      { name: "density", type: "enum", default: "default", values: WL_DENSITIES, description: "Плотность." },
      { name: "disabled", type: "boolean", default: false, description: "Отключает поле." },
      { name: "invalid", type: "boolean", default: false, description: "Состояние ошибки." },
      { name: "ariaLabel", type: "string", description: "aria-label инпута." }
    ],
    slots: [],
    emits: [],
    model: { name: "modelValue", type: "number", description: "Числовое значение (default 0)." }
  },
  {
    name: "WlTextarea",
    category: "inputs",
    description: "Многострочное поле на PrimeVue Textarea.",
    props: [
      { name: "invalid", type: "boolean", default: false, description: "Состояние ошибки." },
      { name: "disabled", type: "boolean", default: false, description: "Отключает поле." },
      { name: "rows", type: "number", default: 3, description: "Число строк." },
      { name: "autoResize", type: "boolean", default: false, description: "Автовысота по содержимому." },
      { name: "placeholder", type: "string", description: "Плейсхолдер." },
      { name: "pt", type: "object", description: "PrimeVue pass-through." }
    ],
    slots: [],
    emits: [],
    model: { name: "modelValue", type: "string", description: "Текст (default \"\")." }
  },
  {
    name: "WlSelect",
    category: "inputs",
    description: "Выпадающий список на PrimeVue Select.",
    props: [
      { name: "options", type: "array", default: [], description: "Опции (произвольные значения)." },
      {
        name: "optionLabel",
        type: "union",
        description: "Имя поля-подписи или функция (option) => string."
      },
      {
        name: "optionValue",
        type: "union",
        description: "Имя поля-значения или функция (option) => unknown."
      },
      { name: "placeholder", type: "string", description: "Плейсхолдер." },
      { name: "invalid", type: "boolean", default: false, description: "Состояние ошибки." },
      { name: "disabled", type: "boolean", default: false, description: "Отключает поле." },
      { name: "size", type: "enum", default: "md", values: WL_SIZES_SM, description: "Размер поля." },
      { name: "density", type: "enum", default: "default", values: WL_DENSITIES, description: "Плотность." },
      { name: "pt", type: "object", description: "PrimeVue pass-through." }
    ],
    slots: [],
    emits: [],
    model: { name: "modelValue", type: "unknown", description: "Выбранное значение (без default)." }
  },
  {
    name: "WlMultiSelect",
    category: "inputs",
    description:
      "Мультивыбор на PrimeVue MultiSelect: выбранные значения чипами или comma-строкой, фильтр в оверлее.",
    props: [
      { name: "options", type: "array", default: [], description: "Опции (произвольные значения)." },
      {
        name: "optionLabel",
        type: "union",
        description: "Имя поля-подписи или функция (option) => string."
      },
      {
        name: "optionValue",
        type: "union",
        description: "Имя поля-значения или функция (option) => unknown."
      },
      { name: "placeholder", type: "string", description: "Плейсхолдер." },
      { name: "invalid", type: "boolean", default: false, description: "Состояние ошибки." },
      { name: "disabled", type: "boolean", default: false, description: "Отключает поле." },
      { name: "size", type: "enum", default: "md", values: WL_SIZES_SM, description: "Размер поля." },
      { name: "density", type: "enum", default: "default", values: WL_DENSITIES, description: "Плотность." },
      { name: "filter", type: "boolean", default: false, description: "Строка фильтра в оверлее." },
      {
        name: "display",
        type: "enum",
        default: "comma",
        values: WL_MULTISELECT_DISPLAYS,
        description: "Представление выбранных: comma-строка или чипы."
      },
      {
        name: "maxSelectedLabels",
        type: "number",
        description: "Максимум подписей до свёртки в счётчик (только display=\"comma\")."
      },
      { name: "pt", type: "object", description: "PrimeVue pass-through." }
    ],
    slots: [],
    emits: [],
    model: { name: "modelValue", type: "unknown[]", description: "Выбранные значения (default [])." }
  },
  {
    name: "WlAutocomplete",
    category: "inputs",
    description:
      "Поле с подсказками на PrimeVue AutoComplete; список suggestions обновляется по событию complete.",
    props: [
      { name: "suggestions", type: "array", default: [], description: "Текущий список подсказок." },
      {
        name: "optionLabel",
        type: "union",
        description: "Имя поля-подписи или функция (option) => string."
      },
      { name: "placeholder", type: "string", description: "Плейсхолдер." },
      { name: "invalid", type: "boolean", default: false, description: "Состояние ошибки." },
      { name: "disabled", type: "boolean", default: false, description: "Отключает поле." },
      { name: "size", type: "enum", default: "md", values: WL_SIZES_SM, description: "Размер поля." },
      { name: "density", type: "enum", default: "default", values: WL_DENSITIES, description: "Плотность." },
      { name: "multiple", type: "boolean", default: false, description: "Множественный выбор (чипы)." },
      { name: "dropdown", type: "boolean", default: false, description: "Кнопка раскрытия списка." },
      {
        name: "minLength",
        type: "number",
        default: 1,
        description: "Минимум символов для запуска поиска."
      },
      { name: "pt", type: "object", description: "PrimeVue pass-through." }
    ],
    slots: [],
    emits: [
      {
        name: "complete",
        payload: "WlAutocompleteCompleteEvent",
        description: "Запуск поиска: { originalEvent, query } — обновите suggestions."
      }
    ],
    model: {
      name: "modelValue",
      type: "unknown",
      description: "Значение (в multiple — массив), без default."
    }
  },
  {
    name: "WlCheckbox",
    category: "inputs",
    description: "Чекбокс (binary) на PrimeVue Checkbox с подписью в слоте.",
    props: [
      { name: "disabled", type: "boolean", default: false, description: "Отключает чекбокс." },
      { name: "indeterminate", type: "boolean", default: false, description: "Промежуточное состояние." },
      { name: "invalid", type: "boolean", default: false, description: "Состояние ошибки." },
      { name: "pt", type: "object", description: "PrimeVue pass-through." }
    ],
    slots: [{ name: "default", description: "Подпись рядом с чекбоксом." }],
    emits: [],
    model: { name: "modelValue", type: "boolean", description: "Отмечен ли (default false)." }
  },
  {
    name: "WlRadio",
    category: "inputs",
    description: "Радиокнопка на PrimeVue RadioButton; value — значение опции, v-model — выбранное.",
    props: [
      { name: "value", type: "union", required: true, description: "Значение опции (произвольное)." },
      { name: "name", type: "string", description: "Нативный name группы." },
      { name: "disabled", type: "boolean", default: false, description: "Отключает радиокнопку." },
      { name: "invalid", type: "boolean", default: false, description: "Состояние ошибки." },
      { name: "pt", type: "object", description: "PrimeVue pass-through." }
    ],
    slots: [{ name: "default", description: "Подпись рядом с радиокнопкой." }],
    emits: [],
    model: { name: "modelValue", type: "unknown", description: "Выбранное value (без default)." }
  },
  {
    name: "WlSwitch",
    category: "inputs",
    description: "Переключатель на PrimeVue ToggleSwitch с подписью в слоте.",
    props: [
      { name: "size", type: "enum", default: "md", values: WL_SWITCH_SIZES, description: "Размер." },
      { name: "disabled", type: "boolean", default: false, description: "Отключает переключатель." },
      { name: "pt", type: "object", description: "PrimeVue pass-through." }
    ],
    slots: [{ name: "default", description: "Подпись рядом с переключателем." }],
    emits: [],
    model: { name: "modelValue", type: "boolean", description: "Включён ли (default false)." }
  },
  {
    name: "WlSlider",
    category: "inputs",
    description: "Нативный range-слайдер со стилизованной заливкой трека.",
    props: [
      { name: "min", type: "number", default: 0, description: "Минимум." },
      { name: "max", type: "number", default: 100, description: "Максимум." },
      { name: "step", type: "number", default: 1, description: "Шаг." },
      { name: "disabled", type: "boolean", default: false, description: "Отключает слайдер." },
      { name: "ariaLabel", type: "string", description: "aria-label." }
    ],
    slots: [],
    emits: [],
    model: { name: "modelValue", type: "number", description: "Значение (default 0)." }
  },
  {
    name: "WlDatePicker",
    category: "inputs",
    description:
      "Выбор даты на PrimeVue DatePicker; v-model — ISO-строка \"YYYY-MM-DD\" или null. Локаль задаёт конфигурация PrimeVue приложения.",
    props: [
      { name: "placeholder", type: "string", default: "дд.мм.гггг", description: "Плейсхолдер." },
      { name: "size", type: "enum", default: "md", values: WL_SIZES_SM, description: "Размер поля." },
      { name: "disabled", type: "boolean", default: false, description: "Отключает поле." },
      { name: "invalid", type: "boolean", default: false, description: "Состояние ошибки." },
      { name: "showIcon", type: "boolean", default: false, description: "Кнопка-иконка календаря." },
      { name: "minDate", type: "string", description: "Минимальная дата, ISO \"YYYY-MM-DD\"." },
      { name: "maxDate", type: "string", description: "Максимальная дата, ISO \"YYYY-MM-DD\"." },
      { name: "pt", type: "object", description: "PrimeVue pass-through." }
    ],
    slots: [],
    emits: [],
    model: { name: "modelValue", type: "string | null", description: "Дата ISO \"YYYY-MM-DD\" (default null)." }
  },
  {
    name: "WlCalendar",
    category: "inputs",
    description:
      "Месячный календарь с событиями. Дополнительно поддерживает v-model:month (\"YYYY-MM\") — отображаемый месяц.",
    props: [
      {
        name: "events",
        type: "array",
        default: [],
        description: "WlCalendarEvent[]: { date (ISO), label, tone?: \"blue\" | \"gray\" }."
      }
    ],
    slots: [],
    emits: [],
    model: { name: "modelValue", type: "string", description: "Выбранная дата ISO \"YYYY-MM-DD\" (default \"\")." }
  },
  {
    name: "WlColorPicker",
    category: "inputs",
    description: "Палитра свотчей + hex-инпут; значение нормализуется к lowercase #rrggbb.",
    props: [
      {
        name: "modelValue",
        type: "string",
        default: "",
        description: "Текущий цвет (#rgb/#rrggbb, нормализуется к #rrggbb)."
      },
      {
        name: "swatches",
        type: "array",
        default: [
          "#2563eb",
          "#2e9e68",
          "#bf8615",
          "#d2494f",
          "#f7f7f8",
          "#e7e7ea",
          "#dcdce1",
          "#b9bdc6",
          "#9aa0aa",
          "#5d626c",
          "#43474f",
          "#22252b"
        ],
        description: "Hex-цвета палитры."
      },
      { name: "size", type: "enum", default: "md", values: WL_COLOR_PICKER_SIZES, description: "Размер свотчей." }
    ],
    slots: [],
    emits: [
      { name: "update:modelValue", payload: "string", description: "Новый нормализованный цвет #rrggbb." }
    ],
    model: { name: "modelValue", type: "string", description: "Через modelValue + update:modelValue (default \"\")." }
  },
  {
    name: "WlFileUpload",
    category: "inputs",
    description:
      "Дропзона + выбор файлов; файлы НЕ загружаются на сервер — компонент хранит только список File[].",
    props: [
      { name: "accept", type: "string", description: "Фильтр типов (расширения/MIME, через запятую)." },
      { name: "multiple", type: "boolean", default: true, description: "Несколько файлов (иначе новый заменяет текущий)." },
      { name: "maxFiles", type: "number", description: "Лимит числа файлов." },
      { name: "maxSize", type: "number", description: "Максимальный размер файла, байты." },
      { name: "disabled", type: "boolean", default: false, description: "Отключает дропзону." }
    ],
    slots: [],
    emits: [
      {
        name: "reject",
        payload: "WlFileReject",
        description: "Файл отклонён: { file, reason: \"type\" | \"size\" | \"count\" }."
      }
    ],
    model: { name: "modelValue", type: "File[]", description: "Список выбранных файлов (default [])." }
  }
]);
