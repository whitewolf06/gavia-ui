export type ChangelogInline =
  | { kind: "text"; value: string }
  | { kind: "code"; value: string }
  | { kind: "link"; label: string; href: string };

export type ChangelogBlock =
  | { kind: "paragraph"; content: ChangelogInline[] }
  | { kind: "heading"; content: ChangelogInline[] }
  | { kind: "list"; items: ChangelogInline[][] };

export interface ChangelogSection {
  id: string;
  title: string;
  version?: string;
  date?: string;
  unreleased: boolean;
  blocks: ChangelogBlock[];
}

export interface ChangelogDocument {
  introduction: ChangelogBlock[];
  sections: ChangelogSection[];
}

/**
 * The changelog supports headings, paragraphs, top-level bullets, links and code.
 * HTML is plain text. Unsafe URLs are never turned into clickable links.
 */
export function resolveChangelogLink(destination: string, documentationBaseUrl: string): string | undefined {
  const value = destination.trim();
  if (!value || /[\u0000-\u0020\u007f\\\\]/.test(value)) return undefined;
  if (/^#[a-zA-Z0-9_\-]+$/.test(value)) return value;
  try {
    if (/^https?:\/\//i.test(value)) {
      const url = new URL(value);
      return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.href : undefined;
    }
    // Canonical repository links only: reject schemes, network paths and traversal.
    if (!/^(?:docs\/|README\.md(?:$|#)|CONTRIBUTING\.md(?:$|#)|CHANGELOG\.md(?:$|#)|LICENSE(?:$|#))/.test(value)) return undefined;
    const decodedPath = decodeURIComponent(value.split(/[?#]/, 1)[0] ?? "");
    if (decodedPath.split("/").some((part) => part === "." || part === "..") || /[\\\\\u0000-\u0020]/.test(decodedPath)) return undefined;
    const base = new URL(documentationBaseUrl);
    const url = new URL(value, base);
    if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}

export function parseChangelogInline(source: string, documentationBaseUrl: string): ChangelogInline[] {
  const result: ChangelogInline[] = [];
  // Deliberately narrow syntax: this renderer does not accept raw HTML or embeds.
  const syntax = /`([^`\n]+)`|\[([^\]\n]+)\]\(([^)\n]+)\)/g;
  let cursor = 0;
  for (const match of source.matchAll(syntax)) {
    const index = match.index ?? 0;
    if (index > cursor) result.push({ kind: "text", value: source.slice(cursor, index) });
    if (match[1] !== undefined) {
      result.push({ kind: "code", value: match[1] });
    } else {
      const href = resolveChangelogLink(match[3] ?? "", documentationBaseUrl);
      if (href) result.push({ kind: "link", label: match[2] ?? "", href });
      else result.push({ kind: "text", value: match[0] });
    }
    cursor = index + match[0].length;
  }
  if (cursor < source.length) result.push({ kind: "text", value: source.slice(cursor) });
  return result;
}

export function parseChangelog(source: string, documentationBaseUrl: string): ChangelogDocument {
  const document: ChangelogDocument = { introduction: [], sections: [] };
  let blocks = document.introduction;
  let paragraph: string[] = [];
  let list: string[] = [];
  const inline = (value: string): ChangelogInline[] => parseChangelogInline(value, documentationBaseUrl);
  const flushParagraph = (): void => {
    if (paragraph.length) blocks.push({ kind: "paragraph", content: inline(paragraph.join(" ")) });
    paragraph = [];
  };
  const flushList = (): void => {
    if (list.length) blocks.push({ kind: "list", items: list.map(inline) });
    list = [];
  };
  const flush = (): void => { flushParagraph(); flushList(); };

  for (const line of source.replace(/\r\n?/g, "\n").split("\n")) {
    if (!line.trim()) { flush(); continue; }
    // The page supplies its own accessible document title.
    if (/^#\s+/.test(line)) { flush(); continue; }
    const sectionMatch = /^##\s+(.+)$/.exec(line);
    if (sectionMatch) {
      flush();
      const title = sectionMatch[1]!.trim();
      const release = /^(\d+\.\d+\.\d+)(?:\s+[—-]\s+(\d{4}-\d{2}-\d{2}))?$/.exec(title);
      const unreleased = title === "Не выпущено";
      const preferredId = release
        ? `project-release-${release[1]!.replace(/\./g, "-")}`
        : unreleased ? "project-unreleased" : `project-history-${document.sections.length + 1}`;
      const id = document.sections.some((section) => section.id === preferredId)
        ? `${preferredId}-${document.sections.length + 1}` : preferredId;
      const section: ChangelogSection = {
        id, title, unreleased, blocks: [],
        ...(release ? { version: release[1], ...(release[2] ? { date: release[2] } : {}) } : {})
      };
      document.sections.push(section);
      blocks = section.blocks;
      continue;
    }
    const heading = /^###\s+(.+)$/.exec(line);
    if (heading) {
      flush();
      blocks.push({ kind: "heading", content: inline(heading[1]!.trim()) });
      continue;
    }
    const bullet = /^[-*]\s+(.+)$/.exec(line);
    if (bullet) {
      flushParagraph();
      list.push(bullet[1]!.trim());
      continue;
    }
    if (/^\s+/.test(line) && list.length) {
      list[list.length - 1] = `${list[list.length - 1]} ${line.trim()}`;
      continue;
    }
    flushList();
    paragraph.push(line.trim());
  }
  flush();
  return document;
}
