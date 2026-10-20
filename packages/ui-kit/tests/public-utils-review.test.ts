// @vitest-environment node
import { describe, expect, it } from "vitest";
import { createWlLocaleFromIntl, deepMerge, getWlColorFromString, getWlContrastRatio, meetsWlContrast, mergeWlAttrs, normalizeWlHex, WL_STRING_COLOR_PALETTE } from "../src/utils";
import { getWlFirstDayOfWeek, getWlMonthNames, getWlWeekdayNames, parseWlIsoDate, toWlIsoDate } from "../src/utils/date";
import { formatWlBytes, formatWlCount, formatWlNumber, formatWlPercent, wlPlural } from "../src/utils/format";
import { getWlInitials } from "../src/utils/initials";
import { clamp, finiteOr, roundToStep, toPercent } from "../src/utils/number";

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
  it("keeps grapheme clusters and first/last-word initials", () => {
    expect(getWlInitials("  Дмитрий Горбач  ")).toBe("ДГ");
    expect(getWlInitials("Анна-Мария Иванова")).toBe("АИ");
    expect(getWlInitials("👩‍💻 Developer")).toBe("👩‍💻D");
    expect(getWlInitials("")).toBe("");
  });
});
