import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { nextTick, reactive } from "vue";
import type { WlConfigOptions } from "../../src";
import { WlAlert, WlConfig, wlLocaleEn, wlLocaleRu } from "../../src";

describe("WlAlert", () => {
  it("applies variant class and data attributes", () => {
    const wrapper = mount(WlAlert, {
      props: { tone: "warning", title: "Внимание" },
      slots: { default: "Проверьте данные" }
    });
    const root = wrapper.find('[data-wl="alert"]');
    expect(root.classes()).toContain("wl-alert--warn");
    expect(root.attributes("data-variant")).toBe("warn");
    expect(root.text()).toContain("Внимание");
    expect(root.text()).toContain("Проверьте данные");
  });

  it("emits close when closable", async () => {
    const wrapper = mount(WlAlert, {
      props: { closable: true },
      slots: { default: "Сообщение" }
    });
    expect(wrapper.find(".wl-alert__close").attributes("aria-label")).toBe("Close");
    await wrapper.find(".wl-alert__close").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("reacts to locale changes while preserving explicit close labels", async () => {
    const config = reactive<WlConfigOptions>({ locale: wlLocaleRu });
    const wrapper = mount(WlAlert, {
      global: { plugins: [[WlConfig, config]] },
      props: { closable: true }
    });
    const close = wrapper.get(".wl-alert__close");
    expect(close.attributes("aria-label")).toBe("Закрыть");

    await wrapper.setProps({ closeLabel: "Закрыть" });
    config.locale = wlLocaleEn;
    await nextTick();
    expect(close.attributes("aria-label")).toBe("Закрыть");

    await wrapper.setProps({ closeLabel: "" });
    expect(close.attributes("aria-label")).toBe("");
    await wrapper.setProps({ closeLabel: undefined });
    expect(close.attributes("aria-label")).toBe("Close");

    config.locale = wlLocaleRu;
    await nextTick();
    expect(close.attributes("aria-label")).toBe("Закрыть");
    wrapper.unmount();
  });

  it("hides close button when not closable", () => {
    const wrapper = mount(WlAlert, { slots: { default: "Сообщение" } });
    expect(wrapper.find(".wl-alert__close").exists()).toBe(false);
  });

  it("renders action slot", () => {
    const wrapper = mount(WlAlert, {
      slots: { default: "Сообщение", action: "<a class='demo-act'>Подробнее</a>" }
    });
    expect(wrapper.find(".wl-alert__action .demo-act").exists()).toBe(true);
  });
});
