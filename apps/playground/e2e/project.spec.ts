import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { fileURLToPath, URL as NodeURL } from "node:url";
const packageMetadata = JSON.parse(readFileSync(fileURLToPath(new NodeURL("../../../packages/ui-kit/package.json", import.meta.url)), "utf8")) as {
  version: string;
  author: { name: string; url: string };
};
const project = {
  ...packageMetadata,
  documentationBaseUrl: "https://github.com/whitewolf06/gavia-ui/blob/main/",
  licenseUrl: "https://github.com/whitewolf06/gavia-ui/blob/main/LICENSE",
  instructionsUrl: "https://github.com/whitewolf06/gavia-ui/blob/main/README.md",
  npmPublished: false
};
import { parseChangelog } from "../src/project/changelog";
import type { ChangelogInline } from "../src/project/changelog";

const history = parseChangelog(
  readFileSync(fileURLToPath(new NodeURL("../../../CHANGELOG.md", import.meta.url)), "utf8"),
  project.documentationBaseUrl
);
const inlineText = (content: ChangelogInline[]): string => content.map((part) => part.kind === "link" ? part.label : part.value).join("");

test.beforeEach(async ({ page }) => {
  await page.goto("/?view=project");
  // The project page is a lazy chunk; its main appears after the initial load.
  await expect(page.locator(".project-main")).toBeVisible();
});

test("shows the creator, current source version, license and truthful package status", async ({ page }) => {
  const main = page.locator(".project-main");
  await expect(main.getByRole("heading", { level: 1 })).toHaveText("Интерфейсы с ясным характером");
  await expect(page.locator(".pg-views [aria-current='page']")).toHaveText("О проекте");
  await expect(main.getByRole("link", { name: project.author.name, exact: true })).toHaveAttribute("href", project.author.url);
  await expect(main.getByTestId("project-version")).toHaveText(project.version);
  await expect(main.getByRole("link", { name: "MIT", exact: true })).toHaveAttribute("href", project.licenseUrl);
  await expect(main.getByRole("link", { name: "Подключение и инструкции", exact: true })).toHaveAttribute("href", project.instructionsUrl);
  if (!project.npmPublished) await expect(main.getByTestId("project-npm-status")).toContainText("ещё не опубликован");
  await expect(page.locator(".pg-footer")).toContainText(`Создатель: ${project.author.name}`);
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
  await page.goto("/?view=system");
  await expect(page.getByRole("heading", { name: "Единый язык интерфейсов", exact: true })).toBeVisible();
  await page.locator(".pg-views").getByRole("button", { name: "О проекте", exact: true }).click();
  await expect(page).toHaveURL(/\?view=project$/);
  await expect(page.locator(".project-main")).toBeVisible();
  await page.getByRole("link", { name: "История изменений", exact: true }).click();
  await expect(page).toHaveURL(/\?view=project#project-changelog$/);
  await expect(page.getByRole("heading", { name: "История изменений", exact: true })).toBeInViewport();
  const release = history.sections.find((section) => section.version)!;
  await page.getByRole("navigation", { name: "Версии в истории изменений" }).getByRole("link", { name: release.title, exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`#${release.id}$`));
  await page.reload();
  await expect(page.locator(".project-main")).toBeVisible();
  await expect(page.locator(`#${release.id}-title`)).toBeInViewport();
  await page.locator(".pg-views").getByRole("button", { name: "Дизайн-система", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Единый язык интерфейсов", exact: true })).toBeVisible();
  await page.goBack();
  await expect(page.locator(".project-main")).toBeVisible();
  await expect(page.locator(".pg-views [aria-current='page']")).toHaveText("О проекте");
  await expect(page.locator(`#${release.id}-title`)).toBeInViewport();
});

test("keeps project information readable and keyboard focus visible in all three themes", async ({ page }) => {
  for (const theme of ["White", "Graphite", "Newspaper"]) {
    await page.locator(".pg-theme").getByText(theme, { exact: true }).click();
    const author = page.locator(".project-main").getByRole("link", { name: project.author.name, exact: true });
    // Enter keyboard mode from a known control before focusing the link.
    // This keeps the focus assertions independent of browser link-navigation settings.
    await page.locator(".pg-top").getByRole("button", { name: /^Поиск/ }).focus();
    await page.keyboard.press("Tab");
    await author.focus();
    await expect(author).toBeFocused();
    await expect(author).toHaveCSS("outline-width", "2px");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
    for (const article of await page.getByTestId("project-changelog-section").all()) {
      expect(await article.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
    }
    await expect(page.getByTestId("project-version")).toHaveText(project.version);
  }
  await page.setViewportSize({ width: 320, height: 740 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
  await page.locator(".pg-views").getByRole("button", { name: "Компоненты", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Компоненты", exact: true })).toBeVisible();
});
