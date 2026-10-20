import { contrastRatio, normalizeHex } from "./color.shared.mjs";

/** Foundation palette references; resolving CSS values remains the consumer's job. */
export const WL_STRING_COLOR_PALETTE = Object.freeze([
  "var(--wl-blue-500)", "var(--wl-green-500)", "var(--wl-amber-500)", "var(--wl-red-500)"
] as const);
export type WlColorPalette<Color extends string = string> = readonly Color[];

/** Stable, case-sensitive NFC name mapping. Custom palettes must not be empty. */
export function getWlColorFromString(value: string, palette?: undefined): typeof WL_STRING_COLOR_PALETTE[number];
export function getWlColorFromString<Color extends string>(value: string, palette: WlColorPalette<Color>): Color;
export function getWlColorFromString(value: string, palette: WlColorPalette = WL_STRING_COLOR_PALETTE): string {
  if (!palette.length) throw new RangeError("A string-color palette must contain at least one color.");
  let hash = 2166136261;
  for (const character of value.trim().normalize("NFC")) {
    hash = Math.imul(hash ^ character.codePointAt(0)!, 16777619) >>> 0;
  }
  return palette[hash % palette.length]!;
}

/** Normalize an opaque RGB color. Alpha and non-hex colors return null. */
export function normalizeWlHex(value: string): string | null {
  return normalizeHex(value);
}

/** WCAG relative luminance contrast ratio. Invalid opaque colors throw TypeError. */
export function getWlContrastRatio(foreground: string, background: string): number {
  return contrastRatio(foreground, background);
}

export function meetsWlContrast(
  foreground: string,
  background: string,
  level: "AA" | "AAA" = "AA",
  size: "normal" | "large" = "normal"
): boolean {
  const minimum = level === "AAA" ? (size === "large" ? 4.5 : 7) : (size === "large" ? 3 : 4.5);
  return getWlContrastRatio(foreground, background) >= minimum;
}
