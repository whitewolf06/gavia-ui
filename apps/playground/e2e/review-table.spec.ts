import { expect, test } from "@playwright/test";

test("table headers sort with Enter/Space and row selection exposes mixed state", { tag: "@cross-browser" }, async ({ page }) => {
  await page.goto("/?view=docs&component=WlTable&lang=en&theme=gavia");
  const example = page.locator('[data-table-example="WlTable"]');
  const table = example.locator("table").first();
  const sort = table.getByRole("columnheader", { name: /Hours/ }).getByRole("button");
  await expect(sort).toHaveAttribute("aria-label", "Hours: sort ascending");
  await sort.focus();
  await sort.press("Enter");
  await expect(table.getByRole("columnheader", { name: /Hours/ })).toHaveAttribute("aria-sort", "ascending");
  await expect(table.locator("tbody tr").first().locator("td").last()).toHaveText("3");
  await sort.press("Space");
  await expect(table.getByRole("columnheader", { name: /Hours/ })).toHaveAttribute("aria-sort", "descending");
  await expect(table.locator("tbody tr").first().locator("td").last()).toHaveText("8");
  const all = table.getByRole("checkbox", { name: "Select all rows", exact: true });
  const row = table.getByRole("checkbox", { name: "Select row 1", exact: true });
  await row.focus();
  await row.press("Space");
  await expect(row).toBeChecked();
  await expect(all).toHaveJSProperty("indeterminate", true);
  await all.focus();
  await all.press("Space");
  await expect(all).toBeChecked();
  await expect(all).toHaveJSProperty("indeterminate", false);
});
