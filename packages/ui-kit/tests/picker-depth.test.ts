import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { h, nextTick, reactive } from "vue";
import { WlCalendar, WlColorPicker, WlConfig, WlDatePicker, WlTimePicker } from "../src";
import { pickerHex, pickerHsva } from "../src/utils/colorPicker";
import { createDateInputFormat } from "../src/utils/dateInputFormat";

const wrappers: VueWrapper[] = [];
afterEach(async () => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount());
  await nextTick();
  document.body.replaceChildren();
});

describe("DatePicker localized formats and availability", () => {
  it("applies compact density consistently to single and both range inputs", async () => {
    const single = mount(WlDatePicker, { props: { density: "compact" } });
    const range = mount(WlDatePicker<"range">, { props: { selectionMode: "range", density: "compact" } });
    wrappers.push(single, range);
    for (const wrapper of [single, range]) {
      expect(wrapper.get('[data-wl="date-picker"]').attributes("data-density")).toBe("compact");
      expect(wrapper.findAll("input").every((input) => input.classes().includes("is-compact"))).toBe(true);
      await wrapper.setProps({ density: "default" });
      expect(wrapper.findAll("input").every((input) => !input.classes().includes("is-compact"))).toBe(true);
    }
    expect(range.findAll("input")).toHaveLength(2);
  });

  it("formats and parses named Gregorian dates through Intl, reacts to locale changes without emitting", async () => {
    const config = reactive({ locale: { localeCode: "en-US" } });
    const wrapper = mount(WlDatePicker, {
      global: { plugins: [[WlConfig, config]] },
      props: { modelValue: "2026-10-15", displayFormat: "locale", formatOptions: { dateStyle: "long" } }
    });
    wrappers.push(wrapper);
    const input = wrapper.get("input");
    expect(input.element.value).toBe("October 15, 2026");
    await input.setValue("October 20, 2026");
    await input.trigger("blur");
    expect(wrapper.emitted("update:modelValue")).toEqual([["2026-10-20"]]);
    config.locale.localeCode = "de-DE";
    await nextTick();
    expect(input.element.value).toBe("20. Oktober 2026");
    expect(wrapper.emitted("update:modelValue")).toHaveLength(1);
    await input.setValue("31. Februar 2026");
    await input.trigger("blur");
    expect(input.element.value).toBe("20. Oktober 2026");
  });

  it.each(["en-US", "ru-RU", "ar-EG"])("round trips localized digits/order and full/short formats (%s)", (code) => {
    for (const dateStyle of ["short", "full"] as const) {
      const format = createDateInputFormat(code, { dateStyle });
      const presentation = format.format("1949-11-22");
      expect(format.parse(presentation, "1948-11-22")).toBe("1949-11-22");
    }
  });

  it("disables unavailable dates for click, typed commits and keyboard traversal", async () => {
    const wrapper = mount(WlDatePicker, { attachTo: document.body, props: { modelValue: "2026-10-16", disabledDates: ["2026-10-17"], motion: false } });
    wrappers.push(wrapper);
    const input = wrapper.get("input");
    await input.trigger("keydown", { key: "ArrowDown" });
    await flushPromises();
    const unavailable = document.querySelector<HTMLButtonElement>('[data-date="2026-10-17"]')!;
    expect(unavailable.disabled).toBe(true);
    unavailable.click();
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    document.querySelector('[data-date="2026-10-16"]')!.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
    await flushPromises();
    expect(document.activeElement?.getAttribute("data-date")).toBe("2026-10-18");
    await input.setValue("17.10.2026");
    await input.trigger("blur");
    expect(input.element.value).toBe("16.10.2026");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    await wrapper.setProps({ disabledDates: () => true });
    expect([...document.querySelectorAll<HTMLButtonElement>("[data-date]")].every((button) => button.disabled)).toBe(true);
  });

  it("accepts sorted range presets, disables invalid endpoints and rechecks dynamic presets on activation", async () => {
    let dynamic: readonly [string, string] = ["2026-10-12", "2026-10-13"];
    const wrapper = mount(WlDatePicker<"range">, {
      attachTo: document.body,
      props: { selectionMode: "range", motion: false, minDate: "2026-10-01", maxDate: "2026-10-31", disabledDates: ["2026-10-10"], rangePresets: [
        { label: "Week", value: ["2026-10-09", "2026-10-05"] },
        { label: "Unavailable", value: ["2026-10-10", "2026-10-11"] },
        { label: "Dynamic", value: () => dynamic }
      ] }
    });
    wrappers.push(wrapper);
    await wrapper.get("input").trigger("click");
    const buttons = [...document.querySelectorAll<HTMLButtonElement>(".wl-dp__preset")];
    expect(buttons[1]?.disabled).toBe(true);
    dynamic = ["2026-11-01", "2026-11-02"];
    buttons[2]!.click();
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    buttons[0]!.click();
    await flushPromises();
    expect(wrapper.emitted("update:modelValue")).toEqual([[["2026-10-05", "2026-10-09"]]]);
    expect(document.querySelector(".wl-dp__panel")).toBeNull();
  });
});

