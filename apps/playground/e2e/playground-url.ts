/** Legacy Russian workflows opt in explicitly; unqualified product URLs still default to English. */
export function russianPlaygroundUrl(input: string): string {
  const absolute = /^[a-z][a-z0-9+.-]*:/i.test(input);
  const url = new URL(input, "http://playground.invalid/");
  url.searchParams.set("lang", "ru");
  // Relative URLs keep Playwright's configured origin and the existing Pages prefix.
  return absolute ? url.href : url.pathname + url.search + url.hash;
}

/** Inspect route meaning for both canonical hosted paths and portable query links. */
export function playgroundRouteParams(url: URL): URLSearchParams {
  const params = new URLSearchParams(url.search);
  const match = /\/(docs|system|font|theme-builder|changelog)(?:\/(.*))?$/.exec(url.pathname);
  if (!params.has("view") && match) {
    params.set("view", match[1]!);
    const detail = decodeURIComponent(match[2]?.replace(/\/$/, "") ?? "");
    if (match[1] === "docs" && detail) {
      if (detail.startsWith("components/")) params.set("component", detail.slice("components/".length));
      else params.set("section", detail);
    }
  }
  if (!params.has("lang")) params.set("lang", /\/ru(?:\/|$)/.test(url.pathname) ? "ru" : "en");
  return params;
}

/** Canonical paths must retain the deployment directory while selecting a route. */
export function playgroundBasePath(url: URL): string {
  const route = /\/(?:docs|system|font|theme-builder|changelog)(?:\/|$)/.exec(url.pathname);
  const path = route ? url.pathname.slice(0, route.index + 1) : url.pathname;
  return path.replace(/\/(?:ru|en)\/$/, "/");
}
