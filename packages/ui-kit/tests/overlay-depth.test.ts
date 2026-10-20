import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import type { WlPopoverAlign, WlPopoverPlacement } from "../src/overlay-types";
import { WlDialog, WlDrawer, WlPopover } from "../src";
import { useAnchoredOverlay } from "../src/utils/anchoredOverlay";

const wrappers: VueWrapper[] = [];
afterEach(async () => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount());
  await nextTick();
  vi.restoreAllMocks();
  vi.useRealTimers();
  document.body.replaceChildren();
});

describe("modal surface sizing and initial focus", () => {
  it("applies Dialog presets/fullscreen while explicit width keeps precedence", async () => {
    const wrapper = mount(WlDialog, { attachTo: document.body, props: { visible: true, motion: false, size: "lg", width: 530, fullscreen: "mobile", ariaLabel: "Dialog" } });
    wrappers.push(wrapper);
    await flushPromises();
    const panel = document.querySelector<HTMLElement>(".wl-dialog")!;
    expect(panel.classList.contains("wl-dialog--lg")).toBe(true);
    expect(panel.classList.contains("wl-dialog--mobile-fullscreen")).toBe(true);
    expect(panel.style.width).toBe("530px");
    expect(panel.dataset.size).toBe("lg");
    await wrapper.setProps({ fullscreen: true });
    expect(panel.classList.contains("wl-dialog--fullscreen")).toBe(true);
    expect(panel.style.width).toBe("");
  });

  it("uses fullscreen on the mobile breakpoint and restores explicit width on desktop", async () => {
    let change!: (event: MediaQueryListEvent) => void;
    const remove = vi.fn();
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
      media: query, matches: false, onchange: null,
      addEventListener: (_name: string, listener: EventListenerOrEventListenerObject | null) => {
        change = listener as (event: MediaQueryListEvent) => void;
      },
      removeEventListener: remove, addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn()
    }));
    const wrapper = mount(WlDialog, { attachTo: document.body, props: { visible: true, motion: false, width: 530, fullscreen: "mobile" } });
    wrappers.push(wrapper);
    await flushPromises();
    const panel = document.querySelector<HTMLElement>(".wl-dialog")!;
    expect(panel.style.width).toBe("530px");
    change({ matches: true } as MediaQueryListEvent);
    await nextTick();
    expect(panel.style.width).toBe("");
    change({ matches: false } as MediaQueryListEvent);
    await nextTick();
    expect(panel.style.width).toBe("530px");
    wrapper.unmount();
    wrappers.splice(wrappers.indexOf(wrapper), 1);
    expect(remove).toHaveBeenCalledWith("change", expect.any(Function));
  });

  it.each(["selector", "resolver"])("honors an explicit %s initial focus policy before autofocus", async (mode) => {
    const Harness = defineComponent({
      components: { WlDialog },
      setup() {
        const visible = ref(false);
        const preferred = ref<HTMLInputElement | null>(null);
        const initial = mode === "selector" ? "[data-preferred]" : () => preferred.value;
        return { visible, preferred, initial };
      },
      template: "<button @click=\"visible = true\">Open</button><WlDialog v-model:visible=\"visible\" header=\"Edit\" :motion=\"false\" :initial-focus=\"initial\"><input autofocus /><input ref=\"preferred\" data-preferred tabindex=\"-1\" /></WlDialog>"
    });
    const wrapper = mount(Harness, { attachTo: document.body });
    wrappers.push(wrapper);
    await wrapper.get("button").trigger("click");
    await flushPromises();
    expect(document.activeElement).toBe(document.querySelector("[data-preferred]"));
  });

  it("falls back safely for invalid selectors and targets outside the modal", async () => {
    const external = document.createElement("button");
    document.body.append(external);
    const wrapper = mount(WlDialog, { attachTo: document.body, props: { visible: true, motion: false, header: "Edit", initialFocus: "[" } });
    wrappers.push(wrapper);
    await flushPromises();
    expect(document.activeElement).toBe(document.querySelector(".wl-dialog__actions button"));
    await wrapper.setProps({ visible: false });
    await flushPromises();
    await wrapper.setProps({ visible: true, initialFocus: external });
    await flushPromises();
    expect(document.activeElement).toBe(document.querySelector(".wl-dialog__actions button"));
  });

  it("adds Drawer closable, width/size and afterLeave consistently with Dialog", async () => {
    const wrapper = mount(WlDrawer, { attachTo: document.body, props: { visible: true, motion: false, width: "33rem", size: "sm", closable: false, ariaLabel: "Drawer" }, global: { stubs: { transition: false } } });
    wrappers.push(wrapper);
    await flushPromises();
    const panel = document.querySelector<HTMLElement>(".wl-drawer")!;
    expect(panel.style.width).toBe("33rem");
    expect(panel.classList.contains("wl-drawer--size-sm")).toBe(true);
    expect(panel.querySelector("header")).toBeNull();
    await wrapper.setProps({ closable: true });
    expect(panel.querySelector("header button")).not.toBeNull();
    await wrapper.setProps({ visible: false });
    await flushPromises();
    expect(wrapper.emitted("afterLeave")).toHaveLength(1);
    expect(document.querySelector(".wl-drawer")).toBeNull();
  });
});

