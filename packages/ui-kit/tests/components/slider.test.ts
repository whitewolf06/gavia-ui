import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { WlSlider } from "../../src";

describe("WlSlider", () => {
  it("paints the fill via --wl-slider-pct", () => {
    const wrapper = mount(WlSlider, { props: { modelValue: 40 } });
    const root = wrapper.find('[data-wl="slider"]');
    expect(root.attributes("style")).toContain("--wl-slider-pct: 40%");
  });

  it("emits update:modelValue on input", async () => {
    const wrapper = mount(WlSlider, { props: { modelValue: 40 } });
    await wrapper.find('[data-wl="slider"]').setValue(65);
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([65]);
  });

  it("clamps the percentage for out-of-range values", () => {
    const wrapper = mount(WlSlider, { props: { modelValue: 140, min: 0, max: 100 } });
    expect(wrapper.find('[data-wl="slider"]').attributes("style")).toContain(
      "--wl-slider-pct: 100%"
    );
  });
});
