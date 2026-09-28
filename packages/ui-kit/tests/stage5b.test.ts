import { describe, it, expect, afterEach, vi } from "vitest";
import { mount, flushPromises, type GlobalMountOptions } from "@vue/test-utils";
import { WlConfig } from "../src";
import { WlDatePicker, WlFileUpload, createWlPt, wlLocaleRu } from "../src";

const global: GlobalMountOptions = {
  plugins: [[WlConfig, { pt: createWlPt(), locale: wlLocaleRu }]]
};

const pad2 = (n: number): string => String(n).padStart(2, "0");

function makeFile(name: string, size: number, type = "application/pdf"): File {
  return new File(["x".repeat(size)], name, { type });
}

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

describe("WlFileUpload", () => {
  function setInputFiles(wrapper: ReturnType<typeof mount>, files: File[]) {
    const input = wrapper.find('input[type="file"]');
    Object.defineProperty(input.element, "files", { value: files, configurable: true });
    return input.trigger("change");
  }

  it("adds files via input change and renders rows with human sizes", async () => {
    const wrapper = mount(WlFileUpload, { global });
    await setInputFiles(wrapper, [
      makeFile("отчёт.pdf", 2048),
      makeFile("фото.png", 512, "image/png")
    ]);

    const emitted = wrapper.emitted("update:modelValue")!;
    expect(emitted[0]![0]).toHaveLength(2);

    const rows = wrapper.findAll(".wl-upload__row");
    expect(rows).toHaveLength(2);
    expect(rows[0]!.text()).toContain("отчёт.pdf");
    expect(rows[0]!.find(".wl-upload__size").text()).toBe("2 КБ");
    expect(wrapper.find('[data-wl="file-upload"]').exists()).toBe(true);
  });

  it("toggles the dragover class on dragenter / dragleave", async () => {
    const wrapper = mount(WlFileUpload, { global });
    const drop = wrapper.find(".wl-upload__drop");

    await drop.trigger("dragenter");
    expect(drop.classes()).toContain("is-dragover");

    await drop.trigger("dragleave");
    expect(drop.classes()).not.toContain("is-dragover");
  });

  it("appends dropped files and skips name+size duplicates", async () => {
    const wrapper = mount(WlFileUpload, { global });
    const drop = wrapper.find(".wl-upload__drop");
    const file = makeFile("макет.fig", 300);

    await drop.trigger("drop", { dataTransfer: { files: [file] } });
    expect(wrapper.findAll(".wl-upload__row")).toHaveLength(1);

    // same name + size — skipped silently
    await drop.trigger("drop", { dataTransfer: { files: [makeFile("макет.fig", 300)] } });
    expect(wrapper.findAll(".wl-upload__row")).toHaveLength(1);
    const emitted = wrapper.emitted("update:modelValue")!;
    expect(emitted[emitted.length - 1]![0]).toHaveLength(1);
  });

  it("rejects oversize files with a reject event and an inline error", async () => {
    const wrapper = mount(WlFileUpload, { global, props: { maxSize: 1024 } });
    await wrapper
      .find(".wl-upload__drop")
      .trigger("drop", { dataTransfer: { files: [makeFile("большой.zip", 2048)] } });

    const rejects = wrapper.emitted("reject")!;
    expect(rejects).toHaveLength(1);
    expect(rejects[0]![0]).toMatchObject({ reason: "size" });
    expect((rejects[0]![0] as { file: File }).file.name).toBe("большой.zip");

    expect(wrapper.findAll(".wl-upload__row")).toHaveLength(0);
    expect(wrapper.find(".wl-upload__error").text()).toContain("большой.zip");
    expect(wrapper.find(".wl-upload__error").text()).toContain("1 КБ");
  });

  it("rejects wrong types when accept is set", async () => {
    const wrapper = mount(WlFileUpload, { global, props: { accept: "image/*" } });
    await setInputFiles(wrapper, [makeFile("документ.pdf", 100)]);

    expect(wrapper.emitted("reject")![0]![0]).toMatchObject({ reason: "type" });
    expect(wrapper.findAll(".wl-upload__row")).toHaveLength(0);
  });

  it("enforces maxFiles with a count rejection", async () => {
    const wrapper = mount(WlFileUpload, { global, props: { maxFiles: 1 } });
    await setInputFiles(wrapper, [makeFile("a.txt", 10), makeFile("b.txt", 10)]);

    expect(wrapper.findAll(".wl-upload__row")).toHaveLength(1);
    expect(wrapper.emitted("reject")![0]![0]).toMatchObject({ reason: "count" });
  });

  it("removes a file via the row button", async () => {
    const wrapper = mount(WlFileUpload, { global });
    await setInputFiles(wrapper, [makeFile("a.txt", 10), makeFile("b.txt", 20)]);
    expect(wrapper.findAll(".wl-upload__row")).toHaveLength(2);

    await wrapper.findAll(".wl-upload__remove")[0]!.trigger("click");
    const rows = wrapper.findAll(".wl-upload__row");
    expect(rows).toHaveLength(1);
    expect(rows[0]!.text()).toContain("b.txt");

    const emitted = wrapper.emitted("update:modelValue")!;
    const last = emitted[emitted.length - 1]![0] as File[];
    expect(last).toHaveLength(1);
    expect(last[0]!.name).toBe("b.txt");
  });

  it("uses one accessible dropzone without nested interactive controls", async () => {
    const wrapper = mount(WlFileUpload, { global });
    const drop = wrapper.find(".wl-upload__drop");
    const input = wrapper.find('input[type="file"]');
    const click = vi.spyOn(input.element as HTMLInputElement, "click");

    expect(drop.attributes("role")).toBe("button");
    expect(drop.attributes("aria-label")).toBeTruthy();
    expect(drop.find("button").exists()).toBe(false);
    await drop.trigger("keydown", { key: "Enter" });
    expect(click).toHaveBeenCalledOnce();

    await wrapper.setProps({ disabled: true });
    expect(drop.attributes("tabindex")).toBe("-1");
  });

  it("does not remove an existing file while disabled", async () => {
    const file = makeFile("locked.txt", 10);
    const wrapper = mount(WlFileUpload, {
      global,
      props: { modelValue: [file], disabled: true }
    });
    const remove = wrapper.find(".wl-upload__remove");
    expect(remove.attributes("disabled")).toBeDefined();
    await remove.trigger("click");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    expect(wrapper.findAll(".wl-upload__row")).toHaveLength(1);
  });
});
