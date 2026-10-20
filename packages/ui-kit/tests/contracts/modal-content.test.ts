import { mount } from "@vue/test-utils";
import { afterAll, describe, expect, it } from "vitest";
import { nextTick } from "vue";
import type { GlobalMountOptions } from "../mounting-types";
import { WlConfig } from "../../src";
import { createWlPt, WlDialog, WlDrawer } from "../../src";

const global: GlobalMountOptions = {
  plugins: [[WlConfig, { pt: createWlPt() }]]
};

afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));
});
describe("basic component behavior", () => {
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
});
