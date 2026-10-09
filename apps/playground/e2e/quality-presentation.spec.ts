import { russianPlaygroundUrl } from "./playground-url";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const report = JSON.parse(readFileSync(fileURLToPath(new URL("../src/project/quality-report.generated.json", import.meta.url)), "utf8")) as {
  version: string;
  measuredAt: string;
  tests: { passed: number; total: number };
  coverage: Record<"lines" | "statements" | "branches" | "functions", number>;
  source: { environment: "ci" | "local" };
};

const themes = ["gavia", "white", "graphite", "newspaper", "gavia-dark"];
const percent = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 });

test("quality summary, footer and documentation preserve themes and show the measured unit report", async ({ page }) => {
  for (const theme of themes) {
    await page.goto(russianPlaygroundUrl("/?theme=" + theme));
    const summary = page.getByTestId("home-quality");
    await expect(summary).toContainText(percent.format(report.coverage.lines) + "%");
    await expect(summary).toContainText(report.version);
    await expect(summary.getByRole("progressbar", { name: "Покрытие строк unit-тестами", exact: true })).toHaveAttribute("aria-valuenow", String(report.coverage.lines));
    await expect(summary.getByRole("progressbar", { name: "Пройденные unit-тесты в этом прогоне", exact: true })).toHaveAttribute("aria-valuenow", String(report.tests.passed / report.tests.total * 100));
    await expect(summary.locator("time")).toHaveAttribute("datetime", report.measuredAt);
    const link = summary.getByRole("link", { name: "Результаты проверок", exact: true });
    const href = new URL((await link.getAttribute("href"))!, page.url());
    expect(href.searchParams.get("section")).toBe("quality");
    expect(href.searchParams.get("theme")).toBe(theme);
    await link.click();
    const docs = page.getByTestId("docs-page");
    const quality = page.getByTestId("docs-quality-page");
    await expect(docs.getByRole("heading", { level: 1 })).toHaveText("Качество и совместимость");
    await expect(page.getByTestId("quality-unit-count")).toHaveText(report.tests.passed + " / " + report.tests.total);
    for (const metric of ["lines", "statements", "branches", "functions"] as const) {
      const card = quality.locator('[data-coverage-metric="' + metric + '"]');
      await expect(card).toContainText(percent.format(report.coverage[metric]) + "%");
      await expect(card.getByRole("progressbar")).toHaveAttribute("aria-valuenow", String(report.coverage[metric]));
      await expect(card.getByRole("progressbar")).toHaveAttribute("aria-valuetext", percent.format(report.coverage[metric]) + "%");
    }
    await expect(quality.locator("time")).toHaveAttribute("datetime", report.measuredAt);
    await expect(quality).toContainText(report.source.environment === "ci" ? "Отчёт CI" : "Локальный отчёт");
    await expect(page.locator("html")).toHaveAttribute("data-wl-theme", theme);
    const footer = page.locator(".pg-footer").getByRole("link", { name: "Качество и совместимость", exact: true });
    const footerUrl = new URL((await footer.getAttribute("href"))!, page.url());
    expect(footerUrl.searchParams.get("theme")).toBe(theme);
    expect(footerUrl.searchParams.get("section")).toBe("quality");
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    await page.reload();
    await expect(quality).toBeVisible();
  }
});

test("quality home summary and documentation pass automated WCAG checks in five themes", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Axe runs once; routing and layout use all browser projects.");
  for (const theme of themes) {
    for (const view of ["home", "docs"]) {
      await page.goto(russianPlaygroundUrl("/?theme=" + theme + (view === "docs" ? "&view=docs&section=quality" : "")));
      const selector = view === "home" ? '[data-testid="home-quality"]' : '[data-testid="docs-page"]';
      await expect(page.locator(selector)).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const results = await new AxeBuilder({ page }).include(selector).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
      await testInfo.attach("quality-axe-" + theme + "-" + view, { body: JSON.stringify(results.violations, null, 2), contentType: "application/json" });
      expect(results.violations).toEqual([]);
    }
  }
});
