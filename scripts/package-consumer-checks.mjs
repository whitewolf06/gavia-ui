import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(scriptDir, "fixtures", "package-consumer");

export function preparePackedRuntimeFixtures(write) {
  for (const [file, destination] of [
    ["fixture.mjs", "src/packed-fixture.mjs"], ["node-smoke.mjs", "node-smoke.mjs"],
    ["hydrate.mjs", "src/hydrate.mjs"], ["button-entry.mjs", "src/button-entry.mjs"],
    ["bundle-probe.mjs", "bundle-probe.mjs"]
  ]) write(destination, readFileSync(join(fixturesDir, file), "utf8"));
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
      if (!path.startsWith(dist + sep)) { response.writeHead(403).end(); return; }
      if (!statSync(path).isFile()) { response.writeHead(404).end(); return; }
      response.writeHead(200, { "Content-Type": mime[extname(path)] ?? "application/octet-stream" });
      response.end(readFileSync(path));
    } catch { response.writeHead(404).end(); }
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
  for (const extension of ["json", "html", "png"]) rmSync(failurePath(extension), { force: true });
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
        if (["error", "warning"].includes(message.type())) errors.push(message.text() + " " + message.location().url);
      });
      page.on("response", (response) => {
        if (response.status() >= 400) errors.push(response.status() + " " + response.url());
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
      await expect.poll(() => withinDeadline(
        page.evaluate(() => document.fonts.check('14px "Gavia Sans"')), 5_000, "Read consumer font readiness"
      ), {
        timeout: 5_000, message: "Packed Gavia Sans font did not finish loading"
      }).toBe(true);
      assert.notEqual(styles.background, "rgba(0, 0, 0, 0)", "Packed component/theme CSS did not apply");
      assert.ok(styles.width > 0);
      const overflow = await withinDeadline(
        page.evaluate(() => document.documentElement.scrollWidth > innerWidth), 5_000, "Read consumer viewport"
      );
      assert.equal(overflow, false, "Packed consumer overflows its viewport");
      assert.deepEqual(errors, [], "Packed browser consumer reported errors");
      evidence.push({ viewport: viewport.width, render: true, input: true, select: true, click: true, fontAndTheme: true, errors });
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
      if (["error", "warning"].includes(message.type())) errors.push(message.text() + " " + message.location().url);
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
    evidence.push({ hydration: true, ...hydration, eventsAfterHydration: true, errors });
    console.log("Packed browser consumer passed: desktop, mobile, SSR hydration with stable DOM/IDs and working events");
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
    if (browser) await withinDeadline(browser.close(), 5_000, "Disconnect consumer browser").catch(() => {});
    if (browserServer) {
      // This process belongs solely to this check, including on a failed assertion.
      const ownedProcess = browserServer.process();
      await withinDeadline(browserServer.close(), 5_000, "Close owned browser server").catch(() => {
        if (ownedProcess.exitCode === null) ownedProcess.kill("SIGKILL");
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
}


async function withinDeadline(operation, timeout, label) {
  let timer;
  try {
    return await Promise.race([operation, new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(label + " timed out after " + timeout + "ms")), timeout);
    })]);
  } finally { clearTimeout(timer); }
}
