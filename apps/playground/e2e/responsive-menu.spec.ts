import { russianPlaygroundUrl } from "./playground-url";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { expectMainViewCurrent, navigateMainView } from "./select-helpers";
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

async function headerGeometry(header: Locator) {
  return header.evaluate((element) => {
    const box = (node: Element) => {
      const rect = node.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    };
    const control = (selector: string) => box(element.querySelector(selector)!);
    const style = getComputedStyle(element);
    return {
      header: box(element), brand: control(".pg-brand"), search: control(".pg-search"),
      theme: control(".pg-theme"), language: control(".pg-language"), menu: control(".pg-menu-trigger"),
      navigation: control(".pg-views"),
      searchIcon: control('.pg-search svg[data-icon="search"]'),
      menuIcon: control('.pg-menu-trigger svg[data-icon="bars"]'),
      themeIcon: control('.pg-theme-mobile-icon[data-icon="sliders-h"]'),
      minHeight: Number.parseFloat(style.minHeight),
      paddingLeft: Number.parseFloat(style.paddingLeft), paddingRight: Number.parseFloat(style.paddingRight),
      paddingTop: Number.parseFloat(style.paddingTop), paddingBottom: Number.parseFloat(style.paddingBottom)
    };
  });
}

async function expectHeaderLayout(page: Page, header: Locator, mobile: boolean): Promise<void> {
  await expect.poll(async () => {
    const boxes = await headerGeometry(header);
    const near = (first: number, second: number) => Math.abs(first - second) <= 1;
    const right = (box: typeof boxes.brand) => box.x + box.width;
    const bottom = (box: typeof boxes.brand) => box.y + box.height;
    const center = (box: typeof boxes.brand) => box.y + box.height / 2;
    const centerX = (box: typeof boxes.brand) => box.x + box.width / 2;
    const visible = mobile
      ? [boxes.brand, boxes.search, boxes.theme, boxes.language, boxes.menu]
      : [boxes.brand, boxes.navigation, boxes.language, boxes.search, boxes.theme];
    if (!visible.every((box) => box.width > 0 && box.height > 0 && box.x >= boxes.header.x - 1
      && right(box) <= right(boxes.header) + 1 && box.y >= boxes.header.y - 1
      && bottom(box) <= bottom(boxes.header) + 1)) return false;
    if (!near(boxes.search.width, boxes.theme.width) || !near(boxes.search.height, boxes.theme.height)
      || !near(boxes.language.width, 68)
      || !near(right(mobile ? boxes.menu : boxes.language), right(boxes.header) - boxes.paddingRight)
      || right(boxes.search) > boxes.theme.x) return false;
    if (!mobile) {
      const centers = visible.map(center);
      return near(boxes.search.width, 120) && near(boxes.theme.width, 120)
        && Math.max(...centers) - Math.min(...centers) <= 1
        && right(boxes.theme) <= boxes.language.x
        && right(boxes.brand) <= boxes.navigation.x && right(boxes.navigation) <= boxes.search.x
        && near(boxes.header.height, Math.max(boxes.minHeight,
          Math.max(...visible.map((box) => box.height)) + boxes.paddingTop + boxes.paddingBottom));
    }
    const centers = visible.map(center);
    return [boxes.menu, boxes.language, boxes.search, boxes.theme].every((box) => near(box.height, 44))
      && [boxes.menu, boxes.search, boxes.theme].every((box) => near(box.width, 44))
      && Math.max(...centers) - Math.min(...centers) <= 1
      && right(boxes.brand) <= boxes.search.x && right(boxes.language) <= boxes.menu.x
      && right(boxes.theme) <= boxes.language.x
      && [[boxes.searchIcon, boxes.search], [boxes.menuIcon, boxes.menu], [boxes.themeIcon, boxes.theme]]
        .every(([icon, control]) => near(centerX(icon!), centerX(control!)) && near(center(icon!), center(control!)))
      && near(boxes.paddingLeft, 8) && near(boxes.paddingRight, 8)
      && near(boxes.header.height, Math.max(boxes.minHeight,
        44 + boxes.paddingTop + boxes.paddingBottom));
  }, "Header keeps equal utility controls and one mobile row with centered icons and its menu on the right").toBe(true);
  await expectNoOverflow(page, header);
}

