import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { gaviaFontDownload } from "./build/font-download";

export default defineConfig({
  plugins: [vue(), gaviaFontDownload()],
  server: {
    watch: {
      // Playwright traces contain HTML; saving them must not reload the tested page.
      ignored: ["**/test-results/**", "**/test-results-*/**", "**/playwright-report/**"]
    }
  }
});
