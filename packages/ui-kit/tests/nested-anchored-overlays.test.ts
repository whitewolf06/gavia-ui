import { afterEach, describe, expect, it } from "vitest";
import { defineComponent, nextTick, ref } from "vue";
import { mount, type VueWrapper } from "@vue/test-utils";
import { WlConfig, WlDatePicker, WlDialog, WlPopover, WlSelect } from "../src";

const wrappers: VueWrapper[] = [];
afterEach(async () => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount());
  await nextTick();
  document.body.innerHTML = "";
});

function harness(modal = false) {
  const Component = defineComponent({
    components: { WlDatePicker, WlDialog, WlPopover, WlSelect },
    setup() {
      return { modal: ref(false), value: ref("all"), date: ref("2026-10-05"), child: ref(true), dismissable: ref(true), escape: ref(true),
        options: [{ value: "all", label: "All items" }, { value: "task_deadline", label: "Task deadlines" }] };
    },
    template: `
      <button class="modal-anchor" @click="modal = true">Open dialog</button>
      ${modal ? '<WlDialog v-model:visible="modal" header="Outer dialog" :motion="false">' : '<section>'}
        <button class="parent-anchor" @click="$refs.parent.show($event)">Filters</button>
        <WlPopover ref="parent" aria-label="Filters" :dismissable="dismissable" :close-on-escape="escape" :motion="false">
          <WlSelect v-if="child" v-model="value" :options="options" option-label="label" option-value="value" aria-label="Item type" :motion="false" />
          <WlDatePicker v-model="date" aria-label="Item date" :motion="false" />
          <button class="nested-anchor" @click="$refs.nested.show($event)">Nested</button>
          <WlPopover ref="nested" aria-label="Nested" :motion="false">
            <button class="nested-action">Child action</button>
            <WlSelect v-model="value" :options="options" option-label="label" option-value="value" aria-label="Deep type" :motion="false" />
          </WlPopover>
        </WlPopover>
      ${modal ? '</WlDialog>' : '</section>'}
      <button class="sibling-anchor" @click="$refs.sibling.show($event)">Independent</button>
      <WlPopover ref="sibling" aria-label="Independent" :close-on-escape="false" :motion="false"><button class="sibling-action">Independent action</button></WlPopover>
      <output>{{ value }}</output>`
  });
  const wrapper = mount(Component, { attachTo: document.body, global: { plugins: [[WlConfig, { motion: false }]] } });
  wrappers.push(wrapper);
  return wrapper;
}

function element(selector: string): HTMLElement {
  const found = document.body.querySelector<HTMLElement>(selector);
  expect(found, selector).not.toBeNull();
  return found!;
}
async function click(selector: string) {
  const target = element(selector);
  target.focus();
  target.click();
  await nextTick();
}
async function pointer(target: HTMLElement) {
  target.dispatchEvent(new Event("pointerdown", { bubbles: true }));
  await nextTick();
}
async function escape(target: HTMLElement) {
  const event = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
  target.dispatchEvent(event);
  await nextTick();
  return event;
}

