import { WlDatePickerLocale } from './types';
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
 * Russian locale for Gavia UI controls. Applied by default and overridable per app:
 *   app.use(WlConfig, { locale: wlLocaleRu })
 */
export declare const wlLocaleRu: WlLocale;
