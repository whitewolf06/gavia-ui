import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, onBeforeUnmount, provide, ref } from "vue";
import { createPageAnchorRestorer, pageAnchorRestorerKey, usePageAnchor } from "../src/usePageAnchor";

type Restorer = ReturnType<typeof createPageAnchorRestorer>;
const controllers: Restorer[] = [];
const wrappers: VueWrapper[] = [];
const frames = new Map<number, FrameRequestCallback>();
const scroll = vi.fn();
const scrollTop = vi.fn();
const originalScroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
let frameNumber = 0;

beforeEach(() => {
  frameNumber = 0;
  frames.clear();
  scroll.mockClear();
  scrollTop.mockClear();
  window.history.replaceState(null, "", "/docs/icons/?theme=gavia");
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    frames.set(++frameNumber, callback);
    return frameNumber;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => {
    frames.delete(id);
  });
  vi.spyOn(window, "scrollTo").mockImplementation(scrollTop);
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, writable: true, value: scroll });
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockImplementation(function (this: HTMLElement) {
    const rects = this.isConnected && !this.closest("[hidden]") ? [new DOMRect(0, 0, 100, 20)] : [];
    return Object.assign(rects, { item: (index: number) => rects[index] ?? null }) as DOMRectList;
  });
});

afterEach(() => {
  for (const wrapper of wrappers.splice(0)) wrapper.unmount();
  for (const controller of controllers.splice(0)) controller.cancel();
  document.body.replaceChildren();
  window.history.replaceState(null, "", "/");
  vi.restoreAllMocks();
  if (originalScroll) Object.defineProperty(HTMLElement.prototype, "scrollIntoView", originalScroll);
  else Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
  frames.clear();
});

async function paint(): Promise<void> {
  await flushPromises();
  await nextTick();
  const queuedFrames = [...frames.keys()];
  for (const id of queuedFrames) {
    const callback = frames.get(id);
    if (!callback) continue;
    frames.delete(id);
    callback(performance.now());
  }
  await nextTick();
  await flushPromises();
}

function restorer(): Restorer {
  const controller = createPageAnchorRestorer();
  controllers.push(controller);
  return controller;
}

function locationFor(id: string): string {
  window.history.replaceState(null, "", "/docs/icons/?theme=gavia#" + encodeURIComponent(id));
  return window.location.href;
}

function root(): HTMLElement {
  const element = document.createElement("main");
  document.body.append(element);
  return element;
}

function heading(parent: HTMLElement, id: string): HTMLElement {
  const element = document.createElement("h2");
  element.id = id;
  element.textContent = id;
  parent.append(element);
  return element;
}

function managedPage(controller: Restorer, id: string) {
  const Page = defineComponent({
    setup() {
      const element = ref<HTMLElement | null>(null);
      usePageAnchor(element);
      return () => h("main", { ref: element }, h("h2", { id }, "Managed page"));
    }
  });
  const Host = defineComponent({
    setup() {
      provide(pageAnchorRestorerKey, controller);
      onBeforeUnmount(controller.cancel);
      return () => h(Page);
    }
  });
  const wrapper = mount(Host, { attachTo: document.body });
  wrappers.push(wrapper);
  return wrapper;
}

