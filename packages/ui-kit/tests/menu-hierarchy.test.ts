import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick, ref } from "vue";
import { WlConfig, WlDialog, WlMenu, type WlMenuItem } from "../src";

const wrappers: VueWrapper[] = [];
afterEach(async () => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount());
  await nextTick();
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.useRealTimers();
});
async function key(element: HTMLElement, value: string): Promise<KeyboardEvent> {
  const event = new KeyboardEvent("keydown", { key: value, bubbles: true, cancelable: true });
  element.dispatchEvent(event);
  await flushPromises();
  return event;
}
function item(label: string): HTMLElement {
  return [...document.querySelectorAll<HTMLElement>("[data-wl-menu-index]")].find((element) => element.textContent?.trim() === label)!;
}

describe("hierarchical menus", () => {
  it("opens nested levels with Right and closes one level with Left/Escape, retaining ARIA relationships", async () => {
    const command = vi.fn();
    const wrapper = mount(WlMenu, {
      attachTo: document.body, props: { motion: false, items: [{ label: "File", items: [{ label: "Recent", items: [{ label: "Project", command }] }, { label: "Disabled", disabled: true }] }] }
    });
    wrappers.push(wrapper);
    const file = item("File");
    file.focus();
    await key(file, "ArrowRight");
    const recent = item("Recent");
    expect(document.activeElement).toBe(recent);
    expect(file.getAttribute("aria-haspopup")).toBe("menu");
    expect(file.getAttribute("aria-expanded")).toBe("true");
    expect(document.getElementById(file.getAttribute("aria-controls")!)?.getAttribute("aria-labelledby")).toBe(file.id);
    await key(recent, "ArrowRight");
    expect(document.activeElement).toBe(item("Project"));
    await key(item("Project"), "Escape");
    expect(document.querySelectorAll('[role="menu"]')).toHaveLength(2);
    expect(document.activeElement).toBe(recent);
    await key(recent, "ArrowLeft");
    expect(document.querySelectorAll('[role="menu"]')).toHaveLength(1);
    expect(document.activeElement).toBe(file);
    expect(file.getAttribute("aria-expanded")).toBe("false");
    expect(file.hasAttribute("aria-controls")).toBe(false);
    expect(command).not.toHaveBeenCalled();
  });

  it("supports typeahead, first/last popup focus, disabled branches and a single command invocation", async () => {
    const command = vi.fn();
    const Harness = defineComponent({
      components: { WlMenu },
      setup: () => ({ items: [{ label: "Alpha", command }, { label: "Disabled", disabled: true, items: [{ label: "Hidden" }] }, { label: "Beta", command }] }),
      template: '<WlMenu popup :motion="false" :items="items"><template #trigger="{ attrs }"><button data-open v-bind="attrs">Open</button></template></WlMenu>'
    });
    const wrapper = mount(Harness, { attachTo: document.body });
    wrappers.push(wrapper);
    await key(wrapper.get("button").element as HTMLElement, "ArrowUp");
    expect(document.activeElement).toBe(item("Beta"));
    await key(item("Beta"), "Home");
    expect(document.activeElement).toBe(item("Alpha"));
    await key(item("Alpha"), "b");
    expect(document.activeElement).toBe(item("Beta"));
    item("Disabled").click();
    await flushPromises();
    expect(document.querySelectorAll('[role="menu"]')).toHaveLength(1);
    await key(item("Beta"), " ");
    expect(command).toHaveBeenCalledTimes(1);
    expect(document.querySelector('[role="menu"]')).toBeNull();
    expect(document.activeElement).toBe(wrapper.get("button").element);
  });

  it("emits controlled checkbox/radio updates without mutating frozen items or radio siblings", async () => {
    const changed = vi.fn();
    const check = Object.freeze({ label: "Grid", type: "checkbox" as const, checked: "mixed" as const, onCheckedChange: changed });
    const first = Object.freeze({ label: "Small", type: "radio" as const, group: "Size", checked: true });
    const second = Object.freeze({ label: "Large", type: "radio" as const, group: "Size", checked: false, onCheckedChange: changed });
    const wrapper = mount(WlMenu, { attachTo: document.body, props: { items: Object.freeze([check, first, second]) } });
    wrappers.push(wrapper);
    expect(item("Grid").getAttribute("role")).toBe("menuitemcheckbox");
    expect(item("Grid").getAttribute("aria-checked")).toBe("mixed");
    await key(item("Grid"), " ");
    expect(changed).toHaveBeenLastCalledWith(true, check);
    expect(wrapper.emitted("check")?.[0]).toEqual([{ item: check, checked: true }]);
    expect(item("Grid").getAttribute("aria-checked")).toBe("mixed");
    item("Large").click();
    await nextTick();
    expect(changed).toHaveBeenLastCalledWith(true, second);
    expect(first.checked).toBe(true);
    expect(second.checked).toBe(false);
    expect(item("Large").getAttribute("role")).toBe("menuitemradio");
    expect(item("Large").getAttribute("aria-posinset")).toBe("2");
    expect(item("Large").getAttribute("aria-setsize")).toBe("2");
    expect(item("Large").getAttribute("aria-checked")).toBe("false");
    item("Small").click();
    await nextTick();
    expect(wrapper.emitted("check")).toHaveLength(2);
    await wrapper.setProps({ items: [{ ...check, checked: true }, first, { ...second, checked: true }] });
    expect(item("Grid").getAttribute("aria-checked")).toBe("true");
  });

  it("uses delayed hover previews without stealing focus from keyboard-owned nested menus", async () => {
    vi.useFakeTimers();
    const items: WlMenuItem[] = [{ label: "File", items: [{ label: "Project" }] }, { label: "View", items: [{ label: "Grid" }] }];
    const wrapper = mount(WlMenu, { attachTo: document.body, props: { items, motion: false } });
    wrappers.push(wrapper);
    item("File").closest("li")!.dispatchEvent(new MouseEvent("mouseenter"));
    await vi.advanceTimersByTimeAsync(149);
    expect(document.querySelectorAll('[role="menu"]')).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(1);
    await flushPromises();
    expect(item("Project")).toBeTruthy();
    expect(document.activeElement).toBe(document.body);
    item("File").focus();
    await key(item("File"), "ArrowRight");
    expect(document.activeElement).toBe(item("Project"));
    item("View").closest("li")!.dispatchEvent(new MouseEvent("mouseenter"));
    await vi.advanceTimersByTimeAsync(150);
    expect(item("Project")).toBeTruthy();
    expect(item("Grid")).toBeUndefined();
    expect(document.activeElement).toBe(item("Project"));
  });

  it("retains a pointer preview while crossing into it and closes it after leaving both regions", async () => {
    vi.useFakeTimers();
    const wrapper = mount(WlMenu, {
      attachTo: document.body,
      props: { motion: false, items: [{ label: "File", items: [{ label: "Open" }] }, { label: "Help" }] }
    });
    wrappers.push(wrapper);
    const rootMenu = wrapper.get('[role="menu"]').element;
    const preview = async () => {
      item("File").closest("li")!.dispatchEvent(new MouseEvent("mouseenter"));
      await vi.advanceTimersByTimeAsync(150);
      await nextTick();
    };
    await preview();
    const submenu = document.querySelector<HTMLElement>('[data-wl="menu-submenu"]')!;
    rootMenu.dispatchEvent(new MouseEvent("mouseleave", { relatedTarget: submenu }));
    await vi.advanceTimersByTimeAsync(150);
    expect(document.querySelector('[data-wl="menu-submenu"]')).toBe(submenu);

    rootMenu.dispatchEvent(new MouseEvent("mouseleave"));
    await vi.advanceTimersByTimeAsync(75);
    submenu.dispatchEvent(new MouseEvent("mouseenter"));
    await vi.advanceTimersByTimeAsync(100);
    expect(document.querySelector('[data-wl="menu-submenu"]')).toBe(submenu);

    submenu.dispatchEvent(new MouseEvent("mouseleave"));
    await vi.advanceTimersByTimeAsync(149);
    expect(document.querySelector('[data-wl="menu-submenu"]')).toBe(submenu);
    await vi.advanceTimersByTimeAsync(1);
    expect(document.querySelector('[data-wl="menu-submenu"]')).toBeNull();

    await preview();
    item("Help").closest("li")!.dispatchEvent(new MouseEvent("mouseenter"));
    await vi.advanceTimersByTimeAsync(150);
    expect(document.querySelector('[data-wl="menu-submenu"]')).toBeNull();
    expect(document.activeElement).toBe(document.body);
  });

  it("closes the open branch when focus changes and forwards a nested checkbox selection once", async () => {
    const checked = Object.freeze({ label: "Grid", type: "checkbox" as const, checked: false });
    const wrapper = mount(WlMenu, {
      attachTo: document.body,
      props: { motion: false, items: [{ label: "View", items: [checked] }, { label: "Help" }] }
    });
    wrappers.push(wrapper);
    item("View").click();
    await flushPromises();
    expect(document.activeElement).toBe(item("Grid"));
    item("Help").focus();
    await nextTick();
    expect(document.querySelector('[data-wl="menu-submenu"]')).toBeNull();

    item("View").click();
    await flushPromises();
    item("View").focus();
    await key(item("View"), "Escape");
    expect(document.querySelector('[data-wl="menu-submenu"]')).toBeNull();
    expect(document.activeElement).toBe(item("View"));

    item("View").click();
    await flushPromises();
    item("Grid").click();
    await nextTick();
    expect(wrapper.emitted("check")).toEqual([[{ item: checked, checked: true }]]);
    expect(checked.checked).toBe(false);
    expect(document.querySelectorAll('[role="menu"]')).toHaveLength(1);
  });

  it("focuses the popup menu itself when every entry is unavailable", async () => {
    const wrapper = mount(defineComponent({
      components: { WlMenu },
      setup: () => ({ items: [{ header: "Actions" }, { label: "Unavailable", disabled: true }] }),
      template: '<WlMenu popup :motion="false" :items="items"><template #trigger="{ attrs }"><button v-bind="attrs">Actions</button></template></WlMenu>'
    }), { attachTo: document.body });
    wrappers.push(wrapper);
    await key(wrapper.get("button").element as HTMLElement, "ArrowUp");
    const menu = document.querySelector<HTMLElement>('[role="menu"]')!;
    expect(document.activeElement).toBe(menu);
    expect(menu.querySelector('[role="menuitem"]')?.getAttribute("aria-disabled")).toBe("true");
    await key(menu, "ArrowRight");
    expect(document.querySelectorAll('[role="menu"]')).toHaveLength(1);
    expect(document.activeElement).toBe(menu);
  });

  it("keeps nested portal menus usable inside a modal and dismisses Escape in layer order", async () => {
    const Harness = defineComponent({
      components: { WlDialog, WlMenu },
      setup: () => ({ visible: ref(true), items: [{ label: "Parent", items: [{ label: "Child" }] }] }),
      template: '<WlDialog v-model:visible="visible" :motion="false" aria-label="Dialog"><WlMenu popup :motion="false" :items="items"><template #trigger="{ attrs }"><button data-open v-bind="attrs">Open</button></template></WlMenu></WlDialog>'
    });
    const wrapper = mount(Harness, { attachTo: document.body });
    wrappers.push(wrapper);
    await flushPromises();
    const trigger = document.querySelector<HTMLButtonElement>("[data-open]")!;
    trigger.click();
    await flushPromises();
    await key(item("Parent"), "ArrowRight");
    expect(item("Child").closest("[inert]")).toBeNull();
    item("Child").dispatchEvent(new Event("pointerdown", { bubbles: true }));
    await nextTick();
    expect(document.querySelectorAll('[role="menu"]')).toHaveLength(2);
    await key(item("Child"), "Escape");
    expect(document.querySelectorAll('[role="menu"]')).toHaveLength(1);
    expect(document.querySelector('[role="dialog"]')).toBeTruthy();
    await key(item("Parent"), "Escape");
    expect(document.querySelector('[role="menu"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
    await key(trigger, "Escape");
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it("preserves modified link activation and the configured router adapter in submenu leaves", async () => {
    const navigate = vi.fn((event: MouseEvent) => event.preventDefault());
    const component = defineComponent({
      props: { to: { type: [String, Object], default: undefined }, custom: Boolean },
      setup(_props, { slots }) {
        return () => slots.default?.({ href: "#resolved", navigate, isActive: false });
      }
    });
    const command = vi.fn();
    const wrapper = mount(WlMenu, {
      attachTo: document.body, global: { plugins: [[WlConfig, { linkComponent: component }]] },
      props: { motion: false, items: [{ label: "Routes", items: [{ label: "Home", to: { name: "home" }, command }] }] }
    });
    wrappers.push(wrapper);
    await key(item("Routes"), "ArrowRight");
    const link = item("Home");
    const modified = new MouseEvent("click", { ctrlKey: true, bubbles: true, cancelable: true });
    link.dispatchEvent(modified);
    await nextTick();
    expect(modified.defaultPrevented).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
    expect(command).toHaveBeenCalledTimes(1);
    await key(item("Routes"), "ArrowRight");
    const modifiedKey = new KeyboardEvent("keydown", { key: "Enter", ctrlKey: true, bubbles: true, cancelable: true });
    item("Home").dispatchEvent(modifiedKey);
    expect(modifiedKey.defaultPrevented).toBe(false);
    expect(command).toHaveBeenCalledTimes(1);
    await key(item("Home"), "Enter");
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(command).toHaveBeenCalledTimes(2);
  });

  it("closes the whole popup tree on outside pointer and Tab without blocking native Tab", async () => {
    const wrapper = mount(defineComponent({
      components: { WlMenu }, setup: () => ({ items: [{ label: "File", items: [{ label: "Open" }] }] }),
      template: '<button data-outside>Outside</button><WlMenu popup :motion="false" :items="items"><template #trigger="{ attrs }"><button data-open v-bind="attrs">Open</button></template></WlMenu>'
    }), { attachTo: document.body });
    wrappers.push(wrapper);
    await wrapper.get("[data-open]").trigger("click");
    await flushPromises();
    await key(item("File"), "ArrowRight");
    const tab = await key(item("Open"), "Tab");
    expect(tab.defaultPrevented).toBe(false);
    expect(document.querySelector('[role="menu"]')).toBeNull();
    await wrapper.get("[data-open]").trigger("click");
    await flushPromises();
    await key(item("File"), "ArrowRight");
    wrapper.get("[data-outside]").element.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    await flushPromises();
    expect(document.querySelector('[role="menu"]')).toBeNull();
  });
});
