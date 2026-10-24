import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { WlPasswordInput } from "../../src";

describe("WlPasswordInput", () => {
  it("starts as password and toggles to text", async () => {
    const wrapper = mount(WlPasswordInput, { props: { modelValue: "s3cret" } });
    const input = wrapper.find(".wl-input");
    expect(input.attributes("type")).toBe("password");

    const btn = wrapper.find(".wl-input-wrap__btn");
    expect(btn.attributes("aria-label")).toBe("Show password");
    expect(btn.attributes("aria-pressed")).toBe("false");

    await btn.trigger("click");
    expect(input.attributes("type")).toBe("text");
    expect(btn.attributes("aria-label")).toBe("Hide password");
    expect(btn.attributes("aria-pressed")).toBe("true");

    await btn.trigger("click");
    expect(input.attributes("type")).toBe("password");
  });

  it("updates the model on typing", async () => {
    const wrapper = mount(WlPasswordInput, { props: { modelValue: "" } });
    await wrapper.find(".wl-input").setValue("hunter2");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["hunter2"]);
  });

  it("carries data-wl and invalid state", () => {
    const wrapper = mount(WlPasswordInput, { props: { modelValue: "", invalid: true } });
    expect(wrapper.find('[data-wl="password-input"]').exists()).toBe(true);
    expect(wrapper.find(".wl-input").classes()).toContain("is-invalid");
  });
});
