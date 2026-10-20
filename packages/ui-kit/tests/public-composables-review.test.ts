import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { useWlAnnouncer, useWlClipboard, useWlControllable, useWlDisclosure, useWlHotkey, useWlMediaQuery, useWlScrollLock, useWlTheme, wlThemeInitScript } from "../src/composables";
import { useWlResultsAnnouncement } from "../src/composables/useWlResultsAnnouncement";
import { WlConfig } from "../src/config";
import { wlLocaleEn } from "../src/locale";
import { refreshOverlayLayers } from "../src/utils/overlayStack";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.documentElement.removeAttribute("data-wl-theme");
  localStorage.clear();
});

describe("public composable lifecycle", () => {
  it("observes media only after mount and removes its listener", async () => {
    const media = new EventTarget() as MediaQueryList;
    Object.assign(media, { matches: false });
    const remove = vi.spyOn(media, "removeEventListener");
    vi.stubGlobal("matchMedia", vi.fn(() => media));
    const wrapper = mount(defineComponent({ setup() {
      const matches = useWlMediaQuery("(min-width: 640px)");
      return () => h("span", String(matches.value));
    } }));
    expect(wrapper.text()).toBe("false");
    Object.assign(media, { matches: true });
    media.dispatchEvent(new Event("change"));
    await nextTick();
    expect(wrapper.text()).toBe("true");
    wrapper.unmount();
    expect(remove).toHaveBeenCalledWith("change", expect.any(Function));
  });

  it("switches themes, persists preference and follows system changes", async () => {
    const dark = new EventTarget() as MediaQueryList;
    Object.assign(dark, { matches: false });
    vi.stubGlobal("matchMedia", vi.fn(() => dark));
    localStorage.setItem("review-theme", "dark");
    let api!: ReturnType<typeof useWlTheme>;
    const wrapper = mount(defineComponent({ setup() {
      api = useWlTheme({ storageKey: "review-theme" });

      return () => h("div");
    } }));
    expect(document.documentElement.dataset.wlTheme).toBe("gavia-dark");
    api.setPreference("system");
    await nextTick();
    expect(document.documentElement.dataset.wlTheme).toBe("gavia");
    Object.assign(dark, { matches: true });
    dark.dispatchEvent(new Event("change"));
    await nextTick();
    expect(document.documentElement.dataset.wlTheme).toBe("gavia-dark");
    expect(localStorage.getItem("review-theme")).toBe("system");
    wrapper.unmount();
  });

  it("initializes a theme despite blocked storage and escapes inline script terminators", () => {
    const script = wlThemeInitScript({ storageKey: "blocked", themes: { light: "</script>", dark: "night" } });
    expect(script).not.toContain("</script>");
    new Function("document", "localStorage", "matchMedia", script)(document, { getItem: () => {
      throw new Error("blocked");
    } }, () => ({ matches: true }));
    expect(document.documentElement.dataset.wlTheme).toBe("night");
  });

  it("owns one pair of live regions per app, repeats messages and removes them on app unmount", async () => {
    const announcements: Array<ReturnType<typeof useWlAnnouncer>> = [];
    const Child = defineComponent({ setup() {
      announcements.push(useWlAnnouncer());

      return () => h("div");
    } });
    const first = mount(defineComponent({ setup: () => () => h("main", [h(Child), h(Child)]) }));
    const second = mount(Child);
    await announcements[0]!.announce("Saved");
    await announcements[1]!.announce("Saved");
    await announcements[2]!.announce("Failed", "assertive");
    expect(document.querySelectorAll("[data-wl-announcer]")).toHaveLength(4);
    expect([...document.querySelectorAll('[aria-live="polite"][data-wl-announcer]')].map((item) => item.textContent)).toContain("Saved");
    first.unmount();
    expect(document.querySelectorAll("[data-wl-announcer]")).toHaveLength(2);
    second.unmount();
    expect(document.querySelectorAll("[data-wl-announcer]")).toHaveLength(0);
    refreshOverlayLayers();
  });

  it("debounces result announcements and cancels a closed list", async () => {
    vi.useFakeTimers();
    const query = ref("");
    const visible = ref(true);
    const count = ref(1);
    const wrapper = mount(defineComponent({ setup() {
      useWlResultsAnnouncement({ query: () => query.value, count: () => count.value, visible: () => visible.value });
      return () => h("div");
    } }), { global: { plugins: [[WlConfig, { locale: wlLocaleEn }]] } });
    query.value = "a";
    await nextTick();
    await vi.advanceTimersByTimeAsync(499);
    expect(document.querySelector("[data-wl-announcer]")).toBeNull();
    count.value = 2;
    await nextTick();
    await vi.advanceTimersByTimeAsync(500);
    expect(document.querySelector('[data-wl-announcer][aria-live="polite"]')?.textContent).toBe("2 results found");
    query.value = "ab";
    visible.value = false;
    await nextTick();
    await vi.advanceTimersByTimeAsync(500);
    expect(document.querySelector('[data-wl-announcer][aria-live="polite"]')?.textContent).toBe("2 results found");
    wrapper.unmount();
  });

  it("matches modifiers, ignores editable targets and releases global hotkeys", () => {
    const action = vi.fn();
    const wrapper = mount(defineComponent({ setup() {
      useWlHotkey("mod+k", action);

      return () => h("input");
    } }), { attachTo: document.body });
    wrapper.get("input").element.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }));
    expect(action).not.toHaveBeenCalled();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, cancelable: true }));
    expect(action).toHaveBeenCalledTimes(1);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, shiftKey: true }));
    expect(action).toHaveBeenCalledTimes(1);
    wrapper.unmount();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
    expect(action).toHaveBeenCalledTimes(1);
  });

  it("copies securely, resets state and ignores completion after unmount", async () => {
    vi.useFakeTimers();
    let resolve!: () => void;
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    let api!: ReturnType<typeof useWlClipboard>;
    const wrapper = mount(defineComponent({ setup() {
      api = useWlClipboard({ resetAfter: 100 });

      return () => h("div");
    } }));
    await expect(api.copy("hello")).resolves.toBe(true);
    expect(api.copied.value).toBe(true);
    await vi.advanceTimersByTimeAsync(100);
    expect(api.copied.value).toBe(false);
    writeText.mockReturnValue(new Promise<void>((done) => {
      resolve = done;
    }));
    const pending = api.copy("late");
    wrapper.unmount();
    resolve();
    await expect(pending).resolves.toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("keeps controlled state with the owner and uncontrolled state locally", async () => {
    const value = ref<number | undefined>(undefined);
    const changed = vi.fn();
    let control!: ReturnType<typeof useWlControllable<number>>;
    let disclosure!: ReturnType<typeof useWlDisclosure>;
    const wrapper = mount(defineComponent({ setup() {
      control = useWlControllable({ value: () => value.value, defaultValue: 1, onChange: changed });
      disclosure = useWlDisclosure();
      return () => h("div");
    } }));
    control.value = 2;
    expect(control.value).toBe(2);
    value.value = 10;
    await nextTick();
    control.value = 20;
    expect(control.value).toBe(10);
    expect(changed).toHaveBeenLastCalledWith(20);
    disclosure.toggle();
    expect(disclosure.isOpen.value).toBe(true);
    disclosure.close();
    expect(disclosure.isOpen.value).toBe(false);
    wrapper.unmount();
  });

  it("reference-counts scroll locks and restores the original inline style", async () => {
    document.body.style.overflow = "clip";
    const enabled = ref(true);
    const Harness = defineComponent({ setup() {
      useWlScrollLock(enabled);

      return () => h("div");
    } });
    const first = mount(Harness);
    const second = mount(Harness);
    first.unmount();
    expect(document.body.style.overflow).toBe("hidden");
    enabled.value = false;
    await nextTick();
    expect(document.body.style.overflow).toBe("clip");
    second.unmount();
    document.body.style.removeProperty("overflow");
  });
});
