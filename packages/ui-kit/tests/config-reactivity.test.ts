import { mount, type VueWrapper } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { computed, defineComponent, h, nextTick, reactive, ref } from "vue";
import { useWlConfig, useWlLocale, useWlMotion, useWlPt, WlConfig, type WlConfigApi, type WlConfigOptions } from "../src/config";
import { wlLocaleEn, wlLocaleRu } from "../src/locale";

const wrappers: VueWrapper[] = [];
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount());
});

function harness(options?: WlConfigOptions, install = true) {
  let api!: WlConfigApi;
  let firstLocale!: ReturnType<typeof useWlLocale>;
  let secondLocale!: ReturnType<typeof useWlLocale>;
  const local = ref<Record<string, unknown>>();
  let section!: ReturnType<typeof useWlPt>;
  const Child = defineComponent({
    setup() {
      secondLocale = useWlLocale();
      return () => h("span", secondLocale.value.close);
    }
  });
  const Harness = defineComponent({
    setup() {
      api = useWlConfig();
      firstLocale = useWlLocale();
      const motion = useWlMotion(computed(() => undefined));
      section = useWlPt("button", computed(() => local.value));
      return () => h("div", [h("button", { ...section("root"), "data-motion": motion.value }, firstLocale.value.close), h(Child)]);
    }
  });
  const wrapper = mount(Harness, install ? { global: { plugins: [[WlConfig, options ?? {}]] } } : {});
  wrappers.push(wrapper);
  return { wrapper, api, firstLocale, secondLocale, local, section };
}

describe("reactive application configuration", () => {
  it("updates locale, motion and pt through setters for plain plugin options", async () => {
    const { wrapper, api } = harness({ locale: { close: "Initial" }, motion: true });
    expect(wrapper.get("button").text()).toBe("Initial");
    api.setLocale(wlLocaleEn);
    api.setMotion(false);
    api.setPt({ button: { root: { class: "app-button", style: { color: "red" }, "data-app": "yes" } } });
    await nextTick();
    expect(wrapper.get("button").text()).toBe("Close");
    expect(wrapper.get("button").attributes("data-motion")).toBe("false");
    expect(wrapper.get("button").classes()).toContain("app-button");
    expect(wrapper.get("button").attributes("data-app")).toBe("yes");
  });

  it("shares one locale computed in an app, keeps different apps isolated and supports omitted installation", async () => {
    const options = { locale: { close: "Initial" } };
    const first = harness(options);
    const second = harness(options);
    expect(first.firstLocale).toBe(first.secondLocale);
    expect(first.firstLocale.value).not.toBe(second.firstLocale.value);
    first.api.setLocale({ close: "Changed" });
    await nextTick();
    expect(first.wrapper.text()).toBe("ChangedChanged");
    expect(second.wrapper.text()).toBe("InitialInitial");
    const implicit = harness(undefined, false);
    implicit.api.setLocale({ close: "Implicit" });
    await nextTick();
    expect(implicit.wrapper.text()).toBe("ImplicitImplicit");
  });

  it("retains live updates from existing reactive configuration, including nested locale edits", async () => {
    const options = reactive({ locale: { close: "Initial" }, motion: true });
    const { wrapper, api } = harness(options);
    options.locale.close = "Nested edit";
    options.motion = false;
    await nextTick();
    expect(wrapper.get("button").text()).toBe("Nested edit");
    expect(wrapper.get("button").attributes("data-motion")).toBe("false");
    api.setLocale({ close: "Setter" });
    expect(options.locale.close).toBe("Setter");
  });

  it("returns to English after clearing one app's locale without changing a Russian app", async () => {
    const implicit = harness(undefined, false);
    const russian = harness({ locale: wlLocaleRu });
    expect(implicit.wrapper.get("button").text()).toBe(wlLocaleEn.close);
    expect(russian.wrapper.get("button").text()).toBe(wlLocaleRu.close);
    implicit.api.setLocale(wlLocaleRu);
    await nextTick();
    expect(implicit.wrapper.get("button").text()).toBe(wlLocaleRu.close);
    implicit.api.setLocale(undefined);
    await nextTick();
    expect(implicit.wrapper.get("button").text()).toBe(wlLocaleEn.close);
    expect(russian.wrapper.get("button").text()).toBe(wlLocaleRu.close);
  });

  it("caches frozen defaults without caching consumer callbacks or reactive overrides", async () => {
    const { section, local, api } = harness();
    const first = section("root");
    expect(section("root")).toBe(first);
    expect(Object.isFrozen(first)).toBe(true);
    const marker = ref("one");
    api.setPt({ button: { root: () => ({ class: "app", style: { color: "red" }, "data-marker": marker.value }) } });
    local.value = { root: { class: "local", style: { padding: "4px" }, "data-source": "local" } };
    await nextTick();
    expect(section("root")["data-marker"]).toBe("one");
    marker.value = "two";
    expect(section("root")["data-marker"]).toBe("two");
    api.setPt(undefined);
    local.value = undefined;
    expect(section("root")).toBe(first);
  });

  it("evaluates context-dependent defaults independently for each state", () => {
    let section!: ReturnType<typeof useWlPt>;
    const Harness = defineComponent({
      setup() {
        section = useWlPt("checkbox", computed(() => undefined));
        return () => h("div");
      }
    });
    wrappers.push(mount(Harness));
    expect(JSON.stringify(section("box", { checked: true }))).toContain("is-checked");
    expect(JSON.stringify(section("box", { checked: false }))).not.toContain("is-checked");
  });

  it("passes cached default attributes directly into Vue rendering without mutating frozen props", () => {
    const Harness = defineComponent({
      setup() {
        const section = useWlPt("avatar", computed(() => undefined));
        return () => h("span", section("label"), "Avatar");
      }
    });
    const wrapper = mount(Harness);
    wrappers.push(wrapper);
    expect(wrapper.classes()).toContain("wl-avatar__label");
  });
});
