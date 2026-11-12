import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { h } from "vue";
import type { WlCalendarDaySlotProps, WlDisabledDates } from "../../src";
import { WlCalendar } from "../../src";

enableAutoUnmount(afterEach);

describe("Calendar availability and activation", () => {
  it("activates a selected date with pointer, Enter and Space without inventing model changes", async () => {
    const wrapper = mount(WlCalendar, { props: { month: "2026-07", modelValue: "2026-07-15" } });
    const day = wrapper.get('[data-date="2026-07-15"]');
    await day.trigger("click");
    await day.trigger("keydown", { key: "Enter" });
    await day.trigger("keydown", { key: " " });
    expect(wrapper.emitted("select")).toEqual(Array.from({ length: 3 }, () => ["2026-07-15"]));
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    await wrapper.setProps({ modelValue: "2026-07-16" });
    expect(wrapper.emitted("select")).toHaveLength(3);
  });

  const disabled: WlDisabledDates[] = [["2026-07-15"], (iso) => iso === "2026-07-15"];
  it.each(disabled)("keeps unavailable dates visible, non-interactive and available to slot/PT renderers (%#)", async (disabledDates) => {
    const wrapper = mount(WlCalendar, {
      props: {
        month: "2026-07", disabledDates,
        pt: { day: ({ context }) => ({ "data-pt-disabled": String(context.disabled) }) }
      },
      slots: { day: (scope: WlCalendarDaySlotProps) => h("span", { "data-slot-disabled": String(scope.disabled) }, scope.day) }
    });
    const day = wrapper.get('[data-date="2026-07-15"]');
    expect(day.attributes("disabled")).toBeDefined();
    expect(day.attributes("aria-disabled")).toBe("true");
    expect(day.attributes("tabindex")).toBe("-1");
    expect(day.attributes("data-pt-disabled")).toBe("true");
    expect(day.get("span").attributes("data-slot-disabled")).toBe("true");
    await day.trigger("click");
    await day.trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("select")).toBeUndefined();
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  it("skips disabled dates across a month without selecting them", async () => {
    const wrapper = mount(WlCalendar, {
      attachTo: document.body,
      props: { month: "2026-07", modelValue: "2026-07-31", disabledDates: ["2026-08-01", "2026-08-02"] }
    });
    const current = wrapper.get('[data-date="2026-07-31"]');
    (current.element as HTMLElement).focus();
    await current.trigger("keydown", { key: "ArrowRight" });
    expect(document.activeElement).toBe(wrapper.get('[data-date="2026-08-03"]').element);
    expect(wrapper.emitted("update:month")).toEqual([["2026-08"]]);
    expect(wrapper.emitted("select")).toBeUndefined();
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  it("keeps the weekday when skipping unavailable weeks", async () => {
    const wrapper = mount(WlCalendar, {
      attachTo: document.body,
      props: { month: "2026-07", modelValue: "2026-07-15", disabledDates: ["2026-07-22", "2026-07-29"] }
    });
    const current = wrapper.get('[data-date="2026-07-15"]');
    (current.element as HTMLElement).focus();
    await current.trigger("keydown", { key: "ArrowDown" });
    expect(document.activeElement).toBe(wrapper.get('[data-date="2026-08-05"]').element);
  });

  it("uses available week boundaries and skips a disabled month-paging target", async () => {
    const wrapper = mount(WlCalendar, {
      attachTo: document.body,
      props: { month: "2026-07", modelValue: "2026-07-15", disabledDates: ["2026-07-13", "2026-07-19", "2026-08-18"] }
    });
    const current = wrapper.get('[data-date="2026-07-15"]');
    (current.element as HTMLElement).focus();
    await current.trigger("keydown", { key: "Home" });
    const start = wrapper.get('[data-date="2026-07-14"]');
    expect(document.activeElement).toBe(start.element);
    await start.trigger("keydown", { key: "End" });
    const end = wrapper.get('[data-date="2026-07-18"]');
    expect(document.activeElement).toBe(end.element);
    await end.trigger("keydown", { key: "PageDown" });
    expect(document.activeElement).toBe(wrapper.get('[data-date="2026-08-19"]').element);
    expect(wrapper.emitted("select")).toBeUndefined();
  });

  it("rehomes focus when availability changes without clearing the selected model", async () => {
    const wrapper = mount(WlCalendar, { attachTo: document.body, props: { month: "2026-07", modelValue: "2026-07-15" } });
    (wrapper.get('[data-date="2026-07-15"]').element as HTMLElement).focus();
    await wrapper.setProps({ disabledDates: ["2026-07-15"] });
    await wrapper.vm.$nextTick();
    expect(wrapper.get('[data-date="2026-07-15"]').attributes("aria-selected")).toBe("true");
    expect(document.activeElement?.getAttribute("data-date")).not.toBe("2026-07-15");
    expect(wrapper.findAll('[role="gridcell"][tabindex="0"]')).toHaveLength(1);
    await wrapper.setProps({ disabledDates: () => true });
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll('[role="gridcell"][tabindex="0"]')).toHaveLength(0);
    expect(document.activeElement).toBe(wrapper.get('[aria-label="Previous month"]').element);
    await wrapper.get('[aria-label="Next month"]').trigger("click");
    expect(wrapper.emitted("update:month")).toEqual([["2026-08"]]);
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    expect(wrapper.emitted("select")).toBeUndefined();
  });

  it("bounds searches when no other day can ever be focused", async () => {
    const unavailable = vi.fn((iso: string) => iso !== "2026-07-15");
    const wrapper = mount(WlCalendar, { attachTo: document.body, props: { month: "2026-07", modelValue: "2026-07-15", disabledDates: unavailable } });
    const current = wrapper.get('[data-date="2026-07-15"]');
    (current.element as HTMLElement).focus();
    unavailable.mockClear();
    await current.trigger("keydown", { key: "ArrowRight" });
    expect(document.activeElement).toBe(current.element);
    expect(unavailable.mock.calls.length).toBeLessThan(400);
    expect(wrapper.emitted("update:month")).toBeUndefined();
  });

  it("retains multiple toggling and emits the activated ISO date when deselecting", async () => {
    const wrapper = mount(WlCalendar<true>, { props: { month: "2026-07", multiple: true, modelValue: ["2026-07-15"] } });
    await wrapper.get('[data-date="2026-07-15"]').trigger("click");
    expect(wrapper.emitted("update:modelValue")).toEqual([[[]]]);
    expect(wrapper.emitted("select")).toEqual([["2026-07-15"]]);
    await wrapper.setProps({ disabled: true });
    await wrapper.get('[data-date="2026-07-16"]').trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("select")).toHaveLength(1);
  });
});
