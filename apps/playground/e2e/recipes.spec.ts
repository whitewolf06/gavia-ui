import { expect, test, type Page } from "@playwright/test";
import { wlManifest } from "../../../packages/ui-kit/src/manifest";

async function selectComponent(page: Page, name: string): Promise<void> {
  await page.getByRole("combobox", { name: "Компонент", exact: true }).click();
  await page.getByRole("listbox").getByRole("option", { name, exact: true }).click();
  await expect(page.getByTestId("ds-explorer")).toHaveAttribute("data-component", name);
  await expect(page.locator('[data-testid="ds-example-preview"] > .wl-stack')).toBeVisible();
}
async function recipe(page: Page, id: string) {
  await page.locator(`[data-testid="ds-recipes"] [data-recipe="${id}"]`).first().click();
  const preview = page.getByTestId("ds-recipe-preview");
  await expect(preview).toHaveAttribute("data-recipe", id);
  await expect(preview.locator(":scope > :first-child")).toBeVisible();
  return preview;
}
test.beforeEach(async ({ page }) => {
  await page.goto("/?view=system", { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: "Единый язык интерфейсов" }).waitFor({ state: "visible" });
  // Workflow assertions target settled controls; overlay motion has its own suite.
  await page.addStyleTag({ content: "html { scroll-behavior: auto; }" });
});

for (const category of [...new Set(wlManifest.map((entry) => entry.category))]) {
  test(`all ${category} components have a live example and public copyable source`, async ({ page }) => {
    const entries = wlManifest.filter((item) => item.category === category);
    // Each lazy example needs three settled clicks (open, select, show source).
    // Give the batch time for those actions and startup; assertions stay at 5 s.
    test.setTimeout(Math.max(60_000, 20_000 + entries.length * 15_000));
    const failures: string[] = [];
    page.on("pageerror", (error) => failures.push(error.message));
    for (const entry of entries) {
      await selectComponent(page, entry.name);
      const explorer = page.getByTestId("ds-explorer");
      await explorer.getByText("Показать Vue-код", { exact: true }).click();
      await expect(explorer.locator("pre code")).toContainText('gavia-ui');
      await expect(explorer.locator("pre code")).not.toContainText('v-bind="preview"');
      await expect(explorer.locator("pre code")).not.toContainText("packages/ui-kit");
    }
    expect(failures).toEqual([]);
  });
}

test("state combinations change the real component and copied code; keyboard focus remains visible", async ({ page }) => {
  await selectComponent(page, "WlButton");
  const explorer = page.getByTestId("ds-explorer");
  await explorer.getByLabel("Пример: variant", { exact: true }).selectOption("danger");
  await explorer.getByLabel("Пример: size", { exact: true }).selectOption("lg");
  await explorer.getByLabel("Пример: density", { exact: true }).selectOption("compact");
  await explorer.getByRole("checkbox", { name: "disabled", exact: true }).check();
  const button = page.getByTestId("ds-example-preview").getByRole("button", { name: "Добавить" });
  await expect(button).toBeDisabled();
  await expect(button).toHaveAttribute("data-size", "lg");
  await expect(button).toHaveAttribute("data-variant", "danger");
  await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async (text: string) => { document.documentElement.dataset.copied = text; } } }));
  await explorer.getByRole("button", { name: "Копировать код" }).click();
  await expect(explorer.getByRole("status").last()).toHaveText("Vue-код скопирован.");
  const copied = await page.locator("html").getAttribute("data-copied");
  expect(copied).toContain('"variant":"danger"');
  expect(copied).toContain('"size":"lg"');
  expect(copied).toContain('"density":"compact"');
  expect(copied).toContain('"disabled":true');
  await explorer.getByRole("checkbox", { name: "disabled", exact: true }).uncheck();
  await explorer.getByRole("checkbox", { name: "loading", exact: true }).check();
  await expect(button).toBeDisabled();
  await explorer.getByRole("checkbox", { name: "loading", exact: true }).uncheck();
  // Use real keyboard navigation without depending on the prop controls' order.
  // Enter after a mouse click alone does not switch Firefox's focus heuristic.
  const focusAction = explorer.getByRole("button", { name: "Проверить фокус" });
  await focusAction.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(button).toBeFocused();
  await expect(button).toHaveCSS("outline-width", "2px");
  await page.keyboard.press("Tab");
  await expect(focusAction).toBeFocused();
  await focusAction.press("Enter");
  await expect(button).toBeFocused();
  await expect(button).toHaveCSS("outline-width", "2px");
  await button.press("Enter");
  await expect(page.getByTestId("ds-example-preview").getByRole("status")).toHaveText("Действий: 1");
  await explorer.getByRole("button", { name: "Сбросить пример" }).click();
  await expect(button).toHaveAttribute("data-size", "md");
  await expect(page.getByTestId("ds-example-preview").getByRole("status")).toHaveText("Действий: 0");
});

