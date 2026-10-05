import { afterEach, describe, expect, it, vi } from "vitest";
import { enableAutoUnmount, mount } from "@vue/test-utils";
import { h } from "vue";
import { WlConfig, WlDatePicker, WlFilePicker, WlNumberInput, WlTimePicker } from "../src";

enableAutoUnmount(afterEach);
afterEach(() => { document.body.innerHTML = ""; });

describe("WlTimePicker", () => {
  it("represents a minute-precision local time and clearing as null", async () => {
    const wrapper = mount(WlTimePicker);
    const input = wrapper.get("input");
    expect(input.attributes("type")).toBe("time");
    expect(input.attributes("step")).toBe("60");
    expect(input.element.value).toBe("");
    for (const value of ["00:00", "09:30", "23:59", ""]) await input.setValue(value);
    expect(wrapper.emitted("update:modelValue")).toEqual([["00:00"], ["09:30"], ["23:59"], [null]]);
  });

  it("reacts to external model changes without emitting changes", async () => {
    const wrapper = mount(WlTimePicker, { props: { modelValue: "12:30" } });
    expect(wrapper.get("input").element.value).toBe("12:30");
    await wrapper.setProps({ modelValue: "18:45" });
    expect(wrapper.get("input").element.value).toBe("18:45");
    await wrapper.setProps({ modelValue: null });
    expect(wrapper.get("input").element.value).toBe("");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  it("keeps labels, form attributes and handlers on the native focus target", async () => {
    const focus = vi.fn();
    const wrapper = mount(WlTimePicker, {
      props: { invalid: true, size: "sm", density: "compact" },
      attrs: { id: "meeting-time", name: "start", required: true, "aria-describedby": "time-hint", onFocus: focus, class: "custom-time" }
    });
    const input = wrapper.get("input");
    expect(input.attributes()).toMatchObject({ id: "meeting-time", name: "start", required: "", "aria-describedby": "time-hint", "aria-invalid": "true" });
    expect(wrapper.classes()).toContain("custom-time");
    expect(wrapper.attributes()).toMatchObject({ "data-wl": "time-picker", "data-size": "sm", "data-density": "compact" });
    await input.trigger("focus");
    expect(focus).toHaveBeenCalledOnce();
  });

  it("retains the previous time after out-of-range input and Enter/blur", async () => {
    const wrapper = mount(WlTimePicker, { props: { modelValue: "10:00", minTime: "09:00", maxTime: "18:00" } });
    const input = wrapper.get("input");
    await input.setValue("08:59");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    await input.trigger("blur");
    expect(input.element.value).toBe("10:00");
    await input.setValue("18:01");
    await input.trigger("keydown", { key: "Enter" });
    expect(input.element.value).toBe("10:00");
    await input.setValue("09:00");
    expect(wrapper.emitted("update:modelValue")).toEqual([["09:00"]]);
  });

  it("supports native overnight ranges without introducing a date", async () => {
    const wrapper = mount(WlTimePicker, { props: { minTime: "22:00", maxTime: "02:00" } });
    const input = wrapper.get("input");
    await input.setValue("23:00");
    await input.setValue("01:00");
    await input.setValue("12:00");
    expect(wrapper.emitted("update:modelValue")).toEqual([["23:00"], ["01:00"]]);
    await input.trigger("blur");
    expect(input.element.value).toBe("01:00");
  });

  it("does not change the model while disabled or readonly", async () => {
    const disabled = mount(WlTimePicker, { props: { disabled: true, modelValue: "10:00" } });
    await disabled.get("input").setValue("12:00");
    expect(disabled.emitted("update:modelValue")).toBeUndefined();
    const readonly = mount(WlTimePicker, { props: { modelValue: "10:00" }, attrs: { readonly: true } });
    await readonly.get("input").setValue("12:00");
    expect(readonly.emitted("update:modelValue")).toBeUndefined();
    const emptyReadonly = mount(WlTimePicker, { props: { modelValue: "10:00" }, attrs: { readonly: "" } });
    await emptyReadonly.get("input").setValue("12:00");
    expect(emptyReadonly.emitted("update:modelValue")).toBeUndefined();
    const nativeReadonly = mount(WlTimePicker, { props: { modelValue: "10:00" }, attrs: { readOnly: true } });
    await nativeReadonly.get("input").setValue("12:00");
    expect(nativeReadonly.emitted("update:modelValue")).toBeUndefined();
  });

  it("respects native min/max attributes when named bounds are omitted", async () => {
    const wrapper = mount(WlTimePicker, { props: { modelValue: "10:00" }, attrs: { min: "09:00", max: "18:00" } });
    const input = wrapper.get("input");
    expect(input.attributes()).toMatchObject({ min: "09:00", max: "18:00" });
    await input.setValue("19:00");
    await input.trigger("blur");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    expect(input.element.value).toBe("10:00");
  });

  it("merges application and local pt without moving native attributes to the wrapper", () => {
    const wrapper = mount(WlTimePicker, {
      global: { plugins: [[WlConfig, { pt: { timepicker: { input: { class: "app-input", "data-app": "yes" } } } }]] },
      props: { pt: { input: { class: "local-input", "data-local": "yes" } } },
      attrs: { id: "pt-time" }
    });
    expect(wrapper.get("input").classes()).toEqual(expect.arrayContaining(["app-input", "local-input", "wl-input"]));
    expect(wrapper.get("input").attributes()).toMatchObject({ id: "pt-time", "data-app": "yes", "data-local": "yes" });
  });
});

describe("WlFilePicker", () => {
  function selected(input: HTMLInputElement, files: File[]): void {
    Object.defineProperty(input, "files", { configurable: true, value: files });
  }
  it("exposes a synchronous picker and keeps its input out of layout and tab order", async () => {
    const wrapper = mount(WlFilePicker, { props: { accept: "image/*", multiple: true, ariaLabel: "Добавить изображения" } });
    const input = wrapper.get("input").element;
    expect(input.hidden).toBe(true);
    expect(input.tabIndex).toBe(-1);
    expect(input.accept).toBe("image/*");
    expect(input.multiple).toBe(true);
    const click = vi.spyOn(input, "click").mockImplementation(() => {});
    (wrapper.vm as unknown as { choose(): void }).choose();
    expect(click).toHaveBeenCalledOnce();
    await wrapper.get("button").trigger("click");
    expect(click).toHaveBeenCalledTimes(2);
    expect(wrapper.get("button").attributes("aria-label")).toBe("Добавить изображения");
  });

  it("returns each raw batch without validation, accumulation or duplicate removal", async () => {
    const wrapper = mount(WlFilePicker, { props: { accept: "image/*", multiple: true } });
    const input = wrapper.get("input");
    const file = new File(["content"], "document.txt", { type: "text/plain" });
    selected(input.element, [file, file]);
    await input.trigger("change");
    selected(input.element, [file]);
    await input.trigger("change");
    expect(wrapper.emitted("select")).toEqual([[[file, file]], [[file]]]);
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    expect(wrapper.find("ul").exists()).toBe(false);
  });

  it("resets native selection for repeat picks and exposes clear without a select event", async () => {
    const wrapper = mount(WlFilePicker);
    const input = wrapper.get("input");
    const file = new File(["x"], "same.png", { type: "image/png" });
    let browserValue = "C:\\fakepath\\same.png";
    Object.defineProperty(input.element, "value", { configurable: true, get: () => browserValue, set: (value) => { browserValue = value; } });
    selected(input.element, [file]);
    await input.trigger("change");
    expect(browserValue).toBe("");
    browserValue = "C:\\fakepath\\same.png";
    (wrapper.vm as unknown as { clear(): void }).clear();
    expect(browserValue).toBe("");
    expect(wrapper.emitted("select")).toHaveLength(1);
  });

  it("does not create a selection when the native picker is cancelled or empty", async () => {
    const wrapper = mount(WlFilePicker);
    const input = wrapper.get("input");
    selected(input.element, []);
    await input.trigger("change");
    await input.trigger("cancel");
    expect(wrapper.emitted("select")).toBeUndefined();
    expect(wrapper.emitted("cancel")).toEqual([[]]);
  });

  it("blocks both public choose and synthetic change while disabled", async () => {
    const wrapper = mount(WlFilePicker, { props: { disabled: true } });
    const input = wrapper.get("input");
    const click = vi.spyOn(input.element, "click").mockImplementation(() => {});
    (wrapper.vm as unknown as { choose(): void }).choose();
    expect(click).not.toHaveBeenCalled();
    selected(input.element, [new File(["x"], "file.txt")]);
    await input.trigger("change");
    expect(wrapper.emitted("select")).toBeUndefined();
    expect(wrapper.get("button").attributes("disabled")).toBeDefined();
  });

  it("offers a custom trigger without adding another visible default button", async () => {
    const wrapper = mount(WlFilePicker, { slots: { trigger: ({ choose, disabled }) => h("button", { disabled, onClick: choose }, "Свой выбор") } });
    expect(wrapper.findAll("button")).toHaveLength(1);
    const click = vi.spyOn(wrapper.get("input").element, "click").mockImplementation(() => {});
    await wrapper.get("button").trigger("click");
    expect(click).toHaveBeenCalledOnce();
  });

  it("routes label ids and focus/aria to the visible trigger, capture/name to the native picker", async () => {
    const focus = vi.fn();
    const wrapper = mount(WlFilePicker, { attrs: { id: "attachment-picker", "aria-describedby": "attachment-hint", name: "attachment", capture: "environment", onFocus: focus } });
    const button = wrapper.get("button");
    expect(button.attributes()).toMatchObject({ id: "attachment-picker", "aria-describedby": "attachment-hint" });
    expect(wrapper.get("input").attributes()).toMatchObject({ name: "attachment", capture: "environment" });
    expect(wrapper.get("input").attributes("id")).toBeUndefined();
    await button.trigger("focus");
    expect(focus).toHaveBeenCalledOnce();
  });
});

describe("date and number compatibility", () => {
  it("keeps the old Russian date default and changes representation without changing ISO model", async () => {
    const wrapper = mount(WlDatePicker, { props: { modelValue: "2026-10-15" } });
    expect(wrapper.get("input").element.value).toBe("15.10.2026");
    await wrapper.setProps({ displayFormat: "yyyy-mm-dd" });
    expect(wrapper.get("input").element.value).toBe("2026-10-15");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    await wrapper.setProps({ modelValue: "2026-10-16" });
    expect(wrapper.get("input").element.value).toBe("2026-10-16");
  });

  it("parses ISO presentation consistently and restores invalid or out-of-range drafts", async () => {
    const wrapper = mount(WlDatePicker, { props: { modelValue: "2026-10-15", displayFormat: "yyyy-mm-dd", minDate: "2026-10-01", maxDate: "2026-10-31" } });
    const input = wrapper.get("input");
    for (const value of ["15.10.2026", "2026-10-32", "2026-11-01"]) {
      await input.setValue(value);
      await input.trigger("blur");
      expect(input.element.value).toBe("2026-10-15");
    }
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    await input.setValue("2026-10-20");
    await input.trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("update:modelValue")).toEqual([["2026-10-20"]]);
    await input.setValue("");
    await input.trigger("blur");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([null]);
  });

  it("preserves the default max=99 while allowing an explicit unbounded maximum", async () => {
    const bounded = mount(WlNumberInput, { props: { modelValue: 98 } });
    await bounded.get("input").setValue("120");
    await bounded.get("input").trigger("blur");
    expect(bounded.emitted("update:modelValue")).toEqual([[99]]);
    const unbounded = mount(WlNumberInput, { props: { modelValue: 100, max: Infinity } });
    expect(unbounded.get("input").attributes("aria-valuemax")).toBeUndefined();
    expect(unbounded.get("input").attributes("aria-valuemin")).toBe("0");
    await unbounded.get("input").setValue("120");
    await unbounded.get("input").trigger("blur");
    expect(unbounded.emitted("update:modelValue")).toEqual([[120]]);
  });
});
