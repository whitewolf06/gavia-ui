import { expect, test } from "@playwright/test";
import { resolveWlToken, wlDesignTokens, wlDesignThemes, wlContrastReport } from "../../../packages/ui-kit/src/design-system";
import { wlManifest } from "../../../packages/ui-kit/src/manifest";

function rgb(hex: string): string {
  return `rgb(${[1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16)).join(", ")})`;
}

test.beforeEach(async ({ page }) => {
  await page.goto("/?view=system");
  const heading = page.getByRole("heading", { name: "Единый язык интерфейсов" });
  // The view loads as an async chunk after the navigation load event.
  await heading.waitFor({ state: "visible" });
  await expect(heading).toBeVisible();
});

test("catalog filters all tokens and resolves the selected theme", async ({ page }) => {
  await page.getByLabel("Слой", { exact: true }).selectOption("all");
  await expect(page.getByTestId("ds-token-count")).toHaveText(String(wlDesignTokens.length));
  await page.getByRole("searchbox", { name: "Поиск токена" }).fill("--wl-action-primary-text");
  await expect(page.getByTestId("ds-token-count")).toHaveText("1");
  const row = page.locator('[data-token="--wl-action-primary-text"]');
  await expect(row).toContainText("#ffffff");
  await page.locator(".pg-theme").getByText("Graphite", { exact: true }).click();
  await expect(row).toContainText("#17181c");
  await expect(row).toContainText("var(--wl-gray-950)");
  await page.getByRole("searchbox", { name: "Поиск токена" }).fill("does-not-exist");
  await expect(page.getByTestId("ds-token-count")).toHaveText("0");
  await expect(page.getByText("Токены не найдены. Измените запрос или фильтры.")).toBeVisible();
});

