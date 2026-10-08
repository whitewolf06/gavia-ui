import { describe, expect, it } from "vitest";
import { computed, defineComponent, h, reactive } from "vue";
import { mount } from "@vue/test-utils";
import { normalizeWlLocale, wlLocaleRu, WlConfig, type WlLocaleInput } from "../src";
import { useWlLocale } from "../src/config";

describe("locale input contract", () => {
  it("preserves required defaults when overrides explicitly contain undefined", () => {
    const locale = normalizeWlLocale({ dayNamesMin: undefined, monthNames: undefined, accept: undefined });
    expect(locale.dayNamesMin).toEqual(wlLocaleRu.dayNamesMin);
    expect(locale.monthNames).toEqual(wlLocaleRu.monthNames);
    expect(locale.accept).toBe(wlLocaleRu.accept);
  });

  it("validates weekday range and complete string name arrays at the JavaScript boundary", () => {
    for (const firstDayOfWeek of [-1, 7, 1.5, NaN, Infinity]) {
      expect(normalizeWlLocale({ firstDayOfWeek }).firstDayOfWeek).toBe(wlLocaleRu.firstDayOfWeek);
    }
    expect(normalizeWlLocale({ firstDayOfWeek: 0 }).firstDayOfWeek).toBe(0);
    expect(normalizeWlLocale({ firstDayOfWeek: 6 }).firstDayOfWeek).toBe(6);
    const invalid = {
      dayNamesMin: Array<string>(7), // sparse arrays must not pass the seven-string guard
      dayNames: ["Sunday"],
      monthNames: [...wlLocaleRu.monthNames, "Extra"],
      monthNamesShort: [1, ...wlLocaleRu.monthNamesShort.slice(1)],
      chooseYear: false
    } as unknown as WlLocaleInput;
    const locale = normalizeWlLocale(invalid);
    expect(locale.dayNamesMin).toEqual(wlLocaleRu.dayNamesMin);
    expect(locale.dayNames).toEqual(wlLocaleRu.dayNames);
    expect(locale.monthNames).toEqual(wlLocaleRu.monthNames);
    expect(locale.monthNamesShort).toEqual(wlLocaleRu.monthNamesShort);
    expect(locale.chooseYear).toBe(wlLocaleRu.chooseYear);
  });

  it("accepts readonly input without mutating it and keeps defined application extensions", () => {
    const names = Object.freeze(["S", "M", "T", "W", "T", "F", "S"] as const);
    const marker = { translated: true };
    const locale = normalizeWlLocale({ dayNamesMin: names, accept: "", appMarker: marker, absent: undefined });
    expect(locale.dayNamesMin).toEqual(names);
    expect(locale.dayNamesMin).not.toBe(names);
    expect(locale.accept).toBe("");
    expect(locale.appMarker).toBe(marker);
    expect(Object.prototype.hasOwnProperty.call(locale, "absent")).toBe(false);
    expect(names).toEqual(["S", "M", "T", "W", "T", "F", "S"]);
  });

  it("does not share mutable resolved name arrays between app consumers", () => {
    const first = normalizeWlLocale();
    const second = normalizeWlLocale();
    const original = wlLocaleRu.dayNamesMin[0];
    first.dayNamesMin[0] = "Changed by one consumer";
    expect(second.dayNamesMin[0]).toBe(original);
    expect(wlLocaleRu.dayNamesMin[0]).toBe(original);
  });

  it("normalizes reactive app configuration whenever a consumer renders the resolved locale", async () => {
    const options = reactive<{ locale: WlLocaleInput }>({ locale: { accept: "Proceed" } });
    const Harness = defineComponent({
      setup() {
        const locale = useWlLocale();
        const text = computed(() => `${locale.value.accept}: ${locale.value.dayNamesMin[0]}`);
        return () => h("span", text.value);
      }
    });
    const wrapper = mount(Harness, { global: { plugins: [[WlConfig, options]] } });
    expect(wrapper.text()).toBe(`Proceed: ${wlLocaleRu.dayNamesMin[0]}`);
    options.locale.accept = undefined;
    options.locale.dayNamesMin = undefined;
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toBe(`${wlLocaleRu.accept}: ${wlLocaleRu.dayNamesMin[0]}`);
    wrapper.unmount();
  });
});
