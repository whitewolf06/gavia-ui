import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { h } from "vue";
import { WlField } from "../../src";

describe("WlField", () => {
  it("wires label, control id and describedby through slot props", () => {
    const wrapper = mount(WlField, {
      props: { label: "Имя", required: true, hint: "Как в паспорте" },
      slots: {
        default: (p: {
          id: string;
          inputId: string;
          ariaDescribedby?: string;
          invalid: boolean;
          required: boolean;
        }) =>
          h("input", {
            id: p.inputId,
            class: "ctl",
            required: p.required,
            "aria-describedby": p.ariaDescribedby
          })
      }
    });

    const label = wrapper.find(".wl-field__label");
    const input = wrapper.find(".ctl");
    expect(label.attributes("for")).toBe(input.attributes("id"));
    expect(wrapper.find(".wl-field__req").text()).toBe("*");
    expect(input.attributes("required")).toBeDefined();

    const hint = wrapper.find(".wl-field__hint");
    expect(hint.text()).toBe("Как в паспорте");
    expect(input.attributes("aria-describedby")).toBe(hint.attributes("id"));
    expect(wrapper.find(".wl-field__err").exists()).toBe(false);
  });

  it("keeps hint and error together and describes both while flagging invalid", () => {
    const wrapper = mount(WlField, {
      props: { label: "Имя", hint: "Как в паспорте", error: "Слишком короткое имя" },
      slots: {
        default: (p: { id: string; ariaDescribedby?: string; invalid: boolean }) =>
          h("input", {
            id: p.id,
            class: "ctl",
            "data-invalid": String(p.invalid),
            "aria-describedby": p.ariaDescribedby
          })
      }
    });

    const err = wrapper.find(".wl-field__err");
    expect(err.exists()).toBe(true);
    expect(err.text()).toContain("Слишком короткое имя");
    expect(err.find(".wl-icon").exists()).toBe(true);
    const hint = wrapper.get(".wl-field__hint");
    expect(hint.text()).toBe("Как в паспорте");
    expect(wrapper.find(".ctl").attributes("data-invalid")).toBe("true");
    expect(wrapper.find(".ctl").attributes("aria-describedby")).toBe(`${hint.attributes("id")} ${err.attributes("id")}`);
    expect(wrapper.find('[data-wl="field"]').classes()).toContain("is-invalid");
  });

  it("omits describedby when neither hint nor error is present", () => {
    const wrapper = mount(WlField, {
      props: { label: "Имя" },
      slots: {
        default: (p: { id: string; ariaDescribedby?: string }) =>
          h("input", { id: p.id, class: "ctl", "aria-describedby": p.ariaDescribedby })
      }
    });
    expect(wrapper.find(".ctl").attributes("aria-describedby")).toBeUndefined();
  });
});
