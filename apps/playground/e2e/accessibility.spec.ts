import AxeBuilder from "@axe-core/playwright";
import { expect, type Locator, type Page, test, type TestInfo } from "@playwright/test";
import { russianPlaygroundUrl } from "./playground-url";
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
  // These surfaces have no frames. Audit in place, avoiding Axe's temporary
  // results tab; fail explicitly if future content requires frame coverage.
  await expect(page.locator("iframe, frame")).toHaveCount(0);
  expect(page.frames()).toHaveLength(1);
  const builder = new AxeBuilder({ page }).setLegacyMode().withTags(wcagTags);
  if (include) builder.include(include);
  const results = await builder.analyze();
  // Retain precise affected selectors and remediation in CI, without rule exclusions.
  await testInfo.attach(`axe-${name}`, {
    body: JSON.stringify({ url: results.url, tags: wcagTags, violations: results.violations, incomplete: results.incomplete }, null, 2),
    contentType: "application/json"
  });
  const details = results.violations.map(({ id, impact, nodes }) => ({
    id, impact, targets: nodes.map(({ target }) => target)
  }));
  expect(results.violations, `${name}: ${JSON.stringify(details, null, 2)}`).toEqual([]);
}

interface AuditCase {
  component: string;
  open: (page: Page, preview: Locator, testInfo: TestInfo, theme: string) => Promise<void>;
}

async function auditOpenList(
  page: Page, preview: Locator, testInfo: TestInfo, theme: string,
  component: string, name: string
): Promise<void> {
  const control = preview.getByRole("combobox", { name, exact: true });
  await control.press("ArrowDown");
  const listbox = page.getByRole("listbox", { name, exact: true });
  await expect(listbox).toBeVisible();
  await expect(control).toHaveAttribute("aria-controls", (await listbox.getAttribute("id"))!);
  const selector = ".wl-select-overlay, .wl-multiselect-overlay, .wl-autocomplete-overlay";
  await expect(page.locator(selector)).not.toHaveClass(/wl-pop-motion-enter-/);
  await audit(page, testInfo, `${theme}-${component}-open`, selector);
}

async function auditOpenDialog(
  page: Page, preview: Locator, testInfo: TestInfo, theme: string
): Promise<void> {
  await preview.getByRole("button", { name: "Открыть диалог" }).press("Enter");
  const dialog = page.getByRole("dialog", { name: "Сведения о материале" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toMatchAriaSnapshot(`
          - dialog "Сведения о материале":
            - banner:
              - text: Сведения о материале
              - button "Закрыть"
            - textbox "Материал": Руководство команды
            - paragraph: Escape закрывает окно и возвращает фокус.
            - contentinfo:
              - button "Готово"
        `);
  // Audit the final painted state rather than a half-transparent entry frame.
  await expect(page.locator(".wl-dialog-mask")).not.toHaveClass(/wl-dialog-motion-enter-/);
  await expect(page.locator(".wl-dialog-mask")).toHaveCSS("opacity", "1");
  await audit(page, testInfo, `${theme}-dialog-open`, ".wl-dialog");
}

const interactiveCases: AuditCase[] = [
  ...[
    { component: "WlSelect", name: "Область" },
    { component: "WlMultiSelect", name: "Направления" },
    { component: "WlAutocomplete", name: "Участник" }
  ].map(({ component, name }) => ({
    component,
    open: (page: Page, preview: Locator, testInfo: TestInfo, theme: string) =>
      auditOpenList(page, preview, testInfo, theme, component, name)
  })),
  { component: "WlDialog", open: auditOpenDialog }
];

for (const theme of themes) {
  for (const view of ["home", "font"] as const) {
    test(`${theme}: ${view} page meets automated WCAG 2.2 AA checks`, async ({ page, baseURL }, testInfo) => {
      await page.goto(russianPlaygroundUrl(showcaseUrl(baseURL, view, theme)), { waitUntil: "domcontentloaded" });
      await expect(page.getByTestId(`${view}-page`)).toBeVisible();
      await expect(page.locator("html")).toHaveAttribute("data-wl-theme", theme);
      await audit(page, testInfo, `${theme}-${view}`);
    });
  }

  for (const entry of interactiveCases) {
    const states = [
      { name: "closed", inspect: async (page: Page, _preview: Locator, info: TestInfo) => {
        await audit(page, info, `${theme}-${entry.component}-closed`, '[data-testid="ds-example-preview"]');
      } },
      { name: "open", inspect: async (page: Page, preview: Locator, info: TestInfo) => {
        await entry.open(page, preview, info, theme);
        await page.keyboard.press("Escape");
        const closedOverlays = ".wl-select-overlay, .wl-multiselect-overlay, .wl-autocomplete-overlay, .wl-dialog";
        await expect(page.locator(closedOverlays)).toHaveCount(0);
      } }
    ];
    for (const state of states) {
      test(`${theme}: ${entry.component} ${state.name} state meets automated WCAG 2.2 AA checks`, async ({ page, baseURL }, info) => {
        await page.goto(russianPlaygroundUrl(showcaseUrl(baseURL, "system", theme)), { waitUntil: "domcontentloaded" });
        await expect(page.getByRole("heading", { name: "Дизайн-система" })).toBeVisible();
        const explorer = page.getByTestId("ds-explorer");
        const preview = page.getByTestId("ds-example-preview");
        await chooseDropdownOption(page, page.getByRole("combobox", { name: "Компонент", exact: true }), entry.component);
        await expect(explorer).toHaveAttribute("data-component", entry.component);
        await expect(preview.locator(":scope > .wl-stack")).toBeVisible();
        await state.inspect(page, preview, info);
      });
    }
  }

  for (const { view, selector, query } of [
    { view: "home", selector: '[data-testid="home-quality"]', query: "" },
    { view: "docs", selector: '[data-testid="docs-page"]', query: "&view=docs&section=quality" }
  ]) {
    test(theme + ": quality " + view + " meets automated WCAG checks", async ({ page }, testInfo) => {
      await page.goto(russianPlaygroundUrl("/?theme=" + theme + query));
      await expect(page.locator(selector)).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator("iframe, frame")).toHaveCount(0);
      expect(page.frames()).toHaveLength(1);
      const results = await new AxeBuilder({ page }).setLegacyMode().include(selector).withTags(wcagTags).analyze();
      await testInfo.attach("quality-axe-" + theme + "-" + view, {
        body: JSON.stringify(results.violations, null, 2), contentType: "application/json"
      });
      expect(results.violations).toEqual([]);
    });
  }
}
