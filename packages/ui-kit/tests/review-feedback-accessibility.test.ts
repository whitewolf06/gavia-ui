import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { h } from "vue";
import { WlAlert, WlField, type WlFieldSlotProps, WlSelect, WlSteps } from "../src";

enableAutoUnmount(afterEach);

describe("review: feedback accessibility", () => {
  it.each([
    ["info", "status"], ["ok", "status"], ["warn", "alert"], ["err", "alert"]
  ] as const)("uses an appropriate live role for %s", (variant, role) => {
    const wrapper = mount(WlAlert, { props: { variant } });
    expect(wrapper.attributes("role")).toBe(role);
  });

  it.each([
    ["off", undefined], ["polite", "status"], ["assertive", "alert"]
  ] as const)("allows live=%s to override severity", (live, role) => {
    const wrapper = mount(WlAlert, { props: { variant: "err", live } });
    expect(wrapper.attributes("role")).toBe(role);
  });

  it("keeps help and error text associated and makes error announcements opt-in", async () => {
    const wrapper = mount(WlField, {
      props: { id: "review-title", label: "Title", hint: "At least three letters", error: "Enter a title" },
      slots: { default: (field: WlFieldSlotProps) => h("input", {
        id: field.inputId, "aria-describedby": field.ariaDescribedby, "aria-invalid": field.ariaInvalid
      }) }
    });
    expect(wrapper.get(".wl-field__hint").text()).toBe("At least three letters");
    expect(wrapper.get(".wl-field__err").attributes("role")).toBeUndefined();
    const references = (wrapper.get("input").attributes("aria-describedby") ?? "").split(" ");
    expect(references).toHaveLength(2);
    expect(references).toEqual([wrapper.get(".wl-field__hint").attributes("id"), wrapper.get(".wl-field__err").attributes("id")]);
    await wrapper.setProps({ announceError: true });
    expect(wrapper.get(".wl-field__err").attributes("role")).toBe("alert");
  });

  it("provides a label ID for non-native combobox controls", () => {
    const wrapper = mount(WlField, {
      props: { id: "review-city", label: "City" },
      slots: { default: (field: WlFieldSlotProps) => h(WlSelect<string, undefined>, {
        options: ["London"], "aria-labelledby": field.labelId
      }) }
    });
    const labelId = wrapper.get("label").attributes("id");
    expect(labelId).toBeTruthy();
    expect(wrapper.get('[role="combobox"]').attributes("aria-labelledby")).toBe(labelId);
  });

  it("renders steps with ordered list semantics and a textual completed state", () => {
    const wrapper = mount(WlSteps, { props: { items: [{ label: "Details" }, { label: "Review" }], current: 1 } });
    expect(wrapper.element.tagName).toBe("OL");
    expect(wrapper.findAll("li")).toHaveLength(2);
    expect(wrapper.get("li.is-done .wl-visually-hidden").text()).toBeTruthy();
    expect(wrapper.get("li.is-current").attributes("aria-current")).toBe("step");
  });
});
