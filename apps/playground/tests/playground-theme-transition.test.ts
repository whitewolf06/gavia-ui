import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPlaygroundThemeTransition } from "../src/theme-transition";

type Controller = ReturnType<typeof createPlaygroundThemeTransition>;
const controllers: Controller[] = [];
const captureInputs = new Set(["wheel", "touchmove", "pointerdown", "keydown"]);
const originalNative = Object.getOwnPropertyDescriptor(document, "startViewTransition");
const originalScrollX = Object.getOwnPropertyDescriptor(window, "scrollX");
const originalScrollY = Object.getOwnPropertyDescriptor(window, "scrollY");
let position = { x: 0, y: 0 };

function deferred() {
  let resolve!: () => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<void>((accept, decline) => {
    resolve = accept;
    reject = decline;
  });
  return { promise, resolve, reject };
}

function nativeSnapshot(update: () => Promise<void>) {
  const ready = deferred();
  const updated = deferred();
  const finished = deferred();
  return {
    ready: ready.promise,
    updateCallbackDone: updated.promise,
    finished: finished.promise,
    skipTransition: vi.fn(),
    finish: finished.resolve,
    async apply() {
      try {
        await update();
        updated.resolve();
        ready.resolve();
      } catch (error) {
        updated.reject(error);
        ready.reject(error);
        finished.reject(error);
        throw error;
      }
    }
  };
}

let snapshots: ReturnType<typeof nativeSnapshot>[] = [];
let startNative = vi.fn((update: () => Promise<void>) => {
  const snapshot = nativeSnapshot(update);
  snapshots.push(snapshot);
  return snapshot;
});

beforeEach(() => {
  position = { x: 0, y: 0 };
  snapshots = [];
  startNative = vi.fn((update: () => Promise<void>) => {
    const snapshot = nativeSnapshot(update);
    snapshots.push(snapshot);
    return snapshot;
  });
  Object.defineProperties(window, {
    scrollX: { configurable: true, get: () => position.x },
    scrollY: { configurable: true, get: () => position.y }
  });
  Object.defineProperty(document, "startViewTransition", { configurable: true, value: startNative });
  vi.spyOn(document, "hidden", "get").mockReturnValue(false);
  vi.spyOn(window, "matchMedia").mockReturnValue(Object.assign(new EventTarget(), {
    matches: false,
    media: "(prefers-reduced-motion: reduce)"
  }) as MediaQueryList);
  vi.spyOn(window, "scrollTo").mockImplementation((options: number | ScrollToOptions, y?: number) => {
    position = typeof options === "number"
      ? { x: options, y: y ?? position.y }
      : { x: options.left ?? position.x, y: options.top ?? position.y };
  });
  vi.spyOn(window, "addEventListener");
  vi.spyOn(window, "removeEventListener");
  vi.spyOn(window, "requestAnimationFrame").mockReturnValue(1);
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
});

afterEach(() => {
  for (const controller of controllers.splice(0)) controller.dispose();
  vi.restoreAllMocks();
  if (originalNative) Object.defineProperty(document, "startViewTransition", originalNative);
  else Reflect.deleteProperty(document, "startViewTransition");
  if (originalScrollX) Object.defineProperty(window, "scrollX", originalScrollX);
  if (originalScrollY) Object.defineProperty(window, "scrollY", originalScrollY);
  delete document.documentElement.dataset.wlPlaygroundThemeTransition;
});

function controller(): Controller {
  const transition = createPlaygroundThemeTransition();
  controllers.push(transition);
  return transition;
}

function viewport() {
  return { x: window.scrollX, y: window.scrollY };
}

function activeCaptureListeners(): number {
  const operations = [
    ...vi.mocked(window.addEventListener).mock.calls.map((args, index) => ({
      args, add: true, order: vi.mocked(window.addEventListener).mock.invocationCallOrder[index]!
    })),
    ...vi.mocked(window.removeEventListener).mock.calls.map((args, index) => ({
      args, add: false, order: vi.mocked(window.removeEventListener).mock.invocationCallOrder[index]!
    }))
  ].sort((left, right) => left.order - right.order);
  const listeners = new Map<string, Set<unknown>>();
  for (const { args, add } of operations) {
    const [name, callback, options] = args;
    if (!captureInputs.has(name) || !(options === true || (typeof options === "object" && options?.capture))) continue;
    const callbacks = listeners.get(name) ?? new Set<unknown>();
    if (add) callbacks.add(callback);
    else callbacks.delete(callback);
    listeners.set(name, callbacks);
  }
  return [...listeners.values()].reduce((sum, callbacks) => sum + callbacks.size, 0);
}