test("clipboard failure offers selectable manual source and reports no false success", async ({ page }) => {
  await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("Denied"); } } }));
  const explorer = page.getByTestId("ds-explorer");
  await explorer.getByRole("button", { name: "Копировать код" }).click();
  const manual = explorer.getByRole("textbox", { name: "Код для ручного копирования" });
  await expect(manual).toBeVisible();
  await manual.focus();
  expect(await manual.evaluate((element: HTMLTextAreaElement) => element.selectionEnd - element.selectionStart)).toBeGreaterThan(100);
  await expect(explorer.getByRole("status").last()).toContainText("Буфер обмена недоступен");
});

test("material list filters, resets page, creates, edits and confirms deletion", async ({ page }, testInfo) => {
  const preview = await recipe(page, "MaterialList");
  if (testInfo.project.name.includes("mobile")) {
    const widths = await preview.locator(".ds-material-table").evaluate((region) => ({
      localOverflow: region.scrollWidth - region.clientWidth,
      pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
    }));
    expect(widths.localOverflow).toBeGreaterThan(0);
    expect(widths.pageOverflow).toBeLessThanOrEqual(1);
  }
  const search = preview.getByRole("searchbox", { name: "Найти материал" });
  await preview.getByRole("button", { name: "2", exact: true }).click();
  await expect(preview.getByRole("status")).toContainText("страница 2");
  await search.fill("невозможный запрос");
  await expect(preview.getByText("Материалы не найдены", { exact: true })).toBeVisible();
  await expect(preview.getByRole("status")).toContainText("страница 1");
  await preview.getByRole("button", { name: "Сбросить поиск" }).click();
  await expect(search).toHaveValue("");
  if (testInfo.project.name.includes("mobile")) {
    await preview.getByRole("button", { name: /^Фильтры/ }).click();
  }
  const sort = page.getByRole("combobox", { name: "Порядок материалов" });
  await sort.click();
  await page.getByRole("option", { name: "Название Я–А" }).click();
  if (testInfo.project.name.includes("mobile")) await page.getByRole("button", { name: "Применить", exact: true }).click();
  await expect(preview.getByRole("table").getByRole("row").nth(1)).toContainText("Руководство команды");
  await preview.getByRole("button", { name: "Создать материал" }).click();
  let drawer = page.getByRole("dialog", { name: "Новый материал" });
  await drawer.getByRole("button", { name: "Сохранить", exact: true }).click();
  await expect(drawer.getByRole("textbox", { name: "Название", exact: true })).toBeFocused();
  await drawer.getByRole("textbox", { name: "Название", exact: true }).fill("Проверенный материал");
  await drawer.getByRole("button", { name: "Сохранить", exact: true }).click();
  await expect(drawer).toHaveCount(0);
  await search.fill("Проверенный материал");
  await expect(preview.getByRole("table")).toContainText("Проверенный материал");
  await preview.getByRole("button", { name: "Редактировать Проверенный материал", exact: true }).click();
  drawer = page.getByRole("dialog", { name: "Редактирование материала" });
  await drawer.getByRole("textbox", { name: "Название", exact: true }).fill("Новое название");
  await drawer.getByRole("button", { name: "Отмена", exact: true }).click();
  await expect(preview.getByRole("table")).toContainText("Проверенный материал");
  await preview.getByRole("button", { name: "Редактировать Проверенный материал", exact: true }).click();
  await drawer.getByRole("textbox", { name: "Название", exact: true }).fill("Проверенный материал · обновлено");
  await drawer.getByRole("button", { name: "Сохранить", exact: true }).click();
  await expect(drawer).toHaveCount(0);
  await expect(preview.getByRole("table")).toContainText("обновлено");
  await preview.getByRole("button", { name: "Удалить Проверенный материал · обновлено", exact: true }).click();
  const confirm = page.getByRole("dialog", { name: "Удалить материал?" });
  await confirm.getByRole("button", { name: "Отмена", exact: true }).click();
  await expect(confirm).toHaveCount(0);
  await expect(preview.getByRole("table")).toContainText("обновлено");
  await preview.getByRole("button", { name: "Удалить Проверенный материал · обновлено", exact: true }).click();
  await confirm.getByRole("button", { name: "Удалить", exact: true }).click();
  await expect(confirm).toHaveCount(0);
  await expect(preview.getByText("Материалы не найдены", { exact: true })).toBeVisible();
});

