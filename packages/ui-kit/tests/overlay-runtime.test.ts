import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref, Teleport } from "vue";
import WlDialog from "../src/components/WlDialog.vue";
import WlFilterBar from "../src/components/WlFilterBar.vue";
import WlPopover from "../src/components/WlPopover.vue";
import WlSidebar from "../src/components/WlSidebar.vue";
import { useAnchoredOverlay } from "../src/utils/anchoredOverlay";
import { getFocusableElements, trapOverlayFocus, useOverlayLifecycle } from "../src/utils/overlayLifecycle";
import { addOverlayLayer, removeOverlayLayer } from "../src/utils/overlayStack";

const wrappers: VueWrapper[] = [];

afterEach(async () => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount());
  await nextTick();
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function anchoredHarness(onOpen = vi.fn(), onClose = vi.fn(), panelStyle?: string, mountTarget = document.body) {
  let overlay!: ReturnType<typeof useAnchoredOverlay>;
  const Harness = defineComponent({
    setup() {
      overlay = useAnchoredOverlay({ onOpen, onClose });
      return () => h("div", [
        h("button", { onClick: overlay.show }, "Open"),
        overlay.visible.value && h("section", { ref: overlay.panel, style: panelStyle }, "Panel")
      ]);
    }
  });
  const wrapper = mount(Harness, { attachTo: mountTarget });
  wrappers.push(wrapper);
  return { wrapper, overlay, anchor: wrapper.get("button"), onOpen, onClose };
}

function replaceableAnchoredHarness(initiallyVisible = false) {
  const sheet = document.createElement("style");
  sheet.textContent = ".review-anchor-panel-a { z-index:80 } .review-anchor-panel-b { z-index:200 }";
  document.body.append(sheet);
  const anchorKey = ref(0);
  const panelKey = ref(0);
  const panelPresent = ref(true);
  const level = ref(400);
  const onOpen = vi.fn();
  let overlay!: ReturnType<typeof useAnchoredOverlay>;
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    return this.dataset.anchorKey === "1" ? new DOMRect(120, 80, 120, 20) : new DOMRect(10, 20, 80, 25);
  });
  const Harness = defineComponent({
    setup() {
      overlay = useAnchoredOverlay({ onOpen });
      overlay.visible.value = initiallyVisible;
      return () => h("div", [
        h("div", { style: { position: "relative", zIndex: level.value } }, [
          h("button", { key: anchorKey.value, ref: overlay.anchor, "data-anchor-key": anchorKey.value, onClick: overlay.show }, "Open")
        ]),
        h(Teleport, { to: "body" }, overlay.visible.value && panelPresent.value
          ? h("section", {
              key: panelKey.value, ref: overlay.panel, class: panelKey.value ? "review-anchor-panel-b" : "review-anchor-panel-a",
              style: [{ borderWidth: "3px" }, overlay.style.value]
            }, "Panel")
          : [])
      ]);
    }
  });
  const wrapper = mount(Harness, { attachTo: document.body });
  wrappers.push(wrapper);
  return { wrapper, overlay, anchorKey, panelKey, panelPresent, level, onOpen };
}

function observeTargets() {
  const targets = new Set<Element>();
  const callbacks: ResizeObserverCallback[] = [];
  const disconnect = vi.fn(() => targets.clear());
  vi.stubGlobal("ResizeObserver", class {
    constructor(callback: ResizeObserverCallback) { callbacks.push(callback); }
    observe(target: Element): void { targets.add(target); }
    disconnect = disconnect;
  });
  return { targets, callbacks, disconnect };
}

async function key(key: string, target: EventTarget = document) {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
  target.dispatchEvent(event);
  await flushPromises();
  return event;
}

