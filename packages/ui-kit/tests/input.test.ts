import { describe, it, expect } from "vitest";
import { mount, type GlobalMountOptions } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import { WlInput } from "../src";

const global: GlobalMountOptions = { plugins: [[PrimeVue, { unstyled: true }]] };

describe("WlInput", () => {
  it("updates v-model on typing", async () => {
    const wrapper = mount(WlInput, { global, props: { modelValue: "" } });
    const input = wrapper.find("input");
    await input.setValue("Название задачи");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["Название задачи"]);
  });

  it("applies invalid class", () => {
    const wrapper = mount(WlInput, { global, props: { invalid: true } });
    expect(wrapper.find("input").classes()).toContain("is-invalid");
  });

  it("applies size class and data-size on the root", () => {
    const wrapper = mount(WlInput, { global, props: { size: "sm" } });
    expect(wrapper.find("input").classes()).toContain("wl-input--sm");
    const root = wrapper.find('[data-wl="input"]');
    expect(root.attributes("data-size")).toBe("sm");
  });

  it("renders prefix and suffix slots", () => {
    const wrapper = mount(WlInput, {
      global,
      slots: { prefix: "<b class='pfx' />", suffix: "<b class='sfx' />" }
    });
    expect(wrapper.find(".wl-input-wrap--has-prefix").exists()).toBe(true);
    expect(wrapper.find(".wl-input-wrap--has-suffix").exists()).toBe(true);
    expect(wrapper.find(".pfx").exists()).toBe(true);
    expect(wrapper.find(".sfx").exists()).toBe(true);
  });

  it("applies disabled state", () => {
    const wrapper = mount(WlInput, { global, props: { disabled: true } });
    const input = wrapper.find("input");
    expect(input.attributes("disabled")).toBeDefined();
    expect(input.classes()).toContain("is-disabled");
  });
});
