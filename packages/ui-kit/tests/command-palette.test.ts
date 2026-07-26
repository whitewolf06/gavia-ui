import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
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

describe("WlCommandPalette", () => {
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
});
