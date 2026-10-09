import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { consumerSource } from "../../../scripts/example-source.mjs";
import { chooseShowcaseLanguage, copyCodePanel, nativeReload } from "./select-helpers";

const englishExamples = JSON.parse(readFileSync(new URL("../src/i18n/messages/examples.en.json", import.meta.url), "utf8")) as Record<string, string>;
const russianExamples = JSON.parse(readFileSync(new URL("../src/i18n/messages/examples.ru.json", import.meta.url), "utf8")) as Record<string, string>;

const variantSource = readFileSync(new URL("../src/documentation/button/Variants.vue", import.meta.url), "utf8");

test("unqualified URLs open English UI, and keyboard language selection preserves focus", async ({ page, baseURL }) => {
  const url = new URL(baseURL ?? "http://127.0.0.1:4173/");
  url.search = "";
  url.hash = "";
  await page.goto(url.href);
  await expect(page.getByTestId("home-page")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  expect(new URL(page.url()).searchParams.get("lang")).toBeNull();
  await page.locator(".pg-top").getByRole("button", { name: "Search", exact: true }).click();
  const palette = page.getByRole("dialog", { name: "Command palette", exact: true });
  await expect(palette).toBeVisible();
  await expect(palette.getByRole("combobox", { name: "Command palette", exact: true })).toHaveAttribute("placeholder", "Search or navigate…");
  await expect(palette.getByText("Documentation", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(palette).toHaveCount(0);
  const language = page.getByTestId("pg-language-selector");
  await expect(language).toContainText("EN");
  await language.focus();
  await language.press("ArrowDown");
  const choices = page.getByRole("listbox");
  await expect(choices.getByRole("option")).toHaveText(["EN", "RU"]);
  await expect(choices.getByRole("option", { selected: true })).toHaveText("EN");
  await language.press("Home");
  await language.press("ArrowDown");
  await language.press("Escape");
  await expect(choices).toHaveCount(0);
  await expect(language).toBeFocused();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await language.press("ArrowDown");
  await language.press("End");
  await language.press("Enter");
  await expect(choices).toHaveCount(0);
  await expect(language).toBeFocused();
  await expect(language).toContainText("RU");
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  expect(new URL(page.url()).searchParams.get("lang")).toBe("ru");
  await language.press("ArrowDown");
  await language.press("Home");
  await language.press("Enter");
  await expect(choices).toHaveCount(0);
  await expect(language).toBeFocused();
  await expect(language).toContainText("EN");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  expect(new URL(page.url()).searchParams.get("lang")).toBe("en");
});

test("the language selector preserves deep routes, themes and anchors through reload and history, with standalone code in both languages", async ({ page, baseURL }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const url = new URL(baseURL ?? "http://127.0.0.1:4173/");
  url.search = new URLSearchParams({ view: "docs", component: "WlButton", theme: "gavia-dark", example: "variants" }).toString();
  url.hash = "docs-button-controls-title";
  await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: async (source: string) => { document.documentElement.dataset.localeCopied = source; } }
  }));
  await page.goto(url.href, { waitUntil: "domcontentloaded" });
  const workspace = page.getByTestId("docs-page").locator('[data-docs-component="WlButton"]');
  async function expectLanguage(language: "en" | "ru", explicit = true): Promise<void> {
    await workspace.waitFor({ state: "visible" });
    await expect(page.locator("html")).toHaveAttribute("lang", language);
    await expect(page.locator("html")).toHaveAttribute("data-wl-theme", "gavia-dark");
    await expect(workspace.getByRole("tab", { name: language === "en" ? "Examples" : "Примеры", exact: true })).toHaveAttribute("aria-selected", "true");
    const location = new URL(page.url());
    expect(location.pathname).toBe(url.pathname);
    expect(location.searchParams.get("view")).toBe("docs");
    expect(location.searchParams.get("component")).toBe("WlButton");
    expect(location.searchParams.get("theme")).toBe("gavia-dark");
    expect(location.searchParams.get("example")).toBe("variants");
    expect(location.searchParams.get("lang")).toBe(explicit ? language : null);
    expect(location.hash).toBe(url.hash);
  }
  async function expectCopiedSource(language: "en" | "ru"): Promise<void> {
    const example = workspace.locator('[data-docs-button-example="variants"]');
    await expect(example.getByTestId("docs-button-example-preview").getByRole("button", { name: language === "en" ? "Create" : "Создать", exact: true })).toBeVisible();
    const panel = example.getByTestId("docs-button-example-source");
    await panel.locator("summary").click();
    const expected = consumerSource(variantSource, {}, language === "en" ? englishExamples : russianExamples);
    await expect(panel.locator("pre code")).toHaveText(expected);
    expect(expected).toContain('from "gavia-ui"');
    expect(expected).not.toContain("usePlaygroundI18n");
    expect(expected).not.toContain("examples.");
    await copyCodePanel(panel, language === "en" ? "Copy code" : "Копировать код");
    await expect(page.locator("html")).toHaveAttribute("data-locale-copied", expected);
    await expect(panel.getByRole("status")).toHaveText(language === "en" ? "Code copied." : "Код скопирован.");
  }
  await expectLanguage("en", false);
  await expectCopiedSource("en");
  await chooseShowcaseLanguage(page, "ru");
  await expectLanguage("ru");
  await expectCopiedSource("ru");
  await chooseShowcaseLanguage(page, "en");
  await expectLanguage("en");
  await nativeReload(page);
  await expectLanguage("en");
  await page.goBack();
  await expectLanguage("ru");
  await page.goForward();
  await expectLanguage("en");
  expect(errors).toEqual([]);
});
