import { russianPlaygroundUrl } from "./playground-url";
import { publishedVersion } from "./project-version";
import { wlDesignThemes } from "../../../packages/ui-kit/src/design-system/tokens.generated";
import { expect, test } from "@playwright/test";
import { chooseShowcaseTheme, navigateMainView, expectMainViewCurrent } from "./select-helpers";
import { readFileSync } from "node:fs";
import { fileURLToPath, URL as NodeURL } from "node:url";

const packageMetadata = JSON.parse(readFileSync(fileURLToPath(new NodeURL("../../../packages/ui-kit/package.json", import.meta.url)), "utf8")) as {
  name: string;
  version: string;
  author: { name: string; url: string };
};
const project = {
  ...packageMetadata,
  documentationBaseUrl: "https://github.com/whitewolf06/gavia-ui/blob/main/",
  licenseUrl: "https://github.com/whitewolf06/gavia-ui/blob/main/LICENSE",
  instructionsUrl: "https://github.com/whitewolf06/gavia-ui/blob/main/README.md",
  packageName: packageMetadata.name,
  packageUrl: "https://www.npmjs.com/package/gavia-ui",
  npmPublished: true
};
import { parseChangelog } from "../src/project/changelog";
import type { ChangelogInline } from "../src/project/changelog";

const history = parseChangelog(
  readFileSync(fileURLToPath(new NodeURL("../../../CHANGELOG.md", import.meta.url)), "utf8"),
  project.documentationBaseUrl
);
const inlineText = (content: ChangelogInline[]): string => content.map((part) => part.kind === "link" ? part.label : part.value).join("");

test.beforeEach(async ({ page }) => {
  await page.goto(russianPlaygroundUrl("/?view=changelog"));
  // Changelog remains a lazy page and preserves historical release anchors.
  await expect(page.locator(".project-main")).toBeVisible();
});

test("home shows creator, source version, license and truthful package status while the old project query remains compatible", async ({ page }) => {
  await page.goto(russianPlaygroundUrl("/?view=project"));
  const changelog = page.getByTestId("changelog-page");
  await expect(changelog.getByRole("heading", { level: 1 })).toHaveText("Changelog");
  await expectMainViewCurrent(page, "Changelog");
  await expect(page).toHaveURL((url) => url.searchParams.get("view") === "project" && url.searchParams.get("lang") === "ru" && !url.hash);
  await navigateMainView(page, "Главная");
  const main = page.getByTestId("home-page");
  await expect(main.getByRole("heading", { level: 1 })).toHaveText("Gavia UI");
  await expect(main.getByRole("link", { name: project.author.name, exact: true })).toHaveCount(1);
  await expect(main.getByRole("link", { name: project.author.name, exact: true })).toHaveAttribute("href", project.author.url);
  await expect(main.getByTestId("project-version")).toHaveText(project.version);
  await expect(page.locator(".pg-kit-version")).toHaveText(`v${project.version}`);
  await expect(main.getByRole("link", { name: "MIT", exact: true })).toHaveCount(1);
  await expect(main.getByRole("link", { name: "MIT", exact: true })).toHaveAttribute("href", project.licenseUrl);
  await expect(main.getByRole("link", { name: "GitHub", exact: true })).toHaveAttribute("href", "https://github.com/whitewolf06/gavia-ui");
  await expect(main.getByRole("link", { name: "Подключение и инструкции", exact: true })).toHaveAttribute("href", project.instructionsUrl);
  await expect(main.getByRole("link", { name: "GitHub Issues", exact: true })).toHaveAttribute("href", "https://github.com/whitewolf06/gavia-ui/issues");
  await expect(main.getByRole("link", { name: "руководство для участников", exact: true })).toHaveAttribute("href", project.documentationBaseUrl + "CONTRIBUTING.md");
  const packageStatus = main.getByTestId("project-npm-status");
  await expect(packageStatus).toContainText("доступен в npm");
  await expect(packageStatus.getByRole("link", { name: `${project.packageName}@${publishedVersion}`, exact: true })).toHaveAttribute("href", project.packageUrl);
  await expect(packageStatus.locator("code")).toHaveText(`pnpm add ${project.packageName}@${publishedVersion}`);
  await expect(page.locator(".pg-footer")).toContainText(`Автор: ${project.author.name}`);
  await expect(main.getByRole("link").filter({ has: page.getByRole("heading", { name: "Changelog", exact: true }) })).toHaveAttribute("href", "?view=changelog&theme=gavia&lang=ru");
});

