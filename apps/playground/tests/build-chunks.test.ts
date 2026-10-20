// @vitest-environment node
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { assertPlaygroundEntryGraph, playgroundManualChunks } from "../build/chunks";

const appModule = (path: string): string => fileURLToPath(new URL(`../${path}`, import.meta.url));
const chunk = (fileName: string, overrides: Partial<Parameters<typeof assertPlaygroundEntryGraph>[0][number]> = {}) => ({
  fileName, isEntry: false, facadeModuleId: null, imports: [], dynamicImports: [], ...overrides
});
const entry = () => chunk("assets/index.js", { isEntry: true, facadeModuleId: appModule("index.html") });

describe("Playground shared runtime chunks", () => {
  it.each(["src/themes.ts", "src/preferences.ts", "src/i18n/locale.ts", "src/i18n/preload.ts", "src/navigation.ts", "src/page-loaders.ts"])("extracts the exact shared module %s", (path) => {
    expect(playgroundManualChunks(appModule(path))).toBe("playground-runtime");
  });

  it("extracts Vite's preload helper with the shared state", () => {
    expect(playgroundManualChunks("\0vite/preload-helper.js")).toBe("playground-runtime");
  });

  it("recognizes Windows paths and transformed queries", () => {
    expect(playgroundManualChunks(appModule("src/themes.ts").replace(/\//g, "\\") + "?import")).toBe("playground-runtime");
  });

  it("leaves application startup, catalogs, components and unrelated names automatic", () => {
    for (const path of ["src/main.ts", "src/bootstrap.ts", "src/App.vue", "src/i18n/index.ts", "src/i18n/messages/shell.en.json", "src/nested/themes.ts", "src/themes.ts.extra"]) {
      expect(playgroundManualChunks(appModule(path))).toBeUndefined();
    }
    expect(playgroundManualChunks("virtual:vite/preload-helper.js")).toBeUndefined();
  });
});

describe("Playground application entry graph", () => {
  it("accepts lazy pages sharing a runtime without importing the HTML entry", () => {
    expect(() => assertPlaygroundEntryGraph([
      entry(), chunk("assets/runtime.js"), chunk("assets/DocsPage.js", { imports: ["assets/runtime.js"] })
    ])).not.toThrow();
  });

  it("rejects the static lazy-page back-edge that caused late entry preloads", () => {
    expect(() => assertPlaygroundEntryGraph([
      entry(), chunk("assets/DocsPage.js", { imports: ["assets/index.js"] })
    ])).toThrow("Playground chunk assets/DocsPage.js imports HTML entry assets/index.js");
  });

  it("checks other HTML entries as consumers too", () => {
    expect(() => assertPlaygroundEntryGraph([
      entry(), chunk("assets/e2e.js", { isEntry: true, facadeModuleId: appModule("e2e.html"), imports: ["assets/index.js"] })
    ])).toThrow("assets/e2e.js imports HTML entry assets/index.js");
  });

  it("rejects a dynamic import that would execute the HTML application entry", () => {
    expect(() => assertPlaygroundEntryGraph([
      entry(), chunk("assets/DocsPage.js", { dynamicImports: ["assets/index.js"] })
    ])).toThrow("assets/DocsPage.js imports HTML entry assets/index.js");
  });

  it("allows ordinary JavaScript entry chunks to provide shared code", () => {
    expect(() => assertPlaygroundEntryGraph([
      chunk("assets/runtime.js", { isEntry: true, facadeModuleId: appModule("src/runtime.ts") }),
      chunk("assets/DocsPage.js", { imports: ["assets/runtime.js"] })
    ])).not.toThrow();
  });
});
