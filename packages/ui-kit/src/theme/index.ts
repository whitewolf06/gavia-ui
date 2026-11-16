import type { WlDesignTokenName } from "../design-system/tokens.generated";
import type { WlDesignTokenDefinition, WlThemeName } from "../design-system/types";
import type { WlThemeConfig, WlThemeContrastPair, WlThemeOverrides, WlThemePalette, WlThemeResult } from "./types";
import { wlContrastPairs, wlDesignThemes, wlDesignTokens } from "../design-system/tokens.generated";
import { getWlContrastRatio, normalizeWlHex } from "../utils/color";
import { basePalette, baseTheme, paletteOverrides, paletteTokens } from "./palette";

export type { WlThemeConfig, WlThemeContrastPair, WlThemeContrastResult, WlThemeOverrides, WlThemePalette, WlThemeResult } from "./types";

const definitions = new Map<WlDesignTokenName, WlDesignTokenDefinition>(wlDesignTokens.map((token) => [token.name, token]));
const defaultPairs: readonly WlThemeContrastPair[] = [
  ...wlContrastPairs.map(({ name, foreground, background, minimum }) => ({ name, foreground, background, minimum })),
  { name: "checked", foreground: "--wl-on-accent", background: "--wl-accent", minimum: 3 }
];

function record(value: unknown, name: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError(`${name} must be an object.`);
  return value as Record<string, unknown>;
}

function tokenName(value: unknown): WlDesignTokenName {
  if (typeof value !== "string" || !definitions.has(value as WlDesignTokenName)) throw new TypeError(`Unknown Gavia UI token: ${String(value)}`);
  return value as WlDesignTokenName;
}

function pairs(value: unknown): WlThemeContrastPair[] {
  if (!Array.isArray(value)) throw new TypeError("contrastPairs must be an array.");
  const names = new Set<string>();
  return value.map((input) => {
    const pair = record(input, "Contrast pair");
    if (typeof pair.name !== "string" || !pair.name.trim() || names.has(pair.name)) throw new TypeError("Contrast pairs need unique nonempty names.");
    if (typeof pair.minimum !== "number" || !Number.isFinite(pair.minimum) || pair.minimum < 1 || pair.minimum > 21) throw new TypeError(`Invalid contrast minimum: ${pair.name}`);
    names.add(pair.name);
    return { name: pair.name, foreground: tokenName(pair.foreground), background: tokenName(pair.background), minimum: pair.minimum };
  });
}

/** Normalize input settings; v1 snapshots retain their original palette-only meaning. */
export function parseWlThemeConfig(value: unknown): WlThemeConfig {
  const input = record(value, "Theme configuration");
  const legacy = input.schemaVersion === 1;
  if (!legacy && input.schemaVersion !== 2) throw new TypeError("Unsupported theme schemaVersion; expected 2 or a legacy version 1 draft.");
  if (typeof input.name !== "string" || !/^[a-z][a-z0-9-]{0,31}$/.test(input.name)) throw new TypeError("Theme name must contain 1–32 lowercase letters, digits or hyphens and begin with a letter.");
  if (wlDesignThemes.some((theme) => theme.name === input.name)) throw new TypeError("A custom theme name cannot replace a shipped theme.");
  if (typeof input.baseTheme !== "string") throw new TypeError("baseTheme must name a shipped theme.");
  const theme = input.baseTheme as WlThemeName;
  const palette = basePalette(theme);
  if (legacy && input.palette === undefined) throw new TypeError("A legacy draft requires all eight palette colors.");
  if (input.palette !== undefined) {
    const colors = record(input.palette, "Palette");
    if (!legacy && Object.keys(colors).some((key) => !Object.prototype.hasOwnProperty.call(paletteTokens, key))) throw new TypeError("Unknown theme palette role.");
    for (const key of Object.keys(paletteTokens) as (keyof WlThemePalette)[]) {
      if (!legacy && !Object.prototype.hasOwnProperty.call(colors, key)) continue;
      const color = typeof colors[key] === "string" ? normalizeWlHex(colors[key]) : null;
      if (!color) throw new TypeError(`Palette ${key} requires an opaque HEX color.`);
      palette[key] = color;
    }
  }
  const config: WlThemeConfig = { schemaVersion: 2, name: input.name, baseTheme: theme, palette, mode: "full" };
  if (legacy) return config;
  const fields = new Set(["schemaVersion", "name", "baseTheme", "palette", "overrides", "mode", "contrastPairs"]);
  for (const key of Object.keys(input)) if (!fields.has(key)) throw new TypeError(`Unknown theme configuration field: ${key}`);
  if (input.mode !== undefined) {
    if (input.mode !== "full" && input.mode !== "delta") throw new TypeError("Theme mode must be full or delta.");
    config.mode = input.mode;
  }
  if (input.overrides !== undefined) {
    const manual = record(input.overrides, "Overrides");
    const overrides: WlThemeOverrides = {};
    for (const [key, value] of Object.entries(manual).sort(([first], [second]) => first < second ? -1 : first > second ? 1 : 0)) {
      const name = tokenName(key);
      if (typeof value !== "string" || !value.trim() || /[;{}<>!]|\/\*|\*\//.test(value)
        || [...value].some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127)) throw new TypeError(`Invalid CSS value for ${name}`);
      overrides[name] = value.trim();
    }
    config.overrides = overrides;
  }
  if (input.contrastPairs !== undefined) config.contrastPairs = pairs(input.contrastPairs);
  return config;
}

