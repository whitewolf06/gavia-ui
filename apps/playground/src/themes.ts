import { playgroundLocale } from "./i18n";
import { ref } from "vue";
import { prefersPlaygroundDarkTheme, readPlaygroundPreference } from "./preferences";
import { wlDesignThemes } from "../../../packages/ui-kit/src/design-system/tokens.generated";
import type { WlThemeName } from "../../../packages/ui-kit/src/types";

/** Automatic mode uses the branded light/dark pair; all five themes remain available. */
export const playgroundDefaultTheme: WlThemeName = "gavia";
export type PlaygroundThemePreference = WlThemeName | "system";
const themeOrder: readonly WlThemeName[] = ["gavia", "gavia-dark", "white", "graphite", "newspaper"];
export const playgroundThemeOptions = [...wlDesignThemes]
  .sort((a, b) => themeOrder.indexOf(a.name) - themeOrder.indexOf(b.name))
  .map(({ name, label }) => ({ value: name, label }));

export function isPlaygroundTheme(value: unknown): value is WlThemeName {
  return typeof value === "string" && wlDesignThemes.some((theme) => theme.name === value);
}

export function isPlaygroundThemePreference(value: unknown): value is PlaygroundThemePreference {
  return value === "system" || isPlaygroundTheme(value);
}

export function parsePlaygroundThemePreference(search: string): PlaygroundThemePreference {
  const candidate = new URLSearchParams(search).get("theme");
  if (isPlaygroundThemePreference(candidate)) return candidate;
  const saved = readPlaygroundPreference("theme");
  return isPlaygroundThemePreference(saved) ? saved : "system";
}

export function resolvePlaygroundTheme(preference: PlaygroundThemePreference, dark = prefersPlaygroundDarkTheme()): WlThemeName {
  return preference === "system" ? dark ? "gavia-dark" : playgroundDefaultTheme : preference;
}

export function parsePlaygroundTheme(search: string): WlThemeName {
  return resolvePlaygroundTheme(parsePlaygroundThemePreference(search));
}

export const playgroundThemePreference = ref<PlaygroundThemePreference>(parsePlaygroundThemePreference(
  typeof window === "undefined" ? "" : window.location.search
));

/** Preserve routes, anchors and the Pages subpath while changing the theme. */
export function createPlaygroundThemeUrl(current: URL, theme: PlaygroundThemePreference): URL {
  const target = new URL(current.href);
  target.searchParams.set("theme", theme);
  return target;
}

/** Keep the chosen theme when a relative route link opens in a new tab. */
export function withPlaygroundTheme(href: string, theme: PlaygroundThemePreference): string {
  const fragmentIndex = href.indexOf("#");
  const fragment = fragmentIndex < 0 ? "" : href.slice(fragmentIndex);
  const route = fragmentIndex < 0 ? href : href.slice(0, fragmentIndex);
  const queryIndex = route.indexOf("?");
  const path = queryIndex < 0 ? route : route.slice(0, queryIndex);
  const query = new URLSearchParams(queryIndex < 0 ? "" : route.slice(queryIndex + 1));
  query.set("theme", theme);
  query.set("lang", playgroundLocale.value);
  return path + "?" + query.toString() + fragment;
}

/** Pair the quick light/dark switch without changing the saved theme catalog. */
export function getPlaygroundThemeToggleTarget(theme: WlThemeName, classicLightTheme: "white" | "newspaper" = "white"): WlThemeName {
  switch (theme) {
    case "gavia": return "gavia-dark";
    case "gavia-dark": return "gavia";
    case "graphite": return classicLightTheme;
    case "white":
    case "newspaper": return "graphite";
  }
}
