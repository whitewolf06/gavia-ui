// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  getWlThemeTokens, resolveWlToken, wlDesignTokens, wlDesignThemes,
  wlSpacing, wlTypography, wlContrastReport, type WlDesignTokenName
} from "../src/design-system";
import baseline from "./fixtures/tokens-0.5.json";

describe("design system public contract", () => {
  for (const theme of wlDesignThemes) {
    it(`preserves all 165 existing token values in ${theme.name}`, () => {
      const previous = baseline.themes[theme.name];
      const names = new Set(wlDesignTokens.map((token) => token.name));
      expect(Object.keys(previous)).toHaveLength(165);
      for (const [name, value] of Object.entries(previous)) {
        expect(names.has(name as WlDesignTokenName), name).toBe(true);
        expect(resolveWlToken(name as WlDesignTokenName, theme.name).replace(/\s+/g, " "), name).toBe(value);
      }
    });
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
    expect(wlContrastReport).toHaveLength(39);
    for (const pair of wlContrastReport) expect(pair.ratio).toBeGreaterThanOrEqual(pair.minimum);
  });
  it("rejects unknown runtime names and themes", () => {
    expect(() => resolveWlToken("--wl-missing" as WlDesignTokenName)).toThrow("Unknown Gavia UI token");
    // JavaScript consumers also receive an explicit error.
    expect(() => getWlThemeTokens("missing" as "white")).toThrow("Unknown Gavia UI theme");
  });
});
