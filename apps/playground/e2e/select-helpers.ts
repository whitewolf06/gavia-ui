import { expect, type Locator, type Page } from "@playwright/test";
import { wlDesignThemes } from "../../../packages/ui-kit/src/design-system";

/** Exercise the same dropdown interaction a playground user performs. */
export async function chooseDropdownOption(page: Page, control: Locator, label: string): Promise<void> {
  await expect(control).toHaveAttribute("role", "combobox");
  await control.click();
  await expect(control).toHaveAttribute("aria-expanded", "true");
  const listbox = page.getByRole("listbox");
  await expect(listbox).toHaveCount(1);
  await expect(listbox).toBeVisible();
  await listbox.getByRole("option", { name: label, exact: true }).click();
  await expect(control).toHaveAttribute("aria-expanded", "false");
  // Wait for motion cleanup before another dropdown or a screenshot.
  await expect(listbox).toHaveCount(0);
}

export async function chooseShowcaseTheme(page: Page, label: string): Promise<void> {
  await chooseDropdownOption(page, page.getByRole("combobox", { name: "Тема оформления", exact: true }), label);
  const theme = wlDesignThemes.find((item) => item.label === label);
  if (!theme) throw new Error("Unknown showcase theme: " + label);
  await expect(page.locator("html")).toHaveAttribute("data-wl-theme", theme.name);
}


/** The persistent language selector uses the same keyboard and dismissal contract as other selects. */
export async function chooseShowcaseLanguage(page: Page, language: "en" | "ru"): Promise<void> {
  await chooseDropdownOption(page, page.getByTestId("pg-language-selector"), language === "en" ? "EN" : "RU");
  await expect(page.locator("html")).toHaveAttribute("lang", language);
}

/** Reveal the code-frame action through the public hover interaction before copying. */
export async function copyCodePanel(panel: Locator, label = "Копировать код"): Promise<void> {
  await panel.locator(".ds-source-frame").hover();
  const button = panel.getByRole("button", { name: label, exact: true });
  await button.scrollIntoViewIfNeeded();
  await button.focus();
  await expect(button).toBeFocused();
  // A route or focus can still be scrolling after Playwright's two stable frames.
  // Wait for the real target and scroll position to settle before one pointer click.
  await expect.poll(() => button.evaluate(async (element) => {
    const snapshot = () => {
      const rect = element.getBoundingClientRect();
      return [rect.x, rect.y, rect.width, rect.height, window.scrollX, window.scrollY];
    };
    let previous = snapshot();
    for (let frame = 0; frame < 8; frame += 1) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const current = snapshot();
      if (current.some((value, index) => Math.abs(value - previous[index]!) > 0.5)) return false;
      previous = current;
    }
    const rect = element.getBoundingClientRect();
    return element.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2));
  }), { message: "Code copy target settles after navigation and focus scrolling" }).toBe(true);
  await button.click();
}

/** A closing overlay remains geometrically visible but is already inert. */
async function openNavigationOverlay(trigger: Locator, overlay: Locator): Promise<void> {
  if (await trigger.getAttribute("aria-expanded") !== "true") {
    await expect(overlay).toHaveCount(0);
    await trigger.click();
  }
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(overlay).toBeVisible();
}

