import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { WlFilterBar, WlProgress, WlStatCard } from "../src";

const progressCases = [
  { value: NaN, expected: 0 }, { value: Infinity, expected: 0 }, { value: -Infinity, expected: 0 },
  { value: -5, expected: 0 }, { value: 125, expected: 100 }, { value: 42.5, expected: 42.5 }
];

describe("numeric public UI inputs", () => {
  it.each(progressCases)("renders finite progress for $value", ({ value, expected }) => {
    const wrapper = mount(WlProgress, { props: { value, showValue: true } });
    expect(wrapper.get('[role="progressbar"]').attributes("aria-valuenow")).toBe(String(expected));
    expect((wrapper.get(".wl-progress__value").element as HTMLElement).style.width).toBe(`${expected}%`);
    expect(wrapper.text()).toContain(`${expected}%`);
    wrapper.unmount();
  });

  it.each(progressCases)("renders finite stat-card progress for $value", ({ value, expected }) => {
    const wrapper = mount(WlStatCard, { props: { progress: value } });
    expect(wrapper.get('[role="progressbar"]').attributes("aria-valuenow")).toBe(String(expected));
    expect((wrapper.get(".wl-stat-card__bar-fill").element as HTMLElement).style.width).toBe(`${expected}%`);
    wrapper.unmount();
  });

  it.each([NaN, Infinity, -Infinity, -1])("omits a non-positive or non-finite filter count %s", (activeCount) => {
    const wrapper = mount(WlFilterBar, { props: { activeCount } });
    expect(wrapper.find(".wl-filter-bar__count").exists()).toBe(false);
    expect(wrapper.find(".wl-filter-bar__actions").exists()).toBe(false);
    wrapper.unmount();
  });

  it("rounds the count down and retains disabled guards on its exposed actions", () => {
    const wrapper = mount(WlFilterBar, { props: { activeCount: 4.7, disabled: true } });
    expect(wrapper.get(".wl-filter-bar__count").text()).toBe("4");
    wrapper.vm.open();
    wrapper.vm.toggle();
    wrapper.vm.clear();
    wrapper.vm.apply();
    expect(wrapper.emitted("update:open")).toBeUndefined();
    expect(wrapper.emitted("clear")).toBeUndefined();
    expect(wrapper.emitted("apply")).toBeUndefined();
    wrapper.unmount();
  });
});
