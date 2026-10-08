import type { GlobalMountOptions } from "./mounting-types";
import { describe, expect, it } from "vitest";
import { defineComponent, h, nextTick } from "vue";
import { mount, type VueWrapper } from "@vue/test-utils";
import { WlConfig } from "../src";
import { WlFilterBar, WlPageHeader, createWlPt } from "../src";

const global: GlobalMountOptions = {
  plugins: [[WlConfig, { pt: createWlPt() }]]
};

describe("WlPageHeader", () => {
  it("renders the semantic page hierarchy and public markers", () => {
    const wrapper = mount(WlPageHeader, {
      props: {
        title: "Tasks",
        description: "Plan and track delivery",
        eyebrow: "Workspace",
        size: "md",
        density: "compact"
      }
    });
    const root = wrapper.find('[data-wl="page-header"]');
    expect(root.element.tagName).toBe("HEADER");
    expect(root.attributes("data-size")).toBe("md");
    expect(root.attributes("data-density")).toBe("compact");
    expect(wrapper.find("h1").text()).toBe("Tasks");
    expect(wrapper.find(".wl-page-header__description").text()).toBe(
      "Plan and track delivery"
    );
    expect(wrapper.find(".wl-page-header__eyebrow").text()).toBe("Workspace");
  });

  it("supports h2 and every composed content region through slots", () => {
    const wrapper = mount(WlPageHeader, {
      props: { headingLevel: 2 },
      slots: {
        breadcrumbs: '<nav class="crumbs">Tasks / WL-42</nav>',
        title: "Task details",
        description: "Description slot",
        meta: '<span class="meta">In progress</span>',
        actions: '<button class="action">Edit</button>',
        navigation: '<nav class="tabs">Overview</nav>'
      }
    });

    expect(wrapper.find("h1").exists()).toBe(false);
    expect(wrapper.find("h2").text()).toBe("Task details");
    expect(wrapper.find(".crumbs").exists()).toBe(true);
    expect(wrapper.find(".meta").exists()).toBe(true);
    expect(wrapper.find(".action").exists()).toBe(true);
    expect(wrapper.find(".tabs").exists()).toBe(true);
  });
});

describe("WlFilterBar", () => {
  it("composes leading, controls, active summary and reset without owning values", async () => {
    const wrapper = mount(WlFilterBar, {
      global,
      props: { activeCount: 2, density: "compact" },
      slots: {
        leading: '<input class="search" aria-label="Search" />',
        default: '<button class="project-filter">Project</button>',
        summary: '<span class="summary">Project: Atlas</span>'
      }
    });

    const root = wrapper.find('[data-wl="filter-bar"]');
    expect(root.attributes("data-density")).toBe("compact");
    expect(wrapper.find(".search").exists()).toBe(true);
    expect(wrapper.find(".project-filter").exists()).toBe(true);
    expect(wrapper.find(".summary").exists()).toBe(true);
    expect(wrapper.find(".wl-filter-bar__count").text()).toBe("2");

    await wrapper.find(".wl-filter-bar__actions button").trigger("click");
    expect(wrapper.emitted("clear")).toHaveLength(1);
  });

  it("opens from the toggle, closes on Escape and restores focus", async () => {
    let wrapper!: VueWrapper;
    wrapper = mount(WlFilterBar, {
      global,
      attachTo: document.body,
      props: {
        open: false,
        "onUpdate:open": (value: boolean) => wrapper.setProps({ open: value })
      },
      slots: { default: '<input class="project" aria-label="Project" />' }
    });
    const toggle = wrapper.find(".wl-filter-bar__mobile-toggle button");
    (toggle.element as HTMLElement).focus();
    await toggle.trigger("click");
    await nextTick();
    await nextTick();

    expect(wrapper.find('[data-wl="filter-bar"]').attributes("data-open")).toBe("true");
    expect(toggle.attributes("aria-expanded")).toBe("true");
    expect(wrapper.emitted("open")).toHaveLength(1);
    expect(wrapper.find(".wl-filter-bar__panel").element.contains(document.activeElement)).toBe(
      true
    );

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await nextTick();
    await nextTick();
    expect(wrapper.emitted("close")).toHaveLength(1);
    expect(document.activeElement).toBe(toggle.element);
    wrapper.unmount();
  });

  it("emits apply and closes the controlled mobile panel", async () => {
    let wrapper!: VueWrapper;
    wrapper = mount(WlFilterBar, {
      global,
      props: {
        open: true,
        "onUpdate:open": (value: boolean) => wrapper.setProps({ open: value })
      },
      slots: { default: '<input aria-label="Status" />' }
    });
    await nextTick();
    await wrapper.find(".wl-filter-bar__footer button").trigger("click");
    await nextTick();

    expect(wrapper.emitted("apply")).toHaveLength(1);
    const updates = wrapper.emitted("update:open") ?? [];
    expect(updates[updates.length - 1]).toEqual([false]);
  });

  it("creates unique toggle-to-panel relationships for siblings in one application", () => {
    // Vue-generated IDs are scoped to one app. Independent apps use distinct idPrefix values.
    const Harness = defineComponent({
      setup: () => () => h("main", [h(WlFilterBar), h(WlFilterBar)])
    });
    const wrapper = mount(Harness, { global });
    try {
      const bars = wrapper.findAll(".wl-filter-bar");
      const controls = bars.map((bar) => bar.get(".wl-filter-bar__mobile-toggle button").attributes("aria-controls"));
      expect(bars).toHaveLength(2);
      expect(new Set(controls).size).toBe(2);
      for (const [index, bar] of bars.entries()) {
        expect(bar.get(".wl-filter-bar__panel").attributes("id")).toBe(controls[index]);
      }
    } finally { wrapper.unmount(); }
  });

  it("does not open or emit actions while disabled", async () => {
    const wrapper = mount(WlFilterBar, {
      global,
      props: { disabled: true, activeCount: 1 }
    });
    await wrapper.find(".wl-filter-bar__mobile-toggle button").trigger("click");
    await wrapper.find(".wl-filter-bar__actions button").trigger("click");
    expect(wrapper.emitted("update:open")).toBeUndefined();
    expect(wrapper.emitted("clear")).toBeUndefined();
  });
});
