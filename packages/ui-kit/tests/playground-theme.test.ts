import { beforeEach, afterEach, describe, expect, it } from "vitest";
import { createPlaygroundThemeUrl, isPlaygroundTheme, parsePlaygroundTheme, playgroundThemeOptions, withPlaygroundTheme } from "../../../apps/playground/src/themes";

import { playgroundLocale } from "../../../apps/playground/src/i18n/locale";

let previousLocale = playgroundLocale.value;
beforeEach(() => { previousLocale = playgroundLocale.value; playgroundLocale.value = "en"; });
afterEach(() => { playgroundLocale.value = previousLocale; });

describe("playground theme routes", () => {
  it("uses Gavia for a new visitor and invalid links", () => {
    expect(parsePlaygroundTheme("")).toBe("gavia");
    expect(parsePlaygroundTheme("?theme=unknown&view=docs")).toBe("gavia");
    expect(parsePlaygroundTheme("?theme=")).toBe("gavia");
    expect(isPlaygroundTheme({ toString: () => "white" })).toBe(false);
  });
  it("honours each shipped theme from a deep link", () => {
    for (const theme of ["gavia", "white", "graphite", "newspaper", "gavia-dark"] as const) {
      expect(isPlaygroundTheme(theme)).toBe(true);
      expect(parsePlaygroundTheme("?view=docs&section=colors&theme=" + theme)).toBe(theme);
    }
  });
  it("changes theme without losing the Pages route, anchor or unrelated parameters", () => {
    const current = new URL("https://example.test/gavia-ui/?view=docs&component=WlButton&theme=white&example=focus#docs-button-source-title");
    const target = createPlaygroundThemeUrl(current, "gavia");
    expect(target.href).toBe("https://example.test/gavia-ui/?view=docs&component=WlButton&theme=gavia&example=focus#docs-button-source-title");
    expect(current.searchParams.get("theme")).toBe("white");
    expect(parsePlaygroundTheme(target.search)).toBe("gavia");
  });
  it("offers all five named themes without losing existing choices", () => {
    expect(playgroundThemeOptions).toEqual([
      { value: "gavia", label: "Gavia" }, { value: "gavia-dark", label: "Gavia Dark" },
      { value: "white", label: "Classic" },
      { value: "graphite", label: "Classic Dark" }, { value: "newspaper", label: "Newspaper" }
    ]);
  });
  it.each(["en", "ru"] as const)("keeps the chosen theme and %s language in native query links with routes and anchors", (language) => {
    playgroundLocale.value = language;
    const href = "?view=docs&section=colors&theme=white#docs-colors-themes";
    const target = withPlaygroundTheme(href, "graphite");
    expect(target).toBe(`?view=docs&section=colors&theme=graphite&lang=${language}#docs-colors-themes`);
    const url = new URL(target, "https://example.test/gavia-ui/");
    expect(url.pathname).toBe("/gavia-ui/");
    expect(parsePlaygroundTheme(url.search)).toBe("graphite");
    expect(url.searchParams.get("lang")).toBe(language);
    expect(url.hash).toBe("#docs-colors-themes");
    expect(withPlaygroundTheme("?", "newspaper")).toBe(`?theme=newspaper&lang=${language}`);
    expect(withPlaygroundTheme("/gavia-ui/?view=docs&component=WlButton#api", "gavia")).toBe(`/gavia-ui/?view=docs&component=WlButton&theme=gavia&lang=${language}#api`);
    expect(href).toBe("?view=docs&section=colors&theme=white#docs-colors-themes");
  });
});
