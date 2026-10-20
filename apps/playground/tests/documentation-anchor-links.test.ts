import type { Plugin } from "vue";
import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick } from "vue";
import DocsPage from "../src/DocsPage.vue";
import { playgroundI18n, playgroundLocale } from "../src/i18n";

const plugin = playgroundI18n as unknown as Plugin;
const wrappers: VueWrapper[] = [];
const scroll = vi.fn();
const originalScroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
let previousLocale = playgroundI18n.global.locale.value;
let previousPlaygroundLocale = playgroundLocale.value;

beforeEach(() => {
  previousLocale = playgroundI18n.global.locale.value;
  previousPlaygroundLocale = playgroundLocale.value;
  playgroundI18n.global.locale.value = "en";
  playgroundLocale.value = "en";
  window.history.replaceState(null, "", "/docs/?theme=gavia");
  scroll.mockClear();
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, writable: true, value: scroll });
  // This contract does not simulate geometry or run the passive scrollspy frame.
  vi.spyOn(window, "requestAnimationFrame").mockReturnValue(1);
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
});

afterEach(() => {
  for (const wrapper of wrappers.splice(0)) wrapper.unmount();
  document.body.replaceChildren();
  window.history.replaceState(null, "", "/");
  playgroundI18n.global.locale.value = previousLocale;
  playgroundLocale.value = previousPlaygroundLocale;
  vi.restoreAllMocks();
  if (originalScroll) Object.defineProperty(HTMLElement.prototype, "scrollIntoView", originalScroll);
  else Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
});

const surfaces = [
  { name: "overview jump link", section: undefined, selector: '.docs-section-links a[href="#docs-foundations"]', anchor: "docs-foundations" },
  { name: "Layout sidebar TOC", section: "layout" as const, selector: '.docs-sidebar a[href="#docs-layout-nested-grid"]', anchor: "docs-layout-nested-grid" }
];

async function mountedLink(surface: typeof surfaces[number]) {
  const wrapper = mount(DocsPage, {
    attachTo: document.body,
    props: { section: surface.section },
    global: {
      plugins: [plugin],
      stubs: {
        CodePanel: true,
        PlaygroundPageHeader: true,
        WlButton: true,
        WlIcon: true,
        WlIconButton: true,
        WlInput: true,
        WlSegmented: true,
        FoundationPage: defineComponent({
          setup: () => () => h("article", h("h2", { id: "docs-layout-nested-grid" }, "Nested grid"))
        })
      }
    }
  });
  wrappers.push(wrapper);
  await flushPromises();
  return { wrapper, link: wrapper.get(surface.selector).element as HTMLAnchorElement };
}

async function click(link: HTMLAnchorElement, init: MouseEventInit = {}, alreadyPrevented = false) {
  const event = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0, ...init });
  if (alreadyPrevented) event.preventDefault();
  let componentPrevented: boolean | undefined;
  // Observe the component handler first, then suppress JSDOM's deferred native
  // navigation. The assertion uses the recorded value before this test guard.
  link.addEventListener("click", (received) => {
    componentPrevented = received.defaultPrevented;
    received.preventDefault();
  }, { once: true });
  link.dispatchEvent(event);
  await nextTick();
  await flushPromises();
  return componentPrevented;
}

describe.each(surfaces)("Docs same-page anchor: $name", (surface) => {
  it("hands one ordinary click to the application navigation owner", async () => {
    const { wrapper, link } = await mountedLink(surface);
    expect(link.getAttribute("href")).toBe("#" + surface.anchor);
    expect(await click(link)).toBe(true);
    expect(wrapper.emitted("anchor")).toEqual([[surface.anchor]]);
    expect(scroll).not.toHaveBeenCalled();
  });

  it.each([
    { name: "Ctrl", init: { ctrlKey: true }, prevented: false },
    { name: "Meta", init: { metaKey: true }, prevented: false },
    { name: "Shift", init: { shiftKey: true }, prevented: false },
    { name: "Alt", init: { altKey: true }, prevented: false },
    { name: "middle button", init: { button: 1 }, prevented: false },
    { name: "already handled", init: {}, prevented: true }
  ])("preserves native $name activation without a navigation or scroll side effect", async ({ init, prevented }) => {
    const { wrapper, link } = await mountedLink(surface);
    expect(await click(link, init, prevented)).toBe(prevented);
    expect(link.getAttribute("href")).toBe("#" + surface.anchor);
    expect(wrapper.emitted("anchor")).toBeUndefined();
    expect(scroll).not.toHaveBeenCalled();
  });
});
