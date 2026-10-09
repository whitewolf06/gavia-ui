import { localizeDocumentation, documentationMetadataSource } from "./localize";
import type { DocumentationFoundationSection } from "../navigation";
import type { WlManifestCategory, WlPropManifest } from "../../../../packages/ui-kit/src/manifest";

export const documentationCategories: readonly { key: WlManifestCategory; label: string }[] = localizeDocumentation([
  { key: "actions", label: "documentation.strings.s0109" },
  { key: "inputs", label: "documentation.strings.s0110" },
  { key: "data", label: "documentation.strings.s0111" },
  { key: "containers", label: "documentation.strings.s0112" },
  { key: "composites", label: "documentation.strings.s0113" },
  { key: "navigation", label: "documentation.strings.s0114" },
  { key: "feedback", label: "documentation.strings.s0115" },
  { key: "misc", label: "documentation.strings.s0116" }
]);

export function propType(prop: WlPropManifest): string {
  return prop.values?.length ? prop.values.map((value) => JSON.stringify(value)).join(" | ") : prop.type;
}

export function propDefault(prop: WlPropManifest): string {
  return prop.default === undefined ? "—" : JSON.stringify(prop.default) ?? "—";
}

export interface DocumentationPtSection {
  name: string;
  element: string;
  description: string;
}

/** The three named sections applied by WlButton.vue through useWlPt("button"). */
export const buttonPtSections: readonly DocumentationPtSection[] = localizeDocumentation([
  { name: "root", element: "button", description: "documentation.strings.s0117" },
  { name: "label", element: "span.wl-btn__label", description: "documentation.strings.s0118" },
  { name: "loadingIcon", element: "span.wl-btn__spinner", description: "documentation.strings.s0119" }
]);

export const installationCommand = "pnpm add gavia-ui vue";
export const installationSource = [
  'import { createApp } from "vue";',
  'import "gavia-ui/styles/reset.css";',
  'import "gavia-ui/styles/base.css";',
  'import "gavia-ui/styles/primitives.css";',
  'import "gavia-ui/themes/white.css";',
  'import App from "./App.vue";',
  "",
  'document.documentElement.dataset.wlTheme = "white";',
  'createApp(App).mount("#app");'
].join("\n");

export interface DocumentationHeading { id: string; title: string; }
export interface DocumentationExampleHeading extends DocumentationHeading { name: string; description: string; }
export interface DocumentationFoundation {
  label: string;
  description: string;
  rulesHeading: DocumentationHeading;
  rules: readonly string[];
  examples: readonly DocumentationExampleHeading[];
  breakpointsHeading?: DocumentationHeading;
  layersHeading?: DocumentationHeading;
  additionalHeadings?: readonly DocumentationHeading[];
  continueHeading: DocumentationHeading;
}

export const documentationOverviewHeadings = localizeDocumentation([
  { id: "docs-install", title: "documentation.strings.s0120" },
  { id: "docs-foundations", title: "documentation.strings.s0121" },
  { id: "docs-components", title: "documentation.strings.s0122" },
  { id: "docs-tokens", title: "documentation.strings.s0123" },
  { id: "docs-icons", title: "documentation.strings.s0016" },
  { id: "docs-migration", title: "documentation.strings.s0124" }
] as const satisfies readonly DocumentationHeading[]);

export type ButtonDocumentationTab = "examples" | "api" | "accessibility";
export const buttonDocumentationHeadings = localizeDocumentation({
  controls: { id: "docs-button-controls-title", title: "documentation.strings.s0125", tab: "examples" },
  preview: { id: "docs-button-preview-title", title: "documentation.strings.s0126", tab: "examples" },
  source: { id: "docs-button-source-title", title: "documentation.strings.s0127", tab: "examples" },
  usage: { id: "docs-button-usage", title: "documentation.strings.s0128", tab: "examples" },
  props: { id: "docs-button-props", title: "Props", tab: "api" },
  events: { id: "docs-button-events", title: "documentation.strings.s0129", tab: "api" },
  slots: { id: "docs-button-slots", title: "documentation.strings.s0130", tab: "api" },
  pt: { id: "docs-button-pt", title: "Pass-through: pt", tab: "api" },
  accessibility: { id: "docs-button-accessibility", title: "documentation.strings.s0131", tab: "accessibility" }
} as const satisfies Record<string, DocumentationHeading & { tab: ButtonDocumentationTab }>);
export const buttonDocumentationToc = Object.values(buttonDocumentationHeadings);
export const buttonContractAnchors = {
  props: buttonDocumentationHeadings.props.id,
  events: buttonDocumentationHeadings.events.id,
  slots: buttonDocumentationHeadings.slots.id,
  pt: buttonDocumentationHeadings.pt.id
};