test("profile form keeps values after request error and supports retry", async ({ page }) => {
  await page.clock.install();
  const preview = await recipe(page, "ProfileForm");
  await preview.getByRole("button", { name: "Сохранить профиль" }).click();
  await expect(preview.getByRole("textbox", { name: "Имя участника", exact: true })).toBeFocused();
  await preview.getByRole("textbox", { name: "Имя участника", exact: true }).fill("Анна");
  await preview.getByRole("textbox", { name: "Email участника", exact: true }).fill("anna@example.com");
  await preview.getByRole("switch", { name: "Проверить ошибку сохранения" }).check();
  await preview.getByRole("button", { name: "Сохранить профиль" }).click();
  await expect(preview.getByRole("button", { name: "Сохранить профиль" })).toBeDisabled();
  await page.clock.runFor(400);
  await expect(preview.getByRole("alert")).toContainText("Не удалось сохранить");
  await expect(preview.getByRole("textbox", { name: "Имя участника", exact: true })).toHaveValue("Анна");
  await preview.getByRole("button", { name: "Повторить сохранение" }).click();
  await page.clock.runFor(400);
  await expect(preview.getByRole("alert")).toContainText("Профиль сохранён");
  await preview.getByRole("textbox", { name: "Email участника", exact: true }).fill("changed@example.com");
  await expect(preview.getByRole("alert")).toHaveCount(0);
});

test("preferences preserve saved values, cancel drafts and disable dependent controls", async ({ page }) => {
  const preview = await recipe(page, "Preferences");
  const save = preview.getByRole("button", { name: "Сохранить настройки" });
  await expect(save).toBeDisabled();
  await preview.getByRole("switch", { name: "Push-уведомления" }).check();
  await expect(save).toBeEnabled();
  await preview.getByRole("button", { name: "Отменить изменения" }).click();
  await expect(preview.getByRole("switch", { name: "Push-уведомления" })).not.toBeChecked();
  await preview.getByRole("switch", { name: "Email-уведомления" }).uncheck();
  await expect(preview.getByRole("combobox", { name: "Частота уведомлений" })).toHaveAttribute("aria-disabled", "true");
  await save.click();
  await expect(preview.getByRole("alert")).toContainText("Настройки сохранены");
  await expect(save).toBeDisabled();
});

