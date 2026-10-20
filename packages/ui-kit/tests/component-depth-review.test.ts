import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { h, nextTick } from "vue";
import WlAccordion from "../src/components/WlAccordion.vue";
import WlCard from "../src/components/WlCard.vue";
import WlField from "../src/components/WlField.vue";
import WlFileUpload from "../src/components/WlFileUpload.vue";
import WlSteps from "../src/components/WlSteps.vue";

describe("component depth beyond the released baseline", () => {
  it("offers label slots, optional text and horizontal fields without losing the label ID", () => {
    const wrapper = mount(WlField, { props: { optional: true, orientation: "horizontal" }, slots: {
      label: () => "Name",
      default: ({ labelId }) => h("input", { "aria-labelledby": labelId })
    } });
    expect(wrapper.get("label").text()).toBe("Nameнеобязательно");
    expect(wrapper.get("input").attributes("aria-labelledby")).toBe(wrapper.get("label").attributes("id"));
    expect(wrapper.attributes("data-orientation")).toBe("horizontal");
    wrapper.unmount();
  });

  it("captures uncontrolled Accordion defaults once and keeps controlled updates with the owner", async () => {
    const items = [{ key: "one", title: "One" }, { key: "two", title: "Two" }];
    const wrapper = mount(WlAccordion, { props: { items, defaultOpenKeys: ["one"], single: true }, slots: { header: ({ item, open }) => `${item.title} ${open}` } });
    expect(wrapper.findAll("details")[0]!.attributes("open")).toBeDefined();
    await wrapper.setProps({ defaultOpenKeys: ["two"] });
    expect(wrapper.findAll("details")[0]!.attributes("open")).toBeDefined();
    await wrapper.findAll("summary")[1]!.trigger("click");
    expect(wrapper.findAll("details")[1]!.attributes("open")).toBeDefined();
    await wrapper.setProps({ openKeys: ["one"] });
    await wrapper.findAll("summary")[1]!.trigger("click");
    expect(wrapper.findAll("details")[0]!.attributes("open")).toBeDefined();
    expect(wrapper.emitted("update:openKeys")?.at(-1)).toEqual([["two"]]);
    wrapper.unmount();
  });

  it("keeps Steps ordered, skips disabled controls and exposes error/description", async () => {
    const wrapper = mount(WlSteps, { attachTo: document.body, props: { clickable: true, orientation: "vertical", items: [
      { key: "one", label: "One", description: "First" }, { key: "two", label: "Two", disabled: true }, { key: "three", label: "Three", error: true }
    ] } });
    const buttons = wrapper.findAll("button");
    buttons[0]!.element.focus();
    await buttons[0]!.trigger("keydown", { key: "ArrowDown" });
    await nextTick();
    expect(document.activeElement).toBe(buttons[2]!.element);
    expect(wrapper.get("li").attributes("aria-current")).toBe("step");
    expect(wrapper.text()).toContain("Ошибка шага");
    expect(wrapper.text()).toContain("First");
    await buttons[2]!.trigger("click");
    expect(wrapper.emitted("update:current")).toEqual([[2]]);
    wrapper.unmount();
  });

  it("renders semantic cards and native linked cards", () => {
    const article = mount(WlCard, { props: { as: "article", padding: "none", variant: "elevated" }, slots: { default: "Content" } });
    expect(article.element.tagName).toBe("ARTICLE");
    expect(article.attributes("data-padding")).toBe("none");
    const linked = mount(WlCard, { props: { href: "/project" }, slots: { default: "Project" } });
    expect(linked.element.tagName).toBe("A");
    expect(linked.attributes("href")).toBe("/project");
    article.unmount();
    linked.unmount();
  });

  it("keeps file previews scoped to mounted files and revokes every object URL", async () => {
    const create = vi.fn((file: File) => `blob:${file.name}`);
    const revoke = vi.fn();
    vi.stubGlobal("URL", class extends URL { static override createObjectURL = create; static override revokeObjectURL = revoke; });
    const first = new File(["a"], "first.png", { type: "image/png" });
    const second = new File(["b"], "second.png", { type: "image/png" });
    const wrapper = mount(WlFileUpload, { props: { preview: true, modelValue: [first, second], fileState: () => ({ progress: 150, status: "uploading" }) } });
    await nextTick();
    expect(create).toHaveBeenCalledTimes(2);
    expect(wrapper.findAll("img")).toHaveLength(2);
    expect(wrapper.get("progress").attributes("value")).toBe("100");
    await wrapper.setProps({ modelValue: [second] });
    expect(revoke).toHaveBeenCalledWith("blob:first.png");
    expect(create).toHaveBeenCalledTimes(2);
    wrapper.unmount();
    expect(revoke).toHaveBeenCalledWith("blob:second.png");
    vi.unstubAllGlobals();
  });
});
