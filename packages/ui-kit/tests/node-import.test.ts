// @vitest-environment node
import { describe, it, expect } from "vitest";

describe("node import", () => {
  it("imports the library entry without a DOM and exposes the public API", async () => {
    const mod = await import("../src/index");

    const components = [
      "WlAlert",
      "WlAvatar",
      "WlBadge",
      "WlButton",
      "WlCard",
      "WlCheckbox",
      "WlChip",
      "WlDialog",
      "WlDivider",
      "WlDrawer",
      "WlIcon",
      "WlInput",
      "WlProgress",
      "WlRadio",
      "WlSelect",
      "WlSkeleton",
      "WlSpinner",
      "WlSwitch",
      "WlTabs",
      "WlTag",
      "WlTextarea"
    ] as const;

    for (const name of components) {
      expect(mod[name], name).toBeTruthy();
    }

    expect(typeof mod.createWlPt).toBe("function");
    expect(mod.WlTooltip).toBeTruthy();

    const pt = mod.createWlPt({ button: { root: { "data-test": "app-button" } } });
    expect(pt.button?.root).toEqual({ "data-test": "app-button" });
    expect(pt.checkbox).toBeTruthy();
  });
});
