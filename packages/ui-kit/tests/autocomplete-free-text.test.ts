import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, ref } from "vue";
import { mount } from "@vue/test-utils";
import { WlAutocomplete } from "../src";

describe("Autocomplete free text with object-field labels", () => {
  afterEach(() => vi.useRealTimers());

  it("keeps free text and suggestion labels, and clears externally reset models without completing again", async () => {
    vi.useFakeTimers();
    const Harness = defineComponent({
      components: { WlAutocomplete },
      setup() {
        const suggestions = [{ id: 1, label: "Anna" }];
        const value = ref<(typeof suggestions)[number] | string | null | undefined>(null);
        return { suggestions, value };
      },
      template: '<WlAutocomplete ref="autocomplete" v-model="value" :suggestions="suggestions" option-label="label" :motion="false" />'
    });
    const wrapper = mount(Harness, { attachTo: document.body });
    try {
      const autocomplete = wrapper.getComponent({ ref: "autocomplete" });
      const input = wrapper.get("input");
      await input.setValue("Ann");
      expect(wrapper.vm.value).toBe("Ann");
      expect((input.element as HTMLInputElement).value).toBe("Ann");
      await vi.advanceTimersByTimeAsync(300);
      expect(autocomplete.emitted("complete")?.[0]?.[0]).toMatchObject({ query: "Ann" });
      const option = document.body.querySelector<HTMLElement>(".wl-autocomplete-overlay [role=option]");
      expect(option).not.toBeNull();
      option!.click();
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.value).toEqual({ id: 1, label: "Anna" });
      expect((input.element as HTMLInputElement).value).toBe("Anna");
      wrapper.vm.value = null;
      await wrapper.vm.$nextTick();
      expect((input.element as HTMLInputElement).value).toBe("");
      wrapper.vm.value = { id: 1, label: "Anna" };
      await wrapper.vm.$nextTick();
      expect((input.element as HTMLInputElement).value).toBe("Anna");
      wrapper.vm.value = undefined;
      await wrapper.vm.$nextTick();
      expect((input.element as HTMLInputElement).value).toBe("");
      expect(autocomplete.emitted("complete")).toHaveLength(1);
      await input.setValue("new text");
      expect(wrapper.vm.value).toBe("new text");
      expect((input.element as HTMLInputElement).value).toBe("new text");
    } finally {
      wrapper.unmount();
    }
  });

  it("continues to call consumer label functions for a free-text model", () => {
    const label = vi.fn((item: string | { label: string }) => typeof item === "string" ? `(${item})` : item.label);
    const wrapper = mount(WlAutocomplete<{ label: string }, false>, { props: { suggestions: [{ label: "Anna" }], modelValue: "Ann", optionLabel: label } });
    try {
      expect(label).toHaveBeenCalledWith("Ann");
      expect((wrapper.get("input").element as HTMLInputElement).value).toBe("(Ann)");
    } finally {
      wrapper.unmount();
    }
  });
});
