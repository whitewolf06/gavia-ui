import type { WlDesignTokenName } from "../design-system/tokens.generated";
import type { WlThemeName } from "../design-system/types";

export type WlThemePalette = Record<
  "background" | "surface" | "softSurface" | "text" | "mutedText" | "border" | "primary" | "link",
  string
>;
export type WlThemeOverrides = Partial<Record<WlDesignTokenName, string>>;

/** A named pair of opaque colors resolved from the final token graph. */
export interface WlThemeContrastPair {
  name: string;
  foreground: WlDesignTokenName;
  background: WlDesignTokenName;
  minimum: number;
}

/** Input settings only; generated token deltas are returned separately. */
export interface WlThemeConfig {
  schemaVersion: 2;
  name: string;
  baseTheme: WlThemeName;
  palette?: Partial<WlThemePalette>;
  overrides?: WlThemeOverrides;
  mode?: "full" | "delta";
  contrastPairs?: readonly WlThemeContrastPair[];
}

export interface WlThemeContrastResult {
  name: string;
  foreground: string;
  background: string;
  minimum: number;
  ratio: number;
  passes: boolean;
}

export interface WlThemeResult {
  css: string;
  overrides: WlThemeOverrides;
  contrast: WlThemeContrastResult[];
}
