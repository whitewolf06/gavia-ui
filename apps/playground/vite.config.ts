import vue from "@vitejs/plugin-vue";
import { existsSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import { playgroundCatalogSummary } from "./build/catalog-summary";
import { playgroundChunkGraph, playgroundManualChunks } from "./build/chunks";
import { gaviaFontDownload } from "./build/font-download";
import { playgroundI18nPlugins } from "./build/i18n";
import { gaviaSeoAssets } from "./build/seo-assets";

const source = (path: string) => fileURLToPath(new URL(`../../packages/ui-kit/src/${path}`, import.meta.url));

// Exact matches preserve CSS/font/JSON package exports. Optional public utility
// entries become available when implemented, without exposing arbitrary internals.
export const playgroundSourceAliases = [
  { find: /^gavia-ui$/, replacement: source("index.ts") },
  ...["utils", "composables"].flatMap((entry) => existsSync(source(`${entry}/index.ts`))
    ? [{ find: new RegExp(`^gavia-ui/${entry}$`), replacement: source(`${entry}/index.ts`) }]
    : [])
];

export default defineConfig({
  plugins: [vue(), ...playgroundI18nPlugins(), playgroundCatalogSummary(), gaviaFontDownload(), gaviaSeoAssets(), playgroundChunkGraph()],
  // Source aliases provide HMR; installed-archive checks separately validate dist.
  resolve: { alias: playgroundSourceAliases, dedupe: ["vue"] },
  build: {
    target: "es2020",
    // CI interaction checks exercise production output; the public Pages build
    // does not include the synthetic component fixture.
    rolldownOptions: {
      ...(process.env.GAVIA_E2E_BUILD === "1"
        ? {
            input: {
              index: fileURLToPath(new URL("./index.html", import.meta.url)),
              e2e: fileURLToPath(new URL("./e2e.html", import.meta.url))
            }
          }
        : {}),
      output: {
        codeSplitting: {
          includeDependenciesRecursively: false,
          groups: [{ name: "playground-runtime", test: (id) => playgroundManualChunks(id) === "playground-runtime" }]
        }
      }
    }
  },
  server: {
    watch: {
      // Playwright traces contain HTML; saving them must not reload the tested page.
      ignored: ["**/test-results/**", "**/test-results-*/**", "**/playwright-report/**"]
    }
  }
});
