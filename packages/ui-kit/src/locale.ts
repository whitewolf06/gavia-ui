import type { WlDatePickerLocale } from "./types";

/**
 * Russian locale for PrimeVue overlay components (DatePicker).
 * Applied by WlDatePicker by default; also usable at the app level:
 *   app.use(PrimeVue, { unstyled: true, pt: createWlPt(), locale: wlLocaleRu })
 */
export const wlLocaleRu: WlDatePickerLocale = {
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
