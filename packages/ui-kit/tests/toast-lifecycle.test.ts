import { mount, type VueWrapper } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, reactive } from "vue";
import WlToast from "../src/components/WlToast.vue";
import { useWlToast, type WlToastController } from "../src/composables/useWlToast";
import { useToastStore, type WlToastPosition, WlToastService, type WlToastServiceOptions, type WlToastStore } from "../src/services/toast";

const wrappers: VueWrapper[] = [];
beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(async () => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount());
  await nextTick();
  vi.clearAllTimers();
  vi.restoreAllMocks();
  vi.useRealTimers();
  document.body.replaceChildren();
});

function harness(options: WlToastServiceOptions = {}) {
  let toast!: WlToastController;
  let grouped!: WlToastController;
  let store!: WlToastStore;
  const props = reactive({ position: "bottom-center" as WlToastPosition, max: 5 });
  const Harness = defineComponent({
    setup() {
      toast = useWlToast();
      grouped = useWlToast({ group: "workspace" });
      store = useToastStore();
      return () => h("div", [h(WlToast, { ...props, motion: false }), h(WlToast, { group: "workspace", motion: false })]);
    }
  });
  const wrapper = mount(Harness, { attachTo: document.body, global: { plugins: [[WlToastService, options]] } });
  wrappers.push(wrapper);
  return { toast, grouped, store, props, wrapper };
}

