import { defineComponentManifest } from "./types";

export const compositesManifest = defineComponentManifest([
  {
    name: "WlPageHeader",
    category: "composites",
    description:
      "Воздушный заголовок страницы с breadcrumbs, основным заголовком, описанием, метаданными, действиями и навигацией. Не добавляет фоновую подложку и бизнес-логику.",
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
      { name: "meta", description: "Статусы, даты и другая компактная метаинформация." },
      { name: "actions", description: "Основные и вторичные действия страницы." },
      { name: "navigation", description: "Табы или переключатель режима под заголовком." }
    ],
    emits: []
  },
  {
    name: "WlFilterBar",
    category: "composites",
    description:
      "Адаптивная панель произвольных фильтров: горизонтальный toolbar на desktop и доступный drawer с фокусом, Escape, сбросом и применением на мобильном.",
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
      { name: "leading", description: "Поиск или другой ведущий контрол." },
      { name: "actions", description: "Действия desktop-панели; scope { clear, close }." },
      { name: "summary", description: "Активные фильтры или chips под панелью; scope { clear }." },
      { name: "footer", description: "Действия мобильного drawer; scope { apply, clear, close }." }
    ],
    emits: [
      { name: "clear", description: "Потребитель должен сбросить значения фильтров." },
      { name: "apply", description: "Потребитель должен применить текущие значения." },
      { name: "open" },
      { name: "close" }
    ],
    model: {
      name: "open",
      type: "boolean",
      description: "Открыт ли мобильный drawer фильтров."
    }
  },
  {
    name: "WlSidebar",
    category: "composites",
    description:
      "Адаптивный sidebar из WlNavItem: группы навигации, footer, collapsed/hover, закрепление и мобильный drawer. Не зависит от роутера.",
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
      { name: "brand-mark", description: "Кастомная марка бренда." },
      { name: "brand", description: "Кастомное название бренда." },
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
        description: "Выбран пункт; навигацию выполняет потребитель."
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
      "Командная палитра для быстрых ссылок и единого поиска по произвольным группам. Не зависит от роутера, API и бизнес-сущностей.",
    props: [
      {
        name: "groups",
        type: "array",
        default: [],
        description:
          "WlCommandPaletteGroup[] с быстрыми ссылками и поисковыми элементами; group.filter переключает локальную/внешнюю фильтрацию."
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
        description: "Выбран элемент; переход или действие выполняет потребитель."
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
