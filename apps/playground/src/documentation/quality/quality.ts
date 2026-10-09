import { localizeDocumentation } from "../localize";
import type { DocumentationHeading } from "../catalog";
import type { WlTableColumn, WlTableRow } from "../../../../../packages/ui-kit/src";

export const qualityDocumentationHeadings = localizeDocumentation({
  measurement: { id: "docs-quality-measurement", title: "documentation.strings.s0780" },
  checks: { id: "docs-quality-checks", title: "documentation.strings.s0805" },
  environment: { id: "docs-quality-environment", title: "documentation.strings.s0806" },
  accessibility: { id: "docs-quality-accessibility", title: "documentation.strings.s0807" },
  versions: { id: "docs-quality-versions", title: "documentation.strings.s0808" }
} as const satisfies Record<string, DocumentationHeading>);

export const documentationQualityPage = localizeDocumentation({
  key: "quality",
  label: "documentation.strings.s0809",
  description: "documentation.strings.s0810",
  headings: Object.values(qualityDocumentationHeadings)
} as const);

export const qualityCheckColumns: WlTableColumn[] = localizeDocumentation([
  { key: "name", label: "documentation.strings.s0811", width: "30%" },
  { key: "scope", label: "documentation.strings.s0812" }
]);
export const qualityCheckRows: WlTableRow[] = localizeDocumentation([
  { name: "Vitest + Vue Test Utils", scope: "documentation.strings.s0813" },
  { name: "Playwright", scope: "documentation.strings.s0814" },
  { name: "documentation.strings.s0815", scope: "documentation.strings.s0816" },
  { name: "Axe", scope: "documentation.strings.s0817" },
  { name: "documentation.strings.s0818", scope: "documentation.strings.s0819" },
  { name: "documentation.strings.s0820", scope: "documentation.strings.s0821" }
]);
export const qualityEnvironmentColumns: WlTableColumn[] = localizeDocumentation([
  { key: "name", label: "documentation.strings.s0822", width: "38%" },
  { key: "scope", label: "documentation.strings.s0823" }
]);
export const qualityEnvironmentRows: WlTableRow[] = localizeDocumentation([
  { name: "Chrome / Edge", scope: "documentation.strings.s0824" },
  { name: "Firefox", scope: "documentation.strings.s0825" },
  { name: "Safari / iOS Safari", scope: "16.4+" },
  { name: "Vue", scope: "documentation.strings.s0826" }
]);
