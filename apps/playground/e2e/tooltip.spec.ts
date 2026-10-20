import { expect, test } from "@playwright/test";

test("WlTooltipComponent keyboard and controlled example", { tag: "@cross-browser" }, async ({ page, baseURL }) => {
  const url = new URL(baseURL ?? "http://127.0.0.1:4173/");
  url.search = "?view=docs&component=WlTooltipComponent&lang=en&theme=gavia";
  await page.goto(url.href, { waitUntil: "domcontentloaded" });
  const example = page.getByTestId("ds-example-preview").locator('[data-review-example="WlTooltipComponent"]');
  await expect(example).toBeVisible();
  const trigger = example.getByRole("button", { name: "Save details", exact: true });
  await trigger.focus();
  const tooltip = page.getByRole("tooltip");
  await expect(tooltip).toHaveText("Changes are saved automatically.");
  await expect(trigger).toHaveAttribute("aria-describedby", (await tooltip.getAttribute("id"))!);
  await trigger.press("Escape");
  await expect(tooltip).toHaveCount(0);
  const disabled = example.getByRole("button", { name: "Delete (unavailable)", exact: true });
  await expect(disabled).toBeDisabled();
  await disabled.locator("..").focus();
  await expect(page.getByRole("tooltip")).toHaveText("This action requires editor access.");
});
