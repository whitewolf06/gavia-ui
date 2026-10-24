import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WlAvatar, WlBadge, WlButton, WlConfig, WlDivider, wlLocaleEn, WlPill, WlProgress, WlStatCard } from "../src";

afterEach(() => vi.restoreAllMocks());

describe("semantic tones", () => {
  it("resolves the canonical default and preserves visual classes without warnings", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const baseline = mount(WlBadge);
    expect(warn).not.toHaveBeenCalled();
    baseline.unmount();
    const warning = mount(WlBadge, { props: { tone: "warning", value: 2 } });
    expect(warning.classes()).toContain("wl-badge--warn");
    expect(warning.attributes("data-tone")).toBe("warning");
    expect(warn).not.toHaveBeenCalled();
    warning.unmount();
  });

  it("maps normalized tones to released visual classes and keeps button variants as the form axis", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const badge = mount(WlBadge, { props: { tone: "danger" } });
    const pill = mount(WlPill, { props: { tone: "success", dot: true } });
    const button = mount(WlButton, { props: { variant: "soft", tone: "danger" }, slots: { default: "Delete" } });
    const progress = mount(WlProgress, { props: { tone: "success" } });
    try {
      expect(badge.classes()).toContain("wl-badge--danger");
      expect(pill.classes()).toContain("wl-pill--ok");
      expect(pill.find(".wl-pill__dot").exists()).toBe(true);
      expect(button.classes()).toContain("wl-btn--soft-danger");
      expect(button.attributes("data-variant")).toBe("soft");
      expect(button.attributes("data-tone")).toBe("danger");
      expect(progress.classes()).toContain("wl-progress--ok");
      expect(warn).not.toHaveBeenCalled();
    } finally { [badge, pill, button, progress].forEach((wrapper) => wrapper.unmount()); }
  });
});

it("Badge caps numeric counts, exposes its slot, and labels dots", () => {
  const count = mount(WlBadge, { props: { value: 150, max: 99 } });
  const custom = mount(WlBadge, { props: { value: 150, max: 99 }, slots: { default: ({ value }) => `Count ${value}` } });
  const dot = mount(WlBadge, { props: { dot: true, ariaLabel: "Unread messages" } });
  try {
    expect(count.text()).toBe("99+");
    expect(custom.text()).toBe("Count 150");
    expect(dot.attributes("aria-label")).toBe("Unread messages");
    expect(dot.attributes("role")).toBe("img");
  } finally { [count, custom, dot].forEach((wrapper) => wrapper.unmount()); }
});

it("Avatar falls back from failed images to name initials and retries a changed source", async () => {
  const wrapper = mount(WlAvatar, { props: { name: "Ada Lovelace", image: "broken.png", shape: "square", presence: "online", presenceLabel: "Available" } });
  try {
    expect(wrapper.get("img").attributes("alt")).toBe("Ada Lovelace");
    await wrapper.get("img").trigger("error");
    expect(wrapper.find("img").exists()).toBe(false);
    expect(wrapper.text()).toContain("AL");
    expect(wrapper.get(".wl-avatar").attributes("data-shape")).toBe("square");
    expect(wrapper.get(".wl-avatar__presence").attributes("aria-label")).toBe("Available");
    await wrapper.setProps({ image: "new.png" });
    expect(wrapper.get("img").attributes("src")).toBe("new.png");
  } finally { wrapper.unmount(); }
});

it("Progress supports arbitrary max values, clamps ARIA values and omits them while indeterminate", async () => {
  const wrapper = mount(WlProgress, { props: { value: 25, max: 50, showValue: true, ariaLabel: "Upload" } });
  try {
    expect(wrapper.attributes("aria-valuenow")).toBe("25");
    expect(wrapper.attributes("aria-valuemax")).toBe("50");
    expect(wrapper.attributes("aria-label")).toBe("Upload");
    expect(wrapper.get(".wl-progress__value").attributes("style")).toContain("width: 50%");
    await wrapper.setProps({ value: 80 });
    expect(wrapper.attributes("aria-valuenow")).toBe("50");
    await wrapper.setProps({ indeterminate: true });
    expect(wrapper.attributes("aria-valuenow")).toBeUndefined();
    expect(wrapper.attributes("data-indeterminate")).toBe("true");
    expect(wrapper.find(".wl-progress__label").exists()).toBe(false);
  } finally { wrapper.unmount(); }
});

it("StatCard formats numeric values in the app locale and renders its delta", () => {
  const wrapper = mount(WlStatCard, {
    props: { value: 1234.5, delta: "+12%", tone: "warning", numberFormat: { minimumFractionDigits: 2 } },
    global: { plugins: [[WlConfig, { locale: wlLocaleEn }]] }
  });
  expect(wrapper.get(".wl-stat-card__value").text()).toBe("1,234.50");
  expect(wrapper.get(".wl-stat-card__delta").text()).toBe("+12%");
  expect(wrapper.attributes("data-tone")).toBe("warning");
  wrapper.unmount();
});

it("Divider exposes vertical orientation while keeping the horizontal default", () => {
  const baseline = mount(WlDivider);
  const vertical = mount(WlDivider, { props: { orientation: "vertical" } });
  expect(baseline.attributes("aria-orientation")).toBe("horizontal");
  expect(vertical.attributes("aria-orientation")).toBe("vertical");
  expect(vertical.classes()).toContain("wl-divider--vertical");
  baseline.unmount();
  vertical.unmount();
});
