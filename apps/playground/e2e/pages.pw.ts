import { resolveWlToken, wlDesignThemes } from "../../../packages/ui-kit/src/design-system";
import { expect, test, type Page } from "@playwright/test";
import { chooseDropdownOption, copyCodePanel, chooseShowcaseTheme, navigateDocumentationComponent, navigateMainView, openDocumentationMenu } from "./select-helpers";
import { readFileSync } from "node:fs";
import { expectGaviaFontDownload } from "./font-download-helpers";
import { fileURLToPath, URL as NodeURL } from "node:url";

const packageMetadata = JSON.parse(readFileSync(fileURLToPath(new NodeURL("../../../packages/ui-kit/package.json", import.meta.url)), "utf8")) as { name: string; version: string };
const packageUrl = "https://www.npmjs.com/package/gavia-ui";
const publishedVersion = "0.9.1";

const pagesPath = "/gavia-ui/";
const projectTitle = "Changelog";
const repositoryDocs = "https://github.com/whitewolf06/gavia-ui/blob/main/";

interface PageResources {
  failures: string[];
  scripts: Set<string>;
  styles: Set<string>;
}

const resources = new WeakMap<Page, PageResources>();

async function expectNoPageOverflow(page: Page): Promise<void> {
  await expect.poll(() => page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth
  )).toBeLessThanOrEqual(1);
}

function expectPagesLocation(page: Page, view?: string, component?: string): void {
  const url = new URL(page.url());
  expect(url.pathname).toBe(pagesPath);
  expect(url.searchParams.get("view")).toBe(view ?? null);
  expect(url.searchParams.get("component")).toBe(component ?? null);
}

test.beforeEach(async ({ page, baseURL }) => {
  const origin = new URL(baseURL!).origin;
  const observed: PageResources = { failures: [], scripts: new Set(), styles: new Set() };
  resources.set(page, observed);
  page.on("pageerror", (error) => observed.failures.push(error.message));
  page.on("response", (response) => {
    const url = new URL(response.url());
    if (url.origin !== origin) return;
    if (response.status() >= 400) observed.failures.push(`${response.status()} ${url.pathname}`);
    const type = response.request().resourceType();
    if (response.ok() && type === "script") observed.scripts.add(url.pathname);
    if (response.ok() && type === "stylesheet") observed.styles.add(url.pathname);
  });
  page.on("requestfailed", (request) => {
    if (new URL(request.url()).origin !== origin) return;
    const error = request.failure()?.errorText ?? "Request failed";
    // Browser cancellation during reload is not a failed asset response.
    if (!error.includes("ERR_ABORTED")) observed.failures.push(`${error} ${request.url()}`);
  });
});

test.afterEach(async ({ page }) => {
  expect(resources.get(page)!.failures, "Production assets and scripts must load without errors").toEqual([]);
});

