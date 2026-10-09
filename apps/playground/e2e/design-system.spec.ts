import { russianPlaygroundUrl } from "./playground-url";
import { expect, test, type Page } from "@playwright/test";
import { chooseDropdownOption, chooseShowcaseTheme, expectMainViewCurrent } from "./select-helpers";
import { resolveWlToken, wlDesignTokens, wlDesignThemes, wlContrastReport } from "../../../packages/ui-kit/src/design-system";
import { wlManifest } from "../../../packages/ui-kit/src/manifest";

type RuntimeCounts = { pageErrors: number; warnings: number; errors: number };
const nestedRuntime = new WeakMap<Page, RuntimeCounts>();

function rgb(hex: string): string {
  return `rgb(${[1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16)).join(", ")})`;
}

test.beforeEach(async ({ page }, testInfo) => {
  if (testInfo.title.startsWith("nested anchored portals:")) {
    const counts = { pageErrors: 0, warnings: 0, errors: 0 };
    nestedRuntime.set(page, counts);
    page.on("pageerror", () => { counts.pageErrors += 1; });
    page.on("console", (message) => {
      if (message.type() === "warning") counts.warnings += 1;
      if (message.type() === "error") counts.errors += 1;
    });
    await page.setViewportSize(testInfo.project.use.isMobile
      ? { width: 390, height: 844 } : { width: 1440, height: 900 });
  }
  await page.goto(russianPlaygroundUrl("/?view=system"));
  const heading = page.getByRole("heading", { name: "Дизайн-система" });
  // The view loads as an async chunk after the navigation load event.
  await heading.waitFor({ state: "visible" });
  await expect(heading).toBeVisible();
});

test.afterEach(async ({ page }, testInfo) => {
  const counts = nestedRuntime.get(page);
  if (!counts) return;
  await testInfo.attach("nested-overlay-runtime-counts", {
    body: JSON.stringify(counts), contentType: "application/json"
  });
  expect(counts).toEqual({ pageErrors: 0, warnings: 0, errors: 0 });
});

test("catalog filters all tokens and resolves the selected theme", async ({ page }) => {
  await chooseDropdownOption(page, page.getByRole("combobox", { name: "Слой", exact: true }), "Все слои");
  await expect(page.getByTestId("ds-token-count")).toHaveText(String(wlDesignTokens.length));
  await page.getByRole("searchbox", { name: "Поиск токена" }).fill("--wl-action-primary-text");
  await expect(page.getByTestId("ds-token-count")).toHaveText("1");
  const row = page.locator('[data-token="--wl-action-primary-text"]');
  await expect(row).toContainText("#ffffff");
  await chooseShowcaseTheme(page, "Classic Dark");
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
  await page.getByRole("button", { name: "Открыть руководство" }).click();
  await expect(page.getByRole("heading", { name: "WlInput", exact: true })).toBeVisible();
  await expectMainViewCurrent(page, "Документация");
  await page.goBack();
  await expect(page.getByRole("heading", { name: "Дизайн-система" })).toBeVisible();
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
    await chooseShowcaseTheme(page, theme.label);
    await expect(page.locator("html")).toHaveAttribute("data-wl-theme", theme.name);
    // evaluateAll does not retry when a lazy view is still mounting after navigation.
    await expect(page.getByRole("form", { name: "Пример формы" })).toBeVisible();
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
    await chooseShowcaseTheme(page, theme.label);
    const durations = await page.locator(".ds-theme-preview").evaluateAll((elements) => elements.map((element) => getComputedStyle(element).getPropertyValue("--wl-dur-5").trim()));
    // Production CSS may omit the leading zero; duration and units stay exact.
    expect(durations.map((duration) => duration.replace(/^0(?=\.)/, ""))).toEqual(wlDesignThemes.map(() => ".01ms"));
  }
});

