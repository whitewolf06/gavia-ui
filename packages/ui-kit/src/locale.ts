import type { WlControlLocale, WlResolvedLocale, WlLocaleInput } from "./locale-types";
export type { WlLocale, WlResolvedLocale, WlLocaleInput } from "./locale-types";

/** Complete internal output; public locale objects keep their previous required fields. */
type WlNormalizedLocale = WlResolvedLocale & Required<WlControlLocale>;

/**
 * Russian locale for Gavia UI controls. Applied by default and overridable per app:
 *   app.use(WlConfig, { locale: wlLocaleRu })
 */
export const wlLocaleRu: WlNormalizedLocale = {
  firstDayOfWeek: 1,
  dayNames: [
    "Воскресенье",
    "Понедельник",
    "Вторник",
    "Среда",
    "Четверг",
    "Пятница",
    "Суббота"
  ],
  dayNamesShort: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
  dayNamesMin: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
  monthNames: [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь"
  ],
  monthNamesShort: [
    "Янв",
    "Фев",
    "Мар",
    "Апр",
    "Май",
    "Июн",
    "Июл",
    "Авг",
    "Сен",
    "Окт",
    "Ноя",
    "Дек"
  ],
  today: "Сегодня",
  clear: "Очистить",
  accept: "Подтвердить",
  reject: "Отмена",
  chooseDate: "Выбрать дату",
  chooseMonth: "Выбрать месяц",
  chooseYear: "Выбрать год",
  prevMonth: "Предыдущий месяц",
  nextMonth: "Следующий месяц",
  prevYear: "Предыдущий год",
  nextYear: "Следующий год",
  prevDecade: "Предыдущее десятилетие",
  nextDecade: "Следующее десятилетие",
  weekHeader: "Нед",
  localeCode: "ru-RU",
  close: "Закрыть",
  remove: "Удалить",
  loading: "Загрузка",
  options: "Варианты",
  noOptions: "Нет вариантов",
  filter: "Фильтр",
  selectedItems: "{count} выбрано",
  removeItem: "Удалить {label}",
  breadcrumbs: "Хлебные крошки",
  showOptions: "Показать варианты",
  password: "Пароль",
  showPassword: "Показать пароль",
  hidePassword: "Скрыть пароль",
  colorPalette: "Палитра",
  colorHex: "HEX-код цвета",
  searchPlaceholder: "Поиск или переход…",
  noResults: "Ничего не найдено",
  searching: "Поиск…",
  commandPalette: "Командная палитра",
  confirmation: "Подтверждение",
  datePlaceholder: "дд.мм.гггг",
  dateFrom: "От",
  dateTo: "До",
  chooseDateForLabel: "Выберите дату: {label}.",
  newDateRange: "Выберите начало нового диапазона.",
  chooseMonthCurrent: "Выбрать месяц, сейчас {month}",
  chooseYearCurrent: "Выбрать год, сейчас {year}",
  monthsOfYear: "Месяцы {year}",
  yearsRange: "Годы {start}–{end}",
  chooseFiles: "Выбрать файлы",
  fileDropLabel: "Выбрать файлы или перетащить их сюда",
  dropFiles: "Перетащите файлы сюда или",
  fileByteUnit: "Б",
  fileKilobyteUnit: "КБ",
  fileMegabyteUnit: "МБ",
  decimalSeparator: ",",
  fileUnsupportedType: "тип файла не поддерживается",
  fileTooLarge: "файл слишком большой",
  fileSizeLimit: "размер больше {size}",
  fileCountLimit: "лимит файлов: {count}",
  fileTooMany: "слишком много файлов",
  filters: "Фильтры",
  reset: "Сбросить",
  apply: "Применить",
  closeFilters: "Закрыть фильтры",
  decrease: "Уменьшить",
  increase: "Увеличить",
  pages: "Страницы",
  firstPage: "Первая страница",
  prevPage: "Предыдущая страница",
  nextPage: "Следующая страница",
  lastPage: "Последняя страница",
  pageNumber: "Номер страницы",
  of: "из",
  mainNavigation: "Основная навигация",
  pinSidebar: "Закрепить панель",
  unpinSidebar: "Открепить панель",
  closeNavigation: "Закрыть навигацию",
  noData: "Нет данных",
  eventOne: "событие",
  eventFew: "события",
  eventMany: "событий"
};

