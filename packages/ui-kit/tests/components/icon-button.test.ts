import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import type { GlobalMountOptions } from "../mounting-types";
import { WlConfig } from "../../src";
import { createWlPt, WlIconButton } from "../../src";

// Wire the kit pt map exactly like a real app does, so inner sections
// (segmented items, breadcrumb list) carry their wl-* classes.
const global: GlobalMountOptions = {
  plugins: [[WlConfig, { pt: createWlPt() }]]
};
describe("WlIconButton", () => {
  it("applies classes and data attributes", () => {
    const wrapper = mount(WlIconButton, {
      global,
      props: { icon: "bell", variant: "secondary", size: "sm", ariaLabel: "Уведомления" }
    });
    const btn = wrapper.find('[data-wl="icon-button"]');
    expect(btn.classes()).toContain("wl-iconbtn");
    expect(btn.classes()).toContain("wl-iconbtn--secondary");
    expect(btn.classes()).toContain("wl-iconbtn--sm");
    expect(btn.attributes("data-variant")).toBe("secondary");
    expect(btn.attributes("data-size")).toBe("sm");
    expect(btn.attributes("aria-label")).toBe("Уведомления");
  });

  it("renders corner count and active state", () => {
    const wrapper = mount(WlIconButton, {
      global,
      props: { icon: "bell", count: 4, active: true, ariaLabel: "Inbox" }
    });
    expect(wrapper.find(".wl-iconbtn__count").text()).toBe("4");
    expect(wrapper.find('[data-wl="icon-button"]').classes()).toContain("is-active");
  });

  it("renders dot instead of count when dot is set", () => {
    const wrapper = mount(WlIconButton, { global, props: { icon: "bell", dot: true, ariaLabel: "Inbox" } });
    expect(wrapper.find(".wl-iconbtn__dot").exists()).toBe(true);
    expect(wrapper.find(".wl-iconbtn__count").exists()).toBe(false);
  });

  it("emits click and respects disabled", async () => {
    const wrapper = mount(WlIconButton, { global, props: { icon: "search", ariaLabel: "Search" } });
    await wrapper.find('[data-wl="icon-button"]').trigger("click");
    expect(wrapper.emitted("click")).toHaveLength(1);

    const disabled = mount(WlIconButton, { global, props: { icon: "search", disabled: true, ariaLabel: "Search" } });
    await disabled.find('[data-wl="icon-button"]').trigger("click");
    expect(disabled.emitted("click")).toBeUndefined();
  });
});
