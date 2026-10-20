import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";
import { WlConfig, WlTabs } from "../src";

function adapter() {
  const navigate = vi.fn((event: MouseEvent) => event.preventDefault());
  const component = defineComponent({
    props: { to: { type: [String, Object], required: true }, custom: Boolean },
    setup(props, { slots }) {
      return () => slots.default?.({ href: typeof props.to === "string" ? props.to : "/resolved", navigate, isActive: false });
    }
  });
  return { component, navigate };
}

describe("Tabs link items", () => {
  it("renders href items as native links with stable tab/panel relationships", () => {
    const wrapper = mount(WlTabs, { props: { items: [{ key: "overview", label: "Overview", href: "#overview" }, { key: "notes", label: "Notes" }] } });
    try {
      const link = wrapper.get('a[role="tab"]');
      expect(link.attributes("href")).toBe("#overview");
      expect(link.attributes("type")).toBeUndefined();
      expect(wrapper.get(`[id="${link.attributes("aria-controls")}"]`).attributes("aria-labelledby")).toBe(link.attributes("id"));
      expect(wrapper.get('button[role="tab"]').attributes("type")).toBe("button");
    } finally { wrapper.unmount(); }
  });

  it("moves focus and selected state without routing, then navigates on keyboard-activated click", async () => {
    const { component, navigate } = adapter();
    const wrapper = mount(WlTabs, {
      attachTo: document.body,
      props: { items: [{ key: "overview", label: "Overview", to: "/overview" }, { key: "notes", label: "Notes", to: { name: "notes" } }] },
      global: { plugins: [[WlConfig, { linkComponent: component }]] }
    });
    try {
      const links = wrapper.findAll('a[role="tab"]');
      await links[0]!.trigger("keydown", { key: "ArrowRight" });
      expect(document.activeElement).toBe(links[1]!.element);
      expect(links[1]!.attributes("aria-selected")).toBe("true");
      expect(navigate).not.toHaveBeenCalled();
      const enter = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
      links[1]!.element.dispatchEvent(enter);
      expect(enter.defaultPrevented).toBe(false);
      // Native anchors dispatch click after Enter; jsdom does not synthesize it.
      links[1]!.element.dispatchEvent(new MouseEvent("click", { detail: 0, bubbles: true, cancelable: true }));
      expect(navigate).toHaveBeenCalledTimes(1);
      expect(wrapper.emitted("update:modelValue")).toEqual([["notes"]]);
    } finally { wrapper.unmount(); }
  });

  it("preserves modified native clicks without selecting or routing", async () => {
    const { component, navigate } = adapter();
    const wrapper = mount(WlTabs, {
      props: { items: [{ key: "overview", label: "Overview" }, { key: "notes", label: "Notes", to: "/notes" }] },
      global: { plugins: [[WlConfig, { linkComponent: component }]] }
    });
    try {
      const link = wrapper.get("a");
      const nativeHandoffs: boolean[] = [];
      link.element.addEventListener("click", (event) => {
        nativeHandoffs.push(!event.defaultPrevented);
        event.preventDefault();
      });
      for (const modifiers of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }]) {
        await link.trigger("click", modifiers);
      }
      expect(nativeHandoffs).toEqual([true, true, true, true, true]);
      expect(navigate).not.toHaveBeenCalled();
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
      expect(link.attributes("aria-selected")).toBe("false");
    } finally { wrapper.unmount(); }
  });

  it("skips disabled links and updates refs when an item changes between link and button", async () => {
    const wrapper = mount(WlTabs, {
      attachTo: document.body,
      props: { items: [{ key: "first", label: "First" }, { key: "disabled", label: "Disabled", href: "/disabled", disabled: true }, { key: "last", label: "Last", to: "/last" }] }
    });
    try {
      const disabled = wrapper.get('[role="tab"][aria-disabled="true"]');
      expect(disabled.attributes("href")).toBeUndefined();
      expect(disabled.attributes("tabindex")).toBe("-1");
      await disabled.trigger("click");
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
      await wrapper.get('[role="tab"][aria-selected="true"]').trigger("keydown", { key: "End" });
      expect(document.activeElement).toBe(wrapper.findAll('[role="tab"]')[2]!.element);
      await wrapper.setProps({ items: [{ key: "first", label: "First", href: "/first" }, { key: "disabled", label: "Disabled", disabled: true }, { key: "last", label: "Last" }] });
      await wrapper.get('[role="tab"][aria-selected="true"]').trigger("keydown", { key: "Home" });
      expect(document.activeElement).toBe(wrapper.get('a[role="tab"]').element);
      expect(wrapper.get('a[role="tab"]').attributes("aria-selected")).toBe("true");
    } finally { wrapper.unmount(); }
  });
});
