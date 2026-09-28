/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import type { Plugin } from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";
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
    include: ["tests/**/*.test.{ts,mjs}"],
    setupFiles: ["tests/setup.ts"],
    testTimeout: 20000
  }
});
