import { afterEach, describe, expect, it } from "vitest";
import { mount, flushPromises, type VueWrapper } from "@vue/test-utils";
import { WlConfig, WlDatePicker, createWlPt, type WlDateRange } from "../src";

const mounted: VueWrapper[] = [];
function rangePicker(value: WlDateRange | null = ["2026-10-15", "2026-10-20"], extra: Record<string, unknown> = {}) {
  const wrapper = mount(WlDatePicker, {
    attachTo: document.body,
    props: { selectionMode: "range", modelValue: value, showIcon: true, motion: false, ...extra }
  });
  mounted.push(wrapper);
  return wrapper;
}
function day(iso: string): HTMLButtonElement {
  const button = document.querySelector<HTMLButtonElement>(`.wl-dp__day[data-date="${iso}"]`);
  expect(button, `calendar date ${iso}`).not.toBeNull();
  return button!;
}
async function choose(iso: string): Promise<void> { day(iso).click(); await flushPromises(); }
async function key(element: HTMLElement, key: string, shiftKey = false): Promise<void> {
  element.dispatchEvent(new KeyboardEvent("keydown", { key, shiftKey, bubbles: true, cancelable: true }));
  await flushPromises();
}
afterEach(() => { mounted.splice(0).forEach((wrapper) => wrapper.unmount()); document.body.innerHTML = ""; });

