import { WlCheckbox, WlChip, WlNavItem, WlTag } from "../src";
type BinaryProps = InstanceType<typeof WlCheckbox>["$props"];
type NumberArrayProps = InstanceType<typeof WlCheckbox<number>>["$props"];
export function checkboxModes(): unknown[] {
  const binary: BinaryProps = { modelValue: true, size: "sm", "onUpdate:modelValue": (value) => value.valueOf() };
  const array: NumberArrayProps = { value: 1, modelValue: [1, 2], "onUpdate:modelValue": (value) => value[0]?.toFixed() };
  const inferred = <WlCheckbox value={1} modelValue={[1, 2]} />;
  // @ts-expect-error Binary remains the default public constructor/model view.
  const wrongBinary: BinaryProps = { modelValue: [1] };
  // @ts-expect-error Array values follow the checkbox value type.
  const wrongArray = <WlCheckbox value={1} modelValue={["one"]} />;
  // @ts-expect-error A scalar model cannot be combined with an array-mode value.
  const wrongMode = <WlCheckbox value={1} modelValue={true} />;
  const chip = <WlChip active removable size="sm" onUpdate:active={(value) => value.valueOf()} />;
  const nav = <WlNavItem to={{ name: "inbox" }} size="sm" />;
  const legacyNativeColor = <WlTag color="#336699" />;
  const paletteColor = <WlTag color="blue" tone="success" />;
  // @ts-expect-error Native color remains text, not an arbitrary value.
  const invalidColor = <WlTag color={12} />;
  void [binary, array, wrongBinary];
  return [inferred, wrongArray, wrongMode, chip, nav, legacyNativeColor, paletteColor, invalidColor];
}
