import type { WlThemeName } from "gavia-ui";
import { wlContrastPairs } from "gavia-ui";
import { createWlTheme, parseWlThemeConfig, type WlThemeConfig, type WlThemeOverrides, type WlThemePalette } from "gavia-ui/theme";
import { getWlContrastRatio, normalizeWlHex } from "gavia-ui/utils";
import { localizeContrastLabel } from "../design-system/localized-tokens";
import { translate as t } from "../i18n";

// Browser-local drafts keep their original palette-only version 1 format.
export const THEME_DRAFT_SCHEMA_VERSION = 1 as const;

export const themePaletteFields = [
  { key: "background", get label() {
    return t("shell.theme_builder.palette.text595");
  }, get description() {
    return t("shell.theme_builder.palette.text596");
  } },
  { key: "surface", get label() {
    return t("shell.theme_builder.palette.text597");
  }, get description() {
    return t("shell.theme_builder.palette.text598");
  } },
  { key: "softSurface", label: "Soft surface", get description() {
    return t("shell.theme_builder.palette.text599");
  } },
  { key: "text", get label() {
    return t("shell.theme_builder.palette.text600");
  }, get description() {
    return t("shell.theme_builder.palette.text601");
  } },
  { key: "mutedText", get label() {
    return t("shell.theme_builder.palette.text602");
  }, get description() {
    return t("shell.theme_builder.palette.text603");
  } },
  { key: "border", get label() {
    return t("shell.theme_builder.palette.text604");
  }, get description() {
    return t("shell.theme_builder.palette.text605");
  } },
  { key: "primary", get label() {
    return t("shell.theme_builder.palette.text606");
  }, get description() {
    return t("shell.theme_builder.palette.text607");
  } },
  { key: "link", get label() {
    return t("shell.theme_builder.palette.text608");
  }, get description() {
    return t("shell.theme_builder.palette.text609");
  } }
] as const;

export type ThemePalette = WlThemePalette;
export type ThemeOverrides = WlThemeOverrides;
export interface ThemeContrast {
  key: string;
  label: string;
  foreground: string;
  background: string;
  ratio: number;
  minimum: number;
  passes: boolean;
}
export interface ThemeDraft {
  name: string;
  baseTheme: WlThemeName;
  palette: ThemePalette;
}
interface ThemeSpec extends WlThemeConfig { palette: ThemePalette }
export interface ThemeExport {
  spec: ThemeSpec;
  json: string;
  css: string;
  prompt: string;
}

export const normalizeHex = normalizeWlHex;

export function createThemePalette(baseTheme: WlThemeName): ThemePalette {
  return parseWlThemeConfig({ schemaVersion: 2, name: "theme-preview", baseTheme }).palette as ThemePalette;
}

export function createThemeOverrides(palette: ThemePalette, baseTheme: WlThemeName): ThemeOverrides {
  return createWlTheme({ schemaVersion: 2, name: "theme-preview", baseTheme, palette, mode: "delta", contrastPairs: [] }).overrides;
}

export function getContrastRatio(foreground: string, background: string): number {
  try {
    return getWlContrastRatio(foreground, background);
  } catch {
    throw new Error(t("shell.theme_builder.palette.text612"));
  }
}

export function getThemeContrast(palette: ThemePalette, baseTheme: WlThemeName): ThemeContrast[] {
  return createWlTheme({ schemaVersion: 2, name: "theme-preview", baseTheme, palette, mode: "delta" }).contrast.map(({ name, ...pair }) => ({
    ...pair, key: name,
    label: name === "checked" ? t("shell.theme_builder.palette.text615") : localizeContrastLabel(name, wlContrastPairs.find((item) => item.name === name)?.label ?? name)
  }));
}

export function isThemeNameValid(name: string): boolean {
  try {
    parseWlThemeConfig({ schemaVersion: 2, name, baseTheme: "gavia" });
    return true;
  } catch {
    return false;
  }
}

export function parseThemeDraft(value: unknown): ThemeDraft | null {
  if (!value || typeof value !== "object" || !("schemaVersion" in value) || value.schemaVersion !== THEME_DRAFT_SCHEMA_VERSION) return null;
  try {
    const draft = parseWlThemeConfig(value);
    return { name: draft.name, baseTheme: draft.baseTheme, palette: draft.palette as ThemePalette };
  } catch {
    return null;
  }
}

export function createThemeExport(name: string, baseTheme: WlThemeName, palette: ThemePalette): ThemeExport {
  const spec = parseWlThemeConfig({ schemaVersion: 2, name, baseTheme, palette }) as ThemeSpec;
  const { css } = createWlTheme(spec);
  const json = JSON.stringify(spec, null, 2);
  const prompt = [
    t("shell.theme_builder.palette.text617", { arg0: name, arg1: baseTheme }),
    t("shell.theme_builder.palette.text618"),
    t("shell.theme_builder.palette.text619"),
    t("shell.theme_builder.palette.text620"),
    t("shell.theme_builder.palette.text621"),
    t("shell.theme_builder.palette.text622"),
    t("shell.theme_builder.palette.text623"),
    t("shell.theme_builder.palette.text624"),
    json
  ].join("\n\n");
  return { spec, json, css, prompt };
}
