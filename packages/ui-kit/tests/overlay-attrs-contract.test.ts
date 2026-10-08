import { afterEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { mount } from "@vue/test-utils";
import { WlConfig, WlDrawer, WlPopover, WlToast, WlToastService } from "../src";

const dispose: Array<() => void> = [];
afterEach(() => {
  for (const unmount of dispose.splice(0)) unmount();
  document.body.innerHTML = "";
  document.body.style.overflow = "";
});

function consumerAttrs(onClick: (event: MouseEvent) => void) {
  return { class: "consumer-class", style: { margin: "12px" },
    "data-consumer": "application", "aria-describedby": "consumer-help", onClick };
}
function expectAttrs(root: HTMLElement | null, onClick: ReturnType<typeof vi.fn>): void {
  expect(root).not.toBeNull();
  expect(root?.classList.contains("consumer-class")).toBe(true);
  expect(root?.classList.contains("local-class")).toBe(true);
  expect(root?.classList.contains("app-class")).toBe(true);
  expect(root?.getAttribute("data-consumer")).toBe("application");
  expect(root?.getAttribute("aria-describedby")).toBe("consumer-help");
  expect(root?.style.color).toBe("red");
  expect(root?.style.padding).toBe("8px");
  expect(root?.style.margin).toBe("12px");
  root?.click();
  expect(onClick).toHaveBeenCalledOnce();
}
const localRoot = { root: { class: "local-class", style: { padding: "8px" } } };
const appRoot = { root: { class: "app-class", style: { color: "red" } } };

describe("teleported component public attributes", () => {
  it("forwards Drawer attrs to its panel and merges app/local PT class and style", async () => {
    const click = vi.fn();
    const wrapper = mount(WlDrawer, { attachTo: document.body,
      props: { visible: true, modal: false, motion: false, pt: localRoot }, attrs: consumerAttrs(click),
      global: { plugins: [[WlConfig, { pt: { drawer: appRoot } }]] }
    });
    dispose.push(() => wrapper.unmount());
    await nextTick();
    expectAttrs(document.body.querySelector<HTMLElement>(".wl-drawer"), click);
  });

  it("forwards Popover attrs after it is opened through its exposed method", async () => {
    const click = vi.fn();
    const wrapper = mount(WlPopover, { attachTo: document.body,
      props: { motion: false, pt: localRoot }, attrs: consumerAttrs(click),
      global: { plugins: [[WlConfig, { pt: { popover: appRoot } }]] }
    });
    dispose.push(() => wrapper.unmount());
    wrapper.vm.show();
    await nextTick();
    expectAttrs(document.body.querySelector<HTMLElement>(".wl-popover"), click);
    wrapper.vm.hide();
    await nextTick();
    expect(document.body.querySelector(".wl-popover")).toBeNull();
  });

  it("forwards Toast attrs to its live region even before a message is queued", async () => {
    const click = vi.fn();
    const wrapper = mount(WlToast, { attachTo: document.body,
      props: { motion: false, pt: localRoot }, attrs: consumerAttrs(click),
      global: { plugins: [WlToastService, [WlConfig, { pt: { toast: appRoot } }]] }
    });
    dispose.push(() => wrapper.unmount());
    await nextTick();
    expectAttrs(document.body.querySelector<HTMLElement>(".wl-toast"), click);
    expect(document.body.querySelector(".wl-toast")?.getAttribute("aria-live")).toBe("polite");
  });
});
