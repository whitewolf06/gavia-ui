import { defineComponentManifest } from "./types";

export const navigationManifest = defineComponentManifest([
  {
    name: "WlBreadcrumbs",
    category: "navigation",
    description: "Хлебные крошки на PrimeVue Breadcrumb; последний пункт — текущая страница (без ссылки).",
    props: [
      {
        name: "items",
        type: "array",
        default: [],
        description: "WlBreadcrumbItem[]: { label, to?, href?, icon? }."
      },
      { name: "pt", type: "object", description: "PrimeVue pass-through." }
    ],
    slots: [],
    emits: []
  },
  {
    name: "WlSteps",
    category: "navigation",
    description: "Линейный индикатор шагов: пройденные — с галочкой, текущий подсвечен.",
    props: [
      { name: "items", type: "array", default: [], description: "WlStepItem[]: { label }." },
      { name: "current", type: "number", default: 0, description: "Индекс текущего шага (0-based)." }
    ],
    slots: [],
    emits: []
  }
]);
