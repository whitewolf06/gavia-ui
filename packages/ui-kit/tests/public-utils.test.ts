// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { createWlLocaleFromIntl, deepMerge, formatWlDate, formatWlRelativeTime, getWlColorFromString, getWlContrastRatio, meetsWlContrast, mergeWlAttrs, normalizeWlHex, WL_STRING_COLOR_PALETTE } from "../src/utils";
import { getWlFirstDayOfWeek, getWlMonthNames, getWlWeekdayNames, parseWlIsoDate, toWlIsoDate } from "../src/utils/date";
import { createDateInputFormat, localizedDigits, normalizeDateInput } from "../src/utils/dateInputFormat";
import { formatWlBytes, formatWlCount, formatWlNumber, formatWlPercent, wlPlural } from "../src/utils/format";
import { getWlInitials } from "../src/utils/initials";
import { clamp, finiteOr, roundToStep, toPercent } from "../src/utils/number";
import { createTimeInputFormat, timeInInterval, timeSeconds, timeValue } from "../src/utils/timeInputFormat";

describe("pure public utilities", () => {
  it("shares opaque color normalization and WCAG thresholds without DOM", () => {
    expect(normalizeWlHex(" #aBc ")).toBe("#aabbcc");
    expect(normalizeWlHex("#abcdef80")).toBeNull();
    expect(getWlContrastRatio("#fff", "#000")).toBe(21);
    expect(meetsWlContrast("#777", "#fff", "AA", "normal")).toBe(false);
    expect(meetsWlContrast("#777", "#fff", "AA", "large")).toBe(true);
    expect(() => getWlContrastRatio("transparent", "#fff")).toThrow(TypeError);
  });
  it("derives calendar metadata from Intl and retains explicit UI phrases", () => {
    const locale = createWlLocaleFromIntl("fr-FR", { close: "Fermer" });
    expect(locale.monthNames[0]).toBe("janvier");
    expect(locale.firstDayOfWeek).toBe(1);
    expect(locale.close).toBe("Fermer");
    expect(locale.accept).toBe("Confirm");
  });
  it("merges attrs and plain objects without prototype pollution or merging Date instances", () => {
    const date = new Date(0);
    const merged = deepMerge({ nested: { a: 1 }, values: [1], date }, { nested: { b: 2 }, values: [2], date: new Date(1) });
    expect(merged.nested).toEqual({ a: 1, b: 2 });
    expect(merged.values).toEqual([2]);
    expect(merged.date.getTime()).toBe(1);
    expect(deepMerge({}, JSON.parse('{"__proto__":{"polluted":true}}'))).toEqual({});
    expect(Object.prototype).not.toHaveProperty("polluted");
    const attrs = mergeWlAttrs({ class: "a", style: { color: "red" }, id: "a" }, { class: ["b"], id: undefined });
    expect((attrs.class as unknown[]).flat(Infinity)).toEqual(["a", "b"]);
    expect(attrs.id).toBe("a");
    expect(attrs.style).toEqual([{ color: "red" }]);
  });
  it.each([[0, "0 файлов"], [1, "1 файл"], [2, "2 файла"], [5, "5 файлов"], [11, "11 файлов"], [21, "21 файл"], [1.5, "1,5 файла"]])("pluralizes Russian %s", (count, result) => {
    expect(wlPlural("ru", Number(count), { one: "{count} файл", few: "{count} файла", many: "{count} файлов", other: "{count} файла" })).toBe(result);
  });
  it.each([0, 1, 2, 5, 11, 21, 1.5])("pluralizes English %s", (count) => {
    expect(wlPlural("en", count, { one: "{count} file", other: "{count} files" })).toBe(`${count} ${count === 1 ? "file" : "files"}`);
  });
  it.each([
    [0, 0, "byte"], [0.5, 0.5, "byte"], [1023, 1023, "byte"], [1024, 1, "kilobyte"],
    [1536, 1.5, "kilobyte"], [1048576, 1, "megabyte"], [1572864, 1.5, "megabyte"],
    [1073741824, 1, "gigabyte"], [1099511627776, 1, "terabyte"],
    [-1, 0, "byte"], [Number.NaN, 0, "byte"], [Infinity, 0, "byte"]
  ] as const)("formats byte boundary %s with the correct value and unit", (bytes, scaled, unit) => {
    for (const locale of ["en", "ru"]) {
      const expected = new Intl.NumberFormat(locale, {
        style: "unit", unit, unitDisplay: "short", maximumFractionDigits: unit === "byte" ? 0 : 1
      }).format(scaled);
      expect(formatWlBytes(locale, bytes)).toBe(expected);
    }
  });
  it("retains binary sizes, unit caps and legacy upload punctuation through explicit options", () => {
    const options = {
      maxUnit: "megabyte" as const,
      unitLabels: { byte: "Б", kilobyte: "КБ", megabyte: "МБ" },
      decimalSeparator: ",", useGrouping: false,
      maximumFractionDigits: (value: number) => value >= 100 ? 0 : 1
    };
    expect(formatWlBytes("en", 1023, options)).toBe("1023 Б");
    expect(formatWlBytes("en", 1024, options)).toBe("1 КБ");
    expect(formatWlBytes("en", 1536, options)).toBe("1,5 КБ");
    expect(formatWlBytes("en", 1572864, options)).toBe("1,5 МБ");
    expect(formatWlBytes("en", 100.25 * 1024, options)).toBe("100 КБ");
    expect(formatWlBytes("en", 1024 ** 3, options)).toBe("1024 МБ");
  });
  it("formats fractional bytes with the byte unit rather than a negative unit index", () => {
    expect(formatWlBytes("en", 0.5, { unitLabels: { byte: "B" } })).toBe("1 B");
  });
  it("replaces only decimal parts and retains Intl units when no label is overridden", () => {
    expect(formatWlBytes("en", 1234.5 * 1024, {
      maxUnit: "kilobyte", unitLabels: { kilobyte: "blocks" }, decimalSeparator: "·"
    })).toBe("1,234·5 blocks");
    const expected = new Intl.NumberFormat("en", {
      style: "unit", unit: "kilobyte", unitDisplay: "short", maximumFractionDigits: 1
    }).format(1.5);
    expect(formatWlBytes("en", 1536, {})).toBe(expected);
    expect(formatWlBytes("en", 1536, { unitLabels: { megabyte: "MB" } })).toBe(expected);
  });
  it("maps names to stable token colors without changing a supplied palette", () => {
    expect(getWlColorFromString("a")).toBe("var(--wl-blue-500)");
    expect(getWlColorFromString("b")).toBe("var(--wl-green-500)");
    expect(getWlColorFromString("c")).toBe("var(--wl-amber-500)");
    expect(getWlColorFromString("d")).toBe("var(--wl-red-500)");
    expect(getWlColorFromString("  a  ")).toBe(getWlColorFromString("a"));
    expect(getWlColorFromString("E\u0301lodie")).toBe(getWlColorFromString("Élodie"));
    const palette = Object.freeze(["coral", "indigo", "teal", "gold"] as const);
    expect(getWlColorFromString("a", palette)).toBe("coral");
    expect(getWlColorFromString("b", palette)).toBe("indigo");
    expect(palette).toEqual(["coral", "indigo", "teal", "gold"]);
    expect(Object.isFrozen(WL_STRING_COLOR_PALETTE)).toBe(true);
    expect(() => getWlColorFromString("name", [])).toThrow(RangeError);
  });
  it("formats bounded counts and percentage fractions", () => {
    expect(formatWlCount(100)).toBe("99+");
    expect(formatWlCount(0)).toBe("0");
    expect(formatWlNumber("en", 1234.5)).toBe("1,234.5");
    expect(formatWlPercent("en", 0.125)).toBe("12.5%");
  });
  it("handles extreme ranges without overflowing percentages", () => {
    expect(toPercent(0, -Number.MAX_VALUE, Number.MAX_VALUE)).toBe(50);
    expect(toPercent(10, 0, 10)).toBe(100);
    expect(toPercent(1, 1, 1)).toBe(0);
    expect(clamp(Number.NaN, 3, 8)).toBe(3);
    expect(finiteOr(Infinity, 4)).toBe(4);
    expect(roundToStep(0.29, 0.1)).toBe(0.3);
  });
  it("rejects impossible dates and preserves calendar dates including years below 100", () => {
    expect(parseWlIsoDate("2025-02-29")).toBeNull();
    expect(parseWlIsoDate("2026-13-01")).toBeNull();
    expect(toWlIsoDate(parseWlIsoDate("2024-02-29")!)).toBe("2024-02-29");
    expect(toWlIsoDate(parseWlIsoDate("0099-01-02")!)).toBe("0099-01-02");
    expect(getWlMonthNames("ru")).toHaveLength(12);
    expect(getWlWeekdayNames("en")[0]).toBe("Sun");
    expect(getWlFirstDayOfWeek("en-US")).toBe(0);
    expect(getWlFirstDayOfWeek("ru-RU")).toBe(1);
  });
  it("formats calendar dates in the requested locale and applies an explicit timezone to instants", () => {
    expect(formatWlDate("en-US", "2026-10-21")).toBe("10/21/2026");
    expect(formatWlDate("de-DE", new Date(2026, 9, 21), { day: "numeric", month: "long", year: "numeric" })).toBe("21. Oktober 2026");
    expect(formatWlDate("en-US", new Date("2026-10-20T23:30:00Z"), {
      timeZone: "Pacific/Kiritimati", day: "numeric", month: "long", year: "numeric"
    })).toBe("October 21, 2026");
    expect(formatWlDate("invalid_locale", "2026-10-21")).toBe(formatWlDate("en", "2026-10-21"));
    expect(formatWlDate("en", "not a date")).toBe("");
    expect(formatWlDate("en", "2026-02-29")).toBe("");
    expect(formatWlDate("en", new Date(Number.NaN))).toBe("");
    expect(toWlIsoDate(new Date(Number.NaN))).toBe("");
  });
  it("selects relative-time units using an explicit clock and preserves locale phrases", () => {
    const now = Date.UTC(2026, 9, 21, 12);
    const cases = [
      [365 * 86400, "next year"], [-60 * 86400, "2 months ago"], [14 * 86400, "in 2 weeks"],
      [-86400, "yesterday"], [7200, "in 2 hours"], [-120, "2 minutes ago"], [30, "in 30 seconds"], [0, "now"]
    ] as const;
    for (const [seconds, expected] of cases) {
      expect(formatWlRelativeTime("en", now + seconds * 1000, now)).toBe(expected);
    }
    expect(formatWlRelativeTime("ru", new Date(now + 86400000), new Date(now))).toBe("завтра");
    expect(formatWlRelativeTime("de-DE", new Date(now + 7200000), now)).toBe("in 2 Stunden");
    expect(formatWlRelativeTime("invalid_locale", now, now)).toBe("now");
    expect(formatWlRelativeTime("en", Number.NaN, now)).toBe("");
    expect(formatWlRelativeTime("en", now, Infinity)).toBe("");
    expect(formatWlRelativeTime("en", new Date(Number.NaN), new Date(now))).toBe("");
    expect(formatWlRelativeTime("en", new Date(now), new Date(Number.NaN))).toBe("");
  });
  it("uses the current clock only when relative-time now is omitted", () => {
    vi.useFakeTimers();
    const now = new Date("2026-10-21T12:00:00Z");
    vi.setSystemTime(now);
    try {
      expect(formatWlRelativeTime("en", new Date("2026-10-21T12:00:05Z"))).toBe("in 5 seconds");
      expect(formatWlRelativeTime("en", now, new Date("2026-10-20T12:00:00Z"))).toBe("tomorrow");
    } finally {
      vi.useRealTimers();
    }
  });
  it("supports legacy Intl week metadata and regional fallbacks when week metadata is unavailable", () => {
    const prototype = Intl.Locale.prototype;
    const getWeekInfo = Object.getOwnPropertyDescriptor(prototype, "getWeekInfo");
    const weekInfo = Object.getOwnPropertyDescriptor(prototype, "weekInfo");
    Object.defineProperty(prototype, "getWeekInfo", { configurable: true, value: undefined });
    Object.defineProperty(prototype, "weekInfo", { configurable: true, get: () => ({ firstDay: 7 }) });
    try {
      expect(getWlFirstDayOfWeek("en-US")).toBe(0);
      Object.defineProperty(prototype, "weekInfo", { configurable: true, value: undefined });
      expect(getWlFirstDayOfWeek("en-US")).toBe(0);
      expect(getWlFirstDayOfWeek("ar-AE")).toBe(6);
      expect(getWlFirstDayOfWeek("fr-FR")).toBe(1);
    } finally {
      if (getWeekInfo) Object.defineProperty(prototype, "getWeekInfo", getWeekInfo);
      else Reflect.deleteProperty(prototype, "getWeekInfo");
      if (weekInfo) Object.defineProperty(prototype, "weekInfo", weekInfo);
      else Reflect.deleteProperty(prototype, "weekInfo");
    }
  });
  it("rejects malformed localized dates and resolves short years around the reference century", () => {
    const format = createDateInputFormat("en-US", { dateStyle: "short" });
    expect(format.format("2026-13-01")).toBe("");
    expect(format.parse("not a date", "2026-10-21")).toBeNull();
    expect(format.parse("2/29/25", "2026-10-21")).toBeNull();
    expect(format.parse("1/2/76", "2026-10-21")).toBe("1976-01-02");
    expect(format.parse("1/2/25", "2080-10-21")).toBe("2125-01-02");
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 21));
    try {
      expect(format.parse("1/2/76")).toBe("1976-01-02");
      expect(format.parse("1/2/76", "invalid reference")).toBe("1976-01-02");
    } finally {
      vi.useRealTimers();
    }
    expect(normalizeDateInput("\u200E ２０２６-１０-２１ \u200F")).toBe("2026-10-21");
    expect(localizedDigits("ar-EG")("\u061C١٢٣")).toBe("123");
  });
  it("round trips midnight and afternoon twelve-hour input without accepting invalid clock fields", () => {
    const format = createTimeInputFormat("en-US", 12, true);
    for (const value of ["00:00:00", "12:00:00", "13:05:09", "23:59:59"]) {
      expect(format.parse(format.format(value))).toBe(value);
    }
    expect(format.format("24:00:00")).toBe("");
    expect(format.parse("not a time")).toBeNull();
    expect(format.parse("00:05:09 AM")).toBeNull();
    expect(format.parse("13:05:09 PM")).toBeNull();
    expect(format.parse("01:60:09 PM")).toBeNull();
    expect(format.parse("01:05:60 PM")).toBeNull();
    const twentyFour = createTimeInputFormat("de-DE", 24, false);
    expect(twentyFour.parse(twentyFour.format("23:59"))).toBe("23:59");
    expect(twentyFour.parse("24:00")).toBeNull();
    expect(twentyFour.parse("00:60")).toBeNull();
  });
  it("preserves clock precision and includes both ends of normal and overnight intervals", () => {
    expect(timeSeconds("00:00")).toBe(0);
    expect(timeSeconds("23:59:59")).toBe(86399);
    for (const value of ["9:00", "24:00", "12:60", "12:00:60", "not a time"]) {
      expect(timeSeconds(value)).toBeNull();
    }
    expect(timeValue(47109, true)).toBe("13:05:09");
    expect(timeValue(47109, false)).toBe("13:05");
    expect(timeInInterval(3600, 3600, 7200)).toBe(true);
    expect(timeInInterval(7200, 3600, 7200)).toBe(true);
    expect(timeInInterval(0, 3600, 7200)).toBe(false);
    expect(timeInInterval(23 * 3600, 22 * 3600, 2 * 3600)).toBe(true);
    expect(timeInInterval(3600, 22 * 3600, 2 * 3600)).toBe(true);
    expect(timeInInterval(12 * 3600, 22 * 3600, 2 * 3600)).toBe(false);
  });
  it("keeps grapheme clusters and first/last-word initials", () => {
    expect(getWlInitials("  Дмитрий Горбач  ")).toBe("ДГ");
    expect(getWlInitials("Анна-Мария Иванова")).toBe("АИ");
    expect(getWlInitials("👩‍💻 Developer")).toBe("👩‍💻D");
    expect(getWlInitials("")).toBe("");
  });
});
