import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(scriptDir, "fixtures", "package-consumer");

export function preparePackedRuntimeFixtures(write) {
  for (const [file, destination] of [
    ["fixture.mjs", "src/packed-fixture.mjs"], ["node-smoke.mjs", "node-smoke.mjs"],
    ["hydrate.mjs", "src/hydrate.mjs"], ["button-entry.mjs", "src/button-entry.mjs"],
    ["bundle-probe.mjs", "bundle-probe.mjs"]
  ])
    write(destination, readFileSync(join(fixturesDir, file), "utf8"));
  write("button.html", '<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="icon" href="data:,"><title>Button bundle probe</title></head><body><div id="app"></div><script type="module" src="/src/button-entry.mjs"></script></body></html>\n');
  write("src/PackedSmoke.vue", '<script setup>\nimport { PackedFixture } from "./packed-fixture.mjs";\n</script>\n<template><PackedFixture /></template>\n');
}

export function checkPackedNode(consumerDir) {
  execFileSync(process.execPath, ["node-smoke.mjs"], { cwd: consumerDir, stdio: "inherit", timeout: 30_000 });
  return JSON.parse(readFileSync(join(consumerDir, "ssr-evidence.json"), "utf8"));
}

export function checkPackedButtonBundle(consumerDir) {
  execFileSync(process.execPath, ["bundle-probe.mjs", join(scriptDir, "package-consumer-budget.json")], {
    cwd: consumerDir, stdio: "inherit", env: process.env, timeout: 60_000
  });
  return JSON.parse(readFileSync(join(consumerDir, "bundle-evidence.json"), "utf8"));
}

