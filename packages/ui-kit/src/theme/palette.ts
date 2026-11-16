import type { WlDesignTokenName } from "../design-system/tokens.generated";
import type { WlThemeName } from "../design-system/types";
import type { WlThemeOverrides, WlThemePalette } from "./types";
import { resolveWlToken, wlDesignThemes } from "../design-system";
import { getWlContrastRatio } from "../utils/color";

export const paletteTokens: Record<keyof WlThemePalette, WlDesignTokenName> = {
  background: "--wl-bg", surface: "--wl-bg-raised", softSurface: "--wl-bg-soft",
  text: "--wl-text", mutedText: "--wl-text-muted", border: "--wl-border",
  primary: "--wl-action-primary-bg", link: "--wl-accent"
};
const foundationFields: Record<Exclude<keyof WlThemePalette, "primary">, WlDesignTokenName> = {
  background: "--wl-palette-bg", surface: "--wl-palette-bg-raised", softSurface: "--wl-palette-bg-soft",
  text: "--wl-palette-text", mutedText: "--wl-palette-text-2", border: "--wl-palette-border", link: "--wl-palette-accent"
};
const primaryBindings: WlThemeOverrides = {
  "--wl-action-primary-bg": "var(--wl-palette-action-primary-bg)",
  "--wl-action-primary-hover": "var(--wl-palette-action-primary-hover)",
  "--wl-action-primary-active": "var(--wl-palette-action-primary-active)",
  "--wl-action-primary-text": "var(--wl-palette-action-primary-text)"
};

export function baseTheme(name: WlThemeName) {
  const theme = wlDesignThemes.find((item) => item.name === name);
  if (!theme) throw new TypeError(`Unknown Gavia UI base theme: ${name}`);
  return theme;
}

export function basePalette(theme: WlThemeName): WlThemePalette {
  baseTheme(theme);
  return Object.fromEntries(Object.entries(paletteTokens).map(([key, token]) => [key, resolveWlToken(token, theme)])) as WlThemePalette;
}

function mix(color: string, target: string, weight: number): string {
  return "#" + [1, 3, 5].map((offset) => Math.round(
    Number.parseInt(color.slice(offset, offset + 2), 16) * (1 - weight)
    + Number.parseInt(target.slice(offset, offset + 2), 16) * weight
  ).toString(16).padStart(2, "0")).join("");
}

function readableForeground(background: string): string {
  if (getWlContrastRatio("#211a12", background) >= 4.5) return "#211a12";
  return getWlContrastRatio("#ffffff", background) >= getWlContrastRatio("#000000", background) ? "#ffffff" : "#000000";
}

function primaryState(color: string, weight: number): string {
  return mix(color, readableForeground(color) === "#ffffff" ? "#000000" : "#ffffff", weight);
}

/** Existing Playground palette derivation, shared by every public output. */
export function paletteOverrides(palette: WlThemePalette, theme: WlThemeName): WlThemeOverrides {
  const baseline = basePalette(theme);
  const changed = (key: keyof WlThemePalette) => palette[key] !== baseline[key];
  const overrides: WlThemeOverrides = {};
  for (const key of Object.keys(foundationFields) as (keyof typeof foundationFields)[]) {
    if (changed(key)) overrides[foundationFields[key]] = palette[key];
  }
  if (changed("background") && !changed("surface")) overrides["--wl-palette-bg-raised"] = palette.surface;
  if (changed("background") || changed("softSurface")) overrides["--wl-palette-bg-hover"] = mix(palette.softSurface, palette.text, 0.04);
  if (changed("border")) overrides["--wl-palette-border-2"] = mix(palette.border, palette.text, 0.16);
  if (changed("mutedText")) overrides["--wl-palette-text-3"] = mix(palette.mutedText, palette.background, 0.25);
  if (changed("link")) {
    overrides["--wl-palette-text-accent"] = palette.link;
    overrides["--wl-palette-accent-hover"] = mix(palette.link, palette.text, 0.1);
    overrides["--wl-palette-on-accent"] = readableForeground(palette.link);
  }
  if (changed("primary") || changed("link")) {
    Object.assign(overrides, primaryBindings);
    overrides["--wl-palette-action-primary-bg"] = palette.primary;
    overrides["--wl-palette-action-primary-hover"] = changed("primary") ? primaryState(palette.primary, 0.08) : resolveWlToken("--wl-action-primary-hover", theme);
    overrides["--wl-palette-action-primary-active"] = changed("primary") ? primaryState(palette.primary, 0.16) : resolveWlToken("--wl-action-primary-active", theme);
    overrides["--wl-palette-action-primary-text"] = changed("primary") ? readableForeground(palette.primary) : resolveWlToken("--wl-action-primary-text", theme);
  }
  if (changed("primary") || changed("link") || changed("background") || changed("surface")) {
    const dark = baseTheme(theme).colorScheme === "dark";
    overrides["--wl-palette-accent-soft"] = mix(palette.surface, palette.primary, dark ? 0.18 : 0.12);
    overrides["--wl-palette-accent-soft-hover"] = mix(palette.surface, palette.primary, dark ? 0.25 : 0.19);
    overrides["--wl-palette-accent-border"] = mix(palette.surface, palette.primary, 0.34);
    overrides["--wl-palette-accent-border-hover"] = mix(palette.surface, palette.primary, 0.46);
  }
  return overrides;
}
