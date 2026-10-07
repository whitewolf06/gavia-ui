import { expect, test, type Locator, type Page } from "@playwright/test";
import { WL_ICON_NAMES } from "../../../packages/ui-kit/src/icons.generated";
import { resolveWlToken, wlDesignThemes } from "../../../packages/ui-kit/src/design-system";
import { chooseDropdownOption, chooseShowcaseTheme, copyCodePanel } from "./select-helpers";

const errors = new WeakMap<Page, string[]>();
function docsUrl(baseURL: string | undefined, section: "icons" | "colors"): string {
  const url = new URL(baseURL ?? "http://127.0.0.1:4173/");
  url.search = "?view=docs&section=" + section;
  url.hash = "";
  return url.href;
}
async function clipboardCapture(page: Page): Promise<void> {
  await page.evaluate(() => Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: async (value: string) => { document.documentElement.dataset.assetCopied = value; } }
  }));
}
async function noOverflow(page: Page, element: Locator): Promise<void> {
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  await expect.poll(() => element.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
}
async function exactCodeCopy(page: Page, example: Locator): Promise<void> {
  const panel = example.getByTestId("docs-asset-source");
  const code = panel.locator("pre code");
  await expect(code).toBeVisible();
  const source = await code.textContent();
  expect(source?.length).toBeGreaterThan(0);
  expect(source).not.toContain("packages/ui-kit");
  expect((await code.locator(".ds-code-token").allTextContents()).join("")).toBe(source);
  await copyCodePanel(panel);
  await expect(panel.getByRole("status")).toHaveText("Код скопирован.");
  await expect(page.locator("html")).toHaveAttribute("data-asset-copied", source!);
}

test.beforeEach(async ({ page }) => {
  const messages: string[] = [];
  errors.set(page, messages);
  page.on("pageerror", (error) => messages.push(error.message));
});
test.afterEach(async ({ page }) => { expect(errors.get(page), "Assets pages have no runtime errors").toEqual([]); });

test("icons expose the complete registry, real selection, sizes, accessibility and exact consumer code", async ({ page, baseURL }) => {
  await page.goto(docsUrl(baseURL, "icons"), { waitUntil: "domcontentloaded" });
  const assets = page.getByTestId("docs-assets-page");
  await expect(assets).toHaveAttribute("data-docs-section", "icons");
  await expect(assets.getByRole("heading", { level: 1 })).toHaveText("Иконки");
  const catalog = assets.getByTestId("docs-icon-catalog");
  await expect(catalog.getByRole("button")).toHaveCount(WL_ICON_NAMES.length);
  expect(await catalog.getByRole("button").evaluateAll((buttons) => buttons.map((button) => button.getAttribute("data-icon-name")))).toEqual([...WL_ICON_NAMES]);
  await expect(catalog.locator("button > svg")).toHaveCount(WL_ICON_NAMES.length);
  await assets.getByRole("textbox", { name: "Поиск по имени", exact: true }).fill("folder");
  await expect(catalog.getByRole("button")).toHaveCount(WL_ICON_NAMES.filter((name) => name.includes("folder")).length);
  await catalog.getByRole("button", { name: "Выбрать иконку folder-plus", exact: true }).click();
  const playground = assets.locator('[data-asset-example="icon-playground"]');
  const preview = playground.getByTestId("docs-asset-preview");
  await expect(preview.getByRole("status")).toHaveText("Выбрано: folder-plus · 24 px");
  await chooseDropdownOption(page, preview.getByRole("combobox", { name: "Имя иконки", exact: true }), "calendar");
  await chooseDropdownOption(page, preview.getByRole("combobox", { name: "Размер иконки", exact: true }), "32");
  await expect(preview.getByRole("img", { name: "Иконка calendar, 32 px", exact: true }).locator("svg")).toHaveAttribute("width", "32px");
  for (const size of [16, 20, 24, 32, 48]) {
    const icon = preview.locator('[data-icon-comparison-size="' + size + '"] svg');
    await expect(icon).toHaveAttribute("data-icon", "calendar");
    await expect(icon).toHaveAttribute("width", size + "px");
    await expect(icon).toHaveAttribute("stroke", "currentColor");
  }
  await assets.getByRole("button", { name: "Сбросить поиск", exact: true }).click();
  await expect(catalog.getByRole("button")).toHaveCount(WL_ICON_NAMES.length);
  await assets.getByRole("textbox", { name: "Поиск по имени", exact: true }).fill("no-such-gavia-icon");
  await expect(catalog.getByRole("button")).toHaveCount(0);
  await expect(assets.getByText("Иконки не найдены. Измените название или проверьте список синонимов.", { exact: true })).toBeVisible();
  await assets.getByRole("button", { name: "Сбросить поиск", exact: true }).click();

  const accessible = assets.locator('[data-asset-example="icon-accessibility"]').getByTestId("docs-asset-preview");
  await expect(accessible.getByRole("img", { name: "Защищённое соединение", exact: true })).toBeVisible();
  expect(await accessible.locator("svg").evaluateAll((icons) => icons.every((icon) => icon.getAttribute("aria-hidden") === "true"))).toBe(true);
  await accessible.getByRole("button", { name: "Добавить материал", exact: true }).click();
  await accessible.getByRole("button", { name: "Открыть уведомления", exact: true }).click();
  await expect(accessible.getByRole("status")).toHaveText("Добавлено материалов: 1. Уведомления открыты.");
  const compatibility = assets.locator('[data-asset-example="icon-compatibility"]').getByTestId("docs-asset-preview");
  await expect(compatibility.locator('svg[data-icon="folder"]')).toHaveAttribute("width", "1.25rem");
  await expect(compatibility.locator('svg[data-icon="edit"]')).toHaveCount(1);
  await expect(compatibility.getByRole("img", { name: "Резервный знак", exact: true })).toContainText("?");
  await clipboardCapture(page);
  for (const name of ["icon-playground", "icon-accessibility", "icon-compatibility"]) await exactCodeCopy(page, assets.locator('[data-asset-example="' + name + '"]'));
});

test("colors resolve shipped themes, preserve alpha, copy exact CSS values and expose labelled states", async ({ page, baseURL }) => {
  await page.goto(docsUrl(baseURL, "colors"), { waitUntil: "domcontentloaded" });
  const assets = page.getByTestId("docs-assets-page");
  await expect(assets).toHaveAttribute("data-docs-section", "colors");
  await expect(assets.getByRole("heading", { level: 1 })).toHaveText("Цвета и темы");
  await expect(assets.locator("[data-asset-theme]")).toHaveCount(wlDesignThemes.length);
  await expect(assets.locator("[data-color-group]")).toHaveCount(5);
  const background = assets.locator('[data-color-token="--wl-bg"]');
  const mask = assets.locator('[data-color-token="--wl-mask-bg"]');
  for (const theme of wlDesignThemes) {
    await chooseShowcaseTheme(page, theme.label);
    await expect(assets).toHaveAttribute("data-docs-theme", theme.name);
    await expect(assets.getByTestId("docs-color-theme")).toContainText("Текущая тема: " + theme.label);
    await expect(background).toHaveAttribute("data-resolved-value", resolveWlToken("--wl-bg", theme.name));
    await expect(background.getByTestId("docs-color-resolved")).toHaveText(resolveWlToken("--wl-bg", theme.name));
    await expect(mask.getByTestId("docs-color-resolved")).toHaveText(resolveWlToken("--wl-mask-bg", theme.name));
    await expect(assets.getByTestId("docs-color-setup").locator("pre code")).toContainText('import "gavia-ui/themes/' + theme.name + '.css";');
  }
  await clipboardCapture(page);
  await background.getByRole("button", { name: "Копировать переменную --wl-bg", exact: true }).click();
  await expect(background.getByRole("status")).toHaveText("Скопировано: var(--wl-bg)");
  await expect(page.locator("html")).toHaveAttribute("data-asset-copied", "var(--wl-bg)");
  const themeName = await assets.getAttribute("data-docs-theme");
  const expectedMask = resolveWlToken("--wl-mask-bg", themeName as typeof wlDesignThemes[number]["name"]);
  await mask.getByRole("button", { name: "Копировать значение --wl-mask-bg", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-asset-copied", expectedMask);
  await expect(mask.getByRole("status")).toHaveText("Скопировано: " + expectedMask);
  await page.evaluate(() => Object.defineProperty(navigator, "clipboard", {
    configurable: true, value: { writeText: async () => { throw new Error("Clipboard unavailable in test"); } }
  }));
  await background.getByRole("button", { name: "Копировать переменную --wl-bg", exact: true }).click();
  await expect(background.getByRole("alert")).toHaveText("Буфер обмена недоступен. Скопируйте значение из поля ниже.");
  await expect(background.getByRole("textbox", { name: "Значение для ручного копирования --wl-bg", exact: true })).toHaveValue("var(--wl-bg)");
  await clipboardCapture(page);
  for (const name of ["color-roles", "color-states"]) await exactCodeCopy(page, assets.locator('[data-asset-example="' + name + '"]'));
  const states = assets.locator('[data-asset-example="color-states"]').getByTestId("docs-asset-preview");
  await states.getByRole("group", { name: "Статус материала", exact: true }).getByRole("button", { name: "Ошибка", exact: true }).click();
  await expect(states.getByRole("alert")).toContainText("Не удалось сохранить");
  await expect(states.getByRole("alert")).toContainText("Данные сохранены в форме. Повторите действие.");
  await states.getByRole("button", { name: "Сохранить пример", exact: true }).click();
  await expect(states.getByRole("status")).toHaveText("Сохранено материалов: 1 · Состояние: Ошибка");
});

test("asset routes and TOC remain usable at 320px with light and dark themes", async ({ page, baseURL }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto(docsUrl(baseURL, "icons"), { waitUntil: "domcontentloaded" });
  const docs = page.getByTestId("docs-page");
  const assets = page.getByTestId("docs-assets-page");
  await expect(assets).toHaveAttribute("data-docs-section", "icons");
  await noOverflow(page, docs);
  await noOverflow(page, assets.getByTestId("docs-icon-catalog"));
  const playground = assets.locator('[data-asset-example="icon-playground"]').getByTestId("docs-asset-preview");
  await chooseDropdownOption(page, playground.getByRole("combobox", { name: "Размер иконки", exact: true }), "20");
  await expect(playground.getByRole("status")).toHaveText("Выбрано: folder · 20 px");
  await noOverflow(page, playground);
  await docs.locator(".docs-menu-summary").click();
  await docs.getByRole("navigation", { name: "Оформление", exact: true }).getByRole("button", { name: "Цвета и темы", exact: true }).click();
  await expect(assets).toHaveAttribute("data-docs-section", "colors");
  expect(new URL(page.url()).searchParams.get("section")).toBe("colors");
  for (const theme of wlDesignThemes.filter((theme) => theme.name === "gavia" || theme.name === "white" || theme.name === "graphite")) {
    await chooseShowcaseTheme(page, theme.label);
    await expect(assets).toHaveAttribute("data-docs-theme", theme.name);
    await noOverflow(page, docs);
    await noOverflow(page, assets);
    for (const example of await assets.getByTestId("docs-asset-preview").all()) await noOverflow(page, example);
  }
  await docs.locator(".docs-menu-summary").click();
  await docs.getByRole("navigation", { name: "На этой странице", exact: true }).getByRole("link", { name: "Границы и фокус", exact: true }).click();
  await expect(assets.locator("#docs-colors-borders")).toBeInViewport();
  expect(new URL(page.url()).hash).toBe("#docs-colors-borders");
  await page.reload();
  await expect(assets.locator("#docs-colors-borders")).toBeInViewport();
  expect(new URL(page.url()).pathname).toBe(new URL(baseURL ?? "http://127.0.0.1:4173/").pathname);
  await noOverflow(page, docs);
  await docs.locator(".docs-menu-summary").click();
  const overview = docs.getByRole("navigation", { name: "Разделы начала работы", exact: true });
  await expect(overview.getByRole("link")).toHaveCount(6);
  await expect(overview.locator("[aria-current]")).toHaveCount(0);
  await overview.getByRole("link", { name: "Токены и темы", exact: true }).click();
  await expect(docs.getByTestId("docs-assets-page")).toHaveCount(0);
  await expect(docs.locator("#docs-tokens")).toBeInViewport();
  await expect(docs.locator(".docs-menu")).toHaveJSProperty("open", false);
  const overviewUrl = new URL(page.url());
  expect(overviewUrl.pathname).toBe(new URL(baseURL ?? "http://127.0.0.1:4173/").pathname);
  expect(overviewUrl.searchParams.get("view")).toBe("docs");
  expect(overviewUrl.searchParams.get("component")).toBeNull();
  expect(overviewUrl.searchParams.get("section")).toBeNull();
  expect(overviewUrl.hash).toBe("#docs-tokens");
  await noOverflow(page, docs);
});
