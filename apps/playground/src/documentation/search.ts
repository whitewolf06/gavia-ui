import type { DocumentationGuideSection } from "../navigation";
import { documentationGuide, documentationGuideSections } from "./guides";
import { getLocalizedManifest } from "./manifest";

export interface DocumentationSearchEntry {
  id: string;
  title: string;
  description: string;
  text: string;
  component?: string;
  section?: DocumentationGuideSection;
  href?: string;
}
const files = import.meta.glob<string>("../../../../docs/guide/*.md", { query: "?raw", import: "default" });
let markdown: Promise<DocumentationSearchEntry[]> | undefined;

function normalize(value: string): string {
  return value.normalize("NFKD").toLocaleLowerCase().replace(/\p{M}/gu, "");
}

/** Match every query word against page prose, props, events, slots and guides. */
export function searchDocumentation(entries: readonly DocumentationSearchEntry[], query: string, limit = 20): DocumentationSearchEntry[] {
  const words = normalize(query).trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return entries.map((entry) => {
    const title = normalize(entry.title);
    const text = normalize(`${entry.title} ${entry.description} ${entry.text}`);
    const score = words.every((word) => text.includes(word))
      ? words.reduce((total, word) => total + (title === word ? 12 : title.startsWith(word) ? 6 : title.includes(word) ? 3 : 1), 0)
      : 0;
    return { entry, score };
  }).filter(({ score }) => score > 0).sort((left, right) => right.score - left.score || left.entry.title.localeCompare(right.entry.title))
    .slice(0, Math.max(0, Math.trunc(limit))).map(({ entry }) => entry);
}

/** Documentation bodies are fetched only when the user opens search. Failed loads can retry. */
export async function loadDocumentationSearch(locale: string): Promise<DocumentationSearchEntry[]> {
  markdown ??= Promise.all(Object.entries(files).map(async ([path, load]) => {
    const source = await load();
    const name = path.split("/").at(-1)!;
    return { id: `guide-file-${name}`, title: source.split(/\r?\n/).find((line) => line.startsWith("# "))?.slice(2) ?? name, description: `docs/guide/${name}`,
      text: source.replace(/[`#*>|]/g, " "), href: `https://github.com/whitewolf06/gavia-ui/blob/main/docs/guide/${name}` };
  })).catch((error: unknown) => {
    markdown = undefined;
    throw error;
  });
  const components = getLocalizedManifest().map((entry) => ({ id: entry.name, title: entry.name, description: entry.description ?? "", component: entry.name,
    text: [entry.category, ...entry.props.map((prop) => `${prop.name} ${prop.typescriptType ?? prop.type} ${prop.description ?? ""}`),
      ...entry.emits.map((event) => `${event.name} ${event.payload ?? ""} ${event.description ?? ""}`), ...entry.slots.map((slot) => `${slot.name} ${slot.description ?? ""}`)].join(" ") }));
  const guides = documentationGuideSections.map((section) => {
    const guide = documentationGuide(section, locale);
    return { id: section, section, title: guide.title, description: guide.description, text: guide.sections.map((part) => `${part.title} ${part.text}`).join(" ") };
  });
  return [...components, ...guides, ...await markdown];
}
