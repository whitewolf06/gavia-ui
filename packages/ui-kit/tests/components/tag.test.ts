import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { nextTick, reactive } from "vue";
import type { WlConfigOptions } from "../../src";
import type { GlobalMountOptions } from "../mounting-types";
import { WlConfig, wlLocaleEn, wlLocaleRu, WlTag } from "../../src";

const global: GlobalMountOptions = { plugins: [[WlConfig]] };

describe("WlTag", () => {
  it("applies variant class and data attributes", () => {
    const wrapper = mount(WlTag, {
      global,
      props: { color: "blue" },
      slots: { default: "Релиз 2.0" }
    });
    const tag = wrapper.find('[data-wl="tag"]');
    expect(tag.classes()).toContain("wl-tag");
    expect(tag.classes()).toContain("wl-tag--blue");
    expect(tag.attributes("data-variant")).toBe("blue");
    expect(tag.text()).toContain("Релиз 2.0");
  });

  it("does not render remove button by default", () => {
    const wrapper = mount(WlTag, { global, slots: { default: "Тег" } });
    expect(wrapper.find(".wl-tag__remove").exists()).toBe(false);
  });

  it("emits remove when removable", async () => {
    const wrapper = mount(WlTag, {
      global,
      props: { removable: true },
      slots: { default: "Срочно" }
    });
    expect(wrapper.find(".wl-tag__remove").attributes("aria-label")).toBe("Remove");
    await wrapper.find(".wl-tag__remove").trigger("click");
    expect(wrapper.emitted("remove")).toHaveLength(1);
  });

  it("reacts to locale changes and preserves explicit removal labels", async () => {
    const config = reactive<WlConfigOptions>({ locale: wlLocaleRu });
    const wrapper = mount(WlTag, {
      global: { plugins: [[WlConfig, config]] },
      props: { removable: true }
    });
    const remove = wrapper.get(".wl-tag__remove");
    expect(remove.attributes("aria-label")).toBe("Удалить");

    await wrapper.setProps({ removeLabel: "Удалить" });
    config.locale = wlLocaleEn;
    await nextTick();
    expect(remove.attributes("aria-label")).toBe("Удалить");

    await wrapper.setProps({ removeLabel: "" });
    expect(remove.attributes("aria-label")).toBe("");
    await wrapper.setProps({ removeLabel: undefined });
    expect(remove.attributes("aria-label")).toBe("Remove");

    config.locale = wlLocaleRu;
    await nextTick();
    expect(remove.attributes("aria-label")).toBe("Удалить");
    wrapper.unmount();
  });
});
