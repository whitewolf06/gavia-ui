import type { Plugin } from "vite";
import vue from "@vitejs/plugin-vue";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import dts from "vite-plugin-dts";
import { defineConfig } from "vitest/config";
import { normalizeDeclarationSpecifiers } from "../../scripts/normalize-declarations.mjs";
import { wlManifest } from "./src/manifest";

/** Emits dist/manifest.json — machine-readable component manifest for editors/agents. */
function wlManifestPlugin(): Plugin {
  return {
    name: "wl-manifest",
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "manifest.json",
        source: JSON.stringify(wlManifest, null, 2)
      });
      this.emitFile({
        type: "asset",
        fileName: "design-tokens.json",
        source: readFileSync(new URL("./tokens/catalog.generated.json", import.meta.url), "utf8")
      });
    }
  };
}

export default defineConfig({
  plugins: [
    vue(),
    dts({
      processor: "vue",
      entryRoot: "src",
      include: ["src/**/*.ts", "src/**/*.vue"],
      exclude: ["tests/**", "**/*.test.ts", "vite.config.ts"],
      afterDiagnostic(diagnostics) {
        if (diagnostics.length) throw new Error(`Declaration generation failed with ${diagnostics.length} TypeScript diagnostics`);
      },
      beforeWriteFile(filePath, content) {
        return { content: normalizeDeclarationSpecifiers(content, filePath, {
          sourceRoot: fileURLToPath(new URL("./src/", import.meta.url)),
          outDir: fileURLToPath(new URL("./dist/", import.meta.url))
        }) };
      }
    }),
    wlManifestPlugin()
  ],
  build: {
    target: "es2020",
    lib: {
      entry: { index: "src/index.ts", utils: "src/utils/index.ts", composables: "src/composables/index.ts" },
      formats: ["es"],
      fileName: (_format, entryName) => `${entryName}.js`
    },
    rolldownOptions: {
      external: [/^vue($|\/)/],
      output: { chunkFileNames: "chunks/[hash].js" }
    }
  },
  test: {
    environment: "jsdom",
    maxWorkers: 4,
    // Preserve the existing fixture lifecycle while migrating the runner.
    clearMocks: false,
    include: ["tests/**/*.test.{ts,mjs}"],
    setupFiles: ["tests/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,vue}"],
      exclude: ["src/**/*.generated.ts", "src/manifest/**", "src/**/types.ts", "src/index.ts", "src/components/index.ts"],
      reporter: ["text-summary", "json-summary", "html", "lcov"],
      reportsDirectory: "coverage",
      thresholds: {
        lines: 97, statements: 97, branches: 85, functions: 81,
        "src/utils/overlayTransition.ts": { lines: 100, branches: 100, functions: 100, statements: 100 }
      }
    },
    testTimeout: 20000
  }
});