describe("overlay listener and positioning lifecycle", () => {
  it("does not install overlay listeners for closed instances and removes them on close", async () => {
    const documentAdd = vi.spyOn(document, "addEventListener");
    const documentRemove = vi.spyOn(document, "removeEventListener");
    const windowAdd = vi.spyOn(window, "addEventListener");
    const windowRemove = vi.spyOn(window, "removeEventListener");
    const Harness = defineComponent({
      setup() {
        for (let index = 0; index < 10; index += 1) useAnchoredOverlay();
        useOverlayLifecycle({ visible: ref(false), container: ref(null) });
        return () => h("div");
      }
    });
    wrappers.push(mount(Harness));
    const events = ["keydown", "pointerdown"];
    expect(documentAdd.mock.calls.filter(([name]) => events.includes(name))).toHaveLength(0);
    expect(windowAdd.mock.calls.filter(([name]) => ["scroll", "resize"].includes(name))).toHaveLength(0);
    const { anchor, overlay } = anchoredHarness();
    await anchor.trigger("click");
    await flushPromises();
    for (const name of events) expect(documentAdd).toHaveBeenCalledWith(name, expect.any(Function));
    overlay.hide();
    for (const name of events) expect(documentRemove).toHaveBeenCalledWith(name, expect.any(Function));
    expect(windowRemove).toHaveBeenCalledWith("resize", expect.any(Function));
    expect(windowRemove).toHaveBeenCalledWith("scroll", expect.any(Function), true);
  });

  it("batches positioning and panel resizing in one frame, caches z-index and cancels queued work", async () => {
    const frames = new Map<number, FrameRequestCallback>();
    let frameId = 0;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frames.set(++frameId, callback);
      return frameId;
    });
    const cancel = vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => {
      frames.delete(id);
    });
    let observerCallback!: ResizeObserverCallback;
    const observe = vi.fn();
    const disconnect = vi.fn();
    vi.stubGlobal("ResizeObserver", class {
      constructor(callback: ResizeObserverCallback) { observerCallback = callback; }
      observe = observe;
      disconnect = disconnect;
    });
    const { anchor, overlay } = anchoredHarness();
    const rect = vi.spyOn(anchor.element, "getBoundingClientRect").mockReturnValue(new DOMRect(10, 20, 80, 25));
    await anchor.trigger("click");
    await flushPromises();
    expect(overlay.style.value.minWidth).toBe("80px");
    expect(observe).toHaveBeenCalledWith(overlay.panel.value);
    expect(observe).toHaveBeenCalledWith(anchor.element);
    const computedStyle = vi.spyOn(window, "getComputedStyle");
    rect.mockClear();
    window.dispatchEvent(new Event("scroll"));
    window.dispatchEvent(new Event("resize"));
    observerCallback([], {} as ResizeObserver);
    expect(frames.size).toBe(1);
    const [id, callback] = [...frames][0]!;
    frames.delete(id);
    callback(0);
    expect(rect).toHaveBeenCalledTimes(1);
    expect(computedStyle).not.toHaveBeenCalled();
    observerCallback([], {} as ResizeObserver);
    overlay.hide();
    expect(cancel).toHaveBeenCalled();
    expect(disconnect).toHaveBeenCalledOnce();
    expect(frames.size).toBe(0);
  });

  it("reads the rendered panel layer before opening after a settled mount and reopening", async () => {
    const openings: { connected: boolean; layer: string | undefined }[] = [];
    const onOpen = vi.fn(() => openings.push({
      connected: state.overlay.panel.value?.isConnected ?? false,
      layer: state.overlay.style.value.zIndex
    }));
    const state = anchoredHarness(onOpen, vi.fn(), "position:absolute;z-index:80");
    await flushPromises();

    for (let cycle = 0; cycle < 2; cycle += 1) {
      state.anchor.element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await flushPromises();
      expect(openings[cycle]).toEqual({ connected: true, layer: "80" });
      expect(state.overlay.style.value.position).toBe("fixed");
      state.overlay.hide();
      await flushPromises();
    }
    expect(onOpen).toHaveBeenCalledTimes(2);
  });

  it("does not emit stale open callbacks after immediate close or unmount", async () => {
    const first = anchoredHarness();
    first.overlay.visible.value = true;
    first.overlay.hide();
    await flushPromises();
    expect(first.onOpen).not.toHaveBeenCalled();
    expect(first.onClose).not.toHaveBeenCalled();
    const second = anchoredHarness();
    second.overlay.visible.value = true;
    second.wrapper.unmount();
    wrappers.splice(wrappers.indexOf(second.wrapper), 1);
    await flushPromises();
    expect(second.onOpen).not.toHaveBeenCalled();
  });

  it.each(["anchor", "panel"])("rebinds a replaced %s and remeasures CSS layers without recycling its own inline z-index", async (changed) => {
    const frames = new Map<number, FrameRequestCallback>();
    let frameId = 0;
    const request = vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frames.set(++frameId, callback);
      return frameId;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => {
      frames.delete(id);
    });
    const observer = observeTargets();
    const state = replaceableAnchoredHarness();
    await flushPromises();
    state.overlay.show();
    await flushPromises();
    expect(state.overlay.style.value.zIndex).toBe("401");
    const oldTarget = changed === "anchor" ? state.overlay.anchor.value : state.overlay.panel.value;
    observer.callbacks[0]!([], {} as ResizeObserver);
    const oldFrame = [...frames.values()][0]!;
    expect(frames.size).toBe(1);
    state.level.value = 0;
    if (changed === "anchor") state.anchorKey.value = 1;
    else state.panelKey.value = 1;
    await flushPromises();
    const newTarget = changed === "anchor" ? state.overlay.anchor.value : state.overlay.panel.value;
    expect(newTarget).not.toBe(oldTarget);
    expect(observer.targets.has(oldTarget!)).toBe(false);
    expect(observer.targets.has(newTarget!)).toBe(true);
    expect(frames.size).toBe(0);
    request.mockClear();
    observer.callbacks[0]!([], {} as ResizeObserver);
    oldFrame(0);
    expect(request).not.toHaveBeenCalled();
    expect(observer.targets).toEqual(new Set([state.overlay.anchor.value, state.overlay.panel.value]));
    expect(state.overlay.style.value.zIndex).toBe(changed === "anchor" ? "80" : "200");
    expect(state.overlay.style.value.left).toBe(changed === "anchor" ? "120px" : "10px");
    expect(state.overlay.style.value.minWidth).toBe(changed === "anchor" ? "120px" : "80px");
    expect(state.overlay.panel.value?.style.borderWidth).toBe("3px");

    state.level.value = 900;
    await nextTick();
    state.overlay.show();
    await flushPromises();
    expect(state.overlay.style.value.zIndex).toBe("901");
    state.level.value = 0;
    await nextTick();
    state.overlay.show();
    await flushPromises();
    expect(state.overlay.style.value.zIndex).toBe(changed === "anchor" ? "80" : "200");

    state.panelPresent.value = false;
    await flushPromises();
    expect(observer.targets.size).toBe(0);
    state.panelKey.value = 1;
    state.panelPresent.value = true;
    await flushPromises();
    expect(observer.targets.has(state.overlay.panel.value!)).toBe(true);
    expect(state.overlay.style.value.zIndex).toBe("200");
    expect(state.onOpen).toHaveBeenCalledOnce();
  });

  it("reconciles modal portal ownership after an anchor ref is reassigned without a DOM mutation", async () => {
    const modal = document.createElement("section");
    const outside = document.createElement("button");
    document.body.append(modal, outside);
    const modalLayer = { visible: () => true, panel: () => modal, anchor: () => null, modal: () => true };
    const state = anchoredHarness(vi.fn(), vi.fn(), "z-index:80", modal);
    addOverlayLayer(modalLayer);
    try {
      await state.anchor.trigger("click");
      await flushPromises();
      const panel = state.overlay.panel.value!;
      document.body.append(panel);
      await flushPromises();
      expect(panel.closest("[inert]")).toBeNull();
      state.overlay.anchor.value = outside;
      await flushPromises();
      expect(panel.closest("[inert]")).not.toBeNull();
      state.overlay.anchor.value = state.anchor.element as HTMLElement;
      await flushPromises();
      expect(panel.closest("[inert]")).toBeNull();
      expect(state.onOpen).toHaveBeenCalledOnce();
    } finally {
      removeOverlayLayer(modalLayer);
    }
  });

  it.each(["close", "unmount"])("cancels rapid replacement and queued observer work on %s", async (ending) => {
    const frames = new Map<number, FrameRequestCallback>();
    let frameId = 0;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frames.set(++frameId, callback);
      return frameId;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => {
      frames.delete(id);
    });
    const observer = observeTargets();
    const state = replaceableAnchoredHarness();
    await flushPromises();
    state.overlay.show();
    await flushPromises();
    state.anchorKey.value = 1;
    state.panelKey.value = 1;
    await nextTick();
    state.anchorKey.value = 2;
    state.panelKey.value = 2;
    if (ending === "close") state.overlay.hide();
    else {
      state.wrapper.unmount();
      wrappers.splice(wrappers.indexOf(state.wrapper), 1);
    }
    await flushPromises();
    for (const callback of observer.callbacks) callback([], {} as ResizeObserver);
    expect(frames.size).toBe(0);
    expect(observer.targets.size).toBe(0);
    expect(state.onOpen).toHaveBeenCalledOnce();
  });

  it("opens an initially visible rendered panel once and observes its bound refs", async () => {
    const observer = observeTargets();
    const state = replaceableAnchoredHarness(true);
    await flushPromises();
    expect(state.onOpen).toHaveBeenCalledOnce();
    expect(state.overlay.style.value.zIndex).toBe("401");
    expect(observer.targets).toEqual(new Set([state.overlay.anchor.value, state.overlay.panel.value]));
  });

  it("attaches a modal keydown listener only while active and removes it before unmount", async () => {
    const add = vi.spyOn(document, "addEventListener");
    const remove = vi.spyOn(document, "removeEventListener");
    const Harness = defineComponent({
      setup() {
        const visible = ref(false);
        const container = ref<HTMLElement | null>(null);
        useOverlayLifecycle({ visible, container });
        return { visible, container };
      },
      template: '<button @click="visible = true">Open</button><section v-if="visible" ref="container" tabindex="-1"><button>Close</button></section>'
    });
    const wrapper = mount(Harness, { attachTo: document.body });
    wrappers.push(wrapper);
    expect(add.mock.calls.filter(([name]) => name === "keydown")).toHaveLength(0);
    await wrapper.get("button").trigger("click");
    await flushPromises();
    expect(add).toHaveBeenCalledWith("keydown", expect.any(Function));
    await key("Escape");
    expect(remove).toHaveBeenCalledWith("keydown", expect.any(Function));
  });
});

