// @vitest-environment node
import { describe, expect, it } from "vitest";
import { contrastRatio, renderPrimitiveCss, renderThemeCss, resolveToken, validateCatalog } from "../../scripts/token-tools.mjs";
import source from "../../tokens/source.json";

const token = (catalog, name) => catalog.tokens.find((item) => item.name === name);

describe("design token source validation", () => {
  it("preserves component type defaults in every theme and exposes an opt-in semantic mapping", () => {
    const expected = {
      "--wl-card-title-font-size": "14px", "--wl-card-subtitle-font-size": "12.5px", "--wl-card-content-font-size": "13.5px",
      "--wl-accordion-title-font-size": "13.5px", "--wl-accordion-body-font-size": "13px", "--wl-alert-font-size": "13px",
      "--wl-segmented-font-size": "13px", "--wl-segmented-sm-font-size": "12px", "--wl-segmented-item-height": "30px",
      "--wl-card-title-font-weight": "600", "--wl-accordion-title-font-weight": "500", "--wl-segmented-font-weight": "500",
      "--wl-card-content-line-height": "1.55", "--wl-alert-line-height": "1.45"
    };
    for (const theme of source.themes) for (const [name, value] of Object.entries(expected)) {
      expect(resolveToken(source, name, theme.name), `${theme.name}: ${name}`).toBe(value);
    }
    expect(source.componentTypography["--wl-card-title-font-size"]).toBe("--wl-type-subheading-size");
    expect(source.componentTypography["--wl-card-content-font-size"]).toBe("--wl-type-body-size");
    expect(renderPrimitiveCss(source)).toContain(".wl-type-scale");
    const invalid = structuredClone(source);
    invalid.componentTypography["--wl-card-title-font-size"] = "--wl-font-body-size";
    expect(() => validateCatalog(invalid)).toThrow("Invalid component typography token contract");
  });
  it("keeps width defaults and makes fluid sizing available only in optional primitives", () => {
    for (const theme of source.themes) {
      expect(resolveToken(source, "--wl-field-max-width", theme.name)).toBe("340px");
      expect(resolveToken(source, "--wl-accordion-max-width", theme.name)).toBe("520px");
      expect(resolveToken(source, "--wl-slider-max-width", theme.name)).toBe("320px");
    }
    const css = renderPrimitiveCss(source);
    for (const name of source.fluidSizing) expect(css).toContain(`${name}: none;`);
    const invalid = structuredClone(source);
    invalid.fluidSizing.push("--wl-missing-max-width");
    expect(() => validateCatalog(invalid)).toThrow("Invalid fluid sizing token contract");
  });
  it("checks every theme and all approved contrast pairs", () => {
    expect(validateCatalog(source)).toHaveLength(source.themes.length * source.contrast.length);
  });
  it("keeps Gavia links readable on page, raised, soft and selected surfaces", () => {
    const foreground = resolveToken(source, "--wl-text-accent", "gavia");
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
    const expected = { gavia: "#326179", graphite: "#79a3f4" }[theme]
      ?? resolveToken(source, "--wl-accent", theme);
    expect(foreground).toBe(expected);
  });
  it.each([
    { theme: "gavia", accent: "#3c7490" },
    { theme: "graphite", accent: "#5b8def" }
  ])("preserves the approved $theme accent", ({ theme, accent }) => {
    expect(resolveToken(source, "--wl-accent", theme)).toBe(accent);
  });
  it("scopes Gavia to its theme attribute and preserves reduced motion", () => {
    const theme = source.themes.find((item) => item.name === "gavia");
    const css = renderThemeCss(source, theme);
    expect(css).toContain("@layer wl.tokens");
    expect(css).toContain('[data-wl-theme="gavia"]');
    expect(css).not.toContain(":root");
    expect(css).toContain("color-scheme: light;");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    for (const duration of [1, 2, 3, 4, 5])
      expect(css).toContain("--wl-dur-" + duration + ": 0.01ms;");
  });
  it("calculates WCAG black/white and identical-color reference ratios", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBe(21);
    expect(contrastRatio("#404040", "#404040")).toBe(1);
    expect(() => contrastRatio("rgba(0,0,0,.5)", "#ffffff")).toThrow("opaque hex");
  });
  it.each([
    ["inaccessible Gavia accent", (catalog) => {
      token(catalog, "--wl-palette-accent").themes.gavia = "var(--wl-gray-50)";
    }, /Contrast fails: gavia/],
    ["duplicate theme", (catalog) => {
      catalog.themes.push({ ...catalog.themes[0] });
    }, /Invalid theme catalog/],
    ["unknown dependency", (catalog) => {
      token(catalog, "--wl-bg").value = "var(--wl-missing)";
    }, /Unknown reference/],
    ["circular aliases", (catalog) => {
      token(catalog, "--wl-bg").value = "var(--wl-bg-soft)";

      token(catalog, "--wl-bg-soft").value = "var(--wl-bg)";
    }, /Circular/],
    ["component bypassing semantic", (catalog) => {
      token(catalog, "--wl-btn-height").value = "var(--wl-gray-0)";
    }, /reference semantic/],
    ["foundation pointing to semantic", (catalog) => {
      token(catalog, "--wl-gray-0").value = "var(--wl-bg)";
    }, /layer inversion/],
    ["raw component value", (catalog) => {
      token(catalog, "--wl-btn-height").value = "42px";
    }, /must reference/],
    ["unsafe CSS delimiter", (catalog) => {
      token(catalog, "--wl-gray-0").value = "#fff; color:red";
    }, /Invalid value/],
    ["foreign namespace", (catalog) => {
      token(catalog, "--wl-bg").value = "var(--foreign-bg)";
    }, /Invalid value/],
    ["unresolved fallback syntax", (catalog) => {
      token(catalog, "--wl-bg").value = "var(--wl-gray-0, white)";
    }, /Unsupported token reference/],
    ["duplicate name", (catalog) => {
      catalog.tokens.push({ ...catalog.tokens[0] });
    }, /duplicate token/],
    ["unknown theme override", (catalog) => {
      token(catalog, "--wl-gray-0").themes.other = "#ffffff";
    }, /Unknown theme/],
    ["invalid dimension", (catalog) => {
      token(catalog, "--wl-radius").value = "many";
    }, /Invalid dimension/],
    ["invalid color", (catalog) => {
      token(catalog, "--wl-gray-950").value = "#12345";
    }, /Invalid color/],
    ["missing typography reference", (catalog) => {
      catalog.typography[0].fontSize = "--wl-missing";
    }, /Unknown typography/],
    ["invalid breakpoint order", (catalog) => {
      catalog.breakpoints.md = 100;
    }, /Breakpoints/],
    ["inaccessible theme action", (catalog) => {
      token(catalog, "--wl-action-primary-text").themes.graphite = "var(--wl-action-primary-bg)";
    }, /Contrast fails: graphite/]
  ])("rejects %s", (_label, mutate, expected) => {
    const catalog = structuredClone(source);
    mutate(catalog);
    expect(() => validateCatalog(catalog)).toThrow(expected);
  });
});
