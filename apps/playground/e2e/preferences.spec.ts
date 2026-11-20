import { expect, type Page, test } from "@playwright/test";
import { wlDesignThemes } from "../../../packages/ui-kit/src/design-system/tokens.generated";
import { wlManifest } from "../../../packages/ui-kit/src/manifest";
import { playgroundRouteParams } from "./playground-url";
import { chooseDropdownOption, chooseShowcaseLanguage, nativeReload, navigateMainView, openDocumentationMenu } from "./select-helpers";

test.use({ locale: "ru-RU", colorScheme: "light", contextOptions: { reducedMotion: "reduce" } });

const pageErrors = new WeakMap<Page, string[]>();
const graphiteLabel = wlDesignThemes.find((theme) => theme.name === "graphite")!.label;

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  pageErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
});

test.afterEach(async ({ page }) => {
  expect(pageErrors.get(page), "Preference and catalog interactions have no runtime errors").toEqual([]);
});

async function expectPreferences(page: Page, language: "en" | "ru", preference: string, theme: string): Promise<void> {
  await expect(page.locator("html")).toHaveAttribute("lang", language);
  await expect(page.locator("html")).toHaveAttribute("data-wl-theme", theme);
  await expect.poll(() => {
    const url = new URL(page.url());
    return { language: playgroundRouteParams(url).get("lang"), preference: url.searchParams.get("theme") };
  }).toEqual({ language, preference });
}

async function expectMetricAnchor(page: Page, target: string, anchor: string | undefined): Promise<void> {
  if (!anchor) return;
  await expect.poll(() => page.locator(target).evaluate((element) => {
    const headerBottom = document.querySelector(".pg-top")!.getBoundingClientRect().bottom;
    const top = element.getBoundingClientRect().top;
    return top >= headerBottom - 1 && top < window.innerHeight / 2;
  }), { message: "Metric anchor is visible below the sticky header" }).toBe(true);
}

async function chooseTheme(page: Page, label: string): Promise<void> {
  await chooseDropdownOption(page, page.getByTestId("pg-theme-selector"), label);
}

for (const detection of [
  { languages: ["ru-RU", "en-US"], expected: "ru" },
  { languages: ["en-GB", "ru-RU"], expected: "en" },
  { languages: ["fr-FR", "ru-RU"], expected: "ru" },
  { languages: ["fr-FR", "de-DE"], expected: "en" }
] as const) {
  test("first visit detects language " + detection.languages.join(", ") + " and follows the OS theme", async ({ page }) => {
    await page.addInitScript((languages: string[]) => {
      Object.defineProperty(navigator, "languages", { get: () => languages });
      Object.defineProperty(navigator, "language", { get: () => languages[0] });
    }, [...detection.languages]);
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await expect(page.getByTestId("home-page")).toBeVisible();
    await expectPreferences(page, detection.expected, "system", "legato-dark");
    await expect(page.getByTestId("pg-theme-selector")).toContainText(detection.expected === "ru" ? "Системная" : "System");
    await expect.poll(() => page.evaluate(() => ({
      theme: localStorage.getItem("legato-ui.theme"), locale: localStorage.getItem("legato-ui.locale")
    }))).toEqual({ theme: null, locale: null });
    await page.emulateMedia({ colorScheme: "light" });
    await expectPreferences(page, detection.expected, "system", "legato");
    await page.emulateMedia({ colorScheme: "dark" });
    await expectPreferences(page, detection.expected, "system", "legato-dark");
  });
}

test("manual theme and language persist, explicit links override them, and System restores OS tracking", { tag: "@cross-browser" }, async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("home-page")).toBeVisible();
  await expectPreferences(page, "ru", "system", "legato");
  await chooseTheme(page, graphiteLabel);
  await chooseShowcaseLanguage(page, "en");
  await expectPreferences(page, "en", "graphite", "graphite");
  await expect.poll(() => page.evaluate(() => ({
    theme: localStorage.getItem("legato-ui.theme"), locale: localStorage.getItem("legato-ui.locale")
  }))).toEqual({ theme: "graphite", locale: "en" });
  await page.goto("/");
  await expect(page.getByTestId("home-page")).toBeVisible();
  await expectPreferences(page, "en", "graphite", "graphite");
  await page.emulateMedia({ colorScheme: "dark" });
  await page.emulateMedia({ colorScheme: "light" });
  await expectPreferences(page, "en", "graphite", "graphite");
  await page.goto("/?theme=gavia&lang=ru");
  await expect(page.getByTestId("home-page")).toBeVisible();
  await expectPreferences(page, "ru", "gavia", "gavia");
  await page.goto("/");
  await expect(page.getByTestId("home-page")).toBeVisible();
  await expectPreferences(page, "en", "graphite", "graphite");
  await chooseTheme(page, "System");
  await expectPreferences(page, "en", "system", "legato");
  await page.emulateMedia({ colorScheme: "dark" });
  await expectPreferences(page, "en", "system", "legato-dark");
  await page.goto("/");
  await expect(page.getByTestId("home-page")).toBeVisible();
  await expectPreferences(page, "en", "system", "legato-dark");
});

