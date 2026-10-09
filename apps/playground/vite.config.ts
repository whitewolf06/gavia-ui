import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { gaviaSeoAssets } from "./build/seo-assets";
import { gaviaFontDownload } from "./build/font-download";

export default defineConfig({
  plugins: [vue(), gaviaFontDownload(), gaviaSeoAssets()],
  // Kit declarations target the minimum Vue line; the playground runs one Vue instance.
  resolve: { dedupe: ["vue"] },
  build: { target: "es2020" },
  server: {
    watch: {
      // Playwright traces contain HTML; saving them must not reload the tested page.
      ignored: ["**/test-results/**", "**/test-results-*/**", "**/playwright-report/**"]
    }
  }
});
