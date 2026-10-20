import type { WlDateFormatOptions } from "../picker-types";
import { parseWlIsoDate, toWlIsoDate } from "./date";
import { canonicalWlLocale } from "./format";

export function normalizeDateInput(value: string): string {
  return value.normalize("NFKC").replace(/[\u200E\u200F\u061C]/g, "").trim();
}
function escape(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
export function localizedDigits(locale: string): (value: string) => string {
  const formatter = new Intl.NumberFormat(canonicalWlLocale(locale), { useGrouping: false });
  const digits = Array.from({ length: 10 }, (_, digit) => [normalizeDateInput(formatter.format(digit)), String(digit)] as const);
  return (value) => digits.reduce((text, [digit, ascii]) => text.split(digit).join(ascii), normalizeDateInput(value));
}

/** A Gregorian calendar-date presentation with a matching parser, independent of timezone conversion. */
export function createDateInputFormat(locale: string, options: WlDateFormatOptions = {}): {
  format: (iso: string) => string;
  parse: (value: string, reference?: string | null) => string | null;
} {
  const code = canonicalWlLocale(locale);
  const settings: Intl.DateTimeFormatOptions = options.dateStyle
    ? { dateStyle: options.dateStyle, calendar: "gregory" }
    : { year: "numeric", month: "2-digit", day: "2-digit", ...options, calendar: "gregory" };
  const formatter = new Intl.DateTimeFormat(code, settings);
  const digits = localizedDigits(code);
  const sample = formatter.formatToParts(new Date(2006, 10, 22));
  const fields: string[] = [];
  const monthLabels = Array.from({ length: 12 }, (_, month) => normalizeDateInput(
    formatter.formatToParts(new Date(2006, month, 22)).find((part) => part.type === "month")?.value ?? ""
  ));
  const namedMonth = sample.some((part) => part.type === "month" && !/^\d+$/.test(digits(part.value)));
  const pattern = sample.map((part) => {
    if (["year", "month", "day"].includes(part.type)) {
      fields.push(part.type);
      return part.type === "month" && namedMonth
        ? `(${[...new Set(monthLabels)].sort((left, right) => right.length - left.length).map(escape).join("|")})`
        : "(\\d{1,4})";
    }
    if (part.type === "weekday") return ".+?";
    return escape(part.value.normalize("NFKC").replace(/[\u200E\u200F\u061C]/g, "")).replace(/\s+/g, "\\s*");
  }).join("");
  const expression = new RegExp(`^${pattern}$`, "iu");
  const shortYear = digits(sample.find((part) => part.type === "year")?.value ?? "").length === 2;
  return {
    format: (iso) => {
      const date = parseWlIsoDate(iso);
      return date ? formatter.format(date) : "";
    },
    parse: (value, reference) => {
      const match = expression.exec(digits(value));
      if (!match) return null;
      const parts = new Map(fields.map((field, index) => [field, match[index + 1]!]));
      const monthText = parts.get("month") ?? "";
      const month = namedMonth
        ? monthLabels.findIndex((label) => label.toLocaleLowerCase(code) === monthText.toLocaleLowerCase(code)) + 1
        : Number(monthText);
      let year = Number(parts.get("year"));
      if (shortYear && year < 100) {
        const referenceYear = reference ? parseWlIsoDate(reference)?.getFullYear() ?? new Date().getFullYear() : new Date().getFullYear();
        year += Math.floor(referenceYear / 100) * 100;
        if (year - referenceYear > 49) year -= 100;
        else if (referenceYear - year > 50) year += 100;
      }
      const iso = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(Number(parts.get("day"))).padStart(2, "0")}`;
      const date = parseWlIsoDate(iso);
      return date ? toWlIsoDate(date) : null;
    }
  };
}
