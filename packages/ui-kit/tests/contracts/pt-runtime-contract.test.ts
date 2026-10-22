import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, normalizeClass, normalizeStyle, ref, withDirectives } from "vue";
import { WlConfig, type WlConfigOptions, type WlPt, WlTooltipDirective, type WlTooltipValue } from "../../src";
import { resolveWlPt } from "../../src/config";

afterEach(() => {
  vi.useRealTimers();

  document.body.innerHTML = "";
});

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
    const config: WlConfigOptions = { pt: { multiselect: { chip: { root: { class: "app-chip", "data-source": "app" } } } } };
    const local: WlPt<"multiselect"> = { chip: { root: () => ({ class: "local-chip", "data-source": "local" }) } };
    const attrs = resolveWlPt("multiselect", "chip.root", config, local);
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
      setup: () => () => withDirectives(h("button", "Hint"), [[WlTooltipDirective, value]])
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
    } finally {
      wrapper.unmount();
    }
  });

  it("keeps closed tooltip triggers idle and releases frame/listener work on hide and unmount", async () => {
    vi.useFakeTimers();
    const add = vi.spyOn(window, "addEventListener");
    const remove = vi.spyOn(window, "removeEventListener");
    const Harness = defineComponent({
      setup: () => () => withDirectives(h("button", "Hint"), [[WlTooltipDirective, { value: "Help", motion: false }]])
    });
    const wrapper = mount(Harness, { attachTo: document.body });
    let unmounted = false;
    try {
      expect(add.mock.calls.filter(([name]) => name === "scroll" || name === "resize")).toHaveLength(0);
      await wrapper.get("button").trigger("focus");
      vi.runOnlyPendingTimers();
      expect(add.mock.calls.filter(([name]) => name === "scroll" || name === "resize")).toHaveLength(2);
      const tooltip = document.body.querySelector<HTMLElement>(".wl-tooltip")!;
      const measure = vi.spyOn(tooltip, "getBoundingClientRect");
      window.dispatchEvent(new Event("resize"));
      window.dispatchEvent(new Event("scroll"));
      window.dispatchEvent(new Event("resize"));
      expect(measure).not.toHaveBeenCalled();
      vi.advanceTimersToNextFrame();
      expect(measure).toHaveBeenCalledTimes(1);
      await wrapper.get("button").trigger("keydown", { key: "Escape" });
      expect(document.body.querySelector(".wl-tooltip")).toBeNull();
      expect(remove.mock.calls.filter(([name]) => name === "scroll" || name === "resize")).toHaveLength(2);
      window.dispatchEvent(new Event("resize"));
      vi.advanceTimersToNextFrame();
      expect(measure).toHaveBeenCalledTimes(1);
      await wrapper.get("button").trigger("focus");
      vi.runOnlyPendingTimers();
      expect(add.mock.calls.filter(([name]) => name === "scroll" || name === "resize")).toHaveLength(4);
      window.dispatchEvent(new Event("resize"));
      wrapper.unmount();
      unmounted = true;
      vi.runOnlyPendingTimers();
      expect(document.body.querySelector(".wl-tooltip")).toBeNull();
      expect(remove.mock.calls.filter(([name]) => name === "scroll" || name === "resize")).toHaveLength(4);
    } finally {
      if (!unmounted) wrapper.unmount();
      vi.restoreAllMocks();
    }
  });

  it("cleans up a cleared reactive tooltip value and cancels a pending delayed show", async () => {
    vi.useFakeTimers();
    const content = ref("Details");
    const remove = vi.spyOn(window, "removeEventListener");
    const Harness = defineComponent({
      setup: () => () => withDirectives(h("button", { "aria-describedby": "existing-help" }, "Hint"), [
        [WlTooltipDirective, { value: content.value, motion: false, showDelay: 50 }]
      ])
    });
    const wrapper = mount(Harness, { attachTo: document.body });
    try {
      await wrapper.get("button").trigger("focus");
      vi.advanceTimersByTime(50);
      expect(document.body.querySelector(".wl-tooltip")).not.toBeNull();
      window.dispatchEvent(new Event("resize"));
      content.value = "";
      await nextTick();
      expect(document.body.querySelector(".wl-tooltip")).toBeNull();
      expect(wrapper.get("button").attributes("aria-describedby")).toBe("existing-help");
      expect(remove.mock.calls.filter(([name]) => name === "scroll" || name === "resize")).toHaveLength(2);
      content.value = "Updated details";
      await nextTick();
      await wrapper.get("button").trigger("focus");
      content.value = "";
      await nextTick();
      vi.runOnlyPendingTimers();
      expect(document.body.querySelector(".wl-tooltip")).toBeNull();
      expect(wrapper.get("button").attributes("aria-describedby")).toBe("existing-help");
    } finally {
      wrapper.unmount();
      vi.restoreAllMocks();
    }
  });

  it("finishes a tooltip exit only for its own opacity transition and restores existing descriptions", async () => {
    vi.useFakeTimers();
    const value: WlTooltipValue = { value: "Help", motion: true, pt: {
      root: { style: { transitionDuration: "0.1s, 250ms", transitionDelay: "20ms, 0.05s" } }
    } };
    const Harness = defineComponent({
      setup: () => () => withDirectives(h("button", { "aria-describedby": "existing-help" }, "Hint"), [[WlTooltipDirective, value]])
    });
    const wrapper = mount(Harness, { attachTo: document.body, global: { plugins: [[WlConfig, { motion: false }]] } });
    try {
      const button = wrapper.get("button");
      await button.trigger("focus");
      vi.advanceTimersByTime(0);
      const tip = document.querySelector<HTMLElement>('[role="tooltip"]')!;
      expect(tip.classList.contains("wl-tooltip-motion-enter")).toBe(true);
      vi.advanceTimersToNextFrame();
      expect(tip.classList.contains("wl-tooltip-motion-enter")).toBe(false);
      await button.trigger("blur");
      vi.advanceTimersByTime(0);
      expect(tip.classList.contains("wl-tooltip-motion-leave")).toBe(true);
      expect(tip.hasAttribute("inert")).toBe(true);
      expect(tip.getAttribute("aria-hidden")).toBe("true");
      expect(button.attributes("aria-describedby")).toBe(`existing-help ${tip.id}`);

      const childEnd = new Event("transitionend", { bubbles: true });
      Object.defineProperty(childEnd, "propertyName", { value: "opacity" });
      tip.querySelector(".wl-tooltip__text")!.dispatchEvent(childEnd);
      const transformEnd = new Event("transitionend");
      Object.defineProperty(transformEnd, "propertyName", { value: "transform" });
      tip.dispatchEvent(transformEnd);
      expect(tip.isConnected).toBe(true);
      const opacityEnd = new Event("transitionend");
      Object.defineProperty(opacityEnd, "propertyName", { value: "opacity" });
      tip.dispatchEvent(opacityEnd);
      expect(tip.isConnected).toBe(false);
      expect(button.attributes("aria-describedby")).toBe("existing-help");
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      wrapper.unmount();
    }
  });

  it("uses the longest computed transition plus its matching delay as the exit fallback", async () => {
    vi.useFakeTimers();
    const Harness = defineComponent({
      setup: () => () => withDirectives(h("button", "Hint"), [[WlTooltipDirective, { value: "Help", motion: true, pt: {
        root: { style: { transitionDuration: "0.1s, 250ms, 0.2s", transitionDelay: "20ms, 0.05s" } }
      } }]])
    });
    const wrapper = mount(Harness, { attachTo: document.body });
    try {
      await wrapper.get("button").trigger("mouseenter");
      vi.advanceTimersByTime(0);
      vi.advanceTimersToNextFrame();
      const tip = document.querySelector<HTMLElement>('[role="tooltip"]')!;
      await wrapper.get("button").trigger("mouseleave");
      vi.advanceTimersByTime(0);
      vi.advanceTimersByTime(349);
      expect(tip.isConnected).toBe(true);
      vi.advanceTimersByTime(1);
      expect(tip.isConnected).toBe(false);
      expect(wrapper.get("button").attributes("aria-describedby")).toBeUndefined();
    } finally {
      wrapper.unmount();
    }
  });

  it("cancels an interrupted tooltip exit and preserves its node, updated text and consumer attributes", async () => {
    vi.useFakeTimers();
    const value = ref<Exclude<WlTooltipValue, string>>({ value: "Help", motion: true, pt: {
      root: { "aria-hidden": "false", style: { transitionDuration: "200ms", transitionDelay: "0s" } }
    } });
    const Harness = defineComponent({
      setup: () => () => withDirectives(h("button", "Hint"), [[WlTooltipDirective, value.value]])
    });
    const wrapper = mount(Harness, { attachTo: document.body });
    try {
      const button = wrapper.get("button");
      await button.trigger("focus");
      vi.advanceTimersByTime(0);
      const tip = document.querySelector<HTMLElement>('[role="tooltip"]')!;
      await button.trigger("blur");
      vi.advanceTimersByTime(0);
      expect(tip.classList.contains("wl-tooltip-motion-enter")).toBe(false);
      expect(tip.classList.contains("wl-tooltip-motion-leave")).toBe(true);
      value.value = { ...value.value, value: "Updated help" };
      await nextTick();
      expect(tip.textContent).toBe("Updated help");
      expect(tip.getAttribute("aria-hidden")).toBe("true");
      await button.trigger("focus");
      expect(document.querySelector('[role="tooltip"]')).toBe(tip);
      expect(tip.hasAttribute("inert")).toBe(false);
      expect(tip.getAttribute("aria-hidden")).toBe("false");
      expect(tip.classList.contains("wl-tooltip-motion-leave")).toBe(false);
      vi.advanceTimersByTime(500);
      expect(tip.isConnected).toBe(true);
      await button.trigger("keydown", { key: "Escape" });
      expect(tip.isConnected).toBe(false);
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      wrapper.unmount();
    }
  });

  it("cancels a delayed hide on reentry and removes the tooltip after a later complete delay", async () => {
    vi.useFakeTimers();
    const Harness = defineComponent({
      setup: () => () => withDirectives(h("button", "Hint"), [[WlTooltipDirective, { value: "Help", motion: false, showDelay: 25, hideDelay: 80 }]])
    });
    const wrapper = mount(Harness, { attachTo: document.body });
    try {
      const button = wrapper.get("button");
      await button.trigger("mouseenter");
      vi.advanceTimersByTime(24);
      expect(document.querySelector('[role="tooltip"]')).toBeNull();
      vi.advanceTimersByTime(1);
      const tip = document.querySelector<HTMLElement>('[role="tooltip"]')!;
      await button.trigger("mouseleave");
      vi.advanceTimersByTime(40);
      await button.trigger("mouseenter");
      vi.advanceTimersByTime(100);
      expect(document.querySelector('[role="tooltip"]')).toBe(tip);
      await button.trigger("mouseleave");
      vi.advanceTimersByTime(79);
      expect(tip.isConnected).toBe(true);
      vi.advanceTimersByTime(1);
      expect(tip.isConnected).toBe(false);
      expect(button.attributes("aria-describedby")).toBeUndefined();
    } finally {
      wrapper.unmount();
    }
  });

  it("removes motion-enabled tooltips immediately when CSS supplies no transition duration", async () => {
    vi.useFakeTimers();
    const Harness = defineComponent({
      setup: () => () => withDirectives(h("button", "Hint"), [[WlTooltipDirective, { value: "Help", motion: true }]])
    });
    const wrapper = mount(Harness, { attachTo: document.body });
    try {
      await wrapper.get("button").trigger("focus");
      vi.advanceTimersByTime(0);
      expect(document.querySelector('[role="tooltip"]')).not.toBeNull();
      await wrapper.get("button").trigger("blur");
      vi.advanceTimersByTime(0);
      expect(document.querySelector('[role="tooltip"]')).toBeNull();
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      wrapper.unmount();
    }
  });

  it("honors reduced motion even when the tooltip explicitly enables animation", async () => {
    vi.useFakeTimers();
    const matchMedia = window.matchMedia;
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({ ...matchMedia.call(window, query), matches: true }));
    const Harness = defineComponent({
      setup: () => () => withDirectives(h("button", "Hint"), [[WlTooltipDirective, { value: "Help", motion: true }]])
    });
    const wrapper = mount(Harness, { attachTo: document.body });
    try {
      await wrapper.get("button").trigger("focus");
      vi.advanceTimersByTime(0);
      expect(document.querySelector('[role="tooltip"]')?.classList.contains("wl-tooltip-motion")).toBe(false);
      await wrapper.get("button").trigger("blur");
      vi.advanceTimersByTime(0);
      expect(document.querySelector('[role="tooltip"]')).toBeNull();
    } finally {
      wrapper.unmount();
      vi.restoreAllMocks();
    }
  });

  it.each([
    ["top", "130px", "83px"], ["bottom", "130px", "127px"],
    ["left", "73px", "105px"], ["right", "187px", "105px"]
  ] as const)("positions the tooltip on the requested %s side", async (placement, left, top) => {
    vi.useFakeTimers();
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      return this.classList.contains("wl-tooltip") ? new DOMRect(0, 0, 20, 10) : new DOMRect(100, 100, 80, 20);
    });
    const Harness = defineComponent({
      setup: () => () => withDirectives(h("button", "Hint"), [[WlTooltipDirective, { value: "Help", motion: false }, undefined, { [placement]: true }]])
    });
    const wrapper = mount(Harness, { attachTo: document.body });
    try {
      await wrapper.get("button").trigger("focus");
      vi.advanceTimersByTime(0);
      const tip = document.querySelector<HTMLElement>('[role="tooltip"]')!;
      expect(tip.style.left).toBe(left);
      expect(tip.style.top).toBe(top);
    } finally {
      wrapper.unmount();
      vi.restoreAllMocks();
    }
  });
});
