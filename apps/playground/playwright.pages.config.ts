import { defineConfig, devices } from "@playwright/test";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Test the Pages production build, not the development server or e2e.html.
const existingStand = process.env.GAVIA_PAGES_BASE_URL;
const previewOrigin = "http://127.0.0.1:4175";
const chromiumChannel = process.env.GAVIA_E2E_CHROMIUM_CHANNEL;

export default defineConfig({
  testDir: "./e2e",
  testMatch: "pages.pw.ts",
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  use: {
    baseURL: existingStand ?? `${previewOrigin}/gavia-ui/`,
    trace: "retain-on-failure"
  },
  projects: [
    { name: "pages-desktop", use: { ...devices["Desktop Chrome"], channel: chromiumChannel } },
    { name: "pages-mobile", use: { ...devices["Pixel 7"], channel: chromiumChannel } }
  ],
  webServer: existingStand ? undefined : {
    command: "pnpm preview --host 127.0.0.1 --port 4175 --strictPort --base=/gavia-ui/",
    cwd: dirname(fileURLToPath(import.meta.url)),
    url: `${previewOrigin}/gavia-ui/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
