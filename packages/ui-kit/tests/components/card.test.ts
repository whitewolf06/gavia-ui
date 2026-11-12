import { mount } from "@vue/test-utils";
import { afterAll, describe, expect, it } from "vitest";
import { h } from "vue";
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

  it.each(["none", "sm", "md", "lg"] as const)("keeps %s padding on the owning sections and preserves nested card settings", async (padding) => {
    const wrapper = mount(WlCard, {
      global,
      props: { padding },
      slots: {
        title: "Title",
        default: () => h(WlCard, { padding: "none", "data-testid": "nested" }, () => "Nested"),
        footer: "Footer"
      }
    });
    const ownBody = wrapper.get(":scope > .wl-card__body");
    for (const name of ["caption", "content", "footer"]) {
      expect(ownBody.get(`:scope > .wl-card__${name}`).attributes("data-padding")).toBe(padding);
    }
    expect(ownBody.attributes("data-padding")).toBeUndefined();
    expect(wrapper.get('[data-testid="nested"]').attributes("data-padding")).toBe("none");
    await wrapper.setProps({ padding: undefined });
    expect(ownBody.get(":scope > .wl-card__content").attributes("data-padding")).toBeUndefined();
    expect(wrapper.get('[data-testid="nested"] .wl-card__content').attributes("data-padding")).toBe("none");
  });
});
