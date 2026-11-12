import { expect, test } from "@playwright/test";

for (const theme of ["gavia", "gavia-dark", "white", "graphite", "newspaper"]) {
  test(`${theme}: semantic component typography is opt-in and enlarged text fits`, async ({ page }) => {
    await page.goto("/e2e.html?review-typography");
    await page.locator("html").evaluate((element, value) => {
      element.setAttribute("data-wl-theme", value);
    }, theme);
    const fixture = page.getByTestId("component-typography-fixture");
    for (const [selector, oldSize, scaledSize] of [
      [".wl-card__title", 14, 22], [".wl-card__subtitle", 12.5, 14], [".wl-card__content", 13.5, 18],
      [".wl-acc__summary", 13.5, 18], [".wl-acc__body", 13, 18], [".wl-alert__text", 13, 18], [".wl-alert__title", 13, 22],
      ['.wl-segmented[data-size="md"] .wl-segmented__item', 13, 18]
    ] as const) {
      await expect(fixture.locator(`[data-semantic="false"] ${selector}`).first()).toHaveCSS("font-size", `${oldSize}px`);
      await expect(fixture.locator(`[data-semantic="true"] ${selector}`).first()).toHaveCSS("font-size", `${scaledSize}px`);
    }
    // Small Segmented already followed --wl-type-small-size before this feature.
    await expect(fixture.locator('[data-semantic="false"] .wl-segmented[data-size="sm"] button').first()).toHaveCSS("font-size", "14px");
    for (const button of await fixture.locator('[data-semantic="true"] .wl-segmented__item').all()) {
      const fits = await button.evaluate((element) => {
        const css = getComputedStyle(element);
        return element.getBoundingClientRect().height + 1 >= Number.parseFloat(css.lineHeight)
          + Number.parseFloat(css.paddingTop) + Number.parseFloat(css.paddingBottom);
      });
      expect(fits).toBe(true);
    }
    const content = fixture.locator('[data-semantic="true"] .wl-card__content');
    await content.evaluate((element) => {
      (element as HTMLElement).style.setProperty("--wl-card-content-font-size", "21px");
    });
    await expect(content).toHaveCSS("font-size", "21px");
  });
}
