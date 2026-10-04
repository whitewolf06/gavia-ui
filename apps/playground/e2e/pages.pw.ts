import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { fileURLToPath, URL as NodeURL } from "node:url";

const packageMetadata = JSON.parse(readFileSync(fileURLToPath(new NodeURL("../../../packages/ui-kit/package.json", import.meta.url)), "utf8")) as { name: string; version: string };
const packageUrl = "https://www.npmjs.com/package/gavia-ui";
const publishedVersion = "0.7.1";

const pagesPath = "/gavia-ui/";
const projectTitle = "Интерфейсы с ясным характером";
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

function expectPagesLocation(page: Page, view?: string): void {
  const url = new URL(page.url());
  expect(url.pathname).toBe(pagesPath);
  expect(url.searchParams.get("view")).toBe(view ?? null);
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

test("project query survives refresh and production assets use the Pages prefix", async ({ page }) => {
  await page.goto(`${pagesPath}?view=project`);
  await expect(page.getByRole("heading", { name: projectTitle, exact: true })).toBeVisible();
  await expect(page.locator('.pg-views [aria-current="page"]')).toHaveText("О проекте");
  expectPagesLocation(page, "project");
  await expect(page.getByTestId("project-version")).toHaveText(packageMetadata.version);
  await expect(page.locator(".pg-kit-version")).toHaveText(`v${packageMetadata.version}`);
  const packageStatus = page.getByTestId("project-npm-status");
  await expect(packageStatus).toContainText("опубликован в публичном npm");
  await expect(packageStatus.getByRole("link", { name: `${packageMetadata.name}@${publishedVersion}`, exact: true })).toHaveAttribute("href", packageUrl);
  await expect(packageStatus.locator("code")).toHaveText(`pnpm add ${packageMetadata.name}@${publishedVersion}`);

  const logo = page.locator(".pg-logo");
  await expect(logo).toBeVisible();
  const image = await logo.evaluate((element: HTMLImageElement) => ({
    complete: element.complete,
    width: element.naturalWidth,
    path: new URL(element.currentSrc).pathname
  }));
  expect(image.complete).toBe(true);
  expect(image.width).toBeGreaterThan(0);
  expect(image.path).toMatch(/^\/gavia-ui\/assets\//);

  const observed = resources.get(page)!;
  expect(observed.scripts.size).toBeGreaterThan(0);
  expect(observed.styles.size).toBeGreaterThan(0);
  for (const path of [...observed.scripts, ...observed.styles]) {
    expect(path).toMatch(/^\/gavia-ui\/assets\//);
  }

  await page.reload();
  await expect(page.getByRole("heading", { name: projectTitle, exact: true })).toBeVisible();
  expectPagesLocation(page, "project");
  await expectNoPageOverflow(page);
  const releaseLink = page.getByRole("navigation", { name: "Версии в истории изменений" }).locator('a[href^="#project-release-"]').first();
  const releaseHash = await releaseLink.getAttribute("href");
  expect(releaseHash).toMatch(/^#project-release-/);
  await releaseLink.click();
  await page.getByRole("navigation", { name: "Режим витрины" }).getByRole("button", { name: "Дизайн-система", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Единый язык интерфейсов", exact: true })).toBeVisible();
  await page.goBack();
  await expect(page.locator(`${releaseHash}-title`)).toBeInViewport();
  expectPagesLocation(page, "project");
});

test("navigation, Back and Forward preserve the repository subpath", async ({ page }) => {
  await page.goto(`${pagesPath}?view=project`);
  await expect(page.getByRole("heading", { name: projectTitle, exact: true })).toBeVisible();
  const navigation = page.getByRole("navigation", { name: "Режим витрины" });

  await navigation.getByRole("button", { name: "Дизайн-система", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Единый язык интерфейсов", exact: true })).toBeVisible();
  expectPagesLocation(page, "system");

  await navigation.getByRole("button", { name: "Компоненты", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Компоненты", exact: true })).toBeVisible();
  expectPagesLocation(page);

  await navigation.getByRole("button", { name: "О проекте", exact: true }).click();
  await expect(page.getByRole("heading", { name: projectTitle, exact: true })).toBeVisible();
  expectPagesLocation(page, "project");

  await page.goBack();
  await expect(page.locator('.pg-views [aria-current="page"]')).toHaveText("Компоненты");
  expectPagesLocation(page);
  await page.goBack();
  await expect(page.getByRole("heading", { name: "Единый язык интерфейсов", exact: true })).toBeVisible();
  expectPagesLocation(page, "system");
  await page.goForward();
  await expect(page.locator('.pg-views [aria-current="page"]')).toHaveText("Компоненты");
  expectPagesLocation(page);

  await page.reload();
  await expect(page.getByRole("heading", { name: "Компоненты", exact: true })).toBeVisible();
  expectPagesLocation(page);
  await expectNoPageOverflow(page);
});

test("project history links point to repository documents and all themes fit the viewport", async ({ page }) => {
  await page.goto(`${pagesPath}?view=project`);
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
  for (const [label, theme] of [
    ["White", "white"], ["Graphite", "graphite"], ["Newspaper", "newspaper"]
  ] as const) {
    await page.locator(".pg-theme").getByText(label, { exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("data-wl-theme", theme);
    backgroundColors.push(await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--wl-bg").trim()
    ));
    await expectNoPageOverflow(page);
  }
  expect(new Set(backgroundColors).size).toBe(3);
  expectPagesLocation(page, "project");
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
  await explorer.getByRole("button", { name: "Копировать код", exact: true }).click();
  await expect(explorer.getByRole("status").last()).toHaveText("Vue-код скопирован.");
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
