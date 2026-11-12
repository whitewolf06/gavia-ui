import { expect, test } from "@playwright/test";
import { chooseDropdownOption } from "./select-helpers";

for (const theme of ["gavia", "gavia-dark", "white", "graphite", "newspaper"]) {
  test(`${theme}: calendar activation fires once and disabled dates are skipped @cross-browser`, async ({ page }) => {
    await page.goto(`/?view=system&theme=${theme}&lang=en`);
    await chooseDropdownOption(page, page.getByRole("combobox", { name: "Component", exact: true }), "WlCalendar");
    await page.getByTestId("ds-explorer").getByRole("checkbox", { name: "multiple", exact: true }).uncheck();
    const preview = page.getByTestId("ds-example-preview");
    const day = preview.locator('[data-date="2026-10-15"]');
    await day.click();
    await expect(preview.getByTestId("calendar-activation")).toContainText("2026-10-15 · 1");
    await day.press("Enter");
    await expect(preview.getByTestId("calendar-activation")).toContainText("2026-10-15 · 2");
    await day.press("Space");
    await expect(preview.getByTestId("calendar-activation")).toContainText("2026-10-15 · 3");
    await expect(day).toHaveAttribute("aria-selected", "true");
    await preview.getByRole("checkbox", { name: "Disable October 16 and 18" }).check();
    await expect(preview.locator('[data-date="2026-10-16"]')).toBeDisabled();
    await day.focus();
    await day.press("ArrowRight");
    await expect(preview.locator('[data-date="2026-10-17"]')).toBeFocused();
    await expect(preview.getByTestId("calendar-activation")).toContainText("2026-10-15 · 3");
  });
}
