import { translate as t } from "../i18n";
export type GaviaFontStyle = "normal" | "italic";
export type GaviaFontWeight = 100 | 300 | 400 | 500 | 600 | 700;

export const gaviaFontFamily = '"Gavia Sans", "Segoe UI", Arial, sans-serif';
export const gaviaRelease = "0.6";
export const gaviaWeights = [
  { value: 100, name: "Thin", get ru() { return t("shell.type_study.font.text586"); } },
  { value: 300, name: "Light", get ru() { return t("shell.type_study.font.text587"); } },
  { value: 400, name: "Regular", get ru() { return t("shell.type_study.font.text588"); } },
  { value: 500, name: "Medium", get ru() { return t("shell.type_study.font.text589"); } },
  { value: 600, name: "SemiBold", get ru() { return t("shell.type_study.font.text590"); } },
  { value: 700, name: "Bold", get ru() { return t("shell.type_study.font.text591"); } }
] as const;
