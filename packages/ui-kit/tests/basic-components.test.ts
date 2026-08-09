import { afterAll, describe, expect, it } from "vitest";
import { nextTick } from "vue";
import { flushPromises, mount, type GlobalMountOptions } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import {
  WlAvatar,
  WlBadge,
  WlCard,
  WlChip,
  WlDialog,
  WlDivider,
  WlDrawer,
  WlIcon,
  WlProgress,
  WlRadio,
  WlSelect,
  WlSkeleton,
  WlSpinner,
  createWlPt
} from "../src";

const global: GlobalMountOptions = {
  plugins: [[PrimeVue, { unstyled: true, pt: createWlPt() }]]
};

afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));
});

describe("basic component behavior", () => {
  it("renders avatar content and presence", () => {
    const wrapper = mount(WlAvatar, {
      global,
      props: { label: "AK", size: 48, presence: "online" }
    });
    expect(wrapper.find('[data-wl="avatar"]').attributes("data-size")).toBe("48");
    expect(wrapper.text()).toContain("AK");
    expect(wrapper.find(".wl-avatar__presence--online").exists()).toBe(true);
  });

  it("switches badge between value and dot modes", async () => {
    const wrapper = mount(WlBadge, { global, props: { value: 8, variant: "danger" } });
    expect(wrapper.text()).toContain("8");
    expect(wrapper.find('[data-wl="badge"]').attributes("data-variant")).toBe("danger");
    await wrapper.setProps({ dot: true });
    expect(wrapper.find(".wl-badge--dot").exists()).toBe(true);
    expect(wrapper.text()).not.toContain("8");
  });

  it("renders all card content regions", () => {
    const wrapper = mount(WlCard, {
      global,
      props: { hoverable: true },
      slots: {
        header: '<div class="header">Header</div>',
        title: "Title",
        default: "Body",
        footer: '<div class="footer">Footer</div>'
      }
    });
    expect(wrapper.find(".wl-card--hoverable").exists()).toBe(true);
    expect(wrapper.text()).toContain("Header");
    expect(wrapper.text()).toContain("Title");
    expect(wrapper.text()).toContain("Body");
    expect(wrapper.text()).toContain("Footer");
  });

  it("toggles an enabled chip and ignores a disabled chip", async () => {
    const wrapper = mount(WlChip, {
      props: { active: false, count: 3 },
      slots: { default: "Tasks" }
    });
    await wrapper.trigger("click");
    expect(wrapper.emitted("update:active")?.[0]).toEqual([true]);
    expect(wrapper.text()).toContain("3");

    const disabled = mount(WlChip, { props: { disabled: true } });
    await disabled.trigger("click");
    expect(disabled.emitted("update:active")).toBeUndefined();
  });

  it("renders dialog and drawer content in overlays", async () => {
    const dialog = mount(WlDialog, {
      global: { ...global, stubs: { transition: false } },
      attachTo: document.body,
      props: {
        visible: true,
        header: "Dialog",
        ariaLabel: "Task dialog",
        dismissable: true,
        blockScroll: true
      },
      slots: { default: "Dialog body" }
    });
    const drawer = mount(WlDrawer, {
      global: { ...global, stubs: { transition: false } },
      attachTo: document.body,
      props: {
        visible: true,
        header: "Drawer",
        position: "left",
        ariaLabel: "Task drawer",
        closeOnEscape: false,
        blockScroll: true
      },
      slots: { default: "Drawer body" }
    });
    await nextTick();

    const dialogRoot = document.body.querySelector<HTMLElement>('[data-wl="dialog"]');
    const drawerRoot = document.body.querySelector<HTMLElement>('[data-wl="drawer"]');
    expect(dialogRoot?.textContent).toContain("Dialog body");
    expect(drawerRoot?.textContent).toContain("Drawer body");
    expect(dialogRoot?.getAttribute("aria-label")).toBe("Task dialog");
    expect(drawerRoot?.getAttribute("aria-label")).toBe("Task drawer");
    expect(drawerRoot?.classList.contains("wl-drawer--left")).toBe(true);
    expect(dialog.emitted("open")).toHaveLength(1);
    expect(drawer.emitted("open")).toHaveLength(1);

    await dialog.setProps({ visible: false });
    await drawer.setProps({ visible: false });
    await nextTick();
    expect(dialog.emitted("close")).toHaveLength(1);
    expect(drawer.emitted("close")).toHaveLength(1);
    dialog.unmount();
    drawer.unmount();
  });

  it("distinguishes plain and labeled dividers", () => {
    const plain = mount(WlDivider, { global });
    const labeled = mount(WlDivider, { global, slots: { default: "Details" } });
    expect(plain.find(".wl-divider--plain").exists()).toBe(true);
    expect(labeled.find(".wl-divider--plain").exists()).toBe(false);
    expect(labeled.text()).toContain("Details");
  });

  it("renders known icons and slot fallbacks with the requested size", () => {
    const icon = mount(WlIcon, { props: { name: "check", size: 24 } });
    const fallback = mount(WlIcon, { props: { size: "1em" }, slots: { default: "?" } });
    expect(icon.find("svg").attributes("width")).toBe("24px");
    expect(icon.find("path").exists()).toBe(true);
    expect(fallback.find(".wl-icon--slot").text()).toBe("?");
  });

  it("reports progress value and visual variant", () => {
    const wrapper = mount(WlProgress, {
      global,
      props: { value: 65, variant: "ok", thin: true }
    });
    const root = wrapper.find('[data-wl="progress"]');
    expect(root.classes()).toContain("wl-progress--ok");
    expect(root.classes()).toContain("wl-progress--thin");
    expect(root.attributes("aria-valuenow")).toBe("65");
  });

  it("updates a radio model when selected", async () => {
    const wrapper = mount(WlRadio, {
      global,
      props: { modelValue: "a", value: "b", name: "choice" },
      slots: { default: "Choice B" }
    });
    await wrapper.find('input[type="radio"]').setValue(true);
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["b"]);
    expect(wrapper.text()).toContain("Choice B");
  });

  it("opens select options and emits the selected value", async () => {
    const options = [
      { label: "Alpha", value: "a" },
      { label: "Beta", value: "b" }
    ];
    const wrapper = mount(WlSelect, {
      global,
      attachTo: document.body,
      props: { options, modelValue: null, optionLabel: "label", optionValue: "value" }
    });
    await wrapper.find(".wl-select").trigger("click");
    await nextTick();
    const option = document.body.querySelector<HTMLElement>(".wl-select-overlay .wl-select__option");
    expect(option).toBeTruthy();
    option!.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
    await nextTick();
    await flushPromises();
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["a"]);
    wrapper.unmount();
  });

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
