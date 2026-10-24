/** Legacy query routes and canonical paths share the same page contract. */
export type PlaygroundView = "home" | "docs" | "components" | "system" | "project" | "theme-builder" | "font";
export type DocumentationFoundationSection = "typography" | "layout" | "responsive" | "content";
export type DocumentationAssetSection = "icons" | "colors";
export type DocumentationQualitySection = "quality";
export type DocumentationGuideSection = "why" | "theming" | "recipes" | "accessibility" | "how-it-is-built";
export type DocumentationSection = DocumentationFoundationSection | DocumentationAssetSection
  | DocumentationQualitySection | DocumentationGuideSection;
export interface PlaygroundRoute {
  view: PlaygroundView;
  component?: string;
  /** Docs-only; a recognized section takes precedence over a component. */
  section?: DocumentationSection;
}

/** Preserve bookmarks to the 0.x component name after its public 1.0 rename. */
function canonicalComponentName(name: string): string {
  return name === "WlTooltipComponent" ? "WlTooltip" : name;
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
  return isDocumentationFoundationSection(value) || isDocumentationAssetSection(value)
    || isDocumentationQualitySection(value) || isDocumentationGuideSection(value);
}

export function isDocumentationGuideSection(value: unknown): value is DocumentationGuideSection {
  return value === "why" || value === "theming" || value === "recipes" || value === "accessibility" || value === "how-it-is-built";
}

/** The former gallery URL stays usable after its examples move into Docs. */
export function parsePlaygroundRoute(search: string, hash = "", pathname = ""): PlaygroundRoute {
  const query = new URLSearchParams(search);
  // Query selectors remain authoritative for old shared links, even on a path.
  if (!query.has("view") && pathname) {
    const match = /\/(docs|components|system|changelog|project|theme-builder|font)(?:\/(.*))?$/.exec(pathname);
    if (match) {
      const view = match[1] === "changelog" || match[1] === "project" ? "project" : match[1] === "components" ? "docs" : match[1] as PlaygroundView;
      if (view !== "docs") return { view };
      let detail = match[2]?.replace(/\/$/, "") ?? "";
      try {
        detail = decodeURIComponent(detail);
      } catch { return { view }; }
      if (isDocumentationSection(detail)) return { view, section: detail };
      const component = /^(?:components\/)?(Wl[A-Za-z0-9]+)$/.exec(detail)?.[1];
      return component ? { view, component: canonicalComponentName(component) } : { view };
    }
  }
  const candidate = query.get("view");
  const view: PlaygroundView = candidate === "changelog"
    ? "project"
    : candidate === "components"
      ? "docs"
      : candidate === "docs" || candidate === "system" || candidate === "project" || candidate === "theme-builder" || candidate === "font" ? candidate : "home";
  if (view !== "docs") return { view };
  const section = query.get("section");
  if (isDocumentationSection(section)) return { view, section };
  const component = query.get("component") || undefined;
  if (component) return { view, component: canonicalComponentName(component) };
  if (candidate === "components") {
    let fragment = "";
    try {
      fragment = decodeURIComponent(hash.replace(/^#/, ""));
    } catch { /* Ignore malformed fragments. */ }
    const match = /^component-(Wl[A-Za-z0-9]+)$/.exec(fragment);
    if (match) return { view, component: canonicalComponentName(match[1]!) };
    if (fragment === "pg-colors") return { view, section: "colors" };
    if (fragment === "pg-icons") return { view, section: "icons" };
  }
  return { view };
}

/** Resolve the deployment directory without treating a documentation path as a base. */
export function playgroundBasePath(pathname: string, configuredBase?: string): string {
  if (configuredBase?.startsWith("/")) return configuredBase.replace(/\/?$/, "/");
  const routeStart = /\/(?:docs|components|system|changelog|project|theme-builder|font)(?:\/|$)/.exec(pathname);
  const base = routeStart ? pathname.slice(0, routeStart.index + 1) : pathname.endsWith("/") ? pathname : pathname.replace(/[^/]*$/, "");
  return base.replace(/\/(?:ru|en)\/$/, "/");
}

/** Canonical links preserve preferences and work below any configured Vite base. */
export function createPlaygroundPathUrl(
  current: URL,
  route: PlaygroundRoute,
  options: { base?: string; pinHomeLocale?: boolean } = {}
): URL {
  const target = createPlaygroundUrl(current, route);
  const view = route.view === "components" ? "docs" : route.view;
  const segment = view === "home" ? "" : view === "project" ? "changelog" : view;
  const detail = view === "docs"
    ? isDocumentationSection(route.section)
      ? `/${route.section}`
      : route.component ? `/components/${encodeURIComponent(canonicalComponentName(route.component))}` : ""
    : "";
  const language = current.searchParams.get("lang") ?? (/\/ru(?:\/|$)/.test(current.pathname) ? "ru" : "en");
  target.pathname = playgroundBasePath(current.pathname, options.base) + (language === "ru" ? "ru/" : "") + segment + detail + (segment ? "/" : "");
  for (const key of ["view", "component", "section"]) target.searchParams.delete(key);
  target.searchParams.delete("lang");
  // The English home has no language segment. Pin its visit so Back restores
  // English after a later choice changes the saved preference.
  if (options.pinHomeLocale && view === "home" && language === "en") target.searchParams.set("lang", "en");
  return target;
}

/** Portable archives keep query links; hosted documentation uses stable paths. */
export function createPlaygroundNavigationUrl(current: URL, route: PlaygroundRoute, base = import.meta.env.BASE_URL): URL {
  if (!base.startsWith("/")) return createPlaygroundUrl(current, route);
  return createPlaygroundPathUrl(current, route, { base, pinHomeLocale: true });
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
    else if (route.component) target.searchParams.set("component", canonicalComponentName(route.component));
  }
  target.hash = "";
  return target;
}
