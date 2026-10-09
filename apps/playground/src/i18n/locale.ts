import { ref } from "vue";
export type PlaygroundLocale = "en" | "ru";
export function parsePlaygroundLocale(search: string): PlaygroundLocale {
  return new URLSearchParams(search).get("lang") === "ru" ? "ru" : "en";
}
/** Kept separate from Vite catalogs so source-export utilities also work in Node. */
export const playgroundLocale = ref<PlaygroundLocale>(parsePlaygroundLocale(typeof window === "undefined" ? "" : window.location.search));
