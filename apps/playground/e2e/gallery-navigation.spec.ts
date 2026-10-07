import { wlDesignThemes } from "../../../packages/ui-kit/src/design-system/tokens.generated";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { chooseDropdownOption, chooseShowcaseTheme, navigateDocumentationComponent, navigateMainView, openDocumentationMenu } from "./select-helpers";
import { wlManifest } from "../../../packages/ui-kit/src/manifest";

const pickerNames = ["WlTimePicker", "WlFilePicker"] as const;
type PickerName = (typeof pickerNames)[number];
const themes = wlDesignThemes;
const pageErrors = new WeakMap<Page, string[]>();

function pickerPreview(page: Page, name: PickerName): Locator {
  return page.getByTestId("docs-page").locator('[data-docs-component="' + name + '"]')
    .getByTestId("ds-explorer").getByTestId("ds-example-preview");
}

async function setDocumentationViewport(page: Page, viewport: { width: number; height: number }): Promise<void> {
  const menu = page.getByTestId("docs-page").locator(".docs-menu");
  const summary = menu.locator(".docs-menu-summary");
  const wasCompact = await summary.isVisible();
  await page.setViewportSize(viewport);
  // CSS responds before Vue applies the matchMedia-driven details.open binding.
  if (viewport.width <= 760) {
    await expect(summary).toBeVisible();
    if (!wasCompact) await expect(menu).toHaveJSProperty("open", false);
  } else {
    await expect(summary).toBeHidden();
    await expect(menu).toHaveJSProperty("open", true);
  }
}

async function expectPickerDestination(page: Page, name: PickerName): Promise<Locator> {
  await expect(page.locator('.pg-views [aria-current="page"]')).toHaveText("Документация");
  const docs = page.getByTestId("docs-page");
  const heading = docs.getByRole("heading", { level: 1, name, exact: true });
  await expect(heading).toBeVisible();
  await expect(heading).toBeInViewport();
  await expect.poll(() => {
    const url = new URL(page.url());
    return { view: url.searchParams.get("view"), component: url.searchParams.get("component") };
  }).toEqual({ view: "docs", component: name });
  const workspace = docs.locator('[data-docs-component="' + name + '"]');
  await expect(workspace).toHaveCount(1);
  await expect(workspace.getByTestId("ds-explorer")).toHaveAttribute("data-component", name);
  const preview = pickerPreview(page, name);
  await expect(preview.locator(":scope > .wl-stack")).toBeVisible();
  if (name === "WlTimePicker") {
    // The primary and rich examples must not duplicate the canonical label/id.
    await expect(page.locator('[id="example-time"]')).toHaveCount(1);
    await expect(preview.getByLabel("Время встречи", { exact: true })).toBeVisible();
  } else {
    await expect(preview.getByRole("button", { name: "Выбрать файлы", exact: true })).toBeVisible();
  }
  return preview;
}

async function expectNoOverflow(page: Page, card: Locator): Promise<void> {
  await expect.poll(() => page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth
  )).toBeLessThanOrEqual(1);
  await expect.poll(() => card.evaluate((element) =>
    element.scrollWidth - element.clientWidth
  )).toBeLessThanOrEqual(1);
}

