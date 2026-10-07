import { expect, test, type Locator, type Page } from "@playwright/test";
import { chooseDropdownOption } from "./select-helpers";

function gaviaUrl(baseURL: string | undefined, view: string): string {
  const url = new URL(baseURL ?? "http://127.0.0.1:4173/");
  url.search = new URLSearchParams({ view, theme: "gavia" }).toString();
  return url.href;
}

async function readyForDrawing(page: Page): Promise<void> {
  // Unlike the classic geometry baselines, this suite must use the shipped font.
  await expect(page.locator("html")).toHaveAttribute("data-wl-theme", "gavia");
  await expect(page.locator("body")).toHaveCSS("font-family", /^"?Gavia Sans"?,/);
  const faces = await page.evaluate(async () => {
    const loaded = [];
    for (const weight of [100, 300, 400, 500, 600, 700]) {
      for (const style of ["normal", "italic"]) {
        loaded.push((await document.fonts.load(`${style} ${weight} 16px 'Gavia Sans'`, "Гавиа Gavia 0123456789")).length);
      }
    }
    await document.fonts.ready;
    return loaded;
  });
  expect(faces).toEqual(Array.from({ length: 12 }, () => 1));
  await page.mouse.move(0, 0);
}

async function prepareSectionCrops(page: Page): Promise<void> {
  // Tall element screenshots temporarily expand the viewport. Keep a sticky
  // header from being painted into their crop; its real layout has its own PNG.
  await page.addStyleTag({ content: "html { scroll-behavior: auto; } .pg-top { position: static; }" });
}

async function capture(target: Locator, name: string): Promise<void> {
  await target.scrollIntoViewIfNeeded();
  await target.locator("img").evaluateAll(async (images) => {
    await Promise.all(images.map((image) => (image as HTMLImageElement).decode()));
  });
  const page = target.page();
  const viewport = page.viewportSize();
  const bounds = await target.boundingBox();
  // Chromium may leave beyond-viewport glyph rows unpainted. Fit tall sections
  // in the capture viewport while keeping the responsive width unchanged.
  if (viewport && bounds && bounds.height + 200 > viewport.height) {
    await page.setViewportSize({ width: viewport.width, height: Math.ceil(bounds.height) + 200 });
  }
  try {
    await target.evaluate((element) => {
      if (!element.closest(".wl-overlay, .wl-dialog")) {
        window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
      }
    });
    await page.evaluate(async () => {
      // A resized capture viewport needs a complete paint before Chromium clips it.
      for (let frame = 0; frame < 3; frame += 1) {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      }
    });
    if (process.env.GAVIA_VISUAL_REVIEW === "1") {
      // Review artifacts are never accepted automatically as reference images.
      await target.screenshot({ path: test.info().outputPath(`review-${name}`), animations: "disabled", caret: "hide", scale: "css" });
    }
    // Compare every image in the batch, even when an earlier image differs.
    await expect.soft(target).toHaveScreenshot(name, { maxDiffPixelRatio: name.startsWith("gavia-font-") ? 0.0002 : 0.002 });
  } finally {
    if (viewport) await page.setViewportSize(viewport);
  }
}

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-10-01T12:00:00Z"));
});

test("gavia: home hero, installation grid and project panels", async ({ page, baseURL }) => {
  await page.goto(gaviaUrl(baseURL, "home"), { waitUntil: "domcontentloaded" });
  const home = page.getByTestId("home-page");
  await expect(home).toBeVisible();
  await readyForDrawing(page);
  await capture(page.locator(".pg-top"), "gavia-header.png");
  await prepareSectionCrops(page);
  // Preserve page spacing and fonts; crops cover the responsive layout.
  await capture(home.locator(".home-hero"), "gavia-home-hero.png");
  await capture(home.locator(".home-onboarding"), "gavia-home-onboarding.png");
  await capture(home.locator(".home-project-grid"), "gavia-home-projects.png");
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});

test("gavia: Cyrillic, Latin, numeral spacing and all six weights", async ({ page, baseURL }) => {
  await page.goto(gaviaUrl(baseURL, "font"), { waitUntil: "domcontentloaded" });
  const font = page.getByTestId("font-page");
  await expect(font).toBeVisible();
  await readyForDrawing(page);
  await prepareSectionCrops(page);
  await capture(font.locator(".wl-type-hero"), "gavia-font-hero.png");
  await capture(font.locator("#wl-type-proof"), "gavia-font-alphabets.png");
  await capture(font.locator("#wl-type-weights"), "gavia-font-weights.png");
  await capture(font.locator("#wl-type-numbers"), "gavia-font-numerals.png");
});

test("gavia: form, selected control and dialog with actual font", async ({ page, baseURL }) => {
  await page.goto(gaviaUrl(baseURL, "system"), { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Единый язык интерфейсов" })).toBeVisible();
  await readyForDrawing(page);
  await prepareSectionCrops(page);
  await page.locator('[data-testid="ds-recipes"] [data-recipe="ProfileForm"]').first().click();
  const recipe = page.getByTestId("ds-recipe-preview");
  await expect(recipe).toHaveAttribute("data-recipe", "ProfileForm");
  await expect(recipe.locator(":scope > :first-child")).toBeVisible();
  await capture(recipe, "gavia-profile-form.png");

  const explorer = page.getByTestId("ds-explorer");
  const preview = page.getByTestId("ds-example-preview");
  for (const component of ["WlSelect", "WlDialog"]) {
    await chooseDropdownOption(page, page.getByRole("combobox", { name: "Компонент", exact: true }), component);
    await expect(explorer).toHaveAttribute("data-component", component);
    await expect(preview.locator(":scope > .wl-stack")).toBeVisible();
    if (component === "WlSelect") {
      await preview.getByRole("combobox", { name: "Область" }).press("Enter");
      const overlay = page.locator(".wl-select-overlay");
      await expect(overlay).not.toHaveClass(/wl-pop-motion-enter-/);
      await expect(overlay).toHaveCSS("transform", "none");
      await capture(page.getByRole("listbox"), "gavia-select-open.png");
    } else {
      await preview.getByRole("button", { name: "Открыть диалог" }).press("Enter");
      await capture(page.getByRole("dialog", { name: "Сведения о материале" }), "gavia-dialog.png");
    }
    await page.keyboard.press("Escape");
    await expect(page.locator(".wl-select-overlay, .wl-dialog")).toHaveCount(0);
  }
});
