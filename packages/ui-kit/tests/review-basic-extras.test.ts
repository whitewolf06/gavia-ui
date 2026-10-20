import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { h } from "vue";
import { WlBreadcrumbs, WlChip, WlNavItem, WlRadio, WlSegmented, WlSkeleton, WlTag } from "../src";
import WlCheckbox from "../src/components/WlCheckbox.vue";

describe("remaining component depth recommendations", () => {
  it("adds and removes checkbox array values without mutating the caller and guards disabled edits", async () => {
    const value = [1];
    const wrapper = mount(WlCheckbox, { props: { modelValue: value, value: 2, size: "sm" } });
    try {
      expect(wrapper.attributes("data-size")).toBe("sm");
      await wrapper.get("input").setValue(true);
      expect(wrapper.emitted("update:modelValue")).toEqual([[[1, 2]]]);
      expect(value).toEqual([1]);
      await wrapper.setProps({ modelValue: [1, 2] });
      await wrapper.get("input").setValue(false);
      expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([[1]]);
      await wrapper.setProps({ disabled: true });
      await wrapper.get("input").trigger("change");
      expect(wrapper.emitted("update:modelValue")).toHaveLength(2);
    } finally { wrapper.unmount(); }
  });
  it("sizes radios and moves segmented focus and selection across enabled items", async () => {
    const radio = mount(WlRadio, { props: { value: "a", size: "sm" } });
    expect(radio.attributes("data-size")).toBe("sm");
    radio.unmount();
    const segmented = mount(WlSegmented, { attachTo: document.body, props: { options: [{ value: "a", label: "A" }, { value: "b", label: "B", disabled: true }, { value: "c", label: "C" }], modelValue: "a", size: "sm", block: true } });
    try {
      const buttons = segmented.findAll("button");
      expect(buttons.map((button) => button.attributes("tabindex"))).toEqual(["0", "-1", "-1"]);
      await buttons[0]!.trigger("keydown", { key: "ArrowRight" });
      expect(document.activeElement).toBe(buttons[2]!.element);
      expect(segmented.emitted("update:modelValue")).toEqual([["c"]]);
      expect(segmented.attributes("data-block")).toBe("true");
    } finally { segmented.unmount(); }
  });
  it("keeps chip selection and removal as separate native buttons", async () => {
    const wrapper = mount(WlChip, { props: { active: false, removable: true, removeLabel: "Remove Vue", size: "sm", pt: { removeButton: { "data-remove": "yes" } } }, slots: { default: "Vue" } });
    try {
      expect(wrapper.element.tagName).toBe("SPAN");
      expect(wrapper.findAll("button")).toHaveLength(2);
      await wrapper.get("button").trigger("click");
      expect(wrapper.emitted("update:active")).toEqual([[true]]);
      await wrapper.get('[data-remove="yes"]').trigger("click");
      expect(wrapper.emitted("remove")).toHaveLength(1);
      expect(wrapper.emitted("update:active")).toHaveLength(1);
    } finally { wrapper.unmount(); }
  });
  it("separates tag palette and tone, exposes its icon, and keeps disabled removal inert", async () => {
    const wrapper = mount(WlTag, { props: { color: "blue", tone: "success", size: "sm", icon: "check", removable: true, disabled: true } });
    expect(wrapper.attributes("data-color")).toBe("blue");
    expect(wrapper.attributes("data-tone")).toBe("success");
    expect(wrapper.find(".wl-tag__icon").exists()).toBe(true);
    await wrapper.get("button").trigger("click");
    expect(wrapper.emitted("remove")).toBeUndefined();
    wrapper.unmount();
  });
  it("renders avatar and multiline text skeleton presets with explicit dimensions taking precedence", () => {
    const avatar = mount(WlSkeleton, { props: { preset: "avatar" } });
    expect(avatar.attributes("style")).toContain("width: 40px");
    expect(avatar.attributes("style")).toContain("border-radius: 50%");
    avatar.unmount();
    const text = mount(WlSkeleton, { props: { preset: "text", lines: 3, width: "240px" } });
    expect(text.findAll(".wl-skeleton__line")).toHaveLength(3);
    expect(text.attributes("style")).toContain("width: 240px");
    expect(text.attributes("aria-hidden")).toBe("true");
    text.unmount();
  });
  it("renders navigation icon and badge slots inside the existing navigation action", () => {
    const wrapper = mount(WlNavItem, { props: { label: "Inbox", badge: 3 }, slots: { icon: () => h("span", { "data-custom-icon": "yes" }, "★"), badge: ({ badge }) => h("span", `Count ${badge}`) } });
    expect(wrapper.get("[data-custom-icon]").text()).toBe("★");
    expect(wrapper.text()).toContain("Count 3");
    expect(wrapper.element.tagName).toBe("BUTTON");
    wrapper.unmount();
  });
  it("collapses long breadcrumb chains and moves focus to revealed content", async () => {
    const wrapper = mount(WlBreadcrumbs, { attachTo: document.body, props: { items: ["Home", "Workspace", "Project", "Folder", "Document"].map((label) => ({ label, href: `#${label}` })), maxItems: 3, collapseLabel: "Show all", separator: "→" }, slots: { item: ({ item }) => item.label.toUpperCase() } });
    try {
      expect(wrapper.findAll("li")).toHaveLength(3);
      await wrapper.get("button").trigger("click");
      expect(wrapper.findAll("li")).toHaveLength(5);
      expect(wrapper.get('[aria-current="page"]').text()).toBe("DOCUMENT");
      expect((document.activeElement as HTMLElement).textContent).toBe("WORKSPACE");
      expect(wrapper.findAll(".wl-breadcrumbs__sep").map((item) => item.text())).toEqual(["→", "→", "→", "→"]);
    } finally { wrapper.unmount(); }
  });
});
