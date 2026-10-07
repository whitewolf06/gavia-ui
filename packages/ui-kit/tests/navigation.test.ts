import type { GlobalMountOptions } from "./mounting-types";
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { WlConfig } from "../src";
import {
  WlBreadcrumbs,
  WlButton,
  WlButtonGroup,
  WlIconButton,
  WlNavItem,
  WlPagination,
  WlSegmented,
  createWlPt
} from "../src";
import type { WlBreadcrumbItem, WlSegmentedOption } from "../src";

// Wire the kit pt map exactly like a real app does, so inner sections
// (segmented items, breadcrumb list) carry their wl-* classes.
const global: GlobalMountOptions = {
  plugins: [[WlConfig, { pt: createWlPt() }]]
};

describe("WlIconButton", () => {
  it("applies classes and data attributes", () => {
    const wrapper = mount(WlIconButton, {
      global,
      props: { icon: "bell", variant: "secondary", size: "sm", ariaLabel: "Уведомления" }
    });
    const btn = wrapper.find('[data-wl="icon-button"]');
    expect(btn.classes()).toContain("wl-iconbtn");
    expect(btn.classes()).toContain("wl-iconbtn--secondary");
    expect(btn.classes()).toContain("wl-iconbtn--sm");
    expect(btn.attributes("data-variant")).toBe("secondary");
    expect(btn.attributes("data-size")).toBe("sm");
    expect(btn.attributes("aria-label")).toBe("Уведомления");
  });

  it("renders corner count and active state", () => {
    const wrapper = mount(WlIconButton, {
      global,
      props: { icon: "bell", count: 4, active: true }
    });
    expect(wrapper.find(".wl-iconbtn__count").text()).toBe("4");
    expect(wrapper.find('[data-wl="icon-button"]').classes()).toContain("is-active");
  });

  it("renders dot instead of count when dot is set", () => {
    const wrapper = mount(WlIconButton, { global, props: { icon: "bell", dot: true } });
    expect(wrapper.find(".wl-iconbtn__dot").exists()).toBe(true);
    expect(wrapper.find(".wl-iconbtn__count").exists()).toBe(false);
  });

  it("emits click and respects disabled", async () => {
    const wrapper = mount(WlIconButton, { global, props: { icon: "search" } });
    await wrapper.find('[data-wl="icon-button"]').trigger("click");
    expect(wrapper.emitted("click")).toHaveLength(1);

    const disabled = mount(WlIconButton, { global, props: { icon: "search", disabled: true } });
    await disabled.find('[data-wl="icon-button"]').trigger("click");
    expect(disabled.emitted("click")).toBeUndefined();
  });
});

describe("WlButtonGroup", () => {
  it("renders role=group and joins slotted buttons", () => {
    const wrapper = mount(WlButtonGroup, {
      global,
      slots: { default: "<button class='wl-btn'>Лево</button><button class='wl-btn'>Право</button>" }
    });
    const group = wrapper.find('[data-wl="button-group"]');
    expect(group.attributes("role")).toBe("group");
    expect(group.findAll(".wl-btn")).toHaveLength(2);
  });

  it("works with real WlButton children", () => {
    const wrapper = mount({
      global,
      components: { WlButtonGroup, WlButton },
      template:
        '<WlButtonGroup><WlButton size="sm">Один</WlButton><WlButton size="sm">Два</WlButton></WlButtonGroup>'
    });
    expect(wrapper.findAll(".wl-btn-group .wl-btn")).toHaveLength(2);
  });
});

describe("WlSegmented", () => {
  const options: WlSegmentedOption[] = [
    { label: "День", value: "day" },
    { label: "Неделя", value: "week" },
    { label: "Месяц", value: "month" }
  ];

  it("renders one item per option with the active one marked", () => {
    const wrapper = mount(WlSegmented, {
      global,
      props: { options, modelValue: "day" }
    });
    const items = wrapper.findAll(".wl-segmented__item");
    expect(items).toHaveLength(3);
    expect(items[0]!.classes()).toContain("is-active");
    expect(items[0]!.attributes("aria-pressed")).toBe("true");
    expect(items[1]!.attributes("aria-pressed")).toBe("false");
  });

  it("emits update:modelValue on select", async () => {
    const wrapper = mount(WlSegmented, {
      global,
      props: { options, modelValue: "day" }
    });
    await wrapper.findAll(".wl-segmented__item")[1]!.trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["week"]);
  });
});

describe("WlNavItem", () => {
  it("renders label, icon and badge with active state", () => {
    const wrapper = mount(WlNavItem, {
      global,
      props: { label: "Задачи", icon: "check", badge: 5, active: true }
    });
    const item = wrapper.find('[data-wl="nav-item"]');
    expect(item.classes()).toContain("is-active");
    expect(item.attributes("aria-current")).toBe("page");
    expect(wrapper.find(".wl-nav-item__icon").exists()).toBe(true);
    expect(wrapper.find(".wl-nav-item__badge").text()).toBe("5");
    expect(wrapper.find(".wl-nav-item__label").text()).toBe("Задачи");
  });

  it("renders as anchor when href is set and emits click", async () => {
    const wrapper = mount(WlNavItem, {
      global,
      props: { label: "Архив", href: "#/archive" }
    });
    const item = wrapper.find('[data-wl="nav-item"]');
    expect(item.element.tagName).toBe("A");
    expect(item.attributes("href")).toBe("#/archive");
    await item.trigger("click");
    expect(wrapper.emitted("click")).toHaveLength(1);
  });

  it("removes disabled links from navigation and the tab order", async () => {
    const wrapper = mount(WlNavItem, {
      global,
      props: { label: "Архив", href: "#/archive", disabled: true }
    });
    const item = wrapper.find("a");
    expect(item.attributes("href")).toBeUndefined();
    expect(item.attributes("aria-disabled")).toBe("true");
    expect(item.attributes("tabindex")).toBe("-1");
    await item.trigger("click");
    expect(wrapper.emitted("click")).toBeUndefined();
  });
});

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
