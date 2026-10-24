import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useWlMediaQuery, useWlReducedMotion } from "./useWlMediaQuery";

export type WlThemePreference = "light" | "dark" | "system";
export interface WlThemePair<TName extends string = string> {
  light: TName;
  dark: TName;
}
export type WlThemePairSource = WlThemePair | (() => WlThemePair);
export interface WlThemeOptions {
  /** A static pair or a reactive getter for application-selected theme names. */
  themes?: WlThemePairSource;
  storageKey?: string;
  preference?: WlThemePreference;
  transition?: boolean;
  /** Omit for the document root; return null to resolve without changing DOM. */
  target?: () => HTMLElement | null;
}
export interface WlThemeInitOptions extends Omit<WlThemeOptions, "themes" | "target" | "transition"> {
  /** Inline initialization serializes a static pair, never a getter. */
  themes?: WlThemePair;
}

function resolvePreference(preference: WlThemePreference, dark: boolean): "light" | "dark" {
  return preference === "system" ? dark ? "dark" : "light" : preference;
}

/** Pure resolution for SSR and first paint; the caller supplies OS state. */
export function resolveWlTheme<TName extends string>(preference: WlThemePreference, themes: WlThemePair<TName>, dark = false): TName {
  return themes[resolvePreference(preference, dark)];
}

/** Resolve a named light/dark pair after mount. No DOM/storage access during SSR. */
export function useWlTheme(options: WlThemeOptions = {}) {
  const pair = computed(() => typeof options.themes === "function"
    ? options.themes()
    : options.themes ?? { light: "gavia", dark: "gavia-dark" });
  const preference = ref<WlThemePreference>(options.preference ?? "system");
  const dark = useWlMediaQuery("(prefers-color-scheme: dark)");
  const reduced = useWlReducedMotion();
  const resolved = computed(() => resolvePreference(preference.value, dark.value));
  const theme = computed(() => resolveWlTheme(resolved.value, pair.value));
  let mounted = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let target: HTMLElement | null = null;
  function apply(): void {
    if (!mounted)
      return;
    const nextTarget = options.target ? options.target() : document.documentElement;
    if (target !== nextTarget) {
      clearTimeout(timer);
      target?.classList.remove("wl-theme-transition");
      target = nextTarget;
    }
    if (!target)
      return;
    if (options.transition && !reduced.value && target.getAttribute("data-wl-theme") !== theme.value) {
      target.classList.add("wl-theme-transition");
      clearTimeout(timer);
      timer = setTimeout(() => target?.classList.remove("wl-theme-transition"), 200);
    }
    target.setAttribute("data-wl-theme", theme.value);
  }
  function setPreference(value: WlThemePreference): void {
    preference.value = value;
    if (mounted && options.storageKey) {
      try {
        localStorage.setItem(options.storageKey, value);
      } catch { /* Restricted storage still allows local switching. */ }
    }
  }
  onMounted(() => {
    if (options.storageKey) {
      try {
        const saved = localStorage.getItem(options.storageKey);
        if (saved === "light" || saved === "dark" || saved === "system")
          preference.value = saved;
      } catch { /* Storage is optional. */ }
    }
    mounted = true;
    apply();
  });
  watch(theme, apply, { flush: "sync" });
  onBeforeUnmount(() => {
    clearTimeout(timer);

    target?.classList.remove("wl-theme-transition");
  });
  return { theme, preference: computed(() => preference.value), resolved, setPreference };
}

/** Inline before first paint; escape '<' so user-supplied names cannot close a script tag. */
export function wlThemeInitScript(options: WlThemeInitOptions = {}): string {
  const settings = JSON.stringify({
    themes: options.themes ?? { light: "gavia", dark: "gavia-dark" },
    storageKey: options.storageKey,
    preference: options.preference ?? "system"
  }).replace(/</g, "\\u003c");
  return `(function(){try{var o=${settings},p=o.preference;try{var s=o.storageKey&&localStorage.getItem(o.storageKey);`
    + "if(s==='light'||s==='dark'||s==='system')p=s}catch(e){}var d=p==='dark'||"
    + "(p==='system'&&typeof matchMedia==='function'&&matchMedia('(prefers-color-scheme: dark)').matches);"
    + "document.documentElement.setAttribute('data-wl-theme',d?o.themes.dark:o.themes.light)}catch(e){}})();";
}
