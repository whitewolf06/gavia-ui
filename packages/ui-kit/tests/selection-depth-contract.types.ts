import type { WlAutocomplete, WlMultiSelect, WlSelect } from "../src";

interface Option { id: number; label: string; disabled: boolean }
type SelectContext = NonNullable<ReturnType<typeof WlSelect<Option, "id">>["__ctx"]>;
type MultiContext = NonNullable<ReturnType<typeof WlMultiSelect<Option, "id">>["__ctx"]>;
type AutoContext = NonNullable<ReturnType<typeof WlAutocomplete<Option, true>>["__ctx"]>;
type SelectProps = Parameters<typeof WlSelect<Option, "id">>[0];
type MultiProps = Parameters<typeof WlMultiSelect<Option, "id">>[0];
type AutoProps = Parameters<typeof WlAutocomplete<Option, true>>[0];

export function selectionDepthTypes(select: SelectContext, multi: MultiContext, auto: AutoContext, option: Option): void {
  const state = { option, index: 0, selected: true, active: false };
  select.slots.option?.(state);
  multi.slots.option?.(state);
  auto.slots.option?.(state);
  select.slots.value?.({ option, placeholder: "Choose" });
  select.slots.value?.({ option: undefined, placeholder: undefined });
  multi.slots.value?.({ options: [option], placeholder: "Choose" });
  multi.slots.chip?.({ option, remove: () => {} });
  auto.slots.chip?.({ option, remove: () => {} });
  const selectProps: SelectProps = { options: [option], optionValue: "id", optionKey: "id", optionDisabled: "disabled", clearable: true };
  const multiProps: MultiProps = { options: [option], optionValue: "id", optionKey: (item) => item.id, optionDisabled: (item) => item.disabled };
  const autoProps: AutoProps = { suggestions: [option], multiple: true, optionKey: "id", optionDisabled: "disabled" };
  // @ts-expect-error Slot options retain the object type rather than the resolved model id.
  select.slots.option?.({ ...state, option: 1 });
  // @ts-expect-error Custom chip slots receive the complete selected option.
  auto.slots.chip?.({ option: "free text", remove: () => {} });
  // @ts-expect-error Disabled resolvers cannot name a missing field.
  const invalidDisabled: SelectProps = { optionDisabled: "missing", optionValue: "id" };
  // @ts-expect-error Key callbacks must return a valid key.
  const invalidKey: AutoProps = { multiple: true, optionKey: (item) => ({ id: item.id }) };
  void [selectProps, multiProps, autoProps, invalidDisabled, invalidKey];
}
