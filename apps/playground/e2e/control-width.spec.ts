import { expect, test } from "@playwright/test";

for (const theme of ["gavia", "gavia-dark", "white", "graphite", "newspaper"]) {
  test(`${theme}: full-width controls retain default caps and stretch together with wl-fluid @cross-browser`, async ({ page }) => {
    await page.goto("/e2e.html?review-control-width");
    await page.locator("html").evaluate((element, value) => {
      element.setAttribute("data-wl-theme", value);
    }, theme);
    const fixture = page.getByTestId("control-width-fixture");
    await expect(fixture).toBeVisible();
    for (const width of [640, 280]) {
      await fixture.evaluate((element, pixels) => {
        element.style.width = `${pixels}px`;
      }, width);
      for (const fluid of [false, true]) {
        const group = fixture.locator(`[data-fluid="${fluid}"]`);
        for (const [selector, cap] of [[".wl-field", 340], [".wl-input-wrap", 340], [".wl-select", 340], [".wl-multiselect", 340], [".wl-autocomplete", 340], [".wl-textarea", 340], [".wl-acc", 520], [".wl-slider", 320], [".wl-slider-wrap", 320]] as const) {
          for (const element of await group.locator(selector).all()) {
            const actual = await element.evaluate((node) => node.getBoundingClientRect().width);
            expect(actual, `${selector}, fluid=${fluid}, width=${width}`).toBeCloseTo(fluid ? width : Math.min(cap, width), 0);
          }
        }
      }
      const number = await fixture.locator(".wl-stepper").evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().width));
      expect(number[0]).toBeCloseTo(number[1]!, 0);
    }
    const input = fixture.locator('[data-fluid="true"] .wl-input-wrap');
    await input.evaluate((element) => {
      (element as HTMLElement).style.setProperty("--wl-input-max-width", "200px");
    });
    await expect(input).toHaveCSS("max-width", "200px");
  });
}
