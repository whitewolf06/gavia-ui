import type { WlComponentManifest } from "./types";
import { actionsManifest } from "./actions";
import { inputsManifest } from "./inputs";
import { dataManifest } from "./data";
import { containersManifest } from "./containers";
import { navigationManifest } from "./navigation";
import { feedbackManifest } from "./feedback";
import { miscManifest } from "./misc";

export * from "./types";
export {
  actionsManifest,
  inputsManifest,
  dataManifest,
  containersManifest,
  navigationManifest,
  feedbackManifest,
  miscManifest
};

/**
 * Машиночитаемый манифест всех 47 компонентов библиотеки:
 * пропсы (типы, дефолты, enum-значения), слоты, события и v-model.
 * Потребители — визуальные редакторы и AI-агенты. Tree-shakeable const export.
 */
export const wlManifest: WlComponentManifest[] = [
  ...actionsManifest,
  ...inputsManifest,
  ...dataManifest,
  ...containersManifest,
  ...navigationManifest,
  ...feedbackManifest,
  ...miscManifest
];
