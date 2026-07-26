import type { WlComponentManifest } from "./types";
import { WL_ICON_NAMES } from "./values";

export const miscManifest: WlComponentManifest[] = [
  {
    name: "WlField",
    category: "misc",
    description:
      "Обёртка поля формы: label, подсказка/ошибка; слот получает id, ariaDescribedby и invalid для связи с контролом.",
    props: [
      { name: "label", type: "string", description: "Подпись поля." },
      { name: "required", type: "boolean", default: false, description: "Маркер обязательности (*)." },
      { name: "hint", type: "string", description: "Подсказка под полем." },
      { name: "error", type: "string", description: "Текст ошибки (приоритет над hint)." },
      { name: "id", type: "string", description: "id контрола; по умолчанию генерируется wl-field-<uid>." }
    ],
    slots: [
      {
        name: "default",
        description: "Контрол формы; scope: { id, ariaDescribedby, invalid }."
      }
    ],
    emits: []
  },
  {
    name: "WlIcon",
    category: "misc",
    description: "SVG-иконка из фиксированного набора; без name рендерит слот (кастомная иконка).",
    props: [
      { name: "name", type: "icon", values: WL_ICON_NAMES, description: "Имя иконки из набора." },
      {
        name: "size",
        type: "union",
        default: 18,
        description: "Размер: number (px) или string (CSS), например \"1em\"."
      }
    ],
    slots: [{ name: "default", description: "Кастомная иконка (рендерится, если name не задан)." }],
    emits: []
  }
];