test("detail editing cancels safely, saves and returns focus; tabs work with arrows", async ({ page }) => {
  const preview = await recipe(page, "MaterialDetail");
  const open = preview.getByRole("button", { name: "Редактировать описание" });
  await open.click();
  const dialog = page.getByRole("dialog", { name: "Описание материала" });
  await dialog.getByRole("textbox", { name: "Описание", exact: true }).fill("Черновик");
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(open).toBeFocused();
  await expect(preview).not.toContainText("Черновик");
  await open.click();
  await dialog.getByRole("textbox", { name: "Описание", exact: true }).fill("Обновлённое описание");
  await dialog.getByRole("button", { name: "Сохранить описание" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(preview).toContainText("Обновлённое описание");
  await preview.getByRole("tab", { name: "Обзор" }).press("ArrowRight");
  await expect(preview.getByRole("tab", { name: /История/ })).toBeFocused();
  await expect(preview.getByRole("tabpanel")).toContainText("30 сентября");
});

test("wizard validates, restores earlier values, focuses each step and completes", async ({ page }) => {
  const preview = await recipe(page, "ProjectWizard");
  await preview.getByRole("button", { name: "Продолжить" }).click();
  await expect(preview.getByRole("textbox", { name: "Название проекта", exact: true })).toBeFocused();
  await preview.getByRole("textbox", { name: "Название проекта", exact: true }).fill("Новый проект");
  await preview.getByRole("button", { name: "Продолжить" }).click();
  await expect(preview.getByRole("heading", { name: "Шаг 2: Доступ к проекту" })).toBeFocused();
  await preview.getByRole("radio", { name: "Только я" }).check();
  await preview.getByRole("button", { name: "Назад" }).click();
  await expect(preview.getByRole("textbox", { name: "Название проекта", exact: true })).toHaveValue("Новый проект");
  await preview.getByRole("button", { name: "Продолжить" }).click();
  await expect(preview.getByRole("radio", { name: "Только я" })).toBeChecked();
  await preview.getByRole("button", { name: "Продолжить" }).click();
  await expect(preview).toContainText("Проверка данных");
  await preview.getByRole("button", { name: "Создать проект", exact: true }).click();
  await expect(preview.getByRole("alert")).toContainText("Новый проект · личный");
});

test("attachment upload rejects bad files, supports error/retry and cancels progress", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  const preview = await recipe(page, "AttachmentUpload");
  // Keep the 600 ms upload pending while WebKit scrolls and settles the controls.
  // Only explicit runFor calls should advance the progress demonstration.
  await page.clock.pauseAt(new Date("2026-01-01T01:00:00Z"));
  const upload = preview.getByRole("button", { name: "Загрузить вложения" });
  await expect(upload).toBeDisabled();
  const fileInput = preview.locator('input[type="file"]');
  await fileInput.setInputFiles([{ name: "script.exe", mimeType: "application/octet-stream", buffer: Buffer.from("bad") }, { name: "oversize.pdf", mimeType: "application/pdf", buffer: Buffer.alloc(1048577) }, { name: "guide.txt", mimeType: "text/plain", buffer: Buffer.from("guide") }]);
  await expect(preview.locator(".wl-upload__errors")).toHaveAttribute("role", "alert");
  await expect(preview.locator(".wl-upload__errors")).toContainText("неподдерживаемый тип");
  await expect(preview.locator(".wl-upload__errors")).toContainText("больше");
  await expect(preview.locator(".wl-upload__row")).toHaveCount(1);
  await preview.getByRole("switch", { name: "Проверить ошибку загрузки" }).check();
  await upload.click();
  await expect(preview.getByRole("button", { name: "Удалить guide.txt" })).toBeDisabled();
  await page.clock.runFor(600);
  await expect(preview.getByRole("alert").filter({ hasText: "Загрузка не завершена" })).toBeVisible();
  await preview.getByRole("button", { name: "Повторить загрузку" }).click();
  await page.clock.runFor(600);
  await expect(preview.getByRole("alert").filter({ hasText: "Вложения готовы" })).toBeVisible();
  await expect(preview.locator(".wl-upload__row")).toHaveCount(1);
  await preview.getByRole("button", { name: "Удалить guide.txt" }).click();
  await fileInput.setInputFiles({ name: "again.txt", mimeType: "text/plain", buffer: Buffer.from("again") });
  await upload.click();
  await page.clock.runFor(300);
  await expect(preview.getByRole("progressbar", { name: "Загрузка вложений" })).toHaveAttribute("aria-valuenow", "50");
  await preview.getByRole("button", { name: "Отменить загрузку" }).click();
  await page.clock.runFor(600);
  await expect(upload).toBeEnabled();
  await expect(preview.getByRole("progressbar")).toHaveCount(0);
  await expect(preview.getByRole("button", { name: "Отменить загрузку" })).toHaveCount(0);
  await expect(preview.getByRole("alert")).toHaveCount(0);
  await expect(preview.locator(".wl-upload__row")).toHaveCount(1);
});

test("long content fits 320px, 200% text; nested overlays close from the top and return focus", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  const stress = page.getByTestId("ds-stress");
  const title = stress.locator(".wl-page-header__title");
  await expect(title).toBeVisible();
  const originalSize = await title.evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
  // Tokens use px, so changing html font-size alone would not enlarge this text.
  await stress.evaluate((root) => {
    const values = [...root.querySelectorAll<HTMLElement>("*")].map((element) => {
      const style = getComputedStyle(element);
      return { element, size: parseFloat(style.fontSize), line: parseFloat(style.lineHeight) };
    });
    for (const { element, size, line } of values) {
      element.style.fontSize = `${size * 2}px`;
      if (Number.isFinite(line)) element.style.lineHeight = `${line * 2}px`;
    }
  });
  await expect(title).toHaveCSS("font-size", `${originalSize * 2}px`);
  await stress.scrollIntoViewIfNeeded();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const overflowDetails = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>("body *")]
    .filter((element) => getComputedStyle(element).visibility !== "hidden" && !element.closest("details:not([open]), .ds-table-scroll, .ds-stress-table") && element.getBoundingClientRect().right > document.documentElement.clientWidth)
    .slice(0, 8).map((element) => ({ class: element.className, text: element.textContent?.slice(0, 60), right: element.getBoundingClientRect().right })));
  expect(overflow, JSON.stringify(overflowDetails)).toBeLessThanOrEqual(1);
  const open = stress.getByRole("button", { name: "Вложенные оверлеи" });
  await open.click();
  const drawer = page.getByRole("dialog", { name: "Контекст материала" });
  await expect(drawer).toBeVisible();
  const innerOpen = drawer.getByRole("button", { name: "Открыть вложенный диалог" });
  await innerOpen.click();
  const dialog = page.getByRole("dialog", { name: "Вложенное действие" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(drawer).toBeVisible();
  await expect(innerOpen).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(drawer).toHaveCount(0);
  await expect(open).toBeFocused();
});
