import { mount } from "@vue/test-utils";
import { afterAll, describe, expect, it } from "vitest";
import { WlIcon } from "../../src";

afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));
});
describe("basic component behavior", () => {
  it("renders known icons and slot fallbacks with the requested size", () => {
    const icon = mount(WlIcon, { props: { name: "check", size: 24 } });
    const fallback = mount(WlIcon, { props: { size: "1em" }, slots: { default: "?" } });
    expect(icon.find("svg").attributes("width")).toBe("24px");
    expect(icon.find("path").exists()).toBe(true);
    expect(fallback.find(".wl-icon--slot").text()).toBe("?");
  });
});
