import { expect, test, type Page } from "@playwright/test";

async function selectPicker(page: Page, name: "WlTimePicker" | "WlFilePicker") {
  await page.getByRole("combobox", { name: "Компонент", exact: true }).click();
  await page.getByRole("listbox").getByRole("option", { name, exact: true }).click();
  const explorer = page.getByTestId("ds-explorer");
  await expect(explorer).toHaveAttribute("data-component", name);
  const preview = page.getByTestId("ds-example-preview");
  await expect(preview.locator(":scope > .wl-stack")).toBeVisible();
  return { explorer, preview };
}

test.beforeEach(async ({ page }) => {
  await page.goto("/?view=system", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Единый язык интерфейсов" })).toBeVisible({ timeout: 15000 });
  await page.addStyleTag({ content: "html { scroll-behavior: auto; }" });
});

test("time picker uses its labelled native input for keyboard focus and minute precision", async ({ page }) => {
  const { explorer, preview } = await selectPicker(page, "WlTimePicker");
  const input = preview.getByLabel("Время встречи", { exact: true });
  const root = preview.locator('[data-wl="time-picker"]');
  await expect(input).toHaveAttribute("type", "time");
  await expect(input).toHaveAttribute("step", "60");
  await expect(root).not.toHaveAttribute("id", "example-time");
  const hintId = await input.getAttribute("aria-describedby");
  expect(hintId).toBeTruthy();
  await expect(preview.locator(`[id="${hintId}"]`)).toContainText("С 08:00 до 18:00");

  await preview.locator('label[for="example-time"]').click();
  await expect(input).toBeFocused();
  const focusTimeViaKeyboard = async () => {
    await explorer.getByRole("button", { name: "Проверить фокус", exact: true }).focus();
    await page.keyboard.press("Shift+Tab");
    await expect(input).toBeFocused();
  };
  await focusTimeViaKeyboard();
  // Native time segments differ in :focus-visible heuristics; the control must still show its focus ring.
  await expect(input).not.toHaveCSS("box-shadow", "none");
  const normalRing = await input.evaluate((element) => {
    const expected = document.createElement("span").style;
    expected.boxShadow = getComputedStyle(element).getPropertyValue("--wl-focus-ring");
    return expected.boxShadow;
  });
  expect(normalRing).not.toBe("");
  expect(normalRing).not.toBe("none");
  await expect(input).toHaveCSS("box-shadow", normalRing);

  const invalid = explorer.getByRole("checkbox", { name: "invalid", exact: true });
  await invalid.check();
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await focusTimeViaKeyboard();
  const dangerFocus = await input.evaluate((element) => {
    const theme = getComputedStyle(element);
    const expected = document.createElement("span").style;
    expected.color = theme.getPropertyValue("--wl-danger");
    expected.boxShadow = theme.getPropertyValue("--wl-focus-ring-danger");
    return { border: expected.color, shadow: expected.boxShadow };
  });
  expect(dangerFocus.border).not.toBe("");
  expect(dangerFocus.shadow).not.toBe("");
  expect(dangerFocus.shadow).not.toBe("none");
  await expect(input).toHaveCSS("border-color", dangerFocus.border);
  await expect(input).toHaveCSS("box-shadow", dangerFocus.shadow);

  await invalid.uncheck();
  await expect(input).not.toHaveAttribute("aria-invalid", "true");
  await focusTimeViaKeyboard();
  await expect(input).toHaveCSS("box-shadow", normalRing);

  await input.fill("12:34");
  await input.press("Enter");
  await expect(input).toHaveValue("12:34");
  await expect(preview.getByRole("status")).toHaveText("Выбрано: 12:34");
});

test("time picker accepts exact bounds, restores out-of-range drafts on Enter or blur and clears to null", async ({ page }) => {
  const { explorer, preview } = await selectPicker(page, "WlTimePicker");
  const input = preview.getByLabel("Время встречи", { exact: true });
  const status = preview.getByRole("status");
  await expect(input).toHaveAttribute("min", "08:00");
  await expect(input).toHaveAttribute("max", "18:00");
  await input.fill("08:00");
  await expect(status).toHaveText("Выбрано: 08:00");
  await input.fill("18:00");
  await expect(status).toHaveText("Выбрано: 18:00");

  await input.fill("07:59");
  await expect(status).toHaveText("Выбрано: 18:00");
  await input.press("Enter");
  await expect(input).toHaveValue("18:00");
  await input.fill("18:01");
  await expect(status).toHaveText("Выбрано: 18:00");
  await explorer.getByRole("button", { name: "Проверить фокус", exact: true }).focus();
  await expect(input).toHaveValue("18:00");

  await input.fill("");
  await expect(status).toHaveText("Выбрано: время не задано");
  await expect(input).toHaveValue("");
});

test("disabled time picker stays out of keyboard focus and resumes without losing its model", async ({ page }) => {
  const { explorer, preview } = await selectPicker(page, "WlTimePicker");
  const input = preview.getByLabel("Время встречи", { exact: true });
  const disabled = explorer.getByRole("checkbox", { name: "disabled", exact: true });
  await disabled.check();
  await expect(input).toBeDisabled();
  await explorer.getByRole("button", { name: "Проверить фокус", exact: true }).focus();
  await page.keyboard.press("Shift+Tab");
  await expect(input).not.toBeFocused();
  await input.evaluate((element: HTMLInputElement) => element.focus());
  await expect(input).not.toBeFocused();
  await expect(preview.getByRole("status")).toHaveText("Выбрано: 09:30");

  await disabled.uncheck();
  await expect(input).toBeEnabled();
  await expect(input).toHaveValue("09:30");
  await input.fill("10:15");
  await expect(preview.getByRole("status")).toHaveText("Выбрано: 10:15");
});

test("file picker opens from Enter and Space while the native input remains hidden and outside tab order", async ({ page }) => {
  const { preview } = await selectPicker(page, "WlFilePicker");
  const button = preview.getByRole("button", { name: "Выбрать файлы", exact: true });
  const input = preview.locator('input[type="file"]');
  await expect(input).toBeHidden();
  await expect(input).toHaveAttribute("tabindex", "-1");
  await expect(input).toHaveAttribute("accept", ".pdf,.txt");
  await expect(input).toHaveJSProperty("multiple", true);

  for (const key of ["Enter", "Space"]) {
    await button.focus();
    const opened = page.waitForEvent("filechooser");
    await button.press(key);
    const chooser = await opened;
    expect(chooser.isMultiple()).toBe(true);
    expect(await chooser.element().getAttribute("type")).toBe("file");
    await chooser.setFiles([]);
    await expect(button).toBeFocused();
  }
  await expect(input).toHaveValue("");
  await expect(preview.getByRole("button", { name: "Очистить список приложения", exact: true })).toHaveCount(0);
});

test("file picker resets native selection so the application can select the same raw file again", async ({ page }) => {
  const { preview } = await selectPicker(page, "WlFilePicker");
  const button = preview.getByRole("button", { name: "Выбрать файлы", exact: true });
  const input = preview.locator('input[type="file"]');
  const sameFile = { name: "same.txt", mimeType: "text/plain", buffer: Buffer.from("same contents") };

  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt) {
      await preview.getByRole("button", { name: "Очистить список приложения", exact: true }).click();
      await expect(preview.getByRole("status")).toHaveText("Можно выбрать файлы повторно.");
    }
    const opened = page.waitForEvent("filechooser");
    await button.click();
    await (await opened).setFiles(sameFile);
    await expect(preview.getByRole("status")).toHaveText("Выбрано: same.txt");
    await expect(input).toHaveValue("");
    expect(await input.evaluate((element: HTMLInputElement) => element.files?.length)).toBe(0);
    await expect(preview.getByRole("button", { name: "Очистить список приложения", exact: true })).toBeVisible();
  }
});

