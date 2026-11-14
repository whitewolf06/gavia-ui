/** Use a finite numeric input or the caller's explicit fallback. */
export declare function finiteOr(value: unknown, fallback: number): number;
export declare function clamp(value: number, min: number, max: number): number;
/** A bounded percentage, including ranges whose finite endpoints overflow subtraction. */
export declare function toPercent(value: number, min: number, max: number): number;
export declare function roundToStep(value: number, step: number, min?: number): number;
