// @vitest-environment node
import { describe, it, expect } from "vitest";

describe("node import", () => {
  it("imports the library entry without a DOM and exposes the public API", async () => {
    const mod = await import("../src/index");
    const componentModule = await import("../src/components");

    for (const [name, component] of Object.entries(componentModule)) {
      expect(mod[name as keyof typeof mod], `${name}: missing from the root entry`).toBe(component);
    }

    expect(typeof mod.createWlPt).toBe("function");
    expect(mod.WlTooltip).toBeTruthy();
    expect(typeof mod.useWlToast).toBe("function");
    expect(mod.WlToastService).toBeTruthy();

    const pt = mod.createWlPt({ button: { root: { "data-test": "app-button" } } });
    expect(pt.button?.root).toEqual({ "data-test": "app-button" });
    expect(pt.checkbox).toBeTruthy();
  }, 40_000);
});
