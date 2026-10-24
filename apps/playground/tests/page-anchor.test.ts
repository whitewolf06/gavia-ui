import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineAsyncComponent, defineComponent, h, nextTick, ref } from "vue";
import { usePageAnchor } from "../src/usePageAnchor";

const targetId = "docs-colors-borders";
const frames = new Map<number, FrameRequestCallback>();
const wrappers: VueWrapper[] = [];
const scroll = vi.fn();
const originalScroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
let nextFrame = 0;

beforeEach(() => {
  nextFrame = 0;
  frames.clear();
  scroll.mockClear();
  window.history.replaceState(null, "", "/ru/docs/colors/?theme=gavia-dark#" + targetId);
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    frames.set(++nextFrame, callback);
    return nextFrame;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => {
    frames.delete(id);
  });
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, writable: true, value: scroll });
});

afterEach(() => {
  for (const wrapper of wrappers.splice(0)) wrapper.unmount();
  document.body.replaceChildren();
  window.history.replaceState(null, "", "/");
  vi.restoreAllMocks();
  if (originalScroll) Object.defineProperty(HTMLElement.prototype, "scrollIntoView", originalScroll);
  else Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
});

async function paint(): Promise<void> {
  await flushPromises();
  await nextTick();
  const callbacks = [...frames.values()];
  frames.clear();
  for (const callback of callbacks) callback(performance.now());
  await nextTick();
  await flushPromises();
}

function visibleGeometry(target: HTMLElement): void {
  // JSDOM has no layout engine. Model only the target's painted/hidden state.
  vi.spyOn(target, "getClientRects").mockImplementation(() => {
    const rects = target.isConnected && !target.closest("[hidden]") ? [new DOMRect(0, 0, 100, 20)] : [];
    return Object.assign(rects, { item: (index: number) => rects[index] ?? null }) as DOMRectList;
  });
}

function deferredPage() {
  const hidden = ref(false);
  const Content = defineComponent({
    setup: () => () => h("section", { hidden: hidden.value }, h("h2", { id: targetId }, "Borders and focus"))
  });
  let release!: (component: typeof Content) => void;
  const ready = new Promise<typeof Content>((resolve) => {
    release = resolve;
  });
  const Child = defineAsyncComponent(() => ready);
  const Host = defineComponent({
    setup() {
      const root = ref<HTMLElement | null>(null);
      usePageAnchor(root);
      return () => h("main", { ref: root }, h(Child));
    }
  });
  const wrapper = mount(Host, { attachTo: document.body });
  wrappers.push(wrapper);
  return {
    wrapper,
    hidden,
    async resolve() {
      release(Content);
      await flushPromises();
      await nextTick();
      const target = wrapper.get("h2").element as HTMLElement;
      visibleGeometry(target);
      return target;
    }
  };
}

describe("initial page anchor restoration", () => {
  it("restores an anchor after a delayed asynchronous child mounts beyond the initial frame", async () => {
    const page = deferredPage();
    await paint();
    expect(scroll).not.toHaveBeenCalled();
    expect(frames.size).toBe(0);
    const target = await page.resolve();
    target.append(document.createTextNode(" Pending content"));
    target.classList.add("ready");
    await flushPromises();
    expect(frames.size).toBe(1);
    await paint();
    expect(scroll).toHaveBeenCalledExactlyOnceWith({ block: "start", behavior: "instant" });
    expect(scroll.mock.instances[0]).toBe(target);
    target.append(document.createTextNode(" Updated content"));
    await paint();
    expect(scroll).toHaveBeenCalledTimes(1);
    expect(frames.size).toBe(0);
  });

  it("waits until an inserted heading is painted before restoring its anchor", async () => {
    const page = deferredPage();
    page.hidden.value = true;
    await paint();
    await page.resolve();
    await paint();
    expect(scroll).not.toHaveBeenCalled();
    page.hidden.value = false;
    await paint();
    expect(scroll).toHaveBeenCalledTimes(1);
  });

  it("does not restore a stale initial hash after the user selects another anchor", async () => {
    const page = deferredPage();
    await paint();
    window.history.replaceState(null, "", "#another-section");
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    await page.resolve();
    await paint();
    expect(scroll).not.toHaveBeenCalled();
    expect(frames.size).toBe(0);
  });

  it("cancels a pending restoration on unmount before the asynchronous child resolves", async () => {
    const page = deferredPage();
    expect(frames.size).toBe(1);
    page.wrapper.unmount();
    wrappers.splice(wrappers.indexOf(page.wrapper), 1);
    expect(frames.size).toBe(0);
    const outside = document.createElement("h2");
    outside.id = targetId;
    document.body.append(outside);
    await paint();
    expect(scroll).not.toHaveBeenCalled();
    expect(frames.size).toBe(0);
  });

  it("ignores a matching heading outside the current page root", async () => {
    const outside = document.createElement("h2");
    outside.id = targetId;
    document.body.append(outside);
    visibleGeometry(outside);
    const page = deferredPage();
    await paint();
    expect(scroll).not.toHaveBeenCalled();
    outside.remove();
    await page.resolve();
    await paint();
    expect(scroll).toHaveBeenCalledTimes(1);
  });

  it.each(["", "#%E0%A4%A"])("ignores an empty or malformed fragment %s without scheduling work", async (fragment) => {
    window.history.replaceState(null, "", "/ru/docs/colors/" + fragment);
    const page = deferredPage();
    await page.resolve();
    await paint();
    expect(scroll).not.toHaveBeenCalled();
    expect(frames.size).toBe(0);
  });
});
