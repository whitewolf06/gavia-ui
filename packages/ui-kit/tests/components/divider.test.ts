import { mount } from "@vue/test-utils";
import { afterAll, describe, expect, it } from "vitest";
import type { GlobalMountOptions } from "../mounting-types";
import { WlConfig } from "../../src";
import { createWlPt, WlDivider } from "../../src";

const global: GlobalMountOptions = {
  plugins: [[WlConfig, { pt: createWlPt() }]]
};

afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));
});
describe("basic component behavior", () => {
  it("distinguishes plain and labeled dividers", () => {
    const plain = mount(WlDivider, { global });
    const labeled = mount(WlDivider, { global, slots: { default: "Details" } });
    expect(plain.find(".wl-divider--plain").exists()).toBe(true);
    expect(labeled.find(".wl-divider--plain").exists()).toBe(false);
    expect(labeled.text()).toContain("Details");
  });
});
