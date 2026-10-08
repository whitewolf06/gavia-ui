import type { WlResolvedLocale, WlLocaleInput } from "./locale-types";
export type { WlLocale, WlResolvedLocale, WlLocaleInput } from "./locale-types";

/**
 * Russian locale for Gavia UI controls. Applied by default and overridable per app:
 *   app.use(WlConfig, { locale: wlLocaleRu })
 */
export const wlLocaleRu: WlResolvedLocale = {
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
  weekHeader: "Нед"
};

const textKeys = [
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
export function normalizeWlLocale(input?: WlLocaleInput, base: WlResolvedLocale = wlLocaleRu): WlResolvedLocale {
  const source: WlLocaleInput = input && typeof input === "object" && !Array.isArray(input) ? input : {};
  const result: WlResolvedLocale = {
    ...base,
    ...Object.fromEntries(Object.entries(source).filter(([key, value]) => !knownKeys.has(key) && value !== undefined))
  };
  const firstDay = source.firstDayOfWeek;
  if (typeof firstDay === "number" && Number.isInteger(firstDay) && firstDay >= 0 && firstDay <= 6) {
    result.firstDayOfWeek = firstDay;
  }
  for (const key of textKeys) {
    const value = source[key];
    if (typeof value === "string") result[key] = value;
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