test.beforeEach(async ({ page, baseURL }) => {
  const errors: string[] = [];
  pageErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
  // The former gallery URL remains a supported alias, including the Pages prefix.
  const docsUrl = new URL("?view=components", baseURL ?? "http://127.0.0.1:4173/").href;
  await page.goto(docsUrl, { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("docs-page").getByRole("heading", { level: 1 })).toHaveText("Документация");
  await expect.poll(() => new URL(page.url()).searchParams.get("view")).toBe("docs");
  await page.addStyleTag({ content: "html { scroll-behavior: auto; }" });
});

test.afterEach(async ({ page }) => {
  expect(pageErrors.get(page), "Documentation examples must load without runtime errors").toEqual([]);
});

test("every manifest component has a populated live and source destination in Docs", async ({ page }) => {
  const docs = await openDocumentationMenu(page);
  const catalog = docs.getByRole("navigation", { name: "Каталог компонентов", exact: true });
  await expect(catalog.getByRole("button")).toHaveCount(wlManifest.length);
  await expect(catalog.locator(".docs-component-version")).toHaveCount(wlManifest.length);
  for (const entry of wlManifest) {
    const item = catalog.getByRole("button", { name: entry.name, exact: true });
    await expect(item.locator(".docs-component-version")).toBeVisible();
    await expect(item.locator(".docs-component-version"), entry.name + " first available version").toHaveText("С " + entry.introducedIn);
    await expect(item).toHaveAccessibleDescription("С " + entry.introducedIn);
  }

  for (const entry of wlManifest) {
    const workspace = await navigateDocumentationComponent(page, entry.name);
    await expect(docs.getByRole("heading", { level: 1 })).toHaveText(entry.name);
    await expect.poll(() => new URL(page.url()).searchParams.get("component"), entry.name + " route").toBe(entry.name);
    const preview = entry.name === "WlButton" ? workspace.getByTestId("docs-button-preview")
      : workspace.getByTestId("ds-explorer").getByTestId("ds-example-preview");
    await expect(preview.locator(":scope > *").first(), entry.name + " actual live example").toBeVisible();
    await expect(preview.getByText("Пример не найден.", { exact: true })).toHaveCount(0);
    const source = entry.name === "WlButton" ? workspace.getByTestId("docs-button-source").locator("pre code")
      : workspace.getByTestId("ds-explorer").locator("pre code");
    // Collapsed code remains present and must refer to the consumer package.
    await expect(source, entry.name + " consumer source").toContainText('from "gavia-ui"');
    expect(await source.textContent(), entry.name + " public import").not.toContain("packages/ui-kit");
    if (entry.name !== "WlButton") {
      const extra = workspace.locator('[data-docs-component-extra="' + entry.name + '"]');
      await expect(extra.getByTestId("docs-component-extra-preview").locator(":scope > *").first(), entry.name + " rich live example").toBeVisible();
      await expect(extra.getByTestId("docs-component-extra-source").locator("pre code")).toContainText("<template>");
    }
  }

  // Header controls also use WlButton; catalog navigation must reach its actual example.
  const buttonWorkspace = await navigateDocumentationComponent(page, "WlButton");
  const button = buttonWorkspace.getByTestId("docs-button-preview").getByRole("button", { name: "Добавить", exact: true });
  await button.click();
  await expect(buttonWorkspace.getByTestId("docs-button-preview").getByRole("status")).toHaveText("Действий: 1");
});

test("Docs catalog reaches the time picker and its model clears to null in all themes", async ({ page, baseURL }) => {
  await navigateDocumentationComponent(page, "WlTimePicker");
  await expect(pickerPreview(page, "WlTimePicker").getByLabel("Время встречи", { exact: true })).toHaveValue("09:30");
  for (const theme of themes) {
    await chooseShowcaseTheme(page, theme.label);
    await expect(page.locator("html")).toHaveAttribute("data-wl-theme", theme.name);
    await navigateDocumentationComponent(page, "WlTimePicker");
    const card = await expectPickerDestination(page, "WlTimePicker");
    const input = card.getByLabel("Время встречи", { exact: true });
    await expect(input).toHaveAttribute("type", "time");
    await input.fill("12:34");
    await input.press("Enter");
    await expect(input).toHaveValue("12:34");
    await expect(card.getByRole("status")).toHaveText("Выбрано: 12:34");
    await input.fill("");
    await input.press("Enter");
    await expect(input).toHaveValue("");
    await expect(card.getByRole("status")).toHaveText("Выбрано: время не задано");
    await expectNoOverflow(page, card);
  }

  const legacy = new URL("?view=components#component-WlTimePicker", baseURL ?? "http://127.0.0.1:4173/");
  await page.goto(legacy.href, { waitUntil: "domcontentloaded" });
  await expectPickerDestination(page, "WlTimePicker");
  await page.reload();
  await expectPickerDestination(page, "WlTimePicker");
  await expect(pickerPreview(page, "WlTimePicker").getByLabel("Время встречи", { exact: true })).toHaveValue("09:30");
});

for (const theme of themes) {
  test("Docs catalog reaches the file picker and can clear and reselect a long filename (" + theme.label + ")", async ({ page }) => {
    const originalViewport = page.viewportSize()!;
    const file = { name: "gallery-" + "x".repeat(120) + ".txt", mimeType: "text/plain", buffer: Buffer.from("gallery file") };
    await chooseShowcaseTheme(page, theme.label);
    await expect(page.locator("html")).toHaveAttribute("data-wl-theme", theme.name);
    await navigateDocumentationComponent(page, "WlFilePicker");
    const card = await expectPickerDestination(page, "WlFilePicker");
    const button = card.getByRole("button", { name: "Выбрать файлы", exact: true });
    const input = card.locator('input[type="file"]');
    const status = card.getByRole("status");
    await expect(input).toBeHidden();
    await expect(input).toHaveAttribute("accept", ".pdf,.txt");
    const opened = page.waitForEvent("filechooser");
    await button.click();
    const chooser = await opened;
    expect(chooser.isMultiple()).toBe(true);
    await chooser.setFiles(file);
    await expect(status).toHaveText("Выбрано: " + file.name);
    await expect(input).toHaveValue("");
    await expectNoOverflow(page, card);

    // Check the actual unbroken filename at narrow width, not merely its clipped border.
    await setDocumentationViewport(page, { width: 320, height: originalViewport.height });
    await navigateDocumentationComponent(page, "WlFilePicker");
    await expectPickerDestination(page, "WlFilePicker");
    await expectNoOverflow(page, card);
    await expect.poll(() => status.evaluate((element) =>
      element.scrollWidth - element.clientWidth
    )).toBeLessThanOrEqual(1);

    await setDocumentationViewport(page, originalViewport);
    await navigateDocumentationComponent(page, "WlFilePicker");
    await expectPickerDestination(page, "WlFilePicker");
    await card.getByRole("button", { name: "Очистить список приложения", exact: true }).click();
    await expect(status).toHaveText("Можно выбрать файлы повторно.");
    await expect(card.getByRole("button", { name: "Очистить список приложения", exact: true })).toHaveCount(0);
    await expectNoOverflow(page, card);

    // Each theme owns a fresh page, so reselect the same raw file on this mounted picker.
    const reopened = page.waitForEvent("filechooser");
    await button.click();
    const sameFileChooser = await reopened;
    expect(sameFileChooser.isMultiple()).toBe(true);
    await sameFileChooser.setFiles(file);
    await expect(status).toHaveText("Выбрано: " + file.name);
    await expect(input).toHaveValue("");
    await card.getByRole("button", { name: "Очистить список приложения", exact: true }).click();
    await expect(status).toHaveText("Можно выбрать файлы повторно.");
    await expect(card.getByRole("button", { name: "Очистить список приложения", exact: true })).toHaveCount(0);
    await expectNoOverflow(page, card);
  });
}

for (const name of pickerNames) {
  test("DesignSystem opens the live " + name + " documentation", async ({ page }) => {
    await navigateMainView(page, "Дизайн-система");
    await expect(page.getByRole("heading", { name: "Единый язык интерфейсов", exact: true })).toBeVisible();
    await chooseDropdownOption(page, page.getByRole("combobox", { name: "Компонент", exact: true }), name);
    await expect(page.getByTestId("ds-explorer")).toHaveAttribute("data-component", name);
    await expect(page.getByTestId("ds-example-preview").locator(":scope > .wl-stack")).toBeVisible();
    await page.getByRole("button", { name: "Открыть руководство", exact: true }).click();
    await expectPickerDestination(page, name);
    // The source view unmounts; only the selected Docs explorer remains.
    await expect(page.getByTestId("ds-explorer")).toHaveCount(1);
    await expect(page.getByTestId("ds-explorer")).toHaveAttribute("data-component", name);
  });

  test("command palette routes " + name + " from DesignSystem to its live documentation", async ({ page }) => {
    await navigateMainView(page, "Дизайн-система");
    await expect(page.getByRole("heading", { name: "Единый язык интерфейсов", exact: true })).toBeVisible();
    await page.locator(".pg-top").getByRole("button", { name: "Поиск", exact: true }).click();
    const search = page.getByRole("combobox", { name: "Командная палитра", exact: true });
    await expect(search).toBeFocused();
    await search.fill(name);
    const palette = page.locator(".wl-command-palette");
    await expect(palette.getByRole("option")).toHaveCount(1);
    await expect(palette.getByText(name, { exact: true })).toBeVisible();
    await search.press("Enter");
    await expect(palette).toHaveCount(0);
    await expectPickerDestination(page, name);
    await expect(page.getByTestId("ds-explorer")).toHaveCount(1);
    await expect(page.getByTestId("ds-explorer")).toHaveAttribute("data-component", name);
  });
}