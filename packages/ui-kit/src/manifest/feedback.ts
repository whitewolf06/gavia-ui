import { defineComponentManifest } from "./types";
import { WL_SPINNER_SIZES, WL_TONES } from "./values";

export const feedbackManifest = /* @__PURE__ */ defineComponentManifest([
  {
    name: "WlTooltip",
    category: "feedback",
    description: "Descriptive hover and focus content with an optional controlled visibility model.",
    props: [
      { name: "content", type: "string", description: "Tooltip text when the content slot is not supplied." },
      { name: "placement", type: "enum", default: "top", values: ["auto", "top", "bottom", "left", "right"], description: "Preferred overlay side relative to its anchor." },
      { name: "showDelay", type: "number", default: 0, description: "Delay in milliseconds before showing the tooltip." },
      { name: "hideDelay", type: "number", default: 100, description: "Delay in milliseconds before hiding the tooltip." },
      { name: "disabled", type: "boolean", default: false, description: "Disable user interaction with this component." },
      { name: "motion", type: "boolean", description: "Enable motion locally, with application defaults and reduced-motion preferences respected." },
      { name: "pt", type: "object", description: "Attributes and callbacks for the component's documented pass-through sections." }
    ],
    slots: [
      { name: "default", description: "Tooltip trigger content with visibility and explicit show/hide actions." },
      { name: "content", description: "Formatted descriptive tooltip content; interactive controls belong in a popover." }
    ],
    emits: [{ name: "update:visible", payload: "boolean", description: "Whether the surface is open." }],
    model: { name: "visible", type: "boolean", description: "Whether the surface is open." }
  },
  {
    name: "WlAlert",
    category: "feedback",
    description: "Уведомление внутри страницы. Иконка зависит от tone; заголовок и кнопку закрытия можно добавить отдельно.",
    props: [
      { name: "tone", type: "enum", default: "info", values: WL_TONES, description: "Semantic notification color." },
      { name: "title", type: "string", description: "Заголовок." },
      { name: "closable", type: "boolean", default: false, description: "Кнопка закрытия." },
      { name: "closeLabel", type: "string", description: "Uses locale.close when omitted or undefined; English fallback: Close." },
      { name: "live", type: "enum", description: "Приоритет объявления: по tone, polite, assertive или off для статичного блока.", values: ["assertive", "polite", "off"] },
      { name: "pt", type: "object", description: "Атрибуты внутренних элементов." }
    ],
    slots: [
      { name: "default", description: "Текст уведомления." },
      { name: "action", description: "Действие справа (кнопка)." }
    ],
    emits: [{ name: "close", payload: "MouseEvent", description: "Клик по кнопке закрытия." }]
  },
  {
    name: "WlToast",
    category: "feedback",
    description:
      "Toast-контейнер с семантическим tone. Показ — через useWlToast().show; прежние методы и severity сохранены.",
    props: [
      { name: "group", type: "string", description: "Группа уведомлений." },
      { name: "motion", type: "boolean", description: "Анимация сообщений; по умолчанию WlConfig.motion (true)." },
      { name: "pt", type: "object", description: "Атрибуты внутренних элементов Gavia UI." }
    ],
    slots: [],
    emits: []
  },
  {
    name: "WlConfirmDialog",
    category: "feedback",
    description:
      "Диалог подтверждения с кнопками accept/reject. Задайте tone в useWlConfirm().confirm(); confirmDanger остаётся алиасом danger. Подключите WlConfirmationService и один WlConfirmDialog в корне приложения.",
    props: [
      { name: "group", type: "string", description: "Группа диалога; обычно можно не задавать." },
      { name: "motion", type: "boolean", description: "Анимация окна; по умолчанию WlConfig.motion (true)." },
      { name: "pt", type: "object", description: "Атрибуты внутренних элементов Gavia UI." }
    ],
    slots: [],
    emits: []
  },
  {
    name: "WlSpinner",
    category: "feedback",
    description: "Индикатор загрузки (role=status).",
    props: [
      { name: "size", type: "enum", default: "md", values: WL_SPINNER_SIZES, description: "Размер." },
      { name: "light", type: "boolean", default: false, description: "Светлый вариант для тёмного фона." },
      { name: "label", type: "string", description: "Uses locale.loading when omitted or undefined; English fallback: Loading." }
    ],
    slots: [],
    emits: []
  }
]);
