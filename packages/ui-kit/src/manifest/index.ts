import type { WlComponentManifest } from "./types";
import { actionsManifest } from "./actions";
import { compositesManifest } from "./composites";
import { containersManifest } from "./containers";
import { dataManifest } from "./data";
import { feedbackManifest } from "./feedback";
import { inputsManifest } from "./inputs";
import { miscManifest } from "./misc";
import { navigationManifest } from "./navigation";

export * from "./types";
export {
  actionsManifest,
  compositesManifest,
  containersManifest,
  dataManifest,
  feedbackManifest,
  inputsManifest,
  miscManifest,
  navigationManifest
};

/**
 * Machine-readable component catalogue with props, defaults, enum values,
 * slots, events, models and the first public version. Used by documentation,
 * visual editors and agents; component-only consumers can tree-shake it.
 */
// Pure construction lets component-only imports omit editor metadata. The build
// manifest plugin and contract tests still evaluate and validate every category.
export const wlManifest: WlComponentManifest[] = /* @__PURE__ */ ([] as WlComponentManifest[]).concat(
  actionsManifest,
  inputsManifest,
  dataManifest,
  containersManifest,
  compositesManifest,
  navigationManifest,
  feedbackManifest,
  miscManifest
);
