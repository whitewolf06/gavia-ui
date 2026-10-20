import { expect, test } from "@playwright/test";

// Authored contracts, not automatically accepted snapshots. Run and review with
// the separately authorized production browser matrix before release.
for (const theme of ["gavia", "gavia-dark", "white", "graphite", "newspaper"] as const) {
  test(`${theme}: list and tab accessibility trees retain names and selection`, async ({ page, baseURL }) => {
    const url = new URL(baseURL ?? "http://127.0.0.1:4173/");
    url.search = new URLSearchParams({ view: "docs", component: "WlSelect", lang: "en", theme }).toString();
    await page.goto(url.href);
    const preview = page.getByTestId("ds-example-preview").first();
    const control = preview.getByRole("combobox", { name: "Scope", exact: true });
    await control.press("ArrowDown");
    await expect(page.getByRole("listbox", { name: "Scope", exact: true })).toMatchAriaSnapshot(`
      - listbox "Scope":
        - group "Scope":
          - option "Team" [selected]
          - option "Personal"
          - option "Research" [disabled]
    `);
    await control.press("Escape");
    url.searchParams.set("component", "WlTabs");
    await page.goto(url.href);
    const tabs = page.getByTestId("ds-example-preview").first().getByRole("tablist");
    await expect(tabs).toMatchAriaSnapshot(`
      - tablist:
        - tab "Overview" [selected]
        - tab "History 3"
    `);
    await tabs.getByRole("tab", { name: "Overview", exact: true }).press("ArrowRight");
    await expect(tabs).toMatchAriaSnapshot(`
      - tablist:
        - tab "Overview"
        - tab "History 3" [selected]
    `);
  });
}
