import type { WlThemeName } from "legato-ui";
import { resolveWlTheme, type WlThemePair } from "legato-ui/composables";
import catalogSummary from "virtual:gavia-catalog-summary";
import { ref } from "vue";
import { playgroundLocale } from "./i18n/locale";
import { prefersPlaygroundDarkTheme, readPlaygroundPreference } from "./preferences";

export const playgroundDefaultTheme = "legato";
export type PlaygroundThemePreference = WlThemeName | "system";
const themeOrder: readonly WlThemeName[] = ["legato", "legato-dark", "gavia", "gavia-dark", "white", "graphite", "newspaper"];
export const playgroundThemeOptions = [...catalogSummary.themes]
  .sort((a, b) => themeOrder.indexOf(a.name) - themeOrder.indexOf(b.name))
  .map(({ name, label }) => ({ value: name, label }));

export function isPlaygroundTheme(value: unknown): value is WlThemeName {
  return typeof value === "string" && catalogSummary.themes.some((theme) => theme.name === value);
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

export function playgroundThemePair(preference: PlaygroundThemePreference): WlThemePair<WlThemeName> {
  return preference === "system"
    ? { light: playgroundDefaultTheme, dark: "legato-dark" }
    : { light: preference, dark: preference };
}

export function resolvePlaygroundTheme(preference: PlaygroundThemePreference, dark = prefersPlaygroundDarkTheme()): WlThemeName {
  return resolveWlTheme("system", playgroundThemePair(preference), dark);
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

export type PlaygroundLightTheme = Exclude<WlThemeName, "graphite" | "gavia-dark" | "legato-dark">;

export function initialPlaygroundLightTheme(preference: PlaygroundThemePreference): PlaygroundLightTheme {
  if (preference === "system") return playgroundDefaultTheme;
  if (preference === "graphite" && readPlaygroundPreference("lightTheme") === "newspaper") return "newspaper";
  return rememberPlaygroundLightTheme(preference, playgroundDefaultTheme);
}

/** Newspaper and Classic share the same dark companion. */
export function getPlaygroundThemeToggleTarget(theme: WlThemeName, lastLight: PlaygroundLightTheme = playgroundDefaultTheme): WlThemeName {
  switch (theme) {
    case "legato": return "legato-dark";
    case "gavia": return "gavia-dark";
    case "legato-dark":
    case "gavia-dark":
    case "graphite": return rememberPlaygroundLightTheme(theme, lastLight);
    case "white":
    case "newspaper": return "graphite";
  }
}

export function rememberPlaygroundLightTheme(theme: WlThemeName, lastLight: PlaygroundLightTheme): PlaygroundLightTheme {
  if (theme === "legato-dark") return "legato";
  if (theme === "gavia-dark") return "gavia";
  if (theme === "graphite") return lastLight === "newspaper" ? "newspaper" : "white";
  return theme;
}
