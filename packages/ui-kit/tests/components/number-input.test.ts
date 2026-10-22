import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { WlNumberInput } from "../../src";

describe("WlNumberInput", () => {
  it("increments and decrements via buttons", async () => {
    const wrapper = mount(WlNumberInput, { props: { modelValue: 3, min: 0, max: 10 } });
    await wrapper.find('[aria-label="Increase"]').trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([4]);

    // Real apps sync through v-model; mirror that between clicks.
    await wrapper.setProps({ modelValue: 4 });
    await wrapper.find('[aria-label="Decrease"]').trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[1]).toEqual([3]);
  });

  it("clamps at min/max and does not re-emit the same value", async () => {
    const wrapper = mount(WlNumberInput, { props: { modelValue: 10, min: 0, max: 10 } });
    await wrapper.find('[aria-label="Increase"]').trigger("click");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();

    const low = mount(WlNumberInput, { props: { modelValue: 0, min: 0, max: 10 } });
    await low.find('[aria-label="Decrease"]').trigger("click");
    expect(low.emitted("update:modelValue")).toBeUndefined();
  });

  it("honors step for buttons and arrow keys", async () => {
    const wrapper = mount(WlNumberInput, { props: { modelValue: 0, min: 0, max: 99, step: 5 } });
    await wrapper.find('[aria-label="Increase"]').trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([5]);

    const keys = mount(WlNumberInput, { props: { modelValue: 3, min: 0, max: 99 } });
    const input = keys.find(".wl-stepper__input");
    await input.trigger("keydown", { key: "ArrowUp" });
    expect(keys.emitted("update:modelValue")?.[0]).toEqual([4]);

    await keys.setProps({ modelValue: 4 });
    await input.trigger("keydown", { key: "ArrowDown" });
    expect(keys.emitted("update:modelValue")?.[1]).toEqual([3]);
  });

  it("clamps typed value on blur and restores draft for invalid input", async () => {
    const wrapper = mount(WlNumberInput, { props: { modelValue: 3, min: 0, max: 10 } });
    const input = wrapper.find(".wl-stepper__input");

    await input.setValue("42");
    await input.trigger("blur");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([10]);
    expect((input.element as HTMLInputElement).value).toBe("10");

    const invalid = mount(WlNumberInput, { props: { modelValue: 3, min: 0, max: 10 } });
    const bad = invalid.find(".wl-stepper__input");
    await bad.setValue("abc");
    await bad.trigger("blur");
    expect(invalid.emitted("update:modelValue")).toBeUndefined();
    expect((bad.element as HTMLInputElement).value).toBe("3");
  });

  it("marks the root with data attributes", () => {
    const wrapper = mount(WlNumberInput, { props: { modelValue: 1, size: "sm" } });
    const root = wrapper.find('[data-wl="number-input"]');
    expect(root.exists()).toBe(true);
    expect(root.attributes("data-size")).toBe("sm");
  });

  it("exposes spinbutton range semantics and configurable action labels", () => {
    const wrapper = mount(WlNumberInput, {
      props: {
        modelValue: 4,
        min: 1,
        max: 8,
        decrementLabel: "Убавить оценку",
        incrementLabel: "Добавить оценку"
      }
    });
    const input = wrapper.find("input");
    expect(input.attributes("role")).toBe("spinbutton");
    expect(input.attributes("aria-valuemin")).toBe("1");
    expect(input.attributes("aria-valuemax")).toBe("8");
    expect(input.attributes("aria-valuenow")).toBe("4");
    expect(wrapper.find('[aria-label="Убавить оценку"]').exists()).toBe(true);
    expect(wrapper.find('[aria-label="Добавить оценку"]').exists()).toBe(true);
  });

  it("uses an editable number on focus, commits Enter with precision and restores the currency display on blur", async () => {
    const wrapper = mount(WlNumberInput, {
      props: { modelValue: 1234.5, max: 10000, locale: "en-US", currency: "USD", precision: 2, prefix: "Price", suffix: "total" }
    });
    try {
      const input = wrapper.get<HTMLInputElement>("input");
      expect(input.element.value).toBe("$1,234.50");
      expect(wrapper.get(".wl-stepper__prefix").text()).toBe("Price");
      expect(wrapper.get(".wl-stepper__suffix").text()).toBe("total");
      await input.trigger("focus");
      expect(input.element.value).toBe("1234.5");
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
      await input.setValue("5678.125");
      await input.trigger("keydown", { key: "Enter" });
      expect(wrapper.emitted("update:modelValue")).toEqual([[5678.13]]);
      expect(input.element.value).toBe("5678.13");
      await input.trigger("blur");
      expect(input.element.value).toBe("$5,678.13");
      expect(wrapper.emitted("update:modelValue")).toHaveLength(1);
    } finally {
      wrapper.unmount();
    }
  });
});