export async function checkPackedBrowser(consumerDir, artifactLabel = "consumer") {
  const { chromium, expect } = await import("@playwright/test");
  const dist = resolve(consumerDir, "dist");
  const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".json": "application/json" };
  const requests = [];
  const server = createServer((request, response) => {
    requests.push(request.url);
    try {
      const url = new URL(request.url ?? "/", "http://localhost");
      const path = resolve(dist, "." + decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname));
      if (!path.startsWith(dist + sep)) {
        response.writeHead(403).end();

        return;
      }
      if (!statSync(path).isFile()) {
        response.writeHead(404).end();

        return;
      }
      response.writeHead(200, { "Content-Type": mime[extname(path)] ?? "application/octet-stream" });
      response.end(readFileSync(path));
    } catch {
      response.writeHead(404).end();
    }
  });
  let browser;
  let browserServer;
  let activePage;
  let stage = "launch";
  const failures = [];
  const evidenceDir = resolve(scriptDir, "../.tmp/package-verification");
  mkdirSync(evidenceDir, { recursive: true });
  assert.match(artifactLabel, /^[a-z0-9.-]+$/);
  const failurePath = (extension) => join(evidenceDir, artifactLabel + "-failure." + extension);
  for (const extension of ["json", "html", "png"])
    rmSync(failurePath(extension), { force: true });
  try {
    await new Promise((resolveListen, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", resolveListen);
    });
    const address = server.address();
    assert.ok(address && typeof address === "object");
    const origin = "http://127.0.0.1:" + address.port;
    const readiness = await fetch(origin, { signal: AbortSignal.timeout(5_000) });
    assert.equal(readiness.status, 200, "Packed static consumer server is not ready");
    assert.match(await readiness.text(), /Packed Gavia consumer/);
    browserServer = await chromium.launchServer({ channel: process.env.GAVIA_E2E_CHROMIUM_CHANNEL, timeout: 30_000 });
    browser = await chromium.connect(browserServer.wsEndpoint(), { timeout: 10_000 });
    const evidence = [];
    for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
      stage = "consumer viewport=" + viewport.width;
      const page = await withinDeadline(browser.newPage({ viewport }), 10_000, "Create consumer page");
      activePage = page;
      const errors = [];
      failures.push({ stage, errors });
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (["error", "warning"].includes(message.type()))
          errors.push(message.text() + " " + message.location().url);
      });
      page.on("response", (response) => {
        if (response.status() >= 400)
          errors.push(response.status() + " " + response.url());
      });
      page.setDefaultTimeout(5_000);
      await page.goto(origin, { waitUntil: "domcontentloaded", timeout: 20_000 });
      await exercise(page, expect);
      const styles = await withinDeadline(page.locator("#packed-fixture [data-wl=button]").evaluate((button) => ({
        font: getComputedStyle(button).fontFamily,
        background: getComputedStyle(button).backgroundColor,
        width: button.getBoundingClientRect().width
      })), 5_000, "Read consumer theme styles");
      assert.ok(styles.font.includes("Gavia Sans"), "Packed font CSS did not apply: " + styles.font);
      const fonts = await withinDeadline(page.evaluate(async () => {
        const font = '400 14px "Gavia Sans"';
        const text = "Gavia Гавиа 0123456789";
        const faces = await document.fonts.load(font, text);
        const extended = await document.fonts.load(font, "Gavia Ĩ Қ a\u0323\u0301");
        const describe = (face) => ({ family: face.family, weight: face.weight, style: face.style,
          status: face.status, unicodeRange: face.unicodeRange });
        return {
          ready: document.fonts.check(font, text),
          extendedReady: document.fonts.check(font, "Gavia Ĩ Қ a\u0323\u0301"),
          faces: faces.map(describe),
          extended: extended.map(describe)
        };
      }), 5_000, "Load consumer Core and complementary Full coverage");
      assert.equal(fonts.ready, true, "Packed Gavia Sans font did not finish loading");
      assert.equal(fonts.faces.length, 1, "Ordinary packed consumer text must need only Core");
      assert.equal(fonts.extendedReady, true, "Packed extended Gavia text did not finish loading");
      assert.equal(fonts.extended.length, 2, "Extended text must resolve Core and complementary Full");
      assert.equal(new Set(fonts.extended.map((face) => face.unicodeRange)).size, 2, "Packed subsets must have distinct coverage");
      for (const face of [...fonts.faces, ...fonts.extended]) {
        assert.equal(face.family, "Gavia Sans");
        assert.equal(face.weight, "100 700");
        assert.equal(face.style, "normal");
        assert.equal(face.status, "loaded");
      }
      assert.notEqual(styles.background, "rgba(0, 0, 0, 0)", "Packed component/theme CSS did not apply");
      assert.ok(styles.width > 0);
      const overflow = await withinDeadline(
        page.evaluate(() => document.documentElement.scrollWidth > innerWidth), 5_000, "Read consumer viewport"
      );
      assert.equal(overflow, false, "Packed consumer overflows its viewport");
      assert.deepEqual(errors, [], "Packed browser consumer reported errors");
      evidence.push({
        viewport: viewport.width, render: true, input: true, select: true, click: true, menuFocus: true, fontAndTheme: true, errors
      });
      await withinDeadline(page.close(), 5_000, "Close consumer page");
    }

    stage = "SSR hydration";
    const page = await withinDeadline(browser.newPage(), 10_000, "Create hydration page");
    page.setDefaultTimeout(5_000);
    activePage = page;
    const errors = [];
    failures.push({ stage, errors });
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (["error", "warning"].includes(message.type()))
        errors.push(message.text() + " " + message.location().url);
    });
    await page.goto(origin + "/ssr.html", { waitUntil: "domcontentloaded", timeout: 20_000 });
    await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
    const hydration = await withinDeadline(page.evaluate(() => {
      const before = window.__packedSSRBefore;
      return {
        sameRoot: before.root === document.querySelector("#packed-fixture"),
        sameInput: before.input === document.querySelector("#ssr-app input"),
        beforeIds: before.ids,
        afterIds: [...document.querySelectorAll("#ssr-app [id]")].map((node) => node.id)
      };
    }), 5_000, "Read hydrated DOM and IDs");
    assert.equal(hydration.sameRoot, true, "Hydration replaced the server-rendered root");
    assert.equal(hydration.sameInput, true, "Hydration replaced the server-rendered input");
    assert.deepEqual(hydration.afterIds, hydration.beforeIds, "Hydration changed generated IDs");
    await exercise(page, expect);
    assert.deepEqual(errors, [], "SSR hydration emitted errors or warnings");
    evidence.push({ hydration: true, ...hydration, eventsAfterHydration: true, menuFocus: true, errors });
    console.log("Packed browser consumer passed: desktop, mobile, SSR hydration with stable DOM/IDs, working events and keyboard menu focus");
    return evidence;
  } catch (error) {
    const diagnosticErrors = [];
    if (activePage && !activePage.isClosed()) {
      await activePage.screenshot({ path: failurePath("png"), fullPage: true, timeout: 5_000 })
        .catch((diagnosticError) => diagnosticErrors.push("Screenshot: " + String(diagnosticError)));
      try {
        const html = await withinDeadline(activePage.content(), 5_000, "Capture failure HTML");
        writeFileSync(failurePath("html"), html);
      } catch (diagnosticError) {
        diagnosticErrors.push("HTML: " + String(diagnosticError));
      }
    }
    try {
      writeFileSync(failurePath("json"), JSON.stringify({
        stage, message: String(error), requests, failures, diagnosticErrors
      }, null, 2) + "\n");
    } catch (diagnosticError) {
      console.error("Cannot save packed consumer failure diagnostics: " + String(diagnosticError));
    }
    throw new Error("Packed browser check failed at " + stage + ": " + String(error), { cause: error });
  } finally {
    server.closeAllConnections();
    await withinDeadline(new Promise((resolveClose) => server.close(resolveClose)), 5_000, "Close consumer server")
      .catch(() => {});
    if (browser)
      await withinDeadline(browser.close(), 5_000, "Disconnect consumer browser").catch(() => {});
    if (browserServer) {
      // This process belongs solely to this check, including on a failed assertion.
      const ownedProcess = browserServer.process();
      await withinDeadline(browserServer.close(), 5_000, "Close owned browser server").catch(() => {
        if (ownedProcess.exitCode === null)
          ownedProcess.kill("SIGKILL");
      });
    }
  }
}

