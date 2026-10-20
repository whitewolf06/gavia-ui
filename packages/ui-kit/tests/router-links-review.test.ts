import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick } from "vue";
import type { GlobalMountOptions } from "./mounting-types";
import { WlBreadcrumbs, WlCommandPalette, WlConfig, WlMenu, WlNavItem, WlSidebar } from "../src";
import WlLink from "../src/components/WlLink.vue";

function adapter() {
  const navigate = vi.fn((event: MouseEvent) => event.preventDefault());
  const component = defineComponent({
    props: { to: { type: [String, Object], required: true }, custom: Boolean },
    setup(props, { slots }) {
      return () => slots.default?.({ href: "/resolved", isActive: true, navigate, to: props.to });
    }
  });
  return { component, navigate };
}

describe("router link integration", () => {
  it("uses plain href/string to without an adapter and never stringifies route objects", () => {
    for (const [props, expected] of [[{ href: "/plain" }, "/plain"], [{ to: "/route" }, "/route"], [{ to: { name: "home" } }, undefined]] as const) {
      const wrapper = mount(WlLink, { props, slots: { default: "Open" } });
      expect(wrapper.get("a").attributes("href")).toBe(expected);
      wrapper.unmount();
    }
  });

  it("uses the custom adapter, route active state, and blocks disabled/cancelled navigation", async () => {
    const { component, navigate } = adapter();
    const wrapper = mount(WlLink, {
      props: { to: { name: "home" } },
      global: { plugins: [[WlConfig, { linkComponent: component }]] },
      slots: { default: ({ isActive }) => h("span", String(isActive)) }
    });
    try {
      expect(wrapper.getComponent(component).props()).toMatchObject({ to: { name: "home" }, custom: true });
      const link = wrapper.get("a");
      expect(link.attributes("href")).toBe("/resolved");
      expect(link.classes()).toContain("is-active");
      expect(link.text()).toBe("true");
      await link.trigger("click");
      expect(navigate).toHaveBeenCalledTimes(1);
      await wrapper.setProps({ disabled: true });
      await link.trigger("click");
      expect(link.attributes("href")).toBeUndefined();
      expect(link.attributes("tabindex")).toBe("-1");
      expect(navigate).toHaveBeenCalledTimes(1);
    } finally { wrapper.unmount(); }
    const cancelled = mount(WlLink, {
      props: { to: "/home", onClick: (event: MouseEvent) => event.preventDefault() },
      global: { plugins: [[WlConfig, { linkComponent: component }]] }
    });
    await cancelled.get("a").trigger("click");
    expect(navigate).toHaveBeenCalledTimes(1);
    cancelled.unmount();
  });

  it("secures external links and announces the new tab", () => {
    const wrapper = mount(WlLink, { props: { href: "https://example.com", external: true }, slots: { default: "Site" } });
    expect(wrapper.get("a").attributes("target")).toBe("_blank");
    expect(wrapper.get("a").attributes("rel")).toContain("noopener");
    expect(wrapper.get("a").attributes("rel")).toContain("noreferrer");
    expect(wrapper.get(".wl-sr-only").text()).not.toBe("");
    wrapper.unmount();
  });

  it("preserves modified and new-tab clicks for the browser", async () => {
    const { component, navigate } = adapter();
    const wrapper = mount(WlLink, {
      props: { to: "/home" },
      global: { plugins: [[WlConfig, { linkComponent: component }]] }
    });
    try {
      const nativeClicks: boolean[] = [];
      wrapper.get("a").element.addEventListener("click", (event) => {
        nativeClicks.push(!event.defaultPrevented);
        // jsdom cannot follow browser navigation; verify the native handoff first.
        event.preventDefault();
      });
      for (const modifiers of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }]) {
        await wrapper.get("a").trigger("click", modifiers);
      }
      await wrapper.setProps({ external: true });
      await wrapper.get("a").trigger("click");
      expect(navigate).not.toHaveBeenCalled();
      expect(nativeClicks).toEqual([true, true, true, true, true, true]);
    } finally { wrapper.unmount(); }
  });

  it("keeps link adapters isolated by app and merges root pt attributes", () => {
    const { component } = adapter();
    const configured = mount(WlLink, {
      props: { to: "/home", pt: { root: { class: "local-link", "data-local": "yes", target: "_blank" } } },
      global: { plugins: [[WlConfig, { linkComponent: component, pt: { link: { root: { class: "app-link", "data-app": "yes" } } } }]] }
    });
    const plain = mount(WlLink, { props: { to: "/home" } });
    try {
      expect(configured.get("a").classes()).toEqual(expect.arrayContaining(["app-link", "local-link", "wl-link"]));
      expect(configured.get("a").attributes("data-local")).toBe("yes");
      expect(configured.get("a").attributes("data-app")).toBe("yes");
      expect(configured.get("a").attributes("target")).toBe("_blank");
      expect(plain.findComponent(component).exists()).toBe(false);
      expect(plain.get("a").attributes("href")).toBe("/home");
    } finally {
      configured.unmount();
      plain.unmount();
    }
  });

  it("routes Breadcrumbs, NavItem, Sidebar and Menu through the configured custom adapter", async () => {
    const { component, navigate } = adapter();
    const route = { name: "home" };
    const command = vi.fn();
    const global: GlobalMountOptions = { plugins: [[WlConfig, { linkComponent: component }]] };
    const wrappers = [
      mount(WlBreadcrumbs, { global, props: { items: [{ label: "Home", to: route }, { label: "Current" }] } }),
      mount(WlNavItem, { global, props: { label: "Home", to: route } }),
      mount(WlSidebar, { global, props: { groups: [{ id: "nav", items: [{ key: "home", label: "Home", to: route }] }], showPin: false } }),
      mount(WlMenu, { global, props: { items: [{ label: "Home", to: route, command }] } })
    ];
    try {
      for (const wrapper of wrappers) {
        expect(wrapper.findAllComponents(component)).toHaveLength(1);
        expect(wrapper.get("a").attributes("href")).toBe("/resolved");
        await wrapper.get("a").trigger("click");
      }
      expect(navigate).toHaveBeenCalledTimes(4);
      expect(command).toHaveBeenCalledTimes(1);
    } finally { wrappers.forEach((wrapper) => wrapper.unmount()); }
  });

  it("navigates CommandPalette routes by keyboard and preserves its select event", async () => {
    const { component, navigate } = adapter();
    const item = { id: "home", label: "Home", to: { name: "home" } };
    const wrapper = mount(WlCommandPalette, {
      attachTo: document.body,
      global: { plugins: [[WlConfig, { linkComponent: component }]] },
      props: { groups: [{ id: "nav", label: "Navigation", items: [item] }], visible: true, motion: false }
    });
    try {
      await nextTick();
      await nextTick();
      const input = document.querySelector<HTMLInputElement>('[data-wl="command-palette"] input')!;
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      await nextTick();
      expect(navigate).toHaveBeenCalledTimes(1);
      expect(wrapper.emitted("select")?.[0]?.[0]).toEqual(item);
      expect(wrapper.emitted("update:visible")?.at(-1)).toEqual([false]);
    } finally { wrapper.unmount(); }
  });
});
