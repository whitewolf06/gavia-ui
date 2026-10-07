import { wlDesignThemes } from "../../../packages/ui-kit/src/design-system/tokens.generated";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { fileURLToPath, URL as NodeURL } from "node:url";
import { wlManifest } from "../../../packages/ui-kit/src/manifest";
import { consumerSource } from "../src/design-system/code";
import { chooseShowcaseTheme, copyCodePanel } from "./select-helpers";

const buttonManifest = wlManifest.find((entry) => entry.name === "WlButton")!;
const sourceFiles = {
  variants: "Variants.vue", sizes: "Sizes.vue", states: "States.vue",
  slots: "Slots.vue", form: "Form.vue"
} as const;
type ExampleName = keyof typeof sourceFiles;
const errors = new WeakMap<Page, string[]>();

function workspace(page: Page): Locator {
  return page.getByTestId("docs-page").locator('[data-docs-component="WlButton"]');
}
function example(page: Page, name: ExampleName): Locator {
  return workspace(page).locator('[data-docs-button-example="' + name + '"]');
}
function preview(page: Page, name: ExampleName): Locator {
  return example(page, name).getByTestId("docs-button-example-preview");
}
function canonicalSource(name: ExampleName): string {
  return consumerSource(readFileSync(fileURLToPath(new NodeURL("../src/documentation/button/" + sourceFiles[name], import.meta.url)), "utf8"));
}
async function openDocumentation(page: Page, baseURL?: string): Promise<void> {
  const url = new URL(baseURL ?? "http://127.0.0.1:4173/");
  url.search = "?view=docs&component=WlButton";
  url.hash = "";
  await page.goto(url.href, { waitUntil: "domcontentloaded" });
  await expect(workspace(page).getByRole("tab", { name: "Примеры", exact: true })).toHaveAttribute("aria-selected", "true");
  await expect(workspace(page).locator("[data-docs-button-example]")).toHaveCount(5);
}
async function fillRatio(button: Locator): Promise<number> {
  return button.evaluate((element) => element.getBoundingClientRect().width / element.parentElement!.getBoundingClientRect().width);
}

test.beforeEach(async ({ page }) => {
  const messages: string[] = [];
  errors.set(page, messages);
  page.on("pageerror", (error) => messages.push(error.message));
});
test.afterEach(async ({ page }) => {
  expect(errors.get(page), "WlButton examples must not introduce runtime errors").toEqual([]);
});

test("button comparisons cover manifest variants and sizes, and every copied example is its canonical SFC", async ({ page, baseURL }) => {
  await openDocumentation(page, baseURL);
  const variants = preview(page, "variants");
  const variantButtons = variants.locator('button[data-wl="button"]');
  await expect(variantButtons).toHaveCount(buttonManifest.props.find((prop) => prop.name === "variant")!.values!.length);
  expect(await variantButtons.evaluateAll((buttons) => buttons.map((button) => button.getAttribute("data-variant"))))
    .toEqual(buttonManifest.props.find((prop) => prop.name === "variant")!.values);
  await variants.getByRole("button", { name: "Создать", exact: true }).click();
  await expect(variants.getByRole("status")).toHaveText("Последнее действие: Создать");

  const sizes = preview(page, "sizes");
  for (const density of ["default", "compact"]) {
    const row = sizes.locator('[data-button-density="' + density + '"]');
    await expect(row).toBeVisible();
    const buttons = row.locator('button[data-wl="button"]');
    expect(await buttons.evaluateAll((nodes) => nodes.map((button) => button.getAttribute("data-size"))))
      .toEqual(buttonManifest.props.find((prop) => prop.name === "size")!.values);
    for (const button of await buttons.all()) await expect(button).toHaveAttribute("data-density", density);
  }
  const normalHeight = await sizes.locator('[data-button-density="default"] button[data-size="md"]').evaluate((button) => button.getBoundingClientRect().height);
  const compactHeight = await sizes.locator('[data-button-density="compact"] button[data-size="md"]').evaluate((button) => button.getBoundingClientRect().height);
  expect(compactHeight).toBeLessThan(normalHeight);
  await sizes.getByRole("checkbox", { name: "Показать компактную плотность", exact: true }).uncheck();
  await expect(sizes.locator('[data-button-density="compact"]')).toHaveCount(0);
  await sizes.getByRole("checkbox", { name: "Показать компактную плотность", exact: true }).check();

  await page.evaluate(() => Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: async (source: string) => { document.documentElement.dataset.buttonExampleCopied = source; } }
  }));
  for (const name of Object.keys(sourceFiles) as ExampleName[]) {
    const section = example(page, name);
    await expect(section.getByTestId("docs-button-example-heading-" + name)).toBeVisible();
    const panel = section.getByTestId("docs-button-example-source");
    await panel.locator("summary").click();
    const code = panel.locator("pre code");
    await expect(code).toBeVisible();
    const expectedSource = canonicalSource(name);
    expect(await code.textContent(), name + " rendered source").toBe(expectedSource);
    expect((await code.locator(".ds-code-token").allTextContents()).join(""), name + " highlighted source").toBe(expectedSource);
    expect(expectedSource).toContain('from "gavia-ui"');
    expect(expectedSource).not.toContain("packages/ui-kit");
    await copyCodePanel(panel);
    await expect(panel.getByRole("status")).toHaveText("Код скопирован.");
    await expect(page.locator("html")).toHaveAttribute("data-button-example-copied", expectedSource);
  }
});

