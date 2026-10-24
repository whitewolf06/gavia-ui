import { mount } from "@vue/test-utils";
import { afterAll, describe, expect, it } from "vitest";
import { defineComponent, nextTick, ref } from "vue";
import type { GlobalMountOptions } from "../mounting-types";
import { WlConfig } from "../../src";
import { createWlPt, WlPopover } from "../../src";

// Wire the kit pt map exactly like a real app does, so inner sections
// (menu header/separator) carry their wl-* classes.
const global: GlobalMountOptions = {
  plugins: [[WlConfig, { pt: createWlPt() }]]
};

// Allow pending overlay positioning callbacks to finish
// while the jsdom environment is still alive.
afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));
});
describe("WlPopover", () => {
  it("opens via exposed toggle and renders slot content", async () => {
    const Harness = defineComponent({
      components: { WlPopover },
      setup() {
        return { openCount: ref(0) };
      },
      template: `
        <button class="anchor" @click="$refs.pop.toggle($event)">Открыть</button>
        <WlPopover ref="pop" aria-label="Card details" @open="openCount++"><div class="pop-body">Детали карточки</div></WlPopover>
      `
    });
    const wrapper = mount(Harness, {
      global: { ...global, stubs: { transition: false } },
      attachTo: document.body
    });
    expect(document.body.querySelector(".wl-popover")).toBeNull();

    await wrapper.find(".anchor").trigger("click");
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));
    const pop = document.body.querySelector(".wl-popover");
    expect(pop).toBeTruthy();
    expect(pop!.textContent).toContain("Детали карточки");
    expect(pop!.getAttribute("aria-label")).toBe("Card details");
    expect(wrapper.vm.openCount).toBe(1);
    wrapper.unmount();
  });
});