test("Home metadata and the old project query survive refresh with production assets under the Pages prefix", async ({ page }) => {
  await page.goto(pagesPath);
  await expect(page.getByTestId("home-page").getByRole("heading", { level: 1 })).toHaveText("Gavia UI");
  expectPagesLocation(page);
  // Detect a named theme overridden by a later :root fallback stylesheet.
  await expect(page.locator("html")).toHaveAttribute("data-wl-theme", "gavia");
  await expect.poll(() => page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    return {
      accent: style.getPropertyValue("--wl-accent").trim(),
      background: style.getPropertyValue("--wl-bg").trim()
    };
  })).toEqual({ accent: resolveWlToken("--wl-accent", "gavia"), background: resolveWlToken("--wl-bg", "gavia") });
  const heroArt = page.locator(".home-hero-art");
  await expect(heroArt).toHaveAttribute("alt", "");
  await expect.poll(() => heroArt.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  await expect(heroArt).toHaveAttribute("src", /^\/gavia-ui\/assets\/gavia-lake-hero/);
  await expect(page.getByTestId("project-version")).toHaveText(packageMetadata.version);
  await expect(page.locator(".pg-kit-version")).toHaveText(`v${packageMetadata.version}`);
  const packageStatus = page.getByTestId("project-npm-status");
  await expect(packageStatus).toContainText("опубликован в публичном npm");
  await expect(packageStatus.getByRole("link", { name: `${packageMetadata.name}@${publishedVersion}`, exact: true })).toHaveAttribute("href", packageUrl);
  await expect(packageStatus.locator("code")).toHaveText(`pnpm add ${packageMetadata.name}@${publishedVersion}`);

  const logo = page.locator(".pg-logo");
  await expect(logo).toBeVisible();
  await expect(logo).toHaveClass(/pg-logo-mask/);
  await expect(logo).toHaveCSS("mask-image", /\/gavia-ui\/assets\/.*\.png/);
  const imagePath = await logo.evaluate((element) => {
    const match = /url\(["']?(.*?)["']?\)/.exec(getComputedStyle(element).maskImage);
    return match ? new URL(match[1]!, window.location.href).pathname : "";
  });
  expect(imagePath).toMatch(/^\/gavia-ui\/assets\//);

  const observed = resources.get(page)!;
  expect(observed.scripts.size).toBeGreaterThan(0);
  expect(observed.styles.size).toBeGreaterThan(0);
  for (const path of [...observed.scripts, ...observed.styles]) {
    expect(path).toMatch(/^\/gavia-ui\/assets\//);
  }

  // Keep the historical query as a tested alias; new navigation uses changelog.
  await page.goto(`${pagesPath}?view=project`);
  await expect(page.getByRole("heading", { name: projectTitle, exact: true })).toBeVisible();
  await expect(page.locator('.pg-views [aria-current="page"]')).toHaveText("Changelog");
  expectPagesLocation(page, "project");
  await page.reload();
  await expect(page.getByRole("heading", { name: projectTitle, exact: true })).toBeVisible();
  expectPagesLocation(page, "project");
  await expectNoPageOverflow(page);
  const releaseLink = page.getByRole("navigation", { name: "Версии в истории изменений" }).locator('a[href^="#project-release-"]').first();
  const releaseHash = await releaseLink.getAttribute("href");
  expect(releaseHash).toMatch(/^#project-release-/);
  await releaseLink.click();
  await navigateMainView(page, "Дизайн-система");
  await expect(page.getByRole("heading", { name: "Единый язык интерфейсов", exact: true })).toBeVisible();
  await page.goBack();
  await expect(page.locator(`${releaseHash}-title`)).toBeInViewport();
  expectPagesLocation(page, "project");
});

test("navigation, Back and Forward preserve the repository subpath", async ({ page }) => {
  await page.goto(`${pagesPath}?view=changelog`);
  await expect(page.getByRole("heading", { name: projectTitle, exact: true })).toBeVisible();

  await navigateMainView(page, "Дизайн-система");
  await expect(page.getByRole("heading", { name: "Единый язык интерфейсов", exact: true })).toBeVisible();
  expectPagesLocation(page, "system");

  await navigateMainView(page, "Документация");
  await expect(page.getByRole("heading", { name: "Документация", exact: true })).toBeVisible();
  expectPagesLocation(page, "docs");

  await navigateMainView(page, "Changelog");
  await expect(page.getByRole("heading", { name: projectTitle, exact: true })).toBeVisible();
  expectPagesLocation(page, "changelog");

  await page.goBack();
  await expect(page.locator('.pg-views [aria-current="page"]')).toHaveText("Документация");
  expectPagesLocation(page, "docs");
  await page.goBack();
  await expect(page.getByRole("heading", { name: "Единый язык интерфейсов", exact: true })).toBeVisible();
  expectPagesLocation(page, "system");
  await page.goForward();
  await expect(page.locator('.pg-views [aria-current="page"]')).toHaveText("Документация");
  expectPagesLocation(page, "docs");

  await page.reload();
  await expect(page.getByRole("heading", { name: "Документация", exact: true })).toBeVisible();
  expectPagesLocation(page, "docs");
  await expectNoPageOverflow(page);
});

test("Changelog history links point to repository documents and all themes fit the viewport", async ({ page }) => {
  await page.goto(`${pagesPath}?view=changelog`);
  await expect(page.getByRole("heading", { name: projectTitle, exact: true })).toBeVisible();
  const historyHeading = page.getByRole("heading", { name: "История изменений", exact: true });
  await expect(historyHeading).toBeVisible();
  const history = historyHeading.locator("xpath=ancestor::section[1]");
  const links = await history.locator("a[href]").evaluateAll((anchors) =>
    anchors.map((anchor) => anchor.getAttribute("href")!)
  );
  const documents = links.filter((href) => !href.startsWith("#"));
  expect(documents.length).toBeGreaterThan(0);
  for (const href of documents) expect(href).toMatch(/^https:\/\/github\.com\/whitewolf06\/gavia-ui\/blob\/main\//);
  expect(documents).toContain(`${repositoryDocs}docs/migration-gavia.md`);

  const backgroundColors: string[] = [];
  for (const { label, name: theme } of wlDesignThemes) {
    await chooseShowcaseTheme(page, label);
    await expect(page.locator("html")).toHaveAttribute("data-wl-theme", theme);
    backgroundColors.push(await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--wl-bg").trim()
    ));
    await expectNoPageOverflow(page);
  }
  expect(new Set(backgroundColors).size).toBe(wlDesignThemes.length);
  expectPagesLocation(page, "changelog");
});

test("production lazy examples, recipes and copied source work beneath the Pages prefix", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(`${pagesPath}?view=system`);
  await expect(page.getByRole("heading", { name: "Единый язык интерфейсов", exact: true })).toBeVisible();

  await page.getByRole("combobox", { name: "Компонент", exact: true }).click();
  await page.getByRole("listbox").getByRole("option", { name: "WlButton", exact: true }).click();
  const explorer = page.getByTestId("ds-explorer");
  await expect(explorer).toHaveAttribute("data-component", "WlButton");
  const example = page.getByTestId("ds-example-preview");
  await example.getByRole("button", { name: "Добавить", exact: true }).click();
  await expect(example.getByRole("status")).toHaveText("Действий: 1");

  await explorer.getByText("Показать Vue-код", { exact: true }).click();
  const source = await explorer.locator("pre code").innerText();
  expect(source).toContain('from "gavia-ui"');
  expect(source).not.toContain("packages/ui-kit");
  await copyCodePanel(explorer);
  await expect(explorer.getByRole("status").last()).toHaveText("Код скопирован.");
  // Clipboard line endings follow the OS; preserve every source character otherwise.
  await expect.poll(async () => (await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n?/g, "\n"))
    .toBe(source.replace(/\r\n?/g, "\n"));

  await page.locator('[data-testid="ds-recipes"] [data-recipe="ProfileForm"]').first().click();
  const recipe = page.getByTestId("ds-recipe-preview");
  await expect(recipe).toHaveAttribute("data-recipe", "ProfileForm");
  const form = recipe.getByRole("form", { name: "Форма профиля" });
  await form.getByRole("button", { name: "Сохранить профиль", exact: true }).click();
  await expect(form.getByRole("textbox", { name: "Имя участника", exact: true })).toBeFocused();
  await expect(form.getByRole("textbox", { name: "Имя участника", exact: true })).toHaveAttribute("aria-invalid", "true");
  await form.getByRole("textbox", { name: "Имя участника", exact: true }).fill("Участник Gavia");
  await form.getByRole("textbox", { name: "Email участника", exact: true }).fill("example@example.com");
  await form.getByRole("button", { name: "Сохранить профиль", exact: true }).click();
  await expect(form.getByRole("alert")).toContainText("Профиль сохранён");
  await expectNoPageOverflow(page);
  expectPagesLocation(page, "system");
});

test("picker documentation examples work beneath the Pages prefix", async ({ page }) => {
  await page.goto(pagesPath + "?view=docs");
  const docs = page.getByTestId("docs-page");
  await expect(docs.getByRole("heading", { level: 1 })).toHaveText("Документация");

  const timeWorkspace = await navigateDocumentationComponent(page, "WlTimePicker");
  await expect(docs.getByRole("heading", { level: 1, name: "WlTimePicker", exact: true })).toBeInViewport();
  const timeCard = timeWorkspace.getByTestId("ds-explorer").getByTestId("ds-example-preview");
  const timeInput = timeCard.getByLabel("Время встречи", { exact: true });
  await expect(timeInput).toHaveValue("09:30");
  await timeInput.fill("10:45");
  await timeInput.press("Enter");
  await expect(timeCard.getByRole("status")).toHaveText("Выбрано: 10:45");
  await timeInput.fill("");
  await timeInput.press("Enter");
  await expect(timeCard.getByRole("status")).toHaveText("Выбрано: время не задано");
  expectPagesLocation(page, "docs", "WlTimePicker");

  const fileWorkspace = await navigateDocumentationComponent(page, "WlFilePicker");
  await expect(docs.getByRole("heading", { level: 1, name: "WlFilePicker", exact: true })).toBeInViewport();
  const fileCard = fileWorkspace.getByTestId("ds-explorer").getByTestId("ds-example-preview");
  const opened = page.waitForEvent("filechooser");
  await fileCard.getByRole("button", { name: "Выбрать файлы", exact: true }).click();
  await (await opened).setFiles({ name: "pages-example.txt", mimeType: "text/plain", buffer: Buffer.from("Pages example") });
  await expect(fileCard.getByRole("status")).toHaveText("Выбрано: pages-example.txt");
  await fileCard.getByRole("button", { name: "Очистить список приложения", exact: true }).click();
  await expect(fileCard.getByRole("status")).toHaveText("Можно выбрать файлы повторно.");
  await expectNoPageOverflow(page);
  expectPagesLocation(page, "docs", "WlFilePicker");
});

test("Theme builder scopes live colors, restores its draft and exports a working CSS theme", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(`${pagesPath}?theme=gavia`);
  const headerSearch = page.locator(".pg-search");
  await expect(headerSearch).toHaveText("Поиск");
  await expect(headerSearch).toHaveAttribute("title", "Поиск");
  await expect(page.locator(".pg-logo")).toHaveCSS("width", page.viewportSize()!.width <= 400 ? "28px" : page.viewportSize()!.width <= 700 ? "32px" : "36px");
  await navigateMainView(page, "Подбор темы");
  expectPagesLocation(page, "theme-builder");
  const builder = page.getByTestId("theme-builder-page");
  const preview = page.getByTestId("theme-builder-preview");
  await expect(builder.getByRole("heading", { name: "Подбор темы", exact: true })).toBeVisible();
  const createAction = preview.getByRole("button", { name: "Создать проект", exact: true });
  await expect(createAction).toHaveCSS("background-color", "rgb(41, 68, 81)");
  await expect(createAction).toHaveCSS("color", "rgb(255, 255, 255)");
  await expect(createAction).toHaveCSS("border-radius", "4px");
  await expect(preview.getByRole("button", { name: "Primary", exact: true })).toHaveCSS("border-radius", "3px");
  await createAction.focus();
  await page.keyboard.down("Space");
  await expect(createAction).toHaveCSS("background-color", "rgb(24, 42, 51)");
  await page.keyboard.up("Space");
  await expect(preview.getByRole("status")).toHaveText("Действий: 1");
  const bg = builder.getByRole("textbox", { name: "Основной фон", exact: true });
  await bg.fill("#f0");
  await expect(bg).toHaveAttribute("aria-invalid", "true");
  await expect(preview).toHaveCSS("background-color", "rgb(250, 249, 246)");
  await expect(builder.getByRole("button", { name: "Копировать для агента", exact: true })).toBeDisabled();
  await bg.fill("#eef5ff");
  await builder.getByRole("textbox", { name: "Основное действие", exact: true }).fill("#0b6a53");
  await builder.getByRole("textbox", { name: "Ссылки и фокус", exact: true }).fill("#0b6a53");
  await expect(preview).toHaveCSS("background-color", "rgb(238, 245, 255)");
  await expect(preview.getByRole("button", { name: "Создать проект", exact: true })).toHaveCSS("background-color", "rgb(11, 106, 83)");
  await expect(page.locator(".pg-top")).toHaveCSS("background-color", "rgb(250, 249, 246)");
  const priority = preview.getByRole("combobox", { name: "Приоритет", exact: true });
  await priority.click();
  const overlay = page.getByTestId("theme-builder-overlay");
  await expect(overlay).toHaveCSS("background-color", "rgb(238, 245, 255)");
  await expect(overlay).toHaveAttribute("data-wl-theme", "gavia");
  await overlay.getByRole("option", { name: "Высокий", exact: true }).click();
  await expect(priority).toHaveText("Высокий");
  await preview.getByRole("button", { name: "Создать проект", exact: true }).click();
  await expect(preview.getByRole("status")).toHaveText("Действий: 2");
  await builder.getByRole("checkbox", { name: "Disabled", exact: true }).check();
  await expect(preview.getByRole("button", { name: "Создать проект", exact: true })).toBeDisabled();
  await page.reload();
  await expect(bg).toHaveValue("#eef5ff");
  await expect(preview).toHaveCSS("background-color", "rgb(238, 245, 255)");
  await builder.getByRole("textbox", { name: "Ссылки и фокус", exact: true }).fill("#eeeeee");
  await expect(builder.locator('[data-passes="false"]').first()).toBeVisible();
  await builder.getByRole("textbox", { name: "Ссылки и фокус", exact: true }).fill("#0b6a53");
  const formats = builder.getByRole("group", { name: "Формат экспорта", exact: true });
  await formats.getByRole("button", { name: "JSON", exact: true }).click();
  await builder.getByRole("button", { name: "Копировать JSON", exact: true }).click();
  await expect(builder.getByRole("status").last()).toHaveText("Код скопирован.");
  const spec = JSON.parse(await page.evaluate(() => navigator.clipboard.readText())) as {name:string; palette:Record<string,string>};
  expect(spec.name).toBe("my-gavia");
  expect(spec.palette).toMatchObject({ background: "#eef5ff", primary: "#0b6a53", link: "#0b6a53" });
  await formats.getByRole("button", { name: "CSS", exact: true }).click();
  await builder.getByRole("button", { name: "Копировать CSS", exact: true }).click();
  await expect(builder.getByRole("status").last()).toHaveText("Код скопирован.");
  const css = await page.evaluate(() => navigator.clipboard.readText());
  expect(css).toContain('@layer wl.tokens');
  expect(css).toContain('prefers-reduced-motion: reduce');
  await page.addStyleTag({ content: css });
  const exportedPreview = await preview.evaluate((element, themeName) => {
    const clone = element.cloneNode(true) as HTMLElement;
    clone.removeAttribute("style");
    clone.dataset.wlTheme = themeName;
    clone.dataset.testid = "exported-theme-proof";
    document.body.append(clone);
    const primary = clone.querySelector<HTMLElement>('[data-variant="primary"]')!;
    const colors = { bg: getComputedStyle(clone).backgroundColor, action: getComputedStyle(primary).backgroundColor, text: getComputedStyle(primary).color };
    clone.remove();
    return colors;
  }, spec.name);
  expect(exportedPreview).toEqual({ bg: "rgb(238, 245, 255)", action: "rgb(11, 106, 83)", text: "rgb(255, 255, 255)" });
  await builder.getByRole("button", { name: "Сбросить цвета", exact: true }).click();
  await expect(bg).toHaveValue("#faf9f6");
  await expect(preview).toHaveCSS("background-color", "rgb(250, 249, 246)");
  await chooseDropdownOption(page, builder.getByRole("combobox", { name: "Взять за основу", exact: true }), "Classic Dark");
  const previewLink = preview.getByRole("link", { name: "Настройки темы", exact: true });
  await expect(previewLink).toHaveCSS("color", "rgb(121, 163, 244)");
  await builder.getByRole("textbox", { name: "Ссылки и фокус", exact: true }).fill("#a6c7ff");
  await expect(previewLink).toHaveCSS("color", "rgb(166, 199, 255)");
  const softAction = preview.getByRole("button", { name: "Soft", exact: true });
  await expect(softAction).toHaveCSS("color", "rgb(166, 199, 255)");
  await softAction.hover();
  await expect(softAction).toHaveCSS("color", "rgb(166, 199, 255)");
  await expectNoPageOverflow(page);
});

test("font presentation preserves theme, faces and anchors under the Pages subpath", async ({ page }) => {
  await page.goto(`${pagesPath}?view=font&theme=graphite#wl-type-proof`);
  const fontPage = page.getByTestId("font-page");
  const proof = fontPage.locator("#wl-type-proof-title");
  await expect(fontPage).toBeVisible();
  await expect(proof).toBeInViewport();
  await expect(page.locator("html")).toHaveAttribute("data-wl-theme", "graphite");
  const headingFamily = await fontPage.locator(".wl-page-header__title").evaluate((element) => getComputedStyle(element).fontFamily);
  await expect(fontPage.locator(".wl-type-display")).toHaveCSS("font-family", headingFamily);
  await expect(fontPage.locator(".wl-type-number-sample").first()).toHaveCSS("font-family", /^"?Gavia Sans"?,/);
  const loaded = await page.evaluate(async () => (await document.fonts.load("italic 600 16px 'Gavia Sans'", "Гавиа Gavia 0123456789")).length);
  expect(loaded).toBe(1);
  expectPagesLocation(page, "font");
  await expectNoPageOverflow(page);
  await navigateMainView(page, "Документация");
  await expect(page.getByTestId("docs-page")).toBeVisible();
  expectPagesLocation(page, "docs");
  expect(new URL(page.url()).searchParams.get("theme")).toBe("graphite");
  await page.goBack();
  await expect(fontPage).toBeVisible();
  await expect(proof).toBeInViewport();
  expectPagesLocation(page, "font");
  await page.reload();
  await expect(proof).toBeInViewport();
  await chooseShowcaseTheme(page, "Gavia");
  expectPagesLocation(page, "font");
  expect(new URL(page.url()).searchParams.get("theme")).toBe("gavia");
  await expectNoPageOverflow(page);
});


test("standalone font ZIP downloads from the Pages subpath and footer", async ({ page }) => {
  await page.goto(pagesPath + "?view=font&theme=gavia");
  const font = page.getByTestId("font-page");
  await expect(font).toBeVisible();
  const link = font.getByRole("link", { name: "Скачать Gavia Sans 0.6", exact: true }).first();
  await expect(link).toHaveAttribute("href", pagesPath + "downloads/Gavia-Sans-0.6.zip");
  await expectGaviaFontDownload(page, link);
  const footer = page.locator(".pg-footer").getByRole("link", { name: "Скачать шрифт Gavia Sans", exact: true });
  await expect(footer).toHaveAttribute("href", pagesPath + "downloads/Gavia-Sans-0.6.zip");
});

test("quality documentation keeps bookmarked anchors and theme links under the Pages prefix", async ({ page }) => {
  await page.goto(pagesPath + "?view=docs&section=quality&theme=graphite#docs-quality-environment");
  const quality = page.getByTestId("docs-quality-page");
  await expect(quality).toBeVisible();
  await expect(page.getByTestId("docs-page").getByRole("heading", { level: 1 })).toHaveText("Качество и совместимость");
  const environment = quality.getByRole("heading", { name: "Браузеры и Vue", exact: true });
  await expect(environment).toBeInViewport();
  await expect.poll(() => environment.evaluate((element) => element.getBoundingClientRect().top - document.querySelector(".pg-top")!.getBoundingClientRect().bottom)).toBeGreaterThanOrEqual(0);
  await expect(page.locator("html")).toHaveAttribute("data-wl-theme", "graphite");
  expectPagesLocation(page, "docs");
  expect(new URL(page.url()).searchParams.get("section")).toBe("quality");
  const footer = page.locator(".pg-footer").getByRole("link", { name: "Качество и совместимость", exact: true });
  const footerUrl = new URL((await footer.getAttribute("href"))!, page.url());
  expect(footerUrl.pathname).toBe(pagesPath);
  expect(footerUrl.searchParams.get("theme")).toBe("graphite");
  expect(footerUrl.searchParams.get("section")).toBe("quality");
  await page.reload();
  await expect(environment).toBeInViewport();
  await expectNoPageOverflow(page);
  await navigateMainView(page, "Главная");
  const summary = page.getByTestId("home-quality");
  const homeLink = summary.getByRole("link", { name: "Все проверки", exact: true });
  const homeUrl = new URL((await homeLink.getAttribute("href"))!, page.url());
  expect(homeUrl.pathname).toBe(pagesPath);
  expect(homeUrl.searchParams.get("theme")).toBe("graphite");
  await homeLink.click();
  await expect(quality).toBeVisible();
  await navigateMainView(page, "Документация");
  const docs = await openDocumentationMenu(page);
  await docs.locator(".docs-sidebar").getByRole("link", { name: "Качество и совместимость", exact: true }).click();
  await expect(quality).toBeVisible();
  await expect(docs.locator(".docs-quality-link")).toHaveAttribute("aria-current", "page");
  await navigateMainView(page, "Главная");
  await page.locator(".pg-top").getByRole("button", { name: "Поиск", exact: true }).click();
  const search = page.getByRole("combobox", { name: "Командная палитра", exact: true });
  await search.fill("качество");
  await expect(page.locator(".wl-command-palette").getByRole("option")).toHaveCount(1);
  await search.press("Enter");
  await expect(page.locator(".wl-command-palette")).toHaveCount(0);
  await expect(quality).toBeVisible();
  expectPagesLocation(page, "docs");
  expect(new URL(page.url()).searchParams.get("section")).toBe("quality");
  await expectNoPageOverflow(page);
});
