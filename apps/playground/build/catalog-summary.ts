import type { Plugin } from "vite";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

/** Home needs counts and color schemes, rather than the complete token catalogue. */
export function playgroundCatalogSummary(): Plugin {
  const source = fileURLToPath(new URL("../../../packages/ui-kit/tokens/catalog.generated.json", import.meta.url));
  const id = "\0gavia-catalog-summary";
  return {
    name: "gavia-catalog-summary",
    resolveId(request) { if (request === "virtual:gavia-catalog-summary") return id; },
    async load(request) {
      if (request !== id) return;
      this.addWatchFile(source);
      const catalog = JSON.parse(await readFile(source, "utf8")) as {
        tokens: unknown[]; themes: { name: string; label: string; colorScheme: string }[];
      };
      return "export default " + JSON.stringify({ tokenCount: catalog.tokens.length, themeCount: catalog.themes.length,
        themes: catalog.themes.map(({ name, label, colorScheme }) => ({ name, label, colorScheme })),
        themeColorSchemes: Object.fromEntries(catalog.themes.map((theme) => [theme.name, theme.colorScheme])) }) + ";";
    }
  };
}
