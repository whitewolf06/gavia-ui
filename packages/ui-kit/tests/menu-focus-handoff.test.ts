import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { defineComponent, nextTick } from "vue";
import { WlContextMenu, WlMenu, type WlMenuItem } from "../src";

const wrappers: VueWrapper[] = [];
const items: WlMenuItem[] = [
  { header: "Actions" },
  { label: "Unavailable", disabled: true },
  { label: "First" },
  { separator: true },
  { label: "Last" },
  { label: "Unavailable last", disabled: true }
];
const realTransition = { stubs: { transition: false } };

afterEach(async () => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount());
  await flushPromises();
  document.body.replaceChildren();
});

async function settleMount(): Promise<void> {
  await flushPromises();
  await nextTick();
}

function key(target: Element, value: string, shiftKey = false): KeyboardEvent {
  const event = new KeyboardEvent("keydown", { key: value, shiftKey, bubbles: true, cancelable: true });
  target.dispatchEvent(event);
  return event;
}

function menuItem(label: string): HTMLElement {
  return [...document.querySelectorAll<HTMLElement>('[role="menuitem"]')]
    .find((element) => element.textContent?.trim() === label)!;
}

function mountPopup(): VueWrapper {
  const Harness = defineComponent({
    components: { WlMenu },
    setup: () => ({ items }),
    template: '<WlMenu popup :items="items"><template #trigger="{ attrs }"><button data-open v-bind="attrs">Actions</button></template></WlMenu><button data-after>After</button>'
  });
  const wrapper = mount(Harness, { attachTo: document.body, global: realTransition });
  wrappers.push(wrapper);
  return wrapper;
}

describe("menu focus after the rendered content handoff", () => {
  it.each(["ContextMenu", "F10"])("focuses the first enabled context item after a settled mount and %s, including reopening", async (value) => {
    const wrapper = mount(WlContextMenu, { attachTo: document.body, global: realTransition, props: { items } });
    wrappers.push(wrapper);
    await settleMount();
    const trigger = wrapper.get('[data-wl="context-menu"]').element as HTMLElement;
    trigger.focus();
    expect(key(trigger, value, value === "F10").defaultPrevented).toBe(true);
    await flushPromises();
    const first = menuItem("First");
    expect(first).toBeTruthy();
    expect(document.activeElement).toBe(first);
    expect(first.tabIndex).toBe(0);
    expect(wrapper.emitted("open")).toHaveLength(1);

    key(first, "Escape");
    await settleMount();
    expect(document.activeElement).toBe(trigger);
    key(trigger, value, value === "F10");
    await flushPromises();
    expect(document.activeElement).toBe(menuItem("First"));
    expect(wrapper.emitted("open")).toHaveLength(2);
  });

  it.each([["ArrowDown", "First"], ["ArrowUp", "Last"]])("preserves popup %s focus intent with real transitions and disabled boundaries", async (value, expectedLabel) => {
    const wrapper = mountPopup();
    await settleMount();
    const trigger = wrapper.get("[data-open]").element as HTMLElement;
    trigger.focus();
    key(trigger, value);
    await flushPromises();
    expect(document.activeElement).toBe(menuItem(expectedLabel));
    expect(wrapper.getComponent({ name: "WlMenu" }).emitted("open")).toHaveLength(1);

    key(menuItem(expectedLabel), "Escape");
    await settleMount();
    expect(document.activeElement).toBe(trigger);
    key(trigger, value);
    await flushPromises();
    expect(document.activeElement).toBe(menuItem(expectedLabel));
    expect(wrapper.getComponent({ name: "WlMenu" }).emitted("open")).toHaveLength(2);
  });

  it("does not focus stale context content when closed before the render flush", async () => {
    const wrapper = mount(WlContextMenu, { attachTo: document.body, global: realTransition, props: { items } });
    wrappers.push(wrapper);
    await settleMount();
    const trigger = wrapper.get('[data-wl="context-menu"]').element as HTMLElement;
    const after = document.createElement("button");
    document.body.append(after);
    trigger.focus();
    key(trigger, "F10", true);
    wrapper.vm.hide();
    after.focus();
    await settleMount();
    expect(document.querySelector('[role="menu"]')).toBeNull();
    expect(document.activeElement).toBe(after);
    expect(wrapper.emitted("open")).toBeUndefined();

    key(trigger, "F10", true);
    await flushPromises();
    expect(document.activeElement).toBe(menuItem("First"));
    expect(wrapper.emitted("open")).toHaveLength(1);
  });

  it("cancels a pending popup handoff and uses the newest intent after reopening", async () => {
    const wrapper = mountPopup();
    await settleMount();
    const trigger = wrapper.get("[data-open]").element as HTMLElement;
    const after = wrapper.get("[data-after]").element as HTMLElement;
    trigger.focus();
    key(trigger, "ArrowDown");
    wrapper.getComponent({ name: "WlMenu" }).vm.hide();
    after.focus();
    await settleMount();
    expect(document.querySelector('[role="menu"]')).toBeNull();
    expect(document.activeElement).toBe(after);
    expect(wrapper.getComponent({ name: "WlMenu" }).emitted("open")).toBeUndefined();

    key(trigger, "ArrowUp");
    await flushPromises();
    expect(document.activeElement).toBe(menuItem("Last"));
    expect(wrapper.getComponent({ name: "WlMenu" }).emitted("open")).toHaveLength(1);
  });
});