describe("DatePicker additive range contract", () => {
  it("keeps the original single ISO model and calendar selection", async () => {
    const wrapper = mount(WlDatePicker, { attachTo: document.body, props: { modelValue: "2026-10-15", showIcon: true, motion: false } });
    mounted.push(wrapper);
    expect(wrapper.get('[data-wl="date-picker"]').attributes("data-selection-mode")).toBe("single");
    expect(wrapper.findAll("input")).toHaveLength(1);
    expect(wrapper.get("input").element.value).toBe("15.10.2026");
    await wrapper.get(".wl-dp__trigger").trigger("click");
    await flushPromises(); await choose("2026-10-20");
    expect(wrapper.emitted("update:modelValue")).toEqual([["2026-10-20"]]);
    expect(document.querySelector(".wl-dp__panel")).toBeNull();
    expect(document.activeElement).toBe(wrapper.get("input").element);
  });

  it("gives both endpoints visible names, unique native ids, constraints and hint links", () => {
    const wrapper = rangePicker(undefined, { startLabel: "Начало", endLabel: "Окончание" });
    // The externally supplied field label still targets the beginning of the range.
    const inputs = wrapper.findAll("input");
    expect(inputs).toHaveLength(2);
    expect(inputs[1]!.attributes("id")).toBe(`${inputs[0]!.attributes("id")}-end`);
    expect(wrapper.findAll("label").map((label) => label.text())).toEqual(["Начало", "Окончание"]);
    expect(inputs.map((input) => input.element.value)).toEqual(["15.10.2026", "20.10.2026"]);
    expect(wrapper.get('[data-wl="date-picker"]').attributes("role")).toBe("group");
  });

  it("forwards native attributes without duplicate ids or duplicate form names", () => {
    const wrapper = mount(WlDatePicker, {
      props: { selectionMode: "range", modelValue: ["2026-10-15", null], invalid: true },
      attrs: { id: "trip", name: "dates", required: true, "aria-label": "Поездка", "aria-describedby": "trip-error", "aria-labelledby": "trip-title" }
    });
    mounted.push(wrapper);
    const [start, end] = wrapper.findAll("input");
    expect(start!.attributes()).toMatchObject({ id: "trip", name: "dates", required: "", "aria-describedby": "trip-error", "aria-labelledby": "trip-title trip-label", "aria-invalid": "true" });
    expect(end!.attributes()).toMatchObject({ id: "trip-end", name: "dates-end", required: "", "aria-describedby": "trip-error", "aria-labelledby": "trip-title trip-end-label", "aria-invalid": "true" });
    expect(wrapper.get(".wl-dp").classes()).toContain("is-invalid");
  });

  it("keeps a partial first click open, sorts the second click, then starts again", async () => {
    const wrapper = rangePicker();
    await wrapper.get(".wl-dp__trigger").trigger("click"); await flushPromises();
    await choose("2026-10-20");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([["2026-10-20", null]]);
    expect(document.querySelector(".wl-dp__range-hint")?.textContent).toContain("До");
    expect(day("2026-10-20").getAttribute("aria-selected")).toBe("true");
    await choose("2026-10-10");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([["2026-10-10", "2026-10-20"]]);
    expect(document.querySelector(".wl-dp__panel")).toBeNull();
    expect(document.activeElement).toBe(wrapper.findAll("input")[1]!.element);
    await wrapper.get(".wl-dp__trigger").trigger("click"); await flushPromises();
    expect(day("2026-10-15").classList.contains("is-in-range")).toBe(true);
    await choose("2026-10-25");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([["2026-10-25", null]]);
    expect(document.querySelector(".wl-dp__panel")).not.toBeNull();
  });

  it("allows a one-day inclusive range and marks no intermediate dates", async () => {
    const wrapper = rangePicker(["2026-10-15", null]);
    await wrapper.get(".wl-dp__trigger").trigger("click"); await flushPromises();
    await choose("2026-10-15");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([["2026-10-15", "2026-10-15"]]);
  });

  it("checks both endpoints against inclusive min/max bounds", async () => {
    const wrapper = rangePicker(["2026-10-15", null], { minDate: "2026-10-10", maxDate: "2026-10-20" });
    await wrapper.get(".wl-dp__trigger").trigger("click"); await flushPromises();
    expect(day("2026-10-09").disabled).toBe(true);
    expect(day("2026-10-21").disabled).toBe(true);
    expect(day("2026-10-10").disabled).toBe(false);
    expect(day("2026-10-20").disabled).toBe(false);
    await choose("2026-10-09");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    const end = wrapper.findAll("input")[1]!;
    await end.setValue("21.10.2026"); await end.trigger("blur");
    expect(end.element.value).toBe("");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    await choose("2026-10-10");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([["2026-10-10", "2026-10-15"]]);
  });

  it("treats empty or impossible ISO bounds as absent for days, months, years and typing", async () => {
    const wrapper = rangePicker(["2026-10-15", null], { minDate: "", maxDate: "" });
    await wrapper.get(".wl-dp__trigger").trigger("click"); await flushPromises();
    expect(day("2026-10-10").disabled).toBe(false);
    expect(day("2026-10-20").disabled).toBe(false);
    await wrapper.setProps({ minDate: "2026-02-31", maxDate: "not-a-date" });
    expect(day("2026-10-20").disabled).toBe(false);
    document.querySelector<HTMLButtonElement>('[aria-label^="Выбрать месяц"]')!.click(); await flushPromises();
    expect(Array.from(document.querySelectorAll<HTMLButtonElement>(".wl-dp__choice")).every((button) => !button.disabled)).toBe(true);
    document.querySelector<HTMLButtonElement>('[aria-label^="Выбрать год"]')!.click(); await flushPromises();
    expect(Array.from(document.querySelectorAll<HTMLButtonElement>(".wl-dp__choice")).every((button) => !button.disabled)).toBe(true);
    const end = wrapper.findAll("input")[1]!;
    await end.setValue("20.10.2026"); await end.trigger("blur");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([["2026-10-15", "2026-10-20"]]);
  });
  it("types and sorts ISO endpoints, restores impossible dates and clears each endpoint", async () => {
    const wrapper = rangePicker(null, { displayFormat: "yyyy-mm-dd", minDate: "2026-10-01", maxDate: "2026-10-31" });
    const [start, end] = wrapper.findAll("input");
    await end!.setValue("2026-10-20"); await end!.trigger("blur");
    expect(end!.element.value).toBe("");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    await start!.setValue("2026-10-20"); await start!.trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([["2026-10-20", null]]);
    await end!.setValue("2026-10-10"); await end!.trigger("blur");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([["2026-10-10", "2026-10-20"]]);
    expect(start!.element.value).toBe("2026-10-10"); expect(end!.element.value).toBe("2026-10-20");
    for (const invalid of ["2026-10-32", "2026-11-01", "10.10.2026"]) {
      await start!.setValue(invalid); await start!.trigger("blur"); expect(start!.element.value).toBe("2026-10-10");
    }
    await end!.setValue(""); await end!.trigger("blur");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([["2026-10-10", null]]);
    await start!.setValue(""); await start!.trigger("blur");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([null]);
    expect(end!.element.value).toBe("");
  });

  it("formats external range changes and preserves ISO data across presentation changes", async () => {
    const wrapper = rangePicker(["2026-10-15", null]);
    await wrapper.setProps({ displayFormat: "yyyy-mm-dd" });
    expect(wrapper.findAll("input").map((input) => input.element.value)).toEqual(["2026-10-15", ""]);
    await wrapper.setProps({ modelValue: ["2026-10-10", "2026-10-20"] });
    expect(wrapper.findAll("input").map((input) => input.element.value)).toEqual(["2026-10-10", "2026-10-20"]);
    await wrapper.setProps({ modelValue: null });
    expect(wrapper.findAll("input").map((input) => input.element.value)).toEqual(["", ""]);
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  it("moves keyboard focus by day/week/month, clamps to bounds and restores focus on Escape", async () => {
    const wrapper = rangePicker(["2026-10-15", null], { minDate: "2026-10-10", maxDate: "2026-11-20" });
    const input = wrapper.get("input"); input.element.focus();
    await input.trigger("keydown", { key: "ArrowDown" }); await flushPromises();
    expect(document.activeElement).toBe(day("2026-10-15"));
    await key(day("2026-10-15"), "ArrowRight"); expect(document.activeElement).toBe(day("2026-10-16"));
    await key(day("2026-10-16"), "Home"); expect(document.activeElement).toBe(day("2026-10-12"));
    await key(day("2026-10-12"), "ArrowUp"); expect(document.activeElement).toBe(day("2026-10-10"));
    await key(day("2026-10-10"), "PageDown"); expect(document.activeElement).toBe(day("2026-11-10"));
    expect(document.querySelectorAll('.wl-dp__day[tabindex="0"]')).toHaveLength(1);
    await key(day("2026-11-10"), "Escape");
    expect(document.querySelector(".wl-dp__panel")).toBeNull(); expect(document.activeElement).toBe(input.element);
  });

  it("disables both inputs and the trigger, including an already open calendar", async () => {
    const wrapper = rangePicker();
    await wrapper.get(".wl-dp__trigger").trigger("click"); await flushPromises();
    await wrapper.setProps({ disabled: true }); await flushPromises();
    expect(wrapper.findAll("input").every((input) => input.element.disabled)).toBe(true);
    expect(wrapper.get<HTMLButtonElement>(".wl-dp__trigger").element.disabled).toBe(true);
    expect(document.querySelector(".wl-dp__panel")).toBeNull();
    await wrapper.get(".wl-dp__trigger").trigger("click");
    expect(document.querySelector(".wl-dp__panel")).toBeNull(); expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  it("preserves native readonly typing semantics while keeping calendar selection available", async () => {
    const wrapper = mount(WlDatePicker, { attachTo: document.body, props: { modelValue: "2026-10-15", showIcon: true, motion: false }, attrs: { readonly: true } });
    mounted.push(wrapper);
    expect(wrapper.get("input").element.readOnly).toBe(true);
    await wrapper.get(".wl-dp__trigger").trigger("click"); await flushPromises(); await choose("2026-10-20");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["2026-10-20"]);
  });

  it("merges new range PT sections with app values and exposes range state to day callbacks", async () => {
    expect(createWlPt().datepicker).toMatchObject({
      startLabel: { class: "wl-dp__endpoint-label" }, endLabel: { class: "wl-dp__endpoint-label" },
      endInput: { class: "wl-input wl-dp__input" }, rangeHint: { class: "wl-dp__range-hint" }
    });
    const wrapper = mount(WlDatePicker, {
      attachTo: document.body,
      global: { plugins: [[WlConfig, { pt: { datepicker: { endInput: { class: "app-end", "data-app": "end" } } } }]] },
      props: {
        selectionMode: "range", modelValue: ["2026-10-15", "2026-10-20"], showIcon: true, motion: false,
        pt: { endInput: { class: "local-end", "data-local": "end" }, startLabel: { "data-pt": "start-label" }, endLabel: { "data-pt": "end-label" }, rangeHint: { "data-pt": "range-hint" }, day: ({ context }: { context: Record<string, unknown> }) => ({ "data-between": String(context.inRange) }) }
      }
    });
    mounted.push(wrapper);
    expect(wrapper.get('[data-local="end"]').classes()).toEqual(expect.arrayContaining(["app-end", "local-end"]));
    expect(wrapper.get('[data-app="end"]').attributes("data-local")).toBe("end");
    expect(wrapper.get('[data-pt="start-label"]').text()).toBe("От");
    expect(wrapper.get('[data-pt="end-label"]').text()).toBe("До");
    await wrapper.get(".wl-dp__trigger").trigger("click"); await flushPromises();
    expect(document.querySelector('[data-pt="range-hint"]')).not.toBeNull();
    expect(day("2026-10-17").getAttribute("data-between")).toBe("true");
    expect(day("2026-10-15").getAttribute("data-between")).toBe("false");
  });
});