/** Generate deterministic CSS and a report for the selected opaque color pairs. */
export function createWlTheme(input: WlThemeConfig): WlThemeResult {
  const config = parseWlThemeConfig(input);
  const theme = baseTheme(config.baseTheme);
  const delta = { ...paletteOverrides(config.palette as WlThemePalette, config.baseTheme), ...config.overrides };
  const overrides = Object.fromEntries(wlDesignTokens.filter((token) => Object.prototype.hasOwnProperty.call(delta, token.name))
    .map((token) => [token.name, delta[token.name]])) as WlThemeOverrides;
  const resolved = new Map<WlDesignTokenName, string>();
  function resolve(name: WlDesignTokenName, trail: WlDesignTokenName[] = []): string {
    if (trail.includes(name)) throw new TypeError(`Circular Gavia UI token: ${[...trail, name].join(" → ")}`);
    const cached = resolved.get(name);
    if (cached !== undefined) return cached;
    const token = definitions.get(name);
    if (!token) throw new TypeError(`Unknown Gavia UI token: ${name}`);
    const source = overrides[name] ?? token.themes?.[config.baseTheme] ?? token.value;
    const value = source.replace(/var\(\s*(--[a-z0-9-]+)\s*\)/g,
      (_, dependency: string) => resolve(tokenName(dependency), [...trail, name]));
    if (/var\s*\(/i.test(value)) throw new TypeError(`Token ${name} requires references to known tokens without CSS fallbacks.`);
    resolved.set(name, value);
    return value;
  }
  // Validate every dependency, including overrides outside the selected contrast pairs.
  for (const token of wlDesignTokens) resolve(token.name);
  const contrast = (config.contrastPairs ?? defaultPairs).map((pair) => {
    const foreground = resolve(pair.foreground);
    const background = resolve(pair.background);
    if (!normalizeWlHex(foreground) || !normalizeWlHex(background)) throw new TypeError(`Contrast pair ${pair.name} must resolve to opaque HEX colors.`);
    const ratio = getWlContrastRatio(foreground, background);
    return { name: pair.name, foreground, background, minimum: pair.minimum, ratio, passes: ratio >= pair.minimum };
  });
  const selector = config.mode === "delta"
    ? `[data-wl-theme="${config.baseTheme}"][data-wl-brand="${config.name}"]`
    : `[data-wl-theme="${config.name}"]`;
  const tokens = config.mode === "delta" ? wlDesignTokens.filter((token) => Object.prototype.hasOwnProperty.call(overrides, token.name)) : wlDesignTokens;
  const css = [
    "/* Generated by Gavia UI: load after base.css and the shipped theme styles. */",
    "@layer wl.tokens {",
    `  ${selector} {`,
    `    color-scheme: ${theme.colorScheme};`,
    ...tokens.map((token) => {
      const value = overrides[token.name] ?? definitions.get(token.name)!.themes?.[config.baseTheme] ?? token.value;
      return `    ${token.name}: ${value};`;
    }),
    "  }",
    "  @media (prefers-reduced-motion: reduce) {",
    `    ${selector} {`,
    ...wlDesignTokens.filter((token) => token.type === "duration").map((token) => `      ${token.name}: 0.01ms;`),
    "    }",
    "  }",
    "}",
    ""
  ].join("\n");
  return { css, overrides, contrast };
}