test("contract catalog shows all components and links to the gallery", async ({ page }) => {
  const selector = page.getByRole("combobox", { name: "Компонент", exact: true });
  await selector.click();
  await expect(page.getByRole("listbox").getByRole("option")).toHaveCount(wlManifest.length);
  await page.getByRole("listbox").getByRole("option", { name: "WlInput", exact: true }).click();
  await expect(page.getByTestId("ds-contract")).toContainText("v-model: string");
  await expect(page.getByTestId("ds-contract").getByRole("heading", { name: "WlInput", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Открыть в витрине" }).click();
  await expect(page.getByRole("heading", { name: "Компоненты", exact: true })).toBeVisible();
  await expect(page.locator('.pg-views [aria-current="page"]')).toHaveText("Компоненты");
  await page.goBack();
  await expect(page.getByRole("heading", { name: "Единый язык интерфейсов" })).toBeVisible();
});

test("form preserves input and connects errors to controls", async ({ page }) => {
  const form = page.getByRole("form", { name: "Пример формы" });
  await form.getByRole("button", { name: "Сохранить пример" }).click();
  await expect(form.getByRole("textbox", { name: "Имя", exact: true })).toBeFocused();
  await expect(form.getByRole("textbox", { name: "Имя", exact: true })).toHaveAttribute("aria-invalid", "true");
  await expect(form.getByRole("textbox", { name: "Имя", exact: true })).toHaveAttribute("aria-describedby", "ds-name-desc");
  await expect(form.getByRole("alert").first()).toHaveText("Введите имя.");
  await form.getByRole("textbox", { name: "Имя", exact: true }).fill("Тестовый пользователь");
  await form.getByRole("textbox", { name: "Email", exact: true }).fill("incorrect");
  await form.getByRole("button", { name: "Сохранить пример" }).click();
  await expect(form.getByRole("textbox", { name: "Email", exact: true })).toBeFocused();
  await expect(form.getByRole("textbox", { name: "Имя", exact: true })).toHaveValue("Тестовый пользователь");
  await form.getByRole("textbox", { name: "Email", exact: true }).fill("test@example.com");
  await form.getByRole("button", { name: "Сохранить пример" }).click();
  await expect(form.getByRole("alert")).toContainText("Данные проверены");
  await expect(form.getByRole("textbox", { name: "Email", exact: true })).not.toHaveAttribute("aria-invalid", "true");
  await form.getByRole("textbox", { name: "Email", exact: true }).fill("changed-invalid");
  await expect(form.getByRole("alert")).toHaveText("Введите адрес в формате name@example.com.");
  await expect(form.getByText("Данные проверены", { exact: true })).toHaveCount(0);
});

test("data patterns cover loading, empty, error and successful retry", async ({ page }) => {
  const controls = page.getByRole("group", { name: "Состояние данных" });
  const content = page.getByTestId("ds-data-state");
  await controls.getByRole("button", { name: "Загрузка", exact: true }).click();
  await expect(content.getByRole("status")).toHaveAttribute("aria-busy", "true");
  await controls.getByRole("button", { name: "Пусто", exact: true }).click();
  await expect(content).toContainText("Материалов пока нет");
  await content.getByRole("button", { name: "Добавить пример" }).click();
  await expect(content.getByRole("table")).toBeVisible();
  await controls.getByRole("button", { name: "Ошибка", exact: true }).click();
  await expect(content.getByRole("alert")).toContainText("Не удалось загрузить");
  await content.getByRole("button", { name: "Повторить", exact: true }).click();
  await expect(content.getByRole("table").getByRole("row")).toHaveCount(4);
});

test("drawer preserves page width, returns focus and can disable motion", async ({ page }) => {
  const open = page.getByRole("button", { name: "Открыть панель", exact: true });
  await open.scrollIntoViewIfNeeded();
  const before = await page.locator(".ds-main").boundingBox();
  await open.focus();
  await expect(open).toHaveCSS("outline-width", "2px");
  await open.press("Enter");
  const drawer = page.getByRole("dialog", { name: "Настройка представления" });
  await expect(drawer).toBeVisible();
  const after = await page.locator(".ds-main").boundingBox();
  expect(after?.width).toBeCloseTo(before!.width, 1);
  expect(after?.x).toBeCloseTo(before!.x, 1);
  await page.keyboard.press("Escape");
  await expect(drawer).toHaveCount(0);
  await expect(open).toBeFocused();
  await page.getByRole("switch", { name: "Анимация примера панели" }).uncheck();
  await open.click();
  await expect(drawer).toBeVisible();
  await expect(page.locator(".wl-drawer-mask")).not.toHaveClass(/wl-drawer-motion/);
  await drawer.getByRole("button", { name: "Готово" }).click();
  await expect(drawer).toHaveCount(0);
});

test("themes, nested previews and responsive layout agree with the catalog", async ({ page }, testInfo) => {
  for (const theme of wlDesignThemes) {
    await page.locator(".pg-theme").getByText(theme.label, { exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("data-wl-theme", theme.name);
    const readableLabels = await page.locator(".wl-field__hint, .wl-table__th").evaluateAll((elements) => elements.map((element) => getComputedStyle(element).color));
    expect(readableLabels.length).toBeGreaterThan(0);
    expect(readableLabels.every((color) => color === rgb(resolveWlToken("--wl-text-muted", theme.name)))).toBe(true);
    for (const preview of wlDesignThemes) {
      const colors = await page.locator(`.ds-theme-preview[data-wl-theme="${preview.name}"]`).evaluate((element) => {
        const styles = getComputedStyle(element);
        const button = element.querySelector("button")!;
        return { background: styles.backgroundColor, actionText: getComputedStyle(button).color };
      });
      expect(colors.background).toBe(rgb(resolveWlToken("--wl-bg", preview.name)));
      expect(colors.actionText).toBe(rgb(resolveWlToken("--wl-action-primary-text", preview.name)));
    }
    await expect(page.getByRole("region", { name: "Контраст темы" }).getByRole("row")).toHaveCount(1 + wlContrastReport.filter((pair) => pair.theme === theme.name).length);
    const width = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
    expect(width.scroll).toBeLessThanOrEqual(width.client);
    await page.screenshot({ path: testInfo.outputPath(`design-system-${theme.name}.png`), fullPage: false });
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const theme of wlDesignThemes) {
    await page.locator(".pg-theme").getByText(theme.label, { exact: true }).click();
    const durations = await page.locator(".ds-theme-preview").evaluateAll((elements) => elements.map((element) => getComputedStyle(element).getPropertyValue("--wl-dur-5").trim()));
    expect(durations).toEqual(["0.01ms", "0.01ms", "0.01ms"]);
  }
});
