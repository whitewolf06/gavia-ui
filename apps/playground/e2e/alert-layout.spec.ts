import { expect, test, type Locator, type Page } from "@playwright/test";
import { wlDesignThemes } from "../../../packages/ui-kit/src/design-system";
import { chooseDropdownOption } from "./select-helpers";

async function expectReadableAlert(page: Page, preview: Locator, alert: Locator): Promise<void> {
  await alert.scrollIntoViewIfNeeded();
  await page.evaluate(() => document.fonts.ready);
  // Text can wrap, but must retain enough width to read words beside the icon.
  // This catches the old nowrap layout which squeezed the body into a letter column.
  await expect.poll(() => alert.locator(".wl-alert__body").evaluate((element) =>
    element.getBoundingClientRect().width
  ), { message: "Alert body remains readable with both action and close controls" }).toBeGreaterThanOrEqual(80);

  const geometry = await alert.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const outside = Array.from(element.children).filter((child) => {
      const childBounds = child.getBoundingClientRect();
      return childBounds.left < bounds.left - 1 || childBounds.right > bounds.right + 1
        || childBounds.top < bounds.top - 1 || childBounds.bottom > bounds.bottom + 1;
    }).map((child) => child.className);
    const overflowing = Array.from(element.querySelectorAll<HTMLElement>(".wl-alert__body, .wl-alert__title, .wl-alert__text, .wl-alert__action"))
      .filter((child) => child.scrollWidth > child.clientWidth + 1)
      .map((child) => child.className);
    return {
      left: bounds.left,
      right: bounds.right,
      viewportWidth: document.documentElement.clientWidth,
      localOverflow: element.scrollWidth - element.clientWidth,
      outside,
      overflowing
    };
  });
  expect(geometry.left).toBeGreaterThanOrEqual(-1);
  expect(geometry.right).toBeLessThanOrEqual(geometry.viewportWidth + 1);
  expect(geometry.localOverflow).toBeLessThanOrEqual(1);
  expect(geometry.outside, "Icon, body, action and close stay within the alert").toEqual([]);
  expect(geometry.overflowing, "Alert content has no hidden horizontal overflow").toEqual([]);
  await expect.poll(() => preview.evaluate((element) =>
    element.scrollWidth - element.clientWidth
  )).toBeLessThanOrEqual(1);
  await expect.poll(() => page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth
  )).toBeLessThanOrEqual(1);
}

for (const theme of wlDesignThemes) {
  for (const width of [320, 390]) {
    test(`${theme.name}: Alert text and controls fit at ${width}px and both dismiss actions work`, async ({ page, baseURL }) => {
      await page.setViewportSize({ width, height: 844 });
      const url = new URL(baseURL ?? "http://127.0.0.1:4173/");
      url.search = new URLSearchParams({ view: "system", theme: theme.name }).toString();
      await page.goto(url.href, { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("heading", { name: "Единый язык интерфейсов", exact: true })).toBeVisible();
      await expect(page.locator("html")).toHaveAttribute("data-wl-theme", theme.name);

      await chooseDropdownOption(page, page.getByRole("combobox", { name: "Компонент", exact: true }), "WlAlert");
      const explorer = page.getByTestId("ds-explorer");
      const preview = page.getByTestId("ds-example-preview");
      await expect(explorer).toHaveAttribute("data-component", "WlAlert");
      await expect(preview.locator(":scope > .wl-stack")).toBeVisible();
      await explorer.getByRole("checkbox", { name: "closable", exact: true }).check();

      const alert = preview.getByRole("alert");
      const action = alert.getByRole("button", { name: "Понятно", exact: true });
      const close = alert.getByRole("button", { name: "Закрыть", exact: true });
      const restore = preview.getByRole("button", { name: "Показать уведомление", exact: true });
      await expect(alert).toBeVisible();
      await expect(action).toBeVisible();
      await expect(close).toBeVisible();
      await expectReadableAlert(page, preview, alert);

      await action.click();
      await expect(alert).toHaveCount(0);
      await expect(restore).toBeVisible();
      await restore.click();
      await expect(alert).toBeVisible();
      await expect(close).toBeVisible();
      await expectReadableAlert(page, preview, alert);
      await close.click();
      await expect(alert).toHaveCount(0);
      await expect(restore).toBeVisible();
    });
  }
}
