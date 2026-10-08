import { defineComponentManifest } from "./types";
import {
  WL_COLOR_PICKER_SIZES,
  WL_DENSITIES,
  WL_MULTISELECT_DISPLAYS,
  WL_SIZES_SM,
  WL_SWITCH_SIZES
} from "./values";

export const inputsManifest = /* @__PURE__ */ defineComponentManifest([
  {
    name: "WlTimePicker",
    category: "inputs",
    description: "Нативный выбор локального времени с точностью до минуты; без даты и часового пояса.",
    props: [
      { name: "minTime", type: "string", description: "Нижняя граница HH:mm; minTime > maxTime задаёт ночной диапазон." },
      { name: "maxTime", type: "string", description: "Верхняя граница HH:mm." },
      { name: "size", type: "enum", default: "md", values: WL_SIZES_SM, description: "Размер поля." },
      { name: "density", type: "enum", default: "default", values: WL_DENSITIES, description: "Плотность." },
      { name: "disabled", type: "boolean", default: false, description: "Отключает выбор." },
      { name: "invalid", type: "boolean", default: false, description: "Внешнее состояние ошибки." },
      { name: "pt", type: "object", description: "Атрибуты root и input." }
    ],
    slots: [],
    emits: [],
    model: { name: "modelValue", type: "string | null", description: "Время HH:mm или null (default null)." }
  },
  {
    name: "WlFilePicker",
    category: "inputs",
    description: "Открывает выбор файлов в браузере. Список файлов, проверку ограничений и отправку на сервер подключает приложение. Методы choose()/clear() доступны через ref.",
    props: [
      { name: "accept", type: "string", description: "Расширения или MIME-типы для окна выбора. Проверку файлов выполняет приложение." },
      { name: "multiple", type: "boolean", default: false, description: "Разрешает выбор нескольких файлов." },
      { name: "disabled", type: "boolean", default: false, description: "Отключает trigger и choose()." },
      { name: "chooseLabel", type: "string", default: "Выбрать файлы", description: "Подпись стандартной кнопки." },
      { name: "ariaLabel", type: "string", description: "Доступное имя стандартной кнопки." },
      { name: "size", type: "enum", default: "md", values: WL_SIZES_SM, description: "Размер кнопки." },
      { name: "density", type: "enum", default: "default", values: WL_DENSITIES, description: "Плотность кнопки." },
      { name: "pt", type: "object", description: "Атрибуты root, trigger и input." }
    ],
    slots: [{ name: "trigger", description: "Своя кнопка; параметры { choose, clear, disabled, attrs }. attrs связывает фокус и aria-атрибуты." }],
    emits: [
      { name: "select", payload: "File[]", description: "Файлы из текущего выбора, без изменений. Компонент не объединяет их с предыдущим списком." },
      { name: "cancel", description: "Выбор отменён. Список файлов в приложении не меняется." }
    ]
  },
  {
    name: "WlInput",
    category: "inputs",
    description: "Текстовое поле со слотами prefix/suffix.",
    props: [
      { name: "size", type: "enum", default: "md", values: WL_SIZES_SM, description: "Размер поля." },
      {
        name: "density",
        type: "enum",
        default: "default",
        values: WL_DENSITIES,
        description: "В режиме compact высота поля меньше."
      },
      { name: "invalid", type: "boolean", default: false, description: "Состояние ошибки." },
      { name: "disabled", type: "boolean", default: false, description: "Отключает поле." },
      { name: "placeholder", type: "string", description: "Плейсхолдер." },
      { name: "type", type: "string", default: "text", description: "Атрибут type элемента input." },
      { name: "pt", type: "object", description: "Атрибуты внутренних элементов Gavia UI." }
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
    description: "Числовое поле с кнопками +/− и вводом с клавиатуры. Значение остаётся в пределах [min, max].",
    props: [
      { name: "min", type: "number", default: 0, description: "Минимум." },
      { name: "max", type: "number", default: 99, description: "Максимум." },
      { name: "step", type: "number", default: 1, description: "Шаг изменения числа." },
      { name: "size", type: "enum", default: "md", values: WL_SIZES_SM, description: "Размер поля." },
      { name: "density", type: "enum", default: "default", values: WL_DENSITIES, description: "Плотность." },
      { name: "disabled", type: "boolean", default: false, description: "Отключает поле." },
      { name: "invalid", type: "boolean", default: false, description: "Состояние ошибки." },
      { name: "ariaLabel", type: "string", description: "aria-label инпута." },
      {
        name: "decrementLabel",
        type: "string",
        default: "Уменьшить",
        description: "Доступное имя кнопки уменьшения."
      },
      {
        name: "incrementLabel",
        type: "string",
        default: "Увеличить",
        description: "Доступное имя кнопки увеличения."
      }
    ],
    slots: [],
    emits: [],
    model: { name: "modelValue", type: "number", description: "Числовое значение (default 0)." }
  },
  {
    name: "WlTextarea",
    category: "inputs",
    description: "Многострочное поле. Высоту можно менять по содержимому через autoResize.",
    props: [
      { name: "invalid", type: "boolean", default: false, description: "Состояние ошибки." },
      { name: "disabled", type: "boolean", default: false, description: "Отключает поле." },
      { name: "rows", type: "number", default: 3, description: "Число строк." },
      { name: "autoResize", type: "boolean", default: false, description: "Подстраивает высоту под содержимое." },
      { name: "placeholder", type: "string", description: "Плейсхолдер." },
      { name: "pt", type: "object", description: "Атрибуты внутренних элементов Gavia UI." }
    ],
    slots: [],
    emits: [],
    model: { name: "modelValue", type: "string", description: "Текст (default \"\")." }
  },
  {
    name: "WlSelect",
    category: "inputs",
    description: "Выпадающий список с клавиатурной навигацией.",
    props: [
      { name: "options", type: "array", default: [], description: "Readonly-список TOption; тип модели определяется optionValue." },
      {
        name: "optionLabel",
        type: "union",
        description: "Имя поля-подписи или функция (option) => string."
      },
      {
        name: "optionValue",
        type: "union",
        description: "Ключ TOption или функция (option: TOption) => TValue; определяет тип модели."
      },
      { name: "placeholder", type: "string", description: "Плейсхолдер." },
      { name: "invalid", type: "boolean", default: false, description: "Состояние ошибки." },
      { name: "disabled", type: "boolean", default: false, description: "Отключает поле." },
      { name: "size", type: "enum", default: "md", values: WL_SIZES_SM, description: "Размер поля." },
      { name: "density", type: "enum", default: "default", values: WL_DENSITIES, description: "Плотность." },
      { name: "motion", type: "boolean", description: "Анимация списка; по умолчанию WlConfig.motion (true)." },
      { name: "pt", type: "object", description: "Атрибуты внутренних элементов Gavia UI." }
    ],
    slots: [],
    emits: [],
    model: { name: "modelValue", type: "TValue | null", description: "Выбранное значение по optionValue; без резолвера — TOption. Без default; можно не передавать модель." }
  },
  {
    name: "WlMultiSelect",
    category: "inputs",
    description:
      "Выбор нескольких значений. Выбранные значения показываются чипами или через запятую; в списке можно включить фильтр.",
    props: [
      { name: "options", type: "array", default: [], description: "Readonly-список TOption; тип выбранных значений определяется optionValue." },
      {
        name: "optionLabel",
        type: "union",
        description: "Имя поля-подписи или функция (option) => string."
      },
      {
        name: "optionValue",
        type: "union",
        description: "Ключ TOption или функция (option: TOption) => TValue; определяет тип массива модели."
      },
      { name: "placeholder", type: "string", description: "Плейсхолдер." },
      { name: "invalid", type: "boolean", default: false, description: "Состояние ошибки." },
      { name: "disabled", type: "boolean", default: false, description: "Отключает поле." },
      { name: "size", type: "enum", default: "md", values: WL_SIZES_SM, description: "Размер поля." },
      { name: "density", type: "enum", default: "default", values: WL_DENSITIES, description: "Плотность." },
      { name: "filter", type: "boolean", default: false, description: "Поле фильтра внутри списка." },
      {
        name: "display",
        type: "enum",
        default: "comma",
        values: WL_MULTISELECT_DISPLAYS,
        description: "comma — подписи через запятую, chip — отдельные чипы."
      },
      {
        name: "maxSelectedLabels",
        type: "number",
        description: "Сколько подписей показывать до замены счётчиком. Только для display=\"comma\"."
      },
      { name: "motion", type: "boolean", description: "Анимация списка; по умолчанию WlConfig.motion (true)." },
      { name: "pt", type: "object", description: "Атрибуты внутренних элементов Gavia UI." }
    ],
    slots: [],
    emits: [],
    model: { name: "modelValue", type: "TValue[]", description: "Массив значений по optionValue; без него — TOption[]. По умолчанию []." }
  },
  {
    name: "WlAutocomplete",
    category: "inputs",
    description:
      "Поле с подсказками; список suggestions обновляется по событию complete.",
    props: [
      { name: "suggestions", type: "array", default: [], description: "Readonly-список TOption; определяет тип выбранных подсказок." },
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
        name: "dropdownLabel",
        type: "string",
        default: "Показать варианты",
        description: "Доступное имя кнопки раскрытия списка."
      },
      {
        name: "minLength",
        type: "number",
        default: 1,
        description: "Минимум символов для запуска поиска."
      },
      { name: "motion", type: "boolean", description: "Анимация подсказок; по умолчанию WlConfig.motion (true)." },
      { name: "pt", type: "object", description: "Атрибуты внутренних элементов Gavia UI." }
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
      type: "TOption | string | null / TOption[] | null",
      description: "При одиночном выборе — подсказка или введённый текст. При multiple — массив подсказок. Значения по умолчанию нет."
    }
  },
  {
    name: "WlCheckbox",
    category: "inputs",
    description: "Чекбокс со значением boolean и подписью в слоте.",
    props: [
      { name: "disabled", type: "boolean", default: false, description: "Отключает чекбокс." },
      { name: "indeterminate", type: "boolean", default: false, description: "Промежуточное состояние." },
      { name: "invalid", type: "boolean", default: false, description: "Состояние ошибки." },
      { name: "pt", type: "object", description: "Атрибуты внутренних элементов Gavia UI." }
    ],
    slots: [{ name: "default", description: "Подпись рядом с чекбоксом." }],
    emits: [],
    model: { name: "modelValue", type: "boolean", description: "Отмечен ли (default false)." }
  },
  {
    name: "WlRadio",
    category: "inputs",
    description: "Радиокнопка; value — значение опции, v-model — выбранное.",
    props: [
      { name: "value", type: "union", required: true, description: "Значение опции (произвольное)." },
      { name: "name", type: "string", description: "Нативный name группы." },
      { name: "disabled", type: "boolean", default: false, description: "Отключает радиокнопку." },
      { name: "invalid", type: "boolean", default: false, description: "Состояние ошибки." },
      { name: "pt", type: "object", description: "Атрибуты внутренних элементов Gavia UI." }
    ],
    slots: [{ name: "default", description: "Подпись рядом с радиокнопкой." }],
    emits: [],
    model: { name: "modelValue", type: "TValue | undefined", description: "Модель группы задаёт тип value; nullable-модель задаётся потребителем. Без default." }
  },
  {
    name: "WlSwitch",
    category: "inputs",
    description: "Переключатель с подписью в слоте.",
    props: [
      { name: "size", type: "enum", default: "md", values: WL_SWITCH_SIZES, description: "Размер." },
      { name: "disabled", type: "boolean", default: false, description: "Отключает переключатель." },
      { name: "invalid", type: "boolean", default: false, description: "Состояние ошибки." },
      { name: "pt", type: "object", description: "Атрибуты внутренних элементов Gavia UI." }
    ],
    slots: [{ name: "default", description: "Подпись рядом с переключателем." }],
    emits: [],
    model: { name: "modelValue", type: "boolean", description: "Включён ли (default false)." }
  },
  {
    name: "WlSlider",
    category: "inputs",
    description: "Ползунок на input type=\"range\" с заполненной полосой до выбранного значения.",
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
      "Выбор даты или диапазона. В режиме single модель — ISO-строка/null, в range — [start, end|null]/null. Локаль задаётся через WlConfig.",
    props: [
      { name: "placeholder", type: "string", default: "дд.мм.гггг", description: "Плейсхолдер." },
      { name: "size", type: "enum", default: "md", values: WL_SIZES_SM, description: "Размер поля." },
      { name: "disabled", type: "boolean", default: false, description: "Отключает поле." },
      { name: "invalid", type: "boolean", default: false, description: "Состояние ошибки." },
      { name: "selectionMode", type: "enum", default: "single", values: ["single", "range"], description: "single: ISO-строка/null; range: [start, end|null]/null. Первый выбор задаёт начало, второй завершает и сортирует диапазон, следующий начинает новый." },
      { name: "startLabel", type: "string", default: "От", description: "Видимая подпись начала диапазона." },
      { name: "endLabel", type: "string", default: "До", description: "Видимая подпись конца диапазона." },
      { name: "showIcon", type: "boolean", default: false, description: "Кнопка-иконка календаря." },
      { name: "minDate", type: "string", description: "Минимальная дата в формате \"YYYY-MM-DD\". Пустое или неверное значение не ограничивает выбор." },
      { name: "maxDate", type: "string", description: "Максимальная дата в формате \"YYYY-MM-DD\". Пустое или неверное значение не ограничивает выбор." },
      { name: "displayFormat", type: "enum", default: "dd.mm.yyyy", values: ["dd.mm.yyyy", "yyyy-mm-dd"], description: "Формат отображения и ручного ввода; модель остаётся ISO." },
      { name: "motion", type: "boolean", description: "Анимация календаря; по умолчанию WlConfig.motion (true)." },
      { name: "pt", type: "object", description: "Атрибуты внутренних элементов Gavia UI." }
    ],
    slots: [],
    emits: [],
    model: { name: "modelValue", type: "string | null", description: "По умолчанию string|null; selectionMode=range: WlDateRange|null ([start: ISO, end: ISO|null]). Завершённый диапазон отсортирован, границы включены. Очистка начала → null; очистка конца → [start,null]." }
  },
  {
    name: "WlCalendar",
    category: "inputs",
    description:
      "Календарь на месяц с событиями. Отображаемый месяц задаётся через v-model:month (\"YYYY-MM\").",
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
    description: "Выбор цвета из палитры или по HEX-коду. Значение приводится к #rrggbb в нижнем регистре.",
    props: [
      {
        name: "modelValue",
        type: "string",
        default: "",
        description: "Текущий цвет: #rgb или #rrggbb. Приводится к #rrggbb."
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
      { name: "size", type: "enum", default: "md", values: WL_COLOR_PICKER_SIZES, description: "Размер образцов цвета." },
      { name: "disabled", type: "boolean", default: false, description: "Отключает палитру и ввод." },
      { name: "invalid", type: "boolean", default: false, description: "Внешнее состояние ошибки." },
      { name: "paletteLabel", type: "string", default: "Палитра", description: "Доступное имя списка цветов." },
      { name: "inputLabel", type: "string", default: "HEX-код цвета", description: "Доступное имя hex-поля." }
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
      "Дропзона и кнопка выбора файлов. Компонент хранит список File[]; отправку на сервер подключает приложение.",
    props: [
      { name: "accept", type: "string", description: "Фильтр типов (расширения/MIME, через запятую)." },
      { name: "multiple", type: "boolean", default: true, description: "Несколько файлов (иначе новый заменяет текущий)." },
      { name: "maxFiles", type: "number", description: "Лимит числа файлов." },
      { name: "maxSize", type: "number", description: "Максимальный размер файла, байты." },
      { name: "disabled", type: "boolean", default: false, description: "Отключает выбор и перетаскивание файлов." }
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
