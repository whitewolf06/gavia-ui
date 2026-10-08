import { defineComponentManifest } from "./types";
import { WL_ICON_NAMES } from "./values";

export const miscManifest = /* @__PURE__ */ defineComponentManifest([
  {
    name: "WlField",
    category: "misc",
    description:
      "Подпись, подсказка и ошибка для поля формы. Слот передаёт id, ariaDescribedby и invalid — их нужно связать с полем.",
    props: [
      { name: "label", type: "string", description: "Подпись поля." },
      { name: "required", type: "boolean", default: false, description: "Звёздочка у обязательного поля." },
      { name: "hint", type: "string", description: "Подсказка под полем." },
      { name: "error", type: "string", description: "Текст ошибки. Показывается вместо hint." },
      { name: "id", type: "string", description: "id поля; по умолчанию создаётся wl-field-<uid>." }
    ],
    slots: [
      {
        name: "default",
        description: "Поле формы; scope: { id, ariaDescribedby, invalid }."
      }
    ],
    emits: []
  },
  {
    name: "WlIcon",
    category: "misc",
    description: "SVG-иконка из набора Gavia UI. Без name показывает свою иконку из слота.",
    props: [
      { name: "name", type: "icon", values: WL_ICON_NAMES, description: "Имя иконки из набора." },
      {
        name: "size",
        type: "union",
        default: 18,
        description: "Размер: number (px) или string (CSS), например \"1em\"."
      }
    ],
    slots: [{ name: "default", description: "Своя иконка; показывается, если name не задан." }],
    emits: []
  }
]);
