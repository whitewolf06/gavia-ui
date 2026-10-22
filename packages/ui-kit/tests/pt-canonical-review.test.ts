import { mount } from "@vue/test-utils";
import { afterEach, expect, it, vi } from "vitest";
import { normalizeClass, normalizeStyle } from "vue";
import { createWlPt, WlConfig, WlInput, type WlPtCallbackOptions, type WlPtConfigStrict, WlTabs } from "../src";
import { resolveWlPt } from "../src/config";

afterEach(() => {
  vi.restoreAllMocks();
});

it("uses canonical component and nested names in the strict public type and rendered controls", () => {
  const configuration = { input: { root: { "data-source": "input" } },
    dialog: { closeButton: { root: { "data-source": "close" } } },
    tabs: { panels: { root: { "data-source": "panels" } } }
  } satisfies WlPtConfigStrict;
  const wrapper = mount(WlInput, { global: { plugins: [[WlConfig, { pt: configuration }]] } });
  try {
    expect(wrapper.get("input").attributes("data-source")).toBe("input");
    const close = resolveWlPt("dialog", "closeButton.root", { pt: configuration });
    expect(close["data-source"]).toBe("close");
    expect(normalizeClass(close.class)).toContain("wl-overlay-close");
  } finally { wrapper.unmount(); }
});

it("merges canonical default, application and local attrs with live callback context", () => {
  const app = vi.fn(({ context }: WlPtCallbackOptions) => ({ class: "app-item", style: { color: "red" }, "data-active": context.active, title: "app" }));
  const local = vi.fn(({ context }: WlPtCallbackOptions) => ({ class: { "local-active": context.active }, style: { padding: "4px" }, title: "local" }));
  const config = { pt: { segmented: { item: { root: app } } } };
  const attrs = resolveWlPt("segmented", "item.root", config, { item: { root: local } }, { active: true, disabled: false });
  expect(normalizeClass(attrs.class).split(" ")).toEqual(expect.arrayContaining(["wl-segmented__item", "is-active", "app-item", "local-active"]));
  expect(normalizeStyle(attrs.style)).toMatchObject({ color: "red", padding: "4px" });
  expect(attrs.title).toBe("local");
  expect(attrs["data-active"]).toBe(true);
  expect(app).toHaveBeenCalledWith({ context: { active: true, disabled: false } });
  expect(local).toHaveBeenCalledWith({ context: { active: true, disabled: false } });
  expect(normalizeClass(resolveWlPt("segmented", "item.root", config, undefined, { active: false }).class)).not.toContain("is-active");
});

it("does not route old component or nested aliases into canonical sections", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const config = { pt: {
    inputtext: { root: { "data-legacy": "input" } },
    dialog: { pcCloseButton: { root: { "data-legacy": "close" } } },
    tabpanels: { root: { "data-legacy": "panels" } }
  } };
  expect(resolveWlPt("input", "root", config)["data-legacy"]).toBeUndefined();
  const close = resolveWlPt("dialog", "closeButton.root", config, { pcCloseButton: { root: { "data-local-legacy": true } } });
  expect(normalizeClass(close.class)).toBe("wl-overlay-close");
  expect(close["data-legacy"]).toBeUndefined();
  expect(close["data-local-legacy"]).toBeUndefined();
  expect(resolveWlPt("tabs", "panels.root", config)["data-legacy"]).toBeUndefined();
  expect(warn).not.toHaveBeenCalled();
});

it("keeps icon-button configuration separate from button configuration", () => {
  const config = { pt: { button: { root: { "data-button": true } }, iconButton: { root: { "data-icon-button": true } } } };
  expect(resolveWlPt("iconButton", "root", config)).toEqual({ "data-icon-button": true });
  expect(resolveWlPt("iconButton", "root", { pt: { button: config.pt.button } })).toEqual({});
  expect(resolveWlPt("button", "root", config)).toEqual({ "data-button": true });
});

it("creates only canonical defaults and preserves their existing CSS class names", () => {
  const pt = createWlPt();
  expect(pt.tabs).toMatchObject({ panels: { root: { class: "wl-tabs__panels" } }, panel: { root: { class: "wl-tabs__panel" } } });
  expect(pt.dialog).toMatchObject({ closeButton: { root: { class: "wl-overlay-close" } } });
  expect(pt.multiselect).toMatchObject({ chip: { root: { class: "wl-multiselect__chip" } }, filter: { root: { class: "wl-input wl-input--sm wl-multiselect__filter" } } });
  expect(pt.table).toMatchObject({ bodyRow: { class: "wl-table__row" } });
  for (const name of ["datatable", "radiobutton", "toggleswitch", "progressbar", "selectbutton", "breadcrumb", "tablist", "tabpanels", "tabpanel"]) {
    expect(Object.keys(pt)).not.toContain(name);
  }
});

it("uses canonical application and local panel names for Tabs", () => {
  const wrapper = mount(WlTabs, { props: { items: [{ key: "one", label: "One" }], modelValue: "one", pt: { panel: { root: { "data-local": "yes" } } } },
    global: { plugins: [[WlConfig, { pt: { tabs: { panels: { root: { "data-panels": "yes" } } } } }]] } });
  try {
    expect(wrapper.get(".wl-tabs__panels").attributes("data-panels")).toBe("yes");
    expect(wrapper.get('[role="tabpanel"]').attributes("data-local")).toBe("yes");
  } finally { wrapper.unmount(); }
});

it("resolves canonical Tabs panel callbacks for each panel state", () => {
  const panels = vi.fn(({ context }: WlPtCallbackOptions) => ({ class: "app-panels", "data-active": String(context.active) }));
  const appPanel = vi.fn(({ context }: WlPtCallbackOptions) => ({ class: "app-panel", style: { color: "red" }, "data-selected": String(context.selected), title: "app" }));
  const localPanel = vi.fn(({ context }: WlPtCallbackOptions) => ({ class: "local-panel", style: { backgroundColor: "blue" }, "data-disabled": String(context.disabled), title: "local" }));
  const wrapper = mount(WlTabs, { props: {
    items: [{ key: "one", label: "One" }, { key: "two", label: "Two", disabled: true }],
    pt: { panel: { root: localPanel } }
  }, global: { plugins: [[WlConfig, { pt: { tabs: { panels: { root: panels }, panel: { root: appPanel } } } }]] } });
  try {
    const panel = wrapper.get('[role="tabpanel"]');
    expect(wrapper.get(".wl-tabs__panels").classes()).toContain("app-panels");
    expect(panel.classes()).toEqual(expect.arrayContaining(["wl-tabs__panel", "app-panel", "local-panel"]));
    expect(panel.attributes("style")).toContain("color: red");
    expect(panel.attributes("style")).toContain("background-color: blue");
    expect(panel.attributes("title")).toBe("local");
    expect(panels).toHaveBeenCalledWith({ context: { active: true } });
    expect(appPanel).toHaveBeenCalledWith({ context: { active: true, selected: true, disabled: false } });
    expect(localPanel).toHaveBeenCalledWith({ context: { active: false, selected: false, disabled: true } });
  } finally { wrapper.unmount(); }
});
