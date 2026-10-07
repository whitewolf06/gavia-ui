import type { GlobalMountOptions } from "./mounting-types";
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { WlConfig } from "../src";
import { WlButton } from "../src";

const global: GlobalMountOptions = { plugins: [[WlConfig]] };

describe("WlButton", () => {
  it("applies variant/size modifier classes and data attributes", () => {
    const wrapper = mount(WlButton, {
      global,
      props: { variant: "primary", size: "sm" },
      slots: { default: "Создать" }
    });
    const btn = wrapper.find("button");
    expect(btn.classes()).toContain("wl-btn");
    expect(btn.classes()).toContain("wl-btn--primary");
    expect(btn.classes()).toContain("wl-btn--sm");
    expect(btn.attributes("data-wl")).toBe("button");
    expect(btn.attributes("data-variant")).toBe("primary");
    expect(btn.attributes("data-size")).toBe("sm");
    expect(btn.text()).toContain("Создать");
  });

  it("renders default and icon slots", () => {
    const wrapper = mount(WlButton, {
      global,
      slots: { default: "Сохранить", icon: "<i class='demo-ic' />" }
    });
    expect(wrapper.find(".demo-ic").exists()).toBe(true);
    expect(wrapper.text()).toContain("Сохранить");
  });

  it("emits click", async () => {
    const wrapper = mount(WlButton, { global, slots: { default: "OK" } });
    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted("click")).toHaveLength(1);
  });

  it("establishes the opener focus before the consumer click handler", async () => {
    let focusedDuringClick: Element | null = null;
    const wrapper = mount(WlButton, {
      global, attachTo: document.body,
      props: { onClick: () => { focusedDuringClick = document.activeElement; } }
    });
    try {
      await wrapper.find("button").trigger("click");
      expect(focusedDuringClick).toBe(wrapper.find("button").element);
      expect(document.activeElement).toBe(wrapper.find("button").element);
    } finally { wrapper.unmount(); }
  });

  it("applies disabled state and blocks click", async () => {
    const wrapper = mount(WlButton, {
      global,
      props: { disabled: true },
      slots: { default: "Недоступно" }
    });
    const btn = wrapper.find("button");
    expect(btn.attributes("disabled")).toBeDefined();
    expect(btn.classes()).toContain("is-disabled");
    await btn.trigger("click");
    expect(wrapper.emitted("click")).toBeUndefined();
  });

  it("applies loading state with spinner and blocks click", async () => {
    const wrapper = mount(WlButton, {
      global,
      props: { loading: true },
      slots: { default: "Сохранить" }
    });
    const btn = wrapper.find("button");
    expect(btn.classes()).toContain("is-loading");
    expect(btn.attributes("disabled")).toBeDefined();
    expect(wrapper.find(".wl-btn__spinner").exists()).toBe(true);
    await btn.trigger("click");
    expect(wrapper.emitted("click")).toBeUndefined();
  });

  it("applies block and density classes", () => {
    const wrapper = mount(WlButton, {
      global,
      props: { block: true, density: "compact" },
      slots: { default: "Во всю ширину" }
    });
    const btn = wrapper.find("button");
    expect(btn.classes()).toContain("wl-btn--block");
    expect(btn.classes()).toContain("is-compact");
  });
});
