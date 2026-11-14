import { WlDateFormatOptions } from "../picker-types.js";
export declare function normalizeDateInput(value: string): string;
export declare function localizedDigits(locale: string): (value: string) => string;
/** A Gregorian calendar-date presentation with a matching parser, independent of timezone conversion. */
export declare function createDateInputFormat(locale: string, options?: WlDateFormatOptions): {
    format: (iso: string) => string;
    parse: (value: string, reference?: string | null) => string | null;
};
