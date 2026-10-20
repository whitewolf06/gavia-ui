import { ref } from "vue";
import { readPlaygroundPreference } from "../preferences";
export type PlaygroundLocale = "en" | "ru";
export function detectPlaygroundLocale(languages: readonly string[]): PlaygroundLocale {
  for (const language of languages) {
    const candidate = language.toLowerCase().split(/[-_]/)[0];
    if (candidate === "en" || candidate === "ru") return candidate;
  }
  return "en";
}
export function parsePlaygroundLocale(search: string, pathname = typeof window === "undefined" ? "" : window.location.pathname): PlaygroundLocale {
  const candidate = new URLSearchParams(search).get("lang");
  if (candidate === "en" || candidate === "ru") return candidate;
  if (/\/ru(?:\/|$)/.test(pathname)) return "ru";
  if (/\/(?:docs|system|font|theme-builder|changelog)(?:\/|$)/.test(pathname)) return "en";
  const saved = readPlaygroundPreference("locale");
  if (saved === "en" || saved === "ru") return saved;
  const languages = typeof navigator === "undefined"
    ? []
    : navigator.languages?.length ? navigator.languages : [navigator.language];
  return detectPlaygroundLocale(languages);
}
/** Kept separate from Vite catalogs so source-export utilities also work in Node. */
export const playgroundLocale = ref<PlaygroundLocale>(parsePlaygroundLocale(typeof window === "undefined" ? "" : window.location.search));
