import { expect, test } from "@playwright/test";

test.describe("review listbox", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/e2e.html?review-listbox&motion=off&theme=gavia");
    // The standalone fixture has no application theme resolver.
    await page.locator("html").evaluate((element) => element.setAttribute("data-wl-theme", "gavia"));
  });

  test("End keeps the last of 30 options visible and linked to the focused combobox", { tag: "@cross-browser" }, async ({ page }) => {
    const control = page.getByRole("combobox", { name: "Long option list", exact: true });
    await control.focus();
    await control.press("ArrowDown");
    const list = page.getByRole("listbox", { name: "Long option list", exact: true });
    await expect(list.getByRole("option")).toHaveCount(30);
    await control.press("End");
    const last = list.getByRole("option", { name: "Option 30", exact: true });
    await expect(last).toBeInViewport();
    await expect(control).toHaveAttribute("aria-activedescendant", (await last.getAttribute("id"))!);
    await expect(control).toBeFocused();
    await control.press("Enter");
    await expect(page.getByTestId("review-long-value")).toHaveText("option-30");
    await expect(control).not.toHaveAttribute("aria-activedescendant");
    await expect(list).toHaveCount(0);
  });

  test("typeahead skips disabled matches and clear restores focus", { tag: "@cross-browser" }, async ({ page }) => {
    const control = page.getByRole("combobox", { name: "Long option list", exact: true });
    await control.focus();
    await control.press("b");
    const list = page.getByRole("listbox", { name: "Long option list", exact: true });
    const match = list.getByRole("option", { name: "Beta enabled", exact: true });
    await expect(list.getByRole("option", { name: "Beta disabled", exact: true })).toHaveAttribute("aria-disabled", "true");
    await expect(control).toHaveAttribute("aria-activedescendant", (await match.getAttribute("id"))!);
    await control.press("Enter");
    await expect(page.getByTestId("review-long-value")).toHaveText("option-6");
    await page.getByTestId("review-long-select").getByRole("button", { name: "Очистить", exact: true }).click();
    await expect(page.getByTestId("review-long-value")).toHaveText("");
    await expect(control).toBeFocused();
    await expect(control).toHaveAttribute("aria-expanded", "false");
  });
});
