// @vitest-environment node
import { expect, it } from "vitest";
import { createPlaygroundNavigationUrl, createPlaygroundPathUrl, parsePlaygroundRoute, playgroundBasePath } from "../src/navigation";

it("keeps old tooltip bookmarks usable while writing the canonical component name", () => {
  const route = { view: "docs", component: "WlTooltip" } as const;
  expect(parsePlaygroundRoute("?view=docs&component=WlTooltipComponent")).toEqual(route);
  expect(parsePlaygroundRoute("", "", "/gavia-ui/ru/docs/components/WlTooltipComponent/")).toEqual(route);
  expect(parsePlaygroundRoute("?view=components", "#component-WlTooltipComponent")).toEqual(route);
  const current = new URL("https://example.test/gavia-ui/?view=docs&component=WlTooltipComponent&lang=ru&theme=gavia");
  expect(createPlaygroundNavigationUrl(current, { view: "docs", component: "WlTooltipComponent" }, "/gavia-ui/").href)
    .toBe("https://example.test/gavia-ui/ru/docs/components/WlTooltip/?theme=gavia");
  expect(createPlaygroundNavigationUrl(current, { view: "docs", component: "WlTooltipComponent" }, "./").searchParams.get("component"))
    .toBe("WlTooltip");
});

it("round trips every page below the Pages directory and preserves preferences", () => {
  const current = new URL("https://example.test/gavia-ui/docs/components/WlInput/?theme=graphite&lang=ru#old");
  for (const route of [{ view: "home" }, { view: "font" }, { view: "system" }, { view: "project" },
    { view: "theme-builder" }, { view: "docs" }, { view: "docs", component: "WlSelect" },
    { view: "docs", section: "theming" }, { view: "docs", section: "quality" }] as const) {
    const target = createPlaygroundPathUrl(current, route);
    expect(target.pathname.startsWith("/gavia-ui/")).toBe(true);
    expect(target.searchParams.get("theme")).toBe("graphite");
    expect(target.pathname.startsWith("/gavia-ui/ru/")).toBe(true);
    expect(target.searchParams.get("lang")).toBeNull();
    expect(target.searchParams.has("view")).toBe(false);
    expect(target.hash).toBe("");
    expect(parsePlaygroundRoute(target.search, target.hash, target.pathname)).toEqual(route);
  }
  expect(current.hash).toBe("#old");
});

it("keeps portable archives on query routes and uses the configured hosted base for unknown paths", () => {
  const portable = createPlaygroundNavigationUrl(new URL("https://example.test/archive/index.html?lang=ru&theme=white"), { view: "docs", component: "WlSelect" }, "./");
  expect(portable.pathname).toBe("/archive/index.html");
  expect(portable.searchParams.get("view")).toBe("docs");
  expect(portable.searchParams.get("component")).toBe("WlSelect");
  expect(portable.searchParams.get("lang")).toBe("ru");
  const hosted = createPlaygroundNavigationUrl(new URL("https://example.test/gavia-ui/missing/"), { view: "docs" }, "/gavia-ui/");
  expect(hosted.pathname).toBe("/gavia-ui/docs/");
});

it("pins the English home visit without adding a language query to canonical SEO links", () => {
  const english = new URL("https://example.test/gavia-ui/docs/?lang=en");
  expect(createPlaygroundNavigationUrl(english, { view: "home" }, "/gavia-ui/").searchParams.get("lang")).toBe("en");
  expect(createPlaygroundPathUrl(english, { view: "home" }, { base: "/gavia-ui/" }).href).toBe("https://example.test/gavia-ui/");
});

it("keeps old query links authoritative and creates canonical component paths", () => {
  const current = new URL("https://example.test/gavia-ui/?view=components&theme=white#component-WlTabs");
  const legacy = parsePlaygroundRoute(current.search, current.hash, current.pathname);
  expect(legacy).toEqual({ view: "docs", component: "WlTabs" });
  expect(createPlaygroundPathUrl(current, legacy).href).toBe("https://example.test/gavia-ui/docs/components/WlTabs/?theme=white");
  expect(parsePlaygroundRoute("?view=font", "", "/gavia-ui/docs/")).toEqual({ view: "font" });
  expect(playgroundBasePath("/preview/docs/recipes/")).toBe("/preview/");
  expect(playgroundBasePath("/docs/")).toBe("/");
});
