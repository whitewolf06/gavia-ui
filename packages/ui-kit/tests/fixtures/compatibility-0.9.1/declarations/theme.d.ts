export interface WlPtCallbackOptions {
    context: {
        checked?: boolean;
        indeterminate?: boolean;
        selected?: boolean;
        inRange?: boolean;
        focused?: boolean;
        disabled?: boolean;
        active?: boolean;
        today?: boolean;
        otherMonth?: boolean;
        [key: string]: unknown;
    };
    [key: string]: unknown;
}
export type WlPtSection = Record<string, unknown> | ((options: WlPtCallbackOptions) => Record<string, unknown>);
export type WlPtConfig = Record<string, Record<string, WlPtSection>>;
/**
 * Default DOM section attributes of the kit.
 *
 * Wire it once at the app level:
 *   app.use(WlConfig, { pt: createWlPt() })
 *
 * `overrides` is deep-merged on top of the defaults. Component-level `pt`
 * attributes are applied by Gavia UI after app-level attributes.
 */
export declare function createWlPt(overrides?: Record<string, unknown>): WlPtConfig;
