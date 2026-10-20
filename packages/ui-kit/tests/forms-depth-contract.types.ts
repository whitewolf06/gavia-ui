import type { WlInput, WlNumberInput, WlPasswordInput, WlSlider, WlSwitch, WlTextarea } from "../src";

type SliderProps = InstanceType<typeof WlSlider>["$props"];
export function formsDepthTypes(): void {
  const scalar: SliderProps = { modelValue: 20, ariaValueText: (value) => `${value}%` };
  const range: SliderProps = { range: true, modelValue: [20, 80], "onUpdate:modelValue": (value) => {
    value[0].toFixed();
  } };
  const input: InstanceType<typeof WlInput>["$props"] = { clearable: true, loading: true, showCount: true, maxlength: 20 };
  const textarea: InstanceType<typeof WlTextarea>["$props"] = { size: "sm", maxRows: 4, showCount: true, density: "compact" };
  const password: InstanceType<typeof WlPasswordInput>["$props"] = { strength: 80, pt: { input: { autocomplete: "new-password" } } };
  const number: InstanceType<typeof WlNumberInput>["$props"] = { locale: "en-US", currency: "USD", precision: 2, prefix: "$" };
  const toggle: InstanceType<typeof WlSwitch>["$props"] = { loading: true, labelPosition: "start", density: "compact" };
  // @ts-expect-error Range values require the range mode.
  const implicitRange: SliderProps = { modelValue: [20, 80] };
  // @ts-expect-error Explicit range mode requires two values.
  const scalarRange: SliderProps = { range: true, modelValue: 20 };
  // @ts-expect-error Range updates retain the tuple model.
  const invalidRangeListener: SliderProps = { range: true, "onUpdate:modelValue": (value: number) => {
    void value;
  } };
  void [scalar, range, input, textarea, password, number, toggle, implicitRange, scalarRange, invalidRangeListener];
}