describe("dismissible compatibility", () => {
  it("keeps default mounts silent and warns only for explicit legacy spelling", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    wrappers.push(mount(WlDialog), mount(WlDrawer), mount(WlPopover));
    expect(warn).not.toHaveBeenCalled();
    const legacy = mount(WlDrawer, { props: { dismissable: false } });
    wrappers.push(legacy);
    expect(warn).toHaveBeenCalledExactlyOnceWith(expect.stringContaining("dismissable is deprecated"));
  });

  it("gives the normalized spelling precedence and keeps old default dismissal behavior", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const dialog = mount(WlDialog, {
      attachTo: document.body, props: { visible: true, motion: false, dismissable: true, dismissible: false }
    });
    wrappers.push(dialog);
    await flushPromises();
    document.querySelector(".wl-dialog-mask")!.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await nextTick();
    expect(dialog.emitted("update:visible")).toBeUndefined();
    await dialog.setProps({ dismissible: true });
    document.querySelector(".wl-dialog-mask")!.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await nextTick();
    expect(dialog.emitted("update:visible")).toEqual([[false]]);
    const drawer = mount(WlDrawer, { attachTo: document.body, props: { visible: true, motion: false } });
    wrappers.push(drawer);
    await flushPromises();
    document.querySelector(".wl-drawer-mask")!.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await nextTick();
    expect(drawer.emitted("update:visible")).toEqual([[false]]);
  });
});

function positioned(placement: WlPopoverPlacement, align: WlPopoverAlign) {
  let overlay!: ReturnType<typeof useAnchoredOverlay>;
  const Harness = defineComponent({
    setup() {
      overlay = useAnchoredOverlay({ placement, align });
      return () => h("div", [h("button", { onClick: overlay.show }, "Open"), overlay.visible.value && h("section", { ref: overlay.panel }, "Panel")]);
    }
  });
  const wrapper = mount(Harness, { attachTo: document.body });
  wrappers.push(wrapper);
  vi.spyOn(wrapper.get("button").element, "getBoundingClientRect").mockReturnValue(new DOMRect(100, 100, 100, 30));
  vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(160);
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(80);
  return { wrapper, overlay };
}

describe("anchored placement", () => {
  it.each([
    ["bottom", "end", "40px", "134px", "bottom"],
    ["top", "center", "70px", "16px", "top"],
    ["right", "end", "204px", "50px", "right"],
    ["left", "start", "204px", "100px", "right"]
  ] as const)("positions %s/%s and flips when the requested side has insufficient room", async (placement, align, left, top, actual) => {
    const { wrapper, overlay } = positioned(placement, align);
    await wrapper.get("button").trigger("click");
    await flushPromises();
    expect(overlay.style.value).toMatchObject({ left, top });
    expect(overlay.placement.value).toBe(actual);
    expect(Object.keys(overlay.arrowStyle.value)).toEqual([actual === "top" || actual === "bottom" ? "left" : "top"]);
  });
});

function triggered(trigger: "click" | "hover" | "focus") {
  const Harness = defineComponent({
    components: { WlPopover }, setup: () => ({ trigger }),
    template: "<WlPopover :trigger=\"trigger\" :motion=\"false\" arrow aria-label=\"Details\"><template #trigger=\"{attrs}\"><button class=\"trigger\" v-bind=\"attrs\">Open</button></template><button class=\"panel-action\">Action</button></WlPopover><button class=\"outside\">Outside</button>"
  });
  const wrapper = mount(Harness, { attachTo: document.body });
  wrappers.push(wrapper);
  return wrapper;
}

describe("popover trigger slot", () => {
  it("binds click controls and an arrow to the actual panel ID", async () => {
    const wrapper = triggered("click");
    const button = wrapper.get(".trigger");
    expect(button.attributes("aria-expanded")).toBe("false");
    await button.trigger("click");
    await flushPromises();
    const panel = document.querySelector<HTMLElement>(".wl-popover")!;
    expect(button.attributes("aria-controls")).toBe(panel.id);
    expect(button.attributes("aria-expanded")).toBe("true");
    expect(panel.querySelector(".wl-popover__arrow")?.getAttribute("aria-hidden")).toBe("true");
    await button.trigger("click");
    await flushPromises();
    expect(document.querySelector(".wl-popover")).toBeNull();
  });

  it("keeps a hovered panel open while crossing into it and cancels delayed closing", async () => {
    vi.useFakeTimers();
    const wrapper = triggered("hover");
    const button = wrapper.get(".trigger");
    await button.trigger("mouseenter");
    await nextTick();
    const panel = document.querySelector<HTMLElement>(".wl-popover")!;
    await button.trigger("mouseleave");
    vi.advanceTimersByTime(100);
    panel.dispatchEvent(new MouseEvent("mouseenter"));
    vi.advanceTimersByTime(300);
    expect(document.querySelector(".wl-popover")).not.toBeNull();
    panel.dispatchEvent(new MouseEvent("mouseleave", { relatedTarget: document.body }));
    vi.advanceTimersByTime(120);
    await nextTick();
    expect(document.querySelector(".wl-popover")).toBeNull();
  });

  it("keeps focused content usable and closes after focus leaves trigger and panel", async () => {
    vi.useFakeTimers();
    const wrapper = triggered("focus");
    wrapper.get<HTMLButtonElement>(".trigger").element.focus();
    await nextTick();
    document.querySelector<HTMLButtonElement>(".panel-action")!.focus();
    vi.advanceTimersByTime(200);
    expect(document.querySelector(".wl-popover")).not.toBeNull();
    wrapper.get<HTMLButtonElement>(".outside").element.focus();
    vi.advanceTimersByTime(120);
    await nextTick();
    expect(document.querySelector(".wl-popover")).toBeNull();
  });
});