/** Navigate through a visible desktop destination, its overflow menu, or the mobile drawer. */
export async function navigateMainView(page: Page, label: string): Promise<void> {
  await expect(page.locator(".pg-header-inner")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const mobileTrigger = page.locator(".pg-menu-trigger");
  if (await mobileTrigger.isVisible()) {
    const menu = page.getByRole("dialog", { name: "Разделы Gavia UI", exact: true });
    await openNavigationOverlay(mobileTrigger, menu);
    await menu.getByRole("navigation", { name: "Разделы Gavia UI", exact: true })
      .getByRole("button", { name: label, exact: true }).click();
    await expect(mobileTrigger).toHaveAttribute("aria-expanded", "false");
    await expect(menu).toHaveCount(0);
    return;
  }
  const desktopNavigation = page.locator(".pg-views");
  await expect(desktopNavigation).toBeVisible();
  await expect.poll(() => desktopNavigation.evaluate((element) =>
    element.scrollWidth - element.clientWidth
  ), { message: "Desktop navigation fits after measuring its translated labels" }).toBeLessThanOrEqual(1);
  const direct = desktopNavigation.getByRole("button", { name: label, exact: true });
  if (await direct.isVisible()) await direct.click();
  else {
    const overflow = page.locator(".pg-views .pg-overflow-trigger");
    const popup = page.locator(".pg-overflow-menu");
    await expect(overflow).toBeVisible();
    await openNavigationOverlay(overflow, popup);
    await popup.getByRole("menuitem", { name: label, exact: true }).click();
    await expect(overflow).toHaveAttribute("aria-expanded", "false");
    await expect(popup).toHaveCount(0);
  }
}

/** Hidden desktop destinations retain their current-page state on the overflow trigger and menu item. */
export async function expectMainViewCurrent(page: Page, label: string): Promise<void> {
  const markers: Record<string, string> = {
    "Главная": '[data-testid="home-page"]', "Документация": '[data-testid="docs-page"]',
    "Шрифт": '[data-testid="font-page"]', "Дизайн-система": "main#ds-top",
    "Подбор темы": '[data-testid="theme-builder-page"]', Changelog: '[data-testid="changelog-page"]'
  };
  const marker = markers[label];
  if (!marker) throw new Error("Unknown main-view destination: " + label);
  // pushState precedes the Vue route flush, whose watcher closes the old menu.
  // Wait for the actual destination before reopening More to inspect its state.
  await expect(page.locator(marker)).toBeVisible();
  await expect(page.locator(".pg-header-inner")).toBeVisible();
  const navigation = page.locator(".pg-views");
  const mobileTrigger = page.locator(".pg-menu-trigger");
  // The desktop nav can appear after a lazy route finishes mounting. Only use
  // the drawer branch when its actual trigger is visible at this viewport.
  if (await mobileTrigger.isVisible()) {
    const drawer = page.getByRole("dialog", { name: "Разделы Gavia UI", exact: true });
    await openNavigationOverlay(mobileTrigger, drawer);
    await expect(drawer.getByRole("navigation", { name: "Разделы Gavia UI", exact: true })
      .getByRole("button", { name: label, exact: true })).toHaveAttribute("aria-current", "page");
    await page.keyboard.press("Escape");
    await expect(drawer).toHaveCount(0);
    await expect(mobileTrigger).toBeFocused();
    return;
  }
  await expect(navigation).toBeVisible();
  const direct = navigation.getByRole("button", { name: label, exact: true });
  if (await direct.isVisible()) await expect(direct).toHaveAttribute("aria-current", "page");
  else {
    const trigger = page.locator(".pg-views .pg-overflow-trigger");
    const popup = page.locator(".pg-overflow-menu");
    await expect(trigger).toHaveAttribute("aria-current", "page");
    await openNavigationOverlay(trigger, popup);
    await expect(popup.getByRole("menuitem", { name: label, exact: true })).toHaveAttribute("aria-current", "page");
    await page.keyboard.press("Escape");
    await expect(popup).toHaveCount(0);
    await expect(trigger).toBeFocused();
  }
}

/** Open the compact Docs catalog without toggling an already open menu. */
export async function openDocumentationMenu(page: Page): Promise<Locator> {
  const docs = page.getByTestId("docs-page");
  await expect(docs).toBeVisible();
  const menu = docs.locator(".docs-menu");
  const summary = menu.locator(".docs-menu-summary");
  if (await summary.isVisible() && await menu.getAttribute("open") === null) await summary.click();
  await expect(docs.getByRole("navigation", { name: "Каталог компонентов", exact: true })).toBeVisible();
  return docs;
}

/** Select a real Docs catalog destination through desktop or compact navigation. */
export async function navigateDocumentationComponent(page: Page, name: string): Promise<Locator> {
  const docs = await openDocumentationMenu(page);
  const item = docs.getByRole("navigation", { name: "Каталог компонентов", exact: true, includeHidden: true })
    .getByRole("button", { name, exact: true, includeHidden: true });
  await item.click();
  await expect(item).toHaveAttribute("aria-current", "page");
  await expect(docs.getByRole("heading", { level: 1, name, exact: true })).toBeVisible();
  const workspace = docs.locator('[data-docs-component="' + name + '"]');
  await expect(workspace).toBeVisible();
  return workspace;
}

/** Native reload must preserve the browser history rather than add an entry. */
export async function nativeReload(page: Page): Promise<void> {
  const url = page.url();
  const historyLength = await page.evaluate(() => history.length);
  // Playwright's Firefox reload has injected history entries; exercise the
  // browser's native operation: https://github.com/microsoft/playwright/issues/22640
  await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded" }),
    page.evaluate(() => window.location.reload())
  ]);
  await expect(page).toHaveURL(url);
  await expect.poll(() => page.evaluate(() => history.length), {
    message: "Native reload preserves the existing history entries"
  }).toBe(historyLength);
}
