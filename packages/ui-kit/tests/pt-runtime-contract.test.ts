import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, normalizeClass, normalizeStyle, withDirectives } from "vue";
import { mount } from "@vue/test-utils";
import { WlConfig, WlTooltip, type WlConfigOptions, type WlPt, type WlTooltipValue } from "../src";
import { resolveWlPt } from "../src/config";

afterEach(() => { vi.useRealTimers(); document.body.innerHTML = ""; });

describe("PT callback runtime contracts", () => {
  it("resolves actual boolean context and merges default/app/local attributes in order", () => {
    const config: WlConfigOptions = { pt: { checkbox: {
      box: ({ context }) => ({ class: { "app-selected": context.checked }, style: { padding: "4px" }, "data-source": "app" })
    } } };
    const local: WlPt<"checkbox"> = {
      box: ({ context }) => ({ class: { "local-disabled": context.disabled }, style: { color: "red" }, "data-source": "local" })
    };
    const attrs = resolveWlPt("checkbox", "box", config, local, { checked: true, indeterminate: false, disabled: true });
    const classes = normalizeClass(attrs.class).split(" ");
    expect(classes).toEqual(expect.arrayContaining(["wl-checkbox__box", "is-checked", "app-selected", "local-disabled"]));
    expect(normalizeStyle(attrs.style)).toMatchObject({ padding: "4px", color: "red" });
    expect(attrs["data-source"]).toBe("local");
  });

  it("resolves nested leaf sections without treating parent group callbacks as DOM attributes", () => {
    const config: WlConfigOptions = { pt: { multiselect: { pcChip: { root: { class: "app-chip", "data-source": "app" } } } } };
    const local: WlPt<"multiselect"> = { pcChip: { root: () => ({ class: "local-chip", "data-source": "local" }) } };
    const attrs = resolveWlPt("multiselect", "pcChip.root", config, local);
    expect(normalizeClass(attrs.class)).toContain("app-chip");
    expect(normalizeClass(attrs.class)).toContain("local-chip");
    expect(attrs["data-source"]).toBe("local");
  });

  it("applies tooltip section callbacks and scalar attributes without pretending to bind Vue hooks", async () => {
    vi.useFakeTimers();
    const value: WlTooltipValue = { value: "Help", motion: false, pt: {
      root: () => ({ class: "consumer-tooltip", style: { color: "red" }, "data-source": "local" }),
      text: () => ({ "aria-label": "Accessible help" })
    } };
    const Harness = defineComponent({
      setup: () => () => withDirectives(h("button", "Hint"), [[WlTooltip, value]])
    });
    const wrapper = mount(Harness, { attachTo: document.body, global: {
      plugins: [[WlConfig, { pt: { tooltip: { root: { class: "app-tooltip", "data-source": "app" } } } }]]
    } });
    try {
      await wrapper.get("button").trigger("mouseenter");
      vi.runOnlyPendingTimers();
      const tip = document.body.querySelector<HTMLElement>(".wl-tooltip");
      expect(tip?.classList.contains("consumer-tooltip")).toBe(true);
      expect(tip?.classList.contains("app-tooltip")).toBe(true);
      expect(tip?.getAttribute("data-source")).toBe("local");
      expect(tip?.style.color).toBe("red");
      expect(tip?.querySelector(".wl-tooltip__text")?.getAttribute("aria-label")).toBe("Accessible help");
      expect(wrapper.get("button").attributes("aria-describedby")).toContain(tip?.id);
    } finally { wrapper.unmount(); }
  });
});
