import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    watch: {
      // Playwright traces contain HTML; saving them must not reload the tested page.
      ignored: ["**/test-results/**", "**/test-results-*/**", "**/playwright-report/**"]
    }
  }
});
