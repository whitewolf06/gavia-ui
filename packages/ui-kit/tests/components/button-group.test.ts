import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import type { GlobalMountOptions } from "../mounting-types";
import { WlConfig } from "../../src";
import { createWlPt, WlButton, WlButtonGroup } from "../../src";

// Wire the kit pt map exactly like a real app does, so inner sections
// (segmented items, breadcrumb list) carry their wl-* classes.
const global: GlobalMountOptions = {
  plugins: [[WlConfig, { pt: createWlPt() }]]
};
describe("WlButtonGroup", () => {
  it("renders role=group and joins slotted buttons", () => {
    const wrapper = mount(WlButtonGroup, {
      global,
      slots: { default: "<button class='wl-btn'>Лево</button><button class='wl-btn'>Право</button>" }
    });
    const group = wrapper.find('[data-wl="button-group"]');
    expect(group.attributes("role")).toBe("group");
    expect(group.findAll(".wl-btn")).toHaveLength(2);
  });

  it("works with real WlButton children", () => {
    const wrapper = mount({
      global,
      components: { WlButtonGroup, WlButton },
      template:
        '<WlButtonGroup><WlButton size="sm">Один</WlButton><WlButton size="sm">Два</WlButton></WlButtonGroup>'
    });
    expect(wrapper.findAll(".wl-btn-group .wl-btn")).toHaveLength(2);
  });
});
