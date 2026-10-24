import { mount } from "@vue/test-utils";
import { afterAll, describe, expect, it } from "vitest";
import type { GlobalMountOptions } from "../mounting-types";
import { WlConfig } from "../../src";
import { createWlPt, WlEmpty } from "../../src";

// Wire the kit pt map exactly like a real app does, so inner sections
// (menu header/separator) carry their wl-* classes.
const global: GlobalMountOptions = {
  plugins: [[WlConfig, { pt: createWlPt() }]]
};

// Allow pending overlay positioning callbacks to finish
// while the jsdom environment is still alive.
afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));
});
describe("WlEmpty", () => {
  it("renders icon, title and description", () => {
    const wrapper = mount(WlEmpty, {
      global,
      props: { icon: "search", title: "Ничего не найдено", description: "Попробуйте изменить фильтры" }
    });
    expect(wrapper.find('[data-wl="empty"]').exists()).toBe(true);
    expect(wrapper.find(".wl-empty__icon").exists()).toBe(true);
    expect(wrapper.find(".wl-empty__title").text()).toBe("Ничего не найдено");
    expect(wrapper.find(".wl-empty__desc").text()).toBe("Попробуйте изменить фильтры");
  });

  it("renders the action slot", () => {
    const wrapper = mount(WlEmpty, {
      global,
      props: { title: "Пусто" },
      slots: { action: "<button class='act'>Создать</button>" }
    });
    expect(wrapper.find(".wl-empty__action .act").exists()).toBe(true);
  });
});
