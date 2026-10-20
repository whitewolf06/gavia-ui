import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { WlBadge, WlConfig, WlIconButton, wlLocaleEn, WlProgress } from "../src";
afterEach(() => vi.restoreAllMocks());

describe("accessible action names and badge descriptions", () => {
  it("uses a PT-provided action name without warning", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const wrapper = mount(WlIconButton, { props: { icon: "plus", pt: { root: { "aria-label": "Add account" } } } });
    await nextTick();
    expect(wrapper.attributes("aria-label")).toBe("Add account");
    expect(warn).not.toHaveBeenCalled();
    wrapper.unmount();
  });
  it("warns for unresolved label references and checks a slot that becomes empty", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const unresolved = mount(WlIconButton, { props: { icon: "plus" }, attrs: { "aria-labelledby": "missing-label" } });
    await nextTick();
    expect(warn).toHaveBeenCalledTimes(1);
    unresolved.unmount();
    warn.mockClear();
    const visible = ref(true);
    const wrapper = mount({ render: () => h(WlIconButton, {}, { default: () => visible.value ? "Save changes" : "" }) });
    try {
      await nextTick();
      expect(warn).not.toHaveBeenCalled();
      visible.value = false;
      await nextTick();
      await nextTick();
      expect(warn).toHaveBeenCalledTimes(1);
    } finally { wrapper.unmount(); }
  });
  it("merges the count description with consumer help without changing the action name", async () => {
    const wrapper = mount(WlIconButton, { props: { icon: "check", ariaLabel: "Inbox", count: 3, countLabel: "Three unread messages" }, attrs: { "aria-describedby": "inbox-help" } });
    try {
      await nextTick();
      const tokens = wrapper.attributes("aria-describedby")!.split(" ");
      expect(tokens[0]).toBe("inbox-help");
      expect(tokens).toHaveLength(2);
      expect(wrapper.get(`#${tokens[1]}`).text()).toBe("Three unread messages");
      expect(wrapper.attributes("aria-label")).toBe("Inbox");
      expect(wrapper.get(".wl-iconbtn__count").attributes("aria-hidden")).toBe("true");
      await wrapper.setProps({ count: 0 });
      expect(wrapper.attributes("aria-describedby")).toBe("inbox-help");
      await wrapper.setProps({ dot: true, dotLabel: "New message" });
      expect(wrapper.get(".wl-iconbtn__description").text()).toBe("New message");
    } finally { wrapper.unmount(); }
  });
  it("uses translated count and dot descriptions and preserves a native labelled action", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const wrapper = mount({ render: () => h("div", [h("span", { id: "inbox-action" }, "Inbox"), h(WlIconButton, { "aria-labelledby": "inbox-action", count: 2, dot: true })]) }, { global: { plugins: [[WlConfig, { locale: wlLocaleEn }]] } });
    try {
      await nextTick();
      expect(wrapper.get(".wl-iconbtn__description").text()).toBe("Items: 2");
      expect(warn).not.toHaveBeenCalled();
    } finally { wrapper.unmount(); }
  });
  it("retains a slot-provided action name during loading", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const wrapper = mount(WlIconButton, { slots: { default: "Save changes" } });
    try {
      await nextTick();
      await wrapper.setProps({ loading: true });
      await nextTick();
      expect(wrapper.get(".wl-iconbtn__content").text()).toBe("Save changes");
      expect(wrapper.get(".wl-iconbtn__content").classes()).toContain("wl-visually-hidden");
      expect(wrapper.find(".wl-btn__spinner").exists()).toBe(true);
      expect(warn).not.toHaveBeenCalled();
    } finally { wrapper.unmount(); }
  });
  it("preserves a PT-provided dot name and hides an unnamed dot", async () => {
    const wrapper = mount(WlBadge, { props: { dot: true, pt: { root: { "aria-label": "Unread messages" } } } });
    try {
      expect(wrapper.attributes("aria-label")).toBe("Unread messages");
      expect(wrapper.attributes("role")).toBe("img");
      expect(wrapper.attributes("aria-hidden")).toBeUndefined();
      await wrapper.setProps({ pt: {} });
      expect(wrapper.attributes("role")).toBeUndefined();
      expect(wrapper.attributes("aria-hidden")).toBe("true");
      await wrapper.setProps({ "aria-labelledby": "unread-label" });
      expect(wrapper.attributes("aria-labelledby")).toBe("unread-label");
      expect(wrapper.attributes("aria-hidden")).toBeUndefined();
      expect(wrapper.attributes("role")).toBe("img");
    } finally { wrapper.unmount(); }
  });
  it("names progress through PT and exposes visible percentage text unless explicitly overridden", async () => {
    const wrapper = mount(WlProgress, { props: { value: 25, max: 50, showValue: true, pt: { root: { "aria-label": "Upload progress" } } } });
    try {
      expect(wrapper.attributes("aria-label")).toBe("Upload progress");
      expect(wrapper.attributes("aria-valuetext")).toBe("50%");
      await wrapper.setProps({ "aria-valuetext": "One of two files" });
      expect(wrapper.attributes("aria-valuetext")).toBe("One of two files");
      await wrapper.setProps({ "aria-valuetext": undefined, indeterminate: true });
      expect(wrapper.attributes("aria-valuetext")).toBeUndefined();
      expect(wrapper.attributes("aria-valuenow")).toBeUndefined();
    } finally { wrapper.unmount(); }
  });
  it("checks routed icon actions when the custom adapter renders a fragment", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const adapter = defineComponent({
      props: { to: { type: String, default: "" }, custom: Boolean },
      setup: (_, { slots }) => () => slots.default?.({ href: "/inbox", isActive: false, navigate: () => {} })
    });
    const wrapper = mount(WlIconButton, {
      props: { to: "/inbox", ariaLabel: "Inbox", count: 2 },
      global: { plugins: [[WlConfig, { linkComponent: adapter }]] }
    });
    try {
      await nextTick();
      expect(wrapper.get("a").attributes("aria-label")).toBe("Inbox");
      expect(warn).not.toHaveBeenCalled();
      await wrapper.setProps({ "aria-describedby": "inbox-help" });
      expect(wrapper.get("a").attributes("aria-describedby")).toContain("inbox-help");
    } finally { wrapper.unmount(); }
  });
});
