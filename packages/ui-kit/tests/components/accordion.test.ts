import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import type { WlAccordionItem } from "../../src";
import { WlAccordion } from "../../src";

describe("WlAccordion", () => {
  const items: WlAccordionItem[] = [
    { key: "a", title: "Первый", content: "Текст А" },
    { key: "b", title: "Второй", content: "Текст Б" },
    { key: "c", title: "Третий", content: "Текст В", disabled: true }
  ];

  const summaries = (wrapper: ReturnType<typeof mount>) => wrapper.findAll(".wl-acc__summary");
  const details = (wrapper: ReturnType<typeof mount>) =>
    wrapper.findAll("details").map((d) => (d.element as HTMLDetailsElement).open);

  it("opens and closes items uncontrolled, multiple by default", async () => {
    const wrapper = mount(WlAccordion, { props: { items } });
    expect(details(wrapper)).toEqual([false, false, false]);

    await summaries(wrapper)[0]!.trigger("click");
    expect(details(wrapper)).toEqual([true, false, false]);
    expect(wrapper.emitted("update:openKeys")?.[0]).toEqual([["a"]]);

    await summaries(wrapper)[1]!.trigger("click");
    expect(details(wrapper)).toEqual([true, true, false]);
    expect(wrapper.emitted("update:openKeys")?.[1]).toEqual([["a", "b"]]);

    await summaries(wrapper)[0]!.trigger("click");
    expect(details(wrapper)).toEqual([false, true, false]);
  });

  it("single mode keeps only the latest item open", async () => {
    const wrapper = mount(WlAccordion, { props: { items, single: true } });
    await summaries(wrapper)[0]!.trigger("click");
    await summaries(wrapper)[1]!.trigger("click");
    expect(details(wrapper)).toEqual([false, true, false]);
    expect(wrapper.emitted("update:openKeys")?.[1]).toEqual([["b"]]);
  });

  it("does not toggle disabled items", async () => {
    const wrapper = mount(WlAccordion, { props: { items } });
    await summaries(wrapper)[2]!.trigger("click");
    expect(details(wrapper)).toEqual([false, false, false]);
    expect(wrapper.emitted("update:openKeys")).toBeUndefined();
  });

  it("respects controlled openKeys and only emits changes", async () => {
    const wrapper = mount(WlAccordion, { props: { items, openKeys: ["a"] } });
    expect(details(wrapper)).toEqual([true, false, false]);

    await summaries(wrapper)[1]!.trigger("click");
    expect(wrapper.emitted("update:openKeys")?.[0]).toEqual([["a", "b"]]);
    // Parent did not update the prop: DOM stays controlled.
    expect(details(wrapper)).toEqual([true, false, false]);
  });

  it("renders the scoped item slot with item and open", async () => {
    const wrapper = mount(WlAccordion, {
      props: { items },
      slots: {
        item: "<template #item=\"{ item, open }\"><p class=\"custom\">{{ item.title }}:{{ open ? 'open' : 'closed' }}</p></template>"
      }
    });
    const customs = wrapper.findAll(".custom");
    expect(customs).toHaveLength(3);
    expect(customs[0]!.text()).toBe("Первый:closed");
    await summaries(wrapper)[0]!.trigger("click");
    expect(wrapper.findAll(".custom")[0]!.text()).toBe("Первый:open");
  });
});
