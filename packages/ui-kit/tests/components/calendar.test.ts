import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import type { WlCalendarEvent } from "../../src";
import type { GlobalMountOptions } from "../mounting-types";
import { WlConfig } from "../../src";
import { WlCalendar } from "../../src";

// Own components need no PrimeVue sections; the plugin is added for repo-wide consistency.
const global: GlobalMountOptions = {
  plugins: [[WlConfig]]
};

const pad2 = (n: number): string => String(n).padStart(2, "0");
function isoOf(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
describe("WlCalendar", () => {
  // July 2026: the 1st is a Wednesday → 2 leading June days; 31 + 2 = 33 → 5 weeks = 35 cells.
  it("renders the correct day count for a fixed month", () => {
    const wrapper = mount(WlCalendar, { global, props: { month: "2026-07" } });

    expect(wrapper.find(".wl-cal__title").text()).toBe("July 2026");

    const days = wrapper.findAll(".wl-cal__day");
    expect(days).toHaveLength(35);
    expect(wrapper.findAll(".wl-cal__day:not(.is-muted)")).toHaveLength(31);
    expect(wrapper.findAll(".wl-cal__day.is-muted")).toHaveLength(4);

    expect(days[0]!.attributes("data-date")).toBe("2026-06-29");
    expect(days[34]!.attributes("data-date")).toBe("2026-08-02");

    const weekdays = wrapper.findAll(".wl-cal__wd");
    expect(weekdays.map((w) => w.text())).toEqual(["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]);
  });

  it("marks today only when the current month is displayed", () => {
    const now = new Date();
    const current = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`;

    const inMonth = mount(WlCalendar, { global, props: { month: current } });
    const today = inMonth.findAll(".wl-cal__day.is-today");
    expect(today).toHaveLength(1);
    expect(today[0]!.attributes("data-date")).toBe(isoOf(now));

    const other = mount(WlCalendar, { global, props: { month: "2030-01" } });
    expect(other.findAll(".wl-cal__day.is-today")).toHaveLength(0);
  });

  it("emits the ISO date when a day is clicked and shows the selection", async () => {
    const wrapper = mount(WlCalendar, { global, props: { month: "2026-07" } });
    await wrapper.find('[data-date="2026-07-15"]').trigger("click");
    expect(wrapper.emitted("update:modelValue")![0]).toEqual(["2026-07-15"]);
    expect(wrapper.find('[data-date="2026-07-15"]').classes()).toContain("is-selected");
  });

  it("navigates to the previous and next month", async () => {
    // Simulate a real v-model:month parent: handler syncs the prop back.
    const wrapper = mount(WlCalendar, {
      global,
      props: {
        month: "2026-07",
        "onUpdate:month": (value: string) => wrapper.setProps({ month: value })
      }
    });

    await wrapper.find('[aria-label="Next month"]').trigger("click");
    expect(wrapper.emitted("update:month")![0]).toEqual(["2026-08"]);
    expect(wrapper.find(".wl-cal__title").text()).toBe("August 2026");

    await wrapper.find('[aria-label="Previous month"]').trigger("click");
    expect(wrapper.emitted("update:month")![1]).toEqual(["2026-07"]);
    expect(wrapper.find(".wl-cal__title").text()).toBe("July 2026");
  });

  it("renders adjacent-month days muted and switches month when one is clicked", async () => {
    const wrapper = mount(WlCalendar, { global, props: { month: "2026-07" } });

    const muted = wrapper.find('[data-date="2026-08-01"]');
    expect(muted.classes()).toContain("is-muted");

    await muted.trigger("click");
    expect(wrapper.emitted("update:modelValue")![0]).toEqual(["2026-08-01"]);
    expect(wrapper.find(".wl-cal__title").text()).toBe("August 2026");
    expect(wrapper.find('[data-date="2026-08-01"]').classes()).not.toContain("is-muted");
  });

  it("renders event chips with optional blue tone", () => {
    const events: WlCalendarEvent[] = [
      { date: "2026-07-16", label: "Ревью" },
      { date: "2026-07-17", label: "19:30", tone: "blue" }
    ];
    const wrapper = mount(WlCalendar, { global, props: { month: "2026-07", events } });

    const plain = wrapper.find('[data-date="2026-07-16"] .wl-cal__ev');
    expect(plain.text()).toBe("Ревью");
    expect(plain.classes()).not.toContain("wl-cal__ev--blue");

    const blue = wrapper.find('[data-date="2026-07-17"] .wl-cal__ev');
    expect(blue.text()).toBe("19:30");
    expect(blue.classes()).toContain("wl-cal__ev--blue");
  });

  it("exposes grid semantics, a roving tab stop and descriptive date labels", () => {
    const wrapper = mount(WlCalendar, {
      global,
      props: {
        month: "2026-07",
        modelValue: "2026-07-15",
        events: [
          { id: "review-1", date: "2026-07-15", label: "Review" },
          { id: "review-2", date: "2026-07-15", label: "Review" }
        ]
      }
    });

    expect(wrapper.find('[role="grid"]').exists()).toBe(true);
    expect(wrapper.findAll('[role="columnheader"]')).toHaveLength(7);
    expect(wrapper.findAll('[role="gridcell"]')).toHaveLength(35);
    expect(wrapper.findAll('[role="gridcell"][tabindex="0"]')).toHaveLength(1);
    const selectedDay = wrapper.find('[data-date="2026-07-15"]');
    expect(selectedDay.attributes("aria-selected")).toBe("true");
    expect(selectedDay.attributes("aria-label")).toContain("2 events");
    expect(selectedDay.findAll(".wl-cal__ev")).toHaveLength(2);
  });

  it("moves the roving focus with arrow keys and selects with Enter", async () => {
    const wrapper = mount(WlCalendar, {
      global,
      attachTo: document.body,
      props: { month: "2026-07", modelValue: "2026-07-15" }
    });
    const current = wrapper.find('[data-date="2026-07-15"]');
    (current.element as HTMLElement).focus();
    await current.trigger("keydown", { key: "ArrowRight" });
    expect(document.activeElement).toBe(wrapper.find('[data-date="2026-07-16"]').element);
    await wrapper.find('[data-date="2026-07-16"]').trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["2026-07-16"]);
    wrapper.unmount();
  });

  it.each([
    { month: "2027-01", selected: "2027-01-31", key: "PageDown", expected: "2027-02-28", title: "February 2027" },
    { month: "2024-03", selected: "2024-03-31", key: "PageUp", expected: "2024-02-29", title: "February 2024" }
  ])("clamps month paging to its last real date ($selected, $key)", async ({ month, selected, key, expected, title }) => {
    const wrapper = mount(WlCalendar, { global, attachTo: document.body, props: { month, modelValue: selected } });
    try {
      const current = wrapper.get(`[data-date="${selected}"]`);
      (current.element as HTMLButtonElement).focus();
      await current.trigger("keydown", { key });
      expect(wrapper.get(".wl-cal__title").text()).toBe(title);
      expect(wrapper.emitted("update:month")).toEqual([[expected.slice(0, 7)]]);
      expect(document.activeElement).toBe(wrapper.get(`[data-date="${expected}"]`).element);
      expect(wrapper.findAll('[role="gridcell"][tabindex="0"]')).toHaveLength(1);
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    } finally {
      wrapper.unmount();
    }
  });

  it("moves by week and week boundary without selecting, then selects with Space", async () => {
    const wrapper = mount(WlCalendar, {
      global,
      attachTo: document.body,
      props: { month: "2026-07", modelValue: "2026-07-15" }
    });
    try {
      (wrapper.get('[data-date="2026-07-15"]').element as HTMLButtonElement).focus();
      for (const [key, iso] of [
        ["ArrowUp", "2026-07-08"], ["ArrowDown", "2026-07-15"],
        ["Home", "2026-07-13"], ["End", "2026-07-19"], ["ArrowLeft", "2026-07-18"]
      ] as const) {
        document.activeElement!.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
        await wrapper.vm.$nextTick();
        expect(document.activeElement).toBe(wrapper.get(`[data-date="${iso}"]`).element);
      }
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
      await wrapper.get('[data-date="2026-07-18"]').trigger("keydown", { key: " " });
      expect(wrapper.emitted("update:modelValue")).toEqual([["2026-07-18"]]);
    } finally {
      wrapper.unmount();
    }
  });

  it.each([
    { month: "2026-01", selected: "2025-12-29", key: "ArrowLeft", expected: "2025-12-28", title: "December 2025" },
    { month: "2026-12", selected: "2027-01-03", key: "ArrowRight", expected: "2027-01-04", title: "January 2027" }
  ])("reveals the adjacent year when focus leaves the displayed grid ($month, $key)", async ({ month, selected, key, expected, title }) => {
    const wrapper = mount(WlCalendar, { global, attachTo: document.body, props: { month, modelValue: selected } });
    try {
      const current = wrapper.get(`[data-date="${selected}"]`);
      (current.element as HTMLButtonElement).focus();
      await current.trigger("keydown", { key });
      expect(wrapper.get(".wl-cal__title").text()).toBe(title);
      expect(document.activeElement).toBe(wrapper.get(`[data-date="${expected}"]`).element);
      expect(wrapper.emitted("update:month")).toEqual([[expected.slice(0, 7)]]);
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    } finally {
      wrapper.unmount();
    }
  });

  it("keeps month and selection unchanged when disabled, then restores navigation", async () => {
    const wrapper = mount(WlCalendar, { global, props: { month: "2026-07", modelValue: "2026-07-15", disabled: true } });
    try {
      expect(wrapper.get('[aria-label="Next month"]').attributes("disabled")).toBeDefined();
      expect(wrapper.get('[data-date="2026-07-15"]').attributes("disabled")).toBeDefined();
      await wrapper.get('[aria-label="Next month"]').trigger("click");
      await wrapper.get('[data-date="2026-07-15"]').trigger("keydown", { key: "PageDown" });
      await wrapper.get('[data-date="2026-07-15"]').trigger("keydown", { key: "Enter" });
      expect(wrapper.get(".wl-cal__title").text()).toBe("July 2026");
      expect(wrapper.emitted("update:month")).toBeUndefined();
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
      await wrapper.setProps({ disabled: false });
      await wrapper.get('[aria-label="Next month"]').trigger("click");
      expect(wrapper.get(".wl-cal__title").text()).toBe("August 2026");
      expect(wrapper.emitted("update:month")).toEqual([["2026-08"]]);
    } finally {
      wrapper.unmount();
    }
  });
});
