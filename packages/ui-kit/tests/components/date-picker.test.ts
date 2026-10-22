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

  it("navigates month, year and twelve-year views before choosing a leap day", async () => {
    const wrapper = mount(WlDatePicker, {
      attachTo: document.body,
      props: { modelValue: "2026-07-15", showIcon: true, motion: false }
    });
    const clickPanel = async (selector: string): Promise<void> => {
      const button = document.querySelector<HTMLButtonElement>(selector);
      expect(button, selector).not.toBeNull();
      button!.click();
      await flushPromises();
    };
    try {
      await wrapper.get(".wl-dp__trigger").trigger("click");
      await clickPanel('[aria-label="Next month"]');
      expect(document.querySelector('[role="grid"]')?.getAttribute("aria-label")).toBe("August 2026");
      await clickPanel('[aria-label="Previous month"]');
      expect(document.querySelector('[role="grid"]')?.getAttribute("aria-label")).toBe("July 2026");
      await clickPanel('[aria-label="Choose month, current month July"]');
      await clickPanel('[aria-label="Next month"]');
      expect(document.querySelector(".wl-dp__choices")?.getAttribute("aria-label")).toBe("Months of 2027");
      await clickPanel('[aria-label="Previous month"]');
      await clickPanel('[aria-label="Choose year, current year 2026"]');
      expect(document.querySelector(".wl-dp__title")?.textContent).toContain("2016–2027");
      await clickPanel('[aria-label="Next month"]');
      expect(document.querySelector(".wl-dp__title")?.textContent).toContain("2028–2039");
      await clickPanel('[aria-label="Previous month"]');
      const year = Array.from(document.querySelectorAll<HTMLButtonElement>(".wl-dp__choice"))
        .find((button) => button.textContent === "2025");
      expect(year).toBeDefined();
      year!.click();
      await flushPromises();
      await clickPanel('[aria-label="Previous month"]');
      expect(document.querySelector(".wl-dp__choices")?.getAttribute("aria-label")).toBe("Months of 2024");
      const february = Array.from(document.querySelectorAll<HTMLButtonElement>(".wl-dp__choice"))
        .find((button) => button.textContent === "February");
      expect(february).toBeDefined();
      february!.click();
      await flushPromises();
      await clickPanel('[data-date="2024-02-29"]');
      expect(wrapper.emitted("update:modelValue")).toEqual([["2024-02-29"]]);
      expect(wrapper.get("input").element.value).toBe("29.02.2024");
      expect(document.querySelector(".wl-dp__panel")).toBeNull();
    } finally {
      wrapper.unmount();
    }
  });

  it("preserves valid days while paging months and years with the keyboard", async () => {
    const wrapper = mount(WlDatePicker, {
      attachTo: document.body,
      props: { modelValue: "2027-01-31", motion: false }
    });
    const move = async (key: string, expected: string, shiftKey = false): Promise<void> => {
      document.activeElement!.dispatchEvent(new KeyboardEvent("keydown", { key, shiftKey, bubbles: true, cancelable: true }));
      await flushPromises();
      expect(document.activeElement?.getAttribute("data-date")).toBe(expected);
      expect(document.querySelectorAll('.wl-dp__day[tabindex="0"]')).toHaveLength(1);
    };
    try {
      await wrapper.get("input").trigger("keydown", { key: "ArrowDown" });
      await flushPromises();
      expect(document.activeElement?.getAttribute("data-date")).toBe("2027-01-31");
      await move("PageDown", "2027-02-28");
      await move("PageUp", "2027-01-28");
      await move("PageDown", "2028-01-28", true);
      await move("PageUp", "2027-01-28", true);
      await move("End", "2027-01-31");
      await move("ArrowLeft", "2027-01-30");
      await move("ArrowDown", "2027-02-06");
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    } finally {
      wrapper.unmount();
    }
  });

  it("opens on the closest allowed date and keeps a fully unavailable month unselectable", async () => {
    const wrapper = mount(WlDatePicker, {
      attachTo: document.body,
      props: { modelValue: "2026-07-15", minDate: "2026-08-10", maxDate: "2026-08-20", motion: false }
    });
    try {
      await wrapper.get("input").trigger("keydown", { key: "ArrowDown" });
      await flushPromises();
      expect(document.activeElement?.getAttribute("data-date")).toBe("2026-08-10");
      await wrapper.setProps({ modelValue: "2026-09-15" });
      await wrapper.get("input").trigger("keydown", { key: "ArrowDown" });
      await flushPromises();
      expect(document.activeElement?.getAttribute("data-date")).toBe("2026-08-20");
      await wrapper.setProps({ disabledDates: (iso) => iso === "2026-08-20" });
      await wrapper.get("input").trigger("keydown", { key: "ArrowDown" });
      await flushPromises();
      expect(document.activeElement?.getAttribute("data-date")).toBe("2026-08-10");
      await wrapper.setProps({ disabledDates: () => true });
      wrapper.get("input").element.focus();
      await wrapper.get("input").trigger("keydown", { key: "ArrowDown" });
      await flushPromises();
      expect(document.querySelector(".wl-dp__panel")).not.toBeNull();
      expect(document.querySelectorAll(".wl-dp__day:not([disabled])")).toHaveLength(0);
      expect(document.querySelectorAll('.wl-dp__day[tabindex="0"]')).toHaveLength(0);
      expect(document.activeElement).toBe(wrapper.get("input").element);
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    } finally {
      wrapper.unmount();
    }
  });

  it("discards an unfinished manual edit on a delayed blur after the field becomes disabled", async () => {
    const wrapper = mount(WlDatePicker, { props: { modelValue: "2026-07-15" } });
    try {
      const input = wrapper.get("input");
      await input.setValue("20.07.2026");
      await wrapper.setProps({ disabled: true });
      // A pending native blur can arrive after disabling; VTU.trigger skips
      // every event on disabled controls, including this focus-loss event.
      input.element.dispatchEvent(new FocusEvent("blur"));
      await flushPromises();
      expect(input.element.value).toBe("15.07.2026");
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
      await wrapper.setProps({ disabled: false });
      await input.setValue("20.07.2026");
      await input.trigger("blur");
      expect(wrapper.emitted("update:modelValue")).toEqual([["2026-07-20"]]);
    } finally {
      wrapper.unmount();
    }
  });

  it("keeps range endpoint names distinct and sorts an edited start past its existing end", async () => {
    const wrapper = mount(WlDatePicker<"range">, {
      attachTo: document.body,
      attrs: { "aria-label": "Travel dates" },
      props: {
        selectionMode: "range", modelValue: ["2026-07-10", "2026-07-20"],
        startLabel: "Departure", endLabel: "Return", motion: false
      }
    });
    try {
      const [start, end] = wrapper.findAll("input");
      expect(start!.attributes("aria-label")).toBe("Travel dates, Departure");
      expect(end!.attributes("aria-label")).toBe("Travel dates, Return");
      await start!.setValue("25.07.2026");
      await start!.trigger("blur");
      expect(wrapper.emitted("update:modelValue")).toEqual([[["2026-07-20", "2026-07-25"]]]);
      expect(start!.element.value).toBe("20.07.2026");
      expect(end!.element.value).toBe("25.07.2026");
      await end!.trigger("keydown", { key: "ArrowDown" });
      await flushPromises();
      expect(document.activeElement?.getAttribute("data-date")).toBe("2026-07-25");
      expect(document.querySelector(".wl-dp__range-hint")?.textContent).toContain("Departure: 20.07.2026; Return: 25.07.2026");
      await end!.trigger("keydown", { key: "Escape" });
      await flushPromises();
      expect(document.querySelector(".wl-dp__panel")).toBeNull();
    } finally {
      wrapper.unmount();
    }
  });
});
