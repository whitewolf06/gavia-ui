import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import type { WlSegmentedOption } from "../../src";
import type { GlobalMountOptions } from "../mounting-types";
import { WlConfig } from "../../src";
import { createWlPt, WlSegmented } from "../../src";

// Wire the kit pt map exactly like a real app does, so inner sections
// (segmented items, breadcrumb list) carry their wl-* classes.
const global: GlobalMountOptions = {
  plugins: [[WlConfig, { pt: createWlPt() }]]
};
describe("WlSegmented", () => {
  const options: WlSegmentedOption[] = [
    { label: "День", value: "day" },
    { label: "Неделя", value: "week" },
    { label: "Месяц", value: "month" }
  ];

  it("renders one item per option with the active one marked", () => {
    const wrapper = mount(WlSegmented, {
      global,
      props: { options, modelValue: "day" }
    });
    const items = wrapper.findAll(".wl-segmented__item");
    expect(items).toHaveLength(3);
    expect(items[0]!.classes()).toContain("is-active");
    expect(items[0]!.attributes("aria-pressed")).toBe("true");
    expect(items[1]!.attributes("aria-pressed")).toBe("false");
  });

  it("emits update:modelValue on select", async () => {
    const wrapper = mount(WlSegmented, {
      global,
      props: { options, modelValue: "day" }
    });
    await wrapper.findAll(".wl-segmented__item")[1]!.trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["week"]);
  });
});
