import { WlPtConfig } from './pt-types';
export type { WlPtCallbackOptions, WlPtConfig, WlPtSection } from './pt-types';
/**
 * Default DOM section attributes of the kit.
 *
 * Wire it once at the app level:
 *   app.use(WlConfig, { pt: createWlPt() })
 *
 * `overrides` is deep-merged on top of the defaults. Component-level `pt`
 * attributes are applied by Gavia UI after app-level attributes.
 */
export declare function createWlPt(overrides?: WlPtConfig): WlPtConfig;
