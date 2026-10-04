import { defineConfig, devices } from "@playwright/test";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Local QA can reuse the running development stand; CI starts its own Vite.
const existingStand = process.env.GAVIA_E2E_BASE_URL;
// Opt into the full pinned Chromium when the local headless shell cannot start.
const chromiumChannel = process.env.GAVIA_E2E_CHROMIUM_CHANNEL;
export default defineConfig({
  testDir: "./e2e",
  testMatch: "*.spec.ts",
  // Complete playground workflows include lazy examples and several overlay cycles.
  // Individual assertions retain Playwright's default five-second timeout.
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  use: { baseURL: existingStand ?? "http://127.0.0.1:4173", trace: "retain-on-failure" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"], channel: chromiumChannel } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"], channel: chromiumChannel } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } }
  ],
  webServer: existingStand ? undefined : {
    command: "pnpm dev --host 127.0.0.1 --port 4173 --strictPort",
    cwd: dirname(fileURLToPath(import.meta.url)),
    url: "http://127.0.0.1:4173/e2e.html",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
