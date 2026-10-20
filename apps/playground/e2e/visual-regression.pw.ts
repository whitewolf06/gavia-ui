import { expect, type Locator, test } from "@playwright/test";
import { russianPlaygroundUrl } from "./playground-url";
import { chooseDropdownOption, chooseShowcaseTheme } from "./select-helpers";
const themes = [{ name: "white", label: "Classic" }, { name: "graphite", label: "Classic Dark" }, { name: "newspaper", label: "Newspaper" }];
// Keep a configured production subpath when comparing the same built showcase.
const showcaseUrl = new URL("?view=system", process.env.GAVIA_E2E_BASE_URL ?? "http://127.0.0.1:4173/").href;
async function review(target: Locator, name: string): Promise<void> {
  if (process.env.GAVIA_VISUAL_REVIEW === "1") {
    // Review artifacts are never accepted automatically as reference images.
    await target.screenshot({ path: test.info().outputPath(`review-${name}`), animations: "disabled", caret: "hide", scale: "css" });
  }
}

async function captureLongContent(target: Locator, name: string): Promise<void> {
  await target.scrollIntoViewIfNeeded();
  const page = target.page();
  const viewport = page.viewportSize();
  const bounds = await target.boundingBox();
  // Fit the tall example without changing its responsive width. Automatic
  // beyond-viewport crops can include glyph rows from the preceding section.
  if (viewport && bounds && bounds.height + 200 > viewport.height) {
    await page.setViewportSize({ width: viewport.width, height: Math.ceil(bounds.height) + 200 });
  }
  try {
    await target.evaluate((element) => {
      window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
    });
    await page.evaluate(async () => {
      for (let frame = 0; frame < 3; frame += 1) {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      }
    });
    await expect.soft(target).toHaveScreenshot(name);
    await review(target, name);
  } finally {
    if (viewport) await page.setViewportSize(viewport);
  }
}

async function alignMobileAttachmentCrop(preview: Locator, project: string, recipe: string): Promise<string | undefined> {
  if (project !== "mobile" || recipe !== "AttachmentUpload") return undefined;
  await preview.scrollIntoViewIfNeeded();
  // This crop checks the drawing, independently of the catalog's position.
  // A fractional document origin encloses one extra bottom-border pixel.
  // Preserve dimensions/styles and align only its screenshot raster origin.
  return await preview.evaluate((element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const original = element.style.transform;
    const documentTop = rect.top + window.scrollY;
    element.style.transform = `translateY(${Math.round(documentTop) - documentTop}px)`;
    return original;
  });
}

async function restoreCropTransform(preview: Locator, transform: string | undefined): Promise<void> {
  if (transform === undefined) return;
  await preview.evaluate((element: HTMLElement, value) => {
    element.style.transform = value;
  }, transform);
}

test.beforeEach(async ({ page }) => {
  // Fixed time and locally available fonts prevent unrelated machine/date changes.
  await page.clock.setFixedTime(new Date("2026-10-01T12:00:00Z"));
  await page.goto(russianPlaygroundUrl(showcaseUrl), { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: "Дизайн-система" }).waitFor({ state: "visible" });
  // Capture the example itself: the showcase header must not cover tall mobile screens.
  // Functional tests retain the actual sticky header and normal viewport.
  await page.addStyleTag({ content: "html { --wl-font: Arial, sans-serif; --wl-mono: Consolas, monospace; scroll-behavior: auto; } .pg-top { position: static; }" });
  await page.evaluate(() => document.fonts.ready);
});