test("renders the canonical changelog with complete releases, continued bullets and safe documentation links", async ({ page }) => {
  const changelog = page.getByTestId("project-changelog");
  await expect(changelog.getByTestId("project-changelog-section")).toHaveCount(history.sections.length);
  for (const section of history.sections) {
    const article = changelog.locator(`article[id="${section.id}"]`);
    await expect(article.getByRole("heading", { level: 3 })).toHaveText(section.version ? `Версия ${section.version}` : section.title);
    if (section.date) await expect(article.locator("time")).toHaveAttribute("datetime", section.date);
    for (const block of section.blocks) {
      if (block.kind === "list") {
        for (const item of block.items) await expect(article.getByRole("listitem").filter({ hasText: inlineText(item) })).toHaveCount(1);
      } else if (block.kind === "heading") {
        await expect(article.getByRole("heading", { level: 4, name: inlineText(block.content), exact: true })).toBeVisible();
      }
      const chunks = block.kind === "list" ? block.items : [block.content];
      for (const chunk of chunks) for (const part of chunk) {
        if (part.kind === "link") await expect(article.getByRole("link", { name: part.label, exact: true })).toHaveAttribute("href", part.href);
      }
    }
  }
  await expect(changelog.locator("code").filter({ hasText: /^Wl\*$/ })).toHaveCount(1);
  expect(await changelog.locator("a").evaluateAll((links) => links.every((link) => {
    const href = link.getAttribute("href") ?? "";
    return href.startsWith("#") || /^https?:\/\//.test(href);
  }))).toBe(true);
});

test("navigates from the design system, opens release anchors and restores the page through history", async ({ page }) => {
  await page.goto(russianPlaygroundUrl("/?view=system"));
  await expect(page.getByRole("heading", { name: "Дизайн-система", exact: true })).toBeVisible();
  await navigateMainView(page, "Changelog");
  await expect(page).toHaveURL((url) => url.searchParams.get("view") === "changelog" && url.searchParams.get("lang") === "ru" && !url.hash);
  await expect(page.locator(".project-main")).toBeVisible();
  await page.getByRole("link", { name: "История изменений", exact: true }).click();
  await expect(page).toHaveURL((url) => url.searchParams.get("view") === "changelog" && url.searchParams.get("lang") === "ru" && url.hash === "#project-changelog");
  await expect(page.getByRole("heading", { name: "История изменений", exact: true })).toBeInViewport();
  const release = history.sections.find((section) => section.version)!;
  await page.getByRole("navigation", { name: "Версии в истории изменений" }).getByRole("link", { name: release.title, exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`#${release.id}$`));
  await page.reload();
  await expect(page.locator(".project-main")).toBeVisible();
  await expect(page.locator(`#${release.id}-title`)).toBeInViewport();
  await navigateMainView(page, "Дизайн-система");
  await expect(page.getByRole("heading", { name: "Дизайн-система", exact: true })).toBeVisible();
  await page.goBack();
  await expect(page.locator(".project-main")).toBeVisible();
  await expectMainViewCurrent(page, "Changelog");
  await expect(page.locator(`#${release.id}-title`)).toBeInViewport();
});

test("keeps Home information and Changelog readable with visible keyboard focus in all shipped themes", async ({ page }) => {
  for (const theme of wlDesignThemes.map((theme) => theme.label)) {
    await chooseShowcaseTheme(page, theme);
    const sourceLink = page.getByTestId("changelog-page").getByRole("link", { name: "Открыть исходный changelog", exact: true });
    await page.locator(".pg-top").getByRole("button", { name: /^Поиск/ }).focus();
    await page.keyboard.press("Tab");
    await sourceLink.focus();
    await expect(sourceLink).toBeFocused();
    await expect(sourceLink).toHaveCSS("outline-width", "2px");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
    for (const article of await page.getByTestId("project-changelog-section").all()) {
      expect(await article.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
    }
    await navigateMainView(page, "Главная");
    const main = page.getByTestId("home-page");
    await expect(main).toBeVisible();
    const author = main.getByRole("link", { name: project.author.name, exact: true });
    // Navigation used a pointer; exercise the keyboard focus indicator again.
    await page.keyboard.press("Tab");
    await author.focus();
    await expect(author).toBeFocused();
    await expect(author).toHaveCSS("outline-width", "2px");
    await expect(main.getByTestId("project-version")).toHaveText(project.version);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
    await navigateMainView(page, "Changelog");
    await expect(page.getByTestId("changelog-page")).toBeVisible();
  }
  await page.setViewportSize({ width: 320, height: 740 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
  await navigateMainView(page, "Главная");
  await expect(page.getByTestId("home-page")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
  for (const panel of await page.locator(".home-project-panel").all()) {
    expect(await panel.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
  }
  await navigateMainView(page, "Документация");
  await expect(page.getByRole("heading", { name: "Документация", exact: true })).toBeVisible();
});
