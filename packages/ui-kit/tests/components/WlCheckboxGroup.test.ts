import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import WlCheckboxGroup from "../../src/components/WlCheckboxGroup.vue";
const options = [{ id: 1, label: "Read" }, { id: 2, label: "Write", disabled: true }, { id: 3, label: "Share" }];
describe("WlCheckboxGroup", () => {
  it("labels the fieldset and emits one immutable array change", async () => {
    const value = [1];
    const wrapper = mount(WlCheckboxGroup, { props: { options, optionValue: "id", optionDisabled: "disabled", legend: "Permissions", modelValue: value, name: "permissions" } });
    expect(wrapper.element.tagName).toBe("FIELDSET");
    expect(wrapper.get("legend").text()).toBe("Permissions");
    const inputs = wrapper.findAll("input");
    expect((inputs[0]!.element as HTMLInputElement).checked).toBe(true);
    expect(inputs[1]!.attributes("disabled")).toBeDefined();
    await inputs[2]!.setValue(true);
    expect(wrapper.emitted("update:modelValue")).toEqual([[[1, 3]]]);
    expect(value).toEqual([1]);
    expect(inputs[2]!.attributes("name")).toBe("permissions");
    expect((inputs[0]!.element as HTMLInputElement).value).toBe("1");
    wrapper.unmount();
  });
  it("guards disabled changes and provides original options to slots", async () => {
    const wrapper = mount(WlCheckboxGroup, {
      props: { options, disabled: true, invalid: true },
      slots: {
        option: ({ option, index }) => {
          const label = (option as typeof options[number]).label;
          return `${index}: ${label}`;
        }
      }
    });
    expect(wrapper.attributes("disabled")).toBeDefined();
    expect(wrapper.attributes("aria-invalid")).toBe("true");
    expect(wrapper.text()).toContain("0: Read");
    await wrapper.get("input").setValue(true);
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    wrapper.unmount();
  });
});
