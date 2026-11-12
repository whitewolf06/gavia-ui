import { expect, test } from "@playwright/test";
import { chooseDropdownOption } from "./select-helpers";

for (const theme of ["gavia", "gavia-dark", "white", "graphite", "newspaper"]) {
  test(`${theme}: card section padding is applied once and nested cards are isolated`, async ({ page }) => {
    await page.goto(`/?view=system&theme=${theme}`);
    await chooseDropdownOption(page, page.getByRole("combobox", { name: "Component", exact: true }), "WlCard");
    const preview = page.getByTestId("ds-example-preview");
    for (const [padding, pixels] of [["none", 0], ["sm", 8], ["md", 12], ["lg", 16]] as const) {
      const card = preview.locator(`[data-padding-example="${padding}"]`);
      await expect(card).toBeVisible();
      const insets = await card.evaluate((element) => {
        const body = element.querySelector(":scope > .wl-card__body")!;
        return [body, ...body.children].map((section) => {
          const css = getComputedStyle(section);
          return [css.paddingTop, css.paddingRight, css.paddingBottom, css.paddingLeft].map(Number.parseFloat);
        });
      });
      expect(insets).toEqual([
        [0, 0, 0, 0], [pixels, pixels, 0, pixels],
        [pixels, pixels, pixels, pixels], [pixels, pixels, pixels, pixels]
      ]);
    }
    const nested = preview.locator('[data-padding-example="nested"] > .wl-card__body > .wl-card__content');
    await expect(nested).toHaveCSS("padding", "0px");
    const defaultCard = preview.locator(":scope > .wl-stack > .wl-card").first();
    await expect(defaultCard.locator(":scope > .wl-card__body > .wl-card__content")).toHaveCSS("padding", "8px 16px 16px");
  });
}
