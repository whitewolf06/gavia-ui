import { expect, test } from "@playwright/test";
for (const theme of ["gavia", "gavia-dark", "white", "graphite", "newspaper"] as const) {
  test(`${theme}: WlToolbar keyboard and controlled example`, async ({ page, baseURL }) => {
    const url = new URL(baseURL ?? "http://127.0.0.1:4173/");
    url.search = "?view=docs&component=WlToolbar&lang=en";
    await page.goto(url.href, { waitUntil: "domcontentloaded" });
    await page.locator("html").evaluate((element, value) => element.setAttribute("data-wl-theme", value), theme);
    const example = page.getByTestId("ds-example-preview").locator('[data-review-example="WlToolbar"]');
    await expect(example).toBeVisible();
    const toolbar = example.getByRole("toolbar", { name: "Text formatting" });
    const bold = toolbar.getByRole("button", { name: "Bold", exact: true });
    const italic = toolbar.getByRole("button", { name: "Italic", exact: true });
    await bold.focus();
    await bold.press("ArrowRight");
    await expect(italic).toBeFocused();
    await italic.press("Space");
    await expect(italic).toHaveAttribute("aria-pressed", "true");
    await expect(toolbar).toMatchAriaSnapshot(`
      - toolbar "Text formatting":
        - button "Bold"
        - button "Italic" [pressed]
    `);
    await expect(example.getByText("Formatting applies to this text.", { exact: true })).toHaveCSS("font-style", "italic");
  });
}
