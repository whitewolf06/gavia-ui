import { mount } from "@vue/test-utils";
import { afterAll, describe, expect, it } from "vitest";
import type { GlobalMountOptions } from "../mounting-types";
import { WlConfig } from "../../src";
import { createWlPt, WlSkeleton, WlSpinner } from "../../src";

const global: GlobalMountOptions = {
  plugins: [[WlConfig, { pt: createWlPt() }]]
};

afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));
});
describe("basic component behavior", () => {
  it("applies skeleton geometry and spinner status labeling", () => {
    const skeleton = mount(WlSkeleton, {
      global,
      props: { width: "40px", height: "40px", shape: "circle" }
    });
    const spinner = mount(WlSpinner, { props: { size: "lg", label: "Loading timeline" } });
    expect(skeleton.find('[data-wl="skeleton"]').attributes("style")).toContain("width: 40px");
    expect(skeleton.find('[data-wl="skeleton"]').classes()).toContain("wl-skeleton");
    expect(spinner.attributes("role")).toBe("status");
    expect(spinner.attributes("aria-label")).toBe("Loading timeline");
    expect(spinner.attributes("data-size")).toBe("lg");
  });
});
