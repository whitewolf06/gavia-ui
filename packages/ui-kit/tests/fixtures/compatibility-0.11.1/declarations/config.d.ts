import { App, ComputedRef, DirectiveBinding } from 'vue';
import { WlResolvedLocale, WlLocaleInput } from './locale';
import { WlPtCallbackOptions, WlPtConfig } from './pt-types';
export interface WlConfigOptions {
    pt?: WlPtConfig;
    locale?: WlLocaleInput;
    /** Animate overlay entry and exit; individual components may override this. */
    motion?: boolean;
}
/** Optional, app-scoped configuration. Components also work without installing it. */
export declare const WlConfig: {
    install(app: App, options?: WlConfigOptions): void;
};
export declare function mergeWlAttrs(...parts: Record<string, unknown>[]): Record<string, unknown>;
/** Resolves a named DOM section: defaults, app configuration, local prop. */
export declare function useWlPt(component: string, local: ComputedRef<Record<string, unknown> | undefined>): (section: string, context?: WlPtCallbackOptions["context"]) => Record<string, unknown>;
export declare function resolveWlPt(component: string, section: string, config?: WlConfigOptions, local?: Record<string, unknown>, context?: WlPtCallbackOptions["context"]): Record<string, unknown>;
/** Vue directives cannot inject in setup; resolve the same app-scoped value from their binding. */
export declare function wlConfigForDirective(instance: DirectiveBinding["instance"]): WlConfigOptions;
export declare function useWlLocale(): ComputedRef<WlResolvedLocale>;
/** Motion defaults on, with a local prop taking precedence over app configuration. */
export declare function useWlMotion(local: ComputedRef<boolean | undefined>): ComputedRef<boolean>;
