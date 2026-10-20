import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WlConfig, WlTimePicker } from "../../src";

enableAutoUnmount(afterEach);
afterEach(() => {
  document.body.innerHTML = "";
});
describe("WlTimePicker", () => {
  it("represents a minute-precision local time and clearing as null", async () => {
    const wrapper = mount(WlTimePicker);
    const input = wrapper.get("input");
    expect(input.attributes("type")).toBe("time");
    expect(input.attributes("step")).toBe("60");
    expect(input.element.value).toBe("");
    for (const value of ["00:00", "09:30", "23:59", ""])
      await input.setValue(value);
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
