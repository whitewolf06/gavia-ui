import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import type { WlBreadcrumbItem } from "../../src";
import type { GlobalMountOptions } from "../mounting-types";
import { WlConfig } from "../../src";
import { createWlPt, WlBreadcrumbs } from "../../src";

// Wire the kit pt map exactly like a real app does, so inner sections
// (segmented items, breadcrumb list) carry their wl-* classes.
const global: GlobalMountOptions = {
  plugins: [[WlConfig, { pt: createWlPt() }]]
};
describe("WlBreadcrumbs", () => {
  const items: WlBreadcrumbItem[] = [
    { label: "Задачи", href: "#/tasks", icon: "check" },
    { label: "Спринт 24", href: "#/sprint" },
    { label: "Карточка 128" }
  ];

  it("renders links for all but the last item", () => {
    const wrapper = mount(WlBreadcrumbs, { global, props: { items } });
    const links = wrapper.findAll("a.wl-breadcrumbs__link");
    expect(links).toHaveLength(2);
    expect(links[0]!.attributes("href")).toBe("#/tasks");
    expect(links[1]!.attributes("href")).toBe("#/sprint");

    const current = wrapper.find(".wl-breadcrumbs__link.is-current");
    expect(current.element.tagName).toBe("SPAN");
    expect(current.text()).toContain("Карточка 128");
    expect(current.attributes("aria-current")).toBe("page");
  });

  it("renders separators between items", () => {
    const wrapper = mount(WlBreadcrumbs, { global, props: { items } });
    expect(wrapper.findAll(".wl-breadcrumbs__sep")).toHaveLength(2);
  });
});
