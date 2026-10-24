import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, nextTick, reactive } from "vue";
import type { WlConfigOptions, WlSidebarGroup, WlSidebarItem } from "../../src";
import { WlConfig, wlLocaleEn, wlLocaleRu, WlNavItem, WlSidebar } from "../../src";

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
      props: { groups, footerItems, brand: "Gavia UI", brandMark: "G" }
    });

    expect(wrapper.findAllComponents(WlNavItem)).toHaveLength(6);
    expect(wrapper.find('[data-wl="sidebar"]').attributes("data-expanded")).toBe("false");
    expect(wrapper.find(".wl-sidebar__brand-mark").text()).toBe("G");
    expect(wrapper.find(".wl-sidebar__group-label").text()).toBe("Инструменты");
    expect(wrapper.find(".wl-sidebar__group-label").attributes("style")).toContain("display: none");
    expect(wrapper.findAllComponents(WlNavItem)[0]!.attributes("aria-label")).toBe("Сегодня");
  });

  it("expands on hover and keeps active state controlled by v-model", async () => {
    const wrapper = mount(WlSidebar, {
      props: { groups, modelValue: "today", brand: "Gavia UI" }
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
    expect(pinItem?.props("label")).toBe("Unpin sidebar");
    await pinItem?.trigger("click");
    expect(wrapper.emitted("update:pinned")?.[0]).toEqual([false]);
  });

  it("updates navigation and pin labels while preserving explicit text", async () => {
    const config = reactive<WlConfigOptions>({ locale: wlLocaleRu });
    const wrapper = mount(WlSidebar, { global: { plugins: [[WlConfig, config]] } });
    const pin = wrapper.getComponent(WlNavItem);
    expect(wrapper.get("aside").attributes("aria-label")).toBe("Основная навигация");
    expect(pin.props("label")).toBe("Закрепить панель");
    await wrapper.setProps({ pinned: true });
    expect(pin.props("label")).toBe("Открепить панель");

    await wrapper.setProps({ ariaLabel: "Основная навигация", pinLabel: "Закрепить панель", unpinLabel: "Открепить панель" });
    config.locale = wlLocaleEn;
    await nextTick();
    expect(wrapper.get("aside").attributes("aria-label")).toBe("Основная навигация");
    expect(pin.props("label")).toBe("Открепить панель");
    await wrapper.setProps({ pinned: false });
    expect(pin.props("label")).toBe("Закрепить панель");

    await wrapper.setProps({ ariaLabel: "", pinLabel: "", unpinLabel: "" });
    expect(wrapper.get("aside").attributes("aria-label")).toBe("");
    expect(pin.props("label")).toBe("");
    await wrapper.setProps({ pinned: true });
    expect(pin.props("label")).toBe("");

    await wrapper.setProps({ ariaLabel: undefined, pinLabel: undefined, unpinLabel: undefined });
    expect(wrapper.get("aside").attributes("aria-label")).toBe("Main navigation");
    expect(pin.props("label")).toBe("Unpin sidebar");
    await wrapper.setProps({ pinned: false });
    expect(pin.props("label")).toBe("Pin sidebar");

    config.locale = wlLocaleRu;
    await nextTick();
    expect(wrapper.get("aside").attributes("aria-label")).toBe("Основная навигация");
    expect(pin.props("label")).toBe("Закрепить панель");
    wrapper.unmount();
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
  it("opens through its public mobile method and closes after selecting a footer item", async () => {
    const wrapper = mount(WlSidebar, { attachTo: document.body, props: { groups, footerItems } });
    try {
      wrapper.vm.openMobile();
      await nextTick();
      await nextTick();
      expect(wrapper.get("aside").attributes("role")).toBe("dialog");
      const help = wrapper.findAllComponents(WlNavItem).find((item) => item.props("label") === "Помощь")!;
      await help.trigger("click");
      expect(wrapper.emitted("select")?.[0]).toEqual([footerItems[0], undefined]);
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["help"]);
      expect(wrapper.emitted("update:mobileOpen")?.at(-1)).toEqual([false]);
      expect(wrapper.find(".wl-sidebar__backdrop").exists()).toBe(false);
    } finally { wrapper.unmount(); }
  });
  it("guards disabled selections from custom slots and supplies footer selection callbacks", async () => {
    const disabled = { key: "locked", label: "Locked", disabled: true };
    const help = { key: "help", label: "Help" };
    const wrapper = mount(defineComponent({
      components: { WlSidebar },
      setup: () => ({ groups: [{ id: "main", items: [disabled] }], footerItems: [help] }),
      template: `<WlSidebar :groups="groups" :footer-items="footerItems">
        <template #item="{ item, select }"><button :data-item="item.key" @click="select">{{ item.label }}</button></template>
        <template #footer-item="{ item, select }"><button :data-footer="item.key" @click="select">{{ item.label }}</button></template>
      </WlSidebar>`
    }));
    try {
      const sidebar = wrapper.getComponent({ name: "WlSidebar" });
      await wrapper.get("[data-item=locked]").trigger("click");
      expect(sidebar.emitted("select")).toBeUndefined();
      expect(sidebar.emitted("update:modelValue")).toBeUndefined();
      await wrapper.get("[data-footer=help]").trigger("click");
      expect(sidebar.emitted("select")?.[0]).toEqual([help, undefined]);
      expect(sidebar.emitted("update:modelValue")?.[0]).toEqual(["help"]);
    } finally { wrapper.unmount(); }
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
