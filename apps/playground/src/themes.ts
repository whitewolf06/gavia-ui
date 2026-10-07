import { wlDesignThemes } from "../../../packages/ui-kit/src/design-system/tokens.generated";
import type { WlThemeName } from "../../../packages/ui-kit/src/types";

/** The showcase has a branded default; the library keeps its White fallback. */
export const playgroundDefaultTheme: WlThemeName = "gavia";
export const playgroundThemeOptions = wlDesignThemes.map(({ name, label }) => ({ value: name, label }));

export function isPlaygroundTheme(value: unknown): value is WlThemeName {
  return typeof value === "string" && wlDesignThemes.some((theme) => theme.name === value);
}

export function parsePlaygroundTheme(search: string): WlThemeName {
  const candidate = new URLSearchParams(search).get("theme");
  return isPlaygroundTheme(candidate) ? candidate : playgroundDefaultTheme;
}

/** Preserve routes, anchors and the Pages subpath while changing the theme. */
export function createPlaygroundThemeUrl(current: URL, theme: WlThemeName): URL {
  const target = new URL(current.href);
  target.searchParams.set("theme", theme);
  return target;
}

/** Keep the chosen theme when a relative route link opens in a new tab. */
export function withPlaygroundTheme(href: string, theme: WlThemeName): string {
  const fragmentIndex = href.indexOf("#");
  const fragment = fragmentIndex < 0 ? "" : href.slice(fragmentIndex);
  const route = fragmentIndex < 0 ? href : href.slice(0, fragmentIndex);
  const queryIndex = route.indexOf("?");
  const path = queryIndex < 0 ? route : route.slice(0, queryIndex);
  const query = new URLSearchParams(queryIndex < 0 ? "" : route.slice(queryIndex + 1));
  query.set("theme", theme);
  return path + "?" + query.toString() + fragment;
}
