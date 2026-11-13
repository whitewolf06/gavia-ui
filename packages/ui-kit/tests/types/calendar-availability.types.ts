import { type WlCalendar, type WlCalendarDaySlotProps, type WlDisabledDates } from "../../src";

type Props = Parameters<typeof WlCalendar<false>>[0];

export function calendarAvailabilityConsumer(): void {
  const unavailable: WlDisabledDates = ["2026-07-15"] as const;
  const props: Props = { disabledDates: unavailable, onDateSelect: (iso) => iso.toUpperCase() };
  const predicate: Props = { disabledDates: (iso) => iso.endsWith("-15") };
  // @ts-expect-error Date activation supplies ISO text, not a native DOM event.
  const event: Props = { onDateSelect: (value: Event) => value.preventDefault() };
  const native: Props = { onSelect: (value: Event) => value.preventDefault() };
  // @ts-expect-error Disabled dates are ISO strings.
  const invalid: Props = { disabledDates: [15] };
  const legacySlot: WlCalendarDaySlotProps = { iso: "2026-07-15", day: 15, inMonth: true, today: false, selected: false, events: [] };
  void [props, predicate, event, native, invalid, legacySlot];
}
