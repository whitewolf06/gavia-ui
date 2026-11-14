export type WlThemePreference = "light" | "dark" | "system";
export interface WlThemePair<TName extends string = string> {
    light: TName;
    dark: TName;
}
export type WlThemePairSource = WlThemePair | (() => WlThemePair);
export interface WlThemeOptions {
    /** A static pair or a reactive getter for application-selected theme names. */
    themes?: WlThemePairSource;
    storageKey?: string;
    preference?: WlThemePreference;
    transition?: boolean;
    /** Omit for the document root; return null to resolve without changing DOM. */
    target?: () => HTMLElement | null;
}
export interface WlThemeInitOptions extends Omit<WlThemeOptions, "themes" | "target" | "transition"> {
    /** Inline initialization serializes a static pair, never a getter. */
    themes?: WlThemePair;
}
/** Pure resolution for SSR and first paint; the caller supplies OS state. */
export declare function resolveWlTheme<TName extends string>(preference: WlThemePreference, themes: WlThemePair<TName>, dark?: boolean): TName;
/** Resolve a named light/dark pair after mount. No DOM/storage access during SSR. */
export declare function useWlTheme(options?: WlThemeOptions): {
    theme: import('vue').ComputedRef<string>;
    preference: import('vue').ComputedRef<WlThemePreference>;
    resolved: import('vue').ComputedRef<"light" | "dark">;
    setPreference: (value: WlThemePreference) => void;
};
/** Inline before first paint; escape '<' so user-supplied names cannot close a script tag. */
export declare function wlThemeInitScript(options?: WlThemeInitOptions): string;
