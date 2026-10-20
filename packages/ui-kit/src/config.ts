import { type App, type Component, computed, type ComputedRef, type DirectiveBinding, getCurrentInstance, inject, isReactive, normalizeClass, shallowReactive } from "vue";
import type { WlControlLocale } from "./locale-types";
import type { WlPtCallbackOptions, WlPtConfig } from "./pt-types";
import { mergeWlAttrs } from "./utils/attrs";
export { mergeWlAttrs } from "./utils/attrs";
import { normalizeWlLocale, type WlLocaleInput } from "./locale";
import { createWlPt } from "./theme";
import { canonicalWlPtPath, warnWlPtAlias, wlPtNames } from "./utils/pt-aliases";

export interface WlConfigOptions {
  pt?: WlPtConfig;
  locale?: WlLocaleInput;
  /** Animate overlay entry and exit; individual components may override this. */
  motion?: boolean;
  /** RouterLink-compatible custom renderer supplied by the consuming application. */
  linkComponent?: Component;
  /** Trusted application SVG components, keyed by their public icon identifier. */
  icons?: Readonly<Record<string, Component>>;
  /** Stable prefix for multiple Vue3.4 applications rendered into the same document. */
  idPrefix?: string;
}

export interface WlConfigApi {
  setLocale: (locale: WlLocaleInput | undefined) => void;
  setMotion: (motion: boolean | undefined) => void;
  setPt: (pt: WlPtConfig | undefined) => void;
  setIcons: (icons: Readonly<Record<string, Component>> | undefined) => void;
}

const configKey = Symbol("wl-config");
const defaults = /* @__PURE__ */ createWlPt();
const appConfigs = new WeakMap<App, WlConfigOptions>();
const locales = new WeakMap<WlConfigOptions, ComputedRef<ReturnType<typeof normalizeWlLocale>>>();
const iconRegistries = new WeakMap<WlConfigOptions, ComputedRef<Readonly<Record<string, Component>>>>();
const emptyIcons: Readonly<Record<string, Component>> = Object.freeze({});
const defaultSections = new Map<string, Record<string, unknown>>();

function createConfig(options: WlConfigOptions = {}): WlConfigOptions {
  // Keep intentionally reactive caller state working; plain objects are isolated per app.
  return isReactive(options) ? options : shallowReactive({ ...options });
}

function injectedConfig(): WlConfigOptions {
  const provided = inject<WlConfigOptions | undefined>(configKey, undefined);
  if (provided) return provided;
  const app = getCurrentInstance()?.appContext.app;
  if (!app) return createConfig();
  let config = appConfigs.get(app);
  if (!config) {
    config = createConfig();
    appConfigs.set(app, config);
  }
  return config;
}

/** Optional, app-scoped configuration. Components also work without installing it. */
export const WlConfig = {
  install(app: App, options: WlConfigOptions = {}): void {
    const config = createConfig(options);
    appConfigs.set(app, config);
    app.provide(configKey, config);
  }
};

