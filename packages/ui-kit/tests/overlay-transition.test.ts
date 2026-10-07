import { describe, expect, it } from "vitest";
import { markOverlayLeaving, restoreOverlayEntering } from "../src/utils/overlayTransition";

describe("overlay transition cancellation", () => {
  it("restores consumer aria-hidden/inert after repeated closing and reopening", () => {
    const panel = document.createElement("div");
    panel.setAttribute("aria-hidden", "false");
    panel.setAttribute("inert", "");
    markOverlayLeaving(panel);
    markOverlayLeaving(panel);
    expect(panel.getAttribute("aria-hidden")).toBe("true");
    restoreOverlayEntering(panel);
    expect(panel.getAttribute("aria-hidden")).toBe("false");
    expect(panel.hasAttribute("inert")).toBe(true);
  });

  it("removes temporary attributes and takes a fresh snapshot on the next close", () => {
    const panel = document.createElement("div");
    restoreOverlayEntering(panel);
    markOverlayLeaving(panel);
    restoreOverlayEntering(panel);
    expect(panel.hasAttribute("aria-hidden")).toBe(false);
    expect(panel.hasAttribute("inert")).toBe(false);
    panel.setAttribute("aria-hidden", "false");
    markOverlayLeaving(panel);
    restoreOverlayEntering(panel);
    expect(panel.getAttribute("aria-hidden")).toBe("false");
  });
});
