import { mount } from "@vue/test-utils";
import { afterAll, describe, expect, it } from "vitest";
import type { GlobalMountOptions } from "../mounting-types";
import { WlConfig } from "../../src";
import { createWlPt, WlProgress } from "../../src";

const global: GlobalMountOptions = {
  plugins: [[WlConfig, { pt: createWlPt() }]]
};

afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));
});
describe("basic component behavior", () => {
  it("reports progress value and visual variant", () => {
    const wrapper = mount(WlProgress, {
      global,
      props: { value: 65, tone: "success", thin: true }
    });
    const root = wrapper.find('[data-wl="progress"]');
    expect(root.classes()).toContain("wl-progress--ok");
    expect(root.classes()).toContain("wl-progress--thin");
    expect(root.attributes("aria-valuenow")).toBe("65");
  });
});
