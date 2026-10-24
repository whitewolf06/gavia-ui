// @vitest-environment node
import { readFileSync } from "node:fs";
import { fileURLToPath, URL as NodeURL } from "node:url";
import { describe, expect, it } from "vitest";

// jsdom's global URL is not a native Node filesystem URL.
function readStyle(url: NodeURL, seen = new Set<string>()): string {
  if (seen.has(url.href)) throw new Error(`Cyclic CSS import: ${url.href}`);
  const next = new Set(seen).add(url.href);
  return readFileSync(fileURLToPath(url), "utf8").replace(/@import\s+["'](\.[^"']+)["'];/g,
    (_, path: string) => readStyle(new NodeURL(path, url), next));
}
const cssSources: Record<string, string> = Object.fromEntries(
  [
    "../../styles/base.css",
    "../../styles/primitives.css",
    "../../styles/reset.css",
    "../../themes/white.css",
    "../../themes/graphite.css",
    "../../themes/newspaper.css",
    "../../themes/gavia.css",
    "../../themes/gavia-dark.css"
  ].map((file) => [file, readStyle(new NodeURL(file, import.meta.url))])
);

function topLevelBlockHeaders(source: string): string[] {
  const css = source.replace(/\/\*[\s\S]*?\*\//g, "");
  const headers: string[] = [];
  let depth = 0;
  let tokenStart = 0;

  for (let index = 0; index < css.length; index += 1) {
    const char = css[index];
    if (char === "{" && depth === 0) {
      headers.push(css.slice(tokenStart, index).trim());
      depth = 1;
    } else if (char === "{" && depth > 0) {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) tokenStart = index + 1;
    } else if (char === ";" && depth === 0) {
      tokenStart = index + 1;
    }
  }

  return headers.filter(Boolean);
}

describe("CSS public contract", () => {
  it("keeps every custom property in the --wl-* namespace", () => {
    for (const [file, source] of Object.entries(cssSources)) {
      const declarations = [
        ...source.matchAll(/(?<![\w-])(--[\w-]+)\s*:/g)
      ];
      const references = [...source.matchAll(/var\(\s*(--[\w-]+)/g)];
      const names = [...declarations, ...references].map((match) => match[1]!);
      expect(names.length, `${file}: expected token declarations or references`).toBeGreaterThan(0);
      for (const name of names) {
        expect(name, `${file}: non-namespaced custom property`).toMatch(/^--wl-/);
      }
    }
  });

  it("does not use !important in kit styles", () => {
    for (const [file, source] of Object.entries(cssSources)) {
      expect(source, `${file}: !important breaks consumer overrides`).not.toMatch(/!important\b/);
    }
  });

  it("keeps reset, tokens and components in their declared cascade layers", () => {
    const base = cssSources["../../styles/base.css"]!;
    const reset = cssSources["../../styles/reset.css"]!;
    expect(base).toContain("@layer wl.reset, wl.tokens, wl.components;");
    expect(topLevelBlockHeaders(base).every((header) => /^@layer wl\.(?:tokens|components)$/.test(header))).toBe(true);
    expect(topLevelBlockHeaders(reset)).toEqual(["@layer wl.reset"]);
    expect(topLevelBlockHeaders(cssSources["../../styles/primitives.css"]!)).toEqual(["@layer wl.components"]);

    for (const [file, source] of Object.entries(cssSources)) {
      if (!file.includes("/themes/")) continue;
      expect(topLevelBlockHeaders(source), `${file}: theme must only override tokens`).toEqual([
        "@layer wl.tokens"
      ]);
    }
  });

  it("keeps stable wl-* class names and low-specificity component selectors", () => {
    const base = cssSources["../../styles/base.css"]!;
    const classNames = [
      ...base.matchAll(/(?<![\w-])\.([A-Z_][\w-]*)/gi)
    ].map((match) => match[1]!);
    expect(classNames.length).toBeGreaterThan(0);
    for (const className of classNames) {
      expect(className, "base.css: class must use wl-* or state namespace").toMatch(
        /^(wl-|is-)/
      );
    }

    const selectors = base
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .match(/[^{}]+(?=\{)/g)
      ?.map((selector) => selector.trim())
      .filter((selector) => selector.startsWith(".")) ?? [];
    for (const selector of selectors) {
      const ids = selector.match(/#[A-Z_][\w-]*/gi) ?? [];
      expect(ids, `base.css: ID selectors are not allowed (${selector})`).toHaveLength(0);
    }
  });
});
