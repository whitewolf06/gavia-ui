import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { WL_ICON_NAMES } from "../../../packages/ui-kit/src/icons.generated";

const uiKitVersion = (JSON.parse(readFileSync(
  new URL("../../../packages/ui-kit/package.json", import.meta.url), "utf8"
)) as { version: string }).version;

test.beforeEach(async ({ page }) => {
  await page.goto("/e2e.html");
  await expect(page.getByRole("heading", { name: "WhiteUI regression" })).toBeVisible();
});

test("selection controls keep values and keyboard behavior", async ({ page }) => {
  const select = page.getByRole("combobox", { name: "Выбор", exact: true });
  await select.focus();
  await select.press("ArrowDown");
  await expect(page.getByRole("listbox")).toBeVisible();
  await select.press("Enter");
  await expect(page.locator("#select-value")).toHaveText("a");
  await select.click();
  await page.getByRole("option", { name: "Бета" }).click();
  await expect(page.locator("#select-value")).toHaveText("b");

  await page.getByRole("combobox", { name: "Множественный выбор" }).click();
  await page.getByRole("option", { name: "Альфа" }).click();
  await expect(page.locator("#multi-value")).toHaveText("a");
  await page.getByRole("searchbox", { name: "Фильтр" }).fill("Бе");
  await page.locator(".wl-multiselect-overlay").getByRole("option", { name: "Бета" }).click();
  await expect(page.locator("#multi-value")).toHaveText("a,b");
  await page.getByRole("button", { name: "Удалить Альфа" }).click();
  await expect(page.locator("#multi-value")).toHaveText("b");

  await page.getByRole("combobox", { name: "Подсказки" }).fill("Бе");
  await page.locator(".wl-autocomplete-overlay").getByRole("option", { name: "Бета" }).click();
  await expect(page.locator("#auto-value")).toHaveText("b");
});

test("date picker keeps ISO model and honours text entry", async ({ page }) => {
  const input = page.getByRole("textbox", { name: "Дата" });
  await input.click();
  const day = page.locator(".wl-dp__day:not(.is-muted):not(.is-disabled)").first();
  const iso = await day.getAttribute("aria-label");
  await day.click();
  await expect(page.locator("#date-value")).toHaveText(iso ?? "");
  await input.fill("15.03.2026");
  await input.press("Enter");
  await expect(page.locator("#date-value")).toHaveText("2026-03-15");
  await input.click();
  await page.getByRole("button", { name: "Выбрать год, сейчас 2026" }).click();
  await page.getByRole("button", { name: "2026", exact: true }).click();
  await page.getByRole("button", { name: "Март", exact: true }).click();
  await page.locator('.wl-dp__day[aria-label="2026-03-16"]').click();
  await expect(page.locator("#date-value")).toHaveText("2026-03-16");
});

test("dialog, drawer, menu and popover open and close", async ({ page }) => {
  await page.locator("#dialog-open").focus();
  await page.locator("#dialog-open").press("Enter");
  await expect(page.getByRole("dialog", { name: "Проверка диалога" })).toBeVisible();
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Проверка диалога" })).toHaveCount(0);
  await expect(page.locator("#dialog-open")).toBeFocused();

  await page.locator("#drawer-open").click();
  await expect(page.getByRole("dialog", { name: "Проверка панели" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Проверка панели" })).toHaveCount(0);

  await page.locator("#menu-open").click();
  await expect(page.getByRole("menu", { name: "Действия" })).toBeVisible();
  await page.getByRole("menuitem", { name: "Выполнить" }).click();
  await expect(page.locator("#action-status")).toHaveText("Меню выполнено");

  await page.locator("#popover-open").click();
  await expect(page.getByRole("dialog", { name: "Детали" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Детали" })).toHaveCount(0);
});

test("toast, confirmation and tooltip remain accessible", async ({ page }) => {
  await page.locator("#toast-open").click();
  await expect(page.locator(".wl-toast__summary")).toHaveText("Сохранено");
  await page.locator("#confirm-open").click();
  await expect(page.getByRole("dialog", { name: "Подтверждение" })).toBeVisible();
  await page.getByRole("button", { name: "Удалить", exact: true }).click();
  await expect(page.locator("#action-status")).toHaveText("Подтверждено");
  await page.locator("#tooltip-anchor").hover();
  await expect(page.getByRole("tooltip")).toHaveText("Подсказка");
});

test("all themes render without runtime errors", async ({ page, browserName }, testInfo) => {
  const errors: string[] = [];
  const backgrounds: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const theme of ["white", "graphite", "newspaper"]) {
    await page.evaluate((name) => document.documentElement.setAttribute("data-wl-theme", name), theme);
    await expect(page.locator(".wl-table__row")).toHaveCount(2);
    backgrounds.push(await page.locator("body").evaluate((element) => getComputedStyle(element).backgroundColor));
    if (browserName === "chromium") {
      await page.screenshot({ path: testInfo.outputPath(`fixture-${theme}.png`), fullPage: true });
    }
  }
  expect(new Set(backgrounds).size).toBe(3);
  expect(errors).toEqual([]);
});

test("the complete icon batch renders at three sizes in each theme", async ({ page, browserName }, testInfo) => {
  await page.goto("/");
  await expect(page.locator(".pg-brand .pg-kit-version")).toHaveText(`v${uiKitVersion}`);
  const gallery = page.locator(".pg-sec").filter({ has: page.getByRole("heading", { name: "Иконки" }) });
  await expect(gallery.locator(".pg-icon-cell")).toHaveCount(WL_ICON_NAMES.length);
  await expect(gallery.locator('svg[data-wl="icon"]')).toHaveCount(WL_ICON_NAMES.length * 3);
  for (const theme of ["white", "graphite", "newspaper"]) {
    await page.locator(".pg-theme").getByText(theme === "white" ? "White" : theme === "graphite" ? "Graphite" : "Newspaper", { exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("data-wl-theme", theme);
    await expect(gallery.locator(".pg-icon-cell").first()).toBeVisible();
    if (browserName === "chromium") {
      await gallery.locator(".pg-icon-grid").screenshot({ path: testInfo.outputPath(`icons-${theme}.png`) });
    }
  }
});
