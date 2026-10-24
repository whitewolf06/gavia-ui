import { mount } from "@vue/test-utils";
import { afterAll, describe, expect, it } from "vitest";
import type { GlobalMountOptions } from "../mounting-types";
import { WlConfig } from "../../src";
import { createWlPt, WlBadge } from "../../src";

const global: GlobalMountOptions = {
  plugins: [[WlConfig, { pt: createWlPt() }]]
};

afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));
});
describe("basic component behavior", () => {
  it("switches badge between value and dot modes", async () => {
    const wrapper = mount(WlBadge, { global, props: { value: 8, tone: "danger" } });
    expect(wrapper.text()).toContain("8");
    expect(wrapper.find('[data-wl="badge"]').attributes("data-variant")).toBe("danger");
    await wrapper.setProps({ dot: true });
    expect(wrapper.find(".wl-badge--dot").exists()).toBe(true);
    expect(wrapper.text()).not.toContain("8");
  });
});
