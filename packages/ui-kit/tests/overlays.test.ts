import { afterAll, describe, it, expect, vi } from "vitest";
import { defineComponent, nextTick, ref } from "vue";
import { mount, type GlobalMountOptions } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import { WlEmpty, WlMenu, WlPill, WlPopover, createWlPt } from "../src";
import type { WlMenuItem } from "../src";

// Wire the kit pt map exactly like a real app does, so inner sections
// (menu header/separator) carry their wl-* classes.
const global: GlobalMountOptions = {
  plugins: [[PrimeVue, { unstyled: true, pt: createWlPt() }]]
};

// PrimeVue overlay positioning schedules timers after show/hide;
// let them fire while the jsdom environment is still alive.
afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));
});

describe("WlMenu", () => {
  const items: WlMenuItem[] = [
    { label: "Открыть", icon: "edit", shortcut: "⌘O" },
    { label: "Удалить", icon: "trash", danger: true },
    { separator: true },
    { header: "Проект" },
    { label: "Настройки", disabled: true }
  ];

  it("renders static menu with items, header and separator", () => {
    const wrapper = mount(WlMenu, { global, props: { items } });
    expect(wrapper.find('[data-wl="menu"]').exists()).toBe(true);

    const links = wrapper.findAll("a.wl-menu__link");
    expect(links).toHaveLength(3);
    expect(links[0]!.text()).toContain("Открыть");
    expect(links[0]!.find(".wl-menu__meta").text()).toBe("⌘O");
    expect(links[1]!.classes()).toContain("is-danger");

    expect(wrapper.find(".wl-menu__head").text()).toBe("Проект");
    expect(wrapper.findAll(".wl-menu__sep")).toHaveLength(1);
  });

  it("calls item command on click", async () => {
    const command = vi.fn();
    const wrapper = mount(WlMenu, {
      global,
      props: { items: [{ label: "Дублировать", command }] }
    });
    await wrapper.find("a.wl-menu__link").trigger("click");
    expect(command).toHaveBeenCalledTimes(1);
    expect(command.mock.calls[0]![0]).toMatchObject({ label: "Дублировать" });
  });

  it("popup: toggles an overlay into document.body", async () => {
    const Harness = defineComponent({
      components: { WlMenu },
      setup() {
        const menuItems: WlMenuItem[] = [{ label: "Обновить" }];
        const openCount = ref(0);
        return { menuItems, openCount };
      },
      template: `
        <button class="anchor" @click="$refs.menu.toggle($event)">Меню</button>
        <WlMenu ref="menu" popup :items="menuItems" aria-label="Actions" @open="openCount++" />
      `
    });
    const wrapper = mount(Harness, {
      global: { ...global, stubs: { transition: false } },
      attachTo: document.body
    });
    await wrapper.find(".anchor").trigger("click");
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));
    const overlay = document.body.querySelector('.wl-menu[data-p="popup"]');
    expect(overlay).toBeTruthy();
    expect(overlay!.textContent).toContain("Обновить");
    expect(overlay!.querySelector('[role="menu"]')?.getAttribute("aria-label")).toBe(
      "Actions"
    );
    expect(wrapper.vm.openCount).toBe(1);
    wrapper.unmount();
  });
});

describe("WlPopover", () => {
  it("opens via exposed toggle and renders slot content", async () => {
    const Harness = defineComponent({
      components: { WlPopover },
      setup() {
        return { openCount: ref(0) };
      },
      template: `
        <button class="anchor" @click="$refs.pop.toggle($event)">Открыть</button>
        <WlPopover ref="pop" aria-label="Card details" @open="openCount++"><div class="pop-body">Детали карточки</div></WlPopover>
      `
    });
    const wrapper = mount(Harness, {
      global: { ...global, stubs: { transition: false } },
      attachTo: document.body
    });
    expect(document.body.querySelector(".wl-popover")).toBeNull();

    await wrapper.find(".anchor").trigger("click");
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));
    const pop = document.body.querySelector(".wl-popover");
    expect(pop).toBeTruthy();
    expect(pop!.textContent).toContain("Детали карточки");
    expect(pop!.getAttribute("aria-label")).toBe("Card details");
    expect(wrapper.vm.openCount).toBe(1);
    wrapper.unmount();
  });
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

describe("WlPill", () => {
  it("applies variant class and data attributes", () => {
    const wrapper = mount(WlPill, {
      global,
      props: { variant: "ok" },
      slots: { default: "Готово" }
    });
    const pill = wrapper.find('[data-wl="pill"]');
    expect(pill.classes()).toContain("wl-pill");
    expect(pill.classes()).toContain("wl-pill--ok");
    expect(pill.attributes("data-variant")).toBe("ok");
    expect(pill.text()).toContain("Готово");
  });

  it("defaults to neutral variant", () => {
    const wrapper = mount(WlPill, { global, props: { label: "Черновик" } });
    expect(wrapper.find('[data-wl="pill"]').classes()).toContain("wl-pill--neutral");
  });
});
