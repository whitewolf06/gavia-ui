import { mount } from "@vue/test-utils";
import { afterAll, describe, expect, it } from "vitest";
import type { GlobalMountOptions } from "../mounting-types";
import { WlConfig } from "../../src";
import { createWlPt, WlPill } from "../../src";

// Wire the kit pt map exactly like a real app does, so inner sections
// (menu header/separator) carry their wl-* classes.
const global: GlobalMountOptions = {
  plugins: [[WlConfig, { pt: createWlPt() }]]
};

// Allow pending overlay positioning callbacks to finish
// while the jsdom environment is still alive.
afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));
});
describe("WlPill", () => {
  it("applies variant class and data attributes", () => {
    const wrapper = mount(WlPill, {
      global,
      props: { tone: "success" },
      slots: { default: "Готово" }
    });
    const pill = wrapper.find('[data-wl="pill"]');
    expect(pill.classes()).toContain("wl-pill");
    expect(pill.classes()).toContain("wl-pill--ok");
    expect(pill.attributes("data-variant")).toBe("ok");
    expect(pill.text()).toContain("Готово");
  });

  it("defaults to neutral variant", () => {
    const wrapper = mount(WlPill, { global, props: { label: "Черновик" } });
    expect(wrapper.find('[data-wl="pill"]').classes()).toContain("wl-pill--neutral");
  });
});
