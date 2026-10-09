import { localizeDocumentation, documentationMetadataSource } from "../localize";
import type { wlDesignTokens } from "../../../../../packages/ui-kit/src";

import type { DocumentationAssetSection } from "../../navigation";
export type { DocumentationAssetSection } from "../../navigation";
export interface DocumentationAssetHeading { id: string; title: string; }
export interface DocumentationAssetPage {
  label: string;
  description: string;
  headings: readonly DocumentationAssetHeading[];
}
export const iconDocumentationHeadings = localizeDocumentation({
  playground: { id: "docs-icons-playground", title: "documentation.strings.s0003" },
  catalog: { id: "docs-icons-catalog", title: "documentation.strings.s0004" },
  accessibility: { id: "docs-icons-accessibility", title: "documentation.strings.s0005" },
  compatibility: { id: "docs-icons-compatibility", title: "documentation.strings.s0006" },
  pipeline: { id: "docs-icons-pipeline", title: "documentation.strings.s0007" }
} as const);
export const colorDocumentationHeadings = localizeDocumentation({
  themes: { id: "docs-colors-themes", title: "documentation.strings.s0008" },
  setup: { id: "docs-colors-setup", title: "documentation.strings.s0009" },
  surfaces: { id: "docs-colors-surfaces", title: "documentation.strings.s0010" },
  text: { id: "docs-colors-text", title: "documentation.strings.s0011" },
  accent: { id: "docs-colors-accent", title: "documentation.strings.s0012" },
  status: { id: "docs-colors-status", title: "documentation.strings.s0013" },
  borders: { id: "docs-colors-borders", title: "documentation.strings.s0014" },
  examples: { id: "docs-colors-examples", title: "documentation.strings.s0015" }
} as const);
export const documentationAssetPages: Record<DocumentationAssetSection, DocumentationAssetPage> = localizeDocumentation({
  icons: {
    label: "documentation.strings.s0016",
    description: "documentation.strings.s0017",
    headings: Object.values(iconDocumentationHeadings)
  },
  colors: {
    label: "documentation.strings.s0018",
    description: "documentation.strings.s0019",
    headings: Object.values(colorDocumentationHeadings)
  }
});
export const documentationAssets = localizeDocumentation((["icons", "colors"] as const)
  .map((key) => ({ key, ...documentationMetadataSource(documentationAssetPages[key]) })));

type SemanticColorName = Extract<(typeof wlDesignTokens)[number], { layer: "semantic"; type: "color" }>["name"];

export interface DocumentationColorGroup {
  key: keyof Pick<typeof colorDocumentationHeadings, "surfaces" | "text" | "accent" | "status" | "borders">;
  description: string;
  tokens: readonly SemanticColorName[];
}
/** Named semantic roles, resolved from the canonical catalogue rather than copied colours. */
export const documentationColorGroups: readonly DocumentationColorGroup[] = localizeDocumentation([
  {
    key: "surfaces",
    description: "documentation.strings.s0020",
    tokens: ["--wl-bg", "--wl-bg-soft", "--wl-bg-hover", "--wl-mask-bg", "--wl-avatar-bg", "--wl-tooltip-bg"]
  },
  {
    key: "text",
    description: "documentation.strings.s0021",
    tokens: ["--wl-text", "--wl-text-2", "--wl-text-3", "--wl-text-muted", "--wl-text-danger", "--wl-tooltip-text"]
  },
  {
    key: "accent",
    description: "documentation.strings.s0022",
    tokens: ["--wl-accent", "--wl-accent-hover", "--wl-accent-soft", "--wl-accent-soft-hover", "--wl-accent-border", "--wl-accent-border-hover"]
  },
  {
    key: "status",
    description: "documentation.strings.s0023",
    tokens: ["--wl-success", "--wl-success-soft", "--wl-success-border", "--wl-warn", "--wl-warn-soft", "--wl-warn-border", "--wl-danger", "--wl-danger-hover", "--wl-danger-soft", "--wl-danger-soft-hover", "--wl-danger-border", "--wl-info-text", "--wl-ok-text", "--wl-warn-text", "--wl-err-text"]
  },
  {
    key: "borders",
    description: "documentation.strings.s0024",
    tokens: ["--wl-border", "--wl-border-2", "--wl-focus-color", "--wl-focus-invalid-color"]
  }
]);
