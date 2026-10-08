/** Compile-only assertions for public modifier, palette and imperative contracts. */
import { WlAutocomplete, WlCheckbox, WlColorPicker, WlDatePicker, WlFilePicker, WlFileUpload, WlInput, WlMultiSelect, WlNumberInput, WlPasswordInput, WlRadio, WlSegmented, WlSelect, WlSlider, WlSwitch, WlTextarea, WlTimePicker } from "../src";
import type { WlFilePickerExpose } from "../src";
import Consumer from "./fixtures/input-model-modifiers-consumer.vue";

type InputProps = InstanceType<typeof WlInput>["$props"];
type PasswordProps = InstanceType<typeof WlPasswordInput>["$props"];
type TextareaProps = InstanceType<typeof WlTextarea>["$props"];
type NumberProps = InstanceType<typeof WlNumberInput>["$props"];
type SliderProps = InstanceType<typeof WlSlider>["$props"];
type TimeProps = InstanceType<typeof WlTimePicker>["$props"];
type CheckboxProps = InstanceType<typeof WlCheckbox>["$props"];
type SwitchProps = InstanceType<typeof WlSwitch>["$props"];
type UploadProps = InstanceType<typeof WlFileUpload>["$props"];
type RadioProps = Parameters<typeof WlRadio<string>>[0];
type SegmentedProps = Parameters<typeof WlSegmented<"one">>[0];
type SelectProps = Parameters<typeof WlSelect<string>>[0];
type MultiProps = Parameters<typeof WlMultiSelect<number>>[0];
type AutoProps = Parameters<typeof WlAutocomplete<string>>[0];
type DateProps = Parameters<typeof WlDatePicker<"single">>[0];

export function inputModelModifierConsumerTypes(picker: WlFilePickerExpose): void {
  const input: InputProps = { modelValue: "text", modelModifiers: { trim: true } };
  const password: PasswordProps = { modelValue: "text", modelModifiers: { trim: true } };
  const textarea: TextareaProps = { modelValue: "text", modelModifiers: { trim: true } };
  const palette: InstanceType<typeof WlColorPicker>["$props"] = { swatches: ["#112233", "#abcdef"] as const };
  picker.choose(); picker.clear();
  const exposed: WlFilePickerExpose = {} as InstanceType<typeof WlFilePicker>;
  // @ts-expect-error Text fields cannot turn their string payload into a number.
  const badInput: InputProps = { modelModifiers: { number: true } };
  // @ts-expect-error Password fields support trim only.
  const badPassword: PasswordProps = { modelModifiers: { lazy: true } };
  // @ts-expect-error Textarea supports trim only.
  const badTextarea: TextareaProps = { modelModifiers: { number: true } };
  // @ts-expect-error A numeric domain model does not support text transforms.
  const badNumber: NumberProps = { modelModifiers: { trim: true } };
  // @ts-expect-error Slider publishes a numeric domain model without modifiers.
  const badSlider: SliderProps = { modelModifiers: { lazy: true } };
  // @ts-expect-error A local time cannot be converted by parseFloat.
  const badTime: TimeProps = { modelModifiers: { number: true } };
  // @ts-expect-error Boolean controls do not support built-in modifiers.
  const badCheckbox: CheckboxProps = { modelModifiers: { number: true } };
  // @ts-expect-error Switch has an unmodified boolean model.
  const badSwitch: SwitchProps = { modelModifiers: { trim: true } };
  // @ts-expect-error Radio preserves the exact consumer domain value.
  const badRadio: RadioProps = { value: "one", modelModifiers: { number: true } };
  // @ts-expect-error Segmented preserves option keys instead of trimming them.
  const badSegmented: SegmentedProps = { modelModifiers: { trim: true } };
  // @ts-expect-error Select preserves the resolved option value.
  const badSelect: SelectProps = { modelModifiers: { number: true } };
  // @ts-expect-error MultiSelect's array must not become a parseFloat scalar.
  const badMulti: MultiProps = { modelModifiers: { number: true } };
  // @ts-expect-error Autocomplete's suggestion/free-text domain does not support modifiers.
  const badAuto: AutoProps = { modelModifiers: { lazy: true } };
  // @ts-expect-error A date model must retain its ISO string/tuple contract.
  const badDate: DateProps = { modelModifiers: { number: true } };
  // @ts-expect-error File collections do not support text transforms.
  const badUpload: UploadProps = { modelModifiers: { trim: true } };
  // @ts-expect-error FilePicker does not expose network upload methods.
  picker.upload();
  void [input, password, textarea, palette, exposed, badInput, badPassword, badTextarea, badNumber, badSlider, badTime, badCheckbox, badSwitch, badRadio, badSegmented, badSelect, badMulti, badAuto, badDate, badUpload, Consumer];
}
