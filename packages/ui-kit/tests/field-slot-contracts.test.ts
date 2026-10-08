import { afterEach, describe, expect, it } from "vitest";
import { enableAutoUnmount, mount } from "@vue/test-utils";
import { h } from "vue";
import { WlField, type WlFieldSlotProps } from "../src";

enableAutoUnmount(afterEach);

describe("WlField slot payload compatibility", () => {
  it("keeps both ARIA keys present with undefined values, then reflects hint/error changes", async () => {
    const scopes: WlFieldSlotProps[] = [];
    const wrapper = mount(WlField, {
      props: { id: "title" },
      slots: { default: (scope: WlFieldSlotProps) => {
        scopes.push(scope);
        return h("input", { id: scope.inputId, "aria-describedby": scope.ariaDescribedby, "aria-invalid": scope.ariaInvalid });
      } }
    });
    const plain = scopes.at(-1)!;
    expect(Object.prototype.hasOwnProperty.call(plain, "ariaDescribedby")).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(plain, "ariaInvalid")).toBe(true);
    expect(plain).toMatchObject({ ariaDescribedby: undefined, ariaInvalid: undefined, invalid: false, required: false });

    await wrapper.setProps({ hint: "Use a clear title", required: true });
    expect(scopes.at(-1)).toMatchObject({ ariaDescribedby: "title-desc", ariaInvalid: undefined, invalid: false, required: true });

    await wrapper.setProps({ error: "Title is required" });
    expect(scopes.at(-1)).toMatchObject({ ariaDescribedby: "title-desc", ariaInvalid: true, invalid: true, required: true });
    expect(wrapper.get("input").attributes()).toMatchObject({ "aria-describedby": "title-desc", "aria-invalid": "true" });
  });
});