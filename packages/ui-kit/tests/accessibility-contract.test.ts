import type { GlobalMountOptions } from "./mounting-types";
import { afterEach, describe, expect, it } from "vitest";
import { nextTick } from "vue";
import { mount, type VueWrapper } from "@vue/test-utils";
import { WlConfig } from "../src";
import {
  WlAutocomplete,
  WlButton,
  WlButtonGroup,
  WlCheckbox,
  WlColorPicker,
  WlCommandPalette,
  WlDatePicker,
  WlFilterBar,
  WlIconButton,
  WlInput,
  WlMultiSelect,
  WlNumberInput,
  WlPasswordInput,
  WlProgress,
  WlRadio,
  WlSelect,
  WlSlider,
  WlSpinner,
  WlSwitch,
  WlTextarea,
  createWlPt
} from "../src";

const global: GlobalMountOptions = {
  plugins: [[WlConfig, { pt: createWlPt() }]],
  stubs: { transition: false }
};

const mounted: VueWrapper[] = [];

function track(wrapper: VueWrapper): VueWrapper {
  mounted.push(wrapper);
  return wrapper;
}

afterEach(() => {
  for (const wrapper of mounted.splice(0)) wrapper.unmount();
  document.body.innerHTML = "";
});

describe("accessibility contract", () => {
  it("exposes accessible names and busy/disabled states for action controls", () => {
    const button = track(
      mount(WlButton, {
        global,
        attrs: { "aria-label": "Save task" },
        props: { loading: true }
      })
    );
    const iconButton = track(
      mount(WlIconButton, {
        global,
        props: { icon: "search", ariaLabel: "Search", disabled: true }
      })
    );

    expect(button.get("button").attributes("aria-label")).toBe("Save task");
    expect(button.get("button").attributes("aria-busy")).toBe("true");
    expect(button.get("button").attributes("disabled")).toBeDefined();
    expect(button.get(".wl-btn__spinner").attributes("aria-hidden")).toBe("true");
    expect(iconButton.get("button").attributes("aria-label")).toBe("Search");
    expect(iconButton.get("button").attributes("disabled")).toBeDefined();
  });

  it("exposes aria-invalid on every invalid focusable form control", () => {
    const controls = [
      track(mount(WlInput, { global, attrs: { "aria-label": "Title" }, props: { invalid: true } })).get("input"),
      track(mount(WlTextarea, { global, attrs: { "aria-label": "Description" }, props: { invalid: true } })).get("textarea"),
      track(mount(WlSelect<string>, { global, attrs: { "aria-label": "Project" }, props: { options: [], invalid: true } })).get('[role="combobox"]'),
      track(mount(WlMultiSelect<string>, { global, attrs: { "aria-label": "Tags" }, props: { options: [], invalid: true } })).get('[role="combobox"]'),
      track(mount(WlAutocomplete<string, false>, { global, attrs: { "aria-label": "Assignee" }, props: { suggestions: [], invalid: true } })).get("input"),
      track(mount(WlDatePicker, { global, attrs: { "aria-label": "Due date" }, props: { invalid: true } })).get("input"),
      track(mount(WlCheckbox, { global, attrs: { "aria-label": "Done" }, props: { invalid: true } })).get('input[type="checkbox"]'),
      track(mount(WlRadio, { global, attrs: { "aria-label": "Priority" }, props: { value: "high", invalid: true } })).get('input[type="radio"]'),
      track(mount(WlSwitch, { global, attrs: { "aria-label": "Enabled" }, props: { invalid: true } })).get('input[type="checkbox"]'),
      track(mount(WlNumberInput, { global, props: { ariaLabel: "Estimate", invalid: true } })).get('[role="spinbutton"]'),
      track(mount(WlPasswordInput, { global, props: { ariaLabel: "Password", invalid: true } })).get('input[type="password"]'),
      track(mount(WlColorPicker, { global, props: { inputLabel: "Color", invalid: true } })).get("input")
    ];

    for (const control of controls) {
      expect(control.attributes("aria-invalid"), control.html()).toBe("true");
    }
  });

  it("keeps generated ARIA ID references resolvable", async () => {
    track(
      mount(WlCommandPalette, {
        global,
        attachTo: document.body,
        props: {
          visible: true,
          groups: [{ id: "quick", label: "Quick", items: [{ id: "new", label: "New task" }] }]
        }
      })
    );
    track(
      mount(WlFilterBar, {
        global,
        attachTo: document.body,
        props: { open: true, ariaLabel: "Task filters" },
        slots: { default: '<button type="button">Project</button>' }
      })
    );
    await nextTick();

    const references = document.body.querySelectorAll<HTMLElement>(
      "[aria-controls], [aria-describedby], [aria-labelledby], [aria-activedescendant]"
    );
    expect(references.length).toBeGreaterThan(0);

    for (const element of references) {
      for (const attribute of [
        "aria-controls",
        "aria-describedby",
        "aria-labelledby",
        "aria-activedescendant"
      ]) {
        const value = element.getAttribute(attribute);
        if (!value) continue;
        for (const id of value.split(/\s+/)) {
          expect(document.getElementById(id), `${attribute}=${id} does not resolve`).not.toBeNull();
        }
      }
    }
  });

  it("supports roving keyboard focus in composite choices", async () => {
    const picker = track(
      mount(WlColorPicker, {
        global,
        attachTo: document.body,
        props: { swatches: ["#2563eb", "#2e9e68", "#d2494f"] }
      })
    );
    const options = picker.findAll<HTMLElement>('[role="option"]');
    expect(options.map((option) => option.attributes("tabindex"))).toEqual(["0", "-1", "-1"]);

    options[0]!.element.focus();
    await options[0]!.trigger("keydown", { key: "ArrowRight" });
    expect(document.activeElement).toBe(options[1]!.element);
    expect(options[1]!.attributes("tabindex")).toBe("0");
  });

  it("keeps landmark, status and range semantics available to consumers", () => {
    const group = track(
      mount(WlButtonGroup, { global, props: { ariaLabel: "View mode" }, slots: { default: "Modes" } })
    );
    const progress = track(mount(WlProgress, { global, props: { value: 42 } }));
    const spinner = track(mount(WlSpinner, { global, props: { label: "Loading tasks" } }));
    const slider = track(mount(WlSlider, { global, props: { modelValue: 25, ariaLabel: "Zoom" } }));

    expect(group.get('[role="group"]').attributes("aria-label")).toBe("View mode");
    expect(progress.get('[role="progressbar"]').attributes("aria-valuenow")).toBe("42");
    expect(spinner.get('[role="status"]').attributes("aria-label")).toBe("Loading tasks");
    expect(slider.get('input[type="range"]').attributes("aria-label")).toBe("Zoom");
  });
});
