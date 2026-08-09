import { describe, it, expect } from "vitest";
import { h } from "vue";
import { mount } from "@vue/test-utils";
import {
  WlAccordion,
  WlField,
  WlNumberInput,
  WlPasswordInput,
  WlSlider,
  WlSteps
} from "../src";
import type { WlAccordionItem } from "../src";

describe("WlNumberInput", () => {
  it("increments and decrements via buttons", async () => {
    const wrapper = mount(WlNumberInput, { props: { modelValue: 3, min: 0, max: 10 } });
    await wrapper.find('[aria-label="Увеличить"]').trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([4]);

    // Real apps sync through v-model; mirror that between clicks.
    await wrapper.setProps({ modelValue: 4 });
    await wrapper.find('[aria-label="Уменьшить"]').trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[1]).toEqual([3]);
  });

  it("clamps at min/max and does not re-emit the same value", async () => {
    const wrapper = mount(WlNumberInput, { props: { modelValue: 10, min: 0, max: 10 } });
    await wrapper.find('[aria-label="Увеличить"]').trigger("click");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();

    const low = mount(WlNumberInput, { props: { modelValue: 0, min: 0, max: 10 } });
    await low.find('[aria-label="Уменьшить"]').trigger("click");
    expect(low.emitted("update:modelValue")).toBeUndefined();
  });

  it("honors step for buttons and arrow keys", async () => {
    const wrapper = mount(WlNumberInput, { props: { modelValue: 0, min: 0, max: 99, step: 5 } });
    await wrapper.find('[aria-label="Увеличить"]').trigger("click");
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
});

describe("WlPasswordInput", () => {
  it("starts as password and toggles to text", async () => {
    const wrapper = mount(WlPasswordInput, { props: { modelValue: "s3cret" } });
    const input = wrapper.find(".wl-input");
    expect(input.attributes("type")).toBe("password");

    const btn = wrapper.find(".wl-input-wrap__btn");
    expect(btn.attributes("aria-label")).toBe("Показать пароль");
    expect(btn.attributes("aria-pressed")).toBe("false");

    await btn.trigger("click");
    expect(input.attributes("type")).toBe("text");
    expect(btn.attributes("aria-label")).toBe("Скрыть пароль");
    expect(btn.attributes("aria-pressed")).toBe("true");

    await btn.trigger("click");
    expect(input.attributes("type")).toBe("password");
  });

  it("updates the model on typing", async () => {
    const wrapper = mount(WlPasswordInput, { props: { modelValue: "" } });
    await wrapper.find(".wl-input").setValue("hunter2");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["hunter2"]);
  });

  it("carries data-wl and invalid state", () => {
    const wrapper = mount(WlPasswordInput, { props: { modelValue: "", invalid: true } });
    expect(wrapper.find('[data-wl="password-input"]').exists()).toBe(true);
    expect(wrapper.find(".wl-input").classes()).toContain("is-invalid");
  });
});

describe("WlSlider", () => {
  it("paints the fill via --wl-slider-pct", () => {
    const wrapper = mount(WlSlider, { props: { modelValue: 40 } });
    const root = wrapper.find('[data-wl="slider"]');
    expect(root.attributes("style")).toContain("--wl-slider-pct: 40%");
  });

  it("emits update:modelValue on input", async () => {
    const wrapper = mount(WlSlider, { props: { modelValue: 40 } });
    await wrapper.find('[data-wl="slider"]').setValue(65);
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([65]);
  });

  it("clamps the percentage for out-of-range values", () => {
    const wrapper = mount(WlSlider, { props: { modelValue: 140, min: 0, max: 100 } });
    expect(wrapper.find('[data-wl="slider"]').attributes("style")).toContain(
      "--wl-slider-pct: 100%"
    );
  });
});

describe("WlAccordion", () => {
  const items: WlAccordionItem[] = [
    { key: "a", title: "Первый", content: "Текст А" },
    { key: "b", title: "Второй", content: "Текст Б" },
    { key: "c", title: "Третий", content: "Текст В", disabled: true }
  ];

  const summaries = (wrapper: ReturnType<typeof mount>) => wrapper.findAll(".wl-acc__summary");
  const details = (wrapper: ReturnType<typeof mount>) =>
    wrapper.findAll("details").map((d) => (d.element as HTMLDetailsElement).open);

  it("opens and closes items uncontrolled, multiple by default", async () => {
    const wrapper = mount(WlAccordion, { props: { items } });
    expect(details(wrapper)).toEqual([false, false, false]);

    await summaries(wrapper)[0]!.trigger("click");
    expect(details(wrapper)).toEqual([true, false, false]);
    expect(wrapper.emitted("update:openKeys")?.[0]).toEqual([["a"]]);

    await summaries(wrapper)[1]!.trigger("click");
    expect(details(wrapper)).toEqual([true, true, false]);
    expect(wrapper.emitted("update:openKeys")?.[1]).toEqual([["a", "b"]]);

    await summaries(wrapper)[0]!.trigger("click");
    expect(details(wrapper)).toEqual([false, true, false]);
  });

  it("single mode keeps only the latest item open", async () => {
    const wrapper = mount(WlAccordion, { props: { items, single: true } });
    await summaries(wrapper)[0]!.trigger("click");
    await summaries(wrapper)[1]!.trigger("click");
    expect(details(wrapper)).toEqual([false, true, false]);
    expect(wrapper.emitted("update:openKeys")?.[1]).toEqual([["b"]]);
  });

  it("does not toggle disabled items", async () => {
    const wrapper = mount(WlAccordion, { props: { items } });
    await summaries(wrapper)[2]!.trigger("click");
    expect(details(wrapper)).toEqual([false, false, false]);
    expect(wrapper.emitted("update:openKeys")).toBeUndefined();
  });

  it("respects controlled openKeys and only emits changes", async () => {
    const wrapper = mount(WlAccordion, { props: { items, openKeys: ["a"] } });
    expect(details(wrapper)).toEqual([true, false, false]);

    await summaries(wrapper)[1]!.trigger("click");
    expect(wrapper.emitted("update:openKeys")?.[0]).toEqual([["a", "b"]]);
    // Parent did not update the prop: DOM stays controlled.
    expect(details(wrapper)).toEqual([true, false, false]);
  });

  it("renders the scoped item slot with item and open", async () => {
    const wrapper = mount(WlAccordion, {
      props: { items },
      slots: {
        item: `<template #item="{ item, open }"><p class="custom">{{ item.title }}:{{ open ? 'open' : 'closed' }}</p></template>`
      }
    });
    const customs = wrapper.findAll(".custom");
    expect(customs).toHaveLength(3);
    expect(customs[0]!.text()).toBe("Первый:closed");
    await summaries(wrapper)[0]!.trigger("click");
    expect(wrapper.findAll(".custom")[0]!.text()).toBe("Первый:open");
  });
});

