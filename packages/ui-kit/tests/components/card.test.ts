import { mount } from "@vue/test-utils";
import { afterAll, describe, expect, it } from "vitest";
import type { GlobalMountOptions } from "../mounting-types";
import { WlConfig } from "../../src";
import { createWlPt, WlCard } from "../../src";

const global: GlobalMountOptions = {
  plugins: [[WlConfig, { pt: createWlPt() }]]
};

afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));
});
describe("basic component behavior", () => {
  it("renders all card content regions", () => {
    const wrapper = mount(WlCard, {
      global,
      props: { hoverable: true },
      slots: {
        header: '<div class="header">Header</div>',
        title: "Title",
        default: "Body",
        footer: '<div class="footer">Footer</div>'
      }
    });
    expect(wrapper.find(".wl-card--hoverable").exists()).toBe(true);
    expect(wrapper.text()).toContain("Header");
    expect(wrapper.text()).toContain("Title");
    expect(wrapper.text()).toContain("Body");
    expect(wrapper.text()).toContain("Footer");
  });
});
