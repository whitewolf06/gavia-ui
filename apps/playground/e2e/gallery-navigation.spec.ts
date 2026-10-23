import { expect, type Locator, type Page, test } from "@playwright/test";
import { playgroundRouteParams, russianPlaygroundUrl } from "./playground-url";
import { chooseDropdownOption, copyCodePanel, expectMainViewCurrent, navigateDocumentationComponent, navigateMainView, openDocumentationMenu } from "./select-helpers";

const pickerNames = ["WlTimePicker", "WlFilePicker"] as const;
type PickerName = (typeof pickerNames)[number];
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
  await expectMainViewCurrent(page, "Документация");
  const docs = page.getByTestId("docs-page");
  const heading = docs.getByRole("heading", { level: 1, name, exact: true });
  await expect(heading).toBeVisible();
  await expect(heading).toBeInViewport();
  await expect.poll(() => {
    const url = new URL(page.url());
    return { view: playgroundRouteParams(url).get("view"), component: playgroundRouteParams(url).get("component") };
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
  const docsUrl = new URL("?view=components&theme=gavia", baseURL ?? "http://127.0.0.1:4173/").href;
  await page.goto(russianPlaygroundUrl(docsUrl), { waitUntil: "domcontentloaded" });
  // The SPA bootstrap and Docs chunk can finish after the static document loads.
  await page.getByTestId("docs-page").waitFor({ state: "visible" });
  await expect(page.getByTestId("docs-page").getByRole("heading", { level: 1 })).toHaveText("Документация");
  await expect.poll(() => playgroundRouteParams(new URL(page.url())).get("view")).toBe("docs");
  await page.addStyleTag({ content: "html { scroll-behavior: auto; }" });
});

test.afterEach(async ({ page }) => {
  expect(pageErrors.get(page), "Documentation examples must load without runtime errors").toEqual([]);
});

test("legacy component input resolves to a canonical hosted route without losing its theme or anchor", async ({ page }) => {
  await page.goto("/?view=docs&component=WlTabs&lang=ru&theme=graphite#docs-wltabs-props");
  await expect(page.locator('[data-docs-component="WlTabs"]')).toBeVisible();
  await expect(page).toHaveURL((url) => url.pathname === "/ru/docs/components/WlTabs/"
    && url.searchParams.get("theme") === "graphite"
    && !url.searchParams.has("view") && !url.searchParams.has("component") && !url.searchParams.has("lang")
    && url.hash === "#docs-wltabs-props");
  await expect(page.locator("#docs-wltabs-props")).toBeInViewport();
  await page.reload();
  await expect(page.locator("#docs-wltabs-props")).toBeInViewport();
});

test("Docs catalog marks new components and opens the real button example", async ({ page }) => {
  const docs = await openDocumentationMenu(page);
  const catalog = docs.getByRole("navigation", { name: "Каталог компонентов", exact: true });
  const item = catalog.getByRole("button", { name: "WlButton", exact: true });
  await expect(item.locator(".docs-component-version")).toHaveCount(0);
  await expect(item).not.toHaveAttribute("aria-describedby");
  const newItem = catalog.getByRole("button", { name: "WlLink", exact: true });
  await expect(newItem.locator(".docs-component-version")).toHaveText("Новое");
  await expect(newItem).toHaveAccessibleDescription("Новое");

  // Header controls also use WlButton; catalog navigation must reach its actual example.
  const buttonWorkspace = await navigateDocumentationComponent(page, "WlButton");
  await expect(docs.locator(".docs-version")).toHaveText("v0.1.0");
  const button = buttonWorkspace.getByTestId("docs-button-preview").getByRole("button", { name: "Добавить", exact: true });
  await button.click();
  await expect(buttonWorkspace.getByTestId("docs-button-preview").getByRole("status")).toHaveText("Нажатий: 1");
});

// Exhaustive canonical/rich consumer compilation stays in playground-examples.test.ts
// and documentation-components.test.ts; this scenario checks real lazy navigation/copy.
test("Docs lazily loads a live example, copies public source and returns through history", async ({ page }) => {
  const workspace = await navigateDocumentationComponent(page, "WlSelect");
  await expect(page.getByTestId("docs-page").getByRole("heading", { level: 1 })).toHaveText("WlSelect");
  await expect.poll(() => playgroundRouteParams(new URL(page.url())).get("component")).toBe("WlSelect");
  const explorer = workspace.getByTestId("ds-explorer");
  const preview = explorer.getByTestId("ds-example-preview");
  await expect(preview.locator(":scope > .wl-stack")).toBeVisible();
  const source = explorer.locator("pre code");
  await expect(source).toContainText('from "gavia-ui"');
  await expect(source).not.toContainText("packages/ui-kit");
  const extra = workspace.locator('[data-docs-component-extra="WlSelect"]');
  await expect(extra.getByTestId("docs-component-extra-preview").locator(":scope > *").first()).toBeVisible();
  await expect(extra.getByTestId("docs-component-extra-source").locator("pre code")).toContainText("<template>");

  await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: {
    writeText: async (text: string) => {
      document.documentElement.dataset.copied = text;
    }
  } }));
  await copyCodePanel(explorer);
  await expect(explorer.getByRole("status").last()).toHaveText("Код скопирован.");
  const copied = await page.locator("html").getAttribute("data-copied");
  expect(copied).toContain('from "gavia-ui"');
  expect(copied).not.toContain('v-bind="preview"');
  expect(copied).not.toContain("packages/ui-kit");

  await navigateDocumentationComponent(page, "WlButton");
  await page.goBack();
  await expect(page.getByTestId("docs-page").getByRole("heading", { level: 1 })).toHaveText("WlSelect");
  await expect(preview.locator(":scope > .wl-stack")).toBeVisible();
});

