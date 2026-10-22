import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { h } from "vue";
import { WlTabs } from "../src";

const items = [
  { key: "disabled", label: "Disabled", disabled: true },
  { key: "first", label: "First" },
  { key: "last", label: "Last" }
];

describe("Tabs panel lifecycle and disabled navigation", () => {
  it("chooses the first enabled tab without emitting on mount, skips disabled tabs and uses vertical keys", async () => {
    const wrapper = mount(WlTabs, { attachTo: document.body, props: { items, orientation: "vertical" } });
    try {
      const tabs = wrapper.findAll('[role="tab"]');
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
      expect(tabs[0]!.attributes("disabled")).toBeDefined();
      expect(tabs[1]!.attributes("aria-selected")).toBe("true");
      expect(wrapper.get('[role="tablist"]').attributes("aria-orientation")).toBe("vertical");
      await tabs[1]!.trigger("keydown", { key: "ArrowDown" });
      expect(tabs[2]!.attributes("aria-selected")).toBe("true");
      expect(document.activeElement).toBe(tabs[2]!.element);
      await tabs[2]!.trigger("keydown", { key: "ArrowDown" });
      expect(tabs[1]!.attributes("aria-selected")).toBe("true");
      await tabs[1]!.trigger("keydown", { key: "End" });
      expect(tabs[2]!.attributes("aria-selected")).toBe("true");
      await tabs[0]!.trigger("click");
      expect(tabs[2]!.attributes("aria-selected")).toBe("true");
    } finally { wrapper.unmount(); }
  });

  it("keeps visited content mounted only when keepAlive is enabled", async () => {
    const wrapper = mount(WlTabs, {
      attachTo: document.body,
      props: { items, keepAlive: true },
      slots: { panel: ({ item }) => h("input", { "data-panel": item.key }) }
    });
    try {
      const first = wrapper.get('[data-panel="first"]').element;
      await wrapper.findAll('[role="tab"]')[2]!.trigger("click");
      expect(wrapper.findAll("[data-panel]")).toHaveLength(2);
      expect(wrapper.get('[data-panel="first"]').element).toBe(first);
      expect(wrapper.get('[data-panel="first"]').isVisible()).toBe(false);
      await wrapper.findAll('[role="tab"]')[1]!.trigger("click");
      expect(wrapper.get('[data-panel="first"]').element).toBe(first);
      expect(wrapper.get('[data-panel="first"]').isVisible()).toBe(true);
    } finally { wrapper.unmount(); }
  });

  it("renders all panel content eagerly when lazy is false", () => {
    const wrapper = mount(WlTabs, { props: { items, lazy: false }, slots: { panel: ({ item }) => h("span", { "data-panel": item.key }) } });
    expect(wrapper.findAll("[data-panel]")).toHaveLength(items.length);
    expect(wrapper.findAll('[role="tabpanel"]:not([hidden])')).toHaveLength(1);
    wrapper.unmount();
  });
});
