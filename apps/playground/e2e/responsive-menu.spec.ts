import { expect, test, type Locator, type Page } from "@playwright/test";
import { navigateMainView } from "./select-helpers";
import { playgroundThemeOptions } from "../src/themes";

const sectionNames = ["Главная", "Документация", "Шрифт", "Дизайн-система", "Подбор темы", "Changelog"] as const;

async function expectNoOverflow(page: Page, surface: Locator): Promise<void> {
  await expect.poll(() => page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth
  )).toBeLessThanOrEqual(1);
  await expect.poll(() => surface.evaluate((element) =>
    element.scrollWidth - element.clientWidth
  )).toBeLessThanOrEqual(1);
}

async function expectMenuClosed(menu: Locator, trigger: Locator): Promise<void> {
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(menu).toHaveCount(0);
}

test("responsive header keeps one visible navigation and restores focus after menu dismissal and resize", async ({ page, baseURL }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  const homeUrl = new URL(baseURL ?? "http://127.0.0.1:4173/");
  homeUrl.search = "";
  homeUrl.hash = "";
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(homeUrl.href, { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("home-page")).toBeVisible();

  const header = page.locator(".pg-header-inner");
  const desktopNavigation = page.locator(".pg-views");
  const trigger = page.getByRole("button", { name: "Открыть меню разделов", exact: true, includeHidden: true });
  const menu = page.getByRole("dialog", { name: "Разделы Gavia UI", exact: true });
  const menuNavigation = menu.getByRole("navigation", { name: "Разделы Gavia UI", exact: true });
  await expect(desktopNavigation).toBeVisible();
  await expect(trigger).toBeHidden();
  await expect(desktopNavigation.getByRole("button")).toHaveCount(sectionNames.length);
  for (const label of sectionNames) {
    await expect(desktopNavigation.getByRole("button", { name: label, exact: true })).toBeVisible();
  }
  const rows = await desktopNavigation.getByRole("button").evaluateAll((buttons) =>
    buttons.map((button) => button.getBoundingClientRect().top)
  );
  expect(Math.max(...rows) - Math.min(...rows), "Desktop links stay in one horizontal row").toBeLessThanOrEqual(1);
  await expect(desktopNavigation.getByRole("button", { name: "Главная", exact: true })).toHaveAttribute("aria-current", "page");
  await expectNoOverflow(page, header);

  await page.setViewportSize({ width: 1117, height: 800 });
  await expect(desktopNavigation).toBeHidden();
  await expect(trigger).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
  await expect(trigger).toHaveAttribute("data-variant", "primary");
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(menu).toBeVisible();
  await expect(menuNavigation.getByRole("button")).toHaveCount(sectionNames.length);
  for (const label of sectionNames) {
    await expect(menuNavigation.getByRole("button", { name: label, exact: true })).toBeVisible();
  }
  await expect(menuNavigation.getByRole("button", { name: "Главная", exact: true })).toHaveAttribute("aria-current", "page");
  await menu.getByRole("button", { name: "Закрыть", exact: true }).click();
  await expectMenuClosed(menu, trigger);
  await expect(trigger).toBeFocused();

  await trigger.press("Enter");
  await expect(menu).toBeVisible();
  await page.keyboard.press("Escape");
  await expectMenuClosed(menu, trigger);
  await expect(trigger).toBeFocused();

  await trigger.click();
  await expect(menu).toBeVisible();
  // At this width the left edge is outside the right-hand drawer, so the mask is a real pointer target.
  await page.locator(".wl-drawer-mask").click({ position: { x: 8, y: 200 } });
  await expectMenuClosed(menu, trigger);
  await expect(trigger).toBeFocused();

  const brand = header.locator(".pg-brand");
  const search = header.getByRole("button", { name: "Поиск", exact: true });
  const theme = header.getByRole("combobox", { name: "Тема оформления", exact: true });
  const themeIcon = header.locator(".pg-theme-control .pg-theme-icon");
  for (const width of [720, 701, 700, 500, 320]) {
    await page.setViewportSize({ width, height: 740 });
    await expect(desktopNavigation).toBeHidden();
    for (const control of [brand, search, theme, trigger]) await expect(control).toBeVisible();
    await expect(header.locator(".pg-kit-version"), "Source version remains visible at " + width + "px").toBeVisible();
    // WebKit's media viewport excludes its scrollbar even when innerWidth is 701px.
    const compactControls = await page.evaluate(() => matchMedia("(max-width: 700px)").matches);
    let controlBounds = await Promise.all([brand, search, theme, trigger].map((control) => control.boundingBox()));
    await expect.poll(async () => {
      controlBounds = await Promise.all([brand, search, theme, trigger].map((control) => control.boundingBox()));
      if (controlBounds.some((bounds) => !bounds)) return false;
      const centers = controlBounds.map((bounds) => bounds!.y + bounds!.height / 2);
      if (Math.max(...centers) - Math.min(...centers) > 1) return false;
      return compactControls
        ? controlBounds.slice(1).every((bounds) => Math.abs(bounds!.width - 44) < 0.05 && Math.abs(bounds!.height - 44) < 0.05)
        : controlBounds[1]!.width > 44 && controlBounds[2]!.width > 44;
    }, "Header controls settle into the current CSS viewport at " + width + "px").toBe(true);
    for (const bounds of controlBounds) expect(bounds, "Header control has geometry at " + width + "px").not.toBeNull();
    const centers = controlBounds.map((bounds) => bounds!.y + bounds!.height / 2);
    expect(Math.max(...centers) - Math.min(...centers), "Brand and actions stay in one row at " + width + "px").toBeLessThanOrEqual(1);
    if (!compactControls) {
      await expect(search.locator(".wl-btn__label")).toBeVisible();
      expect(controlBounds[1]!.width, "Search keeps its text above the icon breakpoint").toBeGreaterThan(44);
      expect(controlBounds[2]!.width, "Theme keeps its label above the icon breakpoint").toBeGreaterThan(44);
      await expect(themeIcon).toBeHidden();
    } else {
      for (const bounds of controlBounds.slice(1)) {
        expect(bounds!.width, "Compact control width at " + width + "px").toBeCloseTo(44, 1);
        expect(bounds!.height, "Compact control height at " + width + "px").toBeCloseTo(44, 1);
      }
      await expect(search.locator("svg")).toBeVisible();
      await expect(themeIcon).toBeVisible();
      await expect(trigger.locator("svg")).toBeVisible();
    }
    await expectNoOverflow(page, header);
  }

  await page.setViewportSize({ width: 320, height: 740 });
  await expect(desktopNavigation).toBeHidden();
  await expect(trigger).toBeVisible();
  const bounds = await trigger.boundingBox();
  const brandBounds = await header.locator(".pg-brand").boundingBox();
  expect(bounds, "Mobile menu button has visible geometry").not.toBeNull();
  expect(brandBounds, "Mobile brand has visible geometry").not.toBeNull();
  expect(bounds!.height, "Mobile menu remains a usable touch target").toBeGreaterThanOrEqual(44);
  expect(bounds!.x, "Menu is to the right of the brand").toBeGreaterThanOrEqual(brandBounds!.x + brandBounds!.width);
  expect(bounds!.x + bounds!.width, "Menu stays inside the viewport").toBeLessThanOrEqual(320);
  expect(320 - bounds!.x - bounds!.width, "Menu sits at the right edge").toBeLessThanOrEqual(24);
  expect(bounds!.y + bounds!.height / 2).toBeCloseTo(brandBounds!.y + brandBounds!.height / 2, 0);
  await expectNoOverflow(page, header);

  await search.click();
  const palette = page.getByRole("dialog", { name: "Командная палитра", exact: true });
  await expect(palette).toBeVisible();
  await expect(palette.getByRole("combobox", { name: "Командная палитра", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(palette).toHaveCount(0);
  await expect(search).toBeFocused();

  const themeLabels: Record<string, string> = { gavia: "Gavia", "gavia-dark": "Gavia Dark", white: "Classic", graphite: "Classic Dark", newspaper: "Newspaper" };
  const initialTheme = await page.locator("html").getAttribute("data-wl-theme");
  expect(Object.keys(themeLabels)).toContain(initialTheme);
  await theme.click();
  const themeOptions = page.getByRole("listbox");
  await expect(theme).toHaveAttribute("aria-expanded", "true");
  await expect(themeOptions).toBeVisible();
  await expect(themeOptions.getByRole("option")).toHaveCount(Object.keys(themeLabels).length);
  for (const label of Object.values(themeLabels)) {
    await expect(themeOptions.getByRole("option", { name: label, exact: true })).toBeVisible();
  }
  await expect(themeOptions.getByRole("option", { selected: true })).toHaveCount(1);
  await expect(themeOptions.getByRole("option", { selected: true })).toHaveText(themeLabels[initialTheme!]!);
  await theme.press("Escape");
  await expect(theme).toHaveAttribute("aria-expanded", "false");
  await expect(themeOptions).toHaveCount(0);
  await expect(theme).toBeFocused();
  await expect(page.locator("html")).toHaveAttribute("data-wl-theme", initialTheme!);

  await theme.press("ArrowDown");
  await expect(themeOptions).toBeVisible();
  await theme.press("Home");
  const darkThemeIndex = playgroundThemeOptions.findIndex((option) => option.value === "graphite");
  expect(darkThemeIndex).toBeGreaterThanOrEqual(0);
  for (let index = 0; index < darkThemeIndex; index++) await theme.press("ArrowDown");
  await theme.press("Enter");
  await expect(theme).toHaveAttribute("aria-expanded", "false");
  await expect(themeOptions).toHaveCount(0);
  await expect(theme).toBeFocused();
  await expect(page.locator("html")).toHaveAttribute("data-wl-theme", "graphite");
  await theme.click();
  await expect(themeOptions.getByRole("option", { selected: true })).toHaveCount(1);
  await expect(themeOptions.getByRole("option", { selected: true })).toHaveText("Classic Dark");
  await theme.press("Escape");
  await expect(themeOptions).toHaveCount(0);
  await expect(theme).toBeFocused();
  await expectNoOverflow(page, header);

  await navigateMainView(page, "Документация");
  await expect(page.getByTestId("docs-page")).toBeVisible();
  await expectMenuClosed(menu, trigger);
  await expect.poll(() => {
    const url = new URL(page.url());
    return { pathname: url.pathname, view: url.searchParams.get("view") };
  }).toEqual({ pathname: homeUrl.pathname, view: "docs" });
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(menu).toBeVisible();
  await expect(menuNavigation.getByRole("button", { name: "Документация", exact: true })).toHaveAttribute("aria-current", "page");
  await expectNoOverflow(page, menu);

  await page.setViewportSize({ width: 1280, height: 800 });
  await expectMenuClosed(menu, trigger);
  await expect(trigger).toBeHidden();
  await expect(desktopNavigation).toBeVisible();
  const activeDesktopLink = desktopNavigation.getByRole("button", { name: "Документация", exact: true });
  await expect(activeDesktopLink).toHaveAttribute("aria-current", "page");
  await expect(activeDesktopLink).toBeFocused();
  await expectNoOverflow(page, header);
  expect(pageErrors, "Header navigation loads pages without runtime errors").toEqual([]);
});


test("Gavia is the initial theme and explicit theme links survive refresh and navigation", async ({ page, baseURL }) => {
  const url = new URL(baseURL ?? "http://127.0.0.1:4173/");
  await page.goto(url.href);
  await expect(page.locator("html")).toHaveAttribute("data-wl-theme", "gavia");
  const selector = page.getByTestId("pg-theme-selector");
  await expect(selector).toContainText("Gavia");

  url.search = "?view=docs&section=colors&theme=white&example=palette";
  await page.goto(url.href);
  await expect(page.locator("html")).toHaveAttribute("data-wl-theme", "white");
  await expect(selector).toContainText("Classic");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-wl-theme", "white");
  await selector.click();
  await page.getByRole("listbox").getByRole("option", { name: "Gavia", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-wl-theme", "gavia");
  await expect.poll(() => new URL(page.url()).searchParams.get("theme")).toBe("gavia");
  const selected = new URL(page.url());
  expect(selected.pathname).toBe(url.pathname);
  expect(selected.searchParams.get("theme")).toBe("gavia");
  expect(selected.searchParams.get("section")).toBe("colors");
  expect(selected.searchParams.get("example")).toBe("palette");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-wl-theme", "gavia");
  await navigateMainView(page, "Главная");
  await expect(page.getByTestId("home-page")).toBeVisible();
  expect(new URL(page.url()).searchParams.get("theme")).toBe("gavia");
  await page.goBack();
  await expect(page.getByTestId("docs-assets-page")).toHaveAttribute("data-docs-section", "colors");
  await expect(page.locator("html")).toHaveAttribute("data-wl-theme", "gavia");
});