describe("WlSteps", () => {
  const items = [{ label: "Проект" }, { label: "Участники" }, { label: "Настройки" }, { label: "Готово" }];

  it("renders done, current and pending steps with connectors", () => {
    const wrapper = mount(WlSteps, { props: { items, current: 1 } });
    const steps = wrapper.findAll(".wl-steps__step");
    expect(steps).toHaveLength(4);
    expect(steps[0]!.classes()).toContain("is-done");
    expect(steps[0]!.find(".wl-icon").exists()).toBe(true);
    expect(steps[1]!.classes()).toContain("is-current");
    expect(steps[1]!.attributes("aria-current")).toBe("step");
    expect(steps[1]!.find(".wl-steps__num").text()).toBe("2");
    expect(steps[2]!.classes()).not.toContain("is-done");
    expect(steps[2]!.classes()).not.toContain("is-current");
    expect(steps[3]!.find(".wl-steps__num").text()).toBe("4");
    expect(wrapper.findAll(".wl-steps__line")).toHaveLength(3);
  });

  it("marks nothing done when current is 0", () => {
    const wrapper = mount(WlSteps, { props: { items, current: 0 } });
    expect(wrapper.findAll(".is-done")).toHaveLength(0);
    expect(wrapper.findAll(".is-current")).toHaveLength(1);
  });
});

describe("WlField", () => {
  it("wires label, control id and describedby through slot props", () => {
    const wrapper = mount(WlField, {
      props: { label: "Имя", required: true, hint: "Как в паспорте" },
      slots: {
        default: (p: {
          id: string;
          inputId: string;
          ariaDescribedby?: string;
          invalid: boolean;
          required: boolean;
        }) =>
          h("input", {
            id: p.inputId,
            class: "ctl",
            required: p.required,
            "aria-describedby": p.ariaDescribedby
          })
      }
    });

    const label = wrapper.find(".wl-field__label");
    const input = wrapper.find(".ctl");
    expect(label.attributes("for")).toBe(input.attributes("id"));
    expect(wrapper.find(".wl-field__req").text()).toBe("*");
    expect(input.attributes("required")).toBeDefined();

    const hint = wrapper.find(".wl-field__hint");
    expect(hint.text()).toBe("Как в паспорте");
    expect(input.attributes("aria-describedby")).toBe(hint.attributes("id"));
    expect(wrapper.find(".wl-field__err").exists()).toBe(false);
  });

  it("shows error instead of hint and flags invalid", () => {
    const wrapper = mount(WlField, {
      props: { label: "Имя", hint: "Как в паспорте", error: "Слишком короткое имя" },
      slots: {
        default: (p: { id: string; ariaDescribedby?: string; invalid: boolean }) =>
          h("input", {
            id: p.id,
            class: "ctl",
            "data-invalid": String(p.invalid),
            "aria-describedby": p.ariaDescribedby
          })
      }
    });

    const err = wrapper.find(".wl-field__err");
    expect(err.exists()).toBe(true);
    expect(err.text()).toContain("Слишком короткое имя");
    expect(err.find(".wl-icon").exists()).toBe(true);
    expect(wrapper.find(".wl-field__hint").exists()).toBe(false);
    expect(wrapper.find(".ctl").attributes("data-invalid")).toBe("true");
    expect(wrapper.find(".ctl").attributes("aria-describedby")).toBe(err.attributes("id"));
    expect(wrapper.find('[data-wl="field"]').classes()).toContain("is-invalid");
  });

  it("omits describedby when neither hint nor error is present", () => {
    const wrapper = mount(WlField, {
      props: { label: "Имя" },
      slots: {
        default: (p: { id: string; ariaDescribedby?: string }) =>
          h("input", { id: p.id, class: "ctl", "aria-describedby": p.ariaDescribedby })
      }
    });
    expect(wrapper.find(".ctl").attributes("aria-describedby")).toBeUndefined();
  });
});
