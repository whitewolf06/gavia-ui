/** Consumer bundlers replace this literal; no Node type dependency is required. */
declare const process: { env: { NODE_ENV?: string } };
import { isWlDevelopment } from "./development";

/** Transitional names remain accepted throughout 0.x. Defaults keep their CSS classes. */
export const wlPtComponentAliases: Readonly<Record<string, string>> = {
  datatable: "table", inputtext: "input", toggleswitch: "switch", selectbutton: "segmented",
  paginator: "pagination", progressbar: "progress", radiobutton: "radio", breadcrumb: "breadcrumbs"
};

const sectionAliases: Readonly<Record<string, string>> = {
  pcCloseButton: "closeButton", pcChip: "chip", pcToggleButton: "item",
  pcFilter: "filter", pcInputText: "inputText", pcPrevButton: "prevButton", pcNextButton: "nextButton"
};
const generated = new WeakMap<object, object>();
const warnings = new WeakMap<object, Set<string>>();

/** Keep generated defaults from producing deprecation warnings in every application. */
export function trackWlPtOverrides<T extends object>(result: T, overrides: object): T {
  generated.set(result, overrides);
  return result;
}

export function canonicalWlPtPath(path: string): string {
  return path.split(".").map((part) => sectionAliases[part] ?? part).join(".");
}

export function wlPtNames(component: string, section: string): { component: string; section: string } {
  if (component === "tablist") return { component: "tabs", section: canonicalWlPtPath(section) };
  if (component === "tabpanels") return { component: "tabs", section: `panels.${section}` };
  if (component === "tabpanel") return { component: "tabs", section: `panel.${section}` };
  return { component: wlPtComponentAliases[component] ?? component, section: canonicalWlPtPath(section) };
}

/** Warn once for explicit legacy overrides; calls and state remain isolated by object identity. */
export function warnWlPtAlias(source: object | undefined, oldPath: string, newPath: string): void {
  if (!isWlDevelopment() || process.env.NODE_ENV === "production" || !source || oldPath === newPath) return;
  const actual = generated.get(source) ?? source;
  let value: unknown = actual;
  for (const part of oldPath.split(".")) {
    value = value && typeof value === "object" ? (value as Record<string, unknown>)[part] : undefined;
  }
  if (value === undefined) return;
  let seen = warnings.get(actual);
  if (!seen) {
    seen = new Set();
    warnings.set(actual, seen);
  }
  if (seen.has(oldPath)) return;
  seen.add(oldPath);
  console.warn(`[Gavia UI] pt.${oldPath} is deprecated; use pt.${newPath}. Both work in 0.x.`);
}
