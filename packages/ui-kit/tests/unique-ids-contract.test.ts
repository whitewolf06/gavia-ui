import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { type Component, defineComponent, h, nextTick } from "vue";
import { WlConfirmationService, WlToastService } from "../src";
import * as components from "../src/components";
import { wlManifest } from "../src/manifest";

const fixtures: Record<string, Record<string, unknown>> = {
  WlField: { label: "Name", hint: "Enter a name" },
  WlSelect: { options: ["One", "Two"] },
  WlMultiSelect: { options: ["One", "Two"], filter: true },
  WlAutocomplete: { suggestions: ["One", "Two"], dropdown: true },
  WlTabs: { items: [{ key: "same key", label: "First" }, { key: "same-key", label: "Second" }] },
  WlAccordion: { items: [{ key: "same", title: "Section" }] },
  WlDialog: { visible: true, header: "Dialog", modal: false },
  WlDrawer: { visible: true, header: "Drawer", modal: false },
  WlCommandPalette: { visible: true, items: [{ id: "one", label: "One" }] },
  WlPagination: { pageCount: 4 },
  WlRadio: { value: "one" },
  WlTable: { value: [{ title: "One" }], columns: [{ key: "title", label: "Title" }] },
  WlMenu: { items: [{ label: "One" }] },
  WlContextMenu: { items: [{ key: "one", label: "One" }] },
  WlCheckboxGroup: { options: ["One", "Two"], legend: "Permissions" },
  WlRadioGroup: { options: ["One", "Two"], legend: "Plan" },
  WlTagsInput: { modelValue: ["One"], "aria-label": "Tags" },
  WlTooltipComponent: { visible: true, content: "Details", motion: false },
  WlSidebar: { groups: [] }
};

describe("generated IDs and ID references", () => {
  it.each(wlManifest.map((entry) => entry.name))("keeps two %s instances independent", async (name) => {
    const component = (components as unknown as Record<string, Component>)[name];
    expect(component, `${name} must be exported`).toBeDefined();
    const props = fixtures[name] ?? {};
    const slots = name === "WlField"
      ? { default: (field: { inputId: string; ariaDescribedby?: string }) => h("input", {
          id: field.inputId, "aria-describedby": field.ariaDescribedby
        }) }
      : name === "WlTooltipComponent" ? { default: () => h("button", "Details") } : {};
    const Host = defineComponent({
      setup: () => () => h("div", [h(component!, props, slots), h(component!, props, slots)])
    });
    const host = document.createElement("div");
    document.body.append(host);
    const wrapper = mount(Host, {
      attachTo: host,
      global: { plugins: [WlToastService, WlConfirmationService], stubs: { transition: false } }
    });
    try {
      for (const instance of wrapper.findAllComponents(component!)) {
        const api = instance.vm as unknown as { show?: () => void };
        api.show?.();
      }
      if (["WlSelect", "WlMultiSelect", "WlAutocomplete"].includes(name)) {
        for (const target of wrapper.findAll('[role="combobox"]')) await target.trigger("keydown", { key: "ArrowDown" });
      }
      await nextTick();
      const ids = [...document.querySelectorAll<HTMLElement>("[id]")].map((element) => element.id);
      expect(new Set(ids).size, `${name}: duplicate IDs`).toBe(ids.length);
      for (const element of document.querySelectorAll("[aria-labelledby], [aria-describedby], [aria-controls], [aria-activedescendant], label[for]")) {
        for (const attribute of ["aria-labelledby", "aria-describedby", "aria-controls", "aria-activedescendant", "for"]) {
          for (const id of (element.getAttribute(attribute) ?? "").split(/\s+/).filter(Boolean)) {
            expect(document.getElementById(id), `${name}: ${attribute} references missing ${id}`).not.toBeNull();
          }
        }
      }
    } finally {
      wrapper.unmount();
      host.remove();
    }
  });
});
