import type { WlDatePickerLocale } from "./types";

export interface WlLocale extends WlDatePickerLocale {
  firstDayOfWeek: number;
  dayNamesMin: string[];
  monthNames: string[];
  accept: string;
  reject: string;
  chooseDate: string;
  prevMonth: string;
  nextMonth: string;
}

/**
 * Russian locale for WhiteUI controls. Applied by default and overridable per app:
 *   app.use(WlConfig, { locale: wlLocaleRu })
 */
export const wlLocaleRu: WlLocale = {
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
