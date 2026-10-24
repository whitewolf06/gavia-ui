import { mount } from "@vue/test-utils";
import { afterAll, describe, expect, it } from "vitest";
import { WlChip } from "../../src";

afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));
});
describe("basic component behavior", () => {
  it("toggles an enabled chip and ignores a disabled chip", async () => {
    const wrapper = mount(WlChip, {
      props: { active: false, count: 3 },
      slots: { default: "Tasks" }
    });
    await wrapper.trigger("click");
    expect(wrapper.emitted("update:active")?.[0]).toEqual([true]);
    expect(wrapper.text()).toContain("3");

    const disabled = mount(WlChip, { props: { disabled: true } });
    await disabled.trigger("click");
    expect(disabled.emitted("update:active")).toBeUndefined();
  });
});
