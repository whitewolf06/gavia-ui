import { expect, test } from "@playwright/test";

test.describe("WlContextMenu", () => {
  for (const theme of ["white", "graphite", "newspaper", "gavia", "gavia-dark"]) {
    test(`keyboard invocation and nested choice (${theme})`, async ({ page }) => {
      await page.goto(`/?view=docs&component=WlContextMenu&lang=en&theme=${theme}`);
      const target = page.locator("[data-context-example]").first();
      await target.focus();
      await target.press("Shift+F10");
      const menu = page.getByRole("menu");
      await expect(menu).toBeVisible();
      await expect(menu.getByRole("menuitem", { name: "Edit", exact: true })).toBeFocused();
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowRight");
      const checkbox = page.getByRole("menuitemcheckbox", { name: "Compact header" });
      await expect(checkbox).toBeFocused();
      await expect(checkbox).toMatchAriaSnapshot('- menuitemcheckbox "Compact header"');
      await checkbox.press("Space");
      await expect(page.getByRole("menu")).toHaveCount(0);
      await expect(target).toBeFocused();
      await target.press("Shift+F10");
      await page.keyboard.press("Escape");
      await expect(page.getByRole("menu")).toHaveCount(0);
    });
  }
});
