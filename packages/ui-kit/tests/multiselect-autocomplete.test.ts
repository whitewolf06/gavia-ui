import { afterAll, describe, it, expect, vi } from "vitest";
import { defineComponent, nextTick, ref } from "vue";
import { mount, type GlobalMountOptions } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import {
  WlAutocomplete,
  WlConfirmDialog,
  WlConfirmationService,
  WlMultiSelect,
  createWlPt,
  useWlConfirm
} from "../src";

// Wire the kit pt map exactly like a real app does, so inner sections
// (overlay, options, chips) carry their wl-* classes.
const global: GlobalMountOptions = {
  plugins: [[PrimeVue, { unstyled: true, pt: createWlPt() }]]
};

const confirmGlobal: GlobalMountOptions = {
  plugins: [[PrimeVue, { unstyled: true, pt: createWlPt() }], WlConfirmationService]
};

// PrimeVue overlay positioning schedules timers after show/hide;
// let them fire while the jsdom environment is still alive.
afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));
});

describe("WlMultiSelect", () => {
  const options = [
    { label: "Москва", value: "msk" },
    { label: "Казань", value: "kzn" },
    { label: "Новосибирск", value: "nsk" }
  ];

  it("renders root with kit classes and data attributes", () => {
    const wrapper = mount(WlMultiSelect, { global, props: { options, modelValue: [] } });
    const root = wrapper.find('[data-wl="multiselect"]');
    expect(root.exists()).toBe(true);
    expect(root.classes()).toContain("wl-multiselect");
    expect(root.classes()).toContain("wl-multiselect--md");
    expect(root.attributes("data-size")).toBe("md");
  });

  it("shows placeholder when nothing is selected", () => {
    const wrapper = mount(WlMultiSelect, {
      global,
      props: { options, modelValue: [], placeholder: "Города" }
    });
    expect(wrapper.find(".wl-multiselect__label").text()).toBe("Города");
  });

  it("marks size, invalid and disabled states", () => {
    const wrapper = mount(WlMultiSelect, {
      global,
      props: { options, modelValue: [], size: "sm", invalid: true, disabled: true }
    });
    const root = wrapper.find(".wl-multiselect");
    expect(root.classes()).toContain("wl-multiselect--sm");
    expect(root.classes()).toContain("is-invalid");
    expect(root.classes()).toContain("is-disabled");
  });

  it("renders selected values as chips when display=chip", () => {
    const wrapper = mount(WlMultiSelect, {
      global,
      props: {
        options,
        modelValue: ["msk", "kzn"],
        optionLabel: "label",
        optionValue: "value",
        display: "chip"
      }
    });
    const chips = wrapper.findAll(".wl-multiselect__chip");
    expect(chips).toHaveLength(2);
    expect(chips[0]!.text()).toContain("Москва");
    expect(chips[1]!.text()).toContain("Казань");
  });

  it("opens the overlay and emits update:modelValue on option click", async () => {
    const wrapper = mount(WlMultiSelect, {
      global,
      attachTo: document.body,
      props: { options, modelValue: [], optionLabel: "label", optionValue: "value" }
    });
    await wrapper.find(".wl-multiselect").trigger("click");
    await nextTick();
    const option = document.body.querySelector<HTMLElement>(
      ".wl-multiselect-overlay .wl-select__option"
    );
    expect(option).toBeTruthy();
    option!.click();
    await nextTick();
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([["msk"]]);
    wrapper.unmount();
  });
});

