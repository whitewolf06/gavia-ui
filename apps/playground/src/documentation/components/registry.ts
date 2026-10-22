import { type Component, defineAsyncComponent } from "vue";
import PlaygroundPageLoading from "../../PlaygroundPageLoading.vue";
import { inputDocumentationAccessibility, inputDocumentationExamples } from "./inputs";
import { showcaseDocumentationAccessibility, showcaseDocumentationExamples } from "./showcase";
interface ComponentDocumentationExample { title: string; description: string; sourceName: string }
const componentDocumentationExamples: Readonly<Record<string, ComponentDocumentationExample>> = {
  ...inputDocumentationExamples, ...showcaseDocumentationExamples
};
export const componentDocumentationAccessibility: Readonly<Record<string, readonly string[]>> = {
  ...inputDocumentationAccessibility, ...showcaseDocumentationAccessibility
};
const modules = import.meta.glob<{ default: Component }>(["./inputs/*.vue", "./showcase/*.vue"]);
const sources = import.meta.glob<string>(["./inputs/*.vue", "./showcase/*.vue"], { query: "?raw", import: "default" });
const examples = Object.fromEntries(Object.entries(modules).map(([path, loader]) => [
  path, defineAsyncComponent({ loader, loadingComponent: PlaygroundPageLoading, errorComponent: PlaygroundPageLoading, delay: 0 })
]));
export function documentationExample(name: string) {
  const definition = componentDocumentationExamples[name];
  if (!definition) return undefined;
  const key = "./" + definition.sourceName;
  return { ...definition, component: examples[key], loadSource: sources[key] };
}
