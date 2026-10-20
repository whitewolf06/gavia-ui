import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createWlPt, WlConfig, WlSelect } from "../../src";

describe("WlSelect dropdown", () => {
  it("keeps decorative SVG attributes and merges documented dropdownIcon pt", () => {
    const wrapper = mount(WlSelect<string>, {
      global: { plugins: [[WlConfig, { pt: createWlPt({
        select: { dropdownIcon: { class: "app-arrow", "data-app": "kept", "data-source": "app" } }
      }) }]] },
      props: {
        options: ["One", "Two"], modelValue: "One",
        pt: { dropdownIcon: { class: "local-arrow", "data-source": "local" } }
      }
    });
    const arrow = wrapper.get("svg.wl-select__dropdown-icon");
    expect(arrow.classes()).toContain("app-arrow");
    expect(arrow.classes()).toContain("local-arrow");
    expect(arrow.attributes("data-app")).toBe("kept");
    expect(arrow.attributes("data-source")).toBe("local");
    expect(arrow.attributes("aria-hidden")).toBe("true");
    expect(arrow.attributes("viewBox")).toBe("0 0 24 24");
    expect(arrow.get("path").attributes("d")).toBe("m6 9 6 6 6-6");
    expect(wrapper.get(".wl-select__dropdown").text()).toBe("");
    wrapper.unmount();
  });

  it.each([false, true])("preserves dropdown activation and keyboard selection when disabled=%s", async (disabled) => {
    const wrapper = mount(WlSelect<string>, {
      attachTo: document.body,
      props: { options: ["One", "Two"], modelValue: "One", disabled, motion: false }
    });
    try {
      const control = wrapper.get('[role="combobox"]');
      await wrapper.get("svg.wl-select__dropdown-icon").trigger("click");
      await control.trigger("keydown", { key: "ArrowDown" });
      expect(control.attributes("aria-expanded")).toBe(String(!disabled));
      expect(control.attributes("tabindex")).toBe(disabled ? "-1" : "0");
      await control.trigger("keydown", { key: "End" });
      await control.trigger("keydown", { key: "Enter" });
      expect(wrapper.emitted("update:modelValue")).toEqual(disabled ? undefined : [["Two"]]);
      await wrapper.setProps({ modelValue: "Two" });
      expect(wrapper.get(".wl-select__label").text()).toBe("Two");
      expect(control.attributes("aria-expanded")).toBe("false");
      expect(wrapper.get("svg.wl-select__dropdown-icon").attributes("aria-hidden")).toBe("true");
    } finally {
      wrapper.unmount();
    }
  });
});
