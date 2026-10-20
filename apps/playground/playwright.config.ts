import { defineConfig, devices } from "@playwright/test";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Local QA can reuse a stand or start Vite; CI previews an already built fixture.
const existingStand = process.env.GAVIA_E2E_BASE_URL;
const productionStand = Boolean(process.env.CI) || process.env.GAVIA_E2E_PRODUCTION === "1";
// Opt into the full pinned Chromium when the local headless shell cannot start.
const chromiumChannel = process.env.GAVIA_E2E_CHROMIUM_CHANNEL;
export default defineConfig({
  testDir: "./e2e",
  testMatch: "*.spec.ts",
  // Complete playground workflows include lazy examples and several overlay cycles.
  // Individual assertions retain Playwright's default five-second timeout.
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 1,
  reporter: process.env.CI ? [["line"], ["json", { outputFile: fileURLToPath(new URL("./test-results/e2e-results.json", import.meta.url)) }]] : undefined,
  use: { baseURL: existingStand ?? "http://127.0.0.1:4173", trace: "on-first-retry" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"], channel: chromiumChannel } },
    // Site content and inventory run once in Chromium. Repeat native interaction
    // risks across engines and the touch viewport; themes have visual/Axe gates.
    { name: "mobile-chromium", grep: /@cross-browser/, testIgnore: "accessibility.spec.ts", use: { ...devices["Pixel 7"], channel: chromiumChannel } },
    { name: "firefox", grep: /@cross-browser/, testIgnore: "accessibility.spec.ts", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", grep: /@cross-browser/, testIgnore: "accessibility.spec.ts", use: { ...devices["Desktop Safari"] } }
  ],
  webServer: existingStand
    ? undefined
    : {
        command: `pnpm ${productionStand ? "preview" : "dev"} --host 127.0.0.1 --port 4173 --strictPort`,
        cwd: dirname(fileURLToPath(import.meta.url)),
        url: "http://127.0.0.1:4173/e2e.html",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000
      }
});
