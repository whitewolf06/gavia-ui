/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    vue(),
    dts({
      entryRoot: "src",
      include: ["src/**/*.ts", "src/**/*.vue"],
      exclude: ["tests/**", "**/*.test.ts", "vite.config.ts"]
    })
  ],
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: () => "index.js"
    },
    rollupOptions: {
      external: [/^vue($|\/)/, /^primevue($|\/)/, /^@primevue($|\/)/, /^@primeuix($|\/)/, /^primeicons($|\/)/]
    }
  },
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.ts"],
    setupFiles: ["tests/setup.ts"],
    testTimeout: 20000
  }
});
