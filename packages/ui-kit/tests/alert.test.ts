import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { WlAlert } from "../src";

describe("WlAlert", () => {
  it("applies variant class and data attributes", () => {
    const wrapper = mount(WlAlert, {
      props: { variant: "warn", title: "Внимание" },
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
    await wrapper.find(".wl-alert__close").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
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
