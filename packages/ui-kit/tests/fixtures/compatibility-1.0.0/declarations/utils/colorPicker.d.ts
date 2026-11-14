export interface PickerHsva {
    h: number;
    s: number;
    v: number;
    a: number;
}
export declare function normalizePickerColor(value: string, alpha: boolean): string | null;
export declare function pickerHsva(value: string): PickerHsva;
export declare function pickerHex(hsva: PickerHsva, alpha: boolean): string;
