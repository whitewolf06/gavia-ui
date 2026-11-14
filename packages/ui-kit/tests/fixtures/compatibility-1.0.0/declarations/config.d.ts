import { App, Component, ComputedRef, DirectiveBinding } from 'vue';
import { WlPtCallbackOptions, WlPtComponent, WlPtConfig } from "./pt-types.js";
import { normalizeWlLocale, WlLocaleInput } from "./locale.js";
export { mergeWlAttrs } from "./utils/attrs.js";
export interface WlConfigOptions {
    pt?: WlPtConfig;
    /** Partial app-scoped locale. Omitted or invalid values use the English fallback. */
    locale?: WlLocaleInput;
    /** Animate overlay entry and exit; individual components may override this. */
    motion?: boolean;
    /** RouterLink-compatible custom renderer supplied by the consuming application. */
    linkComponent?: Component;
    /** Trusted application SVG components, keyed by their public icon identifier. */
    icons?: Readonly<Record<string, Component>>;
    /** Stable prefix for multiple Vue3.4 applications rendered into the same document. */
    idPrefix?: string;
}
export interface WlConfigApi {
    setLocale: (locale: WlLocaleInput | undefined) => void;
    setMotion: (motion: boolean | undefined) => void;
    setPt: (pt: WlPtConfig | undefined) => void;
    setIcons: (icons: Readonly<Record<string, Component>> | undefined) => void;
}
/** Optional, app-scoped configuration. Components also work without installing it. */
export declare const WlConfig: {
    install(app: App, options?: WlConfigOptions): void;
};
/** Update the optional configuration from any component in the same Vue app. */
export declare function useWlConfig(): WlConfigApi;
/** Resolves a named DOM section: defaults, app configuration, local prop. */
export declare function useWlPt(component: WlPtComponent, local: ComputedRef<Record<string, unknown> | undefined>): (section: string, context?: WlPtCallbackOptions["context"]) => Record<string, unknown>;
export declare function resolveWlPt(component: WlPtComponent, section: string, config?: WlConfigOptions, local?: Record<string, unknown>, context?: WlPtCallbackOptions["context"]): Record<string, unknown>;
/** Vue directives cannot inject in setup; resolve the same app-scoped value from their binding. */
export declare function wlConfigForDirective(instance: DirectiveBinding["instance"]): WlConfigOptions;
export declare function useWlLocale(): ComputedRef<ReturnType<typeof normalizeWlLocale>>;
/** Motion defaults on, with a local prop taking precedence over app configuration. */
export declare function useWlMotion(local: ComputedRef<boolean | undefined>): ComputedRef<boolean>;
/** Optional router integration stays isolated to the current Vue application. */
export declare function useWlLinkComponent(): ComputedRef<Component | undefined>;
export declare function useWlIcons(): ComputedRef<Readonly<Record<string, Component>>>;
export declare function useWlIdPrefix(): string | undefined;