describe("native theme capture viewport ownership", () => {
  it("restores both coordinates before the theme consumer updates after a capture-only browser scroll", async () => {
    position = { x: 17, y: 23 };
    const observed: Array<{ x: number; y: number }> = [];
    controller().run(async () => {
      observed.push(viewport());
      expect(activeCaptureListeners()).toBe(0);
    });
    // Native capture may move the viewport without any scrollTo call or input.
    position = { x: 41, y: 119 };
    window.dispatchEvent(new Event("scroll"));
    await snapshots[0]!.apply();
    expect(observed).toEqual([{ x: 17, y: 23 }]);
    expect(viewport()).toEqual({ x: 17, y: 23 });
    snapshots[0]!.finish();
    await Promise.resolve();
    expect(activeCaptureListeners()).toBe(0);
  });

  it("does not request a scroll when native capture preserves the current viewport", async () => {
    position = { x: 11, y: 62 };
    const update = vi.fn(async () => {});
    controller().run(update);
    await snapshots[0]!.apply();
    expect(update).toHaveBeenCalledOnce();
    expect(window.scrollTo).not.toHaveBeenCalled();
    expect(activeCaptureListeners()).toBe(0);
  });

  it.each(["wheel", "touchmove", "pointerdown", "keydown"])("preserves newer %s intent during native capture", async (name) => {
    const observed: Array<{ x: number; y: number }> = [];
    controller().run(async () => {
      observed.push(viewport());
    });
    window.dispatchEvent(new Event(name, { bubbles: true }));
    position = { x: 8, y: 333 };
    await snapshots[0]!.apply();
    expect(observed).toEqual([{ x: 8, y: 333 }]);
    expect(window.scrollTo).not.toHaveBeenCalled();
    expect(activeCaptureListeners()).toBe(0);
  });

  it("keeps a stale callback from restoring a newer request's viewport", async () => {
    const transition = controller();
    const oldUpdate = vi.fn(async () => {});
    transition.run(oldUpdate);
    position = { x: 6, y: 120 };
    const observed: Array<{ x: number; y: number }> = [];
    transition.run(async () => {
      observed.push(viewport());
    });
    position = { x: 9, y: 216 };
    await snapshots[0]!.apply();
    expect(oldUpdate).not.toHaveBeenCalled();
    expect(viewport()).toEqual({ x: 9, y: 216 });
    await snapshots[1]!.apply();
    expect(observed).toEqual([{ x: 6, y: 120 }]);
    expect(activeCaptureListeners()).toBe(0);
  });

  it.each(["cancel", "dispose"] as const)("releases capture ownership on %s before a skipped callback eventually runs", async (method) => {
    const transition = controller();
    const update = vi.fn(async () => {});
    transition.run(update);
    position = { x: 1, y: 96 };
    transition[method]();
    await snapshots[0]!.apply();
    expect(update).not.toHaveBeenCalled();
    expect(viewport()).toEqual({ x: 1, y: 96 });
    expect(window.scrollTo).not.toHaveBeenCalled();
    expect(activeCaptureListeners()).toBe(0);
  });

  it("releases capture listeners when the native API throws and the fallback updates", async () => {
    startNative.mockImplementationOnce(() => {
      throw new Error("Native snapshot unavailable");
    });
    const observed: Array<{ x: number; y: number }> = [];
    controller().run(async () => {
      observed.push(viewport());
    });
    await Promise.resolve();
    expect(observed).toEqual([{ x: 0, y: 0 }]);
    expect(activeCaptureListeners()).toBe(0);
    expect(window.scrollTo).not.toHaveBeenCalled();
    expect(document.documentElement.dataset.wlPlaygroundThemeTransition).toBe("instant");
  });

  it("restores before a rejected consumer update and releases every capture listener", async () => {
    const failure = new Error("Theme update failed");
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    let observed: ReturnType<typeof viewport> | undefined;
    controller().run(async () => {
      observed = viewport();
      throw failure;
    });
    position = { x: 0, y: 96 };
    await expect(snapshots[0]!.apply()).rejects.toBe(failure);
    expect(observed).toEqual({ x: 0, y: 0 });
    expect(error).toHaveBeenCalledWith("Could not apply the playground theme.", failure);
    expect(activeCaptureListeners()).toBe(0);
    expect(document.documentElement.dataset.wlPlaygroundThemeTransition).toBeUndefined();
  });

  it.each(["unsupported", "reduced motion", "hidden"])("does not acquire native viewport ownership for %s fallback", async (fallback) => {
    if (fallback === "unsupported") Reflect.deleteProperty(document, "startViewTransition");
    if (fallback === "reduced motion") vi.mocked(window.matchMedia).mockReturnValue(Object.assign(new EventTarget(), {
      matches: true, media: "(prefers-reduced-motion: reduce)"
    }) as MediaQueryList);
    if (fallback === "hidden") vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    position = { x: 3, y: 44 };
    const update = vi.fn(async () => {});
    controller().run(update);
    await Promise.resolve();
    expect(update).toHaveBeenCalledOnce();
    expect(startNative).not.toHaveBeenCalled();
    expect(window.scrollTo).not.toHaveBeenCalled();
    expect(activeCaptureListeners()).toBe(0);
    expect(viewport()).toEqual({ x: 3, y: 44 });
  });
});
