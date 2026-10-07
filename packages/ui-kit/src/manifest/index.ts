import type { WlComponentManifest } from "./types";
import { actionsManifest } from "./actions";
import { inputsManifest } from "./inputs";
import { dataManifest } from "./data";
import { containersManifest } from "./containers";
import { compositesManifest } from "./composites";
import { navigationManifest } from "./navigation";
import { feedbackManifest } from "./feedback";
import { miscManifest } from "./misc";

export * from "./types";
export {
  actionsManifest,
  inputsManifest,
  dataManifest,
  containersManifest,
  compositesManifest,
  navigationManifest,
  feedbackManifest,
  miscManifest
};

/**
 * Машиночитаемый манифест всех компонентов библиотеки:
 * пропсы (типы, дефолты, enum-значения), слоты, события, v-model и версию
 * первой публичной поставки компонента.
 * Потребители — визуальные редакторы и AI-агенты. Tree-shakeable const export.
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
