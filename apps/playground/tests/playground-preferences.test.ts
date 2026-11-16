import { readFileSync } from "node:fs";
import { URL as NodeURL } from "node:url";
import { runInNewContext } from "node:vm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { detectPlaygroundLocale, parsePlaygroundLocale } from "../src/i18n/locale";
import { playgroundPreferenceKeys, readPlaygroundPreference, savePlaygroundPreference } from "../src/preferences";
import { appliedTheme, appliedThemeStorageKey, applyThemeToRoot, clearAppliedTheme, parseAppliedTheme, readAppliedTheme, setAppliedTheme } from "../src/theme-builder/application";
import { createPlaygroundThemeUrl, parsePlaygroundTheme, parsePlaygroundThemePreference, withPlaygroundTheme } from "../src/themes";

const saved = new Map<string, string | null>();
beforeEach(() => {
  for (const key of Object.values(playgroundPreferenceKeys)) {
    saved.set(key, localStorage.getItem(key));
    localStorage.removeItem(key);
  }
  vi.stubGlobal("navigator", { languages: ["ru-RU", "en-US"], language: "ru-RU" });
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
});

describe("applied Playground palette", () => {
  const palette = {
    name: "my-palette", baseTheme: "graphite" as const,
    overrides: { "--wl-palette-bg": "#223344", "--wl-action-primary-bg": "var(--wl-palette-action-primary-bg)" }
  };
  const snapshot = { ...palette, schemaVersion: 1, previousTheme: "system" };
  const boot = readFileSync(new NodeURL("../index.html", import.meta.url), "utf8").match(/<script>([\s\S]*?)<\/script>/)![1]!;
  let previousStyle: string | null;
  let previousTheme: string | undefined;
  let previousDraft: string | undefined;
  let previousStored: string | null;
  const runBoot = () => runInNewContext(boot, {
    URLSearchParams, document, location: window.location, localStorage,
    navigator: { languages: ["en"] }, matchMedia: () => ({ matches: false })
  });
  beforeEach(() => {
    previousStyle = document.documentElement.getAttribute("style");
    previousTheme = document.documentElement.dataset.wlTheme;
    previousDraft = document.documentElement.dataset.wlPlaygroundDraft;
    previousStored = localStorage.getItem(appliedThemeStorageKey);
    clearAppliedTheme();
    applyThemeToRoot("gavia");
    window.history.replaceState(null, "", "/");
  });
  afterEach(() => {
    clearAppliedTheme();
    applyThemeToRoot("gavia");
    if (previousStyle === null) document.documentElement.removeAttribute("style");
    else document.documentElement.setAttribute("style", previousStyle);
    if (previousTheme) document.documentElement.dataset.wlTheme = previousTheme;
    else delete document.documentElement.dataset.wlTheme;
    if (previousDraft) document.documentElement.dataset.wlPlaygroundDraft = previousDraft;
    else delete document.documentElement.dataset.wlPlaygroundDraft;
    if (previousStored === null) localStorage.removeItem(appliedThemeStorageKey);
    else localStorage.setItem(appliedThemeStorageKey, previousStored);
    delete document.documentElement.dataset.wlBoot;
    window.history.replaceState(null, "", "/");
  });

  it("keeps ordinary visits unchanged and applies only owned root properties", () => {
    expect(readAppliedTheme("")).toBeNull();
    document.documentElement.style.setProperty("--application-color", "red");
    setAppliedTheme(palette, "system");
    applyThemeToRoot("gavia");
    expect(document.documentElement.dataset.wlTheme).toBe("graphite");
    expect(document.documentElement.style.getPropertyValue("--wl-palette-bg")).toBe("#223344");
    setAppliedTheme({ ...palette, overrides: { "--wl-palette-text": "#ffffff" } }, "white");
    applyThemeToRoot("graphite");
    expect(appliedTheme.value?.previousTheme).toBe("system");
    expect(document.documentElement.style.getPropertyValue("--wl-palette-bg")).toBe("");
    clearAppliedTheme();
    applyThemeToRoot("gavia");
    expect(document.documentElement.style.getPropertyValue("--wl-palette-text")).toBe("");
    expect(document.documentElement.style.getPropertyValue("--application-color")).toBe("red");
    expect(document.documentElement.dataset.wlPlaygroundDraft).toBeUndefined();
    expect(localStorage.getItem(appliedThemeStorageKey)).toBeNull();
  });

  it("keeps a palette through route links but cancels it for an explicit different theme", () => {
    localStorage.setItem(appliedThemeStorageKey, JSON.stringify(snapshot));
    expect(readAppliedTheme("?view=docs&theme=graphite")?.name).toBe("my-palette");
    expect(readAppliedTheme("?view=project")?.baseTheme).toBe("graphite");
    expect(readAppliedTheme("?view=docs&theme=white")).toBeNull();
    expect(localStorage.getItem(appliedThemeStorageKey)).toBeNull();
  });

  it("restores valid root colors and the matching color scheme before application mounting", () => {
    localStorage.setItem(appliedThemeStorageKey, JSON.stringify(snapshot));
    runBoot();
    expect(document.documentElement.dataset.wlTheme).toBe("graphite");
    expect(document.documentElement.dataset.wlPlaygroundDraft).toBe("my-palette");
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(document.documentElement.style.getPropertyValue("--wl-palette-bg")).toBe("#223344");
    // Main's restoration must retain the same delta, then Undo removes it.
    appliedTheme.value = readAppliedTheme("");
    applyThemeToRoot("gavia");
    clearAppliedTheme();
    applyThemeToRoot("gavia");
    expect(document.documentElement.style.getPropertyValue("--wl-palette-bg")).toBe("");
    expect(document.documentElement.style.colorScheme).toBe("light");
  });

  it("honours direct built-in links in the actual pre-paint resolver", () => {
    localStorage.setItem(appliedThemeStorageKey, JSON.stringify(snapshot));
    window.history.replaceState(null, "", "/docs/?theme=newspaper");
    runBoot();
    expect(document.documentElement.dataset.wlTheme).toBe("newspaper");
    expect(document.documentElement.dataset.wlPlaygroundDraft).toBeUndefined();
    expect(localStorage.getItem(appliedThemeStorageKey)).toBeNull();
  });

  it.each([
    { ...snapshot, schemaVersion: 99 },
    { ...snapshot, overrides: { "--wl-palette-bg": "url(https://example.test/image)" } },
    { ...snapshot, overrides: { color: "#223344" } },
    { ...snapshot, baseTheme: "unknown" }
  ])("ignores invalid applied snapshots in both restoration paths (%j)", (invalid) => {
    expect(parseAppliedTheme(invalid)).toBeNull();
    localStorage.setItem(appliedThemeStorageKey, JSON.stringify(invalid));
    runBoot();
    expect(document.documentElement.dataset.wlPlaygroundDraft).toBeUndefined();
    expect(document.documentElement.style.getPropertyValue("--wl-palette-bg")).toBe("");
  });

  it("still applies and clears the current tab when persistence is denied", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Denied", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new DOMException("Denied", "SecurityError");
    });
    expect(() => setAppliedTheme(palette, "system")).not.toThrow();
    applyThemeToRoot("gavia");
    expect(document.documentElement.style.getPropertyValue("--wl-palette-bg")).toBe("#223344");
    expect(() => clearAppliedTheme()).not.toThrow();
    applyThemeToRoot("gavia");
    expect(document.documentElement.style.getPropertyValue("--wl-palette-bg")).toBe("");
    vi.restoreAllMocks();
  });
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
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Denied", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Denied", "SecurityError");
    });
    expect(readPlaygroundPreference("theme")).toBeNull();
    expect(() => savePlaygroundPreference("theme", "white")).not.toThrow();
    expect(parsePlaygroundTheme("")).toBe("gavia-dark");
    expect(parsePlaygroundLocale("")).toBe("ru");
    expect(parsePlaygroundTheme("?theme=white")).toBe("white");
    expect(parsePlaygroundLocale("?lang=en")).toBe("en");
  });
});
