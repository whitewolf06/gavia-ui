import { describe, it, expect } from "vitest";
import { mount, type GlobalMountOptions } from "@vue/test-utils";
import { WlConfig } from "../src";
import { WlSwitch } from "../src";

const global: GlobalMountOptions = { plugins: [[WlConfig]] };

describe("WlSwitch", () => {
  it("toggles the model", async () => {
    const wrapper = mount(WlSwitch, { global, props: { modelValue: false } });
    const input = wrapper.find('input[type="checkbox"]');
    await input.setValue(true);
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([true]);
  });

  it("reflects checked state in classes", async () => {
    const wrapper = mount(WlSwitch, { global, props: { modelValue: true } });
    expect(wrapper.find(".wl-switch").classes()).toContain("is-checked");
  });

  it("applies size class and label slot", () => {
    const wrapper = mount(WlSwitch, {
      global,
      props: { size: "sm" },
      slots: { default: "Уведомления" }
    });
    expect(wrapper.find(".wl-switch").classes()).toContain("wl-switch--sm");
    const root = wrapper.find('[data-wl="switch"]');
    expect(root.attributes("data-size")).toBe("sm");
    expect(root.text()).toContain("Уведомления");
  });
});
