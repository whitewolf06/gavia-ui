import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { WlInput, WlTextarea } from "../src";

describe("native control attributes", () => {
  it("routes validation and keyboard listeners to the input, and data/class to the wrapper", async () => {
    const keys: string[] = [];
    const wrapper = mount(WlInput, { attrs: { name: "title", maxlength: 80, required: true, "data-testid": "title", class: "project-field", onKeydown: (event: KeyboardEvent) => keys.push(event.key) } });
    const control = wrapper.get("input");
    expect(control.attributes("name")).toBe("title");
    expect(control.attributes("maxlength")).toBe("80");
    expect(control.attributes("required")).toBeDefined();
    expect(wrapper.classes()).toContain("project-field");
    expect(wrapper.attributes("data-testid")).toBe("title");
    await control.trigger("keydown", { key: "Enter" });
    expect(keys).toEqual(["Enter"]);
    wrapper.unmount();
  });
  it("routes textarea dimensions to the textarea rather than its wrapper", () => {
    const wrapper = mount(WlTextarea, { attrs: { rows: 6, cols: 40, wrap: "soft" } });
    expect(wrapper.get("textarea").attributes()).toMatchObject({ rows: "6", cols: "40", wrap: "soft" });
    wrapper.unmount();
  });
});