test.describe("nested anchored portal interactions", () => {
  test.describe.configure({ retries: 0, timeout: 45_000 });
  for (const theme of wlDesignThemes) {
    test(`nested anchored portals: ${theme.label}`, async ({ page }) => {
      await chooseShowcaseTheme(page, theme.label);
      await expect(page.locator("html")).toHaveAttribute("data-wl-theme", theme.name);
      await page.getByRole("combobox", { name: "Компонент", exact: true }).click();
      await page.getByRole("listbox").getByRole("option", { name: "WlPopover", exact: true }).click();
      await expect(page.getByTestId("ds-explorer")).toHaveAttribute("data-component", "WlPopover");
      const preview = page.getByTestId("ds-example-preview");
      const open = preview.getByRole("button", { name: "Сведения", exact: true });
      const popover = page.getByRole("dialog", { name: "Сведения о материале", exact: true });
      await open.click();
      const select = popover.getByRole("combobox", { name: "Тип материала", exact: true });
      await select.click();
      // Ordinary pointer selection exercises pointerdown before option mousedown/click.
      await page.getByRole("listbox").getByRole("option", { name: "Сроки задач", exact: true }).click();
      await expect(preview.getByRole("status", { name: "Выбранный тип", exact: true })).toHaveText("task_deadline");
      await expect(select).toHaveText("Сроки задач");
      await expect(select).toBeFocused();
      await expect(popover).toBeVisible();
      await expect(page.getByRole("listbox")).toHaveCount(0);
      await select.click();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("listbox")).toHaveCount(0);
      await expect(popover).toBeVisible();
      await expect(select).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(popover).toHaveCount(0);
      await expect(open).toBeFocused();

      await open.click();
      await select.click();
      const openDialog = preview.getByRole("button", { name: "Вложенные фильтры", exact: true });
      // Anchored panels are clamped at least 4 px inside the viewport.
      // This real pointer is outside both panels and does not depend on a covered sibling button.
      await page.mouse.click(1, 1);
      await expect(popover).toHaveCount(0);
      await expect(page.getByRole("listbox")).toHaveCount(0);
      await openDialog.click();
      const dialog = page.getByRole("dialog", { name: "Вложенные фильтры", exact: true });
      await expect(dialog).toBeVisible();
      const openFilters = dialog.getByRole("button", { name: "Открыть фильтры", exact: true });
      await openFilters.click();
      const nested = page.getByRole("dialog", { name: "Фильтры в диалоге", exact: true });
      const nestedSelect = nested.getByRole("combobox", { name: "Тип в диалоге", exact: true });
      await nestedSelect.click();
      await page.getByRole("listbox").getByRole("option", { name: "Сроки задач", exact: true }).click();
      await expect(dialog.getByRole("status", { name: "Выбранный тип в диалоге", exact: true })).toHaveText("task_deadline");
      await expect(nestedSelect).toHaveText("Сроки задач");
      await expect(nested).toBeVisible();
      await expect(dialog).toBeVisible();
      await nestedSelect.click();
      const first = dialog.locator("button").first();
      const last = dialog.getByRole("button", { name: "Готово", exact: true });
      await last.focus();
      await page.keyboard.press("Tab");
      await expect(first).toBeFocused();
      await expect(page.getByRole("listbox")).toBeVisible();
      await page.keyboard.press("Shift+Tab");
      await expect(last).toBeFocused();
      await expect(page.getByRole("listbox")).toBeVisible();
      await nestedSelect.focus();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("listbox")).toHaveCount(0);
      await expect(nested).toBeVisible();
      await expect(dialog).toBeVisible();
      await expect(nestedSelect).toBeFocused();
      await nested.getByRole("button", { name: "Кнопка внутри фильтров", exact: true }).click();
      await page.keyboard.press("Escape");
      await expect(nested).toHaveCount(0);
      await expect(dialog).toBeVisible();
      await expect(openFilters).toBeFocused();
      await openFilters.click();
      const date = nested.getByRole("textbox", { name: "Дата в диалоге", exact: true });
      await date.click();
      await page.getByRole("button", { name: "2026-10-09", exact: true }).click();
      await expect(dialog.getByRole("status", { name: "Выбранная дата в диалоге", exact: true })).toHaveText("2026-10-09");
      await expect(date).toHaveValue("09.10.2026");
      await expect(date).toBeFocused();
      await expect(nested).toBeVisible();
      await expect(dialog).toBeVisible();
      await date.click();
      await expect(page.locator(".wl-dp__panel")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.locator(".wl-dp__panel")).toHaveCount(0);
      await expect(date).toBeFocused();
      await expect(nested).toBeVisible();
      await expect(dialog).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(nested).toHaveCount(0);
      await expect(dialog).toBeVisible();
      await expect(openFilters).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);
      await expect(openDialog).toBeFocused();
    });
  }
});
