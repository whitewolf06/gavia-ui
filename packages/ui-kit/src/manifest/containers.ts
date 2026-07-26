import { defineComponentManifest } from "./types";
import { WL_DRAWER_POSITIONS } from "./values";

export const containersManifest = defineComponentManifest([
  {
    name: "WlCard",
    category: "containers",
    description: "Карточка на PrimeVue Card с секциями header/title/subtitle/content/footer.",
    props: [
      { name: "hoverable", type: "boolean", default: false, description: "Подсветка при наведении." },
      { name: "pt", type: "object", description: "PrimeVue pass-through." }
    ],
    slots: [
      { name: "default", description: "Основное содержимое." },
      { name: "header", description: "Шапка (медиа/баннер)." },
      { name: "title", description: "Заголовок." },
      { name: "subtitle", description: "Подзаголовок." },
      { name: "footer", description: "Подвал." }
    ],
    emits: []
  },
  {
    name: "WlAccordion",
    category: "containers",
    description: "Аккордеон на нативных details/summary; контролируемый через openKeys или неконтролируемый.",
    props: [
      {
        name: "items",
        type: "array",
        default: [],
        description: "WlAccordionItem[]: { key, title, content?, disabled? }."
      },
      { name: "single", type: "boolean", default: false, description: "Открыт только один пункт." },
      {
        name: "openKeys",
        type: "array",
        description: "Открытые ключи (контролируемый режим, v-model:openKeys)."
      }
    ],
    slots: [
      { name: "item", description: "Тело пункта вместо item.content; scope: { item, open }." }
    ],
    emits: [
      { name: "update:openKeys", payload: "string[]", description: "Новый список открытых ключей." }
    ]
  },
  {
    name: "WlTabs",
    category: "containers",
    description: "Вкладки на PrimeVue Tabs; панели наполняются через scoped-слот panel.",
    props: [
      {
        name: "items",
        type: "array",
        default: [],
        description: "WlTabItem[]: { key, label, icon?, count? }."
      },
      { name: "pt", type: "object", description: "PrimeVue pass-through." }
    ],
    slots: [{ name: "panel", description: "Содержимое панели; scope: { item }." }],
    emits: [],
    model: {
      name: "modelValue",
      type: "string",
      description: "key активной вкладки; если пуст — выбирается первая (default \"\")."
    }
  },
  {
    name: "WlDialog",
    category: "containers",
    description: "Модальный диалог на PrimeVue Dialog.",
    props: [
      { name: "header", type: "string", description: "Заголовок (если не задан слот header)." },
      { name: "modal", type: "boolean", default: true, description: "Модальный режим с подложкой." },
      { name: "closable", type: "boolean", default: true, description: "Кнопка закрытия." },
      { name: "width", type: "string", description: "Ширина (CSS), например \"480px\"." },
      { name: "pt", type: "object", description: "PrimeVue pass-through." }
    ],
    slots: [
      { name: "default", description: "Тело диалога." },
      { name: "header", description: "Кастомная шапка." },
      { name: "footer", description: "Подвал (кнопки)." }
    ],
    emits: [],
    model: { name: "visible", type: "boolean", description: "v-model:visible — открыт ли (default false)." }
  },
  {
    name: "WlDrawer",
    category: "containers",
    description: "Боковая панель на PrimeVue Drawer.",
    props: [
      { name: "header", type: "string", description: "Заголовок (если не задан слот header)." },
      {
        name: "position",
        type: "enum",
        default: "right",
        values: WL_DRAWER_POSITIONS,
        description: "Сторона появления."
      },
      { name: "modal", type: "boolean", default: true, description: "Модальный режим с подложкой." },
      { name: "pt", type: "object", description: "PrimeVue pass-through." }
    ],
    slots: [
      { name: "default", description: "Содержимое панели." },
      { name: "header", description: "Кастомная шапка." },
      { name: "footer", description: "Подвал." }
    ],
    emits: [],
    model: { name: "visible", type: "boolean", description: "v-model:visible — открыта ли (default false)." }
  },
  {
    name: "WlPopover",
    category: "containers",
    description: "Поповер на PrimeVue Popover; управление только императивное — экспонирует toggle/show/hide.",
    props: [{ name: "pt", type: "object", description: "PrimeVue pass-through." }],
    slots: [{ name: "default", description: "Содержимое поповера." }],
    emits: []
  },
  {
    name: "WlDivider",
    category: "containers",
    description: "Разделитель на PrimeVue Divider; без слота — простая линия.",
    props: [{ name: "pt", type: "object", description: "PrimeVue pass-through." }],
    slots: [{ name: "default", description: "Текст/содержимое по центру линии." }],
    emits: []
  }
]);
