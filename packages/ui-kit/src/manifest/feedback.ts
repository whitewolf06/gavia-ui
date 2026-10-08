import { defineComponentManifest } from "./types";
import { WL_ALERT_VARIANTS, WL_SPINNER_SIZES } from "./values";

export const feedbackManifest = /* @__PURE__ */ defineComponentManifest([
  {
    name: "WlAlert",
    category: "feedback",
    description: "Уведомление внутри страницы. Иконка зависит от варианта; заголовок и кнопку закрытия можно добавить отдельно.",
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
      "Toast-контейнер в позиции bottom-center. Показ — через useWlToast / WlToastService.",
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
      "Диалог подтверждения с кнопками accept/reject. Вызывается через useWlConfirm. Подключите app.use(WlConfirmationService) и один <WlConfirmDialog /> в корне приложения.",
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
      { name: "label", type: "string", default: "Загрузка", description: "aria-label." }
    ],
    slots: [],
    emits: []
  }
]);
