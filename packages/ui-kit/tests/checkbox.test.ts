import { describe, it, expect } from "vitest";
import { mount, type GlobalMountOptions } from "@vue/test-utils";
import { WlConfig } from "../src";
import { WlCheckbox } from "../src";

const global: GlobalMountOptions = { plugins: [[WlConfig]] };

describe("WlCheckbox", () => {
  it("toggles the binary model", async () => {
    const wrapper = mount(WlCheckbox, { global, props: { modelValue: false } });
    const input = wrapper.find('input[type="checkbox"]');
    await input.setValue(true);
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([true]);
  });

  it("toggles back off", async () => {
    const wrapper = mount(WlCheckbox, { global, props: { modelValue: true } });
    const input = wrapper.find('input[type="checkbox"]');
    await input.setValue(false);
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([false]);
  });

  it("applies indeterminate state class", () => {
    const wrapper = mount(WlCheckbox, { global, props: { indeterminate: true } });
    expect(wrapper.find(".wl-checkbox").classes()).toContain("is-indeterminate");
  });

  it("renders label slot", () => {
    const wrapper = mount(WlCheckbox, { global, slots: { default: "Согласен с условиями" } });
    expect(wrapper.find('[data-wl="checkbox"]').text()).toContain("Согласен с условиями");
  });
});
