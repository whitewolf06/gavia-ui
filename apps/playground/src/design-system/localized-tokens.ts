import { wlDesignTokens, wlDesignThemes, wlTypography, wlContrastReport } from "../../../../packages/ui-kit/src/design-system";
import { translate } from "../i18n";
import { translateDocumentationText } from "../documentation/localize";
import russianMessages from "../i18n/messages/tokens.ru.json";

/** Keep canonical IDs and values intact; prose follows the presentation locale. */
function localizedRows<T extends { name: string }>(rows: readonly T[], kind: string, fields: readonly string[]): T[] {
  return rows.map((row) => new Proxy(row, {
    get(target, property, receiver) {
      const value = Reflect.get(target, property, receiver);
      if (typeof property !== "string" || !fields.includes(property) || typeof value !== "string") return value;
      const key = `tokens.${kind}.${target.name}.${property}`;
      return Object.prototype.hasOwnProperty.call(russianMessages, key) ? translate(key) : translateDocumentationText(value);
    }
  }));
}
export const getLocalizedDesignTokens = () => localizedRows(wlDesignTokens, "token", ["description"]);
export const getLocalizedDesignThemes = () => localizedRows(wlDesignThemes, "theme", ["label", "description"]);
export const getLocalizedTypography = () => localizedRows(wlTypography, "typography", ["label", "description"]);
export const getLocalizedContrastReport = () => localizedRows(wlContrastReport, "contrast", ["label"]);

/** Contrast calculations reuse the same role labels as the canonical report. */
export function localizeContrastLabel(name: string, fallback: string): string {
  const key = `tokens.contrast.${name}.label`;
  return Object.prototype.hasOwnProperty.call(russianMessages, key) ? translate(key) : translateDocumentationText(fallback);
}
