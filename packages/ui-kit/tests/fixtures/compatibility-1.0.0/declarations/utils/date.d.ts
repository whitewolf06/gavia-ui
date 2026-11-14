/** Parse a calendar date in local time, without the UTC conversion of new Date(iso). */
export declare function parseWlIsoDate(value: string): Date | null;
export declare function toWlIsoDate(date: Date): string;
export declare function formatWlDate(locale: string, value: Date | string, options?: Intl.DateTimeFormatOptions): string;
export declare function formatWlRelativeTime(locale: string, date: Date | number, now?: Date | number): string;
export declare function getWlMonthNames(locale: string, width?: "long" | "short"): string[];
export declare function getWlWeekdayNames(locale: string, width?: "long" | "short" | "narrow"): string[];
export declare function getWlFirstDayOfWeek(locale: string): number;
