import { describe, it, expect } from "vitest";
import { mount, type GlobalMountOptions } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import { WlCalendar, WlColorPicker } from "../src";
import type { WlCalendarEvent } from "../src";

// Own components need no PrimeVue sections; the plugin is added for repo-wide consistency.
const global: GlobalMountOptions = {
  plugins: [[PrimeVue, { unstyled: true }]]
};

const pad2 = (n: number): string => String(n).padStart(2, "0");
function isoOf(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

describe("WlColorPicker", () => {
  it("emits normalized lowercase hex when a swatch is clicked", async () => {
    const wrapper = mount(WlColorPicker, {
      global,
      props: { swatches: ["#FFF", "#2E9E68"] }
    });
    const swatches = wrapper.findAll(".wl-color-picker__sw");
    expect(swatches).toHaveLength(2);

    await swatches[0]!.trigger("click");
    expect(wrapper.emitted("update:modelValue")![0]).toEqual(["#ffffff"]);

    await swatches[1]!.trigger("click");
    expect(wrapper.emitted("update:modelValue")![1]).toEqual(["#2e9e68"]);
  });

  it("emits valid hex input normalized and flags invalid input without emitting", async () => {
    const wrapper = mount(WlColorPicker, { global });
    const input = wrapper.find(".wl-color-picker__hex");

    await input.setValue("#abc");
    expect(wrapper.emitted("update:modelValue")![0]).toEqual(["#aabbcc"]);
    expect(input.classes()).not.toContain("is-invalid");

    const before = wrapper.emitted("update:modelValue")!.length;
    await input.setValue("#12345");
    expect(wrapper.emitted("update:modelValue")).toHaveLength(before);
    expect(input.classes()).toContain("is-invalid");
    expect(input.attributes("aria-invalid")).toBe("true");

    await input.setValue("#A1B2C3");
    const emitted = wrapper.emitted("update:modelValue")!;
    expect(emitted[emitted.length - 1]).toEqual(["#a1b2c3"]);
    expect(input.classes()).not.toContain("is-invalid");
  });

  it("marks the swatch matching modelValue with the selected ring class", () => {
    const wrapper = mount(WlColorPicker, {
      global,
      props: { modelValue: "#2E9E68" } // uppercase on purpose: match is normalized
    });
    const selected = wrapper.findAll(".wl-color-picker__sw.is-selected");
    expect(selected).toHaveLength(1);
    expect(selected[0]!.attributes("aria-label")).toBe("#2e9e68");
    expect(selected[0]!.attributes("aria-selected")).toBe("true");
  });

  it("renders the default kit palette and supports size sm", () => {
    const wrapper = mount(WlColorPicker, { global, props: { size: "sm" } });
    expect(wrapper.findAll(".wl-color-picker__sw").length).toBeGreaterThanOrEqual(12);
    expect(wrapper.find('[data-wl="color-picker"]').attributes("data-size")).toBe("sm");
  });

  it("supports external invalid and a fully disabled state", async () => {
    const wrapper = mount(WlColorPicker, {
      global,
      props: { modelValue: "#2563eb", invalid: true, disabled: true }
    });
    const root = wrapper.find('[data-wl="color-picker"]');
    const input = wrapper.find("input");
    const swatch = wrapper.find(".wl-color-picker__sw");
    expect(root.attributes("data-disabled")).toBe("true");
    expect(root.attributes("data-invalid")).toBe("true");
    expect(input.attributes("disabled")).toBeDefined();
    expect(input.attributes("aria-invalid")).toBe("true");
    expect(swatch.attributes("disabled")).toBeDefined();
    await swatch.trigger("click");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  it("uses roving focus and arrow navigation for swatches", async () => {
    const wrapper = mount(WlColorPicker, {
      global,
      attachTo: document.body,
      props: { swatches: ["#111111", "#222222", "#333333"] }
    });
    const swatches = wrapper.findAll(".wl-color-picker__sw");
    expect(swatches.map((swatch) => swatch.attributes("tabindex"))).toEqual(["0", "-1", "-1"]);
    (swatches[0]!.element as HTMLButtonElement).focus();
    await swatches[0]!.trigger("keydown", { key: "ArrowRight" });
    expect(document.activeElement).toBe(swatches[1]!.element);
    expect(swatches[1]!.attributes("tabindex")).toBe("0");
    await swatches[1]!.trigger("keydown", { key: "End" });
    expect(document.activeElement).toBe(swatches[2]!.element);
    wrapper.unmount();
  });
});

describe("WlCalendar", () => {
  // July 2026: the 1st is a Wednesday → 2 leading June days; 31 + 2 = 33 → 5 weeks = 35 cells.
  it("renders the correct day count for a fixed month", () => {
    const wrapper = mount(WlCalendar, { global, props: { month: "2026-07" } });

    expect(wrapper.find(".wl-cal__title").text()).toBe("Июль 2026");

    const days = wrapper.findAll(".wl-cal__day");
    expect(days).toHaveLength(35);
    expect(wrapper.findAll(".wl-cal__day:not(.is-muted)")).toHaveLength(31);
    expect(wrapper.findAll(".wl-cal__day.is-muted")).toHaveLength(4);

    expect(days[0]!.attributes("data-date")).toBe("2026-06-29");
    expect(days[34]!.attributes("data-date")).toBe("2026-08-02");

    const weekdays = wrapper.findAll(".wl-cal__wd");
    expect(weekdays.map((w) => w.text())).toEqual(["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]);
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

    await wrapper.find('[aria-label="Следующий месяц"]').trigger("click");
    expect(wrapper.emitted("update:month")![0]).toEqual(["2026-08"]);
    expect(wrapper.find(".wl-cal__title").text()).toBe("Август 2026");

    await wrapper.find('[aria-label="Предыдущий месяц"]').trigger("click");
    expect(wrapper.emitted("update:month")![1]).toEqual(["2026-07"]);
    expect(wrapper.find(".wl-cal__title").text()).toBe("Июль 2026");
  });

  it("renders adjacent-month days muted and switches month when one is clicked", async () => {
    const wrapper = mount(WlCalendar, { global, props: { month: "2026-07" } });

    const muted = wrapper.find('[data-date="2026-08-01"]');
    expect(muted.classes()).toContain("is-muted");

    await muted.trigger("click");
    expect(wrapper.emitted("update:modelValue")![0]).toEqual(["2026-08-01"]);
    expect(wrapper.find(".wl-cal__title").text()).toBe("Август 2026");
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
    expect(selectedDay.attributes("aria-label")).toContain("2 события");
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
});
