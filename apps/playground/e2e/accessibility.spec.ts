import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { chooseDropdownOption } from "./select-helpers";

const themes = ["gavia", "white", "graphite", "newspaper", "gavia-dark"] as const;
// axe executes in Chromium once; behavior remains covered by all browser projects.
const wcagTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

function showcaseUrl(baseURL: string | undefined, view: string, theme: string): string {
  const url = new URL(baseURL ?? "http://127.0.0.1:4173/");
  url.search = new URLSearchParams({ view, theme }).toString();
  return url.href;
}

async function audit(page: Page, testInfo: TestInfo, name: string, include?: string): Promise<void> {
  await page.evaluate(() => document.fonts.ready);
  const builder = new AxeBuilder({ page }).withTags(wcagTags);
  if (include) builder.include(include);
  const results = await builder.analyze();
  // Retain precise affected selectors and remediation in CI, without rule exclusions.
  await testInfo.attach(`axe-${name}`, {
    body: JSON.stringify({ url: results.url, tags: wcagTags, violations: results.violations, incomplete: results.incomplete }, null, 2),
    contentType: "application/json"
  });
  expect(results.violations, `${name}: ${JSON.stringify(results.violations.map(({ id, impact, nodes }) => ({ id, impact, targets: nodes.map(({ target }) => target) })), null, 2)}`).toEqual([]);
}

for (const theme of themes) {
  test(`${theme}: home and font page meet automated WCAG 2.2 AA checks`, async ({ page, baseURL }, testInfo) => {
    for (const view of ["home", "font"]) {
      await page.goto(showcaseUrl(baseURL, view, theme));
      await expect(page.getByTestId(`${view === "home" ? "home" : "font"}-page`)).toBeVisible();
      await expect(page.locator("html")).toHaveAttribute("data-wl-theme", theme);
      await audit(page, testInfo, `${theme}-${view}`);
    }
  });

  test(`${theme}: selection controls and dialog closed/open states meet automated WCAG 2.2 AA checks`, async ({ page, baseURL }, testInfo) => {
    await page.goto(showcaseUrl(baseURL, "system", theme));
    await expect(page.getByRole("heading", { name: "Дизайн-система" })).toBeVisible();
    const explorer = page.getByTestId("ds-explorer");
    const preview = page.getByTestId("ds-example-preview");
    for (const component of ["WlSelect", "WlMultiSelect", "WlAutocomplete", "WlDialog"]) {
      await chooseDropdownOption(page, page.getByRole("combobox", { name: "Компонент", exact: true }), component);
      await expect(explorer).toHaveAttribute("data-component", component);
      await expect(preview.locator(":scope > .wl-stack")).toBeVisible();
      await audit(page, testInfo, `${theme}-${component}-closed`, '[data-testid="ds-example-preview"]');
      if (component !== "WlDialog") {
        const names = { WlSelect: "Область", WlMultiSelect: "Направления", WlAutocomplete: "Участник" };
        const control = preview.getByRole("combobox", { name: names[component as keyof typeof names], exact: true });
        await control.press("ArrowDown");
        const listbox = page.getByRole("listbox", { name: names[component as keyof typeof names], exact: true });
        await expect(listbox).toBeVisible();
        await expect(control).toHaveAttribute("aria-controls", (await listbox.getAttribute("id"))!);
        const overlay = page.locator(".wl-select-overlay, .wl-multiselect-overlay, .wl-autocomplete-overlay");
        await expect(overlay).not.toHaveClass(/wl-pop-motion-enter-/);
        await audit(page, testInfo, `${theme}-${component}-open`, ".wl-select-overlay, .wl-multiselect-overlay, .wl-autocomplete-overlay");
      } else {
        await preview.getByRole("button", { name: "Открыть диалог" }).press("Enter");
        await expect(page.getByRole("dialog", { name: "Сведения о материале" })).toBeVisible();
        // axe must inspect the final painted state, not a half-transparent entry frame.
        await expect(page.locator(".wl-dialog-mask")).not.toHaveClass(/wl-dialog-motion-enter-/);
        await expect(page.locator(".wl-dialog-mask")).toHaveCSS("opacity", "1");
        await audit(page, testInfo, `${theme}-dialog-open`, ".wl-dialog");
      }
      await page.keyboard.press("Escape");
      await expect(page.locator(".wl-select-overlay, .wl-multiselect-overlay, .wl-autocomplete-overlay, .wl-dialog")).toHaveCount(0);
    }
  });
}