describe("shared modal isolation", () => {
  it("preserves pre-existing inert, isolates newly inserted background and restores nested modals in order", async () => {
    const existing = document.createElement("section");
    existing.setAttribute("inert", "consumer");
    document.body.append(existing);
    const Harness = defineComponent({
      components: { WlDialog, WlPopover },
      setup: () => ({ outer: ref(false), inner: ref(false) }),
      template: `<button class="outer-open" @click="outer = true">Open</button>
        <WlDialog v-model:visible="outer" header="Outer" :motion="false">
          <button class="inner-open" @click="inner = true">Inner</button>
          <button class="popover-open" @click="$refs.pop.show($event)">Popover</button>
          <WlPopover ref="pop" :motion="false"><button class="portal-action">Action</button><button>Next action</button></WlPopover>
          <WlDialog v-model:visible="inner" header="Inner" :motion="false"><button>Inner action</button></WlDialog>
        </WlDialog>`
    });
    const wrapper = mount(Harness, { attachTo: document.body });
    wrappers.push(wrapper);
    await wrapper.get(".outer-open").trigger("click");
    await flushPromises();
    expect(wrapper.element.closest("[inert]")).not.toBeNull();
    const outer = document.querySelector<HTMLElement>('[data-wl="dialog"]')!;
    expect(outer.closest("[inert]")).toBeNull();
    const added = document.createElement("section");
    document.body.append(added);
    await nextTick();
    expect(added.hasAttribute("inert")).toBe(true);
    document.querySelector<HTMLButtonElement>(".popover-open")!.click();
    await flushPromises();
    expect(document.querySelector(".portal-action")!.closest("[inert]")).toBeNull();
    const action = document.querySelector<HTMLButtonElement>(".portal-action")!;
    action.focus();
    expect((await key("Tab", action)).defaultPrevented).toBe(false);
    await key("Escape");
    document.querySelector<HTMLButtonElement>(".inner-open")!.click();
    await flushPromises();
    expect(outer.closest("[inert]")).not.toBeNull();
    const dialogs = document.querySelectorAll<HTMLElement>('[data-wl="dialog"]');
    expect(dialogs[1]!.closest("[inert]")).toBeNull();
    await key("Escape");
    expect(outer.closest("[inert]")).toBeNull();
    expect(added.hasAttribute("inert")).toBe(true);
    await key("Escape");
    expect(added.hasAttribute("inert")).toBe(false);
    expect(existing.getAttribute("inert")).toBe("consumer");
  });

  it("leaves nonmodal dialogs available without making the background inert", async () => {
    const wrapper = mount(WlDialog, { attachTo: document.body, props: { visible: true, modal: false, motion: false } });
    wrappers.push(wrapper);
    await flushPromises();
    expect(document.querySelector('[data-wl="dialog"]')?.closest("[inert]")).toBeNull();
    expect(document.body.querySelectorAll("[inert]")).toHaveLength(0);
    await wrapper.setProps({ modal: true });
    await flushPromises();
    expect(document.body.querySelectorAll("[inert]").length).toBeGreaterThan(0);
    expect(document.body.style.overflow).toBe("hidden");
    await wrapper.setProps({ modal: false });
    await flushPromises();
    expect(document.body.querySelectorAll("[inert]")).toHaveLength(0);
    expect(document.body.style.overflow).toBe("");
  });

  it("isolates inline sidebar siblings while retaining its dismissal backdrop", async () => {
    const Harness = defineComponent({
      components: { WlSidebar },
      setup: () => ({ mobile: ref(false) }),
      template: `<main><button class="open-sidebar" @click="mobile = true">Open</button>
        <WlSidebar v-model:mobile-open="mobile" brand="Navigation" />
        <button class="background">Background</button></main>`
    });
    const wrapper = mount(Harness, { attachTo: document.body });
    wrappers.push(wrapper);
    await wrapper.get(".open-sidebar").trigger("click");
    await flushPromises();
    expect(wrapper.get(".background").element.closest("[inert]")).not.toBeNull();
    expect(wrapper.get("aside").attributes("aria-modal")).toBe("true");
    const backdrop = wrapper.get(".wl-sidebar__backdrop");
    expect(backdrop.element.closest("[inert]")).toBeNull();
    await backdrop.trigger("click");
    await flushPromises();
    expect(wrapper.get(".background").element.closest("[inert]")).toBeNull();
    expect(wrapper.get("aside").attributes("aria-modal")).toBeUndefined();
  });

  it("isolates inline mobile filters while retaining the close backdrop", async () => {
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
      matches: true, media: query, onchange: null,
      addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn()
    }));
    const Harness = defineComponent({
      components: { WlFilterBar },
      setup: () => ({ open: ref(false) }),
      template: "<button class=\"background\">Background</button><WlFilterBar v-model:open=\"open\"><button>Filter control</button></WlFilterBar>"
    });
    const wrapper = mount(Harness, { attachTo: document.body });
    wrappers.push(wrapper);
    wrapper.vm.open = true;
    await flushPromises();
    expect(wrapper.get(".wl-filter-bar__panel").attributes("aria-modal")).toBe("true");
    expect(wrapper.get(".background").element.closest("[inert]")).not.toBeNull();
    const backdrop = wrapper.get(".wl-filter-bar__backdrop");
    expect(backdrop.element.closest("[inert]")).toBeNull();
    await backdrop.trigger("click");
    await flushPromises();
    expect(wrapper.get(".background").element.closest("[inert]")).toBeNull();
  });

  it("shares Escape ownership across independent Vue applications", async () => {
    const mountDialog = () => {
      const Harness = defineComponent({
        components: { WlDialog }, setup: () => ({ open: ref(false) }),
        template: '<button @click="open = true">Open</button><WlDialog v-model:visible="open" header="Dialog" :motion="false" />'
      });
      const wrapper = mount(Harness, { attachTo: document.body });
      wrappers.push(wrapper);
      return wrapper;
    };
    const first = mountDialog();
    const second = mountDialog();
    await first.get("button").trigger("click");
    await flushPromises();
    await second.get("button").trigger("click");
    await flushPromises();
    expect(document.querySelectorAll('[data-wl="dialog"]')).toHaveLength(2);
    await key("Escape");
    expect(document.querySelectorAll('[data-wl="dialog"]')).toHaveLength(1);
    expect(first.vm.open).toBe(true);
    expect(second.vm.open).toBe(false);
  });

  it("does not restore focus from a lower application while a different modal remains open", async () => {
    const Harness = defineComponent({
      components: { WlDialog }, setup: () => ({ open: ref(false) }),
      template: '<button @click="open = true">Open</button><WlDialog v-model:visible="open" header="Dialog" :motion="false"><input /></WlDialog>'
    });
    const first = mount(Harness, { attachTo: document.body });
    const second = mount(Harness, { attachTo: document.body });
    wrappers.push(first, second);
    first.get<HTMLButtonElement>("button").element.focus();
    await first.get("button").trigger("click");
    await flushPromises();
    await second.get("button").trigger("click");
    await flushPromises();
    const input = document.querySelectorAll<HTMLInputElement>('[data-wl="dialog"] input')[1]!;
    input.focus();
    first.vm.open = false;
    await flushPromises();
    expect(document.activeElement).toBe(input);
    expect(document.querySelectorAll('[data-wl="dialog"]')).toHaveLength(1);
  });
});

