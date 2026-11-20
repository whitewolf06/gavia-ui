import { WlDialog, WlDrawer } from "legato-ui";
import { describe, expect, it, vi } from "vitest";
import { createSSRApp, defineComponent, h, nextTick, useId } from "vue";
import { renderToString, type SSRContext } from "vue/server-renderer";

const Consumer = defineComponent({
  setup() {
    const first = useId();
    const second = useId();
    return () => h("main", [
      h("p", { id: first }, "Consumer heading"),
      h("p", { id: second }, "Other consumer heading"),
      h(WlDialog, { visible: true, header: "Dialog heading", modal: false, motion: false }),
      h(WlDrawer, { visible: true, header: "Drawer heading", modal: false, motion: false })
    ]);
  }
});

describe("overlay title IDs alongside native Vue IDs", () => {
  it.each([undefined, "consumer"])("keeps SSR IDs and labels unique through hydration with prefix %s", async (prefix) => {
    const application = () => {
      const app = createSSRApp(Consumer);
      if (prefix) app.config.idPrefix = prefix;
      return app;
    };
    const context: SSRContext = {};
    const html = await renderToString(application(), context);
    const container = document.createElement("div");
    container.innerHTML = html;
    // Each hydration needs a fresh Teleport target, with its SSR anchors first.
    const previousBody = document.body;
    previousBody.replaceWith(document.createElement("body"));
    document.body.innerHTML = context.teleports?.body ?? "";
    document.body.append(container);
    const client = application();
    let mounted = false;
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    try {
      const serverIds = [...document.querySelectorAll("[id]")].map((element) => element.id);
      expect(new Set(serverIds).size).toBe(serverIds.length);
      const surfaces = [...document.querySelectorAll('[role="dialog"]')];
      expect(surfaces).toHaveLength(2);
      for (const surface of surfaces) {
        const title = surface.querySelector("header [id]");
        expect(title).not.toBeNull();
        expect(document.getElementById(surface.getAttribute("aria-labelledby")!)).toBe(title);
      }
      client.mount(container);
      mounted = true;
      await nextTick();
      expect([...document.querySelectorAll('[role="dialog"]')]).toEqual(surfaces);
      expect([...document.querySelectorAll("[id]")].map((element) => element.id)).toEqual(serverIds);
      expect(warn).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
    } finally {
      if (mounted) client.unmount();
      document.body.replaceWith(previousBody);
      warn.mockRestore();
      error.mockRestore();
    }
  });

  it.each([{ name: "Dialog", component: WlDialog }, { name: "Drawer", component: WlDrawer }])("preserves consumer accessible-name overrides for $name", async ({ component }) => {
    const app = createSSRApp({
      render: () => h("main", [
        h("p", { id: "consumer-heading" }, "Consumer heading"),
        h(component, { visible: true, header: "Fallback heading", ariaLabel: "Explicit name", modal: false }),
        h(component, { visible: true, header: "Fallback heading", ariaLabelledby: "consumer-heading", modal: false })
      ])
    });
    const context: SSRContext = {};
    const container = document.createElement("div");
    container.innerHTML = await renderToString(app, context) + (context.teleports?.body ?? "");
    const surfaces = container.querySelectorAll('[role="dialog"]');
    expect(surfaces).toHaveLength(2);
    expect(surfaces[0]?.getAttribute("aria-label")).toBe("Explicit name");
    expect(surfaces[0]?.hasAttribute("aria-labelledby")).toBe(false);
    expect(surfaces[1]?.getAttribute("aria-labelledby")).toBe("consumer-heading");
  });
});
