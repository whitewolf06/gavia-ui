import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, h, nextTick } from "vue";
import WlIcon from "../src/components/WlIcon.vue";
import { useWlConfig, WlConfig, type WlConfigApi } from "../src/config";
import { useWlId } from "../src/utils/useWlId";

describe("meaningful and application icons", () => {
  it("keeps default icons decorative and escapes meaningful title text", () => {
    const decorative = mount(WlIcon, { props: { name: "check" } });
    expect(decorative.attributes("aria-hidden")).toBe("true");
    const title = "</title><script>bad</script>&";
    const meaningful = mount(WlIcon, { props: { name: "check", title } });
    expect(meaningful.attributes("role")).toBe("img");
    expect(meaningful.get("title").text()).toBe(title);
    expect(meaningful.find("script").exists()).toBe(false);
    decorative.unmount();
    meaningful.unmount();
  });

  it("updates a trusted icon registry in one app without affecting another", async () => {
    const Custom = defineComponent({ setup: () => () => h("svg", { "data-custom": "yes" }, [h("path", { d: "M1 1L2 2" })]) });
    let config!: WlConfigApi;
    const Harness = defineComponent({ setup() {
      config = useWlConfig();
      return () => h(WlIcon, { name: "custom" });
    } });
    const configured = mount(Harness, { global: { plugins: [WlConfig] } });
    const isolated = mount(WlIcon, { props: { name: "custom" } });
    config.setIcons({ custom: Custom });
    await nextTick();
    expect(configured.get("svg").attributes("data-custom")).toBe("yes");
    expect(isolated.find("svg").exists()).toBe(false);
    config.setIcons(undefined);
    await nextTick();
    expect(configured.find("svg").exists()).toBe(false);
    configured.unmount();
    isolated.unmount();
  });

  it("offers a Vue3.4-compatible prefix for independently mounted applications", () => {
    const Harness = defineComponent({ setup() {
      const id = useWlId();
      return () => h("span", { id });
    } });
    const first = mount(Harness, { global: { plugins: [[WlConfig, { idPrefix: "first" }]] } });
    const second = mount(Harness, { global: { plugins: [[WlConfig, { idPrefix: "second" }]] } });
    expect(first.attributes("id")).toBe("first-0");
    expect(second.attributes("id")).toBe("second-0");
    first.unmount();
    second.unmount();
  });
});
