import { devices, expect, test } from "@playwright/test";

interface LoadingMetrics {
  lcpMs: number;
  cls: number;
}

interface Measurement extends LoadingMetrics {
  theme: string;
  route: string;
  transferBytes: number;
  fontTransferBytes: number;
  resources: { path: string; bytes: number }[];
}

test("cold production loading budgets across five themes", async ({ browser, baseURL }, testInfo) => {
  test.setTimeout(240_000);
  const mobile = testInfo.project.name.includes("mobile");
  const viewport = mobile
    ? { width: 390, height: 844 }
    : { width: 1440, height: 900 };
  const deviceScaleFactor = mobile ? devices["Pixel 7"].deviceScaleFactor : 1;
  const measurements: Measurement[] = [];
  const routes = ["", "docs/components/WlButton/", "docs/components/WlSelect/", "docs/components/WlDialog/"];
  for (const theme of ["gavia", "gavia-dark", "white", "graphite", "newspaper"]) {
    for (const route of routes) {
      const context = await browser.newContext({
        viewport, deviceScaleFactor, isMobile: mobile, hasTouch: mobile, locale: "en-US"
      });
      try {
        await context.addInitScript(() => {
          const metrics: LoadingMetrics = { lcpMs: 0, cls: 0 };
          (window as Window & { gaviaLoadingMetrics?: LoadingMetrics }).gaviaLoadingMetrics = metrics;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) metrics.lcpMs = entry.startTime;
          }).observe({ type: "largest-contentful-paint", buffered: true });
          let sessionValue = 0;
          let sessionStart = -Infinity;
          let lastShift = -Infinity;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              const shift = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
              if (shift.hadRecentInput) continue;
              if (shift.startTime - lastShift < 1000 && shift.startTime - sessionStart < 5000) {
                sessionValue += shift.value;
              } else {
                sessionValue = shift.value;
                sessionStart = shift.startTime;
              }
              lastShift = shift.startTime;
              metrics.cls = Math.max(metrics.cls, sessionValue);
            }
          }).observe({ type: "layout-shift", buffered: true });
        });
        const page = await context.newPage();
        const url = new URL(route || "./", baseURL!);
        url.searchParams.set("theme", theme);
        const response = await page.goto(url.href, { waitUntil: "networkidle" });
        expect(response?.ok()).toBe(true);
        expect(await response!.text()).toContain("data-playground-prerendered");
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        await expect(page.locator("html")).toHaveAttribute("data-wl-theme", theme);
        await page.evaluate(async () => {
          await document.fonts.ready;
          await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
        });
        const row = await page.evaluate(() => {
          const entries = [
            ...performance.getEntriesByType("navigation"),
            ...performance.getEntriesByType("resource")
          ] as PerformanceResourceTiming[];
          const resources = entries.map((entry) => ({
            path: new URL(entry.name).pathname,
            bytes: Math.max(entry.transferSize, entry.encodedBodySize)
          }));
          const metrics = (window as Window & { gaviaLoadingMetrics?: LoadingMetrics }).gaviaLoadingMetrics!;
          return {
            ...metrics,
            resources,
            transferBytes: resources.reduce((sum, entry) => sum + entry.bytes, 0),
            fontTransferBytes: resources.filter((entry) => /\.(?:woff2?|ttf|otf)$/u.test(entry.path))
              .reduce((sum, entry) => sum + entry.bytes, 0)
          };
        });
        measurements.push({ theme, route: route || "home", ...row });
      } finally {
        await context.close();
      }
    }
  }
  await testInfo.attach("cold-loading-measurements", {
    body: JSON.stringify({ viewport, deviceScaleFactor, measurements }, null, 2),
    contentType: "application/json"
  });
  expect(measurements).toHaveLength(20);
  for (const row of measurements) {
    const label = `${row.theme} ${row.route} ${viewport.width}px`;
    expect.soft(row.lcpMs, `${label}: observed LCP`).toBeGreaterThan(0);
    expect.soft(row.cls, `${label}: CLS`).toBeLessThan(0.1);
    expect.soft(row.transferBytes, `${label}: cold transfer`).toBeLessThanOrEqual(row.route === "home" ? 600_000 : 650_000);
    if (row.route === "home") expect.soft(row.fontTransferBytes, `${label}: fonts`).toBeLessThanOrEqual(90_000);
  }
});