async function exercise(page, expect) {
  const fixture = page.locator("#packed-fixture");
  await expect(fixture.getByRole("heading", { name: "Packed Gavia UI consumer" })).toBeVisible();
  await expect(fixture.getByLabel("Имя", { exact: true })).toHaveValue("Gavia");
  await fixture.getByLabel("Имя", { exact: true }).fill("Новый проект");
  await expect(fixture.getByTestId("name-value")).toHaveText("Новый проект");
  const select = fixture.getByRole("combobox", { name: "Материал", exact: true });
  await select.focus();
  await select.press("ArrowDown");
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.getByRole("option", { name: "Металл", exact: true }).click();
  await expect(fixture.getByTestId("material-value")).toHaveText("metal");
  await expect(select).toHaveAttribute("aria-expanded", "false");
  await fixture.getByRole("button", { name: "Увеличить", exact: true }).click();
  await expect(fixture.getByTestId("click-count")).toHaveText("1");
  await exerciseMenus(page, expect, fixture);
}

async function exerciseMenus(page, expect, fixture) {
  const contextTrigger = fixture.getByTestId("context-menu-trigger");
  const contextMenu = page.getByRole("menu", { name: "Packed context actions", exact: true });
  const popupTrigger = fixture.getByTestId("popup-menu-trigger");
  const popupMenu = page.getByRole("menu", { name: "Packed popup actions", exact: true });
  async function chooseNested(menu, trigger, kind, count) {
    await expect(menu.getByRole("menuitem", { name: "First", exact: true })).toBeFocused();
    await page.keyboard.press("ArrowDown");
    const more = menu.getByRole("menuitem", { name: "More", exact: true });
    await expect(more).toBeFocused();
    await page.keyboard.press("ArrowRight");
    const nested = page.getByRole("menuitem", { name: "Nested choice", exact: true });
    await expect(nested).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(nested).toHaveCount(0);
    await expect(more).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(nested).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("menu")).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(fixture.getByTestId("menu-result")).toHaveText(kind + " nested");
    await expect(fixture.getByTestId("menu-actions")).toHaveText(String(count));
  }

  await contextTrigger.focus();
  await contextTrigger.press("Shift+F10");
  await expect(contextMenu).toBeVisible();
  await chooseNested(contextMenu, contextTrigger, "context", 1);
  await contextTrigger.press("ContextMenu");
  await expect(contextMenu.getByRole("menuitem", { name: "First", exact: true })).toBeFocused();
  await page.keyboard.press("End");
  await expect(contextMenu.getByRole("menuitem", { name: "Last", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(contextMenu).toHaveCount(0);
  await expect(contextTrigger).toBeFocused();

  await popupTrigger.focus();
  await popupTrigger.press("ArrowDown");
  await expect(popupMenu).toBeVisible();
  await chooseNested(popupMenu, popupTrigger, "popup", 2);
  await popupTrigger.press("ArrowUp");
  await expect(popupMenu.getByRole("menuitem", { name: "Last", exact: true })).toBeFocused();
  await page.keyboard.press("Home");
  await expect(popupMenu.getByRole("menuitem", { name: "First", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(popupMenu).toHaveCount(0);
  await expect(popupTrigger).toBeFocused();
  await expect(fixture.getByTestId("menu-actions")).toHaveText("2");
  await expect(fixture.getByTestId("menu-result")).toHaveText("popup nested");
}

async function withinDeadline(operation, timeout, label) {
  let timer;
  try {
    return await Promise.race([operation, new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(label + " timed out after " + timeout + "ms")), timeout);
    })]);
  } finally {
    clearTimeout(timer);
  }
}
