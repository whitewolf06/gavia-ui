import { describe, expect, it } from "vitest";
import { playgroundBasePath, playgroundRouteParams } from "../e2e/playground-url";

describe("browser route expectations", () => {
  it("reads canonical Russian component paths below a deployment prefix", () => {
    const url = new URL("https://example.test/gavia-ui/ru/docs/components/WlSelect/?theme=graphite#docs-wlselect-props");
    const params = playgroundRouteParams(url);
    expect(params.get("view")).toBe("docs");
    expect(params.get("component")).toBe("WlSelect");
    expect(params.get("section")).toBeNull();
    expect(params.get("lang")).toBe("ru");
    expect(params.get("theme")).toBe("graphite");
    expect(playgroundBasePath(url)).toBe("/gavia-ui/");
    expect(url.searchParams.has("component")).toBe(false);
  });

  it("keeps portable query routes and filenames intact", () => {
    const url = new URL("https://example.test/archive/index.html?view=docs&section=quality&lang=ru");
    expect(playgroundRouteParams(url).get("section")).toBe("quality");
    expect(playgroundRouteParams(url).get("lang")).toBe("ru");
    expect(playgroundBasePath(url)).toBe("/archive/index.html");
  });

  it("reads English canonical guides and unqualified home routes", () => {
    const url = new URL("https://example.test/docs/theming/?example=palette");
    const params = playgroundRouteParams(url);
    expect(params.get("section")).toBe("theming");
    expect(params.get("lang")).toBe("en");
    expect(playgroundRouteParams(new URL("https://example.test/ru/")).get("view")).toBeNull();
    expect(playgroundBasePath(new URL("https://example.test/ru/"))).toBe("/");
  });
});
