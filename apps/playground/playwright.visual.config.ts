import { defineConfig, devices } from "@playwright/test";
import base from "./playwright.config";
/** Reviewed Windows/Chromium baselines; interaction tests keep all four browser projects. */
export default defineConfig({
  ...base,
  testMatch: ["visual-regression.pw.ts", "gavia-visual-regression.pw.ts"],
  // Each case compares a full batch of recipe screens or interactive states.
  timeout: 60_000,
  snapshotPathTemplate: "{testDir}/visual-baselines/{projectName}/{arg}{ext}",
  expect: { toHaveScreenshot: { animations: "disabled", caret: "hide", scale: "css", maxDiffPixelRatio: 0.002 } },
  use: { ...base.use, locale: "ru-RU", timezoneId: "UTC", contextOptions: { reducedMotion: "reduce" } },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], channel: process.env.GAVIA_E2E_CHROMIUM_CHANNEL, viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 } },
    { name: "mobile", use: { ...devices["Pixel 7"], channel: process.env.GAVIA_E2E_CHROMIUM_CHANNEL, viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 } }
  ]
});
