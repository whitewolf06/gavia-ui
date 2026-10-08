import { createSSRApp, defineComponent, h, type App } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it, vi } from "vitest";
import { WlFilterBar } from "../src";

// Ensure the Vue 3.4 fallback remains SSR-safe even when newer Vue is installed.
vi.mock("vue", async (importOriginal) => ({
  ...await importOriginal<typeof import("vue")>(), useId: undefined
}));
const Filters = defineComponent({
  setup: () => () => h("main", [h(WlFilterBar), h(WlFilterBar)])
});
function configure(app: App): App {
  Object.assign(app.config, { idPrefix: "consumer" });
  return app;
}
function ids(container: HTMLElement): string[] {
  return [...container.querySelectorAll(".wl-filter-bar__panel")].map((panel) => panel.id);
}

describe("FilterBar SSR public label contract", () => {
  it("does not leak component UIDs between server requests", async () => {
    const first = await renderToString(configure(createSSRApp(Filters)));
    const second = await renderToString(configure(createSSRApp(Filters)));
    expect(second).toBe(first);
    const container = document.createElement("div");
    container.innerHTML = first;
    expect(new Set(ids(container)).size).toBe(2);
    expect([...container.querySelectorAll("[aria-controls]")].map((button) => button.getAttribute("aria-controls")))
      .toEqual(ids(container));
  });

  it("hydrates matching panel IDs without replacing server DOM", async () => {
    const container = document.createElement("div");
    container.innerHTML = await renderToString(configure(createSSRApp(Filters)));
    document.body.appendChild(container);
    const panels = [...container.querySelectorAll(".wl-filter-bar__panel")];
    const serverIds = ids(container);
    const client = configure(createSSRApp(Filters));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      client.mount(container);
      expect([...container.querySelectorAll(".wl-filter-bar__panel")]).toEqual(panels);
      expect(ids(container)).toEqual(serverIds);
      expect([...container.querySelectorAll("[aria-controls]")].map((button) => button.getAttribute("aria-controls")))
        .toEqual(serverIds);
      expect(warn).not.toHaveBeenCalled();
    } finally {
      client.unmount();
      container.remove();
      warn.mockRestore();
    }
  });
});
