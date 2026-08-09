import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { WlNavItem, WlSidebar } from "../src";
import type { WlSidebarGroup, WlSidebarItem } from "../src";

const groups: WlSidebarGroup[] = [
  {
    id: "main",
    items: [
      { key: "today", label: "Сегодня", icon: "home" },
      { key: "tasks", label: "Задачи", icon: "task", badge: 5 }
    ]
  },
  {
    id: "tools",
    label: "Инструменты",
    separator: true,
    items: [{ key: "assistant", label: "Ассистент", icon: "sparkle" }]
  }
];

const footerItems: WlSidebarItem[] = [
  { key: "help", label: "Помощь", icon: "help" },
  { key: "settings", label: "Настройки", icon: "settings" }
];

describe("WlSidebar", () => {
  it("composes navigation from WlNavItem primitives", () => {
    const wrapper = mount(WlSidebar, {
      props: { groups, footerItems, brand: "WhiteLife", brandMark: "W" }
    });

    expect(wrapper.findAllComponents(WlNavItem)).toHaveLength(6);
    expect(wrapper.find('[data-wl="sidebar"]').attributes("data-expanded")).toBe("false");
    expect(wrapper.find(".wl-sidebar__brand-mark").text()).toBe("W");
    expect(wrapper.find(".wl-sidebar__group-label").text()).toBe("Инструменты");
    expect(wrapper.find(".wl-sidebar__group-label").attributes("style")).toContain("display: none");
    expect(wrapper.findAllComponents(WlNavItem)[0]!.attributes("aria-label")).toBe("Сегодня");
  });

  it("expands on hover and keeps active state controlled by v-model", async () => {
    const wrapper = mount(WlSidebar, {
      props: { groups, modelValue: "today", brand: "WhiteLife" }
    });
    const root = wrapper.find('[data-wl="sidebar"]');

    await root.trigger("mouseenter");
    expect(root.attributes("data-expanded")).toBe("true");
    expect(wrapper.find(".wl-sidebar__brand-name").attributes("style")).toBe("");

    await wrapper.findAllComponents(WlNavItem)[1]!.trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["tasks"]);
    expect(wrapper.emitted("select")?.[0]?.[0]).toMatchObject({ key: "tasks" });

    await root.trigger("mouseleave");
    expect(root.attributes("data-expanded")).toBe("false");
  });

  it("supports controlled pinning through the composed pin item", async () => {
    const wrapper = mount(WlSidebar, {
      props: { groups, pinned: true }
    });

    expect(wrapper.find('[data-wl="sidebar"]').classes()).toContain("is-pinned");
    expect(wrapper.find('[data-wl="sidebar"]').attributes("data-expanded")).toBe("true");

    const navItems = wrapper.findAllComponents(WlNavItem);
    const pinItem = navItems[navItems.length - 1];
    expect(pinItem?.props("label")).toBe("Открепить панель");
    await pinItem?.trigger("click");
    expect(wrapper.emitted("update:pinned")?.[0]).toEqual([false]);
  });

  it("closes the mobile drawer from backdrop and Escape", async () => {
    const wrapper = mount(WlSidebar, {
      props: { groups, mobileOpen: true }
    });

    await wrapper.find(".wl-sidebar__backdrop").trigger("click");
    expect(wrapper.emitted("update:mobileOpen")?.[0]).toEqual([false]);

    await wrapper.setProps({ mobileOpen: false });
    await wrapper.setProps({ mobileOpen: true });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(wrapper.emitted("update:mobileOpen")?.[1]).toEqual([false]);
    wrapper.unmount();
  });
  it("moves focus into the mobile drawer and restores it after closing", async () => {
    const opener = document.createElement("button");
    document.body.appendChild(opener);
    opener.focus();
    const wrapper = mount(WlSidebar, {
      attachTo: document.body,
      props: { groups, mobileOpen: false }
    });

    await wrapper.setProps({ mobileOpen: true });
    await nextTick();
    expect(wrapper.find("aside").element.contains(document.activeElement)).toBe(true);

    await wrapper.setProps({ mobileOpen: false });
    await nextTick();
    expect(document.activeElement).toBe(opener);
    wrapper.unmount();
    opener.remove();
  });
});
