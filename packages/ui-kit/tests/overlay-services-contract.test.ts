import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick } from "vue";
import { mount } from "@vue/test-utils";
import { WlConfig, WlConfirmDialog, WlConfirmationService, WlToast, WlToastService, useWlConfirm, useWlToast } from "../src";
import { useConfirmationStore } from "../src/services/confirmation";
import { useToastStore } from "../src/services/toast";

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  document.body.innerHTML = "";
  document.body.style.overflow = "";
});

const Harness = defineComponent({
  setup() {
    return {
      confirmation: useWlConfirm(), confirmationStore: useConfirmationStore(),
      defaultToast: useWlToast(), groupedToast: useWlToast({ group: "workspace" }),
      toastStore: useToastStore()
    };
  },
  render() { return h("div", [h(WlConfirmDialog, { group: "workspace", motion: false }),
    h(WlToast, { group: "workspace", motion: false }), h(WlToast, { motion: false })]); }
});

function mountHarness() {
  return mount(Harness, { attachTo: document.body, global: {
    plugins: [WlConfirmationService, WlToastService, [WlConfig, { motion: false }]]
  } });
}

describe("grouped confirmation and toast helpers", () => {
  it("routes confirmation requests to their group and ignores close requests for another group", async () => {
    const wrapper = mountHarness();
    wrapper.vm.confirmation.confirm({ group: "workspace", message: "Save workspace?" });
    await nextTick();
    expect(document.body.querySelector(".wl-confirm")?.textContent).toContain("Save workspace?");
    wrapper.vm.confirmation.closeGroup("another");
    expect(wrapper.vm.confirmationStore.current.value?.group).toBe("workspace");
    wrapper.vm.confirmation.closeGroup(undefined);
    expect(wrapper.vm.confirmationStore.current.value?.group).toBe("workspace");
    wrapper.vm.confirmation.closeGroup("workspace");
    expect(wrapper.vm.confirmationStore.current.value).toBeNull();
    wrapper.unmount();
  });

  it("keeps the old global close safe when bound directly to a click handler", () => {
    const wrapper = mountHarness();
    wrapper.vm.confirmation.confirmDanger({ group: "workspace", message: "Delete?" });
    const button = document.createElement("button");
    button.addEventListener("click", wrapper.vm.confirmation.close);
    button.click();
    expect(wrapper.vm.confirmationStore.current.value).toBeNull();
    wrapper.unmount();
  });

  it("runs the original accept callback after closing the matching confirmation", async () => {
    const wrapper = mountHarness();
    const accept = vi.fn(() => expect(wrapper.vm.confirmationStore.current.value).toBeNull());
    wrapper.vm.confirmation.confirm({ group: "workspace", message: "Proceed?", accept });
    await nextTick();
    const buttons = document.body.querySelectorAll<HTMLButtonElement>(".wl-confirm .wl-dialog__footer button");
    buttons[1]?.click();
    await nextTick();
    expect(accept).toHaveBeenCalledOnce();
    wrapper.unmount();
  });

  it("routes and clears toast messages per group without cancelling another group's lifetime", async () => {
    const wrapper = mountHarness();
    const initialTimers = vi.getTimerCount();
    wrapper.vm.defaultToast.ok("Global saved");
    wrapper.vm.groupedToast.info("Workspace saved", "Details");
    wrapper.vm.groupedToast.warn("Workspace warning");
    await nextTick();
    const roots = document.body.querySelectorAll(".wl-toast");
    expect(roots[0]?.textContent).toContain("Workspace saved");
    expect(roots[0]?.textContent).not.toContain("Global saved");
    expect(roots[1]?.textContent).toContain("Global saved");
    expect(vi.getTimerCount()).toBe(initialTimers + 3);
    wrapper.vm.groupedToast.clear();
    expect(wrapper.vm.toastStore.messages.value.map((message) => message.summary)).toEqual(["Global saved"]);
    expect(vi.getTimerCount()).toBe(initialTimers + 1);
    vi.advanceTimersByTime(2200);
    expect(wrapper.vm.toastStore.messages.value).toEqual([]);
    wrapper.unmount();
  });

  it("clears only default messages through the existing zero-argument helper", () => {
    const wrapper = mountHarness();
    wrapper.vm.defaultToast.ok("Global");
    wrapper.vm.groupedToast.err("Workspace");
    wrapper.vm.defaultToast.clear();
    expect(wrapper.vm.toastStore.messages.value.map((message) => message.group)).toEqual(["workspace"]);
    wrapper.unmount();
  });
});
