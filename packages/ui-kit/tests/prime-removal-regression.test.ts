import { afterEach, describe, expect, it } from "vitest";
import { defineComponent, nextTick } from "vue";
import { mount } from "@vue/test-utils";
import {
  WlButton, WlConfig, WlConfirmDialog, WlConfirmationService, WlDatePicker,
  WlDialog, WlSelect, WlToast, WlToastService, WlTooltip,
  createWlPt, useWlConfirm, useWlToast
} from "../src";

afterEach(() => {
  document.body.innerHTML = "";
  document.body.style.overflow = "";
});

describe("PrimeVue-free public behavior", () => {
  it("applies app and local tooltip pt to its documented sections", async () => {
    const Harness = defineComponent({
      template: `<button v-wl-tooltip="{ value: 'Help', pt: { root: { 'data-source': 'local' } } }">Hint</button>`
    });
    const wrapper = mount(Harness, {
      attachTo: document.body,
      global: {
        directives: { "wl-tooltip": WlTooltip },
        plugins: [[WlConfig, { pt: { tooltip: {
          root: { "data-source": "app" }, text: { "data-text": "app" }, arrow: { "data-arrow": "app" }
        } } }]]
      }
    });
    await wrapper.get("button").trigger("mouseenter");
    await new Promise((resolve) => setTimeout(resolve, 5));
    const tip = document.body.querySelector(".wl-tooltip");
    expect(tip?.getAttribute("data-source")).toBe("local");
    expect(tip?.querySelector(".wl-tooltip__text")?.getAttribute("data-text")).toBe("app");
    expect(tip?.querySelector(".wl-tooltip__arrow")?.getAttribute("data-arrow")).toBe("app");
    wrapper.unmount();
  });

  it("applies confirm-dialog pt sections to the underlying dialog", async () => {
    const Harness = defineComponent({
      components: { WlConfirmDialog },
      setup() { return { confirmation: useWlConfirm() }; },
      template: `<button @click="confirmation.confirm({ message: 'Proceed?' })">Ask</button>
        <WlConfirmDialog :pt="{ footer: { 'data-source': 'local' } }" />`
    });
    const wrapper = mount(Harness, {
      attachTo: document.body,
      global: { plugins: [WlConfirmationService, [WlConfig, {
        pt: { confirmdialog: { mask: { "data-mask": "app" }, footer: { "data-source": "app" } } }
      }]] }
    });
    await wrapper.get("button").trigger("click");
    await nextTick();
    expect(document.body.querySelector(".wl-dialog-mask")?.getAttribute("data-mask")).toBe("app");
    expect(document.body.querySelector(".wl-dialog__footer")?.getAttribute("data-source")).toBe("local");
    wrapper.unmount();
  });

  it("merges default, app and local pt attributes in order", () => {
    const wrapper = mount(WlButton, {
      props: {
        pt: { root: { class: "local-class", "data-source": "local" } }
      },
      global: {
        plugins: [[WlConfig, {
          pt: createWlPt({ button: { root: { class: "global-class", "data-source": "app" } } })
        }]]
      },
      slots: { default: "Save" }
    });
    const button = wrapper.get("button");
    expect(button.classes()).toContain("wl-btn");
    expect(button.classes()).toContain("global-class");
    expect(button.classes()).toContain("local-class");
    expect(button.attributes("data-source")).toBe("local");
  });

  it("selects an option using keyboard and keeps the model shape", async () => {
    const wrapper = mount(WlSelect, {
      attachTo: document.body,
      props: {
        options: [{ label: "One", value: "one" }, { label: "Two", value: "two" }],
        optionLabel: "label",
        optionValue: "value",
        modelValue: null
      }
    });
    await wrapper.get('[role="combobox"]').trigger("keydown", { key: "ArrowDown" });
    expect(document.body.querySelector('[role="listbox"]')).not.toBeNull();
    await wrapper.get('[role="combobox"]').trigger("keydown", { key: "ArrowDown" });
    await wrapper.get('[role="combobox"]').trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["two"]);
    wrapper.unmount();
  });

  it("parses Russian date text into ISO and rejects out-of-range values", async () => {
    const wrapper = mount(WlDatePicker, {
      attachTo: document.body,
      props: { modelValue: null, minDate: "2026-03-01", maxDate: "2026-03-31" }
    });
    const input = wrapper.get("input");
    await input.setValue("15.03.2026");
    await input.trigger("blur");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["2026-03-15"]);
    await wrapper.setProps({ modelValue: "2026-03-15" });
    await input.setValue("15.04.2026");
    await input.trigger("blur");
    expect(wrapper.emitted("update:modelValue")).toHaveLength(1);
    expect((input.element as HTMLInputElement).value).toBe("15.03.2026");
    wrapper.unmount();
  });

  it("locks scroll and restores it when a modal closes", async () => {
    const wrapper = mount(WlDialog, {
      attachTo: document.body,
      props: { visible: true, header: "Confirm" }
    });
    await nextTick();
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.querySelector('[role="dialog"]')).not.toBeNull();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await nextTick();
    expect(wrapper.emitted("update:visible")?.[0]).toEqual([false]);
    wrapper.unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("keeps toast queues isolated between Vue applications", async () => {
    const Harness = defineComponent({
      components: { WlToast },
      setup() { return { toast: useWlToast() }; },
      template: '<button @click="toast.ok(\'Saved\')">show</button><WlToast />'
    });
    const first = mount(Harness, { attachTo: document.body, global: { plugins: [WlToastService] } });
    const second = mount(Harness, { attachTo: document.body, global: { plugins: [WlToastService] } });
    await first.get("button").trigger("click");
    await nextTick();
    const roots = document.body.querySelectorAll(".wl-toast");
    expect(roots).toHaveLength(2);
    expect(roots[0]!.textContent).toContain("Saved");
    expect(roots[1]!.textContent).not.toContain("Saved");
    first.unmount();
    second.unmount();
  });
});