test("button states, slot layouts and native form actions remain interactive and accessible", async ({ page, baseURL }) => {
  await openDocumentation(page, baseURL);
  const states = preview(page, "states");
  await expect(states.getByRole("button", { name: "Недоступно", exact: true })).toBeDisabled();
  const fixedLoading = states.getByRole("button", { name: "Сохранение…", exact: true });
  await expect(fixedLoading).toBeDisabled();
  await expect(fixedLoading).toHaveAttribute("aria-busy", "true");
  const save = states.locator('button[aria-describedby="button-saving-reason"]');
  const noAccess = states.getByRole("checkbox", { name: "Нет прав на сохранение", exact: true });
  await noAccess.check();
  await expect(save).toBeDisabled();
  await expect(states.locator("#button-saving-reason")).toContainText("права на редактирование");
  await noAccess.uncheck();
  await save.focus();
  await save.press("Enter");
  await expect(save).toBeDisabled();
  await expect(save).toHaveAttribute("aria-busy", "true");
  await expect(save.locator(".wl-btn__spinner")).toHaveCount(1);
  await expect(save.locator('[data-wl="icon"]')).toHaveCount(0);
  await states.getByRole("button", { name: "Завершить сохранение", exact: true }).click();
  await expect(save).toBeEnabled();
  await expect(save).not.toHaveAttribute("aria-busy", "true");
  await expect(states.getByRole("status")).toContainText("Сохранение завершено. Сохранений: 1.");
  await save.click();
  await states.getByRole("button", { name: "Отменить загрузку", exact: true }).click();
  await expect(save).toBeEnabled();
  await expect(states.getByRole("status")).toContainText("Загрузка отменена");
  await expect(states.getByRole("status")).toContainText("Сохранений: 1.");

  const slots = preview(page, "slots");
  const leftIcon = slots.getByRole("button", { name: "Новая задача", exact: true });
  await expect(leftIcon.locator(':scope > svg[data-icon="plus"]')).toHaveCount(1);
  await expect(slots.getByRole("button", { name: "Продолжить", exact: true }).locator('.wl-btn__label svg[data-icon="arrow-right"]')).toHaveCount(1);
  const iconOnly = slots.getByRole("button", { name: "Удалить черновик", exact: true });
  await expect(iconOnly).toHaveAccessibleName("Удалить черновик");
  await expect(iconOnly.locator(".wl-btn__label")).toHaveCount(0);
  await iconOnly.focus();
  await iconOnly.press("Space");
  await expect(slots.getByRole("status")).toHaveText("Последнее действие: Черновик удалён");
  const messages = slots.locator('button[data-variant="soft"]');
  await expect(messages).toHaveAccessibleName(/Сообщения.*3/);
  await messages.click();
  await expect(messages).toHaveAccessibleName(/Сообщения.*0/);
  await expect(slots.getByRole("status")).toHaveText("Последнее действие: Сообщения прочитаны");

  const formPreview = preview(page, "form");
  const form = formPreview.getByRole("form", { name: "Создание проекта", exact: true });
  const title = form.getByRole("textbox", { name: "Название проекта", exact: true });
  const submit = form.getByRole("button", { name: "Создать проект", exact: true });
  const ordinary = form.getByRole("button", { name: "Проверить черновик", exact: true });
  await expect(ordinary).toHaveAttribute("type", "button");
  await expect(submit).toHaveAttribute("type", "submit");
  await expect.poll(() => fillRatio(submit)).toBeCloseTo(1, 2);
  await ordinary.click();
  await expect(formPreview.getByRole("status")).toContainText("Отправок: 0. Проверок черновика: 1.");
  await submit.click();
  await expect(title).toBeFocused();
  expect(await title.evaluate((element) => (element as HTMLInputElement).validity.valueMissing)).toBe(true);
  await expect(formPreview.getByRole("status")).toContainText("Отправок: 0.");
  await title.fill("Проект документации");
  await submit.click();
  await expect(formPreview.getByRole("status")).toContainText("Создан проект «Проект документации». Отправок: 1.");
  await formPreview.getByRole("checkbox", { name: "Кнопка отправки на всю ширину", exact: true }).uncheck();
  await expect.poll(() => fillRatio(submit)).toBeLessThan(0.9);
  await form.getByRole("button", { name: "Сбросить форму", exact: true }).click();
  await expect(title).toHaveValue("");
  await expect(formPreview.getByRole("status")).toHaveText("Форма очищена. Отправок: 1. Проверок черновика: 1.");
});

test("all button comparisons fit 320px and inherit each shipped theme", async ({ page, baseURL }) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await openDocumentation(page, baseURL);
  for (const theme of wlDesignThemes.map((theme) => theme.label)) {
    await chooseShowcaseTheme(page, theme);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    for (const name of Object.keys(sourceFiles) as ExampleName[]) {
      const live = preview(page, name);
      await expect(live).toBeVisible();
      await expect.poll(() => live.evaluate((element) => element.scrollWidth - element.clientWidth), theme + " " + name + " preview has no horizontal overflow").toBeLessThanOrEqual(1);
    }
    const primary = preview(page, "variants").getByRole("button", { name: "Создать", exact: true });
    const contrast = await primary.evaluate((element) => {
      const style = getComputedStyle(element);
      return { foreground: style.color, background: style.backgroundColor };
    });
    expect(contrast.foreground, theme + " primary button has distinct text and background").not.toBe(contrast.background);
    await expect(preview(page, "sizes").locator('[data-button-density="compact"]')).toBeVisible();
  }
});
