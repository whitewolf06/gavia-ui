/** Query routes work on both the local origin and the GitHub Pages subpath. */
export type PlaygroundView = "home" | "docs" | "components" | "system" | "project" | "theme-builder" | "font";
export type DocumentationFoundationSection = "typography" | "layout" | "responsive" | "content";
export type DocumentationAssetSection = "icons" | "colors";
export type DocumentationQualitySection = "quality";
export type DocumentationSection = DocumentationFoundationSection | DocumentationAssetSection | DocumentationQualitySection;
export interface PlaygroundRoute {
  view: PlaygroundView;
  component?: string;
  /** Docs-only; a recognized section takes precedence over a component. */
  section?: DocumentationSection;
}

export function isDocumentationFoundationSection(value: unknown): value is DocumentationFoundationSection {
  return value === "typography" || value === "layout" || value === "responsive" || value === "content";
}

export function isDocumentationAssetSection(value: unknown): value is DocumentationAssetSection {
  return value === "icons" || value === "colors";
}

export function isDocumentationQualitySection(value: unknown): value is DocumentationQualitySection {
  return value === "quality";
}

export function isDocumentationSection(value: unknown): value is DocumentationSection {
  return isDocumentationFoundationSection(value) || isDocumentationAssetSection(value) || isDocumentationQualitySection(value);
}

/** The former gallery URL stays usable after its examples move into Docs. */
export function parsePlaygroundRoute(search: string, hash = ""): PlaygroundRoute {
  const query = new URLSearchParams(search);
  const candidate = query.get("view");
  const view: PlaygroundView = candidate === "changelog" ? "project"
    : candidate === "components" ? "docs"
    : candidate === "docs" || candidate === "system" || candidate === "project" || candidate === "theme-builder" || candidate === "font" ? candidate : "home";
  if (view !== "docs") return { view };
  const section = query.get("section");
  if (isDocumentationSection(section)) return { view, section };
  const component = query.get("component") || undefined;
  if (component) return { view, component };
  if (candidate === "components") {
    let fragment = "";
    try { fragment = decodeURIComponent(hash.replace(/^#/, "")); } catch { /* Ignore malformed fragments. */ }
    const match = /^component-(Wl[A-Za-z0-9]+)$/.exec(fragment);
    if (match) return { view, component: match[1] };
    if (fragment === "pg-colors") return { view, section: "colors" };
    if (fragment === "pg-icons") return { view, section: "icons" };
  }
  return { view };
}

export function createPlaygroundUrl(current: URL, route: PlaygroundRoute): URL {
  const target = new URL(current.href);
  const view = route.view === "components" ? "docs" : route.view;
  if (view === "home") target.searchParams.delete("view");
  else target.searchParams.set("view", view === "project" ? "changelog" : view);
  target.searchParams.delete("component");
  target.searchParams.delete("section");
  if (view === "docs") {
    if (isDocumentationSection(route.section)) target.searchParams.set("section", route.section);
    else if (route.component) target.searchParams.set("component", route.component);
  }
  target.hash = "";
  return target;
}
