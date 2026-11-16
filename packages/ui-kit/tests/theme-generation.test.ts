// @vitest-environment node
import { describe, expect, it } from "vitest";
import type { WlDesignTokenDefinition } from "../src/design-system/types";
import { wlDesignThemes, wlDesignTokens } from "../src/design-system";
import { createWlTheme, parseWlThemeConfig, type WlThemeConfig } from "../src/theme/index";

const basic: WlThemeConfig = { schemaVersion: 2, name: "brand", baseTheme: "gavia" };
const tokens: readonly WlDesignTokenDefinition[] = wlDesignTokens;

describe("public theme generation", () => {
  it.each(wlDesignThemes)("preserves the complete $name base when no colors change", ({ name }) => {
    const result = createWlTheme({ ...basic, baseTheme: name });
    expect(result.overrides).toEqual({});
    for (const token of tokens) {
      expect(result.css).toContain(`${token.name}: ${token.themes?.[name] ?? token.value};`);
    }
    expect(result.css).toContain('[data-wl-theme="brand"]');
    expect(result.contrast.length).toBeGreaterThan(0);
  });

  it("keeps palette and manual inputs separate, with manual values winning through aliases", () => {
    const config: WlThemeConfig = {
      ...basic, palette: { primary: "#36a" },
      overrides: { "--wl-palette-action-primary-bg": "#000000", "--wl-action-primary-text": "#ffffff" },
      contrastPairs: [{ name: "action", foreground: "--wl-action-primary-text", background: "--wl-action-primary-bg", minimum: 21 }]
    };
    const before = JSON.stringify(config);
    const result = createWlTheme(config);
    expect(result.overrides["--wl-palette-action-primary-bg"]).toBe("#000000");
    expect(result.contrast).toEqual([{ name: "action", foreground: "#ffffff", background: "#000000", minimum: 21, ratio: 21, passes: true }]);
    expect(JSON.stringify(config)).toBe(before);
    expect(createWlTheme(config)).toEqual(result);
    expect(parseWlThemeConfig(config).overrides).toEqual(config.overrides);
  });

  it("scopes deltas to the base and brand together, keeping reduced motion above duration overrides", () => {
    const result = createWlTheme({ ...basic, mode: "delta", palette: { link: "#7036a8" }, overrides: { "--wl-dur-3": "500ms" } });
    const selector = '[data-wl-theme="gavia"][data-wl-brand="brand"]';
    expect(result.css.match(/data-wl-brand="brand"/g)).toHaveLength(2);
    expect(result.css).toContain(selector);
    expect(result.css).toContain("--wl-dur-3: 500ms;");
    expect(result.css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(result.css.indexOf("--wl-dur-3: 0.01ms;")).toBeGreaterThan(result.css.indexOf("--wl-dur-3: 500ms;"));
    expect(result.css).not.toContain("--wl-palette-bg:");
    expect(result.overrides["--wl-action-primary-bg"]).toBe("var(--wl-palette-action-primary-bg)");
  });

  it("reports low contrast without silently replacing the selected colors", () => {
    const result = createWlTheme({ ...basic, palette: { link: "#ffffff" } });
    expect(result.overrides["--wl-palette-text-accent"]).toBe("#ffffff");
    expect(result.contrast.find((pair) => pair.name === "link")?.passes).toBe(false);
    expect(createWlTheme({ ...basic, contrastPairs: [] }).contrast).toEqual([]);
  });

  it.each(["full", "delta"] as const)("reduces semantic duration overrides in %s output", (mode) => {
    const result = createWlTheme({ ...basic, mode, overrides: { "--wl-motion-normal": "2s" } });
    expect(result.css).toContain("--wl-motion-normal: 2s;");
    const reduced = result.css.slice(result.css.indexOf("@media (prefers-reduced-motion: reduce)"));
    for (const token of wlDesignTokens.filter((item) => item.type === "duration")) {
      expect(reduced).toContain(`${token.name}: 0.01ms;`);
    }
    expect(result.overrides["--wl-motion-normal"]).toBe("2s");
  });

  it("migrates v1 as palette-only instead of applying its derived snapshot as user overrides", () => {
    const palette = parseWlThemeConfig(basic).palette!;
    const legacy = { schemaVersion: 1, name: "brand", baseTheme: "gavia", palette, overrides: { "--wl-text": "red" }, semanticBindings: { unsafe: true }, colorScheme: "dark" };
    expect(parseWlThemeConfig(legacy)).toEqual({ ...basic, palette, mode: "full" });
    expect(() => parseWlThemeConfig({ ...legacy, palette: { primary: "#ffffff" } })).toThrow(/HEX/);
    expect(() => parseWlThemeConfig({ ...basic, semanticBindings: {} })).toThrow(/Unknown theme configuration field/);
    expect(() => parseWlThemeConfig({ ...basic, palette: { typo: "#ffffff" } })).toThrow(/palette role/);
  });

  it("normalizes palette colors and manual key order without modifying source objects", () => {
    const palette = Object.freeze({ primary: " #ABC " });
    const first = parseWlThemeConfig({ ...basic, palette, overrides: { "--wl-text": "#123456", "--wl-bg": "#ffffff" } });
    const second = parseWlThemeConfig({ ...basic, palette, overrides: { "--wl-bg": "#ffffff", "--wl-text": "#123456" } });
    expect(first.palette?.primary).toBe("#aabbcc");
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
    expect(palette.primary).toBe(" #ABC ");
  });

  it.each([
    { ...basic, name: 'brand"] {}' },
    { ...basic, name: "gavia" },
    { ...basic, baseTheme: "missing" },
    { ...basic, mode: "other" },
    { ...basic, overrides: { "--wl-missing": "#ffffff" } },
    { ...basic, overrides: { "--wl-bg": "#fff; color:red" } },
    { ...basic, overrides: { "--wl-motion-normal": "2s !important" } },
    { ...basic, overrides: { "--wl-bg": "var(--missing)" } },
    { ...basic, overrides: { "--wl-bg": "var(--wl-bg)" } },
    { ...basic, overrides: { "--wl-text": "var(--wl-bg)", "--wl-bg": "var(--wl-text)" } },
    { ...basic, contrastPairs: [{ name: "bad", foreground: "--wl-text", background: "--wl-bg", minimum: NaN }] },
    { ...basic, contrastPairs: [{ name: "bad", foreground: "--wl-input-radius", background: "--wl-bg", minimum: 3 }] }
  ])("rejects invalid input or unresolved token graphs %#", (config) => {
    expect(() => createWlTheme(config as WlThemeConfig)).toThrow();
  });
});
