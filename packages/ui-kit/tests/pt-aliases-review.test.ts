import { mount } from "@vue/test-utils";
import { afterEach, expect, it, vi } from "vitest";
import { normalizeClass } from "vue";
import { createWlPt, WlConfig, WlInput, type WlPtCallbackOptions, type WlPtConfigStrict, WlTabs } from "../src";
import { resolveWlPt } from "../src/config";

afterEach(() => {
  vi.restoreAllMocks();
});

it("accepts canonical component and nested names in the strict public type", () => {
  const configuration = { input: { root: { "data-source": "input" } },
    dialog: { closeButton: { root: { "data-source": "close" } } },
    tabs: { panels: { root: { "data-source": "panels" } } }
  } satisfies WlPtConfigStrict;
  const wrapper = mount(WlInput, { global: { plugins: [[WlConfig, { pt: configuration }]] } });
  expect(wrapper.get("input").attributes("data-source")).toBe("input");
  wrapper.unmount();
  expect(resolveWlPt("dialog", "pcCloseButton.root", { pt: configuration })["data-source"]).toBe("close");
});

it("merges old and canonical attrs in each layer, with local overrides last", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const config = { pt: { inputtext: { root: { class: "old", title: "old" } }, input: { root: { class: "new", title: "new" } } } };
  const local = { root: { class: "local", title: "local" } };
  const first = resolveWlPt("inputtext", "root", config, local);
  resolveWlPt("inputtext", "root", config, local);
  expect(normalizeClass(first.class)).toContain("old new local");
  expect(first.title).toBe("local");
  expect(warn).toHaveBeenCalledTimes(1);
});

it("does not warn for generated defaults, but does for explicit legacy overrides", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  resolveWlPt("inputtext", "root", { pt: createWlPt() });
  expect(warn).not.toHaveBeenCalled();
  resolveWlPt("inputtext", "root", { pt: createWlPt({ inputtext: { root: { title: "legacy" } } }) });
  expect(warn).toHaveBeenCalledTimes(1);
});

it("uses canonical application and local panel names for Tabs", () => {
  const wrapper = mount(WlTabs, { props: { items: [{ key: "one", label: "One" }], modelValue: "one", pt: { panel: { root: { "data-local": "yes" } } } },
    global: { plugins: [[WlConfig, { pt: { tabs: { panels: { root: { "data-panels": "yes" } } } } }]] } });
  expect(wrapper.get(".wl-tabs__panels").attributes("data-panels")).toBe("yes");
  expect(wrapper.get('[role="tabpanel"]').attributes("data-local")).toBe("yes");
  wrapper.unmount();
});

it("merges mixed local Tabs panel aliases with callbacks and warns once per legacy container", async () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const oldPanels = vi.fn(({ context }: WlPtCallbackOptions) => ({ class: "old-panels", style: { color: "red" }, "data-old-panels": String(context.active), title: "old" }));
  const canonicalPanels = vi.fn(({ context }: WlPtCallbackOptions) => ({ class: "new-panels", style: { backgroundColor: "blue" }, "data-new-panels": String(context.active), title: "new" }));
  const oldPanel = vi.fn(({ context }: WlPtCallbackOptions) => ({ class: "old-panel", style: { color: "red" }, "data-old-panel": String(context.selected), title: "old" }));
  const canonicalPanel = vi.fn(({ context }: WlPtCallbackOptions) => ({ class: "new-panel", style: { backgroundColor: "blue" }, "data-new-panel": String(context.selected), title: "new" }));
  const wrapper = mount(WlTabs, { props: {
    items: [{ key: "one", label: "One" }, { key: "two", label: "Two", disabled: true }],
    pt: { tabpanels: { root: oldPanels }, panels: { root: canonicalPanels }, tabpanel: { root: oldPanel }, panel: { root: canonicalPanel } }
  } });
  try {
    const panels = wrapper.get(".wl-tabs__panels");
    const panel = wrapper.get('[role="tabpanel"]');
    expect(panels.classes()).toEqual(expect.arrayContaining(["old-panels", "new-panels"]));
    expect(panel.classes()).toEqual(expect.arrayContaining(["old-panel", "new-panel"]));
    for (const element of [panels, panel]) {
      expect(element.attributes("style")).toContain("color: red");
      expect(element.attributes("style")).toContain("background-color: blue");
      expect(element.attributes("title")).toBe("new");
    }
    expect(oldPanels).toHaveBeenCalledWith({ context: { active: true } });
    expect(canonicalPanels).toHaveBeenCalledWith({ context: { active: true } });
    expect(oldPanel).toHaveBeenCalledWith({ context: { active: true, selected: true, disabled: false } });
    expect(canonicalPanel).toHaveBeenCalledWith({ context: { active: false, selected: false, disabled: true } });
    expect(warn.mock.calls.map(([message]) => message)).toEqual(expect.arrayContaining([
      expect.stringContaining("pt.tabpanels is deprecated; use pt.panels"),
      expect.stringContaining("pt.tabpanel is deprecated; use pt.panel")
    ]));
    expect(warn).toHaveBeenCalledTimes(2);
    await wrapper.setProps({ orientation: "vertical" });
    expect(warn).toHaveBeenCalledTimes(2);
  } finally { wrapper.unmount(); }
});
