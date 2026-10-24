import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { WlDatePicker, WlNumberInput } from "../../src";

enableAutoUnmount(afterEach);
afterEach(() => {
  document.body.innerHTML = "";
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
