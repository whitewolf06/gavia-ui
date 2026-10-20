import type { WlThemeInitOptions, WlThemeOptions, WlThemePair } from "../../src/composables";
import { resolveWlTheme, wlThemeInitScript } from "../../src/composables";

const pair: WlThemePair<"paper" | "ink"> = { light: "paper", dark: "ink" };
export const dynamicThemeOptions: WlThemeOptions = { themes: () => pair, target: () => null };
export const staticThemeOptions: WlThemeInitOptions = { themes: pair, preference: "system" };
export const resolvedTheme: "paper" | "ink" = resolveWlTheme("system", pair, true);
wlThemeInitScript(staticThemeOptions);
// @ts-expect-error Inline scripts serialize a static pair, not a reactive getter.
wlThemeInitScript({ themes: () => pair });