/** Update the optional configuration from any component in the same Vue app. */
export function useWlConfig(): WlConfigApi {
  const config = injectedConfig();
  return {
    setLocale: (locale) => { config.locale = locale; },
    setMotion: (motion) => { config.motion = motion; },
    setPt: (pt) => { config.pt = pt; },
    setIcons: (icons) => { config.icons = icons; }
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function atPath(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((value, key) => asRecord(value)[key], source);
}

function resolveSection(value: unknown, context: WlPtCallbackOptions["context"]): Record<string, unknown> {
  const resolved = typeof value === "function" ? value({ context }) : value;
  return asRecord(resolved);
}

/** Resolves a named DOM section: defaults, app configuration, local prop. */
export function useWlPt(
  component: string,
  local: ComputedRef<Record<string, unknown> | undefined>
): (section: string, context?: WlPtCallbackOptions["context"]) => Record<string, unknown> {
  const config = injectedConfig();
  return (section, context) => {
    const fallback = component === "iconButton" ? "button" : component;
    const canonical = wlPtNames(component, section);
    if (config.pt?.[component] === undefined && config.pt?.[fallback] === undefined
      && config.pt?.[canonical.component] === undefined && local.value === undefined) {
      const value = atPath(defaults[fallback], section);
      // Context-dependent sections must be evaluated for each option/control state.
      if (typeof value !== "function" || context === undefined) {
        const key = `${component}.${section}`;
        let attrs = defaultSections.get(key);
        if (!attrs) {
          attrs = mergeWlAttrs(resolveSection(value, {}));
          // Vue normalizes non-string classes by assigning to the props object.
          // Normalize before freezing so direct v-bind consumers remain valid.
          if (attrs.class !== undefined) attrs.class = normalizeClass(attrs.class);
          Object.freeze(attrs);
          defaultSections.set(key, attrs);
        }
        return attrs;
      }
    }
    return resolveWlPt(component, section, config, local.value, context);
  };
}

export function resolveWlPt(
  component: string,
  section: string,
  config: WlConfigOptions = {},
  local?: Record<string, unknown>,
  context: WlPtCallbackOptions["context"] = {}
): Record<string, unknown> {
  const canonical = wlPtNames(component, section);
  const fallback = component === "iconButton" ? "button" : component;
  const appLegacy = config.pt?.[component] ?? config.pt?.[fallback];
  const appCanonical = config.pt?.[canonical.component];
  const canonicalSection = canonicalWlPtPath(section);
  warnWlPtAlias(config.pt, `${component}.${section}`, `${canonical.component}.${canonical.section}`);
  warnWlPtAlias(local, section, canonicalSection);
  return mergeWlAttrs(
    resolveSection(atPath(defaults[fallback], section), context),
    resolveSection(atPath(appLegacy, section), context),
    ...(canonical.component === component && canonical.section === section
      ? []
      : [resolveSection(atPath(appCanonical, canonical.section), context)]),
    resolveSection(atPath(local, section), context),
    ...(canonicalSection === section ? [] : [resolveSection(atPath(local, canonicalSection), context)])
  );
}

/** Vue directives cannot inject in setup; resolve the same app-scoped value from their binding. */
export function wlConfigForDirective(instance: DirectiveBinding["instance"]): WlConfigOptions {
  const publicInstance = instance as unknown as {
    $?: { appContext?: { app?: App; provides?: Record<PropertyKey, unknown> } };
  } | null;
  const context = publicInstance?.$?.appContext;
  return context?.provides?.[configKey] as WlConfigOptions | undefined
    ?? (context?.app ? appConfigs.get(context.app) : undefined) ?? {};
}

export function useWlLocale(): ComputedRef<ReturnType<typeof normalizeWlLocale>> {
  const config = injectedConfig();
  let locale = locales.get(config);
  if (!locale) {
    locale = computed(() => normalizeWlLocale(config.locale));
    locales.set(config, locale);
  }
  return locale;
}

/** Motion defaults on, with a local prop taking precedence over app configuration. */
export function useWlMotion(local: ComputedRef<boolean | undefined>): ComputedRef<boolean> {
  const config = injectedConfig();
  return computed(() => local.value ?? config.motion ?? true);
}

/** Optional router integration stays isolated to the current Vue application. */
export function useWlLinkComponent(): ComputedRef<Component | undefined> {
  const config = injectedConfig();
  return computed(() => config.linkComponent);
}

export function useWlIcons(): ComputedRef<Readonly<Record<string, Component>>> {
  const config = injectedConfig();
  let icons = iconRegistries.get(config);
  if (!icons) {
    icons = computed(() => config.icons ?? emptyIcons);
    iconRegistries.set(config, icons);
  }
  return icons;
}

export function useWlIdPrefix(): string | undefined {
  return injectedConfig().idPrefix;
}

/** Resolve a rendered default while retaining public prop defaults and explicit overrides. */
export function useWlLocaleText(): (propName: string, value: string | undefined, key: Exclude<keyof WlControlLocale, "selectedItems" | "resultsFound">) => string {
  const instance = getCurrentInstance();
  const locale = useWlLocale();
  return (propName, value, key) => {
    const raw = instance?.vnode.props;
    const kebabName = propName.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
    const supplied = raw?.[propName] !== undefined || raw?.[kebabName] !== undefined;
    return supplied && value !== undefined ? value : locale.value[key];
  };
}
