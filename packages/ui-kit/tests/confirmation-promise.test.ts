import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, isReactive, nextTick, reactive, ref } from "vue";
import type { WlPt } from "../src/pt-types";
import WlConfirmDialog from "../src/components/WlConfirmDialog.vue";
import { useWlConfirm, type WlConfirmController } from "../src/composables/useWlConfirm";
import { useConfirmationStore, type WlConfirmation, WlConfirmationService, type WlConfirmationStore } from "../src/services/confirmation";

const wrappers: VueWrapper[] = [];
afterEach(async () => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount());
  await nextTick();
  document.body.replaceChildren();
});

function harness(pt?: WlPt<"confirmdialog">) {
  let confirm!: WlConfirmController;
  let store!: WlConfirmationStore;
  const showHost = ref(true);
  const Harness = defineComponent({
    setup() {
      confirm = useWlConfirm();
      store = useConfirmationStore();
      return () => h("main", showHost.value ? [h(WlConfirmDialog, { motion: false, pt }), h(WlConfirmDialog, { motion: false, group: "workspace" })] : []);
    }
  });
  const wrapper = mount(Harness, { attachTo: document.body, global: { plugins: [WlConfirmationService] } });
  wrappers.push(wrapper);
  return { confirm, store, wrapper, showHost };
}

