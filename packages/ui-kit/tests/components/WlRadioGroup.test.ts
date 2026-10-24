import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { h, nextTick } from "vue";
import WlRadioGroup from "../../src/components/WlRadioGroup.vue";
const options = [{ id: "a", label: "Basic" }, { id: "b", label: "Unavailable", disabled: true }, { id: "c", label: "Team" }];
describe("WlRadioGroup", () => {
  it("has one tab stop and skips disabled options with vertical arrows/Home/End", async () => {
    const wrapper = mount(WlRadioGroup, { attachTo: document.body, props: { options, optionValue: "id", optionDisabled: "disabled", modelValue: "a", legend: "Plan", orientation: "vertical" } });
    try {
      const inputs = wrapper.findAll("input");
      expect(wrapper.attributes("role")).toBe("radiogroup");
      expect(wrapper.attributes("aria-orientation")).toBe("vertical");
      expect(inputs.map((input) => input.attributes("tabindex"))).toEqual(["0", "-1", "-1"]);
      await inputs[0]!.trigger("keydown", { key: "ArrowDown" });
      await nextTick();
      expect(document.activeElement).toBe(inputs[2]!.element);
      expect(wrapper.emitted("update:modelValue")).toEqual([["c"]]);
      await inputs[2]!.trigger("keydown", { key: "Home" });
      expect(document.activeElement).toBe(inputs[0]!.element);
      await inputs[0]!.trigger("keydown", { key: "End" });
      expect(document.activeElement).toBe(inputs[2]!.element);
    } finally { wrapper.unmount(); }
  });
  it("isolates generated names and ignores disabled changes", async () => {
    const update = vi.fn();
    const wrapper = mount({ render: () => h("div", [h(WlRadioGroup, { options }), h(WlRadioGroup, { options, disabled: true, "onUpdate:modelValue": update })]) });
    const groups = wrapper.findAllComponents(WlRadioGroup);
    expect(groups[0]!.get("input").attributes("name")).not.toBe(groups[1]!.get("input").attributes("name"));
    await groups[1]!.get("input").setValue(true);
    expect(update).not.toHaveBeenCalled();
    wrapper.unmount();
  });
});
