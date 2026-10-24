import { finiteOr } from "./number";

export type WlPluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };
const byteUnits = ["byte", "kilobyte", "megabyte", "gigabyte", "terabyte"] as const;
export type WlByteUnit = typeof byteUnits[number];
export interface WlByteFormatOptions {
  /** Largest binary unit to select; defaults to terabyte. */
  maxUnit?: WlByteUnit;
  /** Explicit labels override Intl only for the matching unit. */
  unitLabels?: Partial<Record<WlByteUnit, string>>;
  /** Replace the decimal part without changing grouping or unit text. */
  decimalSeparator?: string;
  /** Omit to retain the locale's default grouping. */
  useGrouping?: boolean;
  /** A fixed precision, or a precision chosen from the scaled value and unit. */
  maximumFractionDigits?: number | ((value: number, unit: WlByteUnit) => number);
}
const numbers = new Map<string, Intl.NumberFormat>();
const plurals = new Map<string, Intl.PluralRules>();

export function canonicalWlLocale(locale: string): string {
  try {
    return Intl.getCanonicalLocales(locale)[0] ?? "en";
  } catch {
    return "en";
  }
}

function numberFormatter(locale: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const code = canonicalWlLocale(locale);
  const key = code + JSON.stringify(options);
  let formatter = numbers.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(code, options);
    numbers.set(key, formatter);
  }
  return formatter;
}

export function formatWlNumber(locale: string, value: number, options: Intl.NumberFormatOptions = {}): string {
  return numberFormatter(locale, options).format(finiteOr(value, 0));
}

export function wlPlural(locale: string, count: number, forms: WlPluralForms): string {
  const code = canonicalWlLocale(locale);
  let rules = plurals.get(code);
  if (!rules) {
    rules = new Intl.PluralRules(code);
    plurals.set(code, rules);
  }
  const text = forms[rules.select(count)] ?? forms.other;
  return text.replace(/\{count\}/g, formatWlNumber(code, count));
}

/** Keeps the library's binary 1024-based sizing, using Intl for units and number punctuation. */
export function formatWlBytes(locale: string, bytes: number, options: WlByteFormatOptions = {}): string {
  const value = Math.max(0, finiteOr(bytes, 0));
  const maxIndex = options.maxUnit === undefined ? byteUnits.length - 1 : byteUnits.indexOf(options.maxUnit);
  const index = value === 0 ? 0 : Math.max(0, Math.min(Math.max(0, maxIndex), Math.floor(Math.log(value) / Math.log(1024))));
  const unit = byteUnits[index]!;
  const scaled = value / 1024 ** index;
  const digits = typeof options.maximumFractionDigits === "function"
    ? options.maximumFractionDigits(scaled, unit)
    : options.maximumFractionDigits ?? (index === 0 ? 0 : 1);
  const label = options.unitLabels?.[unit];
  const numberOptions: Intl.NumberFormatOptions = label === undefined
    ? { style: "unit", unit, unitDisplay: "short", maximumFractionDigits: digits }
    : { maximumFractionDigits: digits };
  if (options.useGrouping !== undefined) numberOptions.useGrouping = options.useGrouping;
  const formatter = numberFormatter(locale, numberOptions);
  const text = options.decimalSeparator === undefined
    ? formatter.format(scaled)
    : formatter.formatToParts(scaled).map((part) => part.type === "decimal" ? options.decimalSeparator : part.value).join("");
  return label === undefined ? text : `${text} ${label}`;
}

export function formatWlCount(value: number, { max = 99 }: { max?: number } = {}): string {
  const limit = Math.max(0, Math.floor(finiteOr(max, 99)));
  const count = Math.max(0, Math.floor(finiteOr(value, 0)));
  return count > limit ? `${limit}+` : String(count);
}

/** Percent values use the conventional 0…1 scale. */
export function formatWlPercent(locale: string, value: number, options: Intl.NumberFormatOptions = {}): string {
  return formatWlNumber(locale, value, { maximumFractionDigits: 1, ...options, style: "percent" });
}