test("Back and Forward restore each visit's language and theme mode after manual choices and reload", async ({ page }) => {
  await page.goto("/");
  await expectPreferences(page, "ru", "system", "legato");
  // A route visit owns its theme: changing it replaces that visit's URL.
  // Preserve the original automatic-mode visit through actual navigation first.
  await page.getByTestId("home-page").locator(".home-metrics").getByRole("link").first().click();
  await expect(page.getByTestId("docs-page")).toBeVisible();
  await chooseTheme(page, graphiteLabel);
  await chooseShowcaseLanguage(page, "en");
  await expectPreferences(page, "en", "graphite", "graphite");
  await nativeReload(page);
  await expectPreferences(page, "en", "graphite", "graphite");
  await page.goBack();
  await expectPreferences(page, "ru", "graphite", "graphite");
  await page.goBack();
  await expectPreferences(page, "ru", "system", "legato");
  await expect(page.getByTestId("home-page")).toBeVisible();
  await page.emulateMedia({ colorScheme: "dark" });
  await expectPreferences(page, "ru", "system", "legato-dark");
  await page.goForward();
  await expectPreferences(page, "ru", "graphite", "graphite");
  await page.goForward();
  await expectPreferences(page, "en", "graphite", "graphite");
});

test("all four home metric links open their section and preserve preferences and history anchors", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  const destinations = [
    { index: 0, view: "docs", section: null, anchor: "docs-components", target: "#docs-components" },
    { index: 1, view: "docs", section: "icons", anchor: "", target: '[data-docs-section="icons"]' },
    { index: 2, view: "system", section: null, anchor: "ds-tokens", target: "#ds-tokens" },
    { index: 3, view: "system", section: null, anchor: "ds-themes", target: "#ds-themes" }
  ];
  for (const destination of destinations) {
    await page.goto("/");
    const metrics = page.getByTestId("home-page").locator(".home-metrics").getByRole("link");
    await expect(metrics).toHaveCount(4);
    const link = metrics.nth(destination.index);
    const href = new URL((await link.getAttribute("href"))!, page.url());
    expect(playgroundRouteParams(href).get("view")).toBe(destination.view);
    expect(playgroundRouteParams(href).get("section")).toBe(destination.section);
    expect(href.hash).toBe(destination.anchor ? "#" + destination.anchor : "");
    expect(href.searchParams.get("theme")).toBe("system");
    expect(playgroundRouteParams(href).get("lang")).toBe("ru");
    // Enter exercises the real link's keyboard activation as well as its focus state.
    await link.focus();
    await expect(link).toBeFocused();
    await link.press("Enter");
    await expectPreferences(page, "ru", "system", "legato-dark");
    await expect.poll(() => new URL(page.url()).hash).toBe(href.hash);
    await expect(page.locator(destination.target)).toBeVisible();
    await expect(page.locator(destination.target)).toBeInViewport();
    await expectMetricAnchor(page, destination.target, destination.anchor);
    await page.goBack();
    await expect(page.getByTestId("home-page")).toBeVisible();
    await page.goForward();
    await expect(page.locator(destination.target)).toBeVisible();
    await expect(page.locator(destination.target)).toBeInViewport();
  }
});

