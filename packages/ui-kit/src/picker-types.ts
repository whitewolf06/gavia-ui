import type { WlCalendarEvent } from "./types";

export type WlDateFormatOptions = {
  dateStyle: "full" | "long" | "medium" | "short";
  year?: never; month?: never; day?: never;
} | {
  dateStyle?: undefined;
  year?: "numeric" | "2-digit";
  month?: "numeric" | "2-digit" | "long" | "short";
  day?: "numeric" | "2-digit";
};
export type WlDisabledDates = readonly string[] | ((iso: string) => boolean);
export interface WlDateRangePreset {
  label: string;
  value: readonly [start: string, end: string] | (() => readonly [start: string, end: string]);
  disabled?: boolean;
}
export type WlTimePickerHourFormat = "auto" | 12 | 24;
export interface WlTimeInterval { start: string; end: string }
export type WlCalendarModel<Multiple extends boolean = false> = Multiple extends true ? string[] : string;
export interface WlCalendarDaySlotProps {
  iso: string;
  day: number;
  inMonth: boolean;
  today: boolean;
  selected: boolean;
  events: readonly WlCalendarEvent[];
}
