// @vitest-environment node
import { describe, expect, it } from "vitest";
import { createPlaygroundUrl, isDocumentationAssetSection, isDocumentationFoundationSection, isDocumentationQualitySection, isDocumentationSection, parsePlaygroundRoute } from "../../../apps/playground/src/navigation";

describe("playground query navigation", () => {
  it("opens the font page under Pages while preserving theme and clearing Docs selectors", () => {
    const current = new URL("https://example.test/gavia-ui/?theme=newspaper&view=docs&component=WlButton&section=layout#old");
    const target = createPlaygroundUrl(current, { view: "font" });
    expect(target.href).toBe("https://example.test/gavia-ui/?theme=newspaper&view=font");
    expect(parsePlaygroundRoute(target.search, "#wl-type-weights")).toEqual({ view: "font" });
    expect(parsePlaygroundRoute("?view=font&component=WlButton&section=layout")).toEqual({ view: "font" });
    expect(current.hash).toBe("#old");
  });
  it("opens the theme builder under Pages and clears Docs-specific selectors", () => {
    const current = new URL("https://example.test/gavia-ui/?theme=graphite&view=docs&component=WlButton&section=layout#old");
    const target = createPlaygroundUrl(current, { view: "theme-builder" });
    expect(target.href).toBe("https://example.test/gavia-ui/?theme=graphite&view=theme-builder");
    expect(parsePlaygroundRoute(target.search)).toEqual({ view: "theme-builder" });
    expect(current.hash).toBe("#old");
  });
  it("uses the canonical changelog URL while keeping old project deep links", () => {
    expect(parsePlaygroundRoute("?view=changelog")).toEqual({ view: "project" });
    expect(parsePlaygroundRoute("?view=project")).toEqual({ view: "project" });
    const current = new URL("https://example.test/gavia-ui/?theme=graphite&view=docs&section=layout#grid");
    const history = createPlaygroundUrl(current, { view: "project" });
    expect(history.href).toBe("https://example.test/gavia-ui/?theme=graphite&view=changelog");
    expect(parsePlaygroundRoute(history.search)).toEqual({ view: "project" });
    expect(current.hash).toBe("#grid");
  });
  it("opens home by default and redirects the former gallery into Docs", () => {
    expect(parsePlaygroundRoute("")).toEqual({ view: "home" });
    expect(parsePlaygroundRoute("?view=unknown")).toEqual({ view: "home" });
    for (const view of ["system", "project", "theme-builder", "font"] as const) {
      expect(parsePlaygroundRoute(`?view=${view}&component=WlButton`)).toEqual({ view });
    }
  });
  it("distinguishes the docs overview from a component deep link", () => {
    expect(parsePlaygroundRoute("?view=docs")).toEqual({ view: "docs" });
    expect(parsePlaygroundRoute("?view=docs&component=WlButton")).toEqual({ view: "docs", component: "WlButton" });
    expect(parsePlaygroundRoute("?view=docs&component=")).toEqual({ view: "docs" });
  });
  it("keeps the Pages subpath and unrelated query parameters across view changes", () => {
    const current = new URL("https://example.test/gavia-ui/?theme=graphite&view=project#project-changelog");
    const docs = createPlaygroundUrl(current, { view: "docs", component: "WlButton" });
    expect(docs.pathname).toBe("/gavia-ui/");
    expect(docs.searchParams.get("theme")).toBe("graphite");
    expect(docs.hash).toBe("");
    expect(parsePlaygroundRoute(docs.search)).toEqual({ view: "docs", component: "WlButton" });
    const gallery = createPlaygroundUrl(docs, { view: "components" });
    expect(gallery.searchParams.get("component")).toBeNull();
    expect(parsePlaygroundRoute(gallery.search)).toEqual({ view: "docs" });
    const home = createPlaygroundUrl(docs, { view: "home" });
    expect(home.searchParams.get("view")).toBeNull();
    expect(home.searchParams.get("component")).toBeNull();
    expect(home.searchParams.get("theme")).toBe("graphite");
    expect(current.hash).toBe("#project-changelog");
  });
  it("accepts known docs sections and normalizes conflicting component fields", () => {
    for (const section of ["typography", "layout", "responsive", "content", "icons", "colors", "quality"] as const) {
      expect(parsePlaygroundRoute("?view=docs&section=" + section)).toEqual({ view: "docs", section });
      expect(parsePlaygroundRoute("?view=docs&section=" + section + "&component=WlButton")).toEqual({ view: "docs", section });
      for (const view of ["home", "system", "project"]) {
        expect(parsePlaygroundRoute("?view=" + view + "&section=" + section + "&component=WlButton")).toEqual({ view });
      }
    }
    expect(parsePlaygroundRoute("?view=docs&section=unknown")).toEqual({ view: "docs" });
    expect(parsePlaygroundRoute("?view=docs&section=unknown&component=WlButton")).toEqual({ view: "docs", component: "WlButton" });
  });
  it("keeps asset routes separate from foundations and preserves Pages deep links", () => {
    for (const section of ["icons", "colors"] as const) {
      expect(isDocumentationSection(section)).toBe(true);
      expect(isDocumentationAssetSection(section)).toBe(true);
      expect(isDocumentationFoundationSection(section)).toBe(false);
      const url = createPlaygroundUrl(new URL("https://example.test/gavia-ui/?theme=graphite&view=docs&component=WlIcon#old"), { view: "docs", section });
      expect(url.pathname).toBe("/gavia-ui/");
      expect(url.searchParams.get("theme")).toBe("graphite");
      expect(url.searchParams.get("component")).toBeNull();
      expect(url.hash).toBe("");
      expect(parsePlaygroundRoute(url.search)).toEqual({ view: "docs", section });
    }
    expect(isDocumentationAssetSection("typography")).toBe(false);
    expect(isDocumentationFoundationSection("layout")).toBe(true);
    expect(isDocumentationFoundationSection("responsive")).toBe(true);
    expect(isDocumentationAssetSection("responsive")).toBe(false);
    expect(isDocumentationSection("unknown")).toBe(false);
  });
  it("opens responsiveness under the Pages subpath and clears a former component", () => {
    const current = new URL("https://example.test/gavia-ui/?theme=graphite&view=docs&component=WlSidebar#old");
    const target = createPlaygroundUrl(current, { view: "docs", section: "responsive" });
    expect(target.href).toBe("https://example.test/gavia-ui/?theme=graphite&view=docs&section=responsive");
    expect(parsePlaygroundRoute(target.search)).toEqual({ view: "docs", section: "responsive" });
    expect(current.hash).toBe("#old");
    expect(current.searchParams.get("component")).toBe("WlSidebar");
  });
  it("clears stale docs selectors while preserving theme, Pages base and input URL", () => {
    const current = new URL("https://example.test/gavia-ui/?theme=newspaper&view=docs&component=WlButton#old");
    const foundations = createPlaygroundUrl(current, { view: "docs", section: "layout" });
    expect(foundations.pathname).toBe("/gavia-ui/");
    expect(foundations.searchParams.get("theme")).toBe("newspaper");
    expect(foundations.searchParams.get("component")).toBeNull();
    expect(foundations.hash).toBe("");
    expect(parsePlaygroundRoute(foundations.search)).toEqual({ view: "docs", section: "layout" });
    const component = createPlaygroundUrl(foundations, { view: "docs", component: "WlButton" });
    expect(component.searchParams.get("section")).toBeNull();
    expect(parsePlaygroundRoute(component.search)).toEqual({ view: "docs", component: "WlButton" });
    const overview = createPlaygroundUrl(foundations, { view: "docs" });
    expect(overview.searchParams.get("section")).toBeNull();
    expect(overview.searchParams.get("component")).toBeNull();
    for (const view of ["home", "components", "system", "project", "theme-builder", "font"] as const) {
      const destination = createPlaygroundUrl(foundations, { view });
      expect(destination.searchParams.get("section")).toBeNull();
      expect(destination.searchParams.get("component")).toBeNull();
      expect(destination.searchParams.get("theme")).toBe("newspaper");
    }
    expect(current.searchParams.get("component")).toBe("WlButton");
    expect(current.hash).toBe("#old");
  });
  it("preserves legacy gallery component and asset deep links without changing other routes", () => {
    expect(parsePlaygroundRoute("?view=components")).toEqual({ view: "docs" });
    expect(parsePlaygroundRoute("?view=components", "#component-WlTimePicker")).toEqual({ view: "docs", component: "WlTimePicker" });
    expect(parsePlaygroundRoute("?view=components", "#pg-colors")).toEqual({ view: "docs", section: "colors" });
    expect(parsePlaygroundRoute("?view=components", "#pg-icons")).toEqual({ view: "docs", section: "icons" });
    expect(parsePlaygroundRoute("?view=components", "#%E0%A4%A")).toEqual({ view: "docs" });
    expect(parsePlaygroundRoute("?view=components&component=WlSelect", "#component-WlTimePicker")).toEqual({ view: "docs", component: "WlSelect" });
    expect(parsePlaygroundRoute("?view=components&section=icons", "#component-WlTimePicker")).toEqual({ view: "docs", section: "icons" });
    expect(parsePlaygroundRoute("?view=system", "#component-WlTimePicker")).toEqual({ view: "system" });
    const current = new URL("https://example.test/gavia-ui/?view=components&theme=graphite#component-WlTimePicker");
    const canonical = createPlaygroundUrl(current, parsePlaygroundRoute(current.search, current.hash));
    expect(canonical.href).toBe("https://example.test/gavia-ui/?view=docs&theme=graphite&component=WlTimePicker");
    expect(current.hash).toBe("#component-WlTimePicker");
    expect(createPlaygroundUrl(current, { view: "components", component: "WlSelect" }).searchParams.get("view")).toBe("docs");
  });
  it("keeps quality deep links distinct from examples and preserves the selected theme", () => {
    expect(isDocumentationQualitySection("quality")).toBe(true);
    expect(isDocumentationSection("quality")).toBe(true);
    expect(isDocumentationFoundationSection("quality")).toBe(false);
    expect(isDocumentationAssetSection("quality")).toBe(false);
    expect(isDocumentationQualitySection("layout")).toBe(false);
    const current = new URL("https://example.test/gavia-ui/?view=docs&theme=newspaper&component=WlInput#old");
    const quality = createPlaygroundUrl(current, { view: "docs", section: "quality" });
    expect(quality.href).toBe("https://example.test/gavia-ui/?view=docs&theme=newspaper&section=quality");
    expect(parsePlaygroundRoute(quality.search)).toEqual({ view: "docs", section: "quality" });
    expect(parsePlaygroundRoute(quality.search + "&component=WlInput")).toEqual({ view: "docs", section: "quality" });
    expect(createPlaygroundUrl(quality, { view: "docs" }).searchParams.has("section")).toBe(false);
    expect(current.hash).toBe("#old");
    expect(current.searchParams.get("component")).toBe("WlInput");
  });

});
