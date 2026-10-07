import { expect, test } from "@playwright/test";
import { expectGaviaFontDownload } from "./font-download-helpers";
import { chooseDropdownOption, chooseShowcaseTheme, navigateMainView } from "./select-helpers";

const weights = [100, 300, 400, 500, 600, 700] as const;

test("font page keeps theme-aware navigation, real Gavia Sans faces and editable samples", async ({ page, baseURL }) => {
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
  await expect(fontPage.getByRole("heading", { level: 1, name: "Gavia Sans", exact: true })).toBeVisible();
  await expect(fontPage.locator("h1")).toHaveCount(1);
  await expect(fontPage.locator("#wl-type-hero-title")).toHaveJSProperty("tagName", "H2");
  await expect(page.locator(".pg-top")).toHaveCount(1);
  await expect(page.locator("html")).toHaveAttribute("data-wl-theme", "gavia");
  await expect(fontPage.locator(".wl-weights-row")).toHaveCount(6);
  await expect(fontPage.locator(".wl-type-footer-note")).toContainText("Gavia Sans 0.6");
  await expect(fontPage.getByText('import "gavia-ui/styles/fonts/gavia.css";', { exact: true })).toHaveCount(1);
  await expect(fontPage.locator(".pg-site-header")).toHaveCount(0);
  for (const weight of weights) {
    await expect(fontPage.locator(`.wl-weights-row[data-weight="${weight}"]`)).toBeVisible();
  }
  const faces = await page.evaluate(async (fontWeights) => {
    const loaded = [];
    for (const weight of fontWeights) for (const style of ["normal", "italic"]) {
      const fonts = await document.fonts.load(`${style} ${weight} 16px 'Gavia Sans'`, "Гавиа Gavia 0123456789");
      loaded.push({ weight, style, faces: fonts.length });
    }
    return loaded;
  }, weights);
  expect(faces).toHaveLength(12);
  expect(await page.evaluate(async () => (await document.fonts.load("normal 400 16px Gavia", "Гавиа 0123456789")).length)).toBe(1);
  for (const face of faces) expect(face.faces, `${face.weight} ${face.style} loads a real font face`).toBe(1);

  await fontPage.getByRole("textbox", { name: "Свой текст", exact: true }).fill("Гагара / Loon 0123456789");
  await chooseDropdownOption(page, fontPage.getByRole("combobox", { name: "Вес", exact: true }), "600 — Полужирный");
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
    await expect(fontPage.locator(".wl-type-display")).toHaveCSS("font-family", /^"?Gavia Sans"?,/);
    await expect(fontPage.locator(".wl-type-number-sample").first()).toHaveCSS("font-family", /^"?Gavia Sans"?,/);
    await expect(fontPage.locator(".wl-weights-digits").first()).toHaveCSS("font-family", /^"?Gavia Sans"?,/);
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
  await expect(palette.getByText("Шрифт Gavia Sans", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  expect(errors).toEqual([]);
});

test("tabular and proportional numbers use different spacing without changing the glyphs", async ({ page, baseURL }) => {
  const url = new URL(baseURL ?? "http://127.0.0.1:4173/");
  url.search = "?view=font&theme=white";
  await page.goto(url.href);
  const fontPage = page.getByTestId("font-page");
  await expect(fontPage).toBeVisible();
  await page.evaluate(() => document.fonts.load("normal 400 38px 'Gavia Sans'", "11 111,00 88 888,00"));
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


test("font download contains the approved family, standalone CSS and OFL licenses", async ({ page, baseURL }) => {
  const url = new URL(baseURL ?? "http://127.0.0.1:4173/");
  url.search = "?view=font&theme=gavia";
  await page.goto(url.href);
  const font = page.getByTestId("font-page");
  await expect(font).toBeVisible();
  await expect(font.locator("[data-wl=segmented]")).toHaveCount(3);
  await expect(font.locator("[data-wl=select]")).toHaveCount(1);
  await expect(font.locator("[data-wl=slider]")).toHaveCount(1);
  await expect(font.locator("[data-wl=textarea]")).toHaveCount(1);
  await expect(font.locator("[data-wl=input]")).toHaveCount(1);
  await expect(font.locator("kbd")).toHaveCount(0);
  await expectGaviaFontDownload(page, font.getByRole("link", { name: "Скачать Gavia Sans 0.6", exact: true }).first());
  const footer = page.locator(".pg-footer").getByRole("link", { name: "Скачать шрифт Gavia Sans", exact: true });
  await expect(footer).toHaveAttribute("href", url.pathname + "downloads/Gavia-Sans-0.6.zip");
});
