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

    const next = wrapper.find('[aria-label="Следующая страница"]');
    await next.trigger("click");
    expect(wrapper.emitted("update:page")?.[1]).toEqual([4]);

    const first = wrapper.find('[aria-label="Первая страница"]');
    await first.trigger("click");
    expect(wrapper.emitted("update:page")?.[2]).toEqual([1]);
  });

  it("disables prev on the first page and next on the last", () => {
    const wrapper = mount(WlPagination, {
      global,
      props: { page: 1, pageCount: 3 }
    });
    expect(wrapper.find('[aria-label="Предыдущая страница"]').attributes("disabled")).toBeDefined();
    expect(wrapper.find('[aria-label="Следующая страница"]').attributes("disabled")).toBeUndefined();
  });

  it("compact: clamps the input into range on Enter", async () => {
    const wrapper = mount(WlPagination, {
      global,
      props: { page: 4, pageCount: 9, compact: true }
    });
    expect(wrapper.find(".wl-pager__total").text()).toBe("из 9");

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
});
