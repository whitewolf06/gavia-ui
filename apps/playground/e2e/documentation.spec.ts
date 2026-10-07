import { wlDesignThemes } from "../../../packages/ui-kit/src/design-system/tokens.generated";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { chooseDropdownOption, chooseShowcaseTheme, copyCodePanel, navigateMainView, openDocumentationMenu } from "./select-helpers";
import { writeFile } from "node:fs/promises";
import { documentationOverviewHeadings } from "../src/documentation/catalog";

const defaultStand = "http://127.0.0.1:4173/";
const pageErrors = new WeakMap<Page, string[]>();

function pageUrl(baseURL: string | undefined, query = ""): string {
  const url = new URL(baseURL ?? defaultStand);
  url.search = query;
  url.hash = "";
  return url.href;
}

async function expectRoute(page: Page, baseURL: string | undefined, view: string | null, component: string | null = null, section: string | null = null): Promise<void> {
  await expect.poll(() => {
    const url = new URL(page.url());
    return { path: url.pathname, view: url.searchParams.get("view"), component: url.searchParams.get("component"), section: url.searchParams.get("section") };
  }).toEqual({ path: new URL(baseURL ?? defaultStand).pathname, view, component, section });
}

async function expectNoHorizontalOverflow(page: Page, element: Locator): Promise<void> {
  await expect.poll(() => page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth
  )).toBeLessThanOrEqual(1);
  await expect.poll(() => element.evaluate((node) =>
    node.scrollWidth - node.clientWidth
  )).toBeLessThanOrEqual(1);
}

const buttonExampleLinks = [
  "Живой пример", "Все варианты", "Размеры и плотность", "Disabled и loading",
  "Иконки и содержимое слотов", "Ширина кнопки и отправка формы", "Когда использовать"
] as const;

async function expectComponentOutline(workspace: Locator, labels: readonly string[]): Promise<void> {
  const outline = workspace.getByRole("navigation", { name: "На этой странице", exact: true });
  await expect(outline).toBeVisible();
  await expect(outline.getByRole("link")).toHaveText([...labels]);
  await expect(outline.locator("[aria-current]")).toHaveCount(0);
  await expect.poll(() => workspace.evaluate((root) => {
    const tabs = root.querySelector('[role="tablist"]');
    const links = root.querySelector(".docs-component-outline");
    const panel = Array.from(root.querySelectorAll<HTMLElement>('[role="tabpanel"]'))
      .find((element) => element.getClientRects().length > 0);
    return !!tabs && !!links && !!panel && tabs.nextElementSibling === links &&
      Boolean(links.compareDocumentPosition(panel) & Node.DOCUMENT_POSITION_FOLLOWING);
  }), "Section links follow the tabs and precede the visible panel").toBe(true);
  await expect.poll(() => outline.getByRole("link").evaluateAll((links: HTMLAnchorElement[]) =>
    links.every((link) => {
      const heading = document.getElementById(link.hash.slice(1));
      return heading?.tagName === "H2" && heading.getClientRects().length > 0 &&
        heading.textContent?.trim() === link.textContent?.trim() &&
        getComputedStyle(link).backgroundColor === "rgba(0, 0, 0, 0)";
    })
  ), "Every plain anchor targets an actual heading in the selected tab").toBe(true);
}

async function buttonFillRatio(button: Locator): Promise<number> {
  return button.evaluate((element) => {
    if (!element.parentElement) throw new Error("Live button must have a layout container");
    return element.getBoundingClientRect().width / element.parentElement.getBoundingClientRect().width;
  });
}

function buttonWorkspace(page: Page): Locator {
  return page.getByTestId("docs-page").locator('[data-docs-component="WlButton"]');
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  pageErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
});

test.afterEach(async ({ page }) => {
  expect(pageErrors.get(page), "Home and documentation must load without runtime errors").toEqual([]);
});

