import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { h } from "vue";
import type { GlobalMountOptions } from "../mounting-types";
import { WlConfig } from "../../src";
import { createWlPt, WlFileUpload, wlLocaleRu } from "../../src";

const global: GlobalMountOptions = {
  plugins: [[WlConfig, { pt: createWlPt(), locale: wlLocaleRu }]]
};

function makeFile(name: string, size: number, type = "application/pdf"): File {
  return new File(["x".repeat(size)], name, { type });
}
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

  it("preserves binary boundaries, rounding and the released megabyte cap", () => {
    const sizes = [0, 1023, 1024, 1536, 100.25 * 1024, 1572864, 1024 ** 3];
    const files = sizes.map((size, index) => {
      const file = new File(["x"], `size-${index}.txt`, { type: "text/plain" });
      Object.defineProperty(file, "size", { value: size });
      return file;
    });
    const wrapper = mount(WlFileUpload, { global, props: { modelValue: files } });
    expect(wrapper.findAll(".wl-upload__size").map((row) => row.text()))
      .toEqual(["0 Б", "1023 Б", "1 КБ", "1,5 КБ", "100 КБ", "1,5 МБ", "1024 МБ"]);
    wrapper.unmount();
  });

  it("keeps explicit 0.x locale labels and decimal overrides in rows and size-limit errors", async () => {
    const customGlobal: GlobalMountOptions = {
      plugins: [[WlConfig, { locale: {
        localeCode: "en-US", fileByteUnit: "octets", fileKilobyteUnit: "Ko", fileMegabyteUnit: "Mo", decimalSeparator: ","
      } }]]
    };
    const wrapper = mount(WlFileUpload, {
      global: customGlobal, props: { modelValue: [makeFile("small.txt", 1536)], maxSize: 1536 }
    });
    expect(wrapper.find(".wl-upload__size").text()).toBe("1,5 Ko");
    await setInputFiles(wrapper, [makeFile("too-large.txt", 2048)]);
    expect(wrapper.find(".wl-upload__error").text()).toContain("1,5 Ko");
    expect(wrapper.emitted("reject")![0]![0]).toMatchObject({ reason: "size" });
    wrapper.unmount();
  });

  it.each([0.5, 100.25])("keeps the released raw fractional byte limit %s despite a decimal override", async (limit) => {
    const wrapper = mount(WlFileUpload, {
      global: { plugins: [[WlConfig, { locale: {
        localeCode: "en-US", fileByteUnit: "octets", decimalSeparator: ","
      } }]] },
      props: { maxSize: limit }
    });
    await setInputFiles(wrapper, [makeFile("too-large.txt", Math.ceil(limit))]);
    expect(wrapper.find(".wl-upload__error").text()).toContain(`${limit} octets`);
    expect(wrapper.find(".wl-upload__error").text()).not.toContain(`${String(limit).replace(".", ",")} octets`);
    expect(wrapper.emitted("reject")![0]![0]).toMatchObject({ reason: "size" });
    wrapper.unmount();
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
    expect(drop.attributes("tabindex")).toBe("0");
    expect(drop.find("button").exists()).toBe(false);
    await drop.trigger("keydown", { key: "Enter" });
    expect(click).toHaveBeenCalledOnce();
    await drop.trigger("keydown", { key: " " });
    expect(click).toHaveBeenCalledTimes(2);

    await wrapper.setProps({ disabled: true });
    expect(drop.attributes("tabindex")).toBe("-1");
    await drop.trigger("keydown", { key: "Enter" });
    await drop.trigger("keydown", { key: " " });
    await drop.trigger("click");
    expect(click).toHaveBeenCalledTimes(2);
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

  it("accepts case-insensitive extensions and exact MIME types and treats an empty filter as unrestricted", async () => {
    const wrapper = mount(WlFileUpload, { global, props: { accept: " .PDF, audio/mpeg , " } });
    const pdf = makeFile("REPORT.PDF", 10, "application/octet-stream");
    const audio = makeFile("recording.mp3", 20, "audio/mpeg");
    const rejected = makeFile("photo.png", 30, "image/png");
    try {
      await setInputFiles(wrapper, [pdf, audio, rejected]);
      expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([[pdf, audio]]);
      expect(wrapper.emitted("reject")).toEqual([[{ file: rejected, reason: "type" }]]);
      expect(wrapper.findAll(".wl-upload__file-icon").map((icon) => icon.attributes("data-icon"))).toEqual(["file", "music"]);
      await wrapper.setProps({ accept: " , , " });
      await setInputFiles(wrapper, [rejected]);
      expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([[pdf, audio, rejected]]);
      expect(wrapper.find(".wl-upload__errors").exists()).toBe(false);
    } finally {
      wrapper.unmount();
    }
  });

  it("keeps nested drag feedback until the final leave and ignores drops while disabled", async () => {
    const wrapper = mount(WlFileUpload, { global });
    try {
      const drop = wrapper.get(".wl-upload__drop");
      await drop.trigger("dragenter");
      await drop.trigger("dragenter");
      const over = new Event("dragover", { bubbles: true, cancelable: true });
      drop.element.dispatchEvent(over);
      expect(over.defaultPrevented).toBe(true);
      await drop.trigger("dragleave");
      expect(drop.classes()).toContain("is-dragover");
      await drop.trigger("dragleave");
      expect(drop.classes()).not.toContain("is-dragover");
      await wrapper.setProps({ disabled: true });
      await drop.trigger("dragenter");
      expect(drop.classes()).not.toContain("is-dragover");
      await drop.trigger("drop", { dataTransfer: { files: [makeFile("ignored.pdf", 10)] } });
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
      await wrapper.setProps({ disabled: false });
      await drop.trigger("drop");
      await drop.trigger("drop", { dataTransfer: { files: [] } });
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    } finally {
      wrapper.unmount();
    }
  });

  it("guards the row-slot remove action when disabled and exposes upload state to the owner", async () => {
    const file = makeFile("report.pdf", 2048);
    const wrapper = mount(WlFileUpload, {
      global,
      props: { modelValue: [file], disabled: true, fileState: () => ({ progress: 42, status: "uploading", message: "Sending" }) },
      slots: { row: ({ file: selected, size, state, remove }) => h("button", { type: "button", onClick: remove }, `${selected.name}: ${size}: ${state?.message}`) }
    });
    try {
      expect(wrapper.get(".wl-upload__row").text()).toBe("report.pdf: 2 КБ: Sending");
      await wrapper.get(".wl-upload__row button").trigger("click");
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
      await wrapper.setProps({ disabled: false });
      await wrapper.get(".wl-upload__row button").trigger("click");
      expect(wrapper.emitted("update:modelValue")).toEqual([[[]]]);
      expect(wrapper.find(".wl-upload__list").exists()).toBe(false);
    } finally {
      wrapper.unmount();
    }
  });

  it("renders upload messages and clamps finite progress while omitting unknown progress", async () => {
    const first = makeFile("sending.pdf", 10);
    const second = makeFile("retry.pdf", 20);
    const wrapper = mount(WlFileUpload, {
      global,
      props: {
        modelValue: [first, second],
        fileState: (file) => file === first
          ? { status: "uploading", progress: -1, message: "Starting upload" }
          : { status: "error", progress: NaN, message: "Retry required" }
      }
    });
    try {
      const rows = wrapper.findAll(".wl-upload__row");
      expect(rows[0]!.attributes("data-status")).toBe("uploading");
      expect(rows[0]!.get("progress").attributes("value")).toBe("0");
      expect(rows[0]!.get(".wl-upload__message").text()).toBe("Starting upload");
      expect(rows[1]!.attributes("data-status")).toBe("error");
      expect(rows[1]!.find("progress").exists()).toBe(false);
      expect(rows[1]!.get(".wl-upload__message").text()).toBe("Retry required");
    } finally {
      wrapper.unmount();
    }
  });
});
