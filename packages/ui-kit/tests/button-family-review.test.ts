import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import WlButton from "../src/components/WlButton.vue";
import WlButtonGroup from "../src/components/WlButtonGroup.vue";
import WlIconButton from "../src/components/WlIconButton.vue";
import WlPagination from "../src/components/WlPagination.vue";
import { WlConfig } from "../src/config";
import { wlLocaleEn } from "../src/locale";

describe("button families and pagination", () => {
  it("inherits reactive group defaults and preserves explicit child overrides", async () => {
    const size = ref<"sm" | "lg">("sm");
    const explicit = ref(false);
    const wrapper = mount(defineComponent({ setup: () => () => h(WlButtonGroup, { size: size.value, variant: "primary", attached: true }, {
      default: () => [h(WlButton, explicit.value ? { size: "md" } : {}, () => "Save"), h(WlButton, { size: "lg", variant: "ghost" }, () => "Cancel")]
    }) }));
    const buttons = wrapper.findAll("button");
    expect(buttons[0]!.attributes("data-size")).toBe("sm");
    expect(buttons[0]!.attributes("data-variant")).toBe("primary");
    expect(buttons[1]!.attributes("data-size")).toBe("lg");
    size.value = "lg";
    await nextTick();
    expect(buttons[0]!.attributes("data-size")).toBe("lg");
    explicit.value = true;
    await nextTick();
    expect(buttons[0]!.attributes("data-size")).toBe("md");
    expect(buttons[1]!.attributes("data-variant")).toBe("ghost");
    wrapper.unmount();
  });

  it("renders button links with an end icon and blocks disabled navigation", async () => {
    const wrapper = mount(WlButton, { props: { href: "/project", iconPosition: "end", disabled: true }, slots: {
      default: "Project", icon: () => h("i", { "data-icon": "end" })
    } });
    expect(wrapper.element.tagName).toBe("A");
    expect(wrapper.attributes("href")).toBeUndefined();
    expect(wrapper.element.lastElementChild?.getAttribute("data-icon")).toBe("end");
    await wrapper.trigger("click");
    expect(wrapper.emitted("click")).toBeUndefined();
    wrapper.unmount();
  });

  it("isolates icon button pt while retaining the old button fallback", async () => {
    const wrapper = mount(WlIconButton, { props: { ariaLabel: "Save", loading: true, href: "/save" }, global: { plugins: [[WlConfig, { pt: {
      button: { root: { "data-fallback": "old" } }, iconButton: { root: { "data-specific": "new" } }
    } }]] } });
    expect(wrapper.attributes("data-specific")).toBe("new");
    expect(wrapper.attributes("data-fallback")).toBeUndefined();
    expect(wrapper.attributes("aria-busy")).toBe("true");
    expect(wrapper.attributes("href")).toBeUndefined();
    await wrapper.trigger("click");
    expect(wrapper.emitted("click")).toBeUndefined();
    wrapper.unmount();
    const old = mount(WlIconButton, { props: { ariaLabel: "Save" }, global: { plugins: [[WlConfig, { pt: { button: { root: { "data-fallback": "old" } } } }]] } });
    expect(old.attributes("data-fallback")).toBe("old");
    old.unmount();
  });

  it("warns about unnamed icon-only actions during development", async () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const wrapper = mount(WlIconButton, { props: { icon: "check" } });
    try {
      await nextTick();
      expect(warning).toHaveBeenCalledWith(expect.stringContaining("needs ariaLabel"));
    } finally {
      wrapper.unmount();
      warning.mockRestore();
    }
  });

  it("derives pages from total/size, emits a size reset and reports empty ranges", async () => {
    const wrapper = mount(WlPagination, {
      props: { total: 340, pageSize: 20, pageSizes: [10, 20, 50], page: 2 },
      global: { plugins: [[WlConfig, { locale: wlLocaleEn }]] }
    });
    expect(wrapper.text()).toContain("Showing 21–40 of 340");
    await wrapper.get("select").setValue("50");
    expect(wrapper.emitted("update:pageSize")).toEqual([[50]]);
    expect(wrapper.emitted("update:page")).toEqual([[1]]);
    await wrapper.setProps({ total: 0, page: 1, disabled: true });
    expect(wrapper.text()).toContain("Showing 0–0 of 0");
    expect(wrapper.get("select").attributes("disabled")).toBeDefined();
    wrapper.unmount();
  });
});
