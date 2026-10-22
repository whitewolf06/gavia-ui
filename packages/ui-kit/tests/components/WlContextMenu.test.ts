import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick } from "vue";
import { WlContextMenu, WlDialog } from "../../src";

const wrappers: VueWrapper[] = [];
afterEach(async () => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount());
  await nextTick();
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

describe("WlContextMenu", () => {
  it("opens at pointer coordinates, names the menu and restores its real trigger on Escape", async () => {
    const wrapper = mount(WlContextMenu, { attachTo: document.body, props: { items: [{ label: "Edit" }], ariaLabel: "Actions", motion: false }, slots: { default: "Target" } });
    wrappers.push(wrapper);
    const trigger = wrapper.get('[data-wl="context-menu"]');
    const event = new MouseEvent("contextmenu", { clientX: 120, clientY: 80, bubbles: true, cancelable: true });
    trigger.element.dispatchEvent(event);
    await flushPromises();
    expect(event.defaultPrevented).toBe(true);
    const panel = document.querySelector<HTMLElement>(".wl-context-menu__panel")!;
    expect(panel.style.left).toBe("120px");
    expect(panel.style.top).toBe("80px");
    const menu = panel.querySelector<HTMLElement>('[role="menu"]')!;
    expect(menu.getAttribute("aria-label")).toBe("Actions");
    expect(trigger.attributes("aria-controls")).toBe(menu.id);
    expect(document.activeElement?.textContent).toBe("Edit");
    menu.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await flushPromises();
    expect(document.querySelector('[role="menu"]')).toBeNull();
    expect(document.activeElement).toBe(trigger.element);
  });

  it.each(["ContextMenu", "F10"])("supports %s from a focusable trigger and anchors keyboard invocation to its bottom edge", async (key) => {
    const wrapper = mount(WlContextMenu, { attachTo: document.body, props: { items: [{ label: "Edit" }], motion: false } });
    wrappers.push(wrapper);
    const trigger = wrapper.get('[data-wl="context-menu"]');
    vi.spyOn(trigger.element, "getBoundingClientRect").mockReturnValue({ x: 100, y: 40, left: 100, top: 40, right: 300, bottom: 70, width: 200, height: 30, toJSON: () => ({}) });
    (trigger.element as HTMLElement).focus();
    const event = new KeyboardEvent("keydown", { key, shiftKey: key === "F10", bubbles: true, cancelable: true });
    trigger.element.dispatchEvent(event);
    await flushPromises();
    expect(event.defaultPrevented).toBe(true);
    const panel = document.querySelector<HTMLElement>(".wl-context-menu__panel")!;
    expect(panel.style.left).toBe("100px");
    expect(panel.style.top).toBe("74px");
    expect(document.activeElement?.getAttribute("role")).toBe("menuitem");
  });

  it("keeps native context-menu behavior when disabled and closes an already open menu on disable", async () => {
    const wrapper = mount(WlContextMenu, { attachTo: document.body, props: { disabled: true, items: [{ label: "Edit" }], motion: false } });
    wrappers.push(wrapper);
    const trigger = wrapper.get('[data-wl="context-menu"]');
    const event = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
    trigger.element.dispatchEvent(event);
    await nextTick();
    expect(event.defaultPrevented).toBe(false);
    expect(document.querySelector('[role="menu"]')).toBeNull();
    await wrapper.setProps({ disabled: false });
    await trigger.trigger("contextmenu", { clientX: 80, clientY: 90 });
    expect(document.querySelector('[role="menu"]')).toBeTruthy();
    await wrapper.setProps({ disabled: true });
    expect(document.querySelector('[role="menu"]')).toBeNull();
  });

  it("toggles through its public methods and forwards controlled checkbox selections", async () => {
    const checked = Object.freeze({ label: "Grid", type: "checkbox" as const, checked: false });
    const wrapper = mount(WlContextMenu, { attachTo: document.body, props: { items: [checked], motion: false } });
    wrappers.push(wrapper);
    wrapper.vm.toggle();
    await flushPromises();
    const checkbox = document.querySelector<HTMLElement>('[role="menuitemcheckbox"]')!;
    expect(document.activeElement).toBe(checkbox);
    wrapper.vm.show();
    await flushPromises();
    expect(document.querySelectorAll('[role="menu"]')).toHaveLength(1);
    expect(document.activeElement).toBe(checkbox);
    wrapper.vm.toggle();
    await flushPromises();
    expect(document.querySelector('[role="menu"]')).toBeNull();

    wrapper.vm.toggle();
    await flushPromises();
    document.querySelector<HTMLElement>('[role="menuitemcheckbox"]')!.click();
    await flushPromises();
    expect(wrapper.emitted("check")).toEqual([[{ item: checked, checked: true }]]);
    expect(checked.checked).toBe(false);
    expect(document.querySelector('[role="menu"]')).toBeNull();
  });

  it("retains trigger ownership inside a modal when opening at coordinates and choosing a nested item", async () => {
    const command = vi.fn();
    const Harness = defineComponent({
      components: { WlContextMenu, WlDialog },
      setup: () => ({ items: [{ label: "More", items: [{ label: "Edit", command }] }] }),
      template: '<WlDialog visible :motion="false" aria-label="Modal"><WlContextMenu :items="items" :motion="false"><template #trigger="{ attrs }"><button data-context-target v-bind="attrs">Target</button></template></WlContextMenu></WlDialog>'
    });
    const wrapper = mount(Harness, { attachTo: document.body });
    wrappers.push(wrapper);
    await flushPromises();
    const target = document.querySelector<HTMLButtonElement>("[data-context-target]")!;
    target.dispatchEvent(new MouseEvent("contextmenu", { clientX: 90, clientY: 140, bubbles: true, cancelable: true }));
    await flushPromises();
    const parent = document.querySelector<HTMLElement>('[role="menuitem"]')!;
    expect(parent.closest("[inert]")).toBeNull();
    parent.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await flushPromises();
    const child = [...document.querySelectorAll<HTMLElement>('[role="menuitem"]')].find((entry) => entry.textContent?.trim() === "Edit")!;
    expect(child.closest("[inert]")).toBeNull();
    child.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    child.click();
    await flushPromises();
    expect(command).toHaveBeenCalledTimes(1);
    expect(document.querySelector('[role="menu"]')).toBeNull();
    expect(document.querySelector('[role="dialog"]')).toBeTruthy();
    expect(document.activeElement).toBe(target);
  });
});
