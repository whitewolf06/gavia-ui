import { createSSRApp, defineComponent, h, type App } from "vue";
import { renderToString } from "vue/server-renderer";
import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { useWlId } from "../src/utils/useWlId";

// Exercise the supported Vue 3.4 path, independent of the installed Vue version.
vi.mock("vue", async (importOriginal) => ({
  ...await importOriginal<typeof import("vue")>(),
  useId: undefined
}));
const Control = defineComponent({
  setup() {
    const id = useWlId();
    return () => h("div", [h("label", { for: id }, "Имя"), h("input", { id })]);
  }
});
const Form = defineComponent({ setup: () => () => h("form", [h(Control), h(Control)]) });
function configure(app: App): void {
  Object.assign(app.config, { idPrefix: "packed" });
}

describe("Vue 3.4 generated ID compatibility", () => {
  it("keeps IDs unique and label references valid within one application", () => {
    const wrapper = mount(Form, { global: { plugins: [{ install: configure }] } });
    const ids = wrapper.findAll("input").map((input) => input.attributes("id"));
    expect(ids).toEqual(["packed-0", "packed-1"]);
    expect(wrapper.findAll("label").map((label) => label.attributes("for"))).toEqual(ids);
    wrapper.unmount();
  });

  it("resets IDs per SSR application instead of sharing a request counter", async () => {
    const first = createSSRApp(Form);
    const second = createSSRApp(Form);
    configure(first);
    configure(second);
    const [left, right] = await Promise.all([renderToString(first), renderToString(second)]);
    expect(left).toBe(right);
    expect(left).toContain('id="packed-0"');
    expect(left).toContain('id="packed-1"');
  });

  it("reuses an SSR app without leaking IDs from its previous render", async () => {
    const app = createSSRApp(Form);
    configure(app);
    // Vue 3.4 warns when its own SSR context provide is reused; keep that
    // expected framework warning separate from hydration or ID failures.
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const first = await renderToString(app);
      const second = await renderToString(app);
      expect(second).toBe(first);
      expect(second).toContain('id="packed-0"');
      expect(warn).toHaveBeenCalledTimes(1);
      expect(String(warn.mock.calls[0]?.[0])).toContain('Symbol(v-scx)');
    } finally { warn.mockRestore(); }
  });

  it("hydrates the generated IDs without replacing server nodes", async () => {
    const server = createSSRApp(Form);
    configure(server);
    const container = document.createElement("div");
    container.innerHTML = await renderToString(server);
    document.body.appendChild(container);
    const inputs = [...container.querySelectorAll("input")];
    const client = createSSRApp(Form);
    configure(client);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      client.mount(container);
      expect([...container.querySelectorAll("input")]).toEqual(inputs);
      expect(inputs.map((input) => input.id)).toEqual(["packed-0", "packed-1"]);
      expect(warn).not.toHaveBeenCalled();
    } finally {
      client.unmount();
      container.remove();
      warn.mockRestore();
    }
  });
});
