/** Storage is optional: private browsing and embedded pages can deny access. */
export const playgroundPreferenceKeys = {
  theme: "gavia-ui.theme",
  locale: "gavia-ui.locale"
} as const;

export function readPlaygroundPreference(key: keyof typeof playgroundPreferenceKeys): string | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage.getItem(playgroundPreferenceKeys[key]);
  } catch {
    return null;
  }
}

export function savePlaygroundPreference(key: keyof typeof playgroundPreferenceKeys, value: string): void {
  try {
    if (typeof window !== "undefined") window.localStorage.setItem(playgroundPreferenceKeys[key], value);
  } catch {
    // The current tab still honours the choice when persistence is unavailable.
  }
}

export function prefersPlaygroundDarkTheme(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-color-scheme: dark)").matches;
}
