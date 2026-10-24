import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPageAnchorRestorer, type PageAnchorRequest } from "../src/usePageAnchor";

const frames = new Map<number, FrameRequestCallback>();
const scroll = vi.fn();
const controllers: ReturnType<typeof createPageAnchorRestorer>[] = [];
const originalFonts = Object.getOwnPropertyDescriptor(document, "fonts");
const originalScroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
let readyState: DocumentReadyState;
let fontStatus: FontFaceSetLoadStatus;
let fontReady: Promise<FontFaceSet>;
let frameNumber = 0;

function deferredFonts() {
  let resolve!: (fonts: FontFaceSet) => void;
  const promise = new Promise<FontFaceSet>((done) => {
    resolve = done;
  });
  return { promise, resolve: () => resolve(document.fonts) };
}

beforeEach(() => {
  frames.clear();
  scroll.mockClear();
  frameNumber = 0;
  readyState = "complete";
  fontStatus = "loaded";
  fontReady = Promise.resolve({} as FontFaceSet);
  vi.spyOn(document, "readyState", "get").mockImplementation(() => readyState);
  Object.defineProperty(document, "fonts", {
    configurable: true,
    value: {
      get status() { return fontStatus; },
      get ready() { return fontReady; }
    }
  });
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    frames.set(++frameNumber, callback);
    return frameNumber;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => {
    frames.delete(id);
  });
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, writable: true, value: scroll });
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockImplementation(function (this: HTMLElement) {
    return Object.assign(this.isConnected && !this.hidden ? [new DOMRect(0, 0, 100, 20)] : [], { item: () => null }) as DOMRectList;
  });
});

afterEach(() => {
  for (const controller of controllers.splice(0)) controller.cancel();
  document.body.replaceChildren();
  window.history.replaceState(null, "", "/");
  vi.restoreAllMocks();
  if (originalFonts) Object.defineProperty(document, "fonts", originalFonts);
  else Reflect.deleteProperty(document, "fonts");
  if (originalScroll) Object.defineProperty(HTMLElement.prototype, "scrollIntoView", originalScroll);
  else Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
});

async function paint(): Promise<void> {
  await flushPromises();
  const queuedFrames = [...frames.keys()];
  for (const id of queuedFrames) {
    const callback = frames.get(id);
    if (!callback) continue;
    frames.delete(id);
    callback(performance.now());
  }
  await flushPromises();
}

function page(id = "release") {
  const controller = createPageAnchorRestorer();
  controllers.push(controller);
  const root = document.createElement("main");
  const target = document.createElement("h2");
  target.id = id;
  root.append(target);
  document.body.append(root);
  controller.attach(root);
  window.history.replaceState(null, "", "/changelog/#" + id);
  const request: PageAnchorRequest = { id, href: location.href, isCurrent: () => true };
  return { controller, root, target, request };
}

