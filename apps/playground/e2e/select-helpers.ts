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

/** Navigate through a visible desktop destination, its overflow menu, or the mobile drawer. */
export async function navigateMainView(page: Page, label: string): Promise<void> {
  await expect(page.locator(".pg-header-inner")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const desktopNavigation = page.locator(".pg-views");
  if (await desktopNavigation.isVisible()) {
    await expect.poll(() => desktopNavigation.evaluate((element) =>
      element.scrollWidth - element.clientWidth
    ), { message: "Desktop navigation fits after measuring its translated labels" }).toBeLessThanOrEqual(1);
    const direct = desktopNavigation.getByRole("button", { name: label, exact: true });
    if (await direct.isVisible()) await direct.click();
    else {
      const overflow = page.locator(".pg-views .pg-overflow-trigger");
      const popup = page.locator(".pg-overflow-menu");
      await expect(overflow).toBeVisible();
      if (!await popup.isVisible()) await overflow.click();
      await expect(overflow).toHaveAttribute("aria-expanded", "true");
      await popup.getByRole("menuitem", { name: label, exact: true }).click();
      await expect(overflow).toHaveAttribute("aria-expanded", "false");
      await expect(popup).toHaveCount(0);
    }
    return;
  }

  const trigger = page.getByRole("button", { name: "Открыть меню разделов", exact: true });
  const menu = page.getByRole("dialog", { name: "Разделы Gavia UI", exact: true });
  await expect(trigger).toBeVisible();
  if (!await menu.isVisible()) await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(menu).toBeVisible();
  await menu.getByRole("navigation", { name: "Разделы Gavia UI", exact: true })
    .getByRole("button", { name: label, exact: true }).click();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(menu).toHaveCount(0);
}

/** Hidden desktop destinations retain their current-page state on the overflow trigger and menu item. */
export async function expectMainViewCurrent(page: Page, label: string): Promise<void> {
  const navigation = page.locator(".pg-views");
  const direct = navigation.getByRole("button", { name: label, exact: true });
  if (await navigation.isVisible() && !await direct.isVisible()) {
    const trigger = page.locator(".pg-views .pg-overflow-trigger");
    const popup = page.locator(".pg-overflow-menu");
    await expect(trigger).toHaveAttribute("aria-current", "page");
    if (!await popup.isVisible()) await trigger.click();
    await expect(popup.getByRole("menuitem", { name: label, exact: true })).toHaveAttribute("aria-current", "page");
    await page.keyboard.press("Escape");
    await expect(popup).toHaveCount(0);
    await expect(trigger).toBeFocused();
  } else if (await navigation.isVisible()) await expect(direct).toHaveAttribute("aria-current", "page");
  else {
    const trigger = page.locator(".pg-menu-trigger");
    const drawer = page.getByRole("dialog", { name: "Разделы Gavia UI", exact: true });
    if (!await drawer.isVisible()) await trigger.click();
    await expect(drawer.getByRole("navigation", { name: "Разделы Gavia UI", exact: true })
      .getByRole("button", { name: label, exact: true })).toHaveAttribute("aria-current", "page");
    await page.keyboard.press("Escape");
    await expect(drawer).toHaveCount(0);
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
