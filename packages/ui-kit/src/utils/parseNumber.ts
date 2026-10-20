import { canonicalWlLocale } from "./format";

/** Parse a localized decimal/currency draft; formatting remains an explicit component option. */
export function parseWlNumber(locale: string, text: string): number {
  const formatter = new Intl.NumberFormat(canonicalWlLocale(locale));
  const parts = formatter.formatToParts(-12345.6);
  let normalized = text.trim();
  const negativeParentheses = normalized.startsWith("(") && normalized.endsWith(")");
  const group = parts.find((part) => part.type === "group")?.value;
  const decimal = parts.find((part) => part.type === "decimal")?.value ?? ".";
  const minus = parts.find((part) => part.type === "minusSign")?.value ?? "-";
  if (group) normalized = normalized.split(group).join("");
  normalized = normalized.split(decimal).join(".").split(minus).join("-");
  for (let digit = 0; digit < 10; digit++) {
    const localized = formatter.formatToParts(digit).find((part) => part.type === "integer")?.value;
    if (localized) normalized = normalized.split(localized).join(String(digit));
  }
  normalized = normalized.replace(/\u2212/g, "-");
  const numeric = normalized.match(/[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/i);
  if (!numeric || /[\d.+-]/.test(normalized.replace(numeric[0], ""))) return NaN;
  const value = Number(numeric[0]);
  return negativeParentheses ? -Math.abs(value) : value;
}
