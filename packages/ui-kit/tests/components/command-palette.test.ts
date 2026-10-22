import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick, reactive, ref } from "vue";
import type { WlCommandPaletteGroup, WlConfigOptions } from "../../src";
import { WlCommandPalette, WlConfig, wlLocaleEn, wlLocaleRu } from "../../src";

const groups: WlCommandPaletteGroup[] = [
  {
    id: "pages",
    label: "Страницы",
    items: [
      { id: "home", label: "Главная", icon: "file", href: "#home" },
      { id: "settings", label: "Настройки", icon: "edit", keywords: ["параметры"] }
    ]
  },
  {
    id: "components",
    label: "Компоненты",
    showWhenEmpty: false,
    items: [
      { id: "button", label: "WlButton", description: "Кнопка действия" },
      { id: "input", label: "WlInput", description: "Текстовое поле" }
    ]
  }
];

const global = {
  stubs: {
    Teleport: true
  }
};

enableAutoUnmount(afterEach);

describe("WlCommandPalette", () => {
  it("completes the open lifecycle when initially visible", async () => {
    const wrapper = mount(WlCommandPalette, {
      global,
      attachTo: document.body,
      props: { visible: true, groups }
    });
    await nextTick();
    await nextTick();
    expect(wrapper.get('[data-wl="command-palette"]').attributes("aria-label")).toBe("Command palette");
    expect(wrapper.get("input").attributes("placeholder")).toBe("Search or navigate…");
    expect(wrapper.emitted("open")).toHaveLength(1);
    expect(document.activeElement).toBe(wrapper.find("input").element);
    expect(document.body.style.overflow).toBe("hidden");

    await wrapper.setProps({ visible: false });
    await nextTick();
    expect(wrapper.emitted("close")).toHaveLength(1);
    expect(document.body.style.overflow).toBe("");
  });

  it("updates locale text and preserves explicit labels, empty text and undefined fallback", async () => {
    const config = reactive<WlConfigOptions>({ locale: wlLocaleRu });
    const wrapper = mount(WlCommandPalette, {
      global: { ...global, plugins: [[WlConfig, config]] },
      props: { visible: true }
    });
    const root = () => wrapper.get('[data-wl="command-palette"]');
    const input = () => wrapper.get("input");
    const status = () => wrapper.get(".wl-command-palette__status").text();
    expect(root().attributes("aria-label")).toBe("Командная палитра");
    expect(input().attributes("aria-label")).toBe("Командная палитра");
    expect(input().attributes("placeholder")).toBe("Поиск или переход…");
    expect(status()).toBe("Ничего не найдено");
    await wrapper.setProps({ loading: true });
    expect(status()).toBe("Поиск…");

    await wrapper.setProps({ ariaLabel: "Командная палитра", placeholder: "Поиск или переход…", emptyText: "Ничего не найдено", loadingText: "Поиск…" });
    config.locale = wlLocaleEn;
    await nextTick();
    expect(root().attributes("aria-label")).toBe("Командная палитра");
    expect(input().attributes("aria-label")).toBe("Командная палитра");
    expect(input().attributes("placeholder")).toBe("Поиск или переход…");
    expect(status()).toBe("Поиск…");
    await wrapper.setProps({ loading: false });
    expect(status()).toBe("Ничего не найдено");

    await wrapper.setProps({ ariaLabel: "", placeholder: "", emptyText: "", loadingText: "" });
    expect(root().attributes("aria-label")).toBe("");
    expect(input().attributes("aria-label")).toBe("");
    expect(input().attributes("placeholder")).toBe("");
    expect(status()).toBe("");
    await wrapper.setProps({ loading: true });
    expect(status()).toBe("");

    await wrapper.setProps({ ariaLabel: undefined, placeholder: undefined, emptyText: undefined, loadingText: undefined });
    expect(root().attributes("aria-label")).toBe("Command palette");
    expect(input().attributes("aria-label")).toBe("Command palette");
    expect(input().attributes("placeholder")).toBe("Search or navigate…");
    expect(status()).toBe("Searching…");
    await wrapper.setProps({ loading: false });
    expect(status()).toBe("Nothing found");

    config.locale = wlLocaleRu;
    await nextTick();
    expect(root().attributes("aria-label")).toBe("Командная палитра");
    expect(input().attributes("placeholder")).toBe("Поиск или переход…");
    expect(status()).toBe("Ничего не найдено");
  });

  it("closes and releases the scroll lock when disabled while open", async () => {
    const wrapper = mount(WlCommandPalette, {
      global,
      props: { visible: true, groups }
    });
    await nextTick();
    await wrapper.setProps({ disabled: true });
    await nextTick();
    const visibleUpdates = wrapper.emitted("update:visible") ?? [];
    expect(visibleUpdates[visibleUpdates.length - 1]).toEqual([false]);
    expect(document.body.style.overflow).toBe("");
  });
  it("shows quick links before input and filters every group with one query", async () => {
    const wrapper = mount(WlCommandPalette, {
      global,
      props: { visible: true, groups }
    });

    expect(wrapper.findAll(".wl-command-palette__group-label").map((node) => node.text())).toEqual([
      "Страницы"
    ]);

    await wrapper.find("input").setValue("button");
    await nextTick();

    expect(wrapper.findAll(".wl-command-palette__group-label").map((node) => node.text())).toEqual([
      "Компоненты"
    ]);
    expect(wrapper.findAll(".wl-command-palette__item")).toHaveLength(1);
    expect(wrapper.find(".wl-command-palette__item").text()).toContain("WlButton");
    const searches = wrapper.emitted("search") ?? [];
    expect(searches[searches.length - 1]).toEqual(["button"]);
  });

  it("emits the selected item and group without performing business actions", async () => {
    const wrapper = mount(WlCommandPalette, {
      global,
      props: { visible: true, groups }
    });

    await wrapper.findAll(".wl-command-palette__item")[1]!.trigger("click");

    const selection = wrapper.emitted("select")?.[0];
    expect(selection?.[0]).toMatchObject({ id: "settings" });
    expect(selection?.[1]).toMatchObject({ id: "pages" });
    const visibleUpdates = wrapper.emitted("update:visible") ?? [];
    expect(visibleUpdates[visibleUpdates.length - 1]).toEqual([false]);
  });

  it("supports arrow navigation and Enter", async () => {
    const wrapper = mount(WlCommandPalette, {
      global,
      props: { visible: true, groups }
    });
    const panel = wrapper.find(".wl-command-palette__panel");

    await panel.trigger("keydown", { key: "ArrowDown" });
    await panel.trigger("keydown", { key: "Enter" });

    expect(wrapper.emitted("select")?.[0]?.[0]).toMatchObject({ id: "settings" });
  });

  it("tracks pointer and focus navigation, scrolls active commands and adjusts to changing results", async () => {
    const available: WlCommandPaletteGroup[] = [{ id: "actions", label: "Actions", items: [
      { id: "alpha", label: "Alpha" }, { id: "beta", label: "Beta" }, { id: "gamma", label: "Gamma" }
    ] }];
    const wrapper = mount(WlCommandPalette, {
      global, attachTo: document.body, props: { visible: true, groups: available, motion: false, closeOnSelect: false }
    });
    await nextTick();
    const options = wrapper.findAll('[role="option"]');
    const input = wrapper.get("input");
    await options[2]!.trigger("mouseenter");
    expect(input.attributes("aria-activedescendant")).toBe(options[2]!.attributes("id"));
    await options[1]!.trigger("focus");
    expect(input.attributes("aria-activedescendant")).toBe(options[1]!.attributes("id"));
    const scroll = vi.fn();
    Object.defineProperty(options[0]!.element, "scrollIntoView", { value: scroll, configurable: true });
    await input.trigger("keydown", { key: "ArrowUp" });
    expect(input.attributes("aria-activedescendant")).toBe(options[0]!.attributes("id"));
    expect(scroll).toHaveBeenCalledWith({ block: "nearest" });
    await input.trigger("keydown", { key: "ArrowUp" });
    expect(input.attributes("aria-activedescendant")).toBe(options[2]!.attributes("id"));

    await wrapper.setProps({ groups: [{ ...available[0]!, items: [available[0]!.items[1]!] }] });
    expect(wrapper.get("input").attributes("aria-activedescendant")).toBe(wrapper.get('[role="option"]').attributes("id"));
    expect(wrapper.get('[aria-selected="true"]').text()).toContain("Beta");
    await wrapper.setProps({ groups: [{ id: "disabled", label: "Disabled", items: [{ id: "locked", label: "Locked", disabled: true }] }] });
    expect(wrapper.get("input").attributes("aria-activedescendant")).toBeUndefined();
    await wrapper.get("input").trigger("keydown", { key: "ArrowDown" });
    await wrapper.get("input").trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("select")).toBeUndefined();
    expect(wrapper.get('[role="option"]').attributes("aria-disabled")).toBe("true");
    await wrapper.setProps({ groups: [] });
    expect(wrapper.get(".wl-command-palette__status").text()).toBe("Nothing found");
    await wrapper.get('[data-wl="command-palette"]').trigger("mousedown");
    expect(wrapper.emitted("update:visible")?.at(-1)).toEqual([false]);
  });

  it("opens and focuses through its public methods while respecting disabled state", async () => {
    const wrapper = mount(WlCommandPalette, { global, attachTo: document.body, props: { groups, motion: false } });
    wrapper.vm.open();
    await nextTick();
    await nextTick();
    const input = wrapper.get("input").element;
    expect(wrapper.emitted("update:visible")?.at(-1)).toEqual([true]);
    (input as HTMLInputElement).blur();
    wrapper.vm.focus();
    expect(document.activeElement).toBe(input);
    await wrapper.setProps({ disabled: true });
    wrapper.vm.open();
    await nextTick();
    expect(wrapper.find("input").exists()).toBe(false);
    expect(wrapper.emitted("update:visible")?.at(-1)).toEqual([false]);
  });

  it("can delegate filtering to a consumer", async () => {
    const externalGroups: WlCommandPaletteGroup[] = [
      groups[0]!,
      { ...groups[1]!, filter: false }
    ];
    const wrapper = mount(WlCommandPalette, {
      global,
      props: { visible: true, groups: externalGroups }
    });

    await wrapper.find("input").setValue("remote response");
    await nextTick();

    expect(wrapper.findAll(".wl-command-palette__item")).toHaveLength(2);
    expect(wrapper.find(".wl-command-palette__group-label").text()).toBe("Компоненты");
  });

  it("opens through the opt-in Ctrl/Cmd+K shortcut", async () => {
    const wrapper = mount(WlCommandPalette, {
      global,
      props: { groups, shortcut: true }
    });

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
    await nextTick();

    const visibleUpdates = wrapper.emitted("update:visible") ?? [];
    expect(visibleUpdates[visibleUpdates.length - 1]).toEqual([true]);
  });

  it("forwards class, style and accessible labeling to the teleported root", () => {
    const wrapper = mount(WlCommandPalette, {
      global,
      attrs: { class: "consumer-class", style: "width: 100%" },
      props: { visible: true, groups, ariaLabel: "Глобальный поиск" }
    });

    const root = wrapper.find('[data-wl="command-palette"]');
    expect(root.classes()).toContain("consumer-class");
    expect(root.attributes("style")).toContain("width: 100%");
    expect(root.attributes("aria-label")).toBe("Глобальный поиск");
  });
  it("creates unique listbox relationships and exposes the active option", async () => {
    const Harness = defineComponent({
      components: { WlCommandPalette },
      setup: () => ({ groups }),
      template:
        '<WlCommandPalette visible :groups="groups" /><WlCommandPalette visible :groups="groups" />'
    });
    const wrapper = mount(Harness, { global });
    await nextTick();
    const palettes = wrapper.findAllComponents(WlCommandPalette);
    const first = palettes[0]!;
    const second = palettes[1]!;
    const firstInput = first.find("input");
    const secondInput = second.find("input");

    expect(firstInput.attributes("aria-controls")).not.toBe(
      secondInput.attributes("aria-controls")
    );
    expect(first.find("input").attributes("aria-activedescendant")).toBe(
      first.find('[aria-selected="true"]').attributes("id")
    );

    await first.find(".wl-command-palette__panel").trigger("keydown", { key: "ArrowDown" });
    await nextTick();
    expect(first.find("input").attributes("aria-activedescendant")).toBe(
      first.find('[aria-selected="true"]').attributes("id")
    );
  });

  it("restores focus to the opener after closing", async () => {
    const opener = document.createElement("button");
    document.body.appendChild(opener);
    opener.focus();
    const wrapper = mount(WlCommandPalette, {
      global,
      attachTo: document.body,
      props: { visible: false, groups }
    });

    await wrapper.setProps({ visible: true });
    await nextTick();
    await nextTick();
    expect(document.activeElement).toBe(wrapper.find("input").element);
    await wrapper.setProps({ visible: false });
    await nextTick();
    expect(document.activeElement).toBe(opener);

    wrapper.unmount();
    opener.remove();
  });

  it("keeps nested overlays locked and closes only the topmost layer", async () => {
    const Harness = defineComponent({
      components: { WlCommandPalette },
      setup() {
        return { first: ref(false), second: ref(false), groups };
      },
      template: `
        <WlCommandPalette v-model:visible="first" :groups="groups" aria-label="First" />
        <WlCommandPalette v-model:visible="second" :groups="groups" aria-label="Second" />
      `
    });
    const wrapper = mount(Harness, { global, attachTo: document.body });
    const vm = wrapper.vm as unknown as { first: boolean; second: boolean };

    vm.first = true;
    await nextTick();
    await nextTick();
    const firstInput = wrapper.findAllComponents(WlCommandPalette)[0]!.find("input").element;
    expect(document.activeElement).toBe(firstInput);

    vm.second = true;
    await nextTick();
    await nextTick();
    expect(document.body.style.overflow).toBe("hidden");

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await nextTick();
    await nextTick();
    expect(vm.first).toBe(true);
    expect(vm.second).toBe(false);
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.activeElement).toBe(firstInput);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await nextTick();
    await nextTick();
    expect(vm.first).toBe(false);
    expect(document.body.style.overflow).toBe("");
    wrapper.unmount();
  });

  it("does not finish opening after a same-tick close", async () => {
    const Harness = defineComponent({
      components: { WlCommandPalette },
      setup() {
        return { visible: ref(true), openCount: ref(0), groups };
      },
      template:
        '<WlCommandPalette v-model:visible="visible" :groups="groups" @open="openCount++" />'
    });
    const wrapper = mount(Harness, { global, attachTo: document.body });
    const vm = wrapper.vm as unknown as { visible: boolean; openCount: number };
    vm.visible = false;
    await nextTick();
    await nextTick();

    expect(vm.openCount).toBe(0);
    expect(document.body.style.overflow).toBe("");
    expect(wrapper.find("input").exists()).toBe(false);
    wrapper.unmount();
  });

  it("wraps focus between the combobox and a footer action while skipping disabled and negative tab stops", async () => {
    const focusGroups: WlCommandPaletteGroup[] = [{
      ...groups[0]!,
      items: [groups[0]!.items[0]!, { id: "disabled", label: "Unavailable", disabled: true }, groups[0]!.items[1]!]
    }];
    const wrapper = mount(WlCommandPalette, {
      global,
      attachTo: document.body,
      props: { visible: true, groups: focusGroups },
      slots: {
        footer: `<button type="button" data-footer-action>Help</button>
          <button type="button" disabled>Unavailable action</button>
          <button type="button" tabindex="-1">Programmatic action</button>`
      }
    });
    await nextTick();
    await nextTick();
    const input = wrapper.find("input");
    const items = wrapper.findAll(".wl-command-palette__item");
    const footer = wrapper.get("[data-footer-action]");

    expect(document.activeElement).toBe(input.element);
    expect(items.map((item) => item.attributes("tabindex"))).toEqual(["-1", "-1", "-1"]);
    expect(items[1]!.attributes("aria-disabled")).toBe("true");
    await input.trigger("keydown", { key: "ArrowDown" });
    expect(input.attributes("aria-activedescendant")).toBe(items[2]!.attributes("id"));
    expect(document.activeElement).toBe(input.element);

    const reverseTab = new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true, cancelable: true });
    input.element.dispatchEvent(reverseTab);
    expect(reverseTab.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(footer.element);

    const forwardTab = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    footer.element.dispatchEvent(forwardTab);
    expect(forwardTab.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(input.element);
    wrapper.unmount();
  });
});