describe("toast lifetimes and interaction", () => {
  it.each([
    ["neutral", "info", "status"],
    ["accent", "info", "status"],
    ["info", "info", "status"],
    ["success", "success", "status"],
    ["warning", "warn", "status"],
    ["danger", "error", "alert"]
  ] as const)("shows canonical %s tone with its legacy projection and live role", async (tone, severity, role) => {
    const { toast, store } = harness();
    const id = toast.show("Notification", { tone });
    await nextTick();
    expect(store.messages.value[0]).toMatchObject({ id, tone, severity, life: tone === "danger" ? 8000 : 5000 });
    const message = document.querySelector(".wl-toast__message")!;
    expect(message.getAttribute("data-tone")).toBe(tone);
    expect(message.getAttribute("data-severity")).toBe(severity);
    expect(message.getAttribute("role")).toBe(role);
    expect(message.querySelector(".wl-toast__icon")?.getAttribute("data-tone")).toBe(tone);
  });

  it("lets explicit tone override helper names and keeps normal helper calls silent", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { toast, store } = harness();
    toast.error("Recovered", { tone: "success" });
    toast.info("Critical", { tone: "danger" });
    toast.show("Default");
    expect(store.messages.value.map(({ tone, severity, life }) => ({ tone, severity, life }))).toEqual([
      { tone: "success", severity: "success", life: 5000 },
      { tone: "danger", severity: "error", life: 8000 },
      { tone: "info", severity: "info", life: 5000 }
    ]);
    expect(warn).not.toHaveBeenCalled();
  });

  it("resets tone lifetime without releasing a paused message and gives explicit tone priority", () => {
    const { toast, store } = harness();
    const id = toast.show("Initial");
    vi.advanceTimersByTime(4000);
    store.pause(id, "focus");
    toast.update(id, { tone: "danger", severity: "success" });
    expect(store.messages.value[0]).toMatchObject({ id, tone: "danger", severity: "error", life: 8000 });
    vi.advanceTimersByTime(9000);
    expect(store.messages.value).toHaveLength(1);
    store.resume(id, "focus");
    vi.advanceTimersByTime(7999);
    expect(store.messages.value).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(store.messages.value).toHaveLength(0);
  });

  it("maps legacy severity patches and warns only once per application", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const first = harness();
    const id = first.toast.show("Canonical", { tone: "danger" });
    first.toast.update(id, { severity: "warn" });
    first.store.add({ severity: "success", summary: "Legacy" });
    await nextTick();
    expect(first.store.messages.value[0]).toMatchObject({ id, tone: "warning", severity: "warn", life: 5000 });
    expect(document.querySelector(".wl-toast__message")?.getAttribute("role")).toBe("status");
    expect(warn).toHaveBeenCalledTimes(1);
    const second = harness();
    second.store.add({ severity: "error", summary: "Other app" });
    expect(warn).toHaveBeenCalledTimes(2);
    expect(second.store.messages.value[0]).toMatchObject({ tone: "danger", severity: "error", life: 8000 });
  });

  it("preserves detail strings and returns IDs, with five seconds for normal messages and eight for errors", async () => {
    const { toast, store } = harness();
    const success = toast.ok("Saved", "Details");
    const error = toast.err("Failed");
    expect(success).toBeTypeOf("number");
    expect(error).not.toBe(success);
    expect(store.messages.value[0]?.detail).toBe("Details");
    await nextTick();
    expect(document.querySelector('.wl-toast__message[data-severity="success"]')?.getAttribute("role")).toBe("status");
    expect(document.querySelector('.wl-toast__message[data-severity="error"]')?.getAttribute("role")).toBe("alert");
    expect(document.querySelector(".wl-toast")?.hasAttribute("aria-live")).toBe(false);
    vi.advanceTimersByTime(5000);
    expect(store.messages.value.map((message) => message.id)).toEqual([error]);
    vi.advanceTimersByTime(3000);
    expect(store.messages.value).toHaveLength(0);
  });

  it("supports service defaults, per-message lifetimes, sticky messages and aliases", () => {
    const { toast, store } = harness({ life: 1000, errorLife: 2000 });
    const sticky = toast.info("Persistent", { life: 0 });
    const short = toast.warning("Short", { life: 100 });
    toast.success("Normal");
    const error = toast.error("Error");
    expect(toast.ok).toBe(toast.success);
    expect(toast.warn).toBe(toast.warning);
    expect(toast.err).toBe(toast.error);
    vi.advanceTimersByTime(100);
    expect(store.messages.value.some((message) => message.id === short)).toBe(false);
    vi.advanceTimersByTime(900);
    expect(store.messages.value.map((message) => message.id)).toEqual([sticky, error]);
    vi.advanceTimersByTime(1000);
    expect(store.messages.value.map((message) => message.id)).toEqual([sticky]);
    toast.dismiss(sticky);
    expect(store.messages.value).toHaveLength(0);
  });

  it("keeps the remaining lifetime paused until hover and focus have both left", async () => {
    const { toast, store } = harness();
    toast.info("Read me", { life: 1000, action: { label: "Action", onClick: vi.fn() } });
    await nextTick();
    const message = document.querySelector<HTMLElement>(".wl-toast__message")!;
    vi.advanceTimersByTime(300);
    message.dispatchEvent(new MouseEvent("mouseenter"));
    message.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    message.dispatchEvent(new MouseEvent("mouseleave"));
    vi.advanceTimersByTime(5000);
    expect(store.messages.value).toHaveLength(1);
    message.dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: message.querySelector("button") }));
    vi.advanceTimersByTime(1000);
    expect(store.messages.value).toHaveLength(1);
    message.dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: document.body }));
    vi.advanceTimersByTime(699);
    expect(store.messages.value).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(store.messages.value).toHaveLength(0);
  });

  it("updates content without extending the timer and resets only an explicit new lifetime", () => {
    const { toast, store } = harness();
    const id = toast.info("Initial", { life: 1000 });
    vi.advanceTimersByTime(400);
    toast.update(id, { summary: "Updated", detail: "More detail" });
    expect(store.messages.value[0]).toMatchObject({ id, summary: "Updated", detail: "More detail" });
    vi.advanceTimersByTime(599);
    expect(store.messages.value).toHaveLength(1);
    toast.update(id, { life: 2000 });
    vi.advanceTimersByTime(1999);
    expect(store.messages.value).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(store.messages.value).toHaveLength(0);
    toast.update(id, { summary: "No resurrection" });
    expect(store.messages.value).toHaveLength(0);
  });

  it("retains pause reasons when an update resets the message lifetime", () => {
    const { toast, store } = harness();
    const id = toast.info("Initial", { life: 1000 });
    vi.advanceTimersByTime(300);
    store.pause(id, "focus");
    toast.update(id, { summary: "Updated", life: 1200 });
    vi.advanceTimersByTime(5000);
    expect(store.messages.value).toHaveLength(1);
    store.resume(id, "focus");
    vi.advanceTimersByTime(1199);
    expect(store.messages.value).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(store.messages.value).toHaveLength(0);
  });

  it("limits the displayed group and updates position without affecting other groups", async () => {
    const { toast, grouped, store, props } = harness();
    props.max = 2;
    props.position = "top-right";
    const other = grouped.ok("Workspace", { life: 0 });
    const old = toast.ok("Old", { life: 0 });
    toast.ok("Next", { life: 0 });
    toast.ok("Newest", { life: 0 });
    await nextTick();
    expect(store.messages.value.some((message) => message.id === old)).toBe(false);
    expect(store.messages.value.some((message) => message.id === other)).toBe(true);
    expect(document.querySelector(".wl-toast")?.getAttribute("data-position")).toBe("top-right");
    toast.update(other, { summary: "Wrong group" });
    toast.dismiss(other);
    expect(store.messages.value.find((message) => message.id === other)?.summary).toBe("Workspace");
    toast.clear();
    expect(store.messages.value.map((message) => message.id)).toEqual([other]);
  });

  it("runs actions once and removes their message and timer", async () => {
    const { toast, store } = harness();
    const action = vi.fn();
    const scheduled = vi.spyOn(globalThis, "setTimeout");
    const cancelled = vi.spyOn(globalThis, "clearTimeout");
    toast.success("Deleted", { action: { label: "Undo", onClick: action } });
    const timer = scheduled.mock.results[scheduled.mock.results.length - 1]!.value;
    await nextTick();
    document.querySelector<HTMLButtonElement>(".wl-toast__action")!.click();
    await nextTick();
    expect(action).toHaveBeenCalledOnce();
    expect(store.messages.value).toHaveLength(0);
    expect(cancelled).toHaveBeenCalledWith(timer);
  });

  it("clears timers when the Vue application unmounts", () => {
    const { toast, wrapper } = harness();
    toast.info("Pending");
    expect(vi.getTimerCount()).toBe(1);
    wrapper.unmount();
    wrappers.splice(wrappers.indexOf(wrapper), 1);
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("promise toast transitions", () => {
  it("uses service lifetime after settlement even when the success tone matches loading", async () => {
    const { toast, store } = harness({ life: 1200 });
    const pending = toast.promise(Promise.resolve(42), {
      loading: { summary: "Loading", tone: "info" },
      success: { summary: "Done", tone: "info" },
      error: "Failed"
    });
    const id = store.messages.value[0]!.id;
    expect(store.messages.value[0]?.life).toBe(0);
    await expect(pending).resolves.toBe(42);
    expect(store.messages.value[0]).toMatchObject({ id, tone: "info", life: 1200 });
    vi.advanceTimersByTime(1200);
    expect(store.messages.value).toHaveLength(0);
  });

  it("uses error lifetime after settlement even when loading already has danger tone", async () => {
    const { toast, store } = harness({ errorLife: 2300 });
    const reason = new Error("Failed");
    const pending = toast.promise(Promise.reject(reason), {
      loading: { summary: "Loading", tone: "danger" }, success: "Done", error: "Failed"
    });
    const id = store.messages.value[0]!.id;
    await expect(pending).rejects.toBe(reason);
    expect(store.messages.value[0]).toMatchObject({ id, tone: "danger", severity: "error", life: 2300 });
    vi.advanceTimersByTime(2300);
    expect(store.messages.value).toHaveLength(0);
  });

  it("keeps an explicitly sticky terminal message sticky", async () => {
    const { toast, store } = harness();
    await toast.promise(Promise.resolve(42), {
      loading: { summary: "Loading", tone: "info" },
      success: { summary: "Read this", tone: "info", life: 0 },
      error: "Failed"
    });
    vi.advanceTimersByTime(15000);
    expect(store.messages.value[0]).toMatchObject({ tone: "info", summary: "Read this", life: 0 });
  });

  it("honours the result tone while updating the original pending message", async () => {
    const { toast, store } = harness();
    let resolve!: (value: number) => void;
    const pending = toast.promise(new Promise<number>((done) => {
      resolve = done;
    }), {
      loading: { summary: "Saving", tone: "accent" },
      success: { summary: "Review needed", tone: "warning" },
      error: "Failed"
    });
    const id = store.messages.value[0]!.id;
    expect(store.messages.value[0]).toMatchObject({ id, tone: "accent", life: 0 });
    resolve(42);
    await expect(pending).resolves.toBe(42);
    expect(store.messages.value[0]).toMatchObject({ id, tone: "warning", severity: "warn", life: 5000 });
  });

  it("updates the same pending ID and returns the operation result", async () => {
    const { toast, store } = harness();
    let resolve!: (value: number) => void;
    const pending = toast.promise(new Promise<number>((done) => {
      resolve = done;
    }), {
      loading: "Saving", success: (value) => ({ summary: `Saved ${value}`, life: 100 }), error: "Failed"
    });
    const id = store.messages.value[0]!.id;
    expect(store.messages.value[0]?.life).toBe(0);
    vi.advanceTimersByTime(15000);
    expect(store.messages.value).toHaveLength(1);
    resolve(42);
    await expect(pending).resolves.toBe(42);
    expect(store.messages.value[0]).toMatchObject({ id, severity: "success", summary: "Saved 42" });
    vi.advanceTimersByTime(100);
    expect(store.messages.value).toHaveLength(0);
  });

  it("shows the operation error and preserves the rejection for its caller", async () => {
    const { toast, store } = harness();
    const failure = new Error("Network failed");
    const pending = toast.promise(Promise.reject(failure), {
      loading: "Loading", success: "Done", error: (error) => (error as Error).message
    });
    await expect(pending).rejects.toBe(failure);
    expect(store.messages.value[0]).toMatchObject({ severity: "error", summary: "Network failed", life: 8000 });
  });

  it("does not recreate a pending toast dismissed by the user", async () => {
    const { toast, store } = harness();
    let resolve!: (value: string) => void;
    const pending = toast.promise(new Promise<string>((done) => {
      resolve = done;
    }), {
      loading: "Saving", success: "Done", error: "Failed"
    });
    toast.dismiss(store.messages.value[0]!.id);
    resolve("saved");
    await expect(pending).resolves.toBe("saved");
    expect(store.messages.value).toHaveLength(0);
  });
});
