import { defineComponentManifest } from "./types";

export const navigationManifest = /* @__PURE__ */ defineComponentManifest([
  {
    name: "WlBreadcrumbs",
    category: "navigation",
    description: "Хлебные крошки: путь к текущей странице. Последний пункт — без ссылки.",
    props: [
      {
        name: "items",
        type: "array",
        default: [],
        description: "WlBreadcrumbItem[]: { label, to?, href?, icon? }."
      },
      { name: "pt", type: "object", description: "Атрибуты внутренних элементов Gavia UI." }
    ],
    slots: [],
    emits: []
  },
  {
    name: "WlSteps",
    category: "navigation",
    description: "Шаги процесса. Пройденные отмечены галочкой, текущий выделен.",
    props: [
      { name: "items", type: "array", default: [], description: "WlStepItem[]: { label }." },
      { name: "current", type: "number", default: 0, description: "Индекс текущего шага, начиная с 0." }
    ],
    slots: [],
    emits: []
  }
]);
