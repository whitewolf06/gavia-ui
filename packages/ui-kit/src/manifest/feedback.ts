import type { WlComponentManifest } from "./types";
import { WL_ALERT_VARIANTS, WL_SPINNER_SIZES } from "./values";

export const feedbackManifest: WlComponentManifest[] = [
  {
    name: "WlAlert",
    category: "feedback",
    description: "Встроенное уведомление с иконкой по варианту, опциональным заголовком и закрытием.",
    props: [
      { name: "variant", type: "enum", default: "info", values: WL_ALERT_VARIANTS, description: "Тип уведомления." },
      { name: "title", type: "string", description: "Заголовок." },
      { name: "closable", type: "boolean", default: false, description: "Кнопка закрытия." },
      { name: "closeLabel", type: "string", default: "Закрыть", description: "aria-label кнопки закрытия." }
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
      "Тост-контейнер на PrimeVue Toast (позиция bottom-center); показ — через useWlToast / ToastService.",
    props: [
      { name: "group", type: "string", description: "Группа тостов PrimeVue." },
      { name: "pt", type: "object", description: "PrimeVue pass-through." }
    ],
    slots: [],
    emits: []
  },
  {
    name: "WlConfirmDialog",
    category: "feedback",
    description:
      "Диалог подтверждения на PrimeVue ConfirmDialog (кнопки accept/reject — wl-btn); показ — через useWlConfirm. Требует app.use(WlConfirmationService) и один <WlConfirmDialog /> в корне приложения.",
    props: [
      { name: "group", type: "string", description: "Группа диалога PrimeVue (обычно не нужна)." },
      { name: "pt", type: "object", description: "PrimeVue pass-through." }
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
      { name: "label", type: "string", default: "Загрузка", description: "aria-label." }
    ],
    slots: [],
    emits: []
  }
];
