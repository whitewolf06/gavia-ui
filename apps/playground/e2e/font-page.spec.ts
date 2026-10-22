import { expect, test } from "@playwright/test";
import { expectGaviaFontDownload } from "./font-download-helpers";
import { playgroundBasePath, playgroundRouteParams, russianPlaygroundUrl } from "./playground-url";
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
  await page.goto(russianPlaygroundUrl(url.href));
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
      loaded.push({ weight, style, fonts: fonts.map((font) => ({
        family: font.family, weight: font.weight, style: font.style, status: font.status, unicodeRange: font.unicodeRange
      })) });
    }
    return loaded;
  }, weights);
  expect(faces).toHaveLength(12);
  expect(await page.evaluate(async () => (await document.fonts.load("normal 400 16px Gavia", "Гавиа 0123456789")).length)).toBe(2);
  for (const face of faces) {
    expect(face.fonts, `${face.weight} ${face.style} loads the Full/Core pair`).toHaveLength(2);
    expect(new Set(face.fonts.map((font) => font.unicodeRange)).size).toBe(2);
    for (const font of face.fonts) {
      expect(font).toMatchObject({ family: "Gavia Sans", weight: "100 700", style: face.style, status: "loaded" });
    }
  }

  await fontPage.getByRole("textbox", { name: "Свой текст", exact: true }).fill("Гагара / Loon 0123456789");
  const proof = fontPage.locator(".wl-type-proof-sample");
  const weight = fontPage.getByRole("slider", { name: "Вес", exact: true });
  const preset = fontPage.getByRole("combobox", { name: "Готовый вес", exact: true });
  await expect(weight).toHaveAttribute("min", "100");
  await expect(weight).toHaveAttribute("max", "700");
  await expect(weight).toHaveAttribute("step", "1");
  await weight.focus();
  await weight.press("Home");
  await expect(proof).toHaveCSS("font-weight", "100");
  await weight.press("ArrowRight");
  await expect(proof).toHaveCSS("font-weight", "101");
  await expect(preset).toContainText("Промежуточный вес");
  await weight.press("End");
  await expect(proof).toHaveCSS("font-weight", "700");
  await expect(preset).toContainText("700");
  await weight.evaluate((element: HTMLInputElement) => {
    element.value = "450";
    element.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await expect(proof).toHaveCSS("font-weight", "450");
  await expect(fontPage.locator('output[for="wl-type-proof-variable-weight"]')).toHaveText("450");
  for (const alphabet of await fontPage.locator(".wl-type-alphabet-sample").all()) {
    await expect(alphabet).toHaveCSS("font-weight", "450");
  }
  await chooseDropdownOption(page, preset, "600 — Полужирный");
  await expect(weight).toHaveValue("600");
  const size = fontPage.getByRole("slider", { name: "Размер", exact: true });
  await size.focus();
  await size.press("End");
  await expect(proof).toHaveText("Гагара / Loon 0123456789");
  await expect(proof).toHaveAttribute("data-weight", "600");
  await expect(proof).toHaveAttribute("data-size", "72");
  await fontPage.getByRole("button", { name: "English", exact: true }).click();
  await expect(fontPage).toHaveAttribute("lang", "ru");
  await expect(fontPage.locator(".wl-type-body-copy")).toHaveAttribute("lang", "en");
  await fontPage.getByRole("group", { name: "Начертание образцов", exact: true }).getByRole("button", { name: "Курсив", exact: true }).click();
  await expect(proof).toHaveAttribute("data-font-style", "italic");
  await expect(proof).toHaveCSS("font-weight", "600");
  await expect(proof).toHaveCSS("font-style", "italic");
  await expect(proof).toHaveText("Гагара / Loon 0123456789");
  await expect(fontPage.locator('.wl-weights-row[data-font-style="italic"]')).toHaveCount(6);

  for (const theme of ["Classic", "Classic Dark", "Newspaper", "Gavia Dark", "Gavia"]) {
    await chooseShowcaseTheme(page, theme);
    expect(playgroundRouteParams(new URL(page.url())).get("view")).toBe("font");
    const headingFamily = await fontPage.locator(".wl-page-header__title").evaluate((element) => getComputedStyle(element).fontFamily);
    await expect(fontPage.locator(".wl-type-display")).toHaveCSS("font-family", headingFamily);
    await expect(fontPage.locator(".wl-type-display")).toHaveCSS("text-rendering", theme.startsWith("Gavia") ? "geometricprecision" : "optimizelegibility");
    await expect(fontPage.locator(".wl-type-number-sample").first()).toHaveCSS("font-family", /^"?Gavia Sans"?,/);
    await expect(fontPage.locator(".wl-weights-digits").first()).toHaveCSS("font-family", /^"?Gavia Sans"?,/);
    await expect(page.locator("body")).toHaveCSS("text-rendering", theme.startsWith("Gavia") ? "geometricprecision" : "optimizelegibility");
    for (const sample of [".wl-type-number-sample", ".wl-weights-digits"]) {
      await expect(fontPage.locator(sample).first()).toHaveCSS("text-rendering", "geometricprecision");
    }
    await expect.poll(() => page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth
    )).toBeLessThanOrEqual(1);
  }

  await navigateMainView(page, "Документация");
  await expect(page.getByTestId("docs-page")).toBeVisible();
  await navigateMainView(page, "Шрифт");
  await expect(fontPage).toBeVisible();
  expect(playgroundBasePath(new URL(page.url()))).toBe(url.pathname);
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
  await page.goto(russianPlaygroundUrl(url.href));
  const fontPage = page.getByTestId("font-page");
  await expect(fontPage).toBeVisible();
  const samples = await fontPage.locator(".wl-type-number-sample").evaluateAll(async (cards) => {
    const loaded = await Promise.all(cards.map(async (card) => {
      const style = getComputedStyle(card);
      const family = style.fontFamily.split(",")[0]!.trim();
      const faces = await document.fonts.load(`${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${family}`, card.textContent ?? "");
      return { card, faces };
    }));
    await document.fonts.ready;
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    return loaded.map(({ card, faces }) => {
      const style = getComputedStyle(card);
      const lines = Array.from(card.querySelectorAll(".wl-type-number-line")).slice(0, 2);
      return {
        family: style.fontFamily.split(",")[0]!.trim().replace(/["']/g, ""),
        weight: style.fontWeight,
        numeric: style.fontVariantNumeric,
        faces: faces.map((face) => ({ family: face.family.replace(/["']/g, ""), weight: face.weight, status: face.status })),
        text: lines.map((line) => line.textContent),
        widths: lines.map((line) => {
          // Measure rendered advances under the page's inherited font settings.
          const probe = document.createElement("span");
          probe.textContent = line.textContent;
          probe.style.cssText = "position:absolute;display:inline-block;inline-size:max-content;white-space:pre";
          line.append(probe);
          try {
            return probe.getBoundingClientRect().width;
          } finally {
            probe.remove();
          }
        })
      };
    });
  });
  expect(samples).toHaveLength(2);
  for (const sample of samples) {
    expect(sample.family).toBe("Gavia Sans");
    expect(sample.weight).toBe("400");
    expect(sample.faces).toEqual(Array.from({ length: 2 }, () => ({ family: "Gavia Sans", weight: "100 700", status: "loaded" })));
    expect(sample.widths).toHaveLength(2);
  }
  expect(samples[0]!.numeric).toBe("tabular-nums");
  expect(samples[1]!.numeric).toBe("proportional-nums");
  expect(samples[1]!.text).toEqual(samples[0]!.text);
  expect(samples[0]!.widths[0]).toBeCloseTo(samples[0]!.widths[1]!, 1);
  expect(Math.abs(samples[1]!.widths[0]! - samples[1]!.widths[1]!)).toBeGreaterThan(1);
  const matrix = await fontPage.locator(".wl-type-number-tabular").evaluate(async (card, fontWeights) => {
    const family = getComputedStyle(card).fontFamily.split(",")[0]!.trim();
    const rows = [];
    for (const weight of fontWeights) for (const fontStyle of ["normal", "italic"]) {
      const faces = await document.fonts.load(`${fontStyle} ${weight} 38px ${family}`, "0123456789");
      for (const size of [13, 16, 25, 34, 38, 42]) {
        const probe = document.createElement("span");
        probe.style.cssText = "position:absolute;display:inline-block;inline-size:max-content;white-space:pre;"
          + `font-weight:${weight};font-style:${fontStyle};font-size:${size}px`;
        card.append(probe);
        try {
          const style = getComputedStyle(probe);
          const widths = Array.from("0123456789", (digit) => {
            probe.textContent = digit.repeat(5);
            return probe.getBoundingClientRect().width;
          });
          rows.push({ weight, fontStyle, size, numeric: style.fontVariantNumeric, rendering: style.textRendering, widths,
            faces: faces.map((face) => ({ family: face.family.replace(/["']/g, ""), weight: face.weight, style: face.style, status: face.status })) });
        } finally { probe.remove(); }
      }
    }
    return rows;
  }, weights);
  expect(matrix).toHaveLength(72);
  for (const row of matrix) {
    const label = `${row.weight} ${row.fontStyle} ${row.size}px`;
    expect(row.faces, `${label} uses its loaded variable Full/Core pair`).toEqual(Array.from({ length: 2 }, () => ({
      family: "Gavia Sans", weight: "100 700", style: row.fontStyle, status: "loaded"
    })));
    expect(row.numeric).toBe("tabular-nums");
    expect(row.rendering).toBe("geometricprecision");
    expect(row.widths).toHaveLength(10);
    for (const width of row.widths) expect(width, `${label}: all ten tabular digits have equal advances`).toBeCloseTo(row.widths[0]!, 1);
  }

  const nestedRendering = await page.evaluate(() => {
    const theme = document.createElement("div");
    theme.dataset.wlTheme = "gavia";
    const inherited = document.createElement("span");
    const nestedWhite = document.createElement("span");
    nestedWhite.dataset.wlTheme = "white";
    theme.append(inherited, nestedWhite);
    document.body.append(theme);
    try {
      return { gavia: getComputedStyle(inherited).textRendering, white: getComputedStyle(nestedWhite).textRendering };
    } finally {
      theme.remove();
    }
  });
  expect(nestedRendering).toEqual({ gavia: "geometricprecision", white: "optimizelegibility" });
  const docsLink = fontPage.getByRole("link", { name: "К документации UI Kit", exact: false });
  const docsHref = new URL((await docsLink.getAttribute("href"))!, page.url());
  expect(playgroundRouteParams(docsHref).get("view")).toBe("docs");
  expect(playgroundRouteParams(docsHref).get("lang")).toBe("ru");
  expect(docsHref.searchParams.get("theme")).toBe("white");
  await fontPage.getByRole("link", { name: "К документации UI Kit", exact: false }).click();
  await expect(page.getByTestId("docs-page")).toBeVisible();
  expect(playgroundBasePath(new URL(page.url()))).toBe(url.pathname);
  expect(new URL(page.url()).searchParams.get("theme")).toBe("white");
});

test("font download contains the approved family, standalone CSS and OFL licenses", async ({ page, baseURL }) => {
  const url = new URL(baseURL ?? "http://127.0.0.1:4173/");
  url.search = "?view=font&theme=gavia";
  await page.goto(russianPlaygroundUrl(url.href));
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
