import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { computed, createSSRApp, defineComponent, h, reactive } from "vue";
import { renderToString } from "vue/server-renderer";
import { normalizeWlLocale, WlConfig, WlDatePicker, WlFilePicker, wlLocaleEn, type WlLocaleInput, wlLocaleRu, WlPasswordInput, type WlResolvedLocale } from "../../src";
import { useWlLocale } from "../../src/config";
import { formatWlLocaleText } from "../../src/locale";

describe("locale input contract", () => {
  it("uses English defaults when overrides explicitly contain undefined", () => {
    const locale = normalizeWlLocale({ dayNamesMin: undefined, monthNames: undefined, accept: undefined });
    expect(locale.dayNamesMin).toEqual(wlLocaleEn.dayNamesMin);
    expect(locale.monthNames).toEqual(wlLocaleEn.monthNames);
    expect(locale.accept).toBe(wlLocaleEn.accept);
  });

  it("validates weekday range and complete string name arrays at the JavaScript boundary", () => {
    for (const firstDayOfWeek of [-1, 7, 1.5, NaN, Infinity]) {
      expect(normalizeWlLocale({ firstDayOfWeek }).firstDayOfWeek).toBe(wlLocaleEn.firstDayOfWeek);
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
    expect(locale.dayNamesMin).toEqual(wlLocaleEn.dayNamesMin);
    expect(locale.dayNames).toEqual(wlLocaleEn.dayNames);
    expect(locale.monthNames).toEqual(wlLocaleEn.monthNames);
    expect(locale.monthNamesShort).toEqual(wlLocaleEn.monthNamesShort);
    expect(locale.chooseYear).toBe(wlLocaleEn.chooseYear);
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
    const original = wlLocaleEn.dayNamesMin[0];
    first.dayNamesMin[0] = "Changed by one consumer";
    expect(second.dayNamesMin[0]).toBe(original);
    expect(wlLocaleEn.dayNamesMin[0]).toBe(original);
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
    expect(wrapper.text()).toBe(`Proceed: ${wlLocaleEn.dayNamesMin[0]}`);
    options.locale.accept = undefined;
    options.locale.dayNamesMin = undefined;
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toBe(`${wlLocaleEn.accept}: ${wlLocaleEn.dayNamesMin[0]}`);
    wrapper.unmount();
  });

  it("keeps Russian opt-in explicit, including partial overrides and an explicit base", () => {
    const partial = normalizeWlLocale({ close: "Закрыть", localeCode: "ru-RU" });
    expect(partial.close).toBe("Закрыть");
    expect(partial.chooseFiles).toBe(wlLocaleEn.chooseFiles);
    expect(partial.monthNames).toEqual(wlLocaleEn.monthNames);
    const russian = normalizeWlLocale({ ...wlLocaleRu, close: "Закрыть окно" });
    expect(russian.close).toBe("Закрыть окно");
    expect(russian.chooseFiles).toBe(wlLocaleRu.chooseFiles);
    expect(russian.monthNames).toEqual(wlLocaleRu.monthNames);
    expect(normalizeWlLocale({ close: "Dismiss" }, wlLocaleRu).dateFrom).toBe(wlLocaleRu.dateFrom);
  });

  it("fills absent or invalid plural messages in an explicit legacy base from English", () => {
    const base = { ...wlLocaleRu, selectedItems: undefined, resultsFound: undefined };
    const locale = normalizeWlLocale(undefined, base);
    expect(locale.selectedItems).toEqual(wlLocaleEn.selectedItems);
    expect(locale.resultsFound).toEqual(wlLocaleEn.resultsFound);
    expect(base.selectedItems).toBeUndefined();
    for (const selectedItems of [{ one: "One" }, { other: 2 }, ["Other"], null]) {
      const invalid = { ...wlLocaleEn, selectedItems } as unknown as WlResolvedLocale;
      expect(normalizeWlLocale(undefined, invalid).selectedItems).toEqual(wlLocaleEn.selectedItems);
    }
    expect(normalizeWlLocale({ selectedItems: "Chosen: {count}" }, base).selectedItems).toBe("Chosen: {count}");
  });

  it("isolates implicit English and explicit Russian during parallel and repeated SSR", async () => {
    const Harness = defineComponent({
      setup() {
        const locale = useWlLocale();
        return () => h("p", `${locale.value.close}: ${locale.value.chooseFiles}`);
      }
    });
    const english = () => renderToString(createSSRApp(Harness));
    const russian = () => renderToString(createSSRApp(Harness).use(WlConfig, { locale: wlLocaleRu }));
    const expectedEnglish = `<p>${wlLocaleEn.close}: ${wlLocaleEn.chooseFiles}</p>`;
    const expectedRussian = `<p>${wlLocaleRu.close}: ${wlLocaleRu.chooseFiles}</p>`;
    expect(await Promise.all([english(), russian(), english()]))
      .toEqual([expectedEnglish, expectedRussian, expectedEnglish]);
    expect(await russian()).toBe(expectedRussian);
    expect(await english()).toBe(expectedEnglish);
  });
});

describe("localized built-in controls", () => {
  it("fills new control text when a consumer supplies a complete previous resolved base", () => {
    const base: WlResolvedLocale = {
      firstDayOfWeek: 0, dayNames: [...wlLocaleRu.dayNames], dayNamesShort: [...wlLocaleRu.dayNamesShort],
      dayNamesMin: [...wlLocaleRu.dayNamesMin], monthNames: [...wlLocaleRu.monthNames],
      monthNamesShort: [...wlLocaleRu.monthNamesShort], today: "Today", clear: "Clear", accept: "OK",
      reject: "Cancel", chooseDate: "Date", chooseMonth: "Month", chooseYear: "Year",
      prevMonth: "Previous month", nextMonth: "Next month", prevYear: "Previous year", nextYear: "Next year",
      prevDecade: "Previous decade", nextDecade: "Next decade", weekHeader: "Week"
    };
    const locale = normalizeWlLocale({ accept: "Proceed" }, base);
    expect(locale).toMatchObject({ firstDayOfWeek: 0, accept: "Proceed", chooseDate: "Date", close: "Close", dateFrom: "From", localeCode: "en-US" });
    expect(base).not.toHaveProperty("close");
    expect(locale.dayNames).not.toBe(base.dayNames);
  });

  it("uses English accessible controls while preserving explicit application text", async () => {
    const localeOptions = { locale: wlLocaleEn, motion: false };
    const password = mount(WlPasswordInput, { global: { plugins: [[WlConfig, localeOptions]] } });
    const files = mount(WlFilePicker, { global: { plugins: [[WlConfig, localeOptions]] } });
    try {
      expect(password.get("input").attributes("placeholder")).toBe("Password");
      expect(password.get("button").attributes("aria-label")).toBe("Show password");
      await password.get("button").trigger("click");
      expect(password.get("input").attributes("type")).toBe("text");
      expect(password.get("button").attributes("aria-label")).toBe("Hide password");
      expect(files.get("button").attributes("aria-label")).toBe("Choose files");
      await files.setProps({ chooseLabel: "Выбрать файлы" });
      expect(files.get("button").text()).toBe("Выбрать файлы");
      expect(files.get("button").attributes("aria-label")).toBe("Выбрать файлы");
      await files.setProps({ chooseLabel: undefined });
      expect(files.get("button").attributes("aria-label")).toBe("Choose files");
    } finally {
      password.unmount();
      files.unmount();
    }
  });

  it("resolves omitted and undefined text without installation while retaining an explicit empty string", async () => {
    const files = mount(WlFilePicker);
    const password = mount(WlPasswordInput);
    try {
      expect(files.props("chooseLabel")).toBeUndefined();
      expect(files.get("button").text()).toBe(wlLocaleEn.chooseFiles);
      expect(password.props("placeholder")).toBeUndefined();
      expect(password.get("input").attributes("placeholder")).toBe(wlLocaleEn.password);
      await files.setProps({ chooseLabel: "" });
      await password.setProps({ placeholder: "" });
      expect(files.get("button").text()).toBe("");
      expect(password.get("input").attributes("placeholder")).toBe("");
      await files.setProps({ chooseLabel: undefined });
      await password.setProps({ placeholder: undefined });
      expect(files.get("button").text()).toBe(wlLocaleEn.chooseFiles);
      expect(password.get("input").attributes("placeholder")).toBe(wlLocaleEn.password);
    } finally {
      files.unmount();
      password.unmount();
    }
  });

  it("keeps date labels and live hints aligned when explicit props equal the old defaults", async () => {
    const wrapper = mount(WlDatePicker<"range">, {
      attachTo: document.body,
      props: { selectionMode: "range", modelValue: null, showIcon: true, motion: false },
      global: { plugins: [[WlConfig, { locale: wlLocaleEn }]] }
    });
    const hint = () => document.querySelector(".wl-dp__range-hint")?.textContent;
    try {
      expect(wrapper.findAll("label").map((label) => label.text())).toEqual(["From", "To"]);
      await wrapper.get(".wl-dp__trigger").trigger("click");
      await flushPromises();
      expect(document.querySelector('[role="dialog"]')?.getAttribute("aria-label")).toBe("Choose date");
      expect(hint()).toBe("Choose a date: From.");
      await wrapper.setProps({ startLabel: "От" });
      expect(wrapper.findAll("label")[0]!.text()).toBe("От");
      expect(hint()).toBe("Choose a date: От.");
      await wrapper.setProps({ startLabel: undefined });
      expect(wrapper.findAll("label")[0]!.text()).toBe("From");
      expect(hint()).toBe("Choose a date: From.");
      await wrapper.setProps({ modelValue: ["2026-10-15", null], endLabel: "До" });
      expect(wrapper.findAll("label")[1]!.text()).toBe("До");
      expect(hint()).toBe("Choose a date: До.");
      await wrapper.setProps({ endLabel: undefined });
      expect(wrapper.findAll("label")[1]!.text()).toBe("To");
      expect(hint()).toBe("Choose a date: To.");
    } finally {
      wrapper.unmount();
    }
  });

  it("canonicalizes valid locale codes and falls back safely for invalid overrides and bases", () => {
    expect(normalizeWlLocale({ localeCode: "EN-us" }).localeCode).toBe("en-US");
    for (const localeCode of ["", "not_a_locale", undefined]) {
      expect(normalizeWlLocale({ localeCode }, wlLocaleEn).localeCode).toBe("en-US");
    }
    const invalid = { localeCode: 42 } as unknown as WlLocaleInput;
    expect(normalizeWlLocale(invalid).localeCode).toBe("en-US");
    expect(normalizeWlLocale(undefined, { ...wlLocaleEn, localeCode: "not_a_locale" }).localeCode).toBe("en-US");
  });

  it("substitutes named parameters once without interpreting markup or message syntax", () => {
    const label = '<img src=x onerror=alert(1)> @mail | {count} "quoted" & text';
    expect(formatWlLocaleText("Remove {label}; count={count}; {missing}", { label, count: 2 }))
      .toBe('Remove <img src=x onerror=alert(1)> @mail | {count} "quoted" & text; count=2; {missing}');
  });
});
