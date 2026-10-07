import { wlDesignThemes } from "../../../packages/ui-kit/src/design-system/tokens.generated";
import { expect, test, type Page } from "@playwright/test";
import { chooseShowcaseTheme, chooseDropdownOption } from "./select-helpers";
import { readFileSync } from "node:fs";
import { WL_ICON_NAMES } from "../../../packages/ui-kit/src/icons.generated";

const uiKitVersion = (JSON.parse(readFileSync(
  new URL("../../../packages/ui-kit/package.json", import.meta.url), "utf8"
)) as { version: string }).version;

test.beforeEach(async ({ page }) => {
  await page.goto("/e2e.html");
  await expect(page.getByRole("heading", { name: "Gavia UI regression" })).toBeVisible();
});

async function openDialogMotion(page: Page, buttonId: string) {
  return page.locator(buttonId).evaluate(async (button) => {
    (button as HTMLButtonElement).click();
    await Promise.resolve();
    const mask = document.querySelector(".wl-dialog-mask");
    const value = mask ? getComputedStyle(mask).transitionDuration.split(",")[0]!.trim() : "0s";
    return {
      classes: mask?.className ?? "",
      duration: Number.parseFloat(value) * (value.endsWith("ms") ? 0.001 : 1)
    };
  });
}

async function openDialogClasses(page: Page, buttonId: string): Promise<string> {
  return (await openDialogMotion(page, buttonId)).classes;
}

test("selection controls keep values and keyboard behavior", async ({ page }) => {
  const select = page.getByRole("combobox", { name: "Выбор", exact: true });
  await select.focus();
  await select.press("ArrowDown");
  await expect(page.getByRole("listbox")).toBeVisible();
  await select.press("Enter");
  await expect(page.locator("#select-value")).toHaveText("a");
  await select.click();
  await page.getByRole("option", { name: "Бета" }).click();
  await expect(page.locator("#select-value")).toHaveText("b");

  await page.getByRole("combobox", { name: "Множественный выбор" }).click();
  await page.getByRole("option", { name: "Альфа" }).click();
  await expect(page.locator("#multi-value")).toHaveText("a");
  await page.getByRole("searchbox", { name: "Фильтр" }).fill("Бе");
  await page.locator(".wl-multiselect-overlay").getByRole("option", { name: "Бета" }).click();
  await expect(page.locator("#multi-value")).toHaveText("a,b");
  await page.getByRole("button", { name: "Удалить Альфа" }).click();
  await expect(page.locator("#multi-value")).toHaveText("b");

  await page.getByRole("combobox", { name: "Подсказки" }).fill("Бе");
  await page.locator(".wl-autocomplete-overlay").getByRole("option", { name: "Бета" }).click();
  await expect(page.locator("#auto-value")).toHaveText("b");
});

test("date picker keeps ISO model and honours text entry", async ({ page }) => {
  const input = page.getByRole("textbox", { name: "Дата" });
  await input.click();
  const day = page.locator(".wl-dp__day:not(.is-muted):not(.is-disabled)").first();
  const iso = await day.getAttribute("aria-label");
  await day.click();
  await expect(page.locator("#date-value")).toHaveText(iso ?? "");
  await input.fill("15.03.2026");
  await input.press("Enter");
  await expect(page.locator("#date-value")).toHaveText("2026-03-15");
  await input.click();
  await page.getByRole("button", { name: "Выбрать год, сейчас 2026" }).click();
  await page.getByRole("button", { name: "2026", exact: true }).click();
  await page.getByRole("button", { name: "Март", exact: true }).click();
  await page.locator('.wl-dp__day[aria-label="2026-03-16"]').click();
  await expect(page.locator("#date-value")).toHaveText("2026-03-16");
});

