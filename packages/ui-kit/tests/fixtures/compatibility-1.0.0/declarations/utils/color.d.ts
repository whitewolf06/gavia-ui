/** Foundation palette references; resolving CSS values remains the consumer's job. */
export declare const WL_STRING_COLOR_PALETTE: readonly ["var(--wl-blue-500)", "var(--wl-green-500)", "var(--wl-amber-500)", "var(--wl-red-500)"];
export type WlColorPalette<Color extends string = string> = readonly Color[];
/** Stable, case-sensitive NFC name mapping. Custom palettes must not be empty. */
export declare function getWlColorFromString(value: string, palette?: undefined): typeof WL_STRING_COLOR_PALETTE[number];
export declare function getWlColorFromString<Color extends string>(value: string, palette: WlColorPalette<Color>): Color;
/** Normalize an opaque RGB color. Alpha and non-hex colors return null. */
export declare function normalizeWlHex(value: string): string | null;
/** WCAG relative luminance contrast ratio. Invalid opaque colors throw TypeError. */
export declare function getWlContrastRatio(foreground: string, background: string): number;
export declare function meetsWlContrast(foreground: string, background: string, level?: "AA" | "AAA", size?: "normal" | "large"): boolean;
