import type { GlobalMountOptions } from "./mounting-types";
import { describe, it, expect, afterAll } from "vitest";
import { mount } from "@vue/test-utils";
import { WlConfig } from "../src";
import { WlTabs } from "../src";
import type { WlTabItem } from "../src";

const global: GlobalMountOptions = { plugins: [[WlConfig]] };

const items: WlTabItem[] = [
  { key: "tasks", label: "Задачи", count: 3 },
  { key: "notes", label: "Заметки" },
  { key: "calendar", label: "Календарь" }
];

const panelSlot =
  '<template #panel="{ item }"><div class="demo-panel">{{ item.label }} — контент</div></template>';

// PrimeVue TabList updates its ink bar in a 150ms setTimeout after mount;
// let those timers fire while the jsdom environment is still alive.
afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));
});

describe("WlTabs", () => {
  it("renders all items", () => {
    const wrapper = mount(WlTabs, {
      global,
      props: { items, modelValue: "tasks" },
      slots: { panel: panelSlot }
    });
    const tabs = wrapper.findAll(".wl-tab");
    expect(tabs).toHaveLength(3);
    expect(tabs[0]!.text()).toContain("Задачи");
    expect(tabs[1]!.text()).toContain("Заметки");
    expect(tabs[2]!.text()).toContain("Календарь");
  });

  it("renders count badge", () => {
    const wrapper = mount(WlTabs, {
      global,
      props: { items, modelValue: "tasks" },
      slots: { panel: panelSlot }
    });
    expect(wrapper.find(".wl-tab__count").text()).toBe("3");
  });

  it("activates an item on click", async () => {
    const wrapper = mount(WlTabs, {
      global,
      props: { items, modelValue: "tasks" },
      slots: { panel: panelSlot }
    });
    const tabs = wrapper.findAll(".wl-tab");
    await tabs[1]!.trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["notes"]);
  });

  it("renders the panel slot for the active item", async () => {
    const wrapper = mount(WlTabs, {
      global,
      props: { items, modelValue: "tasks" },
      slots: { panel: panelSlot }
    });
    const panel = wrapper.find(".demo-panel");
    expect(panel.exists()).toBe(true);
    expect(panel.text()).toContain("Задачи");
    expect(panel.isVisible()).toBe(true);

    await wrapper.setProps({ modelValue: "notes" });
    const updated = wrapper.findAll(".demo-panel");
    const visible = updated.filter((p) => p.isVisible());
    expect(visible).toHaveLength(1);
    expect(visible[0]!.text()).toContain("Заметки");
  });
});
