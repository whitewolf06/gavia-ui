import type { WlMultiSelect, WlSelect } from "../src";
interface Item { id: number; label: string }
interface Group { title: string; items: readonly Item[] }
type Select = Parameters<typeof WlSelect<Group, "id", "items">>[0];
type Multi = Parameters<typeof WlMultiSelect<Group, "id", "items">>[0];
type Context = NonNullable<ReturnType<typeof WlSelect<Group, "id", "items">>["__ctx"]>;
export function groupedContracts(group: Group, context: Context): void {
  const select: Select = { options: [group], optionGroupChildren: "items", optionValue: "id", modelValue: 1, filter: true, loading: true };
  const multi: Multi = { options: [group], optionGroupChildren: "items", optionValue: "id", modelValue: [1], showSelectAll: true };
  context.slots.option?.({ option: { id: 1, label: "One" }, index: 0, active: true, selected: true });
  context.slots.optiongroup?.({ group, label: "Group" });
  // @ts-expect-error A grouped model contains leaf values.
  const bad: Select = { optionGroupChildren: "items", optionValue: "id", modelValue: group };
  void [select, multi, bad];
}
