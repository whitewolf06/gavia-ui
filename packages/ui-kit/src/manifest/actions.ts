import type { WlComponentManifest } from "./types";
import {
  WL_BUTTON_VARIANTS,
  WL_DENSITIES,
  WL_ICON_BUTTON_VARIANTS,
  WL_ICON_NAMES,
  WL_SIZES
} from "./values";

export const actionsManifest: WlComponentManifest[] = [
  {
    name: "WlButton",
    category: "actions",
    description: "Кнопка действия на PrimeVue Button с вариантами, размерами и состоянием загрузки.",
    props: [
      {
        name: "variant",
        type: "enum",
        default: "secondary",
        values: WL_BUTTON_VARIANTS,
        description: "Визуальный вариант кнопки."
      },
      {
        name: "size",
        type: "enum",
        default: "md",
        values: WL_SIZES,
        description: "Размер кнопки."
      },
      {
        name: "density",
        type: "enum",
        default: "default",
        values: WL_DENSITIES,
        description: "Плотность (compact уменьшает высоту)."
      },
      { name: "loading", type: "boolean", default: false, description: "Спиннер вместо иконки, клик заблокирован." },
      { name: "disabled", type: "boolean", default: false, description: "Отключает кнопку." },
      { name: "block", type: "boolean", default: false, description: "Растянуть на всю ширину контейнера." },
      {
        name: "type",
        type: "enum",
        default: "button",
        values: ["button", "submit", "reset"],
        description: "Нативный type кнопки."
      },
      { name: "pt", type: "object", description: "PrimeVue pass-through для внутренних элементов." }
    ],
    slots: [
      { name: "default", description: "Текст/содержимое кнопки." },
      { name: "icon", description: "Иконка слева (скрывается при loading)." }
    ],
    emits: [{ name: "click", payload: "MouseEvent", description: "Клик (не срабатывает при disabled/loading)." }]
  },
  {
    name: "WlIconButton",
    category: "actions",
    description: "Квадратная кнопка-иконка с опциональным бейджем-счётчиком или точкой.",
    props: [
      {
        name: "variant",
        type: "enum",
        default: "ghost",
        values: WL_ICON_BUTTON_VARIANTS,
        description: "Визуальный вариант."
      },
      { name: "size", type: "enum", default: "md", values: ["md", "sm"], description: "Размер кнопки." },
      { name: "icon", type: "icon", values: WL_ICON_NAMES, description: "Иконка (если не задан слот)." },
      { name: "active", type: "boolean", default: false, description: "Подсветить как активную." },
      { name: "disabled", type: "boolean", default: false, description: "Отключает кнопку." },
      { name: "count", type: "number", description: "Числовой бейдж (показывается при > 0)." },
      { name: "dot", type: "boolean", default: false, description: "Точка-индикатор (если нет count)." },
      { name: "ariaLabel", type: "string", description: "aria-label кнопки." },
      { name: "pt", type: "object", description: "PrimeVue pass-through." }
    ],
    slots: [{ name: "default", description: "Кастомное содержимое вместо иконки." }],
    emits: [{ name: "click", payload: "MouseEvent", description: "Клик (не срабатывает при disabled)." }]
  },
  {
    name: "WlButtonGroup",
    category: "actions",
    description: "Группа кнопок (role=group), визуально склеенная.",
    props: [{ name: "ariaLabel", type: "string", description: "aria-label группы." }],
    slots: [{ name: "default", description: "Кнопки группы (WlButton / WlIconButton)." }],
    emits: []
  },
  {
    name: "WlSegmented",
    category: "actions",
    description: "Сегментированный переключатель (один выбор из options) на PrimeVue SelectButton.",
    props: [
      {
        name: "options",
        type: "array",
        default: [],
        description: "Опции WlSegmentedOption[]: { label, value, icon?, disabled? }."
      },
      { name: "disabled", type: "boolean", default: false, description: "Отключает весь переключатель." },
      { name: "pt", type: "object", description: "PrimeVue pass-through." }
    ],
    slots: [],
    emits: [],
    model: { name: "modelValue", type: "string | null", description: "value выбранной опции (default null)." }
  },
  {
    name: "WlMenu",
    category: "actions",
    description:
      "Меню (в т.ч. popup) из плоского списка WlMenuItem с группами/разделителями. Экспонирует toggle/show/hide.",
    props: [
      {
        name: "items",
        type: "array",
        default: [],
        description: "WlMenuItem[]: { key?, label?, icon?, shortcut?, danger?, disabled?, separator?, header?, command? }."
      },
      { name: "popup", type: "boolean", default: false, description: "Popup-режим (открытие через toggle/show)." },
      { name: "pt", type: "object", description: "PrimeVue pass-through." }
    ],
    slots: [],
    emits: []
  },
  {
    name: "WlNavItem",
    category: "actions",
    description: "Пункт навигации: кнопка или ссылка (href) с иконкой, бейджем и состоянием active.",
    props: [
      { name: "label", type: "string", description: "Текст пункта (если не задан слот)." },
      { name: "icon", type: "icon", values: WL_ICON_NAMES, description: "Иконка слева." },
      { name: "badge", type: "union", description: "Бейдж справа: number | string." },
      { name: "active", type: "boolean", default: false, description: "Текущий пункт (aria-current=page)." },
      { name: "disabled", type: "boolean", default: false, description: "Отключает пункт." },
      { name: "href", type: "string", description: "Если задан — рендерится <a>, иначе <button>." }
    ],
    slots: [{ name: "default", description: "Кастомный текст вместо label." }],
    emits: [{ name: "click", payload: "MouseEvent", description: "Клик (не срабатывает при disabled)." }]
  }
];
