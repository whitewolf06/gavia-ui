import { defineComponentManifest } from "./types";
import {
  WL_AVATAR_PRESENCES,
  WL_AVATAR_SIZES,
  WL_BADGE_VARIANTS,
  WL_ICON_NAMES,
  WL_PILL_VARIANTS,
  WL_PROGRESS_VARIANTS,
  WL_STAT_CARD_TONES,
  WL_TAG_VARIANTS
} from "./values";

export const dataManifest = /* @__PURE__ */ defineComponentManifest([
  {
    name: "WlTable",
    category: "data",
    description:
      "Таблица с колонками из columns. Scoped-слоты cell-* задают содержимое ячеек. Если columns не заданы, свою таблицу можно разместить в слоте default.",
    props: [
      { name: "value", type: "array", default: [], description: "Readonly-список Row extends object; поддерживаются интерфейсы без index signature." },
      {
        name: "columns",
        type: "array",
        description:
          "readonly WlTableColumn<Row>[] проверяет ключи полей строки. Для виртуальной колонки (actions) явно укажите kind: \"virtual\". Без columns используется default-слот."
      },
      { name: "loading", type: "boolean", default: false, description: "Состояние загрузки." },
      { name: "emptyMessage", type: "string", default: "Нет данных", description: "Текст пустого состояния." },
      { name: "pt", type: "object", description: "Атрибуты внутренних элементов Gavia UI." }
    ],
    slots: [
      { name: "default", description: "Своё содержимое таблицы, если columns не заданы." },
      { name: "empty", description: "Своё содержимое для пустой таблицы." },
      {
        name: "cell-<key>",
        description: "Scope { row: Row, value: Row[key] }; у виртуальной колонки value: unknown."
      }
    ],
    emits: []
  },
  {
    name: "WlPagination",
    category: "data",
    description: "Пагинация с номерами страниц и многоточиями. В режиме compact номер страницы вводится в поле.",
    props: [
      { name: "page", type: "number", default: 1, description: "Номер текущей страницы, начиная с 1." },
      { name: "pageCount", type: "number", required: true, description: "Всего страниц." },
      { name: "siblings", type: "number", default: 1, description: "Сколько страниц показывать вокруг текущей." },
      { name: "compact", type: "boolean", default: false, description: "Компактный вид с полем ввода." },
      { name: "disabled", type: "boolean", default: false, description: "Отключает навигацию." },
      { name: "pt", type: "object", description: "Атрибуты внутренних элементов Gavia UI." }
    ],
    slots: [],
    emits: [{ name: "update:page", payload: "number", description: "Новый номер страницы, начиная с 1." }]
  },
  {
    name: "WlBadge",
    category: "data",
    description: "Бейдж со значением или точкой.",
    props: [
      { name: "value", type: "union", description: "Значение: string | number." },
      { name: "variant", type: "enum", default: "accent", values: WL_BADGE_VARIANTS, description: "Цветовой вариант." },
      { name: "dot", type: "boolean", default: false, description: "Режим точки (value игнорируется)." },
      { name: "pt", type: "object", description: "Атрибуты внутренних элементов Gavia UI." }
    ],
    slots: [],
    emits: []
  },
  {
    name: "WlTag",
    category: "data",
    description: "Тег. Можно добавить кнопку удаления.",
    props: [
      { name: "variant", type: "enum", default: "gray", values: WL_TAG_VARIANTS, description: "Цветовой вариант." },
      { name: "removable", type: "boolean", default: false, description: "Показать кнопку удаления." },
      { name: "removeLabel", type: "string", default: "Удалить", description: "aria-label кнопки удаления." },
      { name: "pt", type: "object", description: "Атрибуты внутренних элементов Gavia UI." }
    ],
    slots: [{ name: "default", description: "Текст тега." }],
    emits: [{ name: "remove", payload: "MouseEvent", description: "Клик по кнопке удаления." }]
  },
  {
    name: "WlChip",
    category: "data",
    description: "Чип с переключением выбранного состояния. Можно добавить счётчик.",
    props: [
      { name: "active", type: "boolean", default: false, description: "Выбран ли чип." },
      { name: "count", type: "number", description: "Счётчик справа." },
      { name: "disabled", type: "boolean", default: false, description: "Отключает чип." }
    ],
    slots: [{ name: "default", description: "Текст чипа." }],
    emits: [
      { name: "click", payload: "MouseEvent", description: "Клик (не срабатывает при disabled)." },
      { name: "update:active", payload: "boolean", description: "Новое значение active после переключения; для v-model:active." }
    ]
  },
  {
    name: "WlPill",
    category: "data",
    description: "Компактная метка статуса.",
    props: [
      { name: "variant", type: "enum", default: "neutral", values: WL_PILL_VARIANTS, description: "Цветовой вариант." },
      { name: "label", type: "string", description: "Текст (если не задан слот)." }
    ],
    slots: [{ name: "default", description: "Свой текст вместо label." }],
    emits: []
  },
  {
    name: "WlAvatar",
    category: "data",
    description: "Аватар: инициалы (label) или image, с индикатором присутствия.",
    props: [
      { name: "label", type: "string", description: "Инициалы." },
      { name: "image", type: "string", description: "URL изображения." },
      { name: "size", type: "enum", default: 32, values: WL_AVATAR_SIZES, description: "Размер в px: 24 | 28 | 32 | 36 | 48." },
      { name: "presence", type: "enum", values: WL_AVATAR_PRESENCES, description: "Индикатор присутствия." },
      { name: "pt", type: "object", description: "Атрибуты внутренних элементов Gavia UI." }
    ],
    slots: [{ name: "default", description: "Своё содержимое вместо label/image." }],
    emits: []
  },
  {
    name: "WlStatCard",
    category: "data",
    description: "Карточка метрики с иконкой, подписью, значением и пояснением. Можно добавить прогресс-бар.",
    props: [
      { name: "icon", type: "icon", values: WL_ICON_NAMES, description: "Иконка в подписи." },
      { name: "label", type: "string", description: "Подпись метрики." },
      { name: "value", type: "string", description: "Значение (если не задан слот)." },
      { name: "description", type: "string", description: "Пояснение под значением." },
      { name: "progress", type: "number", description: "Прогресс от 0 до 100. Если задан, показывается индикатор." },
      { name: "tone", type: "enum", default: "accent", values: WL_STAT_CARD_TONES, description: "Тон акцента." }
    ],
    slots: [
      { name: "default", description: "Своё содержимое вместо value." },
      { name: "footer", description: "Подвал карточки." }
    ],
    emits: []
  },
  {
    name: "WlProgress",
    category: "data",
    description: "Линейный прогресс-бар от 0 до 100%.",
    props: [
      { name: "value", type: "number", default: 0, description: "Процент 0–100." },
      { name: "variant", type: "enum", default: "default", values: WL_PROGRESS_VARIANTS, description: "Цветовой вариант." },
      { name: "thin", type: "boolean", default: false, description: "Тонкая полоска." },
      { name: "showValue", type: "boolean", default: false, description: "Показывать процент." },
      { name: "pt", type: "object", description: "Атрибуты внутренних элементов Gavia UI." }
    ],
    slots: [],
    emits: []
  },
  {
    name: "WlSkeleton",
    category: "data",
    description: "Скелетон на время загрузки содержимого.",
    props: [
      { name: "width", type: "string", default: "100%", description: "Ширина (CSS)." },
      { name: "height", type: "string", default: "12px", description: "Высота (CSS)." },
      { name: "borderRadius", type: "string", description: "Радиус (CSS)." },
      {
        name: "shape",
        type: "enum",
        default: "rectangle",
        values: ["rectangle", "circle"],
        description: "Форма."
      },
      { name: "pt", type: "object", description: "Атрибуты внутренних элементов Gavia UI." }
    ],
    slots: [],
    emits: []
  },
  {
    name: "WlEmpty",
    category: "data",
    description: "Пустое состояние: иконка, заголовок, описание, действие.",
    props: [
      { name: "icon", type: "icon", values: WL_ICON_NAMES, description: "Иконка (если не задан слот icon)." },
      { name: "title", type: "string", description: "Заголовок." },
      { name: "description", type: "string", description: "Описание (если не задан слот)." }
    ],
    slots: [
      { name: "default", description: "Своё описание." },
      { name: "icon", description: "Своя иконка или иллюстрация." },
      { name: "action", description: "Кнопка или другое действие под описанием." }
    ],
    emits: []
  }
]);
