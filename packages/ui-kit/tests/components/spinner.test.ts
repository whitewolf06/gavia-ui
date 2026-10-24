import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { nextTick, reactive } from "vue";
import type { WlConfigOptions } from "../../src";
import { WlConfig, wlLocaleEn, wlLocaleRu, WlSpinner } from "../../src";

describe("WlSpinner locale", () => {
  it("uses English without configuration", () => {
    const wrapper = mount(WlSpinner);
    expect(wrapper.get('[role="status"]').attributes("aria-label")).toBe("Loading");
    wrapper.unmount();
  });

  it("reacts to locale changes and preserves explicit text, including empty labels", async () => {
    const config = reactive<WlConfigOptions>({ locale: wlLocaleRu });
    const wrapper = mount(WlSpinner, { global: { plugins: [[WlConfig, config]] } });
    expect(wrapper.attributes("aria-label")).toBe("Загрузка");

    await wrapper.setProps({ label: "Загрузка" });
    config.locale = wlLocaleEn;
    await nextTick();
    expect(wrapper.attributes("aria-label")).toBe("Загрузка");

    await wrapper.setProps({ label: "" });
    expect(wrapper.attributes("aria-label")).toBe("");
    await wrapper.setProps({ label: undefined });
    expect(wrapper.attributes("aria-label")).toBe("Loading");

    config.locale = wlLocaleRu;
    await nextTick();
    expect(wrapper.attributes("aria-label")).toBe("Загрузка");
    wrapper.unmount();
  });
});