describe("WlAutocomplete", () => {
  it("renders input with wl-input classes and data attributes", () => {
    const wrapper = mount(WlAutocomplete, {
      global,
      props: { suggestions: [], modelValue: "", placeholder: "Город" }
    });
    const root = wrapper.find('[data-wl="autocomplete"]');
    expect(root.exists()).toBe(true);
    expect(root.classes()).toContain("wl-autocomplete");
    expect(root.attributes("data-size")).toBe("md");
    const input = wrapper.find("input.wl-input");
    expect(input.exists()).toBe(true);
    expect(input.attributes("placeholder")).toBe("Город");
  });

  it("marks invalid state on the input", () => {
    const wrapper = mount(WlAutocomplete, {
      global,
      props: { suggestions: [], modelValue: "", invalid: true }
    });
    expect(wrapper.find("input.wl-input").classes()).toContain("is-invalid");
    expect(wrapper.find(".wl-autocomplete").classes()).toContain("is-invalid");
  });

  it("emits typed complete event on search", async () => {
    vi.useFakeTimers();
    try {
      const wrapper = mount(WlAutocomplete, {
        global,
        props: { suggestions: [], modelValue: "" }
      });
      await wrapper.find("input").setValue("мос");
      await vi.advanceTimersByTimeAsync(400);
      const events = wrapper.emitted("complete");
      expect(events).toBeTruthy();
      expect(events![0]![0]).toMatchObject({ query: "мос" });
    } finally {
      vi.useRealTimers();
    }
  });

  it("renders dropdown button when dropdown is on", () => {
    const wrapper = mount(WlAutocomplete, {
      global,
      props: { suggestions: [], modelValue: "", dropdown: true }
    });
    expect(wrapper.find(".wl-autocomplete__dropdown").exists()).toBe(true);
  });
});

describe("WlConfirmDialog + useWlConfirm", () => {
  it("confirmDanger opens a styled dialog and runs accept", async () => {
    const Harness = defineComponent({
      components: { WlConfirmDialog },
      setup() {
        const { confirmDanger } = useWlConfirm();
        const accepted = ref(false);
        function ask(): void {
          confirmDanger({
            header: "Удалить задачу?",
            message: "Действие необратимо.",
            acceptLabel: "Удалить",
            accept: () => {
              accepted.value = true;
            }
          });
        }
        return { ask, accepted };
      },
      template: `<button class="ask" @click="ask">Удалить…</button><WlConfirmDialog />`
    });
    const wrapper = mount(Harness, { global: confirmGlobal, attachTo: document.body });

    await wrapper.find(".ask").trigger("click");
    await nextTick();

    const dialog = document.body.querySelector<HTMLElement>('[data-wl="confirm-dialog"]');
    expect(dialog).toBeTruthy();
    expect(dialog!.textContent).toContain("Удалить задачу?");
    expect(dialog!.textContent).toContain("Действие необратимо.");

    const acceptBtn = dialog!.querySelector<HTMLElement>(".wl-btn--danger");
    const rejectBtn = dialog!.querySelector<HTMLElement>(".wl-btn--secondary");
    expect(acceptBtn).toBeTruthy();
    expect(acceptBtn!.textContent).toContain("Удалить");
    expect(rejectBtn).toBeTruthy();
    expect(rejectBtn!.textContent).toContain("Отмена");

    acceptBtn!.click();
    await nextTick();
    expect(wrapper.vm.accepted).toBe(true);
    wrapper.unmount();
  });

  it("confirm opens a dialog with primary accept button", async () => {
    const Harness = defineComponent({
      components: { WlConfirmDialog },
      setup() {
        const { confirm } = useWlConfirm();
        const rejected = ref(false);
        function ask(): void {
          confirm({
            message: "Опубликовать релиз?",
            reject: () => {
              rejected.value = true;
            }
          });
        }
        return { ask, rejected };
      },
      template: `<button class="ask" @click="ask">Опубликовать…</button><WlConfirmDialog />`
    });
    const wrapper = mount(Harness, { global: confirmGlobal, attachTo: document.body });

    await wrapper.find(".ask").trigger("click");
    await nextTick();

    const dialog = document.body.querySelector<HTMLElement>('[data-wl="confirm-dialog"]');
    expect(dialog).toBeTruthy();
    expect(dialog!.querySelector(".wl-btn--primary")).toBeTruthy();
    // Default labels come from the kit locale.
    expect(dialog!.textContent).toContain("Подтвердить");

    const rejectBtn = dialog!.querySelector<HTMLElement>(".wl-btn--secondary");
    rejectBtn!.click();
    await nextTick();
    expect(wrapper.vm.rejected).toBe(true);
    wrapper.unmount();
  });
});
