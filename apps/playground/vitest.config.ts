import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";
import { playgroundCatalogSummary } from "./build/catalog-summary";
import { playgroundI18nPlugins } from "./build/i18n";
import { playgroundSourceAliases } from "./vite.config";

export default defineConfig({
  plugins: [vue(), ...playgroundI18nPlugins(), playgroundCatalogSummary()],
  resolve: { alias: playgroundSourceAliases, dedupe: ["vue"] },
  test: {
    name: "playground",
    environment: "jsdom",
    include: ["tests/**/*.test.ts"],
    setupFiles: ["tests/setup.ts"],
    maxWorkers: 4,
    minWorkers: 1,
    testTimeout: 20000
  }
});
