import { flushPromises, mount } from "@vue/test-utils";
import { afterAll, describe, expect, it } from "vitest";
import { nextTick } from "vue";
import type { GlobalMountOptions } from "../mounting-types";
import { WlConfig } from "../../src";
import { createWlPt, WlSelect } from "../../src";

const global: GlobalMountOptions = {
  plugins: [[WlConfig, { pt: createWlPt() }]]
};

afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));
});
describe("basic component behavior", () => {
  it("opens select options and emits the selected value", async () => {
    const options = [
      { label: "Alpha", value: "a" },
      { label: "Beta", value: "b" }
    ];
    const wrapper = mount(WlSelect<{ label: string; value: string }, "value">, {
      global,
      attachTo: document.body,
      props: { options, modelValue: null, optionLabel: "label", optionValue: "value" }
    });
    await wrapper.find(".wl-select").trigger("click");
    await nextTick();
    const option = document.body.querySelector<HTMLElement>(".wl-select-overlay .wl-select__option");
    expect(option).toBeTruthy();
    option!.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true, cancelable: true }));
    option!.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    option!.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true }));
    option!.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    await nextTick();
    await flushPromises();
    expect(wrapper.emitted("update:modelValue")).toEqual([["a"]]);
    wrapper.unmount();
  });
});