test("dialog, drawer, menu and popover open and close", async ({ page }) => {
  await page.locator("#dialog-open").focus();
  await page.locator("#dialog-open").press("Enter");
  await expect(page.getByRole("dialog", { name: "Проверка диалога" })).toBeVisible();
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Проверка диалога" })).toHaveCount(0);
  await expect(page.locator("#dialog-open")).toBeFocused();

  await page.locator("#drawer-open").click();
  await expect(page.getByRole("dialog", { name: "Проверка панели" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Проверка панели" })).toHaveCount(0);

  await page.locator("#menu-open").click();
  await expect(page.getByRole("menu", { name: "Действия" })).toBeVisible();
  await page.getByRole("menuitem", { name: "Выполнить" }).click();
  await expect(page.locator("#action-status")).toHaveText("Меню выполнено");

  await page.locator("#popover-open").click();
  await expect(page.getByRole("dialog", { name: "Детали" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Детали" })).toHaveCount(0);
});

test("dialog and drawer keep a scrolling page at the same width", async ({ page }) => {
  await page.evaluate(() => {
    const spacer = document.createElement("div");
    spacer.style.height = "200vh";
    document.body.append(spacer);
  });

  const measure = () => page.evaluate(() => ({
    contentLeft: document.querySelector(".fixture")!.getBoundingClientRect().left,
    contentRight: document.querySelector(".fixture")!.getBoundingClientRect().right,
    scrollHeight: document.documentElement.scrollHeight,
    clientHeight: document.documentElement.clientHeight
  }));
  const before = await measure();
  expect(before.scrollHeight).toBeGreaterThan(before.clientHeight);

  for (const [trigger, mask] of [
    ["#dialog-open", ".wl-dialog-mask"],
    ["#drawer-open", ".wl-drawer-mask"]
  ] as const) {
    await page.locator(trigger).click();
    await expect(page.locator(mask)).toBeVisible();
    const locked = await measure();
    expect(locked.contentLeft).toBeCloseTo(before.contentLeft, 1);
    expect(locked.contentRight).toBeCloseTo(before.contentRight, 1);

    await page.keyboard.press("Escape");
    await expect(page.locator(mask)).toHaveCount(0);
    const restored = await measure();
    expect(restored.contentLeft).toBeCloseTo(before.contentLeft, 1);
    expect(restored.contentRight).toBeCloseTo(before.contentRight, 1);
  }
});

test("Docs layout stays in place when its dialog and drawer open", async ({ page }) => {
  for (const [component, trigger, name] of [
    ["WlDialog", "Открыть диалог", "Сведения о материале"],
    ["WlDrawer", "Открыть Drawer", "Детали материала"]
  ] as const) {
    await page.goto("/?view=docs&component=" + component);
    const guide = page.locator('[data-docs-component="' + component + '"]');
    const preview = guide.getByTestId("ds-example-preview");
    await expect(preview).toBeVisible();
    const measure = () => page.locator(".docs-page").evaluate((main) => {
      const rect = main.getBoundingClientRect();
      return { left: rect.left, right: rect.right };
    });
    const before = await measure();
    await preview.getByRole("button", { name: trigger, exact: true }).click();
    await expect(page.getByRole("dialog", { name })).toBeVisible();
    const locked = await measure();
    expect(locked.left).toBeCloseTo(before.left, 1);
    expect(locked.right).toBeCloseTo(before.right, 1);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name })).toHaveCount(0);
    const restored = await measure();
    expect(restored.left).toBeCloseTo(before.left, 1);
    expect(restored.right).toBeCloseTo(before.right, 1);
    await expect(preview.getByRole("button", { name: trigger, exact: true })).toBeFocused();
  }
});

test("overlay motion defaults on and local settings override app configuration", async ({ page }) => {
  const motion = await openDialogMotion(page, "#dialog-open");
  expect(motion.classes).toContain("wl-dialog-motion-enter-active");
  expect(motion.duration).toBeGreaterThan(0.1);
  await page.keyboard.press("Escape");
  await expect(page.locator(".wl-dialog-mask")).toHaveCount(0);

  expect(await openDialogClasses(page, "#dialog-static-open")).not.toContain("wl-dialog-motion-enter-active");
  await page.keyboard.press("Escape");
  await expect(page.locator(".wl-dialog-mask")).toHaveCount(0);

  await page.goto("/e2e.html?motion=off");
  expect(await openDialogClasses(page, "#dialog-open")).not.toContain("wl-dialog-motion-enter-active");
  await page.keyboard.press("Escape");
  await expect(page.locator(".wl-dialog-mask")).toHaveCount(0);

  const drawerClasses = await page.locator("#drawer-open").evaluate(async (button) => {
    (button as HTMLButtonElement).click();
    await Promise.resolve();
    return document.querySelector(".wl-drawer-mask")?.className ?? "";
  });
  expect(drawerClasses).not.toContain("wl-drawer-motion-enter-active");
  await page.keyboard.press("Escape");
  await expect(page.locator(".wl-drawer-mask")).toHaveCount(0);

  expect(await openDialogClasses(page, "#dialog-motion-open")).toContain("wl-dialog-motion-enter-active");
  await page.keyboard.press("Escape");
  await expect(page.locator(".wl-dialog-mask")).toHaveCount(0);
});

test("drawer and tooltip animate, then release their DOM after closing", async ({ page }) => {
  const drawerClasses = await page.locator("#drawer-open").evaluate(async (button) => {
    (button as HTMLButtonElement).click();
    await Promise.resolve();
    return document.querySelector(".wl-drawer-mask")?.className ?? "";
  });
  expect(drawerClasses).toContain("wl-drawer-motion-enter-active");
  await page.keyboard.press("Escape");
  await expect(page.locator(".wl-drawer-mask")).toHaveCount(0);

  await page.locator("#tooltip-anchor").evaluate((button) => button.dispatchEvent(new MouseEvent("mouseenter")));
  await expect(page.getByRole("tooltip")).toHaveText("Подсказка");
  await expect(page.getByRole("tooltip")).toHaveClass(/wl-tooltip-motion/);
  await page.locator("#tooltip-anchor").evaluate((button) => button.dispatchEvent(new MouseEvent("mouseleave")));
  await expect(page.getByRole("tooltip")).toHaveCount(0);

  await page.locator("#tooltip-static-anchor").evaluate((button) => button.dispatchEvent(new MouseEvent("mouseenter")));
  await expect(page.getByRole("tooltip")).toHaveText("Без анимации");
  await expect(page.getByRole("tooltip")).not.toHaveClass(/wl-tooltip-motion/);
  await page.locator("#tooltip-static-anchor").evaluate((button) => button.dispatchEvent(new MouseEvent("mouseleave")));
  await expect(page.getByRole("tooltip")).toHaveCount(0);
});

test("anchored panels animate without changing Escape dismissal", async ({ page }) => {
  for (const [trigger, panel] of [
    ["#menu-open", ".wl-menu"],
    ["#popover-open", ".wl-popover"],
    [".wl-select", ".wl-select-overlay"],
    [".wl-multiselect", ".wl-multiselect-overlay"],
    [".wl-dp input", ".wl-dp__panel"]
  ] as const) {
    const classes = await page.locator(trigger).evaluate(async (element, selector) => {
      (element as HTMLElement).click();
      await Promise.resolve();
      return document.querySelector(selector)?.className ?? "";
    }, panel);
    expect(classes).toContain("wl-pop-motion-enter-active");
    await page.keyboard.press("Escape");
    await expect(page.locator(panel)).toHaveCount(0);
  }
});

test("reopening a leaving list restores its accessible options", async ({ page }) => {
  const select = page.getByRole("combobox", { name: "Выбор", exact: true });
  await select.click();
  await expect(page.getByRole("listbox")).toBeVisible();
  await select.press("Escape");
  await select.evaluate(async (element) => {
    (element as HTMLElement).click();
    await Promise.resolve();
  });
  await expect(page.locator(".wl-select-overlay:not([aria-hidden]):not([inert])")).toHaveCount(1);
  await expect(page.getByRole("option", { name: "Альфа" })).toBeVisible();
});

test("toast messages animate in and out without retaining removed messages", async ({ page }) => {
  const classes = await page.locator("#toast-open").evaluate(async (button) => {
    (button as HTMLButtonElement).click();
    await Promise.resolve();
    return document.querySelector(".wl-toast__message")?.className ?? "";
  });
  expect(classes).toContain("wl-toast-motion-enter-active");
  await page.locator(".wl-toast__close").click();
  await expect(page.locator(".wl-toast__message")).toHaveCount(0);
});

test("command palette keeps focus behavior with entry and exit motion", async ({ page }) => {
  await page.locator("#palette-open").focus();
  const classes = await page.locator("#palette-open").evaluate(async (button) => {
    (button as HTMLButtonElement).click();
    await Promise.resolve();
    return document.querySelector(".wl-command-palette")?.className ?? "";
  });
  expect(classes).toContain("wl-command-motion-enter-active");
  await expect(page.getByRole("combobox", { name: "Командная палитра" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator(".wl-command-palette")).toHaveCount(0);
  await expect(page.locator("#palette-open")).toBeFocused();
});

test("command palette search focus ring stays inside its panel in every theme", async ({ page, browserName }, testInfo) => {
  const trigger = page.locator("#palette-open");
  await trigger.focus();
  await trigger.press("Enter");
  const input = page.getByRole("combobox", { name: "Командная палитра" });
  const search = page.locator(".wl-command-palette__search");
  await expect(input).toBeFocused();
  await expect(page.locator(".wl-command-palette")).toHaveCSS("opacity", "1");

  for (const theme of wlDesignThemes.map((theme) => theme.name)) {
    await page.evaluate((name) => document.documentElement.setAttribute("data-wl-theme", name), theme);
    const indicator = await search.evaluate((row) => {
      const panel = row.parentElement!;
      const input = row.querySelector("input")!;
      const rowStyle = getComputedStyle(row);
      const panelStyle = getComputedStyle(panel);
      const rowBounds = row.getBoundingClientRect();
      const panelBounds = panel.getBoundingClientRect();
      const width = Number.parseFloat(rowStyle.outlineWidth);
      const offset = Number.parseFloat(rowStyle.outlineOffset);
      const outset = Math.max(0, width + offset);
      return {
        width,
        offset,
        inputOutline: getComputedStyle(input).outlineStyle,
        radius: Number.parseFloat(rowStyle.borderTopLeftRadius),
        contained: rowBounds.left - outset >= panelBounds.left + Number.parseFloat(panelStyle.borderLeftWidth) - 0.25
          && rowBounds.top - outset >= panelBounds.top + Number.parseFloat(panelStyle.borderTopWidth) - 0.25
          && rowBounds.right + outset <= panelBounds.right - Number.parseFloat(panelStyle.borderRightWidth) + 0.25
          && rowBounds.bottom + outset <= panelBounds.bottom - Number.parseFloat(panelStyle.borderBottomWidth) + 0.25
      };
    });
    expect(indicator.width, theme).toBeGreaterThanOrEqual(2);
    expect(indicator.offset, theme).toBeLessThanOrEqual(-indicator.width);
    expect(indicator.inputOutline, theme).toBe("none");
    expect(indicator.radius, theme).toBeGreaterThan(0);
    expect(indicator.contained, theme).toBe(true);
    if (browserName === "chromium") {
      await page.screenshot({ path: testInfo.outputPath(`palette-focus-${theme}.png`) });
    }
  }

  await input.press("Tab");
  const option = page.locator(".wl-command-palette").getByRole("option").first();
  await expect(option).toBeFocused();
  await expect(option).toHaveCSS("outline-width", "2px");
  await expect(search).toHaveCSS("outline-style", "none");
  await page.keyboard.press("Escape");
  await expect(page.locator(".wl-command-palette")).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("confirmation message remains until its closing animation finishes", async ({ page }) => {
  await page.locator("#confirm-open").click();
  const messageDuringExit = await page.getByRole("button", { name: "Удалить", exact: true }).evaluate(async (button) => {
    (button as HTMLButtonElement).click();
    await Promise.resolve();
    return document.querySelector(".wl-confirm__message")?.textContent ?? "";
  });
  expect(messageDuringExit).toBe("Удалить элемент?");
  await expect(page.locator(".wl-dialog-mask")).toHaveCount(0);
});

test("reduced-motion preference shortens overlay transitions", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const motion = await openDialogMotion(page, "#dialog-open");
  expect(motion.classes).toContain("wl-dialog-motion-enter-active");
  expect(motion.duration).toBeGreaterThan(0);
  expect(motion.duration).toBeLessThan(0.01);
  await page.keyboard.press("Escape");
  await expect(page.locator(".wl-dialog-mask")).toHaveCount(0);
  await page.locator("#tooltip-anchor").evaluate((button) => button.dispatchEvent(new MouseEvent("mouseenter")));
  await expect(page.getByRole("tooltip")).toHaveText("Подсказка");
  await expect(page.getByRole("tooltip")).not.toHaveClass(/wl-tooltip-motion/);
});

test("toast, confirmation and tooltip remain accessible", async ({ page }) => {
  await page.locator("#toast-open").click();
  await expect(page.locator(".wl-toast__summary")).toHaveText("Сохранено");
  await page.locator("#confirm-open").click();
  await expect(page.getByRole("dialog", { name: "Подтверждение" })).toBeVisible();
  await page.getByRole("button", { name: "Удалить", exact: true }).click();
  await expect(page.locator("#action-status")).toHaveText("Подтверждено");
  await page.locator("#tooltip-anchor").hover();
  await expect(page.getByRole("tooltip")).toHaveText("Подсказка");
});

test("all themes render without runtime errors", async ({ page, browserName }, testInfo) => {
  const errors: string[] = [];
  const backgrounds: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const theme of wlDesignThemes.map((theme) => theme.name)) {
    await page.evaluate((name) => document.documentElement.setAttribute("data-wl-theme", name), theme);
    await expect(page.locator(".wl-table__row")).toHaveCount(2);
    backgrounds.push(await page.locator("body").evaluate((element) => getComputedStyle(element).backgroundColor));
    if (browserName === "chromium") {
      await page.screenshot({ path: testInfo.outputPath(`fixture-${theme}.png`), fullPage: true });
    }
  }
  expect(new Set(backgrounds).size).toBe(wlDesignThemes.length);
  expect(errors).toEqual([]);
});

test("the complete icon batch renders at three sizes in each theme", async ({ page, browserName }, testInfo) => {
  await page.goto("/?view=docs&section=icons");
  await expect(page.locator(".pg-brand .pg-kit-version")).toHaveText(`v${uiKitVersion}`);
  const catalog = page.getByTestId("docs-icon-catalog");
  await expect(catalog.locator("li")).toHaveCount(WL_ICON_NAMES.length);
  for (const theme of wlDesignThemes.map((theme) => theme.name)) {
    await chooseShowcaseTheme(page, wlDesignThemes.find((definition) => definition.name === theme)!.label);
    await expect(page.locator("html")).toHaveAttribute("data-wl-theme", theme);
    for (const size of [16, 20, 24]) {
      await chooseDropdownOption(page, page.getByRole("combobox", { name: "Размер иконки", exact: true }), String(size));
      const drawings = catalog.locator('svg[data-wl="icon"]');
      await expect(drawings).toHaveCount(WL_ICON_NAMES.length);
      const bounds = await drawings.evaluateAll((elements) => elements.map((svg) => {
        const rect = svg.getBoundingClientRect();
        return { width: rect.width, height: rect.height, hasPath: Boolean(svg.querySelector("path, circle, rect, line, polyline, polygon, ellipse")) };
      }));
      expect(bounds.every((item) => item.width === size && item.height === size && item.hasPath)).toBe(true);
      if (browserName === "chromium") await catalog.screenshot({ path: testInfo.outputPath(`icons-${theme}-${size}.png`), style: ".pg-top { visibility: hidden; }" });
    }
  }
});
