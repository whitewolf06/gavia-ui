/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import type { Plugin } from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";
import { wlManifest } from "./src/manifest";
import { readFileSync } from "node:fs";

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
      entryRoot: "src",
      include: ["src/**/*.ts", "src/**/*.vue"],
      exclude: ["tests/**", "**/*.test.ts", "vite.config.ts"]
    }),
    wlManifestPlugin()
  ],
  build: {
    target: "es2020",
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: () => "index.js"
    },
    rollupOptions: {
      external: [/^vue($|\/)/]
    }
  },
  test: {
    environment: "jsdom",
    maxWorkers: 4,
    minWorkers: 1,
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
