import { mount } from "@vue/test-utils";
import { afterAll, describe, expect, it } from "vitest";
import type { GlobalMountOptions } from "../mounting-types";
import { WlConfig } from "../../src";
import { createWlPt, WlAvatar } from "../../src";

const global: GlobalMountOptions = {
  plugins: [[WlConfig, { pt: createWlPt() }]]
};

afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));
});
describe("basic component behavior", () => {
  it("renders avatar content and presence", () => {
    const wrapper = mount(WlAvatar, {
      global,
      props: { label: "AK", size: 48, presence: "online" }
    });
    expect(wrapper.find('[data-wl="avatar"]').attributes("data-size")).toBe("48");
    expect(wrapper.text()).toContain("AK");
    expect(wrapper.find(".wl-avatar__presence--online").exists()).toBe(true);
  });
});