test("file picker cancel preserves the application list and disabled state blocks activation and selection events", async ({ page }) => {
  const { explorer, preview } = await selectPicker(page, "WlFilePicker");
  const input = preview.locator('input[type="file"]');
  const button = preview.getByRole("button", { name: "Выбрать файлы", exact: true });
  const file = { name: "kept.txt", mimeType: "text/plain", buffer: Buffer.from("kept contents") };
  await input.setInputFiles(file);
  await expect(preview.getByRole("status")).toHaveText("Выбрано: kept.txt");

  // Playwright intercepts file choice but cannot cancel an OS dialog. Exercise the
  // browser DOM cancel path here; actual OS-dialog cancellation remains manual QA.
  await input.dispatchEvent("cancel");
  await expect(preview.getByRole("status")).toHaveText("Выбор отменён; список сохранён.");
  await expect(preview.getByRole("button", { name: "Очистить список приложения", exact: true })).toBeVisible();
  await input.setInputFiles(file);
  await expect(preview.getByRole("status")).toHaveText("Выбрано: kept.txt");

  await explorer.getByRole("checkbox", { name: "disabled", exact: true }).check();
  await expect(button).toBeDisabled();
  await expect(input).toBeDisabled();
  await input.evaluate((element: HTMLInputElement) => {
    element.dataset.clicks = "0";
    element.addEventListener("click", () => {
      element.dataset.clicks = String(Number(element.dataset.clicks) + 1);
    });
  });
  await button.evaluate((element: HTMLButtonElement) => element.click());
  await expect(input).toHaveAttribute("data-clicks", "0");
  await input.setInputFiles({ name: "ignored.txt", mimeType: "text/plain", buffer: Buffer.from("ignored") });
  await input.dispatchEvent("cancel");
  await expect(preview.getByRole("status")).toHaveText("Выбрано: kept.txt");
  await expect(input).toHaveValue("");
});
