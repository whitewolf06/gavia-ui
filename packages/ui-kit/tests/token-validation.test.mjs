import { describe, expect, it } from "vitest";
import source from "../tokens/source.json";
import { contrastRatio, renderThemeCss, resolveToken, validateCatalog } from "../scripts/token-tools.mjs";

const token = (catalog, name) => catalog.tokens.find((item) => item.name === name);

describe("design token source validation", () => {
  it("checks every theme and all approved contrast pairs", () => {
    expect(validateCatalog(source)).toHaveLength(source.themes.length * source.contrast.length);
  });
  it("keeps Gavia links readable on page, raised, soft and selected surfaces", () => {
    const foreground = resolveToken(source, "--wl-accent", "gavia");
    for (const name of ["--wl-bg", "--wl-bg-raised", "--wl-bg-soft", "--wl-accent-soft", "--wl-accent-soft-hover"]) {
      expect(contrastRatio(foreground, resolveToken(source, name, "gavia")), name).toBeGreaterThanOrEqual(4.5);
    }
  });
  it.each(source.themes.map((theme) => theme.name))("keeps %s accent text readable without changing primary action colors", (theme) => {
    const foreground = resolveToken(source, "--wl-text-accent", theme);
    for (const name of ["--wl-bg", "--wl-bg-raised", "--wl-bg-soft", "--wl-accent-soft"]) {
      expect(contrastRatio(foreground, resolveToken(source, name, theme)), name).toBeGreaterThanOrEqual(4.5);
    }
    expect(contrastRatio(resolveToken(source, "--wl-text-accent-hover", theme), resolveToken(source, "--wl-accent-soft-hover", theme))).toBeGreaterThanOrEqual(4.5);
    if (theme !== "graphite") expect(foreground).toBe(resolveToken(source, "--wl-accent", theme));
    else {
      expect(resolveToken(source, "--wl-accent", theme)).toBe("#5b8def");
      expect(foreground).toBe("#79a3f4");
    }
  });
  it("scopes Gavia to its theme attribute and preserves reduced motion", () => {
    const theme = source.themes.find((item) => item.name === "gavia");
    const css = renderThemeCss(source, theme);
    expect(css).toContain('@layer wl.tokens');
    expect(css).toContain('[data-wl-theme="gavia"]');
    expect(css).not.toContain(':root');
    expect(css).toContain('color-scheme: light;');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    for (const duration of [1, 2, 3, 4, 5]) expect(css).toContain('--wl-dur-' + duration + ': 0.01ms;');
  });
  it("calculates WCAG black/white and identical-color reference ratios", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBe(21);
    expect(contrastRatio("#404040", "#404040")).toBe(1);
    expect(() => contrastRatio("rgba(0,0,0,.5)", "#ffffff")).toThrow("opaque hex");
  });
  it.each([
    ["inaccessible Gavia accent", (catalog) => { token(catalog, "--wl-palette-accent").themes.gavia = "var(--wl-gray-50)"; }, /Contrast fails: gavia/],
    ["duplicate theme", (catalog) => { catalog.themes.push({ ...catalog.themes[0] }); }, /Invalid theme catalog/],
    ["unknown dependency", (catalog) => { token(catalog, "--wl-bg").value = "var(--wl-missing)"; }, /Unknown reference/],
    ["circular aliases", (catalog) => { token(catalog, "--wl-bg").value = "var(--wl-bg-soft)"; token(catalog, "--wl-bg-soft").value = "var(--wl-bg)"; }, /Circular/],
    ["component bypassing semantic", (catalog) => { token(catalog, "--wl-btn-height").value = "var(--wl-gray-0)"; }, /reference semantic/],
    ["foundation pointing to semantic", (catalog) => { token(catalog, "--wl-gray-0").value = "var(--wl-bg)"; }, /layer inversion/],
    ["raw component value", (catalog) => { token(catalog, "--wl-btn-height").value = "42px"; }, /must reference/],
    ["unsafe CSS delimiter", (catalog) => { token(catalog, "--wl-gray-0").value = "#fff; color:red"; }, /Invalid value/],
    ["foreign namespace", (catalog) => { token(catalog, "--wl-bg").value = "var(--foreign-bg)"; }, /Invalid value/],
    ["unresolved fallback syntax", (catalog) => { token(catalog, "--wl-bg").value = "var(--wl-gray-0, white)"; }, /Unsupported token reference/],
    ["duplicate name", (catalog) => { catalog.tokens.push({ ...catalog.tokens[0] }); }, /duplicate token/],
    ["unknown theme override", (catalog) => { token(catalog, "--wl-gray-0").themes.other = "#ffffff"; }, /Unknown theme/],
    ["invalid dimension", (catalog) => { token(catalog, "--wl-radius").value = "many"; }, /Invalid dimension/],
    ["invalid color", (catalog) => { token(catalog, "--wl-gray-950").value = "#12345"; }, /Invalid color/],
    ["missing typography reference", (catalog) => { catalog.typography[0].fontSize = "--wl-missing"; }, /Unknown typography/],
    ["invalid breakpoint order", (catalog) => { catalog.breakpoints.md = 100; }, /Breakpoints/],
    ["inaccessible theme action", (catalog) => { token(catalog, "--wl-action-primary-text").themes.graphite = "var(--wl-action-primary-bg)"; }, /Contrast fails: graphite/]
  ])("rejects %s", (_label, mutate, expected) => {
    const catalog = structuredClone(source);
    mutate(catalog);
    expect(() => validateCatalog(catalog)).toThrow(expected);
  });
});