describe("nested anchored portals", () => {
  it("keeps the parent through real pointerdown before the Select mousedown selection", async () => {
    const wrapper = harness();
    await click(".parent-anchor");
    await click('[aria-label="Item type"]');
    const option = element('[role="option"][data-selected="false"]');
    await pointer(option);
    expect(document.body.querySelector('.wl-popover[aria-label="Filters"]')).not.toBeNull();
    expect(option.isConnected).toBe(true);
    option.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
    await nextTick();
    expect(wrapper.get("output").text()).toBe("task_deadline");
    expect(document.body.querySelector('[role="listbox"]')).toBeNull();
    expect(document.body.querySelector('.wl-popover[aria-label="Filters"]')).not.toBeNull();
    expect(document.activeElement).toBe(element('[aria-label="Item type"]'));
  });

  it("recognizes descendant portals transitively and dismisses every layer on a real outside pointer", async () => {
    harness();
    await click(".parent-anchor");
    await click(".nested-anchor");
    await click('[aria-label="Deep type"]');
    await pointer(element('[role="option"][data-selected="false"]'));
    expect(document.body.querySelectorAll(".wl-popover")).toHaveLength(2);
    expect(document.body.querySelector('[role="listbox"]')).not.toBeNull();
    await pointer(element(".modal-anchor"));
    expect(document.body.querySelectorAll(".wl-popover")).toHaveLength(0);
    expect(document.body.querySelector('[role="listbox"]')).toBeNull();
  });

  it("consumes only the Escape that closes an open Select before document listeners", async () => {
    harness();
    await click(".parent-anchor");
    await click('[aria-label="Item type"]');
    const root = element('[aria-label="Item type"]');
    expect((await escape(root)).defaultPrevented).toBe(true);
    expect(document.body.querySelector('[role="listbox"]')).toBeNull();
    expect(document.body.querySelector('.wl-popover[aria-label="Filters"]')).not.toBeNull();
    expect(document.activeElement).toBe(root);
    await escape(root);
    expect(document.body.querySelector(".wl-popover")).toBeNull();
    expect(document.activeElement).toBe(element(".parent-anchor"));
  });

  it("closes only the top layer inside a Dialog including arbitrary child-button focus", async () => {
    harness(true);
    await click(".modal-anchor");
    await click(".parent-anchor");
    await click('[aria-label="Item type"]');
    await escape(element('[aria-label="Item type"]'));
    expect(document.body.querySelector('[data-wl="dialog"]')).not.toBeNull();
    expect(document.body.querySelector('.wl-popover[aria-label="Filters"]')).not.toBeNull();
    await click(".nested-anchor");
    const child = element(".nested-action");
    child.focus();
    await escape(child);
    expect(document.body.querySelector('.wl-popover[aria-label="Nested"]')).toBeNull();
    expect(document.body.querySelector('.wl-popover[aria-label="Filters"]')).not.toBeNull();
    expect(document.body.querySelector('[data-wl="dialog"]')).not.toBeNull();
    await escape(element(".nested-anchor"));
    expect(document.body.querySelector(".wl-popover")).toBeNull();
    expect(document.body.querySelector('[data-wl="dialog"]')).not.toBeNull();
    await escape(element(".parent-anchor"));
    expect(document.body.querySelector('[data-wl="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(element(".modal-anchor"));
  });

  it("treats independent portals as outside and preserves disabled dismissal policies", async () => {
    const wrapper = harness();
    await click(".parent-anchor");
    await click(".sibling-anchor");
    await pointer(element(".sibling-action"));
    expect(document.body.querySelector('.wl-popover[aria-label="Filters"]')).toBeNull();
    expect(document.body.querySelector('.wl-popover[aria-label="Independent"]')).not.toBeNull();
    await escape(element(".sibling-action"));
    expect(document.body.querySelector('.wl-popover[aria-label="Independent"]')).not.toBeNull();
    await pointer(element(".modal-anchor"));
    wrapper.vm.dismissable = false;
    wrapper.vm.escape = false;
    await nextTick();
    await click(".parent-anchor");
    await pointer(element(".modal-anchor"));
    await escape(element(".parent-anchor"));
    expect(document.body.querySelector('.wl-popover[aria-label="Filters"]')).not.toBeNull();
  });

  it("removes an unmounted child from the shared Escape order", async () => {
    const wrapper = harness();
    await click(".parent-anchor");
    await click('[aria-label="Item type"]');
    wrapper.vm.child = false;
    await nextTick();
    expect(document.body.querySelector('[role="listbox"]')).toBeNull();
    await escape(element(".nested-anchor"));
    expect(document.body.querySelector(".wl-popover")).toBeNull();
  });

  it("forwards DatePicker's local Escape only while its calendar is open", async () => {
    harness(true);
    await click(".modal-anchor");
    await click(".parent-anchor");
    await click('[aria-label="Item date"]');
    const input = element('[aria-label="Item date"]');
    expect(document.body.querySelector('.wl-dp__panel')).not.toBeNull();
    expect((await escape(input)).defaultPrevented).toBe(true);
    expect(document.body.querySelector('.wl-dp__panel')).toBeNull();
    expect(document.body.querySelector('.wl-popover[aria-label="Filters"]')).not.toBeNull();
    expect(document.body.querySelector('[data-wl="dialog"]')).not.toBeNull();
    await escape(input);
    expect(document.body.querySelector('.wl-popover')).toBeNull();
    expect(document.body.querySelector('[data-wl="dialog"]')).not.toBeNull();
  });

  it("keeps the modal Tab trap active while an anchored child is open", async () => {
    harness(true);
    await click(".modal-anchor");
    await click(".parent-anchor");
    await click('[aria-label="Item type"]');
    const first = element('[data-wl="dialog"] button');
    const last = element('.parent-anchor');
    last.focus();
    const tab = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    last.dispatchEvent(tab);
    await nextTick();
    expect(tab.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(first);
    expect(document.body.querySelector('[role="listbox"]')).not.toBeNull();
    first.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true, cancelable: true }));
    await nextTick();
    expect(document.activeElement).toBe(last);
    expect(document.body.querySelector('[role="listbox"]')).not.toBeNull();
  });
});
