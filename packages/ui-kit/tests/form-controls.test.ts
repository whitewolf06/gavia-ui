import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { nextTick } from "vue";
import { WlInput, WlNumberInput, WlPasswordInput, WlSlider, WlSwitch, WlTextarea } from "../src";
import { wlLocaleEn } from "../src/locale";

describe("form component depth", () => {
  it("Input clears to a string, restores focus and exposes a non-live character counter", async () => {
    const wrapper = mount(WlInput, {
      attachTo: document.body, props: { modelValue: "Hello", clearable: true, showCount: true }, attrs: { maxlength: 20, "aria-describedby": "hint" }
    });
    try {
      expect(wrapper.get(".wl-input-counter").text()).toBe("5 / 20");
      const input = wrapper.get<HTMLInputElement>("input");
      expect(input.attributes("aria-describedby")).toContain("hint");
      expect(input.attributes("aria-describedby")).toContain(wrapper.get(".wl-input-counter").attributes("id"));
      await wrapper.get(`button[aria-label="${wlLocaleEn.clear}"]`).trigger("click");
      await nextTick();
      expect(wrapper.emitted("update:modelValue")).toEqual([[""]]);
      expect(document.activeElement).toBe(input.element);
    } finally { wrapper.unmount(); }
  });

  it("Input keeps consumer suffixes while showing a loading state", () => {
    const wrapper = mount(WlInput, { props: { loading: true }, slots: { suffix: "Suffix" } });
    expect(wrapper.get("input").attributes("aria-busy")).toBe("true");
    expect(wrapper.find(".wl-input-wrap__spinner").exists()).toBe(true);
    expect(wrapper.text()).toContain("Suffix");
    wrapper.unmount();
  });

  it("Textarea forwards native attrs, displays its counter and caps auto resize at maxRows", async () => {
    const wrapper = mount(WlTextarea, {
      attachTo: document.body,
      props: { modelValue: "Hello", showCount: true, autoResize: true, maxRows: 2, size: "sm", density: "compact" },
      attrs: { maxlength: 20, name: "description", style: "line-height: 20px; padding: 0; border: 0" }
    });
    try {
      const input = wrapper.get<HTMLTextAreaElement>("textarea");
      Object.defineProperty(input.element, "scrollHeight", { configurable: true, value: 140 });
      await wrapper.setProps({ modelValue: "More text" });
      await nextTick();
      expect(input.element.style.height).toBe("40px");
      expect(input.element.style.overflowY).toBe("auto");
      expect(input.attributes("name")).toBe("description");
      expect(input.attributes("data-size")).toBe("sm");
      expect(input.attributes("data-density")).toBe("compact");
      expect(wrapper.get(".wl-input-counter").text()).toBe("9 / 20");
    } finally { wrapper.unmount(); }
  });

  it("PasswordInput defaults autocomplete and resolves PT and consumer-supplied strength", async () => {
    const wrapper = mount(WlPasswordInput, { props: { strength: 75, strengthLabel: "Password strength", pt: {
      input: { "data-input": "yes" }, toggleButton: { "data-toggle": "yes" }, strength: { "data-strength": "yes" }
    } } });
    try {
      expect(wrapper.get("input").attributes("autocomplete")).toBe("current-password");
      expect(wrapper.get("input").attributes("data-input")).toBe("yes");
      expect(wrapper.get("button").attributes("data-toggle")).toBe("yes");
      expect(wrapper.get("meter").attributes("value")).toBe("75");
      expect(wrapper.get("meter").attributes("aria-label")).toBe("Password strength");
      await wrapper.setProps({ autocomplete: "new-password" });
      expect(wrapper.get("input").attributes("autocomplete")).toBe("new-password");
    } finally { wrapper.unmount(); }
  });

  it("NumberInput formats locale/currency and parses localized drafts without changing its number model", async () => {
    const wrapper = mount(WlNumberInput, {
      props: { modelValue: 1234.5, min: 0, max: 10000, locale: "de-DE", currency: "EUR", precision: 2 },
      slots: { prefix: "€", suffix: "total" }
    });
    try {
      const input = wrapper.get<HTMLInputElement>("input");
      expect(input.element.value).toContain("1.234,50");
      await input.setValue("2.345,67 €");
      await input.trigger("blur");
      expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([2345.67]);
      expect(input.element.value).toContain("2.345,67");
      expect(wrapper.text()).toContain("total");
    } finally { wrapper.unmount(); }
  });

  it("NumberInput accepts currency codes and scientific drafts without concatenating separate numbers", async () => {
    const wrapper = mount(WlNumberInput, { props: { modelValue: 1, max: 10000, locale: "de-DE", currency: "EUR", precision: 2 } });
    try {
      const input = wrapper.get("input");
      await input.setValue("2.345,67 EUR");
      await input.trigger("blur");
      expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([2345.67]);
      await input.setValue("2,5e2 €");
      await input.trigger("blur");
      expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([250]);
      const count = wrapper.emitted("update:modelValue")!.length;
      await input.setValue("1 invalid 2");
      await input.trigger("blur");
      expect(wrapper.emitted("update:modelValue")).toHaveLength(count);
    } finally { wrapper.unmount(); }
  });

  it("NumberInput honors a native readonly attribute for buttons and draft commits", async () => {
    const wrapper = mount(WlNumberInput, { props: { modelValue: 3 }, attrs: { readonly: true } });
    try {
      expect(wrapper.findAll("button").every((button) => button.attributes("disabled") !== undefined)).toBe(true);
      await wrapper.get("input").setValue("5");
      await wrapper.get("input").trigger("blur");
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    } finally { wrapper.unmount(); }
  });

  it("Switch loading blocks updates and supports a leading label", async () => {
    const wrapper = mount(WlSwitch, { props: { loading: true, labelPosition: "start" }, slots: { default: "Enabled" } });
    const input = wrapper.get<HTMLInputElement>("input");
    expect(input.element.disabled).toBe(true);
    expect(input.attributes("aria-busy")).toBe("true");
    expect(wrapper.attributes("data-label-position")).toBe("start");
    await input.setValue(true);
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    wrapper.unmount();
  });

  it("Slider range keeps thumbs ordered, exposes value text and renders marks", async () => {
    const wrapper = mount(WlSlider, {
      props: { range: true, modelValue: [20, 80], min: 0, max: 100, startLabel: "Minimum", endLabel: "Maximum",
        ariaValueText: (value: number) => `${value}%`, marks: [{ value: 50, label: "Middle" }] }
    });
    try {
      const controls = wrapper.findAll<HTMLInputElement>('input[type="range"]');
      expect(controls).toHaveLength(2);
      expect(controls[0]!.attributes("aria-label")).toBe("Minimum");
      expect(controls[1]!.attributes("aria-label")).toBe("Maximum");
      expect(controls[0]!.attributes("aria-valuetext")).toBe("20%");
      expect(wrapper.get(".wl-slider__mark").text()).toBe("Middle");
      await controls[0]!.setValue("95");
      expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([[80, 80]]);
      await wrapper.setProps({ disabled: true });
      expect(controls[0]!.element.disabled).toBe(true);
      expect(controls[1]!.element.disabled).toBe(true);
    } finally { wrapper.unmount(); }
  });
});
