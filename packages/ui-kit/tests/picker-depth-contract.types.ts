import type { WlCalendar, WlColorPicker, WlDatePicker, WlTimePicker } from "../src";
type Calendar = Parameters<typeof WlCalendar<true>>[0];
type SingleCalendar = InstanceType<typeof WlCalendar>["$props"];
type Range = Parameters<typeof WlDatePicker<"range">>[0];
type Color = InstanceType<typeof WlColorPicker>["$props"];
type Time = InstanceType<typeof WlTimePicker>["$props"];
export function pickerDepthTypes(): void {
  const calendar: Calendar = { multiple: true, modelValue: ["2026-10-17"], month: "2026-10" };
  const single: SingleCalendar = { modelValue: "2026-10-17" };
  const range: Range = { selectionMode: "range", rangePresets: [{ label: "Week", value: ["2026-10-17", "2026-10-24"] }], disabledDates: (iso) => iso.endsWith("17"), displayFormat: "locale", formatOptions: { month: "long" } };
  const color: Color = { alpha: true, custom: true, modelValue: "#ff000080" };
  const time: Time = { hourFormat: 12, step: "900", allowedIntervals: [{ start: "22:00", end: "02:00" }] };
  // @ts-expect-error Multiple Calendar emits an array rather than its single default model.
  const badCalendar: Calendar = { multiple: true, modelValue: "2026-10-17" };
  // @ts-expect-error The default constructor keeps the released single string model.
  const badSingle: SingleCalendar = { modelValue: ["2026-10-17"] };
  // @ts-expect-error An explicit multiple generic requires its matching runtime mode.
  const missingMode: Calendar = { modelValue: [] };
  // @ts-expect-error A date-only formatter cannot introduce time or timezone fields.
  const dateTime: Range = { selectionMode: "range", formatOptions: { hour: "numeric" } };
  // @ts-expect-error Presets are completed ranges.
  const incomplete: Range = { selectionMode: "range", rangePresets: [{ label: "No end", value: ["2026-10-17", null] }] };
  void [calendar, single, range, color, time, badCalendar, badSingle, missingMode, dateTime, incomplete];
}