describe("explicit page anchor controller", () => {
  it("retains a request issued before its page root and target are mounted", async () => {
    const controller = restorer();
    const id = "docs-icons-catalog";
    controller.restore({ id, href: locationFor(id), isCurrent: () => true });
    await paint();
    expect(scroll).not.toHaveBeenCalled();
    expect(scrollTop).not.toHaveBeenCalled();
    expect(frames.size).toBe(0); // missing root does not start a frame loop
    const page = root();
    controller.attach(page);
    await paint();
    expect(scroll).not.toHaveBeenCalled();
    expect(frames.size).toBe(0);
    const target = heading(page, id);
    await paint();
    expect(scroll.mock.instances).toEqual([target]);
    target.classList.add("after-success");
    await paint();
    expect(frames.size).toBe(0);
    expect(scroll).toHaveBeenCalledTimes(1);
  });

  it("replaces pending A with B and ignores A when it appears first", async () => {
    const controller = restorer();
    const page = root();
    controller.attach(page);
    controller.restore({ id: "anchor-a", href: locationFor("anchor-a"), isCurrent: () => true });
    await paint();
    controller.restore({ id: "anchor-b", href: locationFor("anchor-b"), isCurrent: () => true });
    heading(page, "anchor-a");
    await paint();
    expect(scroll).not.toHaveBeenCalled();
    const target = heading(page, "anchor-b");
    await paint();
    expect(scroll.mock.instances).toEqual([target]);
    page.classList.add("after-b");
    await paint();
    expect(scroll).toHaveBeenCalledTimes(1);
    expect(frames.size).toBe(0);
  });

  it.each(["URL", "route"])("cancels a stale exact %s even when the hash stays the same", async (change) => {
    const controller = restorer();
    const page = root();
    const id = "same-fragment";
    let routeCurrent = true;
    controller.attach(page);
    controller.restore({ id, href: locationFor(id), isCurrent: () => routeCurrent });
    if (change === "URL") {
      window.history.replaceState(null, "", "/docs/colors/?theme=gavia#" + id);
    } else routeCurrent = false;
    heading(page, id);
    await paint();
    expect(scroll).not.toHaveBeenCalled();
    expect(frames.size).toBe(0);
    page.classList.add("mutation-after-cancel");
    await paint();
    expect(frames.size).toBe(0); // stale request cannot schedule new frame work
    expect(scroll).not.toHaveBeenCalled();
  });

  it("keeps the latest root when the previous page detaches late", async () => {
    const controller = restorer();
    const id = "shared-page-heading";
    const previous = root();
    controller.attach(previous);
    controller.restore({ id, href: locationFor(id), isCurrent: () => true });
    await paint();
    const current = root();
    const target = heading(current, id);
    controller.attach(current);
    controller.detach(previous);
    heading(previous, id); // a matching stale heading must not attract the request
    await paint();
    expect(scroll.mock.instances).toEqual([target]);
  });

  it("restores each controller's own duplicate ID without accepting another App root", async () => {
    const first = restorer();
    const second = restorer();
    const id = "same-id-in-two-apps";
    const href = locationFor(id);
    const firstRoot = root();
    const secondRoot = root();
    const firstTarget = heading(firstRoot, id);
    const secondTarget = heading(secondRoot, id);
    first.attach(firstRoot);
    second.attach(secondRoot);
    first.restore({ id, href, isCurrent: () => true });
    second.restore({ id, href, isCurrent: () => true });
    await paint();
    expect(scroll.mock.instances).toEqual([firstTarget, secondTarget]);
    first.cancel();
    secondRoot.classList.add("independent-lifecycle");
    await paint();
    expect(scroll).toHaveBeenCalledTimes(2);
  });

  it.each([false, true])("finds arbitrary Unicode IDs within the exact scope, scope-self=%s", async (scopeSelf) => {
    const controller = restorer();
    const page = root();
    const id = 'раздел-"x"[0]:λ/ß';
    const outside = heading(page, id);
    const scope = document.createElement("section");
    scope.className = "docs-content";
    page.append(scope);
    let target: HTMLElement;
    if (scopeSelf) {
      scope.id = id;
      target = scope;
    } else target = heading(scope, id);
    expect(document.getElementById(id)).toBe(outside);
    controller.attach(page);
    controller.restore({ id, href: locationFor(id), scope: ".docs-content", isCurrent: () => true });
    await paint();
    expect(scroll.mock.instances).toEqual([target]);
  });

  it("waits for a present but unpainted target to become visible", async () => {
    const controller = restorer();
    const page = root();
    const target = heading(page, "hidden-heading");
    target.hidden = true;
    controller.attach(page);
    controller.restore({ id: target.id, href: locationFor(target.id), isCurrent: () => true });
    await paint();
    expect(scroll).not.toHaveBeenCalled();
    target.hidden = false;
    await paint();
    expect(scroll.mock.instances).toEqual([target]);
  });

  it("lets only the provided App owner start the initial restoration", async () => {
    const controller = restorer();
    const id = "managed-initial-heading";
    const href = locationFor(id);
    const page = managedPage(controller, id);
    await paint();
    expect(scroll).not.toHaveBeenCalled(); // inherited hook registers; no second request
    controller.restore({ id, href, isCurrent: () => true });
    await paint();
    expect(scroll.mock.instances).toEqual([page.get("h2").element]);
    page.get("h2").element.classList.add("render-after-initial");
    await paint();
    expect(scroll).toHaveBeenCalledTimes(1);
    expect(frames.size).toBe(0);
  });

  it("isolates inherited registration and cancellation between two App providers", async () => {
    const first = restorer();
    const second = restorer();
    const id = "provided-duplicate-heading";
    const href = locationFor(id);
    const firstPage = managedPage(first, id);
    const secondPage = managedPage(second, id);
    first.restore({ id, href, isCurrent: () => true });
    second.restore({ id, href, isCurrent: () => true });
    firstPage.unmount();
    wrappers.splice(wrappers.indexOf(firstPage), 1);
    await paint();
    expect(scroll.mock.instances).toEqual([secondPage.get("h2").element]);
    expect(frames.size).toBe(0);
  });
});