test("home opens WlButton documentation and controls update the live button, consumer code and API", async ({ page, baseURL }, testInfo) => {
  await page.goto(pageUrl(baseURL), { waitUntil: "domcontentloaded" });
  const home = page.getByTestId("home-page");
  await expect(home.getByRole("heading", { level: 1 })).toHaveText("Gavia UI");
  await expect(home.getByTestId("home-install")).toContainText("pnpm add gavia-ui@");
  await expectRoute(page, baseURL, null);
  // Reveal below-fold decoration before checking the complete-page capture.
  for (const image of await home.locator('img[loading="lazy"]').all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((element: HTMLImageElement) =>
      element.complete && element.naturalWidth > 0
    )).toBe(true);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect.poll(() => home.locator("img").evaluateAll((images: HTMLImageElement[]) =>
    images.every((image) => image.complete && image.naturalWidth > 0)
  )).toBe(true);
  await page.evaluate(async () => { await document.fonts.ready; });
  const homeScreenshot = await page.screenshot({ fullPage: true });
  await home.getByRole("link", { name: "Читать документацию", exact: true }).click();
  const docs = page.getByTestId("docs-page");
  await expect(docs).toBeVisible();
  await openDocumentationMenu(page);
  const sidebar = docs.getByRole("complementary", { name: "Навигация документации", exact: true });
  const catalog = sidebar.getByRole("navigation", { name: "Каталог компонентов", exact: true, includeHidden: true });
  await expect(sidebar.getByRole("heading", { name: "Начало работы", exact: true })).toBeVisible();
  await expect(sidebar.getByRole("button", { name: "Введение", exact: true })).toHaveCount(0);
  const overviewNavigation = sidebar.getByRole("navigation", { name: "Разделы начала работы", exact: true, includeHidden: true });
  await expect(overviewNavigation.getByRole("link", { includeHidden: true })).toHaveText(documentationOverviewHeadings.map((heading) => heading.title));
  const majorHeadings = sidebar.locator(".docs-sidebar-heading");
  await expect(majorHeadings).toHaveText(["Начало работы", "Основы", "Оформление", "Компоненты"]);
  await expect(majorHeadings.locator("svg[aria-hidden='true']")).toHaveCount(4);
  await expect.poll(() => majorHeadings.locator("svg").evaluateAll((icons) =>
    icons.map((icon) => icon.getAttribute("data-icon"))
  )).toEqual(["book", "grid", "image", "box"]);
  await expect.poll(() => catalog.getByRole("button").first().evaluate((button) => {
    const style = getComputedStyle(button);
    return Number.parseFloat(style.minHeight) === (matchMedia("(pointer: coarse)").matches ? 36 : 30) &&
      Number.parseFloat(style.paddingTop) === 6 && Number.parseFloat(style.paddingBottom) === 6;
  }), "Only component rows use the compact 30px/36px touch target").toBe(true);
  await expect(sidebar.locator("#docs-component-search")).toHaveCount(0);
  await expect(sidebar.getByText(/Найдено:/)).toHaveCount(0);
  await expect(catalog.getByRole("button")).toHaveCount(53);
  await expect(catalog.getByRole("heading", { level: 3 })).toHaveText([
    "Действия", "Ввод данных", "Данные", "Контейнеры", "Составные элементы", "Навигация", "Обратная связь", "Дополнительно"
  ]);
  await catalog.getByRole("button", { name: "WlButton", exact: true }).click();
  await expect(catalog.getByRole("navigation")).toHaveCount(0);
  await expect(sidebar.getByRole("navigation", { name: "На этой странице", exact: true })).toHaveCount(0);
  await expect(overviewNavigation.getByRole("link", { includeHidden: true })).toHaveCount(6);
  await expect(overviewNavigation.locator("[aria-current]")).toHaveCount(0);
  await expect(catalog.getByRole("button", { name: "WlButton", exact: true, includeHidden: true })).toHaveAttribute("aria-current", "page");
  await expect.poll(() => catalog.getByRole("heading", { name: "Ввод данных", exact: true, includeHidden: true }).evaluate((heading) => {
    const link = heading.parentElement?.querySelector("button");
    if (!link) return false;
    const headingStyle = getComputedStyle(heading);
    return Number.parseFloat(headingStyle.fontSize) > Number.parseFloat(getComputedStyle(link).fontSize) &&
      headingStyle.color === getComputedStyle(heading.closest(".docs-page")!).color;
  }), "Category headings are larger and use the page text color").toBe(true);
  const workspace = buttonWorkspace(page);
  await expect(workspace).toBeVisible();
  await expect(workspace.getByRole("tablist", { name: "Разделы WlButton", exact: true })).toHaveCSS("border-bottom-width", "0px");
  await expectComponentOutline(workspace, buttonExampleLinks);
  const rulesButton = docs.getByRole("button", { name: "Правила дизайн-системы", exact: true });
  await expect(rulesButton).toHaveAttribute("data-variant", "secondary");
  await expect.poll(() => rulesButton.evaluate((button) => {
    // Compare resolved colors; a CSS custom property may retain a hex value.
    const surface = button.closest(".docs-page")?.querySelector(".docs-controls");
    return !!surface && getComputedStyle(button).backgroundColor ===
      getComputedStyle(surface).backgroundColor;
  }), "Design-system rules are a visible muted secondary action").toBe(true);
  await expectRoute(page, baseURL, "docs", "WlButton");
  const preview = page.getByTestId("docs-button-preview");
  const button = preview.getByRole("button", { name: "Добавить", exact: true });
  const source = page.getByTestId("docs-button-source");
  await expect(button).toHaveAttribute("data-variant", "secondary");
  await expect(button).toHaveAttribute("data-size", "md");
  const block = workspace.getByRole("checkbox", { name: "block", exact: true });
  await expect(block).not.toBeChecked();
  await expect.poll(() => buttonFillRatio(button), "block=false preserves intrinsic button width").toBeLessThan(0.9);
  await block.check();
  await expect.poll(() => buttonFillRatio(button), "block=true fills its available container").toBeCloseTo(1, 2);
  await expect(source.locator("pre code")).toContainText('"block":true');
  await block.uncheck();
  await expect.poll(() => buttonFillRatio(button)).toBeLessThan(0.9);
  await expect(source.locator("pre code")).toContainText('"block":false');
  await chooseDropdownOption(page, workspace.getByRole("combobox", { name: "variant", exact: true }), "primary");
  await chooseDropdownOption(page, workspace.getByRole("combobox", { name: "size", exact: true }), "lg");
  await chooseDropdownOption(page, workspace.getByRole("combobox", { name: "density", exact: true }), "compact");
  await expect(button).toHaveAttribute("data-variant", "primary");
  await expect(button).toHaveAttribute("data-size", "lg");
  await expect(button).toHaveAttribute("data-density", "compact");
  await button.click();
  await expect(preview.getByRole("status")).toHaveText("Действий: 1");
  await workspace.getByRole("checkbox", { name: "disabled", exact: true }).check();
  await expect(button).toBeDisabled();
  await expect(source.locator("pre code")).toContainText('"variant":"primary"');
  await expect(source.locator("pre code")).toContainText('"size":"lg"');
  await expect(source.locator("pre code")).toContainText('"density":"compact"');
  await expect(source.locator("pre code")).toContainText('"disabled":true');
  await workspace.getByRole("checkbox", { name: "disabled", exact: true }).uncheck();
  await expect(button).toBeEnabled();
  await workspace.getByRole("checkbox", { name: "loading", exact: true }).check();
  await expect(button).toBeDisabled();
  await expect(button).toHaveAttribute("aria-busy", "true");
  await expect(source.locator("pre code")).toContainText('"loading":true');
  await workspace.getByRole("checkbox", { name: "loading", exact: true }).uncheck();
  await expect(button).toBeEnabled();

  const consumerCode = await source.locator("pre code").textContent();
  expect(consumerCode).not.toBeNull();
  expect(consumerCode!.length).toBeGreaterThan(0);
  expect(consumerCode).toContain('from "gavia-ui"');
  expect(consumerCode).not.toContain("packages/ui-kit");
  // Capture the exact clipboard boundary, as in the existing recipe tests.
  // This checks copy wiring independently of operating-system permissions.
  await page.evaluate(() => Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: async (value: string) => { document.documentElement.dataset.docsCopied = value; } }
  }));
  await copyCodePanel(source);
  await expect(source.getByRole("status")).toHaveText("Код скопирован.");
  await expect(page.locator("html")).toHaveAttribute("data-docs-copied", consumerCode!);

  const apiTab = workspace.getByRole("tab", { name: "API", exact: true });
  await apiTab.click();
  await expect(apiTab).toHaveAttribute("aria-selected", "true");
  await expectComponentOutline(workspace, ["Props", "События", "Слоты", "Pass-through: pt"]);
  const props = workspace.getByRole("region", { name: "Props WlButton", exact: true });
  await expect(props).toBeVisible();
  for (const name of ["variant", "size", "density", "disabled", "loading", "block", "type", "pt"]) {
    await expect(props.getByRole("rowheader", { name, exact: true }), name + " public prop").toHaveCount(1);
  }
  await apiTab.focus();
  await apiTab.press("ArrowRight");
  const accessibilityTab = workspace.getByRole("tab", { name: "Доступность", exact: true });
  await expect(accessibilityTab).toBeFocused();
  await expect(accessibilityTab).toHaveAttribute("aria-selected", "true");
  await expectComponentOutline(workspace, ["Клавиатура и состояния"]);
  await expect(workspace.getByRole("heading", { name: "Клавиатура и состояния", exact: true })).toBeVisible();
  await accessibilityTab.press("Home");
  const examplesTab = workspace.getByRole("tab", { name: "Примеры", exact: true });
  await expect(examplesTab).toBeFocused();
  await expect(examplesTab).toHaveAttribute("aria-selected", "true");
  await expectComponentOutline(workspace, buttonExampleLinks);
  await expect(button).toHaveAttribute("data-variant", "primary");
  await expect(button).toHaveAttribute("data-size", "lg");
  await block.check();
  await expect.poll(() => buttonFillRatio(button)).toBeCloseTo(1, 2);
  await workspace.getByRole("button", { name: "Сбросить", exact: true }).click();
  await expect(block).not.toBeChecked();
  await expect(button).toBeEnabled();
  await expect(button).toHaveAttribute("data-variant", "secondary");
  await expect(button).toHaveAttribute("data-size", "md");
  await expect(button).toHaveAttribute("data-density", "default");
  await expect.poll(() => buttonFillRatio(button)).toBeLessThan(0.9);
  await expect(preview.getByRole("status")).toHaveText("Действий: 0");
  await expect(source.locator("pre code")).toContainText('"block":false');
  await expect(source.locator("pre code")).toContainText('"variant":"secondary"');
  await expect(source.locator("pre code")).toContainText('"size":"md"');
  await expectNoHorizontalOverflow(page, docs);
  const homeScreenshotPath = testInfo.outputPath("home-desktop.png");
  await writeFile(homeScreenshotPath, homeScreenshot);
  await testInfo.attach("home-desktop", { path: homeScreenshotPath, contentType: "image/png" });
  await page.screenshot({ path: testInfo.outputPath("docs-button-desktop.png"), fullPage: true });
});

