import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick } from "vue";
import { WlMenu } from "../src";

const items = [
  { header: "Actions" },
  { key: "first", label: "First" },
  { key: "disabled", label: "Disabled", disabled: true },
  { separator: true },
  { key: "last", label: "Last" }
];

describe("Menu roving focus", () => {
  it("has one tab stop and cycles enabled items with arrows, Home and End", async () => {
    const wrapper = mount(WlMenu, { attachTo: document.body, props: { items } });
    try {
      const links = wrapper.findAll('[role="menuitem"]');
      expect(links.map((link) => link.attributes("tabindex"))).toEqual(["0", "-1", "-1"]);
      (links[0]!.element as HTMLElement).focus();
      for (const [key, index] of [["ArrowDown", 2], ["ArrowDown", 0], ["ArrowUp", 2], ["Home", 0], ["End", 2]] as const) {
        await wrapper.get('[role="menuitem"][tabindex="0"]').trigger("keydown", { key });
        expect(document.activeElement).toBe(links[index]!.element);
        expect(wrapper.findAll('[role="menuitem"][tabindex="0"]')).toHaveLength(1);
      }
    } finally { wrapper.unmount(); }
  });

  it("focuses the first enabled popup item and closes for Tab without consuming it", async () => {
    const Harness = defineComponent({
      components: { WlMenu },
      setup: () => ({ items }),
      template: '<button data-open @click="$refs.menu.show($event)">Open</button><button data-next>Next</button><WlMenu ref="menu" popup :motion="false" :items="items" />'
    });
    const wrapper = mount(Harness, { attachTo: document.body });
    try {
      await wrapper.get("[data-open]").trigger("click");
      await nextTick();
      await nextTick();
      const first = document.querySelector<HTMLElement>('[role="menuitem"][tabindex="0"]')!;
      expect(document.activeElement).toBe(first);
      const event = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
      first.dispatchEvent(event);
      await nextTick();
      expect(event.defaultPrevented).toBe(false);
      expect(document.querySelector('[role="menu"]')).toBeNull();
    } finally { wrapper.unmount(); }
  });

  it("runs command items using Enter and Space and never activates disabled items", async () => {
    const command = vi.fn();
    const wrapper = mount(WlMenu, {
      attachTo: document.body,
      props: { items: [{ label: "Action", command }, { label: "Disabled", command, disabled: true }] }
    });
    try {
      const links = wrapper.findAll('[role="menuitem"]');
      for (const key of ["Enter", " "]) await links[0]!.trigger("keydown", { key });
      expect(command).toHaveBeenCalledTimes(2);
      await links[1]!.trigger("click");
      expect(command).toHaveBeenCalledTimes(2);
    } finally { wrapper.unmount(); }
  });
});
