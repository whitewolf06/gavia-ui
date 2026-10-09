import { computed, getCurrentInstance, inject, type App, type ComputedRef, type DirectiveBinding } from "vue";
import { normalizeWlLocale, type WlLocaleInput } from "./locale";
import type { WlControlLocale } from "./locale-types";
import { createWlPt } from "./theme";
import type { WlPtCallbackOptions, WlPtConfig } from "./pt-types";

export interface WlConfigOptions {
  pt?: WlPtConfig;
  locale?: WlLocaleInput;
  /** Animate overlay entry and exit; individual components may override this. */
  motion?: boolean;
}

const configKey = Symbol("wl-config");
const defaults = createWlPt();

/** Optional, app-scoped configuration. Components also work without installing it. */
export const WlConfig = {
  install(app: App, options: WlConfigOptions = {}): void {
    app.provide(configKey, options);
  }
};

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

export function mergeWlAttrs(...parts: Record<string, unknown>[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const part of parts) {
    for (const [key, value] of Object.entries(part)) {
      if (value === undefined) continue;
      if (key === "class") {
        result.class = [result.class, value].filter(Boolean);
      } else if (key === "style") {
        result.style = [result.style, value].filter(Boolean);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

/** Resolves a named DOM section: defaults, app configuration, local prop. */
export function useWlPt(
  component: string,
  local: ComputedRef<Record<string, unknown> | undefined>
): (section: string, context?: WlPtCallbackOptions["context"]) => Record<string, unknown> {
  const config = inject<WlConfigOptions>(configKey, {});
  return (section, context = {}) => resolveWlPt(component, section, config, local.value, context);
}

export function resolveWlPt(
  component: string,
  section: string,
  config: WlConfigOptions = {},
  local?: Record<string, unknown>,
  context: WlPtCallbackOptions["context"] = {}
): Record<string, unknown> {
  return mergeWlAttrs(
    resolveSection(atPath(defaults[component], section), context),
    resolveSection(atPath(config.pt?.[component], section), context),
    resolveSection(atPath(local, section), context)
  );
}

/** Vue directives cannot inject in setup; resolve the same app-scoped value from their binding. */
export function wlConfigForDirective(instance: DirectiveBinding["instance"]): WlConfigOptions {
  const publicInstance = instance as unknown as {
    $?: { appContext?: { provides?: Record<PropertyKey, unknown> } };
  } | null;
  return publicInstance?.$?.appContext?.provides?.[configKey] as WlConfigOptions | undefined ?? {};
}

export function useWlLocale(): ComputedRef<ReturnType<typeof normalizeWlLocale>> {
  const config = inject<WlConfigOptions>(configKey, {});
  return computed(() => normalizeWlLocale(config.locale));
}

/** Motion defaults on, with a local prop taking precedence over app configuration. */
export function useWlMotion(local: ComputedRef<boolean | undefined>): ComputedRef<boolean> {
  const config = inject<WlConfigOptions>(configKey, {});
  return computed(() => local.value ?? config.motion ?? true);
}

/** Resolve a rendered default while retaining public prop defaults and explicit overrides. */
export function useWlLocaleText(): (propName: string, value: string | undefined, key: keyof WlControlLocale) => string {
  const instance = getCurrentInstance();
  const locale = useWlLocale();
  return (propName, value, key) => {
    const raw = instance?.vnode.props;
    const kebabName = propName.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
    const supplied = raw?.[propName] !== undefined || raw?.[kebabName] !== undefined;
    return supplied && value !== undefined ? value : locale.value[key];
  };
}