/** English locale, selected explicitly through WlConfig.locale. */
export const wlLocaleEn: WlNormalizedLocale = {
  "firstDayOfWeek": 1,
  "dayNames": [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ],
  "dayNamesShort": [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat"
  ],
  "dayNamesMin": [
    "Su",
    "Mo",
    "Tu",
    "We",
    "Th",
    "Fr",
    "Sa"
  ],
  "monthNames": [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ],
  "monthNamesShort": [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ],
  "today": "Today",
  "clear": "Clear",
  "accept": "Confirm",
  "reject": "Cancel",
  "chooseDate": "Choose date",
  "chooseMonth": "Choose month",
  "chooseYear": "Choose year",
  "prevMonth": "Previous month",
  "nextMonth": "Next month",
  "prevYear": "Previous year",
  "nextYear": "Next year",
  "prevDecade": "Previous decade",
  "nextDecade": "Next decade",
  "weekHeader": "Wk",
  "localeCode": "en-US",
  "close": "Close",
  "remove": "Remove",
  "loading": "Loading",
  "options": "Options",
  "noOptions": "No options",
  "filter": "Filter",
  "selectedItems": "{count} selected",
  "removeItem": "Remove {label}",
  "breadcrumbs": "Breadcrumbs",
  "showOptions": "Show options",
  "password": "Password",
  "showPassword": "Show password",
  "hidePassword": "Hide password",
  "colorPalette": "Palette",
  "colorHex": "Color HEX code",
  "searchPlaceholder": "Search or navigate…",
  "noResults": "Nothing found",
  "searching": "Searching…",
  "commandPalette": "Command palette",
  "confirmation": "Confirmation",
  "datePlaceholder": "dd.mm.yyyy",
  "dateFrom": "From",
  "dateTo": "To",
  "chooseDateForLabel": "Choose a date: {label}.",
  "newDateRange": "Choose the start of a new range.",
  "chooseMonthCurrent": "Choose month, current month {month}",
  "chooseYearCurrent": "Choose year, current year {year}",
  "monthsOfYear": "Months of {year}",
  "yearsRange": "Years {start}–{end}",
  "chooseFiles": "Choose files",
  "fileDropLabel": "Choose files or drop them here",
  "dropFiles": "Drop files here or",
  "fileByteUnit": "B",
  "fileKilobyteUnit": "KB",
  "fileMegabyteUnit": "MB",
  "decimalSeparator": ".",
  "fileUnsupportedType": "file type is not supported",
  "fileTooLarge": "file is too large",
  "fileSizeLimit": "size exceeds {size}",
  "fileCountLimit": "file limit: {count}",
  "fileTooMany": "too many files",
  "filters": "Filters",
  "reset": "Reset",
  "apply": "Apply",
  "closeFilters": "Close filters",
  "decrease": "Decrease",
  "increase": "Increase",
  "pages": "Pages",
  "firstPage": "First page",
  "prevPage": "Previous page",
  "nextPage": "Next page",
  "lastPage": "Last page",
  "pageNumber": "Page number",
  "of": "of",
  "mainNavigation": "Main navigation",
  "pinSidebar": "Pin sidebar",
  "unpinSidebar": "Unpin sidebar",
  "closeNavigation": "Close navigation",
  "noData": "No data",
  "eventOne": "event",
  "eventFew": "events",
  "eventMany": "events"
};

