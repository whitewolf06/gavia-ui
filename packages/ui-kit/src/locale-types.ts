/** Date-picker locale input accepts regular arrays and readonly application constants. */
export interface WlDatePickerLocale {
  firstDayOfWeek?: number;
  dayNames?: readonly string[];
  dayNamesShort?: readonly string[];
  dayNamesMin?: readonly string[];
  monthNames?: readonly string[];
  monthNamesShort?: readonly string[];
  today?: string;
  clear?: string;
  accept?: string;
  reject?: string;
  chooseDate?: string;
  chooseMonth?: string;
  chooseYear?: string;
  prevMonth?: string;
  nextMonth?: string;
  prevYear?: string;
  nextYear?: string;
  prevDecade?: string;
  nextDecade?: string;
  weekHeader?: string;
  /** Application extensions remain open; consumers must narrow custom values. */
  [key: string]: unknown;
}

/** Locale constants retain the legacy required fields and mutable array output contract. */
export interface WlLocale extends WlDatePickerLocale {
  firstDayOfWeek: number;
  dayNames?: string[];
  dayNamesShort?: string[];
  dayNamesMin: string[];
  monthNames: string[];
  monthNamesShort?: string[];
  accept: string;
  reject: string;
  chooseDate: string;
  prevMonth: string;
  nextMonth: string;
}

/** Resolved locale: every known field is available after normalization. */
export interface WlResolvedLocale extends WlLocale {
  dayNames: string[];
  dayNamesShort: string[];
  monthNamesShort: string[];
  today: string;
  clear: string;
  chooseMonth: string;
  chooseYear: string;
  prevYear: string;
  nextYear: string;
  prevDecade: string;
  nextDecade: string;
  weekHeader: string;
}

/** Partial input accepts readonly arrays without imposing tuple lengths on callers. */
export type WlLocaleInput = WlDatePickerLocale;
