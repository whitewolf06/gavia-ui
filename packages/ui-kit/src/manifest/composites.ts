import { defineComponentManifest } from "./types";

export const compositesManifest = defineComponentManifest([
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
      { name: "density", type: "enum", default: "default", values: ["default", "compact"] }
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
