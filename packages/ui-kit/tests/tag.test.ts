import { describe, it, expect } from "vitest";
import { mount, type GlobalMountOptions } from "@vue/test-utils";
import { WlConfig } from "../src";
import { WlTag } from "../src";

const global: GlobalMountOptions = { plugins: [[WlConfig]] };

describe("WlTag", () => {
  it("applies variant class and data attributes", () => {
    const wrapper = mount(WlTag, {
      global,
      props: { variant: "blue" },
      slots: { default: "Релиз 2.0" }
    });
    const tag = wrapper.find('[data-wl="tag"]');
    expect(tag.classes()).toContain("wl-tag");
    expect(tag.classes()).toContain("wl-tag--blue");
    expect(tag.attributes("data-variant")).toBe("blue");
    expect(tag.text()).toContain("Релиз 2.0");
  });

  it("does not render remove button by default", () => {
    const wrapper = mount(WlTag, { global, slots: { default: "Тег" } });
    expect(wrapper.find(".wl-tag__remove").exists()).toBe(false);
  });

  it("emits remove when removable", async () => {
    const wrapper = mount(WlTag, {
      global,
      props: { removable: true },
      slots: { default: "Срочно" }
    });
    await wrapper.find(".wl-tag__remove").trigger("click");
    expect(wrapper.emitted("remove")).toHaveLength(1);
  });
});
