import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import type { GlobalMountOptions } from "../mounting-types";
import { WlConfig } from "../../src";
import { createWlPt, WlPagination } from "../../src";

// Wire the kit pt map exactly like a real app does, so inner sections
// (segmented items, breadcrumb list) carry their wl-* classes.
const global: GlobalMountOptions = {
  plugins: [[WlConfig, { pt: createWlPt() }]]
};
describe("WlPagination", () => {
  function numericButtons(wrapper: ReturnType<typeof mount>) {
    return wrapper.findAll(".wl-pager__btn:not(.wl-pager__nav)");
  }

  it("renders pages with a trailing ellipsis gap", () => {
    const wrapper = mount(WlPagination, {
      global,
      props: { page: 3, pageCount: 10, siblings: 1 }
    });
    const labels = numericButtons(wrapper).map((b) => b.text());
    expect(labels).toEqual(["1", "2", "3", "4", "5", "10"]);
    expect(wrapper.findAll(".wl-pager__gap")).toHaveLength(1);
    expect(wrapper.find(".wl-pager__btn.is-active").text()).toBe("3");
  });

  it("renders a middle window with two gaps", () => {
    const wrapper = mount(WlPagination, {
      global,
      props: { page: 6, pageCount: 12, siblings: 1 }
    });
    const labels = numericButtons(wrapper).map((b) => b.text());
    expect(labels).toEqual(["1", "5", "6", "7", "12"]);
    expect(wrapper.findAll(".wl-pager__gap")).toHaveLength(2);
  });

  it("emits update:page on page and nav clicks", async () => {
    const wrapper = mount(WlPagination, {
      global,
      props: { page: 3, pageCount: 10, siblings: 1 }
    });
    const five = numericButtons(wrapper).find((b) => b.text() === "5");
    await five!.trigger("click");
    expect(wrapper.emitted("update:page")?.[0]).toEqual([5]);

    const next = wrapper.find('[aria-label="Next page"]');
    await next.trigger("click");
    expect(wrapper.emitted("update:page")?.[1]).toEqual([4]);

    const first = wrapper.find('[aria-label="First page"]');
    await first.trigger("click");
    expect(wrapper.emitted("update:page")?.[2]).toEqual([1]);
  });

  it("disables prev on the first page and next on the last", () => {
    const wrapper = mount(WlPagination, {
      global,
      props: { page: 1, pageCount: 3 }
    });
    expect(wrapper.find('[aria-label="Previous page"]').attributes("disabled")).toBeDefined();
    expect(wrapper.find('[aria-label="Next page"]').attributes("disabled")).toBeUndefined();
  });

  it("compact: clamps the input into range on Enter", async () => {
    const wrapper = mount(WlPagination, {
      global,
      props: { page: 4, pageCount: 9, compact: true }
    });
    expect(wrapper.find(".wl-pager__total").text()).toBe("of 9");

    const input = wrapper.find(".wl-pager__input");
    expect((input.element as HTMLInputElement).value).toBe("4");

    await input.setValue("42");
    await input.trigger("keydown.enter");
    expect(wrapper.emitted("update:page")?.[0]).toEqual([9]);
    expect((input.element as HTMLInputElement).value).toBe("9");
  });

  it("compact: restores the current page for invalid input", async () => {
    const wrapper = mount(WlPagination, {
      global,
      props: { page: 4, pageCount: 9, compact: true }
    });
    const input = wrapper.find(".wl-pager__input");
    await input.setValue("abc");
    await input.trigger("blur");
    expect(wrapper.emitted("update:page")).toBeUndefined();
    expect((input.element as HTMLInputElement).value).toBe("4");
  });
  it("pins the last page window and keeps previous/last navigation in the public one-based page domain", async () => {
    const wrapper = mount(WlPagination, { global, props: { page: 11, pageCount: 12, siblings: 1 } });
    try {
      expect(numericButtons(wrapper).map((button) => button.text())).toEqual(["1", "8", "9", "10", "11", "12"]);
      expect(wrapper.findAll(".wl-pager__gap")).toHaveLength(1);
      await wrapper.get('[aria-label="Previous page"]').trigger("click");
      await wrapper.get('[aria-label="Last page"]').trigger("click");
      expect(wrapper.emitted("update:page")).toEqual([[10], [12]]);
      await wrapper.setProps({ disabled: true });
      wrapper.get('[aria-label="Previous page"]').element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      expect(wrapper.emitted("update:page")).toHaveLength(2);
    } finally { wrapper.unmount(); }
  });
  it("compact: navigates both directions and normalizes a nonfinite current page", async () => {
    const wrapper = mount(WlPagination, { global, props: { page: 4, pageCount: 9, compact: true } });
    try {
      await wrapper.get('[aria-label="Previous page"]').trigger("click");
      await wrapper.get('[aria-label="Next page"]').trigger("click");
      expect(wrapper.emitted("update:page")).toEqual([[3], [5]]);
      await wrapper.setProps({ page: Number.NaN });
      expect(wrapper.get<HTMLInputElement>("input").element.value).toBe("1");
      await wrapper.get('[aria-label="Next page"]').trigger("click");
      expect(wrapper.emitted("update:page")?.at(-1)).toEqual([2]);
    } finally { wrapper.unmount(); }
  });
  it("ignores unchanged, invalid and disabled page-size requests while normalizing nonfinite totals", async () => {
    const wrapper = mount(WlPagination, { global, props: { page: 3, pageSize: 10, pageSizes: [10, 20], total: 45 } });
    try {
      const select = wrapper.get<HTMLSelectElement>("select");
      await select.setValue("10");
      expect(wrapper.emitted("update:pageSize")).toBeUndefined();
      await select.setValue("999");
      expect(wrapper.emitted("update:pageSize")).toBeUndefined();
      await wrapper.setProps({ disabled: true });
      select.element.value = "20";
      select.element.dispatchEvent(new Event("change", { bubbles: true }));
      expect(wrapper.emitted("update:pageSize")).toBeUndefined();
      await wrapper.setProps({ disabled: false });
      await select.setValue("20");
      expect(wrapper.emitted("update:pageSize")).toEqual([[20]]);
      expect(wrapper.emitted("update:page")).toEqual([[1]]);
      await wrapper.setProps({ total: Infinity, page: 1 });
      expect(wrapper.get(".wl-pagination__range").text()).toBe("Showing 0–0 of 0");
    } finally { wrapper.unmount(); }
  });
});