test("direct WlButton documentation survives reload, Back and Forward beneath the current base path", async ({ page, baseURL }) => {
  await page.goto(pageUrl(baseURL, "?view=docs&component=WlButton"), { waitUntil: "domcontentloaded" });
  await expect(buttonWorkspace(page)).toBeVisible();
  await expectRoute(page, baseURL, "docs", "WlButton");
  await page.reload();
  await expect(buttonWorkspace(page)).toBeVisible();
  await expectRoute(page, baseURL, "docs", "WlButton");
  await navigateMainView(page, "Главная");
  await expect(page.getByTestId("home-page")).toBeVisible();
  await expectRoute(page, baseURL, null);
  await page.goBack();
  await expect(buttonWorkspace(page)).toBeVisible();
  await expectRoute(page, baseURL, "docs", "WlButton");
  await page.goForward();
  await expect(page.getByTestId("home-page")).toBeVisible();
  await expectRoute(page, baseURL, null);
  await page.getByTestId("home-page").getByRole("link", { name: "Документация WlButton", exact: true }).click();
  await expect(buttonWorkspace(page)).toBeVisible();
  await expectRoute(page, baseURL, "docs", "WlButton");

  const installationUrl = new URL(pageUrl(baseURL, "?view=docs"));
  installationUrl.hash = "docs-install";
  await page.goto(installationUrl.href, { waitUntil: "domcontentloaded" });
  const installationHeading = page.getByTestId("docs-page").locator("h2#docs-install");
  await expect(installationHeading).toBeInViewport();
  await expectRoute(page, baseURL, "docs");
  expect(new URL(page.url()).hash).toBe("#docs-install");
  await page.reload();
  await expect(installationHeading).toBeInViewport();
  await expectRoute(page, baseURL, "docs");
  expect(new URL(page.url()).hash).toBe("#docs-install");

  const quickstartUrl = new URL(pageUrl(baseURL));
  quickstartUrl.hash = "home-quickstart";
  await page.goto(quickstartUrl.href, { waitUntil: "domcontentloaded" });
  const quickstartHeading = page.getByTestId("home-page").locator("#home-quickstart").getByRole("heading", { level: 2 });
  await expect(quickstartHeading).toBeInViewport();
  await expectRoute(page, baseURL, null);
  expect(new URL(page.url()).hash).toBe("#home-quickstart");
  await page.reload();
  await expect(quickstartHeading).toBeInViewport();
  await expectRoute(page, baseURL, null);
  expect(new URL(page.url()).hash).toBe("#home-quickstart");
});

