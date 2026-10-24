import { mount } from "@vue/test-utils";
import { expect, it } from "vitest";
import { WlTag } from "../../src";

it("retains arbitrary legacy native color strings without treating them as a palette name", async () => {
  const wrapper = mount(WlTag, { props: { color: "#336699" }, slots: { default: "Release" } });
  try {
    expect(wrapper.attributes("color")).toBe("#336699");
    expect(wrapper.classes()).toContain("wl-tag--gray");
    expect(wrapper.classes()).not.toContain("wl-tag--#336699");
    expect(wrapper.attributes("style")).toBeUndefined();
    await wrapper.setProps({ color: "blue" });
    expect(wrapper.classes()).toContain("wl-tag--blue");
    expect(wrapper.attributes("data-color")).toBe("blue");
    expect(wrapper.attributes("color")).toBe("blue");
  } finally { wrapper.unmount(); }
});
