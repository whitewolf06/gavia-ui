import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, h } from "vue";
import { WlTabs } from "../src";

const items = [
  { key: "general settings", label: "General" },
  { key: "general-settings", label: "Settings" },
  { key: "details", label: "Details" }
];

describe("Tabs ID relationships", () => {
  it("keeps duplicate groups and colliding normalized keys unique with existing panel targets", () => {
    const Harness = defineComponent({ setup: () => () => h("div", [h(WlTabs, { items }), h(WlTabs, { items })]) });
    const wrapper = mount(Harness, { attachTo: document.body });
    try {
      const ids = wrapper.findAll("[id]").map((element) => element.attributes("id"));
      expect(ids).toHaveLength(12);
      expect(new Set(ids).size).toBe(ids.length);
      for (const tab of wrapper.findAll('[role="tab"]')) {
        const panel = document.getElementById(tab.attributes("aria-controls")!);
        expect(panel?.getAttribute("role")).toBe("tabpanel");
        expect(panel?.getAttribute("aria-labelledby")).toBe(tab.attributes("id"));
        expect(panel?.getAttribute("tabindex")).toBe("0");
        expect(panel?.hidden).toBe(tab.attributes("aria-selected") !== "true");
      }
    } finally { wrapper.unmount(); }
  });

  it("keeps inactive panel shells while unmounting their contents and preserves keyboard focus", async () => {
    const wrapper = mount(WlTabs, {
      attachTo: document.body,
      props: { items },
      slots: { panel: ({ item }) => h("span", { "data-panel-content": item.key }, item.label) }
    });
    try {
      const tabs = wrapper.findAll('[role="tab"]');
      expect(wrapper.findAll("[data-panel-content]")).toHaveLength(1);
      expect(wrapper.get("[data-panel-content]").text()).toBe("General");
      for (const [key, index] of [["ArrowRight", 1], ["End", 2], ["Home", 0], ["ArrowLeft", 2]] as const) {
        const current = wrapper.get('[role="tab"][aria-selected="true"]');
        await current.trigger("keydown", { key });
        expect(document.activeElement).toBe(tabs[index]!.element);
        expect(tabs[index]!.attributes("aria-selected")).toBe("true");
        expect(wrapper.findAll('[role="tabpanel"]')).toHaveLength(items.length);
        expect(wrapper.findAll("[data-panel-content]")).toHaveLength(1);
        expect(wrapper.get("[data-panel-content]").text()).toBe(items[index]!.label);
      }
    } finally { wrapper.unmount(); }
  });
});