const controlTextKeys = [
  "localeCode",
  "close",
  "remove",
  "loading",
  "options",
  "noOptions",
  "filter",
  "selectedItems",
  "removeItem",
  "breadcrumbs",
  "showOptions",
  "password",
  "showPassword",
  "hidePassword",
  "colorPalette",
  "colorHex",
  "searchPlaceholder",
  "noResults",
  "searching",
  "commandPalette",
  "confirmation",
  "datePlaceholder",
  "dateFrom",
  "dateTo",
  "chooseDateForLabel",
  "newDateRange",
  "chooseMonthCurrent",
  "chooseYearCurrent",
  "monthsOfYear",
  "yearsRange",
  "chooseFiles",
  "fileDropLabel",
  "dropFiles",
  "fileByteUnit",
  "fileKilobyteUnit",
  "fileMegabyteUnit",
  "decimalSeparator",
  "fileUnsupportedType",
  "fileTooLarge",
  "fileSizeLimit",
  "fileCountLimit",
  "fileTooMany",
  "filters",
  "reset",
  "apply",
  "closeFilters",
  "decrease",
  "increase",
  "pages",
  "firstPage",
  "prevPage",
  "nextPage",
  "lastPage",
  "pageNumber",
  "of",
  "mainNavigation",
  "pinSidebar",
  "unpinSidebar",
  "closeNavigation",
  "noData",
  "eventOne",
  "eventFew",
  "eventMany"
] as const;

const textKeys = [
  ...controlTextKeys,
  "today", "clear", "accept", "reject", "chooseDate", "chooseMonth", "chooseYear",
  "prevMonth", "nextMonth", "prevYear", "nextYear", "prevDecade", "nextDecade", "weekHeader"
] as const;
const dayKeys = ["dayNames", "dayNamesShort", "dayNamesMin"] as const;
const monthKeys = ["monthNames", "monthNamesShort"] as const;
const knownKeys = new Set<string>(["firstDayOfWeek", ...textKeys, ...dayKeys, ...monthKeys]);

function isNames(value: unknown, count: number): value is readonly string[] {
  return Array.isArray(value) && value.length === count
    && Array.from(value).every((item: unknown) => typeof item === "string");
}

/** Ignore undefined or invalid known values, preserving defaults and application extensions. */
export function normalizeWlLocale(input?: WlLocaleInput, base: WlResolvedLocale = wlLocaleRu): WlNormalizedLocale {
  const source: WlLocaleInput = input && typeof input === "object" && !Array.isArray(input) ? input : {};
  const normalizedBase: WlNormalizedLocale = { ...wlLocaleRu, ...base };
  for (const key of controlTextKeys) {
    if (typeof normalizedBase[key] !== "string") normalizedBase[key] = wlLocaleRu[key];
  }
  try {
    normalizedBase.localeCode = Intl.getCanonicalLocales(normalizedBase.localeCode)[0] ?? wlLocaleRu.localeCode;
  } catch {
    normalizedBase.localeCode = wlLocaleRu.localeCode;
  }
  const result: WlNormalizedLocale = {
    ...normalizedBase,
    ...Object.fromEntries(Object.entries(source).filter(([key, value]) => !knownKeys.has(key) && value !== undefined))
  };
  const firstDay = source.firstDayOfWeek;
  if (typeof firstDay === "number" && Number.isInteger(firstDay) && firstDay >= 0 && firstDay <= 6) {
    result.firstDayOfWeek = firstDay;
  }
  for (const key of textKeys) {
    const value = source[key];
    if (typeof value !== "string") continue;
    if (key === "localeCode") {
      try { result.localeCode = Intl.getCanonicalLocales(value)[0] ?? normalizedBase.localeCode; } catch { /* Preserve the valid base locale. */ }
    } else result[key] = value;
  }
  for (const key of dayKeys) {
    const value = source[key];
    result[key] = [...(isNames(value, 7) ? value : base[key])];
  }
  for (const key of monthKeys) {
    const value = source[key];
    result[key] = [...(isNames(value, 12) ? value : base[key])];
  }
  return result;
}

/** Substitute named values in control text without evaluating application input. */
export function formatWlLocaleText(text: string, values: Readonly<Record<string, string | number>>): string {
  return text.replace(/\{(\w+)\}/g, (token, key: string) => values[key] === undefined ? token : String(values[key]));
}
