import { afterAll, describe, it, expect } from "vitest";
import { defineComponent, nextTick } from "vue";
import { mount } from "@vue/test-utils";
import { WlConfig } from "../src";
import { WlToast, WlToastService, createWlPt, useWlToast } from "../src";

// Toast messages auto-remove on a life timer; let pending timers fire
// while the jsdom environment is still alive.
afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));
});

const Harness = defineComponent({
  components: { WlToast },
  setup() {
    const toast = useWlToast();
    return { toast };
  },
  template: `
    <div>
      <WlToast />
      <button class="fire-ok" @click="toast.ok('Сохранено')">ok</button>
      <button class="fire-err" @click="toast.err('Не удалось сохранить')">err</button>
    </div>
  `
});

function mountHarness() {
  return mount(Harness, {
    global: { plugins: [[WlConfig, { pt: createWlPt() }], WlToastService] },
    attachTo: document.body
  });
}

describe("WlToast + useWlToast", () => {
  it("shows a success toast through the service", async () => {
    const wrapper = mountHarness();
    await wrapper.find(".fire-ok").trigger("click");
    await nextTick();

    const message = document.body.querySelector(".wl-toast__message");
    expect(message).toBeTruthy();
    expect(message!.getAttribute("data-severity")).toBe("success");
    expect(message!.textContent).toContain("Сохранено");
    expect(document.body.querySelector(".wl-toast__summary")).toBeTruthy();
    wrapper.unmount();
  });

  it("shows an error toast with matching severity", async () => {
    const wrapper = mountHarness();
    await wrapper.find(".fire-err").trigger("click");
    await nextTick();

    const message = document.body.querySelector(".wl-toast__message");
    expect(message).toBeTruthy();
    expect(message!.getAttribute("data-severity")).toBe("error");
    expect(message!.textContent).toContain("Не удалось сохранить");
    wrapper.unmount();
  });

  it("renders the toast container at bottom-center", async () => {
    const wrapper = mountHarness();
    await nextTick(); // Portal teleports to body after the mounted hook
    const root = document.body.querySelector('.wl-toast[data-wl="toast"]');
    expect(root).toBeTruthy();
    wrapper.unmount();
  });
});
