import type { WlThemeName } from "../types";
import type { WlDesignTokenDefinition } from "./types";
import { wlDesignThemes, wlDesignTokens, type WlDesignTokenName } from "./tokens.generated";

export * from "./types";
export * from "./tokens.generated";

// Build the lookup only when a consumer requests token resolution. Eager map
// construction keeps the full editor catalog in otherwise button-only bundles.
let definitions: Map<string, WlDesignTokenDefinition> | undefined;
function tokenDefinitions(): Map<string, WlDesignTokenDefinition> {
  return definitions ??= new Map(wlDesignTokens.map((token) => [token.name, token]));
}

/** Resolves the shipped theme snapshot without reading DOM or consumer overrides. */
export function resolveWlToken(name: WlDesignTokenName, theme: WlThemeName = "white"): string {
  if (!wlDesignThemes.some((item) => item.name === theme)) throw new Error(`Unknown Gavia UI theme: ${theme}`);
  function resolve(reference: string, trail: string[]): string {
    if (trail.includes(reference)) throw new Error(`Circular Gavia UI token: ${reference}`);
    const token = tokenDefinitions().get(reference);
    if (!token) throw new Error(`Unknown Gavia UI token: ${reference}`);
    return (token.themes?.[theme] ?? token.value).replace(
      /var\((--wl-[a-z0-9-]+)\)/g,
      (_, dependency: string) => resolve(dependency, [...trail, reference])
    );
  }
  return resolve(name, []);
}

/** Returns a new, immutable snapshot suitable for editors and server rendering. */
export function getWlThemeTokens(theme: WlThemeName = "white"): Readonly<Record<WlDesignTokenName, string>> {
  return Object.freeze(Object.fromEntries(wlDesignTokens.map((token) => [token.name, resolveWlToken(token.name, theme)]))) as Readonly<Record<WlDesignTokenName, string>>;
}