test("getting-started links persist across Docs pages and preserve native links, SPA history and mobile closure", async ({ page, baseURL }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(pageUrl(baseURL, "?view=docs&component=WlButton"), { waitUntil: "domcontentloaded" });
  const docs = page.getByTestId("docs-page");
  const overview = docs.getByRole("navigation", { name: "Разделы начала работы", exact: true, includeHidden: true });
  await expect(buttonWorkspace(page)).toBeVisible();
  await page.evaluate(() => { document.documentElement.dataset.overviewSpa = "retained"; });
  const basePath = new URL(baseURL ?? defaultStand).pathname;
  const destinations = [
    { component: "WlButton", section: null, anchor: "docs-components" },
    { component: null, section: "layout", anchor: "docs-foundations", group: "Основы", label: "Layout и сетка" },
    { component: null, section: "icons", anchor: "docs-icons", group: "Оформление", label: "Иконки" }
  ] as const;

  for (const [index, destination] of destinations.entries()) {
    if (index === 2) await page.setViewportSize({ width: 320, height: 740 });
    if (destination.section) {
      await openDocumentationMenu(page);
      await docs.getByRole("navigation", { name: destination.group, exact: true })
        .getByRole("button", { name: destination.label, exact: true }).click();
    }
    await expectRoute(page, baseURL, "docs", destination.component, destination.section);
    await openDocumentationMenu(page);
    await expect(overview).toBeVisible();
    await expect(overview.getByRole("link", { includeHidden: true })).toHaveText(documentationOverviewHeadings.map((heading) => heading.title));
    await expect(overview.locator("[aria-current]")).toHaveCount(0);
    expect(await overview.getByRole("link").evaluateAll((links: HTMLAnchorElement[]) => links.map((link) => {
      const url = new URL(link.href);
      return { path: url.pathname, view: url.searchParams.get("view"), component: url.searchParams.get("component"), section: url.searchParams.get("section"), hash: url.hash };
    }))).toEqual(documentationOverviewHeadings.map((heading) => ({
      path: basePath, view: "docs", component: null, section: null, hash: "#" + heading.id
    })));

    if (index === 0) {
      const original = page.url();
      const [newTab] = await Promise.all([
        page.context().waitForEvent("page"),
        overview.getByRole("link", { name: "Установка", exact: true }).click({ modifiers: ["ControlOrMeta"] })
      ]);
      try {
        // A native background tab starts the lazy Vue application asynchronously.
        await newTab.getByTestId("docs-page").waitFor({ state: "visible" });
        await expect(newTab.getByTestId("docs-page").locator("#docs-install")).toBeInViewport();
        await expectRoute(newTab, baseURL, "docs");
        expect(new URL(newTab.url()).hash).toBe("#docs-install");
        expect(page.url()).toBe(original);
        await expect(buttonWorkspace(page)).toBeVisible();
      } finally { await newTab.close(); }
    }

    const sourceAnchor = destination.section === "layout" ? "docs-layout-nested-grid" : undefined;
    if (sourceAnchor) {
      await docs.getByRole("navigation", { name: "На этой странице", exact: true })
        .getByRole("link", { name: "Вложенная сетка", exact: true }).click();
      await expect(docs.locator("#" + sourceAnchor)).toBeInViewport();
    }
    const sourceUrl = page.url();
    const historyLength = await page.evaluate(() => history.length);
    const heading = documentationOverviewHeadings.find((item) => item.id === destination.anchor)!;
    await overview.getByRole("link", { name: heading.title, exact: true }).click();
    await expectRoute(page, baseURL, "docs");
    expect(new URL(page.url()).hash).toBe("#" + destination.anchor);
    await expect(docs.locator("#" + destination.anchor)).toBeInViewport();
    await expect(overview.getByRole("link", { name: heading.title, exact: true, includeHidden: true })).toHaveAttribute("aria-current", "location");
    await expect(page.locator("html")).toHaveAttribute("data-overview-spa", "retained");
    expect(await page.evaluate(() => history.length)).toBe(historyLength + 1);
    if (index === 2) {
      await expect(docs.locator(".docs-menu")).toHaveJSProperty("open", false);
      await expectNoHorizontalOverflow(page, docs);
    }
    await page.goBack();
    await expect.poll(() => page.url()).toBe(sourceUrl);
    await expectRoute(page, baseURL, "docs", destination.component, destination.section);
    if (sourceAnchor) await expect(docs.locator("#" + sourceAnchor)).toBeInViewport();
    await expect(overview.locator("[aria-current]")).toHaveCount(0);
    await page.goForward();
    await expectRoute(page, baseURL, "docs");
    await expect(docs.locator("#" + destination.anchor)).toBeInViewport();
    await expect(page.locator("html")).toHaveAttribute("data-overview-spa", "retained");
  }

  await page.setViewportSize({ width: 1280, height: 800 });
  await overview.getByRole("link", { name: "Миграция", exact: true }).click();
  await expect(docs.locator("#docs-migration")).toBeInViewport();
  const currentHistoryLength = await page.evaluate(() => history.length);
  await overview.getByRole("link", { name: "Миграция", exact: true }).click();
  expect(await page.evaluate(() => history.length)).toBe(currentHistoryLength);
  await overview.getByRole("link", { name: "Установка", exact: true }).click();
  await expect(docs.locator("#docs-install")).toBeInViewport();
  await page.goBack();
  await expect(docs.locator("#docs-migration")).toBeInViewport();
  await page.goForward();
  await expect(docs.locator("#docs-install")).toBeInViewport();
  await expectRoute(page, baseURL, "docs");
});

