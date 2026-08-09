import { afterEach, describe, expect, it } from "vitest";
import { enableAutoUnmount, mount } from "@vue/test-utils";
import { defineComponent, nextTick, ref } from "vue";
import { WlCommandPalette } from "../src";
import type { WlCommandPaletteGroup } from "../src";

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
    expect(wrapper.emitted("open")).toHaveLength(1);
    expect(document.activeElement).toBe(wrapper.find("input").element);
    expect(document.body.style.overflow).toBe("hidden");

    await wrapper.setProps({ visible: false });
    await nextTick();
    expect(wrapper.emitted("close")).toHaveLength(1);
    expect(document.body.style.overflow).toBe("");
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

  it("wraps focus in both directions", async () => {
    const wrapper = mount(WlCommandPalette, {
      global,
      attachTo: document.body,
      props: { visible: true, groups }
    });
    await nextTick();
    await nextTick();
    const input = wrapper.find("input");
    const items = wrapper.findAll(".wl-command-palette__item");
    const last = items[items.length - 1]!;

    (input.element as HTMLElement).focus();
    await input.trigger("keydown", { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last.element);

    (last.element as HTMLElement).focus();
    await last.trigger("keydown", { key: "Tab" });
    expect(document.activeElement).toBe(input.element);
    wrapper.unmount();
  });
});
