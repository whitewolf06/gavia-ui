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


/** Reveal the code-frame action through the public hover interaction before copying. */
export async function copyCodePanel(panel: Locator): Promise<void> {
  await panel.locator(".ds-source-frame").hover();
  const button = panel.getByRole("button", { name: "Копировать код", exact: true });
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

/** Navigate through the visible desktop links or the compact drawer. */
export async function navigateMainView(page: Page, label: string): Promise<void> {
  await expect(page.locator(".pg-header-inner")).toBeVisible();
  const desktopNavigation = page.getByRole("navigation", { name: "Основная навигация Gavia UI", exact: true });
  if (await desktopNavigation.isVisible()) {
    await desktopNavigation.getByRole("button", { name: label, exact: true }).click();
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