export const documentationFoundationPages: Record<DocumentationFoundationSection, DocumentationFoundation> = localizeDocumentation({
  typography: {
    label: "documentation.strings.s0132",
    description: "documentation.strings.s0133",
    rulesHeading: { id: "docs-typography-rules", title: "documentation.strings.s0134" },
    rules: [
      "documentation.strings.s0135",
      "documentation.strings.s0136",
      "documentation.strings.s0137",
      "documentation.strings.s0138",
      "documentation.strings.s0139"
    ],
    examples: [
      { name: "typography-scale", id: "docs-typography-scale", title: "documentation.strings.s0140", description: "documentation.strings.s0141" },
      { name: "text-hierarchy", id: "docs-text-hierarchy", title: "documentation.strings.s0142", description: "documentation.strings.s0143" }
    ],
    continueHeading: { id: "docs-typography-next", title: "documentation.strings.s0144" }
  },
  layout: {
    label: "documentation.strings.s0145",
    description: "documentation.strings.s0146",
    rulesHeading: { id: "docs-layout-rules", title: "documentation.strings.s0147" },
    rules: [
      "documentation.strings.s0148",
      "documentation.strings.s0149",
      "documentation.strings.s0150",
      "documentation.strings.s0151",
      "documentation.strings.s0152",
      "documentation.strings.s0153",
      "documentation.strings.s0154"
    ],
    examples: [
      { name: "containers", id: "docs-layout-containers", title: "documentation.strings.s0155", description: "documentation.strings.s0156" },
      { name: "equal-columns", id: "docs-layout-equal-columns", title: "documentation.strings.s0157", description: "documentation.strings.s0158" },
      { name: "column-proportions", id: "docs-layout-column-proportions", title: "documentation.strings.s0159", description: "documentation.strings.s0160" },
      { name: "responsive-grid", id: "docs-layout-responsive-grid", title: "documentation.strings.s0161", description: "documentation.strings.s0162" },
      { name: "gap-alignment", id: "docs-layout-gap-alignment", title: "documentation.strings.s0163", description: "documentation.strings.s0164" },
      { name: "nested-grid", id: "docs-layout-nested-grid", title: "documentation.strings.s0165", description: "documentation.strings.s0166" },
      { name: "page-composition", id: "docs-layout-page-composition", title: "documentation.strings.s0167", description: "documentation.strings.s0168" },
      { name: "spacing", id: "docs-layout-spacing", title: "documentation.strings.s0169", description: "documentation.strings.s0170" },
      { name: "css-helpers", id: "docs-layout-css-helpers", title: "documentation.strings.s0171", description: "documentation.strings.s0172" },
      { name: "stacking-layers", id: "docs-layout-stacking-layers", title: "documentation.strings.s0173", description: "documentation.strings.s0174" }
    ],
    breakpointsHeading: { id: "docs-layout-breakpoints", title: "documentation.strings.s0175" },
    layersHeading: { id: "docs-layout-layers", title: "documentation.strings.s0176" },
    continueHeading: { id: "docs-layout-next", title: "documentation.strings.s0144" }
  },
  responsive: {
    label: "documentation.strings.s0177",
    description: "documentation.strings.s0178",
    rulesHeading: { id: "docs-responsive-rules", title: "documentation.strings.s0179" },
    rules: [
      "documentation.strings.s0180",
      "documentation.strings.s0181",
      "documentation.strings.s0182",
      "documentation.strings.s0183"
    ],
    breakpointsHeading: { id: "docs-responsive-breakpoints", title: "documentation.strings.s0184" },
    examples: [
      { name: "responsive-viewport", id: "docs-responsive-viewport", title: "documentation.strings.s0185", description: "documentation.strings.s0186" },
      { name: "responsive-fluid", id: "docs-responsive-fluid", title: "documentation.strings.s0187", description: "documentation.strings.s0188" },
      { name: "responsive-container", id: "docs-responsive-container", title: "documentation.strings.s0189", description: "documentation.strings.s0190" },
      { name: "responsive-behavior", id: "docs-responsive-behavior", title: "documentation.strings.s0191", description: "documentation.strings.s0192" }
    ],
    additionalHeadings: [
      { id: "docs-responsive-overrides", title: "documentation.strings.s0193" },
      { id: "docs-responsive-components", title: "documentation.strings.s0194" },
      { id: "docs-responsive-checks", title: "documentation.strings.s0195" }
    ],
    continueHeading: { id: "docs-responsive-next", title: "documentation.strings.s0144" }
  },
  content: {
    label: "documentation.strings.s0196",
    description: "documentation.strings.s0197",
    rulesHeading: { id: "docs-content-rules", title: "documentation.strings.s0134" },
    rules: [
      "documentation.strings.s0198",
      "documentation.strings.s0199",
      "documentation.strings.s0200",
      "documentation.strings.s0201",
      "documentation.strings.s0202"
    ],
    examples: [
      { name: "content-writing", id: "docs-content-writing", title: "documentation.strings.s0203", description: "documentation.strings.s0204" },
      { name: "content-states", id: "docs-content-states", title: "documentation.strings.s0205", description: "documentation.strings.s0206" }
    ],
    continueHeading: { id: "docs-content-next", title: "documentation.strings.s0144" }
  }
});

export function foundationHeadings(section: DocumentationFoundationSection): readonly DocumentationHeading[] {
  const page = documentationFoundationPages[section];
  return [page.rulesHeading, ...(page.breakpointsHeading ? [page.breakpointsHeading] : []), ...page.examples,
    ...(page.additionalHeadings ?? []), ...(page.layersHeading ? [page.layersHeading] : []), page.continueHeading];
}
export const documentationFoundations = localizeDocumentation((["typography", "layout", "responsive", "content"] as const)
  .map((key) => ({ key, ...documentationMetadataSource(documentationFoundationPages[key]) })));
