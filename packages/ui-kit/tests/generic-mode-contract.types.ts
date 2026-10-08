/** Compile-only public API contracts; no component or Vue compiler is executed here. */
import { WlAutocomplete, WlDatePicker, WlMultiSelect, WlSelect, type WlDatePickerSelectionMode, type WlDateRange } from "../src";

interface Item { id: number; label: string; }
const items: readonly Item[] = [{ id: 1, label: "One" }];
const resolveId = (item: Item): number => item.id;
type DirectProps = Parameters<typeof WlSelect<Item>>[0];
type KeyProps = Parameters<typeof WlSelect<Item, "id">>[0];
type CallbackProps = Parameters<typeof WlSelect<Item, typeof resolveId>>[0];
type OptionalResolverProps = Parameters<typeof WlSelect<Item, "id" | undefined>>[0];
type MultiProps = Parameters<typeof WlMultiSelect<Item, "id">>[0];
type SingleAutoProps = Parameters<typeof WlAutocomplete<Item>>[0];
type MultipleAutoProps = Parameters<typeof WlAutocomplete<Item, true>>[0];
type DynamicAutoProps = Parameters<typeof WlAutocomplete<Item, boolean>>[0];
type SingleDateProps = Parameters<typeof WlDatePicker>[0];
type RangeDateProps = Parameters<typeof WlDatePicker<"range">>[0];
type DynamicDateProps = Parameters<typeof WlDatePicker<WlDatePickerSelectionMode>>[0];
type RangeContext = NonNullable<ReturnType<typeof WlDatePicker<"range">>["__ctx"]>;

export function genericModeConsumerTypes(multiple: boolean, selectionMode: WlDatePickerSelectionMode): void {
  // Call signatures are checked without explicit generic arguments, in addition to Vue fixtures.
  const inferredKey = WlSelect({ options: items, optionValue: "id", modelValue: 1 });
  const inferredCallback = WlSelect({ options: items, optionValue: (item) => item.id, modelValue: 1 });
  const inferredMultiple = WlAutocomplete({ suggestions: items, multiple: true, modelValue: [...items] });
  const inferredRange = WlDatePicker({ selectionMode: "range", modelValue: ["2026-10-15", null] });
  const keyModel: number | null | undefined = inferredKey.__ctx?.props.modelValue;
  const callbackModel: number | null | undefined = inferredCallback.__ctx?.props.modelValue;
  const autoModel: Item[] | null | undefined = inferredMultiple.__ctx?.props.modelValue;
  const rangeModel: WlDateRange | null | undefined = inferredRange.__ctx?.props.modelValue;
  // @ts-expect-error Model inference must not widen a key resolver's numeric result.
  WlSelect({ options: items, optionValue: "id", modelValue: "One" });
  // @ts-expect-error Model inference must not widen a callback resolver's numeric result.
  WlSelect({ options: items, optionValue: (item) => item.id, modelValue: "One" });
  const direct: DirectProps = { options: items, modelValue: items[0] };
  const keyed: KeyProps = { options: items, optionValue: "id", modelValue: 1 };
  const callback: CallbackProps = { options: items, optionValue: resolveId, modelValue: 1 };
  const optionalResolver: OptionalResolverProps = { options: items, optionValue: undefined, modelValue: items[0] };
  const multi: MultiProps = { options: items, optionValue: "id", modelValue: [1] };
  const singleAuto: SingleAutoProps = { suggestions: items, modelValue: "free text" };
  const multipleAuto: MultipleAutoProps = { suggestions: items, multiple: true, modelValue: [...items] };
  const dynamicAuto: DynamicAutoProps = { suggestions: items, multiple, modelValue: [...items] };
  const singleDate: SingleDateProps = { modelValue: "2026-10-15" };
  const rangeDate: RangeDateProps = { selectionMode: "range", modelValue: ["2026-10-15", null] };
  const dynamicDate: DynamicDateProps = { selectionMode, modelValue: ["2026-10-15", null] };
  const rangeEvent: Parameters<RangeContext["emit"]> = ["update:modelValue", ["2026-10-15", null]];
  // @ts-expect-error A numeric field generic requires the matching runtime resolver prop.
  const missingKey: KeyProps = { options: items, modelValue: 1 };
  // @ts-expect-error Callback generics require the callback to be supplied as a prop too.
  const missingCallback: CallbackProps = { options: items, modelValue: 1 };
  // @ts-expect-error A union resolver is still explicit at runtime, even if its value can be undefined.
  const missingOptionalResolver: OptionalResolverProps = { options: items, modelValue: items[0] };
  // @ts-expect-error MultiSelect cannot claim id models while silently returning complete options.
  const missingMultiKey: MultiProps = { options: items, modelValue: [1] };
  // @ts-expect-error The true generic requires multiple=true, otherwise the runtime is single.
  const missingMultiple: MultipleAutoProps = { suggestions: items, modelValue: [...items] };
  // @ts-expect-error A dynamic boolean generic must have a runtime mode prop too.
  const missingDynamicMultiple: DynamicAutoProps = { suggestions: items, modelValue: [...items] };
  // @ts-expect-error Range tuples require selectionMode=range, including explicit generic consumers.
  const missingRange: RangeDateProps = { modelValue: ["2026-10-15", null] };
  // @ts-expect-error Dynamic mode contracts cannot silently fall back to the single runtime mode.
  const missingDynamicMode: DynamicDateProps = { modelValue: ["2026-10-15", null] };
  // @ts-expect-error never cannot omit a resolver and claim the default runtime returns no values.
  const neverSelect: Parameters<typeof WlSelect<Item, never>>[0] = { options: items };
  // @ts-expect-error A never resolver must not silently default to complete options in MultiSelect.
  const neverMulti: Parameters<typeof WlMultiSelect<Item, never>>[0] = { options: items };
  // @ts-expect-error never cannot omit the multiple prop and narrow the runtime model to null.
  const neverAuto: Parameters<typeof WlAutocomplete<Item, never>>[0] = { suggestions: items };
  // @ts-expect-error never cannot omit the date selection mode and claim a model with no dates.
  const neverDate: Parameters<typeof WlDatePicker<never>>[0] = {};
  // @ts-expect-error The original Vue emit context is preserved with its range payload.
  const wrongRangeEvent: Parameters<RangeContext["emit"]> = ["update:modelValue", "2026-10-15"];
  void [keyModel, callbackModel, autoModel, rangeModel, direct, keyed, callback, optionalResolver, multi, singleAuto, multipleAuto, dynamicAuto, singleDate,
    rangeDate, dynamicDate, rangeEvent, missingKey, missingCallback, missingOptionalResolver, missingMultiKey,
    missingMultiple, missingDynamicMultiple, missingRange, missingDynamicMode, neverSelect, neverMulti, neverAuto, neverDate, wrongRangeEvent];
}
