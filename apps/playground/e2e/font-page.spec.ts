import { expect, test } from "@playwright/test";
import { chooseShowcaseTheme, navigateMainView } from "./select-helpers";

const weights = [100, 300, 400, 500, 600, 700] as const;

test("font page keeps theme-aware navigation, real Gavia faces and editable samples", async ({ page, baseURL }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.request().resourceType() === "font" && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  const url = new URL(baseURL ?? "http://127.0.0.1:4173/");
  url.search = "?view=font&theme=gavia";
  await page.goto(url.href);
  const fontPage = page.getByTestId("font-page");
  await expect(fontPage).toBeVisible();
  await expect(page.locator(".pg-top")).toHaveCount(1);
  await expect(page.locator("html")).toHaveAttribute("data-wl-theme", "gavia");
  await expect(fontPage.locator(".wl-weights-row")).toHaveCount(6);
  await expect(fontPage.locator(".wl-type-footer-note")).toContainText("Gavia 0.6");
  await expect(fontPage.getByText('import "gavia-ui/styles/fonts/gavia.css";', { exact: true })).toHaveCount(1);
  await expect(fontPage.locator(".pg-site-header")).toHaveCount(0);
  for (const weight of weights) {
    await expect(fontPage.locator(`.wl-weights-row[data-weight="${weight}"]`)).toBeVisible();
  }
  const faces = await page.evaluate(async (fontWeights) => {
    const loaded = [];
    for (const weight of fontWeights) for (const style of ["normal", "italic"]) {
      const fonts = await document.fonts.load(`${style} ${weight} 16px Gavia`, "Гавиа Gavia 0123456789");
      loaded.push({ weight, style, faces: fonts.length });
    }
    return loaded;
  }, weights);
  expect(faces).toHaveLength(12);
  for (const face of faces) expect(face.faces, `${face.weight} ${face.style} loads a real font face`).toBe(1);

  await fontPage.getByRole("textbox", { name: "Свой текст", exact: true }).fill("Гагара / Loon 0123456789");
  await fontPage.getByRole("combobox", { name: "Вес", exact: true }).selectOption("600");
  const size = fontPage.getByRole("slider", { name: "Размер", exact: true });
  await size.focus();
  await size.press("End");
  const proof = fontPage.locator(".wl-type-proof-sample");
  await expect(proof).toHaveText("Гагара / Loon 0123456789");
  await expect(proof).toHaveAttribute("data-weight", "600");
  await expect(proof).toHaveAttribute("data-size", "72");
  await fontPage.getByRole("button", { name: "English", exact: true }).click();
  await expect(fontPage).toHaveAttribute("lang", "en");
  await fontPage.getByRole("group", { name: "Sample style", exact: true }).getByRole("button", { name: "Italic", exact: true }).click();
  await expect(proof).toHaveAttribute("data-font-style", "italic");
  await expect(proof).toHaveCSS("font-weight", "600");
  await expect(proof).toHaveCSS("font-style", "italic");
  await expect(proof).toHaveText("Гагара / Loon 0123456789");
  await expect(fontPage.locator('.wl-weights-row[data-font-style="italic"]')).toHaveCount(6);

  for (const theme of ["White", "Graphite", "Newspaper", "Gavia"]) {
    await chooseShowcaseTheme(page, theme);
    expect(new URL(page.url()).searchParams.get("view")).toBe("font");
    await expect(fontPage.locator(".wl-type-display")).toHaveCSS("font-family", /^"?Gavia"?,/);
    await expect(fontPage.locator(".wl-type-number-sample").first()).toHaveCSS("font-family", /^"?Gavia"?,/);
    await expect(fontPage.locator(".wl-weights-digits").first()).toHaveCSS("font-family", /^"?Gavia"?,/);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  }

  await navigateMainView(page, "Документация");
  await expect(page.getByTestId("docs-page")).toBeVisible();
  await navigateMainView(page, "Шрифт");
  await expect(fontPage).toBeVisible();
  expect(new URL(page.url()).pathname).toBe(url.pathname);
  expect(new URL(page.url()).searchParams.get("theme")).toBe("gavia");
  await page.goBack();
  await expect(page.getByTestId("docs-page")).toBeVisible();
  await page.goForward();
  await expect(fontPage).toBeVisible();
  await page.reload();
  await expect(fontPage).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-wl-theme", "gavia");
  await page.locator(".pg-top").getByRole("button", { name: "Поиск", exact: true }).click();
  const palette = page.getByRole("dialog", { name: "Командная палитра", exact: true });
  await palette.getByRole("combobox", { name: "Командная палитра", exact: true }).fill("шрифт");
  await expect(palette.getByText("Шрифт Gavia", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  expect(errors).toEqual([]);
});

test("tabular and proportional numbers use different spacing without changing the glyphs", async ({ page, baseURL }) => {
  const url = new URL(baseURL ?? "http://127.0.0.1:4173/");
  url.search = "?view=font&theme=white";
  await page.goto(url.href);
  const fontPage = page.getByTestId("font-page");
  await expect(fontPage).toBeVisible();
  await page.evaluate(() => document.fonts.load("normal 400 38px Gavia", "11 111,00 88 888,00"));
  const widths = await fontPage.locator(".wl-type-number-sample").evaluateAll((cards) => cards.map((card) =>
    Array.from(card.querySelectorAll(".wl-type-number-line")).slice(0, 2).map((line) => {
      const range = document.createRange();
      range.selectNodeContents(line);
      return range.getBoundingClientRect().width;
    })
  ));
  expect(widths).toHaveLength(2);
  expect(widths[0]![0]).toBeCloseTo(widths[0]![1]!, 1);
  expect(Math.abs(widths[1]![0]! - widths[1]![1]!)).toBeGreaterThan(1);
  await expect(fontPage.getByRole("link", { name: "К документации UI Kit", exact: false })).toHaveAttribute("href", "?view=docs&theme=white");
  await fontPage.getByRole("link", { name: "К документации UI Kit", exact: false }).click();
  await expect(page.getByTestId("docs-page")).toBeVisible();
  expect(new URL(page.url()).pathname).toBe(url.pathname);
  expect(new URL(page.url()).searchParams.get("theme")).toBe("white");
});
