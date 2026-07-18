// @vitest-environment node
import { describe, it, expect } from "vitest";

describe("node import", () => {
  it("imports the library entry without a DOM and exposes the public API", async () => {
    const mod = await import("../src/index");

    const components = [
      "WlAlert",
      "WlAvatar",
      "WlBadge",
      "WlBreadcrumbs",
      "WlButton",
      "WlButtonGroup",
      "WlCard",
      "WlCheckbox",
      "WlChip",
      "WlDialog",
      "WlDivider",
      "WlDrawer",
      "WlEmpty",
      "WlIcon",
      "WlIconButton",
      "WlInput",
      "WlMenu",
      "WlNavItem",
      "WlPagination",
      "WlPill",
      "WlPopover",
      "WlProgress",
      "WlRadio",
      "WlSegmented",
      "WlSelect",
      "WlSkeleton",
      "WlSpinner",
      "WlSwitch",
      "WlTabs",
      "WlTag",
      "WlTextarea",
      "WlToast"
    ] as const;

    for (const name of components) {
      expect(mod[name], name).toBeTruthy();
    }

    expect(typeof mod.createWlPt).toBe("function");
    expect(mod.WlTooltip).toBeTruthy();
    expect(typeof mod.useWlToast).toBe("function");
    expect(mod.WlToastService).toBeTruthy();

    const pt = mod.createWlPt({ button: { root: { "data-test": "app-button" } } });
    expect(pt.button?.root).toEqual({ "data-test": "app-button" });
    expect(pt.checkbox).toBeTruthy();
  });
});
