import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { h, nextTick, ref } from "vue";
import WlToolbar from "../../src/components/WlToolbar.vue";
describe("WlToolbar", () => {
  it("provides one tab stop, skips disabled buttons and preserves text editing keys", async () => {
    const wrapper = mount(WlToolbar, { attachTo: document.body, attrs: { "aria-label": "Editor" }, slots: { default: () => [h("button", "Bold"), h("button", { disabled: true }, "Unavailable"), h("button", "Italic"), h("input", { "aria-label": "Search" })] } });
    try {
      await nextTick();
      const buttons = wrapper.findAll("button");
      expect(wrapper.attributes("role")).toBe("toolbar");
      expect(buttons.map((button) => button.attributes("tabindex"))).toEqual(["0", "-1", "-1"]);
      await buttons[0]!.trigger("keydown", { key: "ArrowRight" });
      expect(document.activeElement).toBe(buttons[2]!.element);
      await buttons[2]!.trigger("keydown", { key: "End" });
      expect(document.activeElement).toBe(wrapper.get("input").element);
      const event = new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, cancelable: true });
      wrapper.get("input").element.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    } finally { wrapper.unmount(); }
  });
  it("supports bounded navigation and restores supplied tabindex on unmount", async () => {
    const wrapper = mount(WlToolbar, { attachTo: document.body, props: { orientation: "vertical", loop: false }, slots: { default: () => [h("button", { tabindex: 4 }, "First"), h("button", "Last")] } });
    const first = wrapper.get("button").element;
    await wrapper.findAll("button")[1]!.trigger("keydown", { key: "End" });
    await wrapper.findAll("button")[1]!.trigger("keydown", { key: "ArrowDown" });
    expect(document.activeElement).toBe(wrapper.findAll("button")[1]!.element);
    wrapper.unmount();
    expect(first.getAttribute("tabindex")).toBe("4");
  });
  it("blocks slotted actions while disabled and restores their native interaction when enabled", async () => {
    const activate = vi.fn();
    const wrapper = mount(WlToolbar, {
      attachTo: document.body, props: { disabled: true },
      slots: { default: () => [h("button", { onClick: activate }, "Save"), h("button", "Cancel")] }
    });
    try {
      await nextTick();
      const buttons = wrapper.findAll("button");
      expect(wrapper.attributes("aria-disabled")).toBe("true");
      expect(buttons.map((button) => button.attributes("tabindex"))).toEqual(["-1", "-1"]);
      const click = new MouseEvent("click", { bubbles: true, cancelable: true });
      buttons[0]!.element.dispatchEvent(click);
      expect(click.defaultPrevented).toBe(true);
      expect(activate).not.toHaveBeenCalled();
      await buttons[0]!.trigger("keydown", { key: "ArrowRight" });
      expect(document.activeElement).not.toBe(buttons[1]!.element);
      await wrapper.setProps({ disabled: false });
      await buttons[0]!.trigger("click");
      expect(activate).toHaveBeenCalledTimes(1);
      expect(wrapper.attributes("aria-disabled")).toBeUndefined();
    } finally { wrapper.unmount(); }
  });
  it("recomputes the tab stop when the active control is removed or disabled", async () => {
    const first = ref(true);
    const disabled = ref(false);
    const wrapper = mount({ render: () => h(WlToolbar, {}, { default: () => [first.value ? h("button", "First") : null, h("button", { disabled: disabled.value }, "Second"), h("button", "Last")] }) });
    try {
      await nextTick();
      first.value = false;
      await nextTick();
      await nextTick();
      expect(wrapper.findAll("button").map((item) => item.attributes("tabindex"))).toEqual(["0", "-1"]);
      disabled.value = true;
      await nextTick();
      await nextTick();
      expect(wrapper.findAll("button").map((item) => item.attributes("tabindex"))).toEqual(["-1", "0"]);
    } finally { wrapper.unmount(); }
  });
});
