import { canonicalWlLocale } from "./format";

/** Parse a calendar date in local time, without the UTC conversion of new Date(iso). */
export function parseWlIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(0);
  date.setHours(0, 0, 0, 0);
  date.setFullYear(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}

export function toWlIsoDate(date: Date): string {
  if (!Number.isFinite(date.getTime())) return "";
  return `${String(date.getFullYear()).padStart(4, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function formatWlDate(locale: string, value: Date | string, options: Intl.DateTimeFormatOptions = {}): string {
  const date = typeof value === "string" ? parseWlIsoDate(value) : value;
  return date && Number.isFinite(date.getTime()) ? new Intl.DateTimeFormat(canonicalWlLocale(locale), options).format(date) : "";
}

export function formatWlRelativeTime(locale: string, date: Date | number, now: Date | number = Date.now()): string {
  const value = date instanceof Date ? date.getTime() : date;
  const current = now instanceof Date ? now.getTime() : now;
  if (!Number.isFinite(value) || !Number.isFinite(current)) return "";
  const seconds = (value - current) / 1000;
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60]
  ];
  const [unit, scale] = units.find(([, size]) => Math.abs(seconds) >= size) ?? ["second", 1];
  return new Intl.RelativeTimeFormat(canonicalWlLocale(locale), { numeric: "auto" }).format(Math.round(seconds / scale), unit);
}

export function getWlMonthNames(locale: string, width: "long" | "short" = "long"): string[] {
  const formatter = new Intl.DateTimeFormat(canonicalWlLocale(locale), { month: width, timeZone: "UTC" });
  return Array.from({ length: 12 }, (_, month) => formatter.format(new Date(Date.UTC(2024, month, 15))));
}

export function getWlWeekdayNames(locale: string, width: "long" | "short" | "narrow" = "short"): string[] {
  const formatter = new Intl.DateTimeFormat(canonicalWlLocale(locale), { weekday: width, timeZone: "UTC" });
  return Array.from({ length: 7 }, (_, day) => formatter.format(new Date(Date.UTC(2024, 0, 7 + day))));
}

export function getWlFirstDayOfWeek(locale: string): number {
  const code = new Intl.Locale(canonicalWlLocale(locale));
  const info = code as Intl.Locale & { getWeekInfo?: () => { firstDay: number }; weekInfo?: { firstDay: number } };
  const first = info.getWeekInfo?.().firstDay ?? info.weekInfo?.firstDay;
  if (first !== undefined) return first % 7;
  const region = code.maximize().region ?? "US";
  if (["US", "CA", "JP", "PH", "TW", "HK", "KR", "TH", "IL", "SA"].includes(region)) return 0;
  if (["AE", "AF", "BH", "DZ", "EG", "IQ", "IR", "JO", "KW", "LY", "OM", "QA", "SD", "SY"].includes(region)) return 6;
  return 1;
}
