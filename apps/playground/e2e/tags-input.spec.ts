import { expect, test } from "@playwright/test";

test("WlTagsInput keyboard and controlled example", { tag: "@cross-browser" }, async ({ page, baseURL }) => {
  const url = new URL(baseURL ?? "http://127.0.0.1:4173/");
  url.search = "?view=docs&component=WlTagsInput&lang=en&theme=gavia";
  await page.goto(url.href, { waitUntil: "domcontentloaded" });
  const example = page.getByTestId("ds-example-preview").locator('[data-review-example="WlTagsInput"]');
  await expect(example).toBeVisible();
  const input = example.getByRole("textbox", { name: "Tags", exact: true });
  await input.fill("Testing");
  await input.press("Enter");
  await expect(example.locator("output")).toHaveText("Vue, Testing");
  await input.fill("Vue");
  await input.press("Enter");
  await expect(example.getByRole("alert")).toContainText("Vue");
  await input.press("Backspace");
  await expect(example.locator("output")).toHaveText("Vue");
  await expect(input).toBeFocused();
});
