import { expect, test } from "@playwright/test";

test("WlRadioGroup keyboard and controlled example", { tag: "@cross-browser" }, async ({ page, baseURL }) => {
  const url = new URL(baseURL ?? "http://127.0.0.1:4173/");
  url.search = "?view=docs&component=WlRadioGroup&lang=en&theme=gavia";
  await page.goto(url.href, { waitUntil: "domcontentloaded" });
  const example = page.getByTestId("ds-example-preview").locator('[data-review-example="WlRadioGroup"]');
  await expect(example).toBeVisible();
  const group = example.getByRole("radiogroup", { name: "Plan" });
  const basic = group.getByRole("radio", { name: "Basic", exact: true });
  const team = group.getByRole("radio", { name: "Team", exact: true });
  await basic.focus();
  await basic.press("ArrowRight");
  await expect(team).toBeFocused();
  await expect(team).toBeChecked();
  await team.press("Home");
  await expect(basic).toBeChecked();
  await expect(group.getByRole("radio", { name: "Enterprise (unavailable)" })).toBeDisabled();
});
