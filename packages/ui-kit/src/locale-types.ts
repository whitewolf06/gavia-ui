/** Built-in control text. Explicit component props retain priority over these defaults. */
export interface WlControlLocale {
  localeCode?: string;
  close?: string;
  remove?: string;
  loading?: string;
  options?: string;
  noOptions?: string;
  filter?: string;
  selectedItems?: string;
  removeItem?: string;
  breadcrumbs?: string;
  showOptions?: string;
  password?: string;
  showPassword?: string;
  hidePassword?: string;
  colorPalette?: string;
  colorHex?: string;
  searchPlaceholder?: string;
  noResults?: string;
  searching?: string;
  commandPalette?: string;
  confirmation?: string;
  datePlaceholder?: string;
  dateFrom?: string;
  dateTo?: string;
  chooseDateForLabel?: string;
  newDateRange?: string;
  chooseMonthCurrent?: string;
  chooseYearCurrent?: string;
  monthsOfYear?: string;
  yearsRange?: string;
  chooseFiles?: string;
  fileDropLabel?: string;
  dropFiles?: string;
  fileByteUnit?: string;
  fileKilobyteUnit?: string;
  fileMegabyteUnit?: string;
  decimalSeparator?: string;
  fileUnsupportedType?: string;
  fileTooLarge?: string;
  fileSizeLimit?: string;
  fileCountLimit?: string;
  fileTooMany?: string;
  filters?: string;
  reset?: string;
  apply?: string;
  closeFilters?: string;
  decrease?: string;
  increase?: string;
  pages?: string;
  firstPage?: string;
  prevPage?: string;
  nextPage?: string;
  lastPage?: string;
  pageNumber?: string;
  of?: string;
  mainNavigation?: string;
  pinSidebar?: string;
  unpinSidebar?: string;
  closeNavigation?: string;
  noData?: string;
  eventOne?: string;
  eventFew?: string;
  eventMany?: string;
}

/** Date-picker locale input accepts regular arrays and readonly application constants. */
export interface WlDatePickerLocale extends WlControlLocale {
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

/** Retains the previous required date fields; added control text stays optional for consumers. */
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
