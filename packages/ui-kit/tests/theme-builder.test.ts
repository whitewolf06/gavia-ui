// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  createThemePalette, createThemeOverrides, createThemeExport, normalizeHex,
  getThemeContrast, getContrastRatio, isThemeNameValid, parseThemeDraft,
  themePaletteFields, type ThemePalette, type ThemeOverrides
} from "../../../apps/playground/src/theme-builder/palette";
import { resolveWlToken, wlDesignTokens, wlDesignThemes, type WlDesignTokenName, type WlDesignTokenDefinition } from "../src/design-system";
import type { WlThemeName } from "../src/types";

const definitions = new Map<WlDesignTokenName, WlDesignTokenDefinition>(wlDesignTokens.map((token) => [token.name, token]));
function resolve(name: WlDesignTokenName, base: WlThemeName, overrides: ThemeOverrides): string {
  const token = definitions.get(name)!;
  return (overrides[name] ?? token.themes?.[base] ?? token.value)
    .replace(/var\((--wl-[a-z0-9-]+)\)/g, (_, dependency: WlDesignTokenName) => resolve(dependency, base, overrides));
}
function edited(base: WlThemeName, fields: Partial<ThemePalette>): ThemePalette {
  return { ...createThemePalette(base), ...fields };
}

describe("playground theme palette model", () => {
  it("normalizes supported opaque hex without accepting CSS or partial input", () => {
    expect(normalizeHex(" #AbC ")).toBe("#aabbcc");
    expect(normalizeHex("#F0872B")).toBe("#f0872b");
    for (const value of ["", "#", "#aa", "#12345", "#12345678", "red", "rgb(1,2,3)", "var(--wl-bg)", "#ffffff; color:red"]) {
      expect(normalizeHex(value), value).toBeNull();
    }
  });
  it("matches reference contrast endpoints and is symmetric", () => {
    expect(getContrastRatio("#000", "#fff")).toBe(21);
    expect(getContrastRatio("#fff", "#fff")).toBe(1);
    expect(getContrastRatio("#fff", "#000")).toBe(21);
    expect(getContrastRatio("#777777", "#ffffff")).toBeCloseTo(4.478089, 5);
    expect(() => getContrastRatio("transparent", "#fff")).toThrow();
  });
  for (const theme of wlDesignThemes) {
    it(`reproduces every shipped ${theme.name} token without edits`, () => {
      const first = createThemePalette(theme.name);
      const second = createThemePalette(theme.name);
      expect(first).not.toBe(second);
      expect(Object.keys(first)).toHaveLength(8);
      expect(themePaletteFields.map((field) => field.key)).toEqual(Object.keys(first));
      const overrides = createThemeOverrides(first, theme.name);
      expect(overrides).toEqual({});
      for (const token of wlDesignTokens) {
        expect(resolve(token.name, theme.name, overrides), token.name).toBe(resolveWlToken(token.name, theme.name));
      }
      const exported = createThemeExport("my-theme", theme.name, first);
      expect(exported.spec.overrides).toEqual({});
      expect(exported.spec.semanticBindings).toEqual({});
      expect(exported.css).toContain(`color-scheme: ${theme.colorScheme}`);
      for (const token of wlDesignTokens) {
        expect(exported.css).toContain(`${token.name}: ${definitions.get(token.name)!.themes?.[theme.name] ?? token.value};`);
      }
    });
  }
  it("preserves the approved lake Gavia palette in the theme builder", () => {
    expect(createThemePalette("gavia")).toMatchObject({ background: "#faf9f6", primary: "#3c7490", link: "#3c7490" });
  });
  it("allows primary and link to differ in every base, with readable primary text", () => {
    for (const theme of wlDesignThemes) {
      const palette = edited(theme.name, { primary: "#f0872b", link: "#6633aa" });
      const overrides = createThemeOverrides(palette, theme.name);
      expect(resolve("--wl-action-primary-bg", theme.name, overrides)).toBe("#f0872b");
      expect(resolve("--wl-accent", theme.name, overrides)).toBe("#6633aa");
      const foreground = resolve("--wl-action-primary-text", theme.name, overrides);
      const hover = resolve("--wl-action-primary-hover", theme.name, overrides);
      expect(getContrastRatio(foreground, "#f0872b")).toBeGreaterThanOrEqual(4.5);
      expect(getContrastRatio(foreground, hover)).toBeGreaterThanOrEqual(4.5);
      const active = resolve("--wl-action-primary-active", theme.name, overrides);
      expect(getContrastRatio(foreground, active)).toBeGreaterThanOrEqual(4.5);
      expect(active).not.toBe(resolveWlToken("--wl-action-primary-active", theme.name));
      expect(resolve("--wl-accent-soft", theme.name, overrides)).not.toContain("var(");
    }
  });
  it("keeps a raised surface independent when the page alias changes", () => {
    const palette = edited("white", { background: "#f8eedb" });
    const overrides = createThemeOverrides(palette, "white");
    expect(resolve("--wl-bg", "white", overrides)).toBe("#f8eedb");
    expect(resolve("--wl-bg-raised", "white", overrides)).toBe("#ffffff");
  });
  it("does not let a changed link alter the unchanged primary action or state", () => {
    for (const theme of wlDesignThemes) {
      const palette = edited(theme.name, { link: "#7036a8" });
      const overrides = createThemeOverrides(palette, theme.name);
      for (const token of ["--wl-action-primary-bg", "--wl-action-primary-hover", "--wl-action-primary-active", "--wl-action-primary-text"] as const) {
        expect(resolve(token, theme.name, overrides)).toBe(resolveWlToken(token, theme.name));
      }
    }
  });
  it("uses an edited Graphite link for accent text, hover and portable exports", () => {
    const palette = edited("graphite", { link: "#a6c7ff" });
    const overrides = createThemeOverrides(palette, "graphite");
    for (const token of ["--wl-accent", "--wl-text-accent", "--wl-text-accent-hover"] as const) {
      expect(resolve(token, "graphite", overrides), token).toBe(palette.link);
    }
    const exported = createThemeExport("custom-graphite", "graphite", palette);
    expect(exported.spec.overrides["--wl-palette-text-accent"]).toBe(palette.link);
    expect(exported.css).toContain("--wl-palette-text-accent: #a6c7ff;");
    const link = getThemeContrast(palette, "graphite").find((row) => row.key === "link")!;
    expect(link.foreground).toBe(palette.link);
    expect(link.ratio).toBe(getContrastRatio(palette.link, palette.background));
    expect(link.passes).toBe(true);
  });
  it("reports the chosen Graphite accent text even when its contrast fails", () => {
    const baseline = createThemePalette("graphite");
    const palette = Object.freeze(edited("graphite", { link: baseline.background }));
    const report = getThemeContrast(palette, "graphite");
    for (const key of ["link", "accent-text-raised", "accent-text-soft", "accent-text-selected", "accent-text-hover"]) {
      const row = report.find((item) => item.key === key)!;
      expect(row.foreground, key).toBe(palette.link);
      expect(row.ratio, key).toBe(getContrastRatio(palette.link, row.background));
      expect(row.passes, key).toBe(false);
    }
    expect(report.find((row) => row.key === "link")!.ratio).toBe(1);
    const exported = createThemeExport("low-contrast", "graphite", palette);
    expect(exported.spec.palette.link).toBe(baseline.background);
    expect(exported.spec.overrides["--wl-palette-text-accent"]).toBe(baseline.background);
    expect(palette.link).toBe(baseline.background);
  });
  it("reports failed contrast without substituting the chosen link", () => {
    const palette = edited("gavia", { link: "#ffffff", mutedText: "#ffffff" });
    const overrides = createThemeOverrides(palette, "gavia");
    expect(resolve("--wl-accent", "gavia", overrides)).toBe("#ffffff");
    const report = getThemeContrast(palette, "gavia");
    expect(report.find((row) => row.key === "link")?.passes).toBe(false);
    expect(report.find((row) => row.key === "muted")?.passes).toBe(false);
    for (const row of report) {
      expect(row.passes).toBe(row.ratio >= row.minimum);
      expect(row.ratio).toBe(getContrastRatio(row.foreground, row.background));
    }
  });
  it("returns deterministic serializable delta, portable CSS and agent instructions without input mutation", () => {
    const palette = Object.freeze(edited("gavia", { primary: "#3d8e72" }));
    const before = JSON.stringify(palette);
    const first = createThemeExport("forest", "gavia", palette);
    expect(createThemeExport("forest", "gavia", palette)).toEqual(first);
    expect(JSON.parse(first.json)).toEqual(first.spec);
    expect(first.spec).toMatchObject({ schemaVersion: 1, name: "forest", baseTheme: "gavia", colorScheme: "light" });
    expect(first.spec.overrides["--wl-palette-action-primary-bg"]).toBe("#3d8e72");
    expect(Object.keys(first.spec.overrides).every((key) => definitions.get(key as WlDesignTokenName)?.layer === "foundation")).toBe(true);
    expect(Object.keys(first.spec.semanticBindings).every((key) => definitions.get(key as WlDesignTokenName)?.layer === "semantic")).toBe(true);
    expect(first.css).toContain('@layer wl.tokens');
    expect(first.css).toContain('[data-wl-theme="forest"]');
    expect(first.css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(first.css).toContain('--wl-dur-5: 0.01ms;');
    expect(first.prompt).toContain(first.json);
    expect(first.prompt).toContain('tokens/source.json');
    expect(first.prompt).toContain('pnpm tokens:sync');
    expect(first.prompt).toContain('pnpm tokens:check');
    expect(JSON.stringify(palette)).toBe(before);
    createThemeOverrides(palette, "gavia");
    getThemeContrast(palette, "gavia");
    expect(JSON.stringify(palette)).toBe(before);
  });
  it("rejects unknown themes, invalid colors, CSS selector injection and shipped names", () => {
    expect(() => createThemePalette("missing" as WlThemeName)).toThrow();
    expect(() => createThemeOverrides(edited("gavia", { primary: "red" }), "gavia")).toThrow();
    for (const name of ["", "gavia", "gavia-dark", "white", "graphite", "newspaper", "Theme", 'theme"] {}', "a".repeat(33)]) {
      expect(isThemeNameValid(name)).toBe(false);
      expect(() => createThemeExport(name, "gavia", createThemePalette("gavia"))).toThrow();
    }
    expect(isThemeNameValid("my-theme-2")).toBe(true);
  });
  it("roundtrips only valid versioned drafts, ignoring injected export metadata", () => {
    const palette = edited("gavia", { primary: "#abc" });
    const exported = createThemeExport("forest", "gavia", palette);
    expect(parseThemeDraft(JSON.parse(exported.json))).toEqual({
      name: "forest", baseTheme: "gavia", palette: { ...palette, primary: "#aabbcc" }
    });
    const valid = { schemaVersion: 1, name: "forest", baseTheme: "gavia", palette: createThemePalette("gavia") };
    expect(parseThemeDraft({ ...valid, overrides: { "--wl-bg": "red" }, surprise: "ignored" })).toEqual({
      name: valid.name, baseTheme: valid.baseTheme, palette: valid.palette
    });
    for (const value of [
      null, [], {}, { ...valid, schemaVersion: 2 }, { ...valid, name: "white" },
      { ...valid, baseTheme: "missing" }, { ...valid, palette: { ...valid.palette, primary: "red" } },
      { ...valid, palette: { primary: "#ffffff" } }
    ]) expect(parseThemeDraft(value)).toBeNull();
  });
});
