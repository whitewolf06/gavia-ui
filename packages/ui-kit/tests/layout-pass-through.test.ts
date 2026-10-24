import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { WlCommandPalette, WlConfig, WlFilterBar, WlPageHeader, WlSidebar } from "../src";
import { wlLocaleEn } from "../src/locale";

enableAutoUnmount(afterEach);
afterEach(() => vi.unstubAllGlobals());

describe("layout components expose their existing DOM through PT", () => {
  it("PageHeader merges app/local/caller root attributes while preserving headings and named content", async () => {
    const click = vi.fn();
    const wrapper = mount(WlPageHeader, {
      attrs: { class: "caller-header", style: { borderWidth: "3px" }, "data-source": "caller", onClick: click },
      global: { plugins: [[WlConfig, { pt: { pageheader: { root: { class: "app-header", style: { color: "red" }, "data-source": "app" }, title: { class: "app-title" } } } }]] },
      props: { title: "Materials", eyebrow: "Team", description: "All materials", headingLevel: 2, pt: { root: () => ({ class: "local-header", style: { backgroundColor: "blue" }, "data-source": "local" }), title: () => ({ class: "local-title", "data-title": "custom" }) } },
      slots: { breadcrumbs: "Home", meta: "Updated today", actions: "Actions", navigation: "Navigation" }
    });
    expect(wrapper.classes()).toEqual(expect.arrayContaining(["wl-page-header", "app-header", "local-header", "caller-header"]));
    expect((wrapper.element as HTMLElement).style.cssText).toContain("border-width: 3px");
    expect((wrapper.element as HTMLElement).style.color).toBe("red");
    expect((wrapper.element as HTMLElement).style.backgroundColor).toBe("blue");
    expect(wrapper.attributes("data-source")).toBe("caller");
    expect(wrapper.get("h2").classes()).toEqual(expect.arrayContaining(["app-title", "local-title", "wl-page-header__title"]));
    expect(wrapper.get("h2").attributes("data-title")).toBe("custom");
    await wrapper.trigger("click");
    expect(click).toHaveBeenCalledOnce();
  });

  it("FilterBar binds the mobile panel sections without replacing close behavior or duplicating caller events", async () => {
    const click = vi.fn();
    const close = vi.fn();
    const wrapper = mount(WlFilterBar, {
      attrs: { class: "caller-filter", onClick: click },
      global: { plugins: [[WlConfig, { pt: { filterbar: { root: { class: "app-filter" }, closeButton: { class: "app-close" } } } }]] },
      props: { open: true, activeCount: 1, pt: { root: () => ({ class: "local-filter" }), panel: () => ({ "data-panel": "custom" }), closeButton: () => ({ class: "local-close", onClick: close }), summary: { "data-summary": "yes" } } },
      slots: { default: "Controls", leading: "Leading", summary: "One active filter" }
    });
    await nextTick();
    expect(wrapper.classes()).toEqual(expect.arrayContaining(["app-filter", "local-filter", "caller-filter", "wl-filter-bar"]));
    expect(wrapper.get(".wl-filter-bar__panel").attributes("data-panel")).toBe("custom");
    expect(wrapper.get(".wl-filter-bar__summary").attributes("data-summary")).toBe("yes");
    const button = wrapper.get(".local-close");
    expect(button.classes()).toContain("app-close");
    await button.trigger("click");
    expect(close).toHaveBeenCalledOnce();
    expect(click).toHaveBeenCalledOnce();
    expect(wrapper.emitted("update:open")).toEqual([[false]]);
  });

  it("Sidebar provides item state to callbacks and preserves navigation and pin events", async () => {
    const click = vi.fn();
    const wrapper = mount(WlSidebar, {
      attrs: { class: "caller-sidebar" },
      global: { plugins: [[WlConfig, { pt: { sidebar: { root: { class: "app-sidebar" }, item: { class: "app-item", "data-layer": "app" } } } }]] },
      props: { brand: "Gavia", brandMark: "G", pinned: true, groups: [{ id: "main", label: "Main", separator: true, items: [{ key: "home", label: "Home" }, { key: "disabled", label: "Disabled", disabled: true }] }], footerItems: [{ key: "help", label: "Help" }], pt: {
        root: () => ({ class: "local-sidebar" }),
        item: ({ context }) => ({ class: "local-item", "data-layer": "local", "data-active": String(context.active), "data-disabled": String(context.disabled), "data-expanded": String(context.expanded), onClick: click }),
        footerItem: { "data-footer-item": "yes" }, pinButton: { "data-pin": "yes" }
      } }
    });
    expect(wrapper.get(".wl-sidebar-shell").classes()).toEqual(expect.arrayContaining(["wl-sidebar-shell", "app-sidebar", "local-sidebar", "caller-sidebar"]));
    const item = wrapper.findAll(".local-item")[0]!;
    expect(item.attributes()).toMatchObject({ "data-layer": "local", "data-active": "false", "data-disabled": "false", "data-expanded": "true" });
    expect(item.classes()).toContain("app-item");
    expect(wrapper.findAll(".local-item")[1]!.attributes("data-disabled")).toBe("true");
    await item.trigger("click");
    expect(click).toHaveBeenCalledOnce();
    expect(wrapper.emitted("update:modelValue")).toEqual([["home"]]);
    expect(wrapper.get("[data-footer-item]").text()).toContain("Help");
    expect(wrapper.get("[data-pin]").text()).toContain(wlLocaleEn.unpinSidebar);
    await wrapper.get("[data-pin]").trigger("click");
    expect(wrapper.emitted("update:pinned")).toEqual([[false]]);
    await wrapper.setProps({ pinned: false });
    expect(wrapper.get("[data-pin]").attributes("aria-label")).toBe(wlLocaleEn.pinSidebar);
  });

  it("CommandPalette supplies active/disabled group contexts and retains selection and root attributes", async () => {
    const click = vi.fn();
    const wrapper = mount(WlCommandPalette, {
      attrs: { class: "caller-palette" },
      global: { stubs: { Teleport: true }, plugins: [[WlConfig, { pt: { commandpalette: { root: { class: "app-palette" }, item: { class: "app-option", "data-layer": "app" } } } }]] },
      props: { visible: true, motion: false, groups: [{ id: "main", label: "Main", items: [{ id: "one", label: "One" }, { id: "two", label: "Two", disabled: true }] }], pt: {
        root: () => ({ class: "local-palette" }), panel: { "data-panel": "yes" }, groupLabel: { "data-group-label": "yes" },
        item: ({ context }) => ({ class: "local-option", "data-layer": "local", "data-active": String(context.active), "data-disabled": String(context.disabled), onClick: click }), footer: { "data-footer": "yes" }
      } }, slots: { footer: "Footer" }
    });
    await flushPromises();
    const root = wrapper.get('[data-wl="command-palette"]');
    expect(root.classes()).toEqual(expect.arrayContaining(["wl-command-palette", "app-palette", "local-palette", "caller-palette"]));
    const option = wrapper.findAll(".local-option")[0]!;
    expect(option.classes()).toContain("app-option");
    expect(option.attributes()).toMatchObject({ "data-layer": "local", "data-active": "true", "data-disabled": "false" });
    expect(wrapper.findAll(".local-option")[1]!.attributes("data-disabled")).toBe("true");
    expect(wrapper.get("[data-group-label]").text()).toBe("Main");
    expect(wrapper.get("[data-footer]").text()).toBe("Footer");
    await option.trigger("click");
    expect(click).toHaveBeenCalledOnce();
    expect(wrapper.emitted("select")).toHaveLength(1);
    expect(wrapper.emitted("update:visible")).toEqual([[false]]);
  });
});
