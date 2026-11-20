import type { WlThemeName } from "legato-ui";
import { shallowRef } from "vue";
import { isPlaygroundTheme, isPlaygroundThemePreference, type PlaygroundThemePreference } from "../themes";

export const appliedThemeStorageKey = "gavia-ui.applied-theme.v1";
export interface AppliedTheme {
  name: string;
  baseTheme: WlThemeName;
  previousTheme: PlaygroundThemePreference;
  overrides: Record<string, string>;
}
export type ThemeApplication = Pick<AppliedTheme, "name" | "baseTheme" | "overrides">;

/** This snapshot is separate from the editable builder draft and its export schema. */
export function parseAppliedTheme(value: unknown): AppliedTheme | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const draft = value as Record<string, unknown>;
  if (draft.schemaVersion !== 1 || typeof draft.name !== "string" || !/^[a-z][a-z0-9-]{0,31}$/.test(draft.name)
    || !isPlaygroundTheme(draft.baseTheme) || !isPlaygroundThemePreference(draft.previousTheme)
    || !draft.overrides || typeof draft.overrides !== "object" || Array.isArray(draft.overrides)) return null;
  const entries = Object.entries(draft.overrides);
  if (entries.length > 64 || entries.some(([name, color]) => !/^--wl-[a-z0-9-]+$/.test(name)
    || typeof color !== "string" || !/^(?:#[\da-f]{6}|var\(--wl-[a-z0-9-]+\))$/i.test(color))) return null;
  return { name: draft.name, baseTheme: draft.baseTheme, previousTheme: draft.previousTheme, overrides: Object.fromEntries(entries) };
}

export function readAppliedTheme(search: string): AppliedTheme | null {
  try {
    const stored = typeof window === "undefined" ? null : localStorage.getItem(appliedThemeStorageKey);
    const draft = stored ? parseAppliedTheme(JSON.parse(stored)) : null;
    const requested = new URLSearchParams(search).get("theme");
    // A direct link to another built-in theme has the same priority as the selector.
    if (draft && isPlaygroundThemePreference(requested) && requested !== draft.baseTheme) {
      localStorage.removeItem(appliedThemeStorageKey);
      return null;
    }
    return draft;
  } catch { return null; }
}

export const appliedTheme = shallowRef<AppliedTheme | null>(readAppliedTheme(typeof window === "undefined" ? "" : window.location.search));
const ownedProperties = new Set<string>();

export function applyThemeToRoot(theme: WlThemeName, root: HTMLElement = document.documentElement): void {
  // The pre-paint script has already set these exact properties on a reload.
  if (!ownedProperties.size && root.dataset.wlPlaygroundDraft && appliedTheme.value) {
    for (const name of Object.keys(appliedTheme.value.overrides)) ownedProperties.add(name);
  }
  for (const name of ownedProperties) root.style.removeProperty(name);
  ownedProperties.clear();
  const draft = appliedTheme.value;
  const base = draft?.baseTheme ?? theme;
  root.dataset.wlTheme = base;
  root.style.colorScheme = base === "gavia-dark" || base === "graphite" ? "dark" : "light";
  if (draft) {
    root.dataset.wlPlaygroundDraft = draft.name;
    for (const [name, value] of Object.entries(draft.overrides)) {
      root.style.setProperty(name, value);
      ownedProperties.add(name);
    }
  } else delete root.dataset.wlPlaygroundDraft;
}

export function setAppliedTheme(value: ThemeApplication, previousTheme: PlaygroundThemePreference): void {
  const draft = parseAppliedTheme({ ...value, previousTheme: appliedTheme.value?.previousTheme ?? previousTheme, schemaVersion: 1 });
  if (!draft) return;
  appliedTheme.value = draft;
  try {
    localStorage.setItem(appliedThemeStorageKey, JSON.stringify({ ...draft, schemaVersion: 1 }));
  } catch { /* This tab still works without storage. */ }
}

export function clearAppliedTheme(): void {
  appliedTheme.value = null;
  try {
    localStorage.removeItem(appliedThemeStorageKey);
  } catch { /* This tab still works without storage. */ }
}