describe("modal focus targets", () => {
  it("includes native interactive content and excludes hidden, disabled and negative tab stops", () => {
    const container = document.createElement("section");
    container.innerHTML = `<button disabled tabindex="0">Disabled</button><input type="hidden" />
      <div hidden><button>Hidden</button></div><div style="display:none"><button>Invisible</button></div>
      <div inert><button>Inert</button></div><button tabindex="-2">Negative</button>
      <details><summary id="summary">Summary</summary><button>Closed content</button></details>
      <div id="editor" contenteditable="true">Edit</div><video id="video" controls></video>
      <audio id="audio" controls></audio><iframe id="frame"></iframe><object id="object"></object>
      <embed id="embed" /><img
        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='gray'/%3E%3C/svg%3E"
        usemap="#focus-map" alt="Navigation map" width="100" height="100" />
      <map name="focus-map"><area id="area" href="/" alt="Home" shape="rect" coords="0,0,100,100"></map>
      <button id="last">Last</button>`;
    document.body.append(container);
    expect(getFocusableElements(container).map((element) => element.id))
      .toEqual(["summary", "editor", "video", "audio", "frame", "object", "embed", "area", "last"]);
    container.querySelector<HTMLElement>("#last")!.focus();
    const tab = new KeyboardEvent("keydown", { key: "Tab", cancelable: true });
    trapOverlayFocus(tab, container);
    expect(tab.defaultPrevented).toBe(true);
    expect(document.activeElement?.id).toBe("summary");
  });
});
