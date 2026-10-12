import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { detectPlaygroundLocale, parsePlaygroundLocale } from "../../../apps/playground/src/i18n/locale";
import { playgroundPreferenceKeys, readPlaygroundPreference, savePlaygroundPreference } from "../../../apps/playground/src/preferences";
import { createPlaygroundThemeUrl, parsePlaygroundTheme, parsePlaygroundThemePreference, withPlaygroundTheme } from "../../../apps/playground/src/themes";

const saved = new Map<string, string | null>();
beforeEach(() => {
  for (const key of Object.values(playgroundPreferenceKeys)) {
    saved.set(key, localStorage.getItem(key));
    localStorage.removeItem(key);
  }
  vi.stubGlobal("navigator", { languages: ["ru-RU", "en-US"], language: "ru-RU" });
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  for (const [key, value] of saved) {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  }
  saved.clear();
});

describe("playground visitor preferences", () => {
  it("starts in system mode and uses the current OS colour scheme", () => {
    expect(parsePlaygroundThemePreference("")).toBe("system");
    expect(parsePlaygroundTheme("")).toBe("gavia-dark");
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    expect(parsePlaygroundTheme("")).toBe("gavia");
  });

  it("prioritises a valid theme link, then a saved choice, then the system", () => {
    savePlaygroundPreference("theme", "newspaper");
    expect(parsePlaygroundTheme("")).toBe("newspaper");
    expect(parsePlaygroundTheme("?theme=white")).toBe("white");
    expect(parsePlaygroundTheme("?theme=system")).toBe("gavia-dark");
    expect(parsePlaygroundTheme("?theme=unknown")).toBe("newspaper");
    savePlaygroundPreference("theme", "unknown");
    expect(parsePlaygroundTheme("?theme=unknown")).toBe("gavia-dark");
  });

  it("remembers system mode rather than freezing the resolved light/dark theme", () => {
    savePlaygroundPreference("theme", "system");
    expect(parsePlaygroundTheme("")).toBe("gavia-dark");
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    expect(parsePlaygroundTheme("")).toBe("gavia");
    const current = new URL("https://example.test/gavia-ui/?view=system&lang=ru#ds-themes");
    const target = createPlaygroundThemeUrl(current, "system");
    expect(target.pathname).toBe("/gavia-ui/");
    expect(target.searchParams.get("theme")).toBe("system");
    expect(target.hash).toBe("#ds-themes");
    expect(withPlaygroundTheme("?view=system#ds-tokens", "system")).toContain("theme=system");
  });

  it("uses the first supported browser language and falls back to English", () => {
    expect(parsePlaygroundLocale("")).toBe("ru");
    expect(detectPlaygroundLocale(["de-DE", "RU-ru", "en-GB"])).toBe("ru");
    expect(detectPlaygroundLocale(["en-GB", "ru-RU"])).toBe("en");
    expect(detectPlaygroundLocale(["de-DE", "fr-FR"])).toBe("en");
    expect(detectPlaygroundLocale([])).toBe("en");
  });

  it("prioritises a valid language link over the saved choice and browser", () => {
    savePlaygroundPreference("locale", "en");
    expect(parsePlaygroundLocale("")).toBe("en");
    expect(parsePlaygroundLocale("?lang=ru")).toBe("ru");
    expect(parsePlaygroundLocale("?lang=unknown")).toBe("en");
    savePlaygroundPreference("locale", "unknown");
    expect(parsePlaygroundLocale("?lang=unknown")).toBe("ru");
  });

  it("still resolves preferences when storage access is denied", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new DOMException("Denied", "SecurityError"); });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("Denied", "SecurityError"); });
    expect(readPlaygroundPreference("theme")).toBeNull();
    expect(() => savePlaygroundPreference("theme", "white")).not.toThrow();
    expect(parsePlaygroundTheme("")).toBe("gavia-dark");
    expect(parsePlaygroundLocale("")).toBe("ru");
    expect(parsePlaygroundTheme("?theme=white")).toBe("white");
    expect(parsePlaygroundLocale("?lang=en")).toBe("en");
  });
});