test("sidebar components are alphabetical, searchable, clearable, and keep the chosen page on desktop and mobile", async ({ page }) => {
  await page.goto("/?view=docs&lang=ru&theme=system");
  const docs = await openDocumentationMenu(page);
  const menu = docs.locator(".docs-menu");
  const compact = await menu.locator("summary").isVisible();
  const catalog = docs.locator("#docs-component-catalog");
  await expect(catalog.getByRole("button")).toHaveCount(wlManifest.length);
  for (const group of await catalog.locator(".docs-catalog-group").all()) {
    const names = await group.locator(".docs-component-name").allTextContents();
    expect(names).toEqual([...names].sort((left, right) => left.localeCompare(right, "en")));
  }
  const search = docs.getByRole("searchbox", { name: "Поиск компонентов", exact: true });
  await search.fill("FiLe");
  await expect(catalog.locator(".docs-component-name")).toHaveText(["WlFilePicker", "WlFileUpload"]);
  await expect(catalog.locator(".docs-catalog-group")).toHaveCount(1);
  await catalog.getByRole("button", { name: "WlFilePicker", exact: true }).click();
  await expect(docs.getByRole("heading", { name: "WlFilePicker", level: 1, exact: true })).toBeVisible();
  await expect(menu).toHaveJSProperty("open", !compact);
  await openDocumentationMenu(page);
  await expect(search).toHaveValue("FiLe");
  // Selecting the current component must also close compact navigation.
  await catalog.getByRole("button", { name: "WlFilePicker", exact: true }).click();
  await expect(menu).toHaveJSProperty("open", !compact);
  await openDocumentationMenu(page);
  await search.fill("zzzx-no-component");
  await expect(catalog.locator(".docs-catalog-group")).toHaveCount(0);
  await expect(docs.getByText("Ничего не найдено", { exact: true })).toBeVisible();
  await docs.getByRole("button", { name: "Очистить поиск", exact: true }).click();
  await expect(search).toHaveValue("");
  await expect(search).toBeFocused();
  await expect(catalog.getByRole("button")).toHaveCount(wlManifest.length);
  await search.fill("button");
  await search.press("Escape");
  await expect(search).toHaveValue("");
  await expect(search).toBeFocused();
  await expect(catalog.getByRole("button")).toHaveCount(wlManifest.length);
  await expect(docs.getByText("Ничего не найдено", { exact: true })).toHaveCount(0);
  await expect(docs.getByRole("heading", { name: "WlFilePicker", level: 1, exact: true })).toBeVisible();
  await expect(catalog.getByRole("button", { name: "WlFilePicker", exact: true })).toHaveAttribute("aria-current", "page");
});

test("blocked local storage still permits automatic detection and manual preference changes", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException("Storage unavailable", "SecurityError");
    };
    Storage.prototype.setItem = () => {
      throw new DOMException("Storage unavailable", "SecurityError");
    };
  });
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await expectPreferences(page, "ru", "system", "legato-dark");
  await chooseTheme(page, graphiteLabel);
  await chooseShowcaseLanguage(page, "en");
  await expectPreferences(page, "en", "graphite", "graphite");
  await nativeReload(page);
  await expectPreferences(page, "en", "graphite", "graphite");
});

test("applied palette follows navigation and reload, and Undo or a built-in selection removes it", async ({ page }) => {
  await page.goto("/?view=theme-builder&theme=gavia&lang=ru");
  const builder = page.getByTestId("theme-builder-page");
  await builder.locator("#tb-hex-background").fill("#eef5ff");
  await builder.locator("#tb-hex-primary").fill("#0b6a53");
  await builder.getByTestId("theme-builder-apply").click();
  await expect(page.locator("html")).toHaveAttribute("data-wl-playground-draft", "my-gavia");
  await expect(page.locator(".pg-top")).toHaveCSS("background-color", "rgb(238, 245, 255)");
  await navigateMainView(page, "Документация");
  await expect(page).toHaveURL((url) => playgroundRouteParams(url).get("view") === "docs");
  await expect(page.getByTestId("docs-page")).toBeVisible();
  await expect(page.getByTestId("playground-theme-undo")).toBeVisible();
  await nativeReload(page);
  await expect(page.locator(".pg-top")).toHaveCSS("background-color", "rgb(238, 245, 255)");
  await page.getByTestId("playground-theme-undo").click();
  await expect(page.locator("html")).not.toHaveAttribute("data-wl-playground-draft");
  await expect(page.locator(".pg-top")).toHaveCSS("background-color", "rgb(250, 249, 246)");
  await expect.poll(() => page.evaluate(() => document.documentElement.style.getPropertyValue("--wl-palette-bg"))).toBe("");
  await navigateMainView(page, "Подбор темы");
  await builder.getByTestId("theme-builder-apply").click();
  await chooseTheme(page, "Gavia");
  await expect(page.getByTestId("playground-theme-draft")).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => localStorage.getItem("legato-ui.applied-theme.v1"))).toBeNull();
});
