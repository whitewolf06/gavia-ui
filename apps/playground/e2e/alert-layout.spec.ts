import { expect, type Locator, type Page, test } from "@playwright/test";
import { russianPlaygroundUrl } from "./playground-url";
import { chooseDropdownOption } from "./select-helpers";

interface AlertGeometry {
  bodyWidth: number;
  left: number;
  right: number;
  viewportWidth: number;
  localOverflow: number;
  outside: string[];
  overflowing: string[];
}

async function expectReadableAlert(page: Page, preview: Locator, alert: Locator): Promise<void> {
  await alert.scrollIntoViewIfNeeded();
  await page.evaluate(() => document.fonts.ready);
  // Text can wrap, but must retain enough width to read words beside the icon.
  // This catches the old nowrap layout which squeezed the body into a letter column.
  let geometry!: AlertGeometry;
  await expect.poll(async () => {
    geometry = await alert.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const outside = Array.from(element.children).filter((child) => {
        const childBounds = child.getBoundingClientRect();
        return childBounds.left < bounds.left - 1 || childBounds.right > bounds.right + 1
          || childBounds.top < bounds.top - 1 || childBounds.bottom > bounds.bottom + 1;
      }).map((child) => child.className);
      const overflowing = Array.from(element.querySelectorAll<HTMLElement>(
        ".wl-alert__body, .wl-alert__title, .wl-alert__text, .wl-alert__action"
      ))
        .filter((child) => child.scrollWidth > child.clientWidth + 1)
        .map((child) => child.className);
      return {
        bodyWidth: element.querySelector(".wl-alert__body")?.getBoundingClientRect().width ?? 0,
        left: bounds.left,
        right: bounds.right,
        viewportWidth: document.documentElement.clientWidth,
        localOverflow: element.scrollWidth - element.clientWidth,
        outside,
        overflowing
      };
    });
    return geometry.bodyWidth;
  }, { message: "Alert body remains readable with both action and close controls" }).toBeGreaterThanOrEqual(80);
  expect(geometry.left).toBeGreaterThanOrEqual(-1);
  expect(geometry.right).toBeLessThanOrEqual(geometry.viewportWidth + 1);
  expect(geometry.localOverflow).toBeLessThanOrEqual(1);
  expect(geometry.outside, "Icon, body, action and close stay within the alert").toEqual([]);
  expect(geometry.overflowing, "Alert content has no hidden horizontal overflow").toEqual([]);
  // The maximum fits only when both the preview and the whole page fit.
  await expect.poll(() => preview.evaluate((element) => {
    const root = document.documentElement;
    return Math.max(element.scrollWidth - element.clientWidth, root.scrollWidth - root.clientWidth);
  })).toBeLessThanOrEqual(1);
}

for (const width of [320, 390]) {
  test(`gavia: Alert text and controls fit at ${width}px and both dismiss actions work`, async ({ page, baseURL }) => {
    await page.setViewportSize({ width, height: 844 });
    const url = new URL(baseURL ?? "http://127.0.0.1:4173/");
    url.search = new URLSearchParams({ view: "system", theme: "gavia" }).toString();
    await page.goto(russianPlaygroundUrl(url.href), { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Дизайн-система", exact: true })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("data-wl-theme", "gavia");

    await chooseDropdownOption(page, page.getByRole("combobox", { name: "Компонент", exact: true }), "WlAlert");
    const explorer = page.getByTestId("ds-explorer");
    const preview = page.getByTestId("ds-example-preview");
    await expect(explorer).toHaveAttribute("data-component", "WlAlert");
    await expect(preview.locator(":scope > .wl-stack")).toBeVisible();
    await explorer.getByRole("checkbox", { name: "closable", exact: true }).check();

    const alert = preview.getByRole("status");
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
