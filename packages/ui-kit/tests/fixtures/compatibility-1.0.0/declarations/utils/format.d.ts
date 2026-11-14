export type WlPluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & {
    other: string;
};
declare const byteUnits: readonly ["byte", "kilobyte", "megabyte", "gigabyte", "terabyte"];
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
export declare function canonicalWlLocale(locale: string): string;
export declare function formatWlNumber(locale: string, value: number, options?: Intl.NumberFormatOptions): string;
export declare function wlPlural(locale: string, count: number, forms: WlPluralForms): string;
/** Keeps the library's binary 1024-based sizing, using Intl for units and number punctuation. */
export declare function formatWlBytes(locale: string, bytes: number, options?: WlByteFormatOptions): string;
export declare function formatWlCount(value: number, { max }?: {
    max?: number;
}): string;
/** Percent values use the conventional 0…1 scale. */
export declare function formatWlPercent(locale: string, value: number, options?: Intl.NumberFormatOptions): string;
export {};