for (const theme of themes) {
  test(`${theme.name}: six complete screens`, async ({ page }, testInfo) => {
    await chooseShowcaseTheme(page, theme.label);
    for (const id of ["MaterialList", "ProfileForm", "Preferences", "MaterialDetail", "ProjectWizard", "AttachmentUpload"]) {
      await page.locator(`[data-testid="ds-recipes"] [data-recipe="${id}"]`).first().click();
      const preview = page.getByTestId("ds-recipe-preview");
      await expect(preview).toHaveAttribute("data-recipe", id);
      await expect(preview.locator(":scope > :first-child")).toBeVisible();
      await page.mouse.move(0, 0);
      const transform = await alignMobileAttachmentCrop(preview, testInfo.project.name, id);
      try {
        // Compare the entire recipe batch so one difference cannot hide later screens.
        await expect.soft(preview).toHaveScreenshot(`${theme.name}-recipe-${id}.png`);
        await review(preview, `${theme.name}-recipe-${id}.png`);
      } finally {
        await restoreCropTransform(preview, transform);
      }
    }
    await captureLongContent(page.getByTestId("ds-stress"), `${theme.name}-long-content.png`);
  });

  test(`${theme.name}: interactive states and overlay focus`, async ({ page }) => {
    await chooseShowcaseTheme(page, theme.label);
    const explorer = page.getByTestId("ds-explorer");
    const preview = page.getByTestId("ds-example-preview");
    async function select(name: string): Promise<void> {
      await page.getByRole("combobox", { name: "Компонент", exact: true }).click();
      await page.getByRole("listbox").getByRole("option", { name, exact: true }).click();
      await expect(explorer).toHaveAttribute("data-component", name);
      await expect(preview.locator(":scope > .wl-stack")).toBeVisible();
      // Finish removing the component picker before opening an overlay in its preview.
      await expect(page.locator(".wl-select-overlay")).toHaveCount(0);
    }
    await select("WlButton");
    await chooseDropdownOption(page, explorer.getByRole("combobox", { name: "Пример: variant", exact: true }), "primary");
    await explorer.getByRole("button", { name: "Проверить фокус" }).press("Enter");
    await expect(preview.getByRole("button", { name: "Добавить" })).toBeFocused();
    await expect.soft(preview).toHaveScreenshot(`${theme.name}-button-focus.png`);
    await review(preview, `${theme.name}-button-focus.png`);
    await select("WlInput");
    await explorer.getByRole("checkbox", { name: "invalid", exact: true }).check();
    await page.mouse.move(0, 0);
    await expect.soft(preview).toHaveScreenshot(`${theme.name}-input-invalid.png`);
    await review(preview, `${theme.name}-input-invalid.png`);
    await select("WlSelect");
    await preview.getByRole("combobox", { name: "Область" }).press("Enter");
    // Vue removes entry classes on animation frames even with reduced motion.
    // Wait for the actual final geometry before cropping the list's screenshot.
    const selectOverlay = page.locator(".wl-select-overlay");
    await expect(selectOverlay).not.toHaveClass(/wl-pop-motion-enter-/);
    await expect(selectOverlay).toHaveCSS("transform", "none");
    // This cropped image checks the list's drawing, independently of placement.
    // A fractional fixed top changes glyph rasterization by a pixel between crops.
    // Preserve fonts, dimensions and styles, and align only the raster origin.
    await selectOverlay.evaluate((element: HTMLElement) => {
      for (const axis of ["top", "left"] as const) {
        element.style[axis] = `${Math.round(Number.parseFloat(element.style[axis]))}px`;
      }
    });
    await page.mouse.move(0, 0);
    await expect.soft(page.getByRole("listbox")).toHaveScreenshot(`${theme.name}-select-open.png`);
    await review(page.getByRole("listbox"), `${theme.name}-select-open.png`);
    await page.keyboard.press("Escape");
    await select("WlDialog");
    await preview.getByRole("button", { name: "Открыть диалог" }).press("Enter");
    await expect.soft(page.getByRole("dialog", { name: "Сведения о материале" })).toHaveScreenshot(`${theme.name}-dialog.png`);
    await review(page.getByRole("dialog", { name: "Сведения о материале" }), `${theme.name}-dialog.png`);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Сведения о материале" })).toHaveCount(0);
    await select("WlDrawer");
    await preview.getByRole("button", { name: "Открыть панель" }).press("Enter");
    await expect.soft(page.getByRole("dialog", { name: "О материале" })).toHaveScreenshot(`${theme.name}-drawer.png`);
    await review(page.getByRole("dialog", { name: "О материале" }), `${theme.name}-drawer.png`);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "О материале" })).toHaveCount(0);
    await page.locator(".pg-top").getByRole("button", { name: /^Поиск/ }).press("Enter");
    await expect.soft(page.locator(".wl-command-palette")).toHaveScreenshot(`${theme.name}-palette-focus.png`);
    await review(page.locator(".wl-command-palette"), `${theme.name}-palette-focus.png`);
  });
}
