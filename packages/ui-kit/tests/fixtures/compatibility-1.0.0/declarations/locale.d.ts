import { WlControlLocale, WlLocaleInput, WlResolvedLocale } from "./locale-types.js";
export type { WlLocale, WlLocaleInput, WlResolvedLocale } from "./locale-types.js";
/** Complete internal output; public locale objects keep their previous required fields. */
type WlNormalizedLocale = WlResolvedLocale & Required<WlControlLocale>;
/**
 * Russian locale for Gavia UI controls. Select it explicitly for each application:
 *   app.use(WlConfig, { locale: wlLocaleRu })
 */
export declare const wlLocaleRu: WlNormalizedLocale;
/** Default English fallback for Gavia UI controls; WlConfig.locale overrides it per app. */
export declare const wlLocaleEn: WlNormalizedLocale;
/** Resolve partial locale input against English, or an explicit base, preserving application extensions. */
export declare function normalizeWlLocale(input?: WlLocaleInput, base?: WlResolvedLocale): WlNormalizedLocale;
/** Substitute named values in control text without evaluating application input. */
export declare function formatWlLocaleText(text: string, values: Readonly<Record<string, string | number>>): string;
/** Intl supplies calendar/number metadata; UI phrases fall back to English unless overridden. */
export declare function createWlLocaleFromIntl(code: string, overrides?: WlLocaleInput): WlResolvedLocale;
