/** Compile-only consumer contract. This file is included by the strict library typecheck. */
import { ref } from "vue";
import { WlDatePicker, type WlDatePickerModel, type WlDateRange } from "../src";
import Consumer from "./fixtures/date-picker-consumer.vue";

type SingleProps = Parameters<typeof WlDatePicker<"single">>[0];
type RangeProps = Parameters<typeof WlDatePicker<"range">>[0];

export function datePickerConsumerTypes(): void {
  const single = ref<string | null>(null);
  const range = ref<WlDateRange | null>(null);
  const singleProps: SingleProps = {
    modelValue: single.value,
    "onUpdate:modelValue": (value) => { single.value = value; }
  };
  const rangeProps: RangeProps = {
    selectionMode: "range",
    modelValue: range.value,
    "onUpdate:modelValue": (value) => { range.value = value; }
  };
  const singleValue: WlDatePickerModel = single.value;
  const rangeValue: WlDatePickerModel<"range"> = range.value;
  // @ts-expect-error Single consumers continue to reject tuple models.
  const wrongSingle: SingleProps = { modelValue: ["2026-10-15", null] };
  // @ts-expect-error Range mode requires a tuple, not a scalar date.
  const wrongRange: RangeProps = { selectionMode: "range", modelValue: "2026-10-15" };
  // @ts-expect-error An explicit single mode cannot masquerade as range.
  const wrongMode: RangeProps = { selectionMode: "single", modelValue: range.value };
  // @ts-expect-error Range update listeners must accept a tuple/null.
  const wrongListener: RangeProps = { selectionMode: "range", "onUpdate:modelValue": (value: string | null) => { single.value = value; } };
  void [singleProps, rangeProps, singleValue, rangeValue, wrongSingle, wrongRange, wrongMode, wrongListener, Consumer];
}