test("Docs catalog reaches the time picker and its model clears to null", async ({ page, baseURL }) => {
  await navigateDocumentationComponent(page, "WlTimePicker");
  await expect(pickerPreview(page, "WlTimePicker").getByLabel("Время встречи", { exact: true })).toHaveValue("09:30 AM");
  const card = await expectPickerDestination(page, "WlTimePicker");
  const input = card.getByLabel("Время встречи", { exact: true });
  await expect(input).toHaveAttribute("type", "text");
  await input.fill("11:45 AM");
  await input.press("Enter");
  await expect(input).toHaveValue("11:45 AM");
  await expect(card.getByRole("status")).toHaveText("Выбрано: 11:45");
  await input.fill("");
  await input.press("Enter");
  await expect(input).toHaveValue("");
  await expect(card.getByRole("status")).toHaveText("Выбрано: время не задано");
  await expectNoOverflow(page, card);

  const legacy = new URL("?view=components#component-WlTimePicker", baseURL ?? "http://127.0.0.1:4173/");
  await page.goto(russianPlaygroundUrl(legacy.href), { waitUntil: "domcontentloaded" });
  await expectPickerDestination(page, "WlTimePicker");
  await page.reload();
  await expectPickerDestination(page, "WlTimePicker");
  await expect(pickerPreview(page, "WlTimePicker").getByLabel("Время встречи", { exact: true })).toHaveValue("09:30 AM");
});

test("Docs catalog reaches the file picker and can clear and reselect a long filename", async ({ page }) => {
  const originalViewport = page.viewportSize()!;
  const file = { name: "gallery-" + "x".repeat(120) + ".txt", mimeType: "text/plain", buffer: Buffer.from("gallery file") };
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
  await card.getByRole("button", { name: "Очистить список", exact: true }).click();
  await expect(status).toHaveText("Можно выбрать файлы повторно.");
  await expect(card.getByRole("button", { name: "Очистить список", exact: true })).toHaveCount(0);
  await expectNoOverflow(page, card);

  // Reselect the same raw file on this mounted picker.
  const reopened = page.waitForEvent("filechooser");
  await button.click();
  const sameFileChooser = await reopened;
  expect(sameFileChooser.isMultiple()).toBe(true);
  await sameFileChooser.setFiles(file);
  await expect(status).toHaveText("Выбрано: " + file.name);
  await expect(input).toHaveValue("");
  await card.getByRole("button", { name: "Очистить список", exact: true }).click();
  await expect(status).toHaveText("Можно выбрать файлы повторно.");
  await expect(card.getByRole("button", { name: "Очистить список", exact: true })).toHaveCount(0);
  await expectNoOverflow(page, card);
});

for (const name of pickerNames) {
  test("DesignSystem opens the live " + name + " documentation", async ({ page }) => {
    await navigateMainView(page, "Дизайн-система");
    await expect(page.getByRole("heading", { name: "Дизайн-система", exact: true })).toBeVisible();
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
    await expect(page.getByRole("heading", { name: "Дизайн-система", exact: true })).toBeVisible();
    await page.locator(".pg-top").getByRole("button", { name: "Поиск", exact: true }).click();
    const search = page.getByRole("combobox", { name: "Командная палитра", exact: true });
    await expect(search).toBeFocused();
    await search.fill(name);
    const palette = page.locator(".wl-command-palette");
    const destination = palette.getByRole("option").filter({ has: page.getByText(name, { exact: true }) });
    await expect(destination).toHaveCount(1);
    await expect(destination).toBeVisible();
    const targetId = await destination.getAttribute("id");
    expect(targetId).toBeTruthy();
    await expect(search).toHaveAttribute("aria-activedescendant", targetId!);
    await search.press("Enter");
    await expect(palette).toHaveCount(0);
    await expectPickerDestination(page, name);
    await expect(page.getByTestId("ds-explorer")).toHaveCount(1);
    await expect(page.getByTestId("ds-explorer")).toHaveAttribute("data-component", name);
  });
}
