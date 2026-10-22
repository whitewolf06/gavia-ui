import { describe, expect, it } from "vitest";

// Native Node import and SSR are checked against the installed archive by the
// existing package-consumer/node-smoke.mjs fixture, without a Vue dev transform.
describe("public entry exports", () => {
  it("re-exports every component and exposes the public services and design system", async () => {
    const mod = await import("../../src/index");
    const componentModule = await import("../../src/components");

    for (const [name, component] of Object.entries(componentModule)) {
      expect(mod[name as keyof typeof mod], `${name}: missing from the root entry`).toBe(component);
    }

    expect(typeof mod.createWlPt).toBe("function");
    expect(mod.WlTooltip).toBeTruthy();
    expect(mod.WlTooltipDirective).toBeTruthy();
    expect(mod.WlTooltip).not.toBe(mod.WlTooltipDirective);
    expect(mod).not.toHaveProperty("WlTooltipComponent");
    expect(typeof mod.useWlToast).toBe("function");
    expect(mod.WlToastService).toBeTruthy();
    expect(mod.wlDesignTokens.length).toBeGreaterThan(0);
    expect(mod.resolveWlToken("--wl-space-lg")).toBe("16px");

    const pt = mod.createWlPt({ button: { root: { "data-test": "app-button" } } });
    expect(pt.button?.root).toEqual({ "data-test": "app-button" });
    expect(pt.checkbox).toBeTruthy();
  }, 40_000);
});
