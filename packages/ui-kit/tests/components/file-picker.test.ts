import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { h } from "vue";
import { WlFilePicker } from "../../src";

enableAutoUnmount(afterEach);
afterEach(() => {
  document.body.innerHTML = "";
});
describe("WlFilePicker", () => {
  function selected(input: HTMLInputElement, files: File[]): void {
    Object.defineProperty(input, "files", { configurable: true, value: files });
  }
  it("exposes a synchronous picker and keeps its input out of layout and tab order", async () => {
    const wrapper = mount(WlFilePicker, { props: { accept: "image/*", multiple: true, ariaLabel: "Добавить изображения" } });
    const input = wrapper.get("input").element;
    expect(input.hidden).toBe(true);
    expect(input.tabIndex).toBe(-1);
    expect(input.accept).toBe("image/*");
    expect(input.multiple).toBe(true);
    const click = vi.spyOn(input, "click").mockImplementation(() => {});
    (wrapper.vm as unknown as { choose(): void }).choose();
    expect(click).toHaveBeenCalledOnce();
    await wrapper.get("button").trigger("click");
    expect(click).toHaveBeenCalledTimes(2);
    expect(wrapper.get("button").attributes("aria-label")).toBe("Добавить изображения");
  });

  it("returns each raw batch without validation, accumulation or duplicate removal", async () => {
    const wrapper = mount(WlFilePicker, { props: { accept: "image/*", multiple: true } });
    const input = wrapper.get("input");
    const file = new File(["content"], "document.txt", { type: "text/plain" });
    selected(input.element, [file, file]);
    await input.trigger("change");
    selected(input.element, [file]);
    await input.trigger("change");
    expect(wrapper.emitted("select")).toEqual([[[file, file]], [[file]]]);
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    expect(wrapper.find("ul").exists()).toBe(false);
  });

  it("resets native selection for repeat picks and exposes clear without a select event", async () => {
    const wrapper = mount(WlFilePicker);
    const input = wrapper.get("input");
    const file = new File(["x"], "same.png", { type: "image/png" });
    let browserValue = "C:\\fakepath\\same.png";
    Object.defineProperty(input.element, "value", { configurable: true, get: () => browserValue, set: (value) => {
      browserValue = value;
    } });
    selected(input.element, [file]);
    await input.trigger("change");
    expect(browserValue).toBe("");
    browserValue = "C:\\fakepath\\same.png";
    (wrapper.vm as unknown as { clear(): void }).clear();
    expect(browserValue).toBe("");
    expect(wrapper.emitted("select")).toHaveLength(1);
  });

  it("does not create a selection when the native picker is cancelled or empty", async () => {
    const wrapper = mount(WlFilePicker);
    const input = wrapper.get("input");
    selected(input.element, []);
    await input.trigger("change");
    await input.trigger("cancel");
    expect(wrapper.emitted("select")).toBeUndefined();
    expect(wrapper.emitted("cancel")).toEqual([[]]);
  });

  it("blocks both public choose and synthetic change while disabled", async () => {
    const wrapper = mount(WlFilePicker, { props: { disabled: true } });
    const input = wrapper.get("input");
    const click = vi.spyOn(input.element, "click").mockImplementation(() => {});
    (wrapper.vm as unknown as { choose(): void }).choose();
    expect(click).not.toHaveBeenCalled();
    selected(input.element, [new File(["x"], "file.txt")]);
    await input.trigger("change");
    expect(wrapper.emitted("select")).toBeUndefined();
    expect(wrapper.get("button").attributes("disabled")).toBeDefined();
  });

  it("offers a custom trigger without adding another visible default button", async () => {
    const wrapper = mount(WlFilePicker, { slots: { trigger: ({ choose, disabled }) => h("button", { disabled, onClick: choose }, "Свой выбор") } });
    expect(wrapper.findAll("button")).toHaveLength(1);
    const click = vi.spyOn(wrapper.get("input").element, "click").mockImplementation(() => {});
    await wrapper.get("button").trigger("click");
    expect(click).toHaveBeenCalledOnce();
  });

  it("routes label ids and focus/aria to the visible trigger, capture/name to the native picker", async () => {
    const focus = vi.fn();
    const wrapper = mount(WlFilePicker, { attrs: { id: "attachment-picker", "aria-describedby": "attachment-hint", name: "attachment", capture: "environment", onFocus: focus } });
    const button = wrapper.get("button");
    expect(button.attributes()).toMatchObject({ id: "attachment-picker", "aria-describedby": "attachment-hint" });
    expect(wrapper.get("input").attributes()).toMatchObject({ name: "attachment", capture: "environment" });
    expect(wrapper.get("input").attributes("id")).toBeUndefined();
    await button.trigger("focus");
    expect(focus).toHaveBeenCalledOnce();
  });
});