test("history restores Docs anchors after an interrupted smooth overview transition", async ({ page, baseURL }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const initial = new URL(pageUrl(baseURL, "?view=docs&section=responsive"));
  initial.hash = "docs-responsive-breakpoints";
  await page.goto(initial.href, { waitUntil: "domcontentloaded" });
  const docs = page.getByTestId("docs-page");
  const source = docs.locator("#docs-responsive-breakpoints");
  await expect(source).toBeInViewport();
  await docs.getByRole("navigation", { name: "Разделы начала работы", exact: true })
    .getByRole("link", { name: "Миграция", exact: true }).click();
  // Traverse before the long smooth scroll to the overview's final section completes.
  await expectRoute(page, baseURL, "docs");
  await page.goBack();
  await expectRoute(page, baseURL, "docs", null, "responsive");
  await expect(source).toBeInViewport();
  await page.goForward();
  await expectRoute(page, baseURL, "docs");
  expect(new URL(page.url()).hash).toBe("#docs-migration");
  await expect.poll(() => page.evaluate(async () => {
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    const target = document.getElementById("docs-migration");
    const header = document.querySelector(".pg-top");
    if (!target || !header) return false;
    const bounds = target.getBoundingClientRect();
    return bounds.top >= header.getBoundingClientRect().bottom - 1 && bounds.bottom <= innerHeight;
  }), "History anchor stays visible below the sticky header after native restoration").toBe(true);
});

