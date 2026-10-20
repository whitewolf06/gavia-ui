import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { WlSteps } from "../../src";

describe("WlSteps", () => {
  const items = [{ label: "Проект" }, { label: "Участники" }, { label: "Настройки" }, { label: "Готово" }];

  it("renders done, current and pending steps with connectors", () => {
    const wrapper = mount(WlSteps, { props: { items, current: 1 } });
    const steps = wrapper.findAll(".wl-steps__step");
    expect(steps).toHaveLength(4);
    expect(steps[0]!.classes()).toContain("is-done");
    expect(steps[0]!.find(".wl-icon").exists()).toBe(true);
    expect(steps[1]!.classes()).toContain("is-current");
    expect(wrapper.element.tagName).toBe("OL");
    expect(steps[1]!.element.parentElement?.getAttribute("aria-current")).toBe("step");
    expect(steps[1]!.find(".wl-steps__num").text()).toBe("2");
    expect(steps[2]!.classes()).not.toContain("is-done");
    expect(steps[2]!.classes()).not.toContain("is-current");
    expect(steps[3]!.find(".wl-steps__num").text()).toBe("4");
    expect(wrapper.findAll(".wl-steps__line")).toHaveLength(3);
  });

  it("marks nothing done when current is 0", () => {
    const wrapper = mount(WlSteps, { props: { items, current: 0 } });
    expect(wrapper.findAll(".wl-steps__step.is-done")).toHaveLength(0);
    expect(wrapper.findAll(".wl-steps__step.is-current")).toHaveLength(1);
    expect(wrapper.findAll('li[aria-current="step"]')).toHaveLength(1);
  });
});
