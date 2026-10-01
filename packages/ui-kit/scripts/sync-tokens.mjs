import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { renderThemeCss, renderTokenCss, renderTokenModule, renderPrimitiveCss, validateCatalog } from "./token-tools.mjs";

const root = new URL("../", import.meta.url);
const catalog = JSON.parse(readFileSync(new URL("tokens/source.json", root), "utf8"));
const contrast = validateCatalog(catalog);
const baseUrl = new URL("styles/base.css", root);
const base = readFileSync(baseUrl, "utf8");
const marker = /\/\* @wl-tokens:start[\s\S]*?\/\* @wl-tokens:end \*\//;
if (!marker.test(base)) throw new Error("base.css is missing token generation markers");
const outputs = [
  [baseUrl, base.replace(marker, renderTokenCss(catalog))],
  [new URL("styles/primitives.css", root), renderPrimitiveCss(catalog)],
  [new URL("src/design-system/tokens.generated.ts", root), renderTokenModule(catalog, contrast)],
  [new URL("tokens/catalog.generated.json", root), `${JSON.stringify({ ...catalog, contrastReport: contrast }, null, 2)}\n`],
  ...catalog.themes.map((theme) => [new URL(`themes/${theme.name}.css`, root), renderThemeCss(catalog, theme)])
];
const check = process.argv.includes("--check");
for (const [url, content] of outputs) {
  if (check) {
    let actual;
    try { actual = readFileSync(url, "utf8"); } catch { /* report the stale file below */ }
    if (actual !== content) throw new Error(`Generated token file is stale: ${fileURLToPath(url)}. Run pnpm tokens:sync.`);
  } else writeFileSync(url, content, "utf8");
}
console.log(`Design tokens ${check ? "verified" : "synchronized"}: ${catalog.tokens.length} tokens, ${catalog.themes.length} themes, ${contrast.length} passing contrast pairs`);
