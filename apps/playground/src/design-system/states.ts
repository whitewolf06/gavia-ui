import { translate as t } from "../i18n";
import { createDocumentationControls, type DocumentationControl } from "./documentation-controls";
import type { WlComponentManifest, WlPropManifest } from "../../../../packages/ui-kit/src/manifest";
export interface StateCase { id: string; label: string; props: Record<string, unknown> }
const axes = new Set(["variant", "size", "density", "presence", "display", "position", "tone", "shape", "displayFormat"]);
const flags = new Set(["disabled", "loading", "invalid", "active", "indeterminate", "removable", "hoverable", "thin", "dot", "closable", "compact", "light", "motion"]);
/** Only real public props are exposed; unsupported states are never passed to components. */
export function stateControls(entry: WlComponentManifest): WlPropManifest[] {
  // These containers belong to App.vue. Their props are configured on that single instance.
  if (entry.name === "WlToast" || entry.name === "WlConfirmDialog") return [];
  return entry.props.filter((prop) => axes.has(prop.name) && prop.values?.length
    || flags.has(prop.name) && prop.type === "boolean");
}
export function stateCases(entry: WlComponentManifest): StateCase[] {
  const cases: StateCase[] = [{ id: "default", get label() { return t("shell.design_system.states.text464"); }, props: {} }];
  for (const prop of stateControls(entry)) {
    const values = prop.type === "boolean" ? [true, false] : prop.values ?? [];
    for (const value of values) cases.push({ id: `${prop.name}-${value}`, label: `${prop.name}: ${value}`, props: { [prop.name]: value } });
  }
  if (entry.name === "WlField") cases.push({ id: "error", get label() { return t("shell.design_system.states.text465"); }, props: { get error() { return t("shell.design_system.states.text466"); } } });
  if (entry.name === "WlTable") cases.push({ id: "empty", get label() { return t("shell.design_system.states.text467"); }, props: { value: [], get emptyMessage() { return t("shell.design_system.states.text468"); } } });
  if (entry.name === "WlProgress") for (const value of [0, 100]) cases.push({ id: `value-${value}`, label: t("shell.design_system.states.text469", { arg0: value }), props: { value } });
  if (entry.name === "WlSteps") for (const current of [0, 1, 2]) cases.push({ id: `step-${current}`, label: t("shell.design_system.states.text470", { arg0: current + 1 }), props: { current } });
  if (entry.name === "WlIcon") for (const size of [12, 16, 24, 32]) cases.push({ id: `size-${size}`, label: `size: ${size}`, props: { size } });
  return cases;
}

/** Typed public controls supported by the canonical documentation SFC. */
export function documentationControls(entry: WlComponentManifest, source?: string): DocumentationControl[] {
  return createDocumentationControls(entry, source);
}
