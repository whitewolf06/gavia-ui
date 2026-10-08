import { defineComponentManifest } from "./types";

export const compositesManifest = /* @__PURE__ */ defineComponentManifest([
  {
    name: "WlPageHeader",
    category: "composites",
    description:
      "Заголовок страницы с хлебными крошками, описанием, метаданными, кнопками и навигацией. Без фоновой подложки.",
    props: [
      { name: "title", type: "string", default: "", description: "Основной заголовок страницы." },
      { name: "description", type: "string", default: "", description: "Краткое описание страницы." },
      { name: "eyebrow", type: "string", default: "", description: "Надзаголовок или контекст раздела." },
      { name: "headingLevel", type: "union", default: 1, values: ["1", "2"] },
      { name: "size", type: "enum", default: "lg", values: ["sm", "md", "lg"] },
      { name: "density", type: "enum", default: "default", values: ["default", "compact"] }
    ],
    slots: [
      { name: "breadcrumbs", description: "Навигационная цепочка над заголовком." },
      { name: "eyebrow", description: "Произвольный надзаголовок." },
      { name: "title", description: "Произвольное содержимое заголовка." },
      { name: "description", description: "Расширенное описание страницы." },
      { name: "meta", description: "Статусы, даты и другие метаданные." },
      { name: "actions", description: "Основные и вторичные действия страницы." },
      { name: "navigation", description: "Вкладки или переключатель режима под заголовком." }
    ],
    emits: []
  },
  {
    name: "WlFilterBar",
    category: "composites",
    description:
      "На desktop — toolbar с фильтрами, на мобильном — Drawer. Поддерживает управление фокусом, закрытие по Escape, сброс и применение фильтров.",
    props: [
      { name: "activeCount", type: "number", default: 0, description: "Количество активных фильтров." },
      { name: "ariaLabel", type: "string", default: "Фильтры" },
      { name: "toggleLabel", type: "string", default: "Фильтры" },
      { name: "panelTitle", type: "string", default: "Фильтры" },
      { name: "clearLabel", type: "string", default: "Сбросить" },
      { name: "applyLabel", type: "string", default: "Применить" },
      { name: "closeLabel", type: "string", default: "Закрыть фильтры" },
      { name: "showClear", type: "boolean", default: true },
      { name: "showApply", type: "boolean", default: true },
      { name: "disabled", type: "boolean", default: false },
      { name: "density", type: "enum", default: "default", values: ["default", "compact"] }
    ],
    slots: [
      { name: "default", description: "Контролы фильтров; scope { open, close, clear }." },
      { name: "leading", description: "Поиск или другой контрол перед фильтрами." },
      { name: "actions", description: "Действия desktop-панели; scope { clear, close }." },
      { name: "summary", description: "Активные фильтры или chips под панелью; scope { clear }." },
      { name: "footer", description: "Действия мобильного Drawer; scope { apply, clear, close }." }
    ],
    emits: [
      { name: "clear", description: "Сбросьте значения фильтров в приложении." },
      { name: "apply", description: "Примените текущие значения в приложении." },
      { name: "open" },
      { name: "close" }
    ],
    model: {
      name: "open",
      type: "boolean",
      description: "Открыт ли мобильный Drawer фильтров."
    }
  },
  {
    name: "WlSidebar",
    category: "composites",
    description:
      "Адаптивный sidebar из WlNavItem: группы навигации, footer, collapsed/hover и закрепление. На мобильном открывается как Drawer. Роутер не требуется.",
    props: [
      {
        name: "groups",
        type: "array",
        default: [],
        description: "WlSidebarGroup[]: секции с WlSidebarItem[] и необязательным separator."
      },
      {
        name: "footerItems",
        type: "array",
        default: [],
        description: "WlSidebarItem[] для нижней закреплённой области."
      },
      { name: "brand", type: "string", default: "", description: "Название продукта." },
      { name: "brandMark", type: "string", default: "", description: "Короткая текстовая марка." },
      { name: "ariaLabel", type: "string", default: "Основная навигация" },
      { name: "collapsible", type: "boolean", default: true },
      { name: "expandOnHover", type: "boolean", default: true },
      { name: "showPin", type: "boolean", default: true },
      { name: "pinLabel", type: "string", default: "Закрепить панель" },
      { name: "unpinLabel", type: "string", default: "Открепить панель" },
      { name: "density", type: "enum", default: "default", values: ["default", "compact"] },
      {
        name: "pinned",
        type: "boolean",
        default: false,
        description: "Именованная модель v-model:pinned."
      },
      {
        name: "mobileOpen",
        type: "boolean",
        default: false,
        description: "Именованная модель v-model:mobile-open."
      }
    ],
    slots: [
      { name: "brand-mark", description: "Свой знак бренда." },
      { name: "brand", description: "Своё название бренда." },
      {
        name: "item",
        description: "Пункт основной группы; scope { item, group, active, expanded, select }."
      },
      {
        name: "footer-item",
        description: "Пункт footer; scope { item, active, expanded, select }."
      },
      { name: "footer", description: "Дополнительный footer; scope { expanded }." }
    ],
    emits: [
      {
        name: "select",
        payload: "WlSidebarItem, WlSidebarGroup | undefined",
        description: "Выбран пункт. Переход выполняет приложение."
      }
    ],
    model: {
      name: "modelValue",
      type: "string",
      description: "Ключ активного пункта."
    }
  },
  {
    name: "WlCommandPalette",
    category: "composites",
    description:
      "Командная палитра: группы команд, быстрые ссылки и поиск. Переходы и внешние запросы подключает приложение.",
    props: [
      {
        name: "groups",
        type: "array",
        default: [],
        description:
          "WlCommandPaletteGroup[] с быстрыми ссылками и результатами поиска. group.filter выбирает локальную или внешнюю фильтрацию."
      },
      { name: "placeholder", type: "string", default: "Поиск или переход…" },
      { name: "emptyText", type: "string", default: "Ничего не найдено" },
      { name: "loadingText", type: "string", default: "Поиск…" },
      { name: "ariaLabel", type: "string", default: "Командная палитра" },
      { name: "filter", type: "boolean", default: true, description: "Локально фильтровать элементы." },
      { name: "shortcut", type: "boolean", default: false, description: "Открывать по Ctrl/Cmd+K." },
      { name: "closeOnSelect", type: "boolean", default: true },
      { name: "loading", type: "boolean", default: false },
      { name: "disabled", type: "boolean", default: false },
      { name: "size", type: "enum", default: "md", values: ["sm", "md", "lg"] },
      { name: "density", type: "enum", default: "default", values: ["default", "compact"] },
      { name: "motion", type: "boolean", description: "Анимация окна; по умолчанию WlConfig.motion (true)." }
    ],
    slots: [
      { name: "group", description: "Заголовок группы; scope { group }." },
      { name: "item", description: "Полная разметка элемента; scope { item, group, active }." },
      { name: "item-icon", description: "Иконка элемента; scope { item, group }." },
      { name: "empty", description: "Пустое состояние; scope { query }." },
      { name: "footer", description: "Подвал панели." }
    ],
    emits: [
      { name: "search", payload: "string", description: "Изменился поисковый запрос." },
      {
        name: "select",
        payload: "WlCommandPaletteItem, WlCommandPaletteGroup",
        description: "Выбран элемент. Переход или действие выполняет приложение."
      },
      { name: "open" },
      { name: "close" }
    ],
    model: {
      name: "visible",
      type: "boolean",
      description: "Открыто ли окно; дополнительная модель query управляет строкой поиска."
    }
  }
]);