describe("anchor alignment after initial document readiness", () => {
  it("waits for pageshow and fonts discovered after load before one final alignment", async () => {
    readyState = "interactive";
    fontStatus = "loading";
    const earlyFonts = deferredFonts();
    const finalFonts = deferredFonts();
    fontReady = earlyFonts.promise;
    const current = page();
    const add = vi.spyOn(window, "addEventListener");
    const remove = vi.spyOn(window, "removeEventListener");
    current.controller.restore(current.request);
    await paint();
    expect(scroll).not.toHaveBeenCalled();
    expect(frames.size).toBe(0);
    earlyFonts.resolve();
    readyState = "complete";
    window.dispatchEvent(new Event("load"));
    await paint();
    expect(scroll).not.toHaveBeenCalled();
    fontReady = finalFonts.promise;
    window.dispatchEvent(new Event("pageshow"));
    await paint();
    expect(scroll).not.toHaveBeenCalled();
    // Native persisted-scroll restoration can finish while fonts are pending.
    fontStatus = "loaded";
    finalFonts.resolve();
    await paint();
    expect(scroll.mock.instances).toEqual([current.target]);
    expect(frames.size).toBe(0);
    for (const name of ["load", "pageshow"]) {
      const listener = add.mock.calls.find(([type]) => type === name)![1];
      expect(remove).toHaveBeenCalledWith(name, listener);
    }
    window.dispatchEvent(new Event("pageshow"));
    await paint();
    expect(scroll).toHaveBeenCalledTimes(1);
  });

  it("does not wait for a future pageshow when mounted after document completion", async () => {
    fontStatus = "loading";
    const fonts = deferredFonts();
    fontReady = fonts.promise;
    const current = page();
    current.controller.restore(current.request);
    await paint();
    expect(scroll).not.toHaveBeenCalled();
    fontStatus = "loaded";
    fonts.resolve();
    await paint();
    expect(scroll.mock.instances).toEqual([current.target]);
  });

  it("does not loop when a settled fonts.ready identity still reports loading", async () => {
    fontStatus = "loading";
    fontReady = Promise.resolve(document.fonts);
    const current = page();
    current.controller.restore(current.request);
    await paint();
    await paint();
    expect(scroll.mock.instances).toEqual([current.target]);
    expect(frames.size).toBe(0);
  });

  it.each(["cancel", "URL"])("ignores pending readiness after %s and removes document listeners", async (change) => {
    readyState = "interactive";
    fontStatus = "loading";
    const fonts = deferredFonts();
    fontReady = fonts.promise;
    const current = page();
    const add = vi.spyOn(window, "addEventListener");
    const remove = vi.spyOn(window, "removeEventListener");
    current.controller.restore(current.request);
    await paint();
    if (change === "cancel") current.controller.cancel();
    else {
      window.history.replaceState(null, "", "/other/#release");
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
    readyState = "complete";
    fontStatus = "loaded";
    window.dispatchEvent(new Event("pageshow"));
    fonts.resolve();
    await paint();
    expect(scroll).not.toHaveBeenCalled();
    expect(frames.size).toBe(0);
    for (const name of ["load", "pageshow"]) {
      const listener = add.mock.calls.find(([type]) => type === name)![1];
      expect(remove).toHaveBeenCalledWith(name, listener);
    }
  });

  it("keeps newer B current when A's font promise resolves after replacement", async () => {
    fontStatus = "loading";
    const oldFonts = deferredFonts();
    const nextFonts = deferredFonts();
    fontReady = oldFonts.promise;
    const current = page("a");
    current.controller.restore(current.request);
    await paint();
    const next = document.createElement("h2");
    next.id = "b";
    current.root.append(next);
    window.history.replaceState(null, "", "/changelog/#b");
    fontReady = nextFonts.promise;
    current.controller.restore({ id: "b", href: location.href, isCurrent: () => true });
    await paint();
    oldFonts.resolve();
    await paint();
    expect(scroll).not.toHaveBeenCalled();
    fontStatus = "loaded";
    nextFonts.resolve();
    await paint();
    expect(scroll.mock.instances).toEqual([next]);
  });

  it("detaches a waiting root and rearms the same request for its replacement", async () => {
    fontStatus = "loading";
    const fonts = deferredFonts();
    fontReady = fonts.promise;
    const current = page();
    current.controller.restore(current.request);
    await paint();
    current.controller.detach(current.root);
    const replacement = document.createElement("main");
    const target = current.target.cloneNode(true) as HTMLElement;
    replacement.append(target);
    document.body.append(replacement);
    current.controller.attach(replacement);
    await paint();
    fontStatus = "loaded";
    fonts.resolve();
    await paint();
    expect(scroll.mock.instances).toEqual([target]);
    expect(frames.size).toBe(0);
  });

  it("re-resolves a replaced target after fonts settle without scrolling a detached node", async () => {
    fontStatus = "loading";
    const fonts = deferredFonts();
    fontReady = fonts.promise;
    const current = page();
    current.controller.restore(current.request);
    await paint();
    const next = current.target.cloneNode(true) as HTMLElement;
    current.target.replaceWith(next);
    fontStatus = "loaded";
    fonts.resolve();
    await paint();
    expect(scroll.mock.instances).toEqual([next]);
  });
});
