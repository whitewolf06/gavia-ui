import { mount } from "@vue/test-utils";
import { afterAll, describe, expect, it } from "vitest";
import type { GlobalMountOptions } from "../mounting-types";
import { WlConfig } from "../../src";
import { createWlPt, WlRadio } from "../../src";

const global: GlobalMountOptions = {
  plugins: [[WlConfig, { pt: createWlPt() }]]
};

afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));
});
describe("basic component behavior", () => {
  it("updates a radio model when selected", async () => {
    const wrapper = mount(WlRadio, {
      global,
      props: { modelValue: "a", value: "b", name: "choice" },
      slots: { default: "Choice B" }
    });
    await wrapper.find('input[type="radio"]').setValue(true);
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["b"]);
    expect(wrapper.text()).toContain("Choice B");
  });
});
