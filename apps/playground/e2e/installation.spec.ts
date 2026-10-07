import { expect, test } from "@playwright/test";

test("home and documentation offer matching pnpm, npm and Bun installation commands", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async (value: string) => { (window as unknown as { copiedInstallation: string }).copiedInstallation = value; } }
    });
  });
  await page.goto("/?view=home&theme=gavia");
  const install = page.getByTestId("project-npm-status");
  const managers = install.getByRole("group", { name: "Менеджер пакетов для установки" });
  const packageVersion = await install.locator(".home-install-brand a").textContent();
  for (const [name, prefix] of [["pnpm", "pnpm add"], ["npm", "npm install"], ["Bun", "bun add"]]) {
    await managers.getByRole("button", { name, exact: true }).click();
    const command = prefix + " " + packageVersion;
    await expect(page.getByTestId("home-install")).toHaveText(command);
    await expect(managers.getByRole("button", { name, exact: true })).toHaveAttribute("aria-pressed", "true");
    await install.getByRole("button", { name: "Копировать команду", exact: true }).click();
    await expect(install.getByRole("status")).toHaveText("Команда установки скопирована.");
    expect(await page.evaluate(() => (window as unknown as { copiedInstallation: string }).copiedInstallation)).toBe(command);
  }
  await page.goto("/?view=docs&theme=gavia");
  const docsManagers = page.getByRole("group", { name: "Менеджер пакетов для установки" });
  for (const [name, prefix] of [["pnpm", "pnpm add"], ["npm", "npm install"], ["Bun", "bun add"]]) {
    await docsManagers.getByRole("button", { name, exact: true }).click();
    const panel = page.locator("details").filter({ has: page.locator("summary", { hasText: "Установка через" }) });
    await expect(panel.locator("code")).toHaveText(prefix + " " + packageVersion + " vue");
  }
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});