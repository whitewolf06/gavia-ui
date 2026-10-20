import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { h, nextTick, ref } from "vue";
import WlTooltipComponent from "../../src/components/WlTooltipComponent.vue";
afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = "";
});
describe("WlTooltipComponent", () => {
  it("merges descriptions on focus, exposes tooltip content and removes its token on Escape", async () => {
    const wrapper = mount(WlTooltipComponent, { attachTo: document.body, props: { content: "Saved automatically", motion: false }, slots: { default: () => h("button", { "aria-describedby": "existing" }, "Save"), content: () => h("strong", "Saved automatically") } });
    try {
      const button = wrapper.get("button");
      await button.trigger("focusin");
      await nextTick();
      const tooltip = document.querySelector<HTMLElement>('[role="tooltip"]')!;
      expect(tooltip).not.toBeNull();
      expect(tooltip.querySelector("strong")?.textContent).toBe("Saved automatically");
      expect(button.attributes("aria-describedby")?.split(" ")).toEqual(["existing", tooltip.id]);
      await button.trigger("keydown", { key: "Escape" });
      await nextTick();
      expect(document.querySelector('[role="tooltip"]')).toBeNull();
      expect(button.attributes("aria-describedby")).toBe("existing");
    } finally { wrapper.unmount(); }
  });
  it("supports a disabled trigger wrapper and controlled visibility without stale DOM", async () => {
    const wrapper = mount(WlTooltipComponent, { attachTo: document.body, props: { content: "Unavailable", visible: true, motion: false }, slots: { default: () => h("button", { disabled: true }, "Delete") } });
    try {
      await nextTick();
      await nextTick();
      expect(wrapper.attributes("tabindex")).toBe("0");
      const id = document.querySelector('[role="tooltip"]')?.id;
      expect(wrapper.attributes("aria-describedby")).toBe(id);
      await wrapper.setProps({ visible: false });
      expect(document.querySelector('[role="tooltip"]')).toBeNull();
      expect(wrapper.attributes("aria-describedby")).toBeUndefined();
      await wrapper.setProps({ visible: true });
      expect(document.querySelector('[role="tooltip"]')).not.toBeNull();
    } finally { wrapper.unmount(); }
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
  });
  it("cancels pending hover timers and keeps hoverable content open until both regions are left", async () => {
    vi.useFakeTimers();
    const wrapper = mount(WlTooltipComponent, { attachTo: document.body, props: { content: "Details", showDelay: 50, hideDelay: 50, motion: false }, slots: { default: () => h("button", "Details") } });
    try {
      await wrapper.trigger("mouseenter");
      await wrapper.trigger("mouseleave");
      await vi.advanceTimersByTimeAsync(50);
      expect(document.querySelector('[role="tooltip"]')).toBeNull();
      await wrapper.trigger("mouseenter");
      await vi.advanceTimersByTimeAsync(50);
      const tooltip = document.querySelector<HTMLElement>('[role="tooltip"]')!;
      expect(tooltip).not.toBeNull();
      await wrapper.trigger("mouseleave");
      tooltip.dispatchEvent(new MouseEvent("mouseenter"));
      await vi.advanceTimersByTimeAsync(50);
      expect(document.querySelector('[role="tooltip"]')).not.toBeNull();
      tooltip.dispatchEvent(new MouseEvent("mouseleave"));
      await vi.advanceTimersByTimeAsync(50);
      expect(document.querySelector('[role="tooltip"]')).toBeNull();
    } finally { wrapper.unmount(); }
  });
  it("retains consumer description changes and clears a pending show on unmount", async () => {
    const description = ref("before");
    const wrapper = mount({ render: () => h(WlTooltipComponent, { content: "Details", visible: true, motion: false }, { default: () => h("button", { "aria-describedby": description.value }, "Details") }) }, { attachTo: document.body });
    try {
      await nextTick();
      await nextTick();
      const id = document.querySelector('[role="tooltip"]')!.id;
      description.value = "replacement";
      await nextTick();
      expect(wrapper.get("button").attributes("aria-describedby")?.split(" ")).toEqual(["replacement", id]);
      await wrapper.get("button").trigger("keydown", { key: "Escape" });
      expect(wrapper.get("button").attributes("aria-describedby")).toBe("replacement");
    } finally { wrapper.unmount(); }
    vi.useFakeTimers();
    const pending = mount(WlTooltipComponent, { attachTo: document.body, props: { content: "Later", showDelay: 50 }, slots: { default: () => h("button", "Later") } });
    await pending.trigger("mouseenter");
    pending.unmount();
    await vi.advanceTimersByTimeAsync(100);
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
  });
});