describe("TimePicker precision and presentation", () => {
  it("uses second steps relative to the minimum and rejects misaligned drafts", async () => {
    const wrapper = mount(WlTimePicker, { props: { modelValue: "09:00:05", minTime: "09:00:05", step: 15 } });
    wrappers.push(wrapper);
    const input = wrapper.get("input");
    expect(input.attributes("step")).toBe("15");
    await input.setValue("09:00:20");
    await input.setValue("09:00:30");
    expect(wrapper.emitted("update:modelValue")).toEqual([["09:00:20"]]);
    await input.trigger("blur");
    expect(input.element.value).toBe("09:00:20");
  });

  it("edits localized 12/24-hour text without changing the canonical wall-clock model", async () => {
    const wrapper = mount(WlTimePicker, { global: { plugins: [[WlConfig, { locale: { localeCode: "en-US" } }]] }, props: { modelValue: "13:05", hourFormat: 12 } });
    wrappers.push(wrapper);
    const input = wrapper.get("input");
    expect(input.attributes("type")).toBe("text");
    expect(input.element.value.replace(/\s/g, " ")).toBe("01:05 PM");
    await input.setValue("12:30 AM");
    expect(wrapper.emitted("update:modelValue")).toEqual([["00:30"]]);
    await input.setValue("13:30 PM");
    await input.trigger("blur");
    expect(input.element.value.replace(/\s/g, " ")).toBe("12:30 AM");
    await wrapper.setProps({ hourFormat: 24 });
    expect(input.element.value).toBe("00:30");
    expect(wrapper.emitted("update:modelValue")).toHaveLength(1);
  });

  it("supports disjoint and overnight availability intervals and native any precision", async () => {
    const wrapper = mount(WlTimePicker, { props: { step: "900", allowedIntervals: [{ start: "09:00", end: "12:00" }, { start: "22:00", end: "02:00" }] } });
    wrappers.push(wrapper);
    const input = wrapper.get("input");
    for (const value of ["09:00", "12:30", "23:00", "01:00", "09:01"]) await input.setValue(value);
    expect(wrapper.emitted("update:modelValue")).toEqual([["09:00"], ["23:00"], ["01:00"]]);
    await wrapper.setProps({ step: "any", allowedIntervals: undefined });
    await input.setValue("12:34:56");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["12:34:56"]);
  });
});

describe("Calendar multiple selection and custom days", () => {
  it("toggles dates with a fresh array while preserving a frozen incoming selection and one tab stop", async () => {
    const incoming = ["2026-10-15"];
    Object.freeze(incoming);
    const wrapper = mount(WlCalendar<true>, { props: { multiple: true, modelValue: incoming, month: "2026-10" } });
    wrappers.push(wrapper);
    expect(wrapper.get('[role="grid"]').attributes("aria-multiselectable")).toBe("true");
    await wrapper.get('[data-date="2026-10-16"]').trigger("click");
    expect(wrapper.emitted("update:modelValue")).toEqual([[["2026-10-15", "2026-10-16"]]]);
    expect(incoming).toEqual(["2026-10-15"]);
    await wrapper.get('[data-date="2026-10-15"]').trigger("keydown", { key: " " });
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([["2026-10-16"]]);
    expect(wrapper.findAll('[role="gridcell"][tabindex="0"]')).toHaveLength(1);
  });

  it("renders typed day slots, locale week starts and merged pt, and guards disabled edits", async () => {
    const wrapper = mount(WlCalendar<false>, {
      global: { plugins: [[WlConfig, { locale: { firstDayOfWeek: 0 }, pt: { calendar: { root: { class: "app-calendar" } } } }]] },
      props: { month: "2026-11", events: [{ date: "2026-11-01", label: "One" }], pt: { root: { class: "local-calendar" }, day: { "data-custom-day": "yes" } } },
      slots: { day: ({ iso, events }) => h("span", `${iso}:${events.length}`) }
    });
    wrappers.push(wrapper);
    expect(wrapper.classes()).toEqual(expect.arrayContaining(["app-calendar", "local-calendar", "wl-cal"]));
    expect(wrapper.find("[data-date]").attributes("data-date")).toBe("2026-11-01");
    expect(wrapper.get('[data-date="2026-11-01"]').text()).toBe("2026-11-01:1");
    expect(wrapper.get('[data-date="2026-11-01"]').attributes("data-custom-day")).toBe("yes");
    await wrapper.setProps({ disabled: true });
    await wrapper.get('[data-date="2026-11-01"]').trigger("click");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });
});

