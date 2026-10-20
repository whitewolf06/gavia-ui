import { expect, test } from "@playwright/test";

test("WlCheckboxGroup keyboard and controlled example", { tag: "@cross-browser" }, async ({ page, baseURL }) => {
  const url = new URL(baseURL ?? "http://127.0.0.1:4173/");
  url.search = "?view=docs&component=WlCheckboxGroup&lang=en&theme=gavia";
  await page.goto(url.href, { waitUntil: "domcontentloaded" });
  const example = page.getByTestId("ds-example-preview").locator('[data-review-example="WlCheckboxGroup"]');
  await expect(example).toBeVisible();
  const group = example.getByRole("group", { name: "Permissions" });
  await expect(group.getByRole("checkbox", { name: "Write (unavailable)" })).toBeDisabled();
  await group.getByRole("checkbox", { name: "Share" }).check();
  await expect(example.locator("output")).toContainText("share");
  await example.getByRole("button", { name: "Clear selection" }).click();
  await expect(example.getByRole("alert")).toBeVisible();
  await example.getByRole("button", { name: "Restore example" }).click();
  await expect(group.getByRole("checkbox", { name: "Read", exact: true })).toBeChecked();
});
