import { WlComponentManifest } from "./types.js";
import { actionsManifest } from "./actions.js";
import { compositesManifest } from "./composites.js";
import { containersManifest } from "./containers.js";
import { dataManifest } from "./data.js";
import { feedbackManifest } from "./feedback.js";
import { inputsManifest } from "./inputs.js";
import { miscManifest } from "./misc.js";
import { navigationManifest } from "./navigation.js";
export * from "./types.js";
export { actionsManifest, compositesManifest, containersManifest, dataManifest, feedbackManifest, inputsManifest, miscManifest, navigationManifest };
/**
 * Machine-readable component catalogue with props, defaults, enum values,
 * slots, events, models and the first public version. Used by documentation,
 * visual editors and agents; component-only consumers can tree-shake it.
 */
export declare const wlManifest: WlComponentManifest[];
