import type { WlCheckboxGroup, WlRadioGroup } from "../src";
interface Option { id: number; label: string; unavailable: boolean }
type CheckboxProps = Parameters<typeof WlCheckboxGroup<Option, "id">>[0];
type RadioProps = Parameters<typeof WlRadioGroup<Option, "id">>[0];
type Context = NonNullable<ReturnType<typeof WlCheckboxGroup<Option, "id">>["__ctx"]>;
export function choiceGroupTypes(option: Option, context: Context): void {
  const checkbox: CheckboxProps = { options: [option], optionValue: "id", optionDisabled: "unavailable", modelValue: [1] };
  const radio: RadioProps = { options: [option], optionValue: "id", modelValue: 1 };
  context.slots.option?.({ option, index: 0, checked: true, disabled: false });
  // @ts-expect-error Checkbox models follow the resolved value type.
  const wrongArray: CheckboxProps = { options: [option], optionValue: "id", modelValue: ["1"] };
  // @ts-expect-error Radio selection cannot be an array.
  const wrongRadio: RadioProps = { optionValue: "id", modelValue: [1] };
  // @ts-expect-error Explicit value resolver generics require their runtime resolver.
  const absentResolver: CheckboxProps = { options: [option], modelValue: [1] };
  // @ts-expect-error Slot options remain complete source objects.
  context.slots.option?.({ option: 1, index: 0, checked: true, disabled: false });
  void [checkbox, radio, wrongArray, wrongRadio, absentResolver];
}
