import { WlThemeName } from "../types.js";
import { WlDesignTokenName } from "./tokens.generated.js";
export * from "./types.js";
export * from "./tokens.generated.js";
/** Resolves the shipped theme snapshot without reading DOM or consumer overrides. */
export declare function resolveWlToken(name: WlDesignTokenName, theme?: WlThemeName): string;
/** Returns a new, immutable snapshot suitable for editors and server rendering. */
export declare function getWlThemeTokens(theme?: WlThemeName): Readonly<Record<WlDesignTokenName, string>>;
