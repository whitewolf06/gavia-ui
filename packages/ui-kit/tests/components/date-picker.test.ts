import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import type { GlobalMountOptions } from "../mounting-types";
import { WlConfig } from "../../src";
import { createWlPt, WlDatePicker, wlLocaleRu } from "../../src";

const global: GlobalMountOptions = {
  plugins: [[WlConfig, { pt: createWlPt(), locale: wlLocaleRu }]]
};

const pad2 = (n: number): string => String(n).padStart(2, "0");
describe("WlDatePicker", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders the kit input inside the root", () => {
    const wrapper = mount(WlDatePicker, { global, attachTo: document.body });
    expect(wrapper.find('[data-wl="date-picker"]').exists()).toBe(true);

    const input = wrapper.find("input");
    expect(input.exists()).toBe(true);
    expect(input.classes()).toContain("wl-input");
    expect(input.classes()).toContain("wl-input--md");
    wrapper.unmount();
  });

  it("opens the Russian Mon-first panel on trigger click", async () => {
    const wrapper = mount(WlDatePicker, {
      global,
      attachTo: document.body,
      props: { showIcon: true }
    });

    await wrapper.find(".wl-dp__trigger").trigger("click");
    await flushPromises();

    const panel = document.querySelector(".wl-dp__panel");
    expect(panel).not.toBeNull();

    const weekdays = Array.from(document.querySelectorAll(".wl-dp__weekday")).map((el) =>
      el.textContent?.trim()
    );
    expect(weekdays).toEqual(["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]);

    const days = document.querySelectorAll(".wl-dp__day");
    expect(days.length).toBeGreaterThanOrEqual(28);
    wrapper.unmount();
  });

  it("emits the ISO date when a day is selected", async () => {
    const wrapper = mount(WlDatePicker, {
      global,
      attachTo: document.body,
      props: { showIcon: true }
    });

    await wrapper.find(".wl-dp__trigger").trigger("click");
    await flushPromises();

    const days = Array.from(document.querySelectorAll<HTMLElement>(".wl-dp__day"));
    const target = days.find(
      (el) => el.textContent?.trim() === "15" && !el.classList.contains("is-muted")
    );
    expect(target).toBeDefined();
    target!.click();
    await flushPromises();

    const now = new Date();
    const expected = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-15`;
    expect(wrapper.emitted("update:modelValue")![0]).toEqual([expected]);
    wrapper.unmount();
  });

  it("navigates years and months, respects bounds, and applies picker pt sections", async () => {
    const wrapper = mount(WlDatePicker, {
      global,
      attachTo: document.body,
      props: {
        showIcon: true,
        modelValue: "2026-06-15",
        minDate: "2026-05-10",
        maxDate: "2026-09-20",
        pt: { monthView: { "data-test": "month-view" }, dayCell: { "data-test": "day-cell" } }
      }
    });
    await wrapper.find(".wl-dp__trigger").trigger("click");
    await flushPromises();
    document.querySelector<HTMLButtonElement>('[aria-label^="Выбрать год"]')!.click();
    await flushPromises();

    const years = Array.from(document.querySelectorAll<HTMLButtonElement>(".wl-dp__choice"));
    expect(years.find((button) => button.textContent === "2025")?.disabled).toBe(true);
    years.find((button) => button.textContent === "2026")!.click();
    await flushPromises();

    expect(document.querySelector('[data-test="month-view"]')).not.toBeNull();
    const months = Array.from(document.querySelectorAll<HTMLButtonElement>(".wl-dp__choice"));
    expect(months.find((button) => button.textContent === "Апрель")?.disabled).toBe(true);
    months.find((button) => button.textContent === "Июль")!.click();
    await flushPromises();

    expect(document.querySelector('[data-test="day-cell"]')).not.toBeNull();
    document.querySelector<HTMLButtonElement>('[aria-label="2026-07-15"]')!.click();
    await flushPromises();
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["2026-07-15"]);
    wrapper.unmount();
  });

  it("disables the input and the trigger", () => {
    const wrapper = mount(WlDatePicker, {
      global,
      attachTo: document.body,
      props: { disabled: true, showIcon: true }
    });
    expect(wrapper.find("input").attributes("disabled")).toBeDefined();
    expect(wrapper.find(".wl-dp__trigger").attributes("disabled")).toBeDefined();
    wrapper.unmount();
  });

  it("applies the invalid class to the input", () => {
    const wrapper = mount(WlDatePicker, {
      global,
      attachTo: document.body,
      props: { invalid: true }
    });
    expect(wrapper.find("input").classes()).toContain("is-invalid");
    wrapper.unmount();
  });

  it("does not normalize impossible ISO dates into another day", () => {
    const wrapper = mount(WlDatePicker, {
      global,
      attachTo: document.body,
      props: { modelValue: "2026-02-31" }
    });
    expect((wrapper.find("input").element as HTMLInputElement).value).toBe("");
    wrapper.unmount();
  });
});
