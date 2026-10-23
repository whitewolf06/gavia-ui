import { expect, type Response, test } from "@playwright/test";

function recordFontResponse(response: Response, pending: Promise<{ url: string; bytes: number }>[]) {
  if (response.request().resourceType() === "font") {
    pending.push(response.body().then((body) => ({ url: response.url(), bytes: body.length })));
  }
}

test("home uses only Core within its transfer budget", async ({ page, baseURL }) => {
  const pending: Promise<{ url: string; bytes: number }>[] = [];
  const observeFont = (response: Response) => recordFontResponse(response, pending);
  page.on("response", observeFont);
  const url = new URL(baseURL!);
  url.search = "?lang=en&theme=gavia";
  await page.goto(url.href);
  await expect(page.getByTestId("home-page")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const fonts = await Promise.all(pending);
  page.off("response", observeFont);
  expect(fonts.map((font) => font.url)).toEqual([
    expect.stringMatching(/Gavia-Variable-Core[^/]*\.woff2(?:[?#].*)?$/u)
  ]);
  expect(fonts[0]!.bytes).toBeGreaterThan(0);
  expect(fonts[0]!.bytes).toBeLessThanOrEqual(80_000);
  const transfer = await page.evaluate(() => performance.getEntriesByType("resource")
    .filter((entry) => /\.woff2(?:[?#].*)?$/u.test(entry.name))
    .reduce((sum, entry) => sum + (entry as PerformanceResourceTiming).transferSize, 0));
  expect(Math.max(transfer, fonts[0]!.bytes)).toBeLessThanOrEqual(90_000);
});

test("complete grapheme shaping @cross-browser", async ({ page, baseURL }, testInfo) => {
  await page.goto(new URL("?lang=en&theme=gavia", baseURL!).href);
  await expect(page.getByTestId("home-page")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const comparisons = await page.evaluate(async () => {
    function fontRules(rules: CSSRuleList): CSSFontFaceRule[] {
      return Array.from(rules).flatMap((rule) => {
        if (rule.type === CSSRule.FONT_FACE_RULE) return [rule as CSSFontFaceRule];
        return "cssRules" in rule ? fontRules((rule as CSSGroupingRule).cssRules) : [];
      });
    }
    const declarations = Array.from(document.styleSheets).flatMap((sheet) => fontRules(sheet.cssRules));
    const cases = ["a\u0301", "a\u0323\u0301", "Ж\u0301", "Ĩ Ī", "Қ Ӝ Ґ Ѣ", "Гавиа Gavia 0123456789"];
    const results: { style: string; text: string; differentBytes: number; widthDifference: number }[] = [];
    const canvas = document.createElement("canvas");
    canvas.width = 1000;
    canvas.height = 128;
    const context = canvas.getContext("2d")!;
    function draw(text: string, style: string, family: string) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.font = `${style} 450 42px "${family}"`;
      context.textBaseline = "alphabetic";
      context.fillText(text, 30, 85);
      return { pixels: context.getImageData(0, 0, canvas.width, canvas.height).data, width: context.measureText(text).width };
    }
    for (const style of ["normal", "italic"]) {
      const full = declarations.find((rule) => rule.style.getPropertyValue("font-family").replace(/["']/gu, "") === "Gavia Sans"
        && rule.style.getPropertyValue("font-weight") === "100 700" && rule.style.getPropertyValue("font-style") === style
        && !rule.style.getPropertyValue("src").includes("-Core"));
      if (!full) throw new Error("Missing complete Gavia face: " + style);
      const family = "Gavia complete reference " + style;
      const reference = new FontFace(family, full.style.getPropertyValue("src"), { style, weight: "100 700" });
      document.fonts.add(await reference.load());
      for (const text of cases) {
        await document.fonts.load(`${style} 450 42px "Gavia Sans"`, text);
        await document.fonts.ready;
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        const actual = draw(text, style, "Gavia Sans");
        const expected = draw(text, style, family);
        let differentBytes = 0;
        for (let index = 0; index < actual.pixels.length; index++) {
          if (actual.pixels[index] !== expected.pixels[index]) differentBytes++;
        }
        results.push({ style, text, differentBytes, widthDifference: actual.width - expected.width });
      }
      document.fonts.delete(reference);
    }
    return results;
  });
  await testInfo.attach("font-shaping", { body: JSON.stringify(comparisons, null, 2), contentType: "application/json" });
  expect(comparisons).toHaveLength(12);
  for (const result of comparisons) {
    expect(result.differentBytes, result.style + " " + result.text).toBe(0);
    expect(result.widthDifference, result.style + " " + result.text).toBe(0);
  }
});