test("responsive header preserves ordered desktop overflow, a compact mobile row and focus through dismissal and resize", async ({ page, baseURL }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  const homeUrl = new URL(baseURL ?? "http://127.0.0.1:4173/");
  homeUrl.search = "";
  homeUrl.hash = "";
  await page.setViewportSize({ width: 1600, height: 800 });
  await page.goto(russianPlaygroundUrl(homeUrl.href), { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("home-page")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);

  const header = page.locator(".pg-header-inner");
  const desktopNavigation = page.locator(".pg-views");
  const directButtons = desktopNavigation.locator("button:not(.pg-overflow-trigger)");
  const overflow = desktopNavigation.locator(".pg-overflow-trigger");
  const popup = page.locator(".pg-overflow-menu");
  const trigger = header.locator(".pg-menu-trigger");
  const menu = page.getByRole("dialog", { name: "Разделы Gavia UI", exact: true });
  const menuNavigation = menu.getByRole("navigation", { name: "Разделы Gavia UI", exact: true });
  const measuredCounts = new Map<number, number>();
  let previousCount: number = sectionNames.length;
  for (const width of [1600, 1280, 1117, 900, 800]) {
    await page.setViewportSize({ width, height: 800 });
    await expect(desktopNavigation).toBeVisible();
    await expect(trigger).toBeHidden();
    await expectHeaderLayout(page, header, false);
    await expect(header.locator(".pg-search")).toHaveCSS("justify-content", "flex-start");
    await expectNoOverflow(page, desktopNavigation);
    const count = await directButtons.count();
    expect(count, "Navigation removes only the trailing destinations as width decreases").toBeLessThanOrEqual(previousCount);
    previousCount = count;
    measuredCounts.set(width, count);
    await expect(directButtons).toHaveText(sectionNames.slice(0, count));
    if (count < sectionNames.length) {
      await expect(overflow).toBeVisible();
      await expect(overflow).toHaveAttribute("aria-haspopup", "menu");
      await expect(overflow).toHaveAttribute("aria-controls", "pg-overflow-navigation");
      await expect(overflow.locator(".wl-btn__label")).toHaveText("Ещё");
      await overflow.click();
      await expect(overflow).toHaveAttribute("aria-expanded", "true");
      await expect(popup.getByRole("menu", { name: "Разделы Gavia UI", exact: true })).toBeVisible();
      await expect(popup.getByRole("menuitem")).toHaveText(sectionNames.slice(count));
      await expect(popup.getByRole("menuitem").first()).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(popup).toHaveCount(0);
      await expect(overflow).toHaveAttribute("aria-expanded", "false");
      await expect(overflow).toBeFocused();
    } else await expect(overflow).toHaveCount(0);
    const row = await desktopNavigation.getByRole("button").evaluateAll((buttons) => buttons.map((button) => button.getBoundingClientRect().top));
    expect(Math.max(...row) - Math.min(...row), "Visible desktop destinations stay in one row").toBeLessThanOrEqual(1);
  }

  await page.setViewportSize({ width: 900, height: 800 });
  // Wait for the prefix already measured at this width, before opening a menu
  // that intentionally closes whenever ResizeObserver changes that prefix.
  await expect(directButtons).toHaveCount(measuredCounts.get(900)!);
  await expect(overflow).toBeVisible();
  await overflow.press("Enter");
  const items = popup.getByRole("menuitem");
  await expect(items.first()).toBeFocused();
  expect(await items.count()).toBeGreaterThanOrEqual(2);
  await page.keyboard.press("ArrowDown");
  await expect(items.nth(1)).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(items.first()).toBeFocused();
  await page.keyboard.press("End");
  await expect(items.last()).toBeFocused();
  await page.keyboard.press("Home");
  await expect(items.first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(popup).toHaveCount(0);
  await expect(overflow).toBeFocused();
  await overflow.press("ArrowDown");
  await popup.getByRole("menuitem", { name: "Changelog", exact: true }).press("Enter");
  await expect(page.getByTestId("changelog-page")).toBeVisible();
  await expect(overflow).toHaveAttribute("aria-current", "page");
  await expectMainViewCurrent(page, "Changelog");
  // Focus follows the current hidden section across desktop and mobile navigation.
  await overflow.focus();
  await page.setViewportSize({ width: 760, height: 800 });
  await expect(desktopNavigation).toBeHidden();
  await expect(trigger).toBeFocused();
  await page.setViewportSize({ width: 900, height: 800 });
  await expect(overflow).toHaveAttribute("aria-current", "page");
  await expect(overflow).toBeFocused();
  await page.setViewportSize({ width: 1600, height: 800 });
  const changelog = desktopNavigation.getByRole("button", { name: "Changelog", exact: true });
  await expect(overflow).toHaveCount(0);
  await expect(changelog).toHaveAttribute("aria-current", "page");
  await expect(changelog).toBeFocused();
  await page.setViewportSize({ width: 900, height: 800 });
  await expect(changelog).toHaveCount(0);
  await expect(overflow).toHaveAttribute("aria-current", "page");
  await expect(overflow).toBeFocused();
  await overflow.press("ArrowDown");
  const firstLabel = (await items.first().textContent())!.trim();
  await items.first().press("Space");
  const viewByLabel: Record<string, string> = { "Главная": "home", "Документация": "docs", "Шрифт": "font", "Дизайн-система": "system", "Подбор темы": "theme-builder", Changelog: "changelog" };
  expect(Object.keys(viewByLabel)).toContain(firstLabel);
  await expect.poll(() => new URL(page.url()).searchParams.get("view") ?? "home").toBe(viewByLabel[firstLabel]);
  await expectMainViewCurrent(page, firstLabel);
  await navigateMainView(page, "Главная");
  await expect(page.getByTestId("home-page")).toBeVisible();
  await overflow.click();
  await popup.getByRole("menuitem", { name: "Changelog", exact: true }).focus();
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(popup).toHaveCount(0);
  await expect(desktopNavigation.getByRole("button", { name: "Главная", exact: true })).toBeFocused();
  // A focused direct tail must also transfer focus when ResizeObserver removes it.
  const trailingLabel = (await directButtons.last().textContent())!.trim();
  await directButtons.last().focus();
  await page.setViewportSize({ width: 800, height: 800 });
  await expect(directButtons.filter({ hasText: trailingLabel })).toHaveCount(0);
  await expect(desktopNavigation.locator('[aria-current="page"], .pg-overflow-trigger').first()).toBeFocused();
  await overflow.focus();
  await page.setViewportSize({ width: 760, height: 800 });
  await expect(desktopNavigation).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
  await expect(trigger).toHaveAttribute("data-variant", "secondary");
  await trigger.click();
  await expect(menuNavigation.getByRole("button")).toHaveText([...sectionNames]);
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
  await page.locator(".wl-drawer-mask").click({ position: { x: 8, y: 200 } });
  await expectMenuClosed(menu, trigger);
  await expect(trigger).toBeFocused();

  const brand = header.locator(".pg-brand");
  const search = header.getByRole("button", { name: "Поиск", exact: true });
  const theme = page.getByTestId("pg-theme-selector");
  const language = page.getByTestId("pg-language-selector");
  const themeIcon = header.locator(".pg-theme-control .pg-theme-mobile-icon");
  for (const width of [760, 720, 701, 700, 500, 375, 320]) {
    await page.setViewportSize({ width, height: 740 });
    await expect(desktopNavigation).toBeHidden();
    for (const control of [brand, search, theme, trigger, language]) await expect(control).toBeVisible();
    await expect(header.locator(".pg-kit-version"), "The compact brand hides its version at " + width + "px").toBeHidden();
    if (width <= 360) await expect(brand.locator(".pg-title")).toBeHidden();
    else await expect(brand.locator(".pg-title")).toBeVisible();
    await expect(brand.locator(".pg-logo")).toBeVisible();
    await expect(search.locator(".wl-btn__label")).toBeHidden();
    await expect(search.locator('svg[data-icon="search"]')).toBeVisible();
    await expect(theme.locator(".wl-select__label")).toBeHidden();
    await expect(theme.locator(".wl-select__dropdown")).toBeHidden();
    await expect(themeIcon).toBeVisible();
    await expectHeaderLayout(page, header, true);
  }
  await search.click();
  const palette = page.getByRole("dialog", { name: "Командная палитра", exact: true });
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
  await expect(themeOptions.getByRole("option")).toHaveText(Object.values(themeLabels));
  await expect(themeOptions.getByRole("option", { selected: true })).toHaveText(themeLabels[initialTheme!]!);
  await theme.press("Escape");
  await expect(themeOptions).toHaveCount(0);
  await expect(theme).toBeFocused();
  await expect(page.locator("html")).toHaveAttribute("data-wl-theme", initialTheme!);
  await theme.press("ArrowDown");
  await theme.press("Home");
  const darkThemeIndex = playgroundThemeOptions.findIndex((option) => option.value === "graphite");
  expect(darkThemeIndex).toBeGreaterThanOrEqual(0);
  for (let index = 0; index < darkThemeIndex; index++) await theme.press("ArrowDown");
  await theme.press("Enter");
  await expect(themeOptions).toHaveCount(0);
  await expect(theme).toBeFocused();
  await expect(page.locator("html")).toHaveAttribute("data-wl-theme", "graphite");
  await theme.click();
  await expect(themeOptions.getByRole("option", { selected: true })).toHaveText("Classic Dark");
  await theme.press("Escape");
  await expect(themeOptions).toHaveCount(0);
  await expect(theme).toBeFocused();
  await expectHeaderLayout(page, header, true);

  await navigateMainView(page, "Документация");
  await expect(page.getByTestId("docs-page")).toBeVisible();
  await expectMenuClosed(menu, trigger);
  await expect.poll(() => {
    const url = new URL(page.url());
    return { pathname: url.pathname, view: url.searchParams.get("view"), language: url.searchParams.get("lang") };
  }).toEqual({ pathname: homeUrl.pathname, view: "docs", language: "ru" });
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(menuNavigation.getByRole("button", { name: "Документация", exact: true })).toHaveAttribute("aria-current", "page");
  await expectNoOverflow(page, menu);
  await page.setViewportSize({ width: 1280, height: 800 });
  await expectMenuClosed(menu, trigger);
  await expect(trigger).toBeHidden();
  await expect(desktopNavigation).toBeVisible();
  const activeDesktopLink = desktopNavigation.getByRole("button", { name: "Документация", exact: true });
  await expect(activeDesktopLink).toHaveAttribute("aria-current", "page");
  await expect(activeDesktopLink).toBeFocused();
  await expectHeaderLayout(page, header, false);
  expect(pageErrors, "Header navigation loads pages without runtime errors").toEqual([]);
});


test("Gavia is the initial theme and explicit theme links survive refresh and navigation", async ({ page, baseURL }) => {
  const url = new URL(baseURL ?? "http://127.0.0.1:4173/");
  await page.goto(russianPlaygroundUrl(url.href));
  await expect(page.locator("html")).toHaveAttribute("data-wl-theme", "gavia");
  const selector = page.getByTestId("pg-theme-selector");
  await expect(selector).toContainText("Gavia");

  url.search = "?view=docs&section=colors&theme=white&example=palette";
  await page.goto(russianPlaygroundUrl(url.href));
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
