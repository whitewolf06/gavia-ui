// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  getWlThemeTokens, resolveWlToken, wlDesignTokens, wlDesignThemes,
  wlSpacing, wlTypography, wlContrastPairs, wlContrastReport, type WlDesignTokenName, type WlDesignTokenDefinition
} from "../src/design-system";
import baseline from "./fixtures/tokens-0.5.json";
import gaviaPalette from "./fixtures/gavia-palette.json";
import source from "../tokens/source.json";
import type { WlThemeName } from "../src/types";

describe("design system public contract", () => {
  for (const [themeName, previous] of Object.entries(baseline.themes)) {
    it(`preserves all 165 existing token values in ${themeName}`, () => {
      const names = new Set(wlDesignTokens.map((token) => token.name));
      expect(Object.keys(previous)).toHaveLength(165);
      for (const [name, value] of Object.entries(previous)) {
        expect(names.has(name as WlDesignTokenName), name).toBe(true);
        expect(resolveWlToken(name as WlDesignTokenName, themeName as WlThemeName).replace(/\s+/g, " "), name).toBe(value);
      }
    });
  }
  for (const theme of wlDesignThemes) {
    it(`returns an independent immutable resolved ${theme.name} snapshot`, () => {
      const first = getWlThemeTokens(theme.name);
      const second = getWlThemeTokens(theme.name);
      expect(first).not.toBe(second);
      expect(Object.isFrozen(first)).toBe(true);
      expect(Object.keys(first)).toHaveLength(wlDesignTokens.length);
      expect(Object.values(first).some((value) => value.includes("var("))).toBe(false);
    });
  }
  it("resolves typography, spacing and component aliases on the server", () => {
    expect(typeof window).toBe("undefined");
    expect(resolveWlToken(wlSpacing.lg)).toBe("16px");
    expect(resolveWlToken(wlTypography[0].fontSize)).toBe("40px");
    expect(resolveWlToken("--wl-btn-height")).toBe("40px");
    expect(resolveWlToken("--wl-input-radius", "newspaper")).toBe("6px");
  });
  it("exposes accessible action roles while preserving the old palette", () => {
    expect(resolveWlToken("--wl-action-primary-text", "graphite")).toBe("#17181c");
    expect(resolveWlToken("--wl-on-accent", "graphite")).toBe("#ffffff");
    expect(wlContrastReport).toHaveLength(wlDesignThemes.length * wlContrastPairs.length);
    for (const pair of wlContrastReport) expect(pair.ratio).toBeGreaterThanOrEqual(pair.minimum);
  });
  it("exposes Gavia without changing the default White snapshot", () => {
    expect(wlDesignThemes.map((theme) => theme.name)).toEqual(["gavia", "white", "graphite", "newspaper", "gavia-dark"]);
    expect(resolveWlToken("--wl-bg")).toBe("#ffffff");
    expect(resolveWlToken("--wl-bg", "gavia")).toBe("#faf9f6");
    expect(resolveWlToken("--wl-bg-raised", "gavia")).toBe("#fefdfb");
    expect(resolveWlToken("--wl-bg-soft", "gavia")).toBe("#eef2f3");
    expect(resolveWlToken("--wl-action-primary-bg", "gavia")).toBe("#294451");
    expect(resolveWlToken("--wl-action-primary-hover", "gavia")).toBe("#203641");
    expect(resolveWlToken("--wl-action-primary-text", "gavia")).toBe("#ffffff");
    expect(resolveWlToken("--wl-action-primary-active", "gavia")).toBe("#182a33");
    expect(resolveWlToken("--wl-accent-soft", "gavia")).toBe("#dfe8eb");
    expect(resolveWlToken("--wl-accent-soft-hover", "gavia")).toBe("#d3dfe4");
    expect(resolveWlToken("--wl-accent-warm", "gavia")).toBe("#948775");
    expect(resolveWlToken("--wl-accent-warm-soft", "gavia")).toBe("#efebe3");
    expect(resolveWlToken("--wl-accent", "gavia")).toBe("#294451");
    expect(resolveWlToken("--wl-accent-hover", "gavia")).toBe("#203641");
    expect(resolveWlToken("--wl-on-accent", "gavia")).toBe("#ffffff");
    expect(resolveWlToken("--wl-text", "gavia")).toBe("#0f1a23");
    expect(resolveWlToken("--wl-text-muted", "gavia")).toBe("#5b6470");
    for (const [name, expected] of Object.entries(gaviaPalette.overrides)) {
      expect(resolveWlToken(name as WlDesignTokenName, "gavia"), name).toBe(expected);
      expect(source.tokens.find((token) => token.name === name)?.themes?.gavia, name).toBe(expected);
    }
    const definitions = new Map<WlDesignTokenName, WlDesignTokenDefinition>(wlDesignTokens.map((token) => [token.name, token]));
    for (const [name, expected] of Object.entries(gaviaPalette.semanticBindings)) {
      expect(definitions.get(name as WlDesignTokenName)?.themes?.gavia, name).toBe(expected);
    }
    for (const theme of ["white", "graphite", "newspaper"] as const) {
      expect(resolveWlToken("--wl-bg-raised", theme)).toBe(resolveWlToken("--wl-bg", theme));
      expect(resolveWlToken("--wl-action-primary-active", theme)).toBe(resolveWlToken("--wl-action-primary-hover", theme));
    }
  });
  it("sets Gavia button and input corners while preserving surfaces and legacy themes", () => {
    expect(resolveWlToken("--wl-btn-radius", "gavia")).toBe("4px");
    expect(resolveWlToken("--wl-btn-radius-sm", "gavia")).toBe("3px");
    expect(resolveWlToken("--wl-btn-radius-lg", "gavia")).toBe("5px");
    expect(resolveWlToken("--wl-corner-control", "gavia")).toBe("8px");
    expect(resolveWlToken("--wl-input-radius", "gavia")).toBe("6px");
    expect(resolveWlToken("--wl-corner-input", "gavia")).toBe("6px");
    expect(resolveWlToken("--wl-card-radius", "gavia")).toBe("8px");
    for (const theme of ["white", "graphite", "newspaper"] as const) {
      expect(resolveWlToken("--wl-btn-radius", theme)).toBe(resolveWlToken("--wl-corner-control", theme));
      expect(resolveWlToken("--wl-btn-radius-sm", theme)).toBe(resolveWlToken("--wl-corner-control-sm", theme));
      expect(resolveWlToken("--wl-btn-radius-lg", theme)).toBe(resolveWlToken("--wl-radius-lg", theme));
    }
  });
  it("keeps status colors independent from the Gavia brand with its approved danger palette", () => {
    for (const name of ["--wl-blue-500", "--wl-success", "--wl-warn"] as const) {
      expect(resolveWlToken(name, "gavia")).toBe(resolveWlToken(name, "white"));
      expect(resolveWlToken(name, "gavia")).not.toBe(resolveWlToken("--wl-accent", "gavia"));
    }
    expect(resolveWlToken("--wl-danger", "gavia")).toBe("#ab4448");
    expect(resolveWlToken("--wl-danger", "gavia")).not.toBe(resolveWlToken("--wl-accent", "gavia"));
    for (const name of ["--wl-action-danger-bg", "--wl-text-danger", "--wl-toast-icon-err"] as const) {
      expect(resolveWlToken(name, "gavia"), name).toBe(resolveWlToken("--wl-danger", "gavia"));
    }
    expect(resolveWlToken("--wl-action-danger-hover", "gavia")).toBe(resolveWlToken("--wl-danger-hover", "gavia"));
  });
  it("adds Gavia Dark while preserving old theme IDs, positions and geometry", () => {
    expect(wlDesignThemes.map(({ name, label }) => [name, label])).toEqual([
      ["gavia", "Gavia"], ["white", "Classic"], ["graphite", "Classic Dark"],
      ["newspaper", "Newspaper"], ["gavia-dark", "Gavia Dark"]
    ]);
    expect(wlDesignThemes.find((theme) => theme.name === "gavia-dark")?.colorScheme).toBe("dark");
    const light = getWlThemeTokens("gavia");
    const dark = getWlThemeTokens("gavia-dark");
    for (const token of wlDesignTokens) {
      if (token.type !== "color" && token.type !== "shadow") {
        expect(dark[token.name], token.name).toBe(light[token.name]);
      }
    }
    expect(dark["--wl-font"]).toMatch(/^"Gavia Sans",/);
    expect(dark["--wl-bg"]).not.toBe(light["--wl-bg"]);
    expect(dark["--wl-bg"]).not.toBe(resolveWlToken("--wl-bg", "graphite"));
    expect(dark["--wl-action-danger-bg"]).toBe("#ab4448");
    expect(wlContrastReport.filter((pair) => pair.theme === "gavia-dark")).toHaveLength(wlContrastPairs.length);
  });
  it("rejects unknown runtime names and themes", () => {
    expect(() => resolveWlToken("--wl-missing" as WlDesignTokenName)).toThrow("Unknown Gavia UI token");
    // JavaScript consumers also receive an explicit error.
    expect(() => getWlThemeTokens("missing" as "white")).toThrow("Unknown Gavia UI theme");
  });
});
