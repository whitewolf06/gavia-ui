import { localizedDigits, normalizeDateInput } from "./dateInputFormat";
import { canonicalWlLocale } from "./format";

export function timeSeconds(value: string): number | null {
  const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const second = Number(match[3] ?? 0);
  return hour < 24 && minute < 60 && second < 60 ? hour * 3600 + minute * 60 + second : null;
}
export function timeValue(seconds: number, precision: boolean): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor(seconds / 60) % 60)}${precision ? `:${pad(seconds % 60)}` : ""}`;
}
export function timeInInterval(value: number, start: number, end: number): boolean {
  return start <= end ? value >= start && value <= end : value >= start || value <= end;
}
export function createTimeInputFormat(locale: string, hourFormat: 12 | 24, seconds: boolean): {
  format: (value: string) => string;
  parse: (value: string) => string | null;
} {
  const code = canonicalWlLocale(locale);
  const digits = localizedDigits(code);
  const formatter = new Intl.DateTimeFormat(code, { hour: "2-digit", minute: "2-digit", second: seconds ? "2-digit" : undefined, hourCycle: hourFormat === 12 ? "h12" : "h23" });
  const morning = new Date(2026, 0, 1, 1, 5, 9);
  const afternoon = new Date(2026, 0, 1, 13, 5, 9);
  const periods = [morning, afternoon].map((date) => formatter.formatToParts(date).find((part) => part.type === "dayPeriod")?.value ?? "");
  const fields: string[] = [];
  const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = formatter.formatToParts(afternoon).map((part) => {
    if (["hour", "minute", "second", "dayPeriod"].includes(part.type)) {
      fields.push(part.type);
      return part.type === "dayPeriod" ? `(${periods.map(escape).join("|")})` : "(\\d{1,2})";
    }
    return escape(part.value.normalize("NFKC")).replace(/\s+/g, "\\s*");
  }).join("");
  const expression = new RegExp(`^${pattern}$`, "iu");
  return {
    format: (value) => {
      const total = timeSeconds(value);
      if (total === null) return "";
      const date = new Date(2026, 0, 1, Math.floor(total / 3600), Math.floor(total / 60) % 60, total % 60);
      return formatter.format(date);
    },
    parse: (value) => {
      const match = expression.exec(digits(value));
      if (!match) return null;
      const parts = new Map(fields.map((field, index) => [field, match[index + 1]!]));
      let hour = Number(parts.get("hour"));
      if (hourFormat === 12) {
        if (hour < 1 || hour > 12) return null;
        const afternoonPeriod = normalizeDateInput(parts.get("dayPeriod") ?? "").toLocaleLowerCase(code) === normalizeDateInput(periods[1]!).toLocaleLowerCase(code);
        hour = hour % 12 + (afternoonPeriod ? 12 : 0);
      }
      const minute = Number(parts.get("minute"));
      const second = Number(parts.get("second") ?? 0);
      return hour < 24 && minute < 60 && second < 60 ? timeValue(hour * 3600 + minute * 60 + second, seconds) : null;
    }
  };
}
