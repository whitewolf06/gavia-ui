import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import type { GlobalMountOptions } from "../mounting-types";
import { WlConfig } from "../../src";
import { createWlPt, WlNavItem } from "../../src";

// Wire the kit pt map exactly like a real app does, so inner sections
// (segmented items, breadcrumb list) carry their wl-* classes.
const global: GlobalMountOptions = {
  plugins: [[WlConfig, { pt: createWlPt() }]]
};
describe("WlNavItem", () => {
  it("renders label, icon and badge with active state", () => {
    const wrapper = mount(WlNavItem, {
      global,
      props: { label: "Задачи", icon: "check", badge: 5, active: true }
    });
    const item = wrapper.find('[data-wl="nav-item"]');
    expect(item.classes()).toContain("is-active");
    expect(item.attributes("aria-current")).toBe("page");
    expect(wrapper.find(".wl-nav-item__icon").exists()).toBe(true);
    expect(wrapper.find(".wl-nav-item__badge").text()).toBe("5");
    expect(wrapper.find(".wl-nav-item__label").text()).toBe("Задачи");
  });

  it("renders as anchor when href is set and emits click", async () => {
    const wrapper = mount(WlNavItem, {
      global,
      props: { label: "Архив", href: "#/archive" }
    });
    const item = wrapper.find('[data-wl="nav-item"]');
    expect(item.element.tagName).toBe("A");
    expect(item.attributes("href")).toBe("#/archive");
    await item.trigger("click");
    expect(wrapper.emitted("click")).toHaveLength(1);
  });

  it("removes disabled links from navigation and the tab order", async () => {
    const wrapper = mount(WlNavItem, {
      global,
      props: { label: "Архив", href: "#/archive", disabled: true }
    });
    const item = wrapper.find("a");
    expect(item.attributes("href")).toBeUndefined();
    expect(item.attributes("aria-disabled")).toBe("true");
    expect(item.attributes("tabindex")).toBe("-1");
    await item.trigger("click");
    expect(wrapper.emitted("click")).toBeUndefined();
  });
});
