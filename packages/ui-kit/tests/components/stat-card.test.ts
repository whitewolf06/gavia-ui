import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import type { GlobalMountOptions } from "../mounting-types";
import { WlConfig } from "../../src";
import { createWlPt, WlStatCard } from "../../src";

// Wire the kit pt map like a real app, so DataTable sections get wl-* classes.
const global: GlobalMountOptions = {
  plugins: [[WlConfig, { pt: createWlPt() }]]
};
describe("WlStatCard", () => {
  it("renders icon, label, value and description", () => {
    const wrapper = mount(WlStatCard, {
      global,
      props: { icon: "check", label: "Время сегодня", value: "4 ч 12 мин", description: "из дневной цели 6 часов" }
    });
    expect(wrapper.find('[data-wl="stat-card"]').exists()).toBe(true);
    expect(wrapper.find(".wl-stat-card__label").text()).toContain("Время сегодня");
    expect(wrapper.find(".wl-stat-card__label .wl-icon").exists()).toBe(true);
    expect(wrapper.find(".wl-stat-card__value").text()).toBe("4 ч 12 мин");
    expect(wrapper.find(".wl-stat-card__desc").text()).toBe("из дневной цели 6 часов");
  });

  it("renders the progress bar with clamped width and tone", () => {
    const wrapper = mount(WlStatCard, {
      global,
      props: { label: "Фокус дня", value: "Атлас", progress: 70, tone: "success" }
    });
    const bar = wrapper.find(".wl-stat-card__bar");
    expect(bar.attributes("role")).toBe("progressbar");
    expect(bar.attributes("aria-valuenow")).toBe("70");
    expect(wrapper.find(".wl-stat-card__bar-fill").attributes("style")).toContain("width: 70%");
    expect(wrapper.find('[data-wl="stat-card"]').attributes("data-tone")).toBe("success");

    const over = mount(WlStatCard, { global, props: { label: "x", value: "y", progress: 140 } });
    expect(over.find(".wl-stat-card__bar-fill").attributes("style")).toContain("width: 100%");
  });

  it("omits the bar without progress and supports slots", () => {
    const wrapper = mount(WlStatCard, {
      global,
      props: { label: "Без прогресса" },
      slots: { default: "<b class='v'>17</b>", footer: "<span class='f'>обновлено</span>" }
    });
    expect(wrapper.find(".wl-stat-card__bar").exists()).toBe(false);
    expect(wrapper.find(".wl-stat-card__value .v").text()).toBe("17");
    expect(wrapper.find(".wl-stat-card__footer .f").text()).toBe("обновлено");
  });
});
