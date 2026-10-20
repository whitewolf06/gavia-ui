import { WlCheckboxGroup, WlRadioGroup } from "../src";
const options = [{ id: 1, label: "Read", unavailable: false }];
export function inferredGroups(): unknown[] {
  const checkbox = <WlCheckboxGroup options={options} optionValue="id" modelValue={[1]} optionDisabled="unavailable" />;
  const radio = <WlRadioGroup options={options} optionValue="id" modelValue={1} />;
  const callback = <WlCheckboxGroup options={options} optionValue={(option) => option.id} modelValue={[1]} />;
  // @ts-expect-error The inferred checkbox model contains ids, not labels.
  const wrongCheckbox = <WlCheckboxGroup options={options} optionValue="id" modelValue={["Read"]} />;
  // @ts-expect-error The inferred radio model contains one id.
  const wrongRadio = <WlRadioGroup options={options} optionValue="id" modelValue={[1]} />;
  // @ts-expect-error Callback-resolved ids also reject strings.
  const wrongCallback = <WlCheckboxGroup options={options} optionValue={(option) => option.id} modelValue={["Read"]} />;
  return [checkbox, radio, callback, wrongCheckbox, wrongRadio, wrongCallback];
}
