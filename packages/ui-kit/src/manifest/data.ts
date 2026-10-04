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

export const dataManifest = defineComponentManifest([
  {
    name: "WlTable",
    category: "data",
    description:
      "Таблица: декларативные columns и scoped-слоты cell-*; без columns default-слот для собственной таблицы.",
    props: [
      { name: "value", type: "array", default: [], description: "Строки WlTableRow[] (Record<string, unknown>)." },
      {
        name: "columns",
        type: "array",
        description:
          "WlTableColumn[]: { key, label, numeric?, width? }. Если не заданы — рендерится default-слот."
      },
      { name: "loading", type: "boolean", default: false, description: "Состояние загрузки." },
      { name: "emptyMessage", type: "string", default: "Нет данных", description: "Текст пустого состояния." },
      { name: "pt", type: "object", description: "Атрибуты внутренних элементов Gavia UI." }
    ],
    slots: [
      { name: "default", description: "Кастомное содержимое таблицы, когда columns не заданы." },
      { name: "empty", description: "Кастомное пустое состояние." },
      {
        name: "cell-<key>",
        description: "Ячейка колонки key; scope: { row, value }."
      }
    ],
    emits: []
  },
  {
    name: "WlPagination",
    category: "data",
    description: "Пагинация с окном страниц и многоточиями; compact-режим — поле ввода номера страницы.",
    props: [
      { name: "page", type: "number", default: 1, description: "Текущая страница (1-based)." },
      { name: "pageCount", type: "number", required: true, description: "Всего страниц." },
      { name: "siblings", type: "number", default: 1, description: "Сколько страниц показывать вокруг текущей." },
      { name: "compact", type: "boolean", default: false, description: "Компактный вид с полем ввода." },
      { name: "disabled", type: "boolean", default: false, description: "Отключает навигацию." },
      { name: "pt", type: "object", description: "Атрибуты внутренних элементов Gavia UI." }
    ],
    slots: [],
    emits: [{ name: "update:page", payload: "number", description: "Смена страницы (1-based)." }]
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
    description: "Тег с опциональной кнопкой удаления.",
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
    description: "Чип-переключатель (кнопка) с опциональным счётчиком.",
    props: [
      { name: "active", type: "boolean", default: false, description: "Выбран ли чип." },
      { name: "count", type: "number", description: "Счётчик справа." },
      { name: "disabled", type: "boolean", default: false, description: "Отключает чип." }
    ],
    slots: [{ name: "default", description: "Текст чипа." }],
    emits: [
      { name: "click", payload: "MouseEvent", description: "Клик (не срабатывает при disabled)." },
      { name: "update:active", payload: "boolean", description: "Инвертированное active — для v-model:active." }
    ]
  },
  {
    name: "WlPill",
    category: "data",
    description: "Компактная пилюля-статус.",
    props: [
      { name: "variant", type: "enum", default: "neutral", values: WL_PILL_VARIANTS, description: "Цветовой вариант." },
      { name: "label", type: "string", description: "Текст (если не задан слот)." }
    ],
    slots: [{ name: "default", description: "Кастомный текст вместо label." }],
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
    slots: [{ name: "default", description: "Кастомное содержимое вместо label/image." }],
    emits: []
  },
  {
    name: "WlStatCard",
    category: "data",
    description: "Карточка метрики: иконка, подпись, значение, описание и опциональный прогресс-бар.",
    props: [
      { name: "icon", type: "icon", values: WL_ICON_NAMES, description: "Иконка в подписи." },
      { name: "label", type: "string", description: "Подпись метрики." },
      { name: "value", type: "string", description: "Значение (если не задан слот)." },
      { name: "description", type: "string", description: "Пояснение под значением." },
      { name: "progress", type: "number", description: "Прогресс 0–100; если задан — показывается бар." },
      { name: "tone", type: "enum", default: "accent", values: WL_STAT_CARD_TONES, description: "Тон акцента." }
    ],
    slots: [
      { name: "default", description: "Кастомное значение вместо value." },
      { name: "footer", description: "Подвал карточки." }
    ],
    emits: []
  },
  {
    name: "WlProgress",
    category: "data",
    description: "Линейный прогресс-бар.",
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
    description: "Скелетон-заглушка.",
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
      { name: "default", description: "Кастомное описание." },
      { name: "icon", description: "Кастомная иконка/иллюстрация." },
      { name: "action", description: "Кнопка/действие под описанием." }
    ],
    emits: []
  }
]);