describe("ColorPicker alpha and HSV", () => {
  it("routes Field identity, native attributes and events to the hex control while keeping root presentation", async () => {
    const seen: EventTarget[] = [];
    const wrapper = mount(WlColorPicker, {
      attrs: { id: "color-field", name: "accent", form: "settings", required: true, "aria-labelledby": "color-label", "aria-describedby": "color-help", class: "consumer-color", "data-consumer": "yes", onInput: (event: Event) => seen.push(event.target!) },
      props: { pt: { input: { class: "custom-hex" } } }
    });
    wrappers.push(wrapper);
    const input = wrapper.get(".wl-color-picker__hex");
    expect(wrapper.attributes("id")).toBeUndefined();
    expect(wrapper.attributes("aria-labelledby")).toBeUndefined();
    expect(wrapper.classes()).toContain("consumer-color");
    expect(wrapper.attributes("data-consumer")).toBe("yes");
    expect(input.attributes()).toMatchObject({ id: "color-field", name: "accent", form: "settings", required: "", "aria-labelledby": "color-label", "aria-describedby": "color-help" });
    expect(input.attributes("aria-label")).toBeUndefined();
    expect(input.classes()).toContain("custom-hex");
    await input.setValue("#123456");
    expect(seen).toEqual([input.element]);
    await wrapper.setProps({ "aria-labelledby": undefined, "aria-label": "Accent hex" });
    expect(input.attributes("aria-label")).toBe("Accent hex");
  });

  it("honors native readonly across the input, swatches and alternative channels", async () => {
    const wrapper = mount(WlColorPicker, { attrs: { readonly: "" }, props: { modelValue: "#ff0000", custom: true, alpha: true } });
    wrappers.push(wrapper);
    const input = wrapper.get<HTMLInputElement>(".wl-color-picker__hex");
    expect(input.element.readOnly).toBe(true);
    expect(wrapper.findAll("button, input[type=range]").every((control) => (control.element as HTMLInputElement).disabled)).toBe(true);
    await input.setValue("#00ff0080");
    await wrapper.get('[data-channel="h"]').setValue("120");
    await wrapper.get("button").trigger("click");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  it("keeps legacy opaque output and rejects alpha until enabled", async () => {
    const wrapper = mount(WlColorPicker);
    wrappers.push(wrapper);
    await wrapper.get("input").setValue("#ff000080");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    await wrapper.setProps({ alpha: true });
    await wrapper.get(".wl-color-picker__hex").setValue("#0f08");
    expect(wrapper.emitted("update:modelValue")).toEqual([["#00ff0088"]]);
  });

  it("edits HSV and opacity through labelled native sliders and reacts to external colors", async () => {
    const wrapper = mount(WlColorPicker, { props: { modelValue: "#ff000080", alpha: true, custom: true } });
    wrappers.push(wrapper);
    expect(wrapper.findAll('input[type="range"]')).toHaveLength(4);
    await wrapper.get('[data-channel="h"]').setValue("120");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["#00ff0080"]);
    await wrapper.get('[data-channel="s"]').setValue("0");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["#ffffff80"]);
    await wrapper.get('[data-channel="a"]').setValue("100");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["#ffffffff"]);
    await wrapper.setProps({ modelValue: "#0000ff40" });
    expect((wrapper.get('[data-channel="h"]').element as HTMLInputElement).value).toBe("240");
    await wrapper.setProps({ disabled: true });
    const count = wrapper.emitted("update:modelValue")!.length;
    await wrapper.get('[data-channel="h"]').setValue("60");
    expect(wrapper.emitted("update:modelValue")).toHaveLength(count);
  });

  it("round trips opaque and alpha RGB channels through HSV without losing channel precision", () => {
    for (const color of ["#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff", "#a1b2c3", "#12345680", "#00000000"]) {
      expect(pickerHex(pickerHsva(color), color.length === 9)).toBe(color);
    }
  });
});
