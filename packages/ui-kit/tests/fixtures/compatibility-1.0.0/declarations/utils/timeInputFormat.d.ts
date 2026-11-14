export declare function timeSeconds(value: string): number | null;
export declare function timeValue(seconds: number, precision: boolean): string;
export declare function timeInInterval(value: number, start: number, end: number): boolean;
export declare function createTimeInputFormat(locale: string, hourFormat: 12 | 24, seconds: boolean): {
    format: (value: string) => string;
    parse: (value: string) => string | null;
};