describe("awaitable confirmation", () => {
  it.each(["neutral", "accent", "info", "success", "warning", "danger"] as const)(
    "renders a %s request on the dialog and action with the matching PT context",
    async (tone) => {
      const { confirm, store } = harness({
        root: ({ context }) => ({ "data-context-tone": context.tone }),
        message: ({ context }) => ({ "data-destructive": String(context.danger) })
      });
      const result = confirm.confirm({ message: "Continue?", tone });
      await nextTick();
      const dialog = document.querySelector<HTMLElement>(".wl-confirm")!;
      const action = dialog.querySelectorAll<HTMLButtonElement>(".wl-dialog__footer button")[1]!;
      expect(dialog.dataset.tone).toBe(tone);
      expect(dialog.dataset.contextTone).toBe(tone);
      expect(action.dataset.tone).toBe(tone);
      expect(dialog.querySelector(".wl-confirm__message")?.getAttribute("data-destructive")).toBe(String(tone === "danger"));
      expect(dialog.querySelector(".wl-confirm__icon--danger") !== null).toBe(tone === "danger");
      store.accept();
      await expect(result).resolves.toBe(true);
    }
  );

  it("preserves the accent default and danger alias while an explicit tone wins over the alias", async () => {
    const { confirm, store } = harness();
    const normal = confirm.confirm({ message: "Continue?" });
    await nextTick();
    expect(document.querySelector(".wl-confirm")?.getAttribute("data-tone")).toBe("accent");
    expect(store.current.value).toMatchObject({ tone: "accent", danger: false });
    const destructive = confirm.confirmDanger({ message: "Delete?" });
    await expect(normal).resolves.toBe(false);
    await nextTick();
    expect(document.querySelector(".wl-confirm__icon--danger")).not.toBeNull();
    expect(store.current.value).toMatchObject({ tone: "danger", danger: true });
    const overridden = confirm.confirmDanger({ message: "Review first?", tone: "info" });
    await expect(destructive).resolves.toBe(false);
    await nextTick();
    expect(document.querySelector(".wl-confirm")?.getAttribute("data-tone")).toBe("info");
    expect(document.querySelector(".wl-confirm__icon--danger")).toBeNull();
    expect(store.current.value).toMatchObject({ tone: "info", danger: false });
    store.reject();
    await expect(overridden).resolves.toBe(false);
  });

  it("renders legacy store requests and keeps cancellation tied to the original entry identity", async () => {
    const { store } = harness();
    const legacy: WlConfirmation = {
      header: "Delete", message: "Delete?", acceptLabel: "Delete", rejectLabel: "Keep", danger: true
    };
    store.require(legacy);
    await nextTick();
    expect(document.querySelector(".wl-confirm")?.getAttribute("data-tone")).toBe("danger");
    expect(document.querySelector(".wl-confirm__icon--danger")).not.toBeNull();
    const current: WlConfirmation = { ...legacy, tone: "success" };
    store.require(current);
    await nextTick();
    expect(document.querySelector(".wl-confirm")?.getAttribute("data-tone")).toBe("success");
    expect(document.querySelector(".wl-confirm__icon--danger")).toBeNull();
    store.cancel(legacy);
    expect(store.current.value?.tone).toBe("success");
    store.cancel(current);
    expect(store.current.value).toBeNull();
  });

  it("isolates simultaneous tones and settlement between Vue applications", async () => {
    const first = harness();
    const second = harness();
    const firstResult = first.confirm.confirm({ message: "Delete?", tone: "danger" });
    const secondResult = second.confirm.confirm({ message: "Save?", tone: "success" });
    first.confirm.close();
    await expect(firstResult).resolves.toBe(false);
    expect(first.store.current.value).toBeNull();
    expect(second.store.current.value).toMatchObject({ message: "Save?", tone: "success", danger: false });
    second.store.accept();
    await expect(secondResult).resolves.toBe(true);
  });

  it("cancels through the reactive request exposed by the store", async () => {
    const { confirm, store } = harness();
    const result = confirm.confirm({ message: "Pending?", tone: "warning" });
    const current = store.current.value!;
    expect(isReactive(current)).toBe(true);
    store.cancel(current);
    await expect(result).resolves.toBe(false);
    expect(store.current.value).toBeNull();
  });

  it("accepts original reactive requests without letting a replaced request cancel the current one", async () => {
    const { store } = harness();
    const first = reactive<WlConfirmation>({
      header: "First", message: "First?", acceptLabel: "Continue", rejectLabel: "Cancel", tone: "info", danger: false
    });
    const firstResult = store.request(first);
    const second = reactive<WlConfirmation>({ ...first, header: "Second", message: "Second?", tone: "success" });
    const secondResult = store.request(second);
    await expect(firstResult).resolves.toBe(false);
    store.cancel(first);
    expect(store.current.value?.message).toBe("Second?");
    store.cancel(second);
    await expect(secondResult).resolves.toBe(false);
    expect(store.current.value).toBeNull();
  });

  it("resolves acceptance and keeps callbacks running after the store closes", async () => {
    const { confirm, store } = harness();
    const accept = vi.fn(() => {
      expect(store.current.value).toBeNull();
    });
    const result = confirm.confirm({ message: "Save?", accept });
    await nextTick();
    document.querySelectorAll<HTMLButtonElement>(".wl-confirm .wl-dialog__footer button")[1]!.click();
    await expect(result).resolves.toBe(true);
    expect(accept).toHaveBeenCalledOnce();
  });

  it("resolves Escape as false and invokes the rejection callback once", async () => {
    const { confirm } = harness();
    const reject = vi.fn();
    const result = confirm.confirmDanger({ message: "Delete?", reject });
    await flushPromises();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await expect(result).resolves.toBe(false);
    expect(reject).toHaveBeenCalledOnce();
  });

  it("cancels only the requested group and preserves global close semantics", async () => {
    const { confirm, store } = harness();
    const reject = vi.fn();
    const result = confirm.confirm({ message: "Workspace?", group: "workspace", reject });
    confirm.closeGroup("other");
    expect(store.current.value?.group).toBe("workspace");
    confirm.closeGroup("workspace");
    await expect(result).resolves.toBe(false);
    expect(reject).not.toHaveBeenCalled();
    const next = confirm.confirm({ message: "Next?" });
    confirm.close();
    await expect(next).resolves.toBe(false);
  });

  it("settles a replaced request before showing the next one", async () => {
    const { confirm, store } = harness();
    const first = confirm.confirm({ message: "First?" });
    const second = confirm.confirmDanger({ message: "Second?" });
    await expect(first).resolves.toBe(false);
    expect(store.current.value?.message).toBe("Second?");
    store.accept();
    await expect(second).resolves.toBe(true);
  });

  it("resolves false when the dialog host unmounts", async () => {
    const { confirm, showHost } = harness();
    const result = confirm.confirm({ message: "Pending?" });
    await flushPromises();
    showHost.value = false;
    await expect(result).resolves.toBe(false);
  });

  it("resolves false when the Vue application unmounts", async () => {
    const { confirm, wrapper } = harness();
    const result = confirm.confirm({ message: "Pending?" });
    wrapper.unmount();
    wrappers.splice(wrappers.indexOf(wrapper), 1);
    await expect(result).resolves.toBe(false);
  });

  it("cancels a request when its calling component unmounts", async () => {
    let confirm!: WlConfirmController;
    const showCaller = ref(true);
    const Caller = defineComponent({
      setup() {
        confirm = useWlConfirm();
        return () => h("button", "Caller");
      }
    });
    const Harness = defineComponent({
      setup: () => () => h("main", [showCaller.value && h(Caller), h(WlConfirmDialog, { motion: false })])
    });
    const wrapper = mount(Harness, { attachTo: document.body, global: { plugins: [WlConfirmationService] } });
    wrappers.push(wrapper);
    const result = confirm.confirm({ message: "Pending?" });
    showCaller.value = false;
    await expect(result).resolves.toBe(false);
  });
});