test("home and interactive WlButton documentation remain usable at 320px", async ({ page, baseURL }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto(pageUrl(baseURL), { waitUntil: "domcontentloaded" });
  const home = page.getByTestId("home-page");
  await expect(home.getByRole("heading", { level: 1 })).toHaveText("Gavia UI");
  await expectNoHorizontalOverflow(page, home);
  await home.getByRole("link", { name: "Документация WlButton", exact: true }).click();
  const docs = page.getByTestId("docs-page");
  const workspace = buttonWorkspace(page);
  await expect(workspace).toBeVisible();
  await expectRoute(page, baseURL, "docs", "WlButton");
  await expectNoHorizontalOverflow(page, docs);
  for (const name of ["variant", "size", "density", "type"]) {
    const control = workspace.getByTestId("docs-control-" + name);
    const bounds = await control.boundingBox();
    expect(bounds, name + " control has geometry").not.toBeNull();
    expect(bounds!.x, name + " left edge").toBeGreaterThanOrEqual(-1);
    expect(bounds!.x + bounds!.width, name + " right edge").toBeLessThanOrEqual(321);
  }
  await chooseDropdownOption(page, workspace.getByRole("combobox", { name: "variant", exact: true }), "ghost");
  await chooseDropdownOption(page, workspace.getByRole("combobox", { name: "size", exact: true }), "sm");
  const preview = page.getByTestId("docs-button-preview");
  const button = preview.getByRole("button", { name: "Добавить", exact: true });
  await expect(button).toHaveAttribute("data-variant", "ghost");
  await expect(button).toHaveAttribute("data-size", "sm");
  await button.click();
  await expect(preview.getByRole("status")).toHaveText("Действий: 1");
  await expectNoHorizontalOverflow(page, preview);
  await expect(page.getByTestId("docs-button-source").locator("pre code")).toContainText('"variant":"ghost"');
  await workspace.getByRole("tab", { name: "API", exact: true }).click();
  await expect(workspace.getByRole("region", { name: "Props WlButton", exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page, docs);
  await workspace.getByRole("tab", { name: "Примеры", exact: true }).click();
  await expect(page.getByTestId("docs-button-source").locator("pre code")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("docs-button-mobile-320.png"), fullPage: true });
});


test("foundations navigation preserves live examples and highlighted copy across themes and at 320px", async ({ page, baseURL }, testInfo) => {
  await page.goto(pageUrl(baseURL, "?view=docs"), { waitUntil: "domcontentloaded" });
  const docs = page.getByTestId("docs-page");
  const navigation = docs.getByRole("navigation", { name: "Основы", exact: true });
  const foundation = docs.getByTestId("docs-foundation-page");
  const sections = [
    { name: "typography", label: "Типографика", examples: ["typography-scale", "text-hierarchy"] },
    { name: "layout", label: "Layout и сетка", examples: ["containers", "equal-columns", "column-proportions", "responsive-grid", "gap-alignment", "nested-grid", "page-composition", "spacing", "css-helpers", "stacking-layers"] },
    { name: "content", label: "Content и тексты", examples: ["content-writing", "content-states"] }
  ];
  await page.evaluate(() => Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: async (value: string) => { document.documentElement.dataset.docsCopied = value; } }
  }));
  for (const section of sections) {
    await openDocumentationMenu(page);
    await navigation.getByRole("button", { name: section.label, exact: true }).click();
    await expect(foundation).toHaveAttribute("data-docs-section", section.name);
    await expect(docs.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(docs.getByRole("heading", { level: 1 })).toHaveText(section.label);
    await expectRoute(page, baseURL, "docs", null, section.name);
    await expect(foundation.locator("[data-docs-example]")).toHaveCount(section.examples.length);
    await openDocumentationMenu(page);
    const toc = docs.getByRole("navigation", { name: "На этой странице", exact: true });
    await expect(toc.getByRole("link")).toHaveCount(section.examples.length + (section.name === "layout" ? 4 : 2));
    await expect.poll(() => toc.getByRole("link").evaluateAll((links: HTMLAnchorElement[]) => links.every((link) => {
      const heading = document.getElementById(link.hash.slice(1));
      return heading?.tagName === "H2" && heading.textContent?.trim() === link.textContent?.trim();
    })), "TOC labels and anchors match actual H2 headings").toBe(true);
    for (const name of section.examples) {
      const example = foundation.locator('[data-docs-example="' + name + '"]');
      await expect(example.getByTestId("docs-foundation-preview").locator(":scope > :first-child")).toBeVisible();
      const panel = example.getByTestId("docs-foundation-source");
      const code = panel.locator("pre code");
      await expect(code).toBeVisible();
      const consumerCode = await code.textContent();
      expect(consumerCode, name + " source is available").not.toBeNull();
      if (name === "text-hierarchy") {
        expect(consumerCode).toContain("wl-text-heading");
        expect(consumerCode).toMatch(/<h[34]\b/);
      } else if (["typography-scale", "responsive-grid", "gap-alignment", "page-composition", "spacing", "stacking-layers", "content-writing", "content-states"].includes(name)) {
        expect(consumerCode).toContain('from "gavia-ui"');
      } else {
        expect(consumerCode).toContain("<template>");
        expect(consumerCode).toContain("wl-");
      }
      expect(consumerCode).not.toContain("packages/ui-kit");
      expect((await code.locator(".ds-code-token").allTextContents()).join(""), name + " highlighted source is unchanged").toBe(consumerCode);
      await copyCodePanel(panel);
      await expect(panel.getByRole("status")).toHaveText("Код скопирован.");
      await expect(page.locator("html")).toHaveAttribute("data-docs-copied", consumerCode!);
    }
    if (section.name === "layout") {
      await toc.getByRole("link", { name: "Слои и z-index", exact: true }).click();
      await expect(foundation.locator("#docs-layout-layers")).toBeInViewport();
      expect(new URL(page.url()).hash).toBe("#docs-layout-layers");
      await expect(foundation.getByRole("region", { name: "Уровни z-index Gavia UI", exact: true }).getByRole("row")).toHaveCount(10);
      const grid = foundation.locator('[data-docs-example="responsive-grid"]').getByTestId("docs-foundation-preview");
      await grid.getByRole("button", { name: "Выбрать Проектирование", exact: true }).click();
      await expect(grid.getByRole("status")).toHaveText("Выбрано: Проектирование");
      await grid.getByRole("button", { name: "Сбросить выбор", exact: true }).click();
      await expect(grid.getByRole("status")).toHaveText("Выберите карточку. Действия переносятся на следующую строку.");
    }
  }

  const content = foundation.locator('[data-docs-example="content-states"]');
  const preview = content.getByTestId("docs-foundation-preview");
  const states = preview.getByRole("group", { name: "Состояние примера контента", exact: true });
  await states.getByRole("button", { name: "Загрузка", exact: true }).click();
  await expect(states.getByRole("button", { name: "Загрузка", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(preview.getByRole("status")).toHaveAttribute("aria-busy", "true");
  await expect(preview.getByRole("status")).toContainText("Загружаем материалы…");
  await states.getByRole("button", { name: "Пусто", exact: true }).click();
  await expect(preview.getByText("Материалов пока нет", { exact: true })).toBeVisible();
  await preview.getByRole("button", { name: "Добавить пример", exact: true }).click();
  await expect(preview.getByRole("status")).toHaveText("Доступно материалов: 3");
  await states.getByRole("button", { name: "Ошибка", exact: true }).click();
  await expect(preview.getByRole("alert")).toContainText("Не удалось загрузить материалы");
  await preview.getByRole("button", { name: "Повторить", exact: true }).click();
  await expect(states.getByRole("button", { name: "Готово", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(preview.getByRole("status")).toHaveText("Доступно материалов: 3");

  const code = content.getByTestId("docs-foundation-source").locator("pre code");
  const sourceText = await code.textContent();
  for (const label of wlDesignThemes.map((theme) => theme.label)) {
    await chooseShowcaseTheme(page, label);
    await expect(code).toHaveText(sourceText!);
    const colors = await code.locator(".ds-code-token").evaluateAll((tokens) =>
      [...new Set(tokens.filter((token) => token.textContent?.trim()).map((token) => getComputedStyle(token).color))]
    );
    expect(colors.length, label + " syntax uses more than one computed color").toBeGreaterThan(1);
    const screenshotPath = testInfo.outputPath("foundation-syntax-" + label.toLowerCase() + ".png");
    await content.getByTestId("docs-foundation-source").screenshot({ path: screenshotPath });
    await testInfo.attach("foundation-syntax-" + label.toLowerCase(), { path: screenshotPath, contentType: "image/png" });
  }

  await page.setViewportSize({ width: 320, height: 740 });
  for (const section of sections) {
    await openDocumentationMenu(page);
    await navigation.getByRole("button", { name: section.label, exact: true }).click();
    await expect(foundation).toHaveAttribute("data-docs-section", section.name);
    await expectRoute(page, baseURL, "docs", null, section.name);
    await expectNoHorizontalOverflow(page, docs);
    await expectNoHorizontalOverflow(page, foundation);
    for (const name of section.examples) {
      await expectNoHorizontalOverflow(page, foundation.locator('[data-docs-example="' + name + '"]').getByTestId("docs-foundation-preview"));
    }
  }
  await openDocumentationMenu(page);
  await docs.getByRole("navigation", { name: "На этой странице", exact: true }).getByRole("link", { name: "Готово, загрузка, пусто и ошибка", exact: true }).click();
  await expect(foundation.locator("#docs-content-states")).toBeInViewport();
  expect(new URL(page.url()).hash).toBe("#docs-content-states");
  await page.reload();
  await expect(foundation.locator("#docs-content-states")).toBeInViewport();
  await expectRoute(page, baseURL, "docs", null, "content");
  await chooseShowcaseTheme(page, "White");
  await expectNoHorizontalOverflow(page, docs);
  await page.screenshot({ path: testInfo.outputPath("docs-foundations-mobile-320.png"), fullPage: true });
});

test("documentation scrollspy follows real Layout and icon scrolling without rewriting anchor history", async ({ page, baseURL }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(pageUrl(baseURL, "?view=docs"), { waitUntil: "domcontentloaded" });
  await page.addStyleTag({ content: "html { scroll-behavior: auto; }" });
  const docs = page.getByTestId("docs-page");
  const content = docs.locator(".docs-content");
  const routes = [
    { section: "layout", group: "Основы", label: "Layout и сетка", anchor: "docs-layout-containers", next: "docs-layout-equal-columns" },
    { section: "icons", group: "Оформление", label: "Иконки", anchor: "docs-icons-catalog", next: "docs-icons-accessibility" }
  ];

  for (const route of routes) {
    await openDocumentationMenu(page);
    await docs.getByRole("navigation", { name: route.group, exact: true }).getByRole("button", { name: route.label, exact: true }).click();
    await expectRoute(page, baseURL, "docs", null, route.section);
    await openDocumentationMenu(page);
    const toc = docs.getByRole("navigation", { name: "На этой странице", exact: true });
    const anchor = toc.locator('a[href="#' + route.anchor + '"]');
    await anchor.click();
    await expect(content.locator("#" + route.anchor)).toBeInViewport();
    await expect(anchor).toHaveAttribute("aria-current", "location");
    await expect(toc.locator('[aria-current="location"]')).toHaveCount(1);
    const anchoredUrl = page.url();
    expect(new URL(anchoredUrl).hash).toBe("#" + route.anchor);

    // Wheel over the page padding, outside the independently scrollable TOC/code.
    // The distance reaches the next real heading, regardless of the live example's height.
    const bounds = await content.boundingBox();
    const header = await page.locator(".pg-top").boundingBox();
    expect(bounds).not.toBeNull();
    expect(header).not.toBeNull();
    const headerBottom = header!.y + header!.height;
    await page.mouse.move(bounds!.x - 8, headerBottom + 120);
    const nextHeading = content.locator("#" + route.next);
    const scrollBefore = await page.evaluate(() => window.scrollY);
    // Firefox caps one large wheel event at roughly a viewport. Use normal wheel steps.
    for (let step = 0; step < 8; step++) {
      const nextTop = await nextHeading.evaluate((heading) => heading.getBoundingClientRect().top);
      const remaining = nextTop - headerBottom + 24;
      if (remaining <= 1) break;
      const distance = Math.min(400, remaining);
      const beforeStep = await page.evaluate(() => window.scrollY);
      await page.mouse.wheel(0, distance);
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThanOrEqual(Math.floor(beforeStep + distance) - 1);
    }
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(scrollBefore);
    const next = toc.locator('a[href="#' + route.next + '"]');
    await expect(next).toHaveAttribute("aria-current", "location");
    await expect(anchor).not.toHaveAttribute("aria-current", "location");
    await expect(toc.locator('[aria-current="location"]')).toHaveCount(1);
    expect(page.url(), "Scrollspy updates the current section, preserving the clicked anchor URL").toBe(anchoredUrl);
  }
});

test("generic documentation keeps controls beside live code, preserves tab state and stacks at 320px", async ({ page, baseURL }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(pageUrl(baseURL, "?view=docs&component=WlInput"), { waitUntil: "domcontentloaded" });
  const docs = page.getByTestId("docs-page");
  const workspace = docs.locator('[data-docs-component="WlInput"]');
  await expect(workspace).toBeVisible();
  await expectRoute(page, baseURL, "docs", "WlInput");
  const tabs = workspace.getByRole("tablist", { name: "Руководство WlInput", exact: true });
  await expect(tabs).toBeVisible();
  await expect(tabs).toHaveCSS("border-bottom-width", "0px");
  const explorer = workspace.getByTestId("ds-explorer");
  await expect(explorer).toHaveAttribute("data-component", "WlInput");
  const controls = explorer.locator(".ds-explorer-controls");
  const size = explorer.getByRole("combobox", { name: "Пример: size", exact: true });
  const density = explorer.getByRole("combobox", { name: "Пример: density", exact: true });
  const invalid = explorer.getByRole("checkbox", { name: "invalid", exact: true });
  const disabled = explorer.getByRole("checkbox", { name: "disabled", exact: true });
  const preview = explorer.getByTestId("ds-example-preview");
  const input = preview.getByRole("textbox", { name: "Название материала", exact: true });
  const inputRoot = preview.locator('[data-wl="input"]');
  const source = explorer.locator(".ds-source");
  await expect(input).toHaveValue("Материал команды");
  await expect(inputRoot).toHaveAttribute("data-size", "md");
  await expect(inputRoot).toHaveAttribute("data-density", "default");

  await expect.poll(async () => {
    const [settingsBounds, previewBounds, sourceBounds] = await Promise.all([
      controls.boundingBox(), preview.boundingBox(), source.boundingBox()
    ]);
    if (!settingsBounds || !previewBounds || !sourceBounds) return false;
    return settingsBounds.x + settingsBounds.width <= previewBounds.x + 1 &&
      Math.abs(previewBounds.x - sourceBounds.x) <= 1 &&
      sourceBounds.y >= previewBounds.y + previewBounds.height - 1;
  }, "Desktop controls occupy the left column; preview and code share the right column").toBe(true);

  const outline = docs.locator(".docs-component-outline");
  await expectComponentOutline(workspace, ["Живой пример", "Размеры, слоты и проверка"]);
  await expect(outline.getByRole("link").first()).toBeVisible();
  await outline.getByRole("link").first().click();
  await page.mouse.move(0, 0);
  await expect(outline.locator("[aria-current]")).toHaveCount(0);
  await expect.poll(() => outline.getByRole("link").evaluateAll((links) => links.every((link) =>
    getComputedStyle(link).backgroundColor === "rgba(0, 0, 0, 0)"
  )), "Component jump links retain no active background after following an anchor").toBe(true);

  await input.fill("Задача документации");
  await chooseDropdownOption(page, size, "lg");
  await chooseDropdownOption(page, density, "compact");
  await invalid.check();
  await disabled.check();
  await expect(input).toHaveValue("Задача документации");
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(input).toBeDisabled();
  await expect(inputRoot).toHaveAttribute("data-size", "lg");
  await expect(inputRoot).toHaveAttribute("data-density", "compact");
  const code = source.locator("pre code");
  if (!await code.isVisible()) await source.locator(".ds-source-frame summary").click();
  await expect(code).toBeVisible();
  for (const value of ['"size":"lg"', '"density":"compact"', '"invalid":true', '"disabled":true']) {
    await expect(code).toContainText(value);
  }
  await expect(code).toContainText('from "gavia-ui"');
  expect(await code.textContent()).not.toContain("packages/ui-kit");

  await tabs.getByRole("tab", { name: "API", exact: true }).click();
  await expect(workspace.getByRole("region", { name: "Props WlInput", exact: true })).toBeVisible();
  await expectComponentOutline(workspace, ["Props", "События", "Слоты", "Pass-through: pt"]);
  await expect(preview).toBeHidden();
  await expect(outline.locator("[aria-current]")).toHaveCount(0);
  await tabs.getByRole("tab", { name: "Доступность", exact: true }).click();
  await expect(workspace.getByRole("heading", { name: "Клавиатура и доступность", exact: true })).toBeVisible();
  await expectComponentOutline(workspace, ["Клавиатура и доступность"]);
  await tabs.getByRole("tab", { name: "Примеры", exact: true }).click();
  await expect(preview).toBeVisible();
  await expectComponentOutline(workspace, ["Живой пример", "Размеры, слоты и проверка"]);
  await expect(size).toContainText("lg");
  await expect(density).toContainText("compact");
  await expect(invalid).toBeChecked();
  await expect(disabled).toBeChecked();
  await expect(input).toHaveValue("Задача документации");
  await expect(input).toBeDisabled();
  await expect(code).toContainText('"size":"lg"');
  await expect(code).toContainText('"invalid":true');

  await explorer.getByRole("button", { name: "Сбросить пример", exact: true }).click();
  await expect(input).toHaveValue("Материал команды");
  await expect(input).toBeEnabled();
  await expect(input).not.toHaveAttribute("aria-invalid", "true");
  await expect(inputRoot).toHaveAttribute("data-size", "md");
  await expect(inputRoot).toHaveAttribute("data-density", "default");
  await expect(size).toContainText("md");
  await expect(density).toContainText("default");
  await expect(invalid).not.toBeChecked();
  await expect(disabled).not.toBeChecked();
  await expect(code).not.toContainText('"size":"lg"');
  await expect(code).not.toContainText('"invalid":true');
  const extra = workspace.locator('[data-docs-component-extra="WlInput"]');
  await expect(extra.getByTestId("docs-component-extra-preview").getByRole("textbox", { name: "Название, sm", exact: true })).toHaveValue("План команды");
  await expect(extra.getByTestId("docs-component-extra-source").locator("pre code")).toContainText('from "gavia-ui"');

  await page.setViewportSize({ width: 320, height: 740 });
  await expect.poll(async () => {
    const [settingsBounds, previewBounds, sourceBounds] = await Promise.all([
      controls.boundingBox(), preview.boundingBox(), source.boundingBox()
    ]);
    if (!settingsBounds || !previewBounds || !sourceBounds) return false;
    return settingsBounds.y + settingsBounds.height <= previewBounds.y + 1 &&
      sourceBounds.y >= previewBounds.y + previewBounds.height - 1;
  }, "Narrow Docs stack controls before the live example and code").toBe(true);
  for (const surface of [docs, workspace, explorer, controls, preview, source, extra]) {
    await expectNoHorizontalOverflow(page, surface);
  }
  await chooseDropdownOption(page, size, "sm");
  await expect(inputRoot).toHaveAttribute("data-size", "sm");
  await expect(code).toContainText('"size":"sm"');
  await input.fill("Мобильный пример");
  await tabs.getByRole("tab", { name: "API", exact: true }).click();
  await expect(workspace.getByRole("region", { name: "Props WlInput", exact: true })).toBeVisible();
  await expectComponentOutline(workspace, ["Props", "События", "Слоты", "Pass-through: pt"]);
  await tabs.getByRole("tab", { name: "Примеры", exact: true }).click();
  await expect(input).toHaveValue("Мобильный пример");
  await expect(inputRoot).toHaveAttribute("data-size", "sm");
  await expect(tabs).toHaveCSS("border-bottom-width", "0px");
  await expect(outline.locator("[aria-current]")).toHaveCount(0);
  await expectNoHorizontalOverflow(page, docs);
});
