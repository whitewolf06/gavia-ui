import { WlResolvedLocale, WlLocaleInput } from './locale-types';
export type { WlLocale, WlResolvedLocale, WlLocaleInput } from './locale-types';
/**
 * Russian locale for Gavia UI controls. Applied by default and overridable per app:
 *   app.use(WlConfig, { locale: wlLocaleRu })
 */
export declare const wlLocaleRu: WlResolvedLocale;
/** Ignore undefined or invalid known values, preserving defaults and application extensions. */
export declare function normalizeWlLocale(input?: WlLocaleInput, base?: WlResolvedLocale): WlResolvedLocale;
