import { defineAsyncComponent, type Component } from "vue";
import { consumerSource } from "../../design-system/code";
import { inputDocumentationExamples, inputDocumentationAccessibility } from "./inputs";
import { showcaseDocumentationExamples, showcaseDocumentationAccessibility } from "./showcase";
export interface ComponentDocumentationExample { title: string; description: string; sourceName: string; }
export const componentDocumentationExamples: Readonly<Record<string, ComponentDocumentationExample>> = {
  ...inputDocumentationExamples, ...showcaseDocumentationExamples
};
export const componentDocumentationAccessibility: Readonly<Record<string, readonly string[]>> = {
  ...inputDocumentationAccessibility, ...showcaseDocumentationAccessibility
};
const modules = import.meta.glob<{ default: Component }>(["./inputs/*.vue", "./showcase/*.vue"]);
const sources = import.meta.glob<string>(["./inputs/*.vue", "./showcase/*.vue"], { query: "?raw", import: "default", eager: true });
const examples = Object.fromEntries(Object.entries(modules).map(([path, loader]) => [path, defineAsyncComponent(loader)]));
export function documentationExample(name: string) {
  const definition = componentDocumentationExamples[name];
  if (!definition) return undefined;
  const key = "./" + definition.sourceName;
  return { ...definition, component: examples[key], source: consumerSource(sources[key] ?? "") };
}
