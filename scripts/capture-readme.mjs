import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
assert.equal(args.length, 2, "Usage: node scripts/capture-readme.mjs --base-url <running-local-production-preview>");
assert.equal(args[0], "--base-url");
const base = new URL(args[1]);
assert.ok(["127.0.0.1", "localhost"].includes(base.hostname), "Use an explicitly started local production preview");
const root = fileURLToPath(new URL("../", import.meta.url));
const browser = await chromium.launch({ channel: process.env.GAVIA_E2E_CHROMIUM_CHANNEL });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 }, reducedMotion: "reduce" });
  const screenshots = [];
  for (const theme of ["gavia", "gavia-dark"]) {
    const url = new URL(base);
    url.search = new URLSearchParams({ view: "system", lang: "en", theme }).toString();
    await page.goto(url.href, { waitUntil: "domcontentloaded" });
    await page.locator('[data-testid="ds-recipes"] [data-recipe="ProfileForm"]').first().click();
    const preview = page.getByTestId("ds-recipe-preview");
    await preview.locator("#recipe-profile-name").fill("Alex Morgan");
    await preview.locator("#recipe-profile-email").fill("alex@example.com");
    assert.equal(await page.locator("html").getAttribute("data-wl-theme"), theme);
    await page.evaluate(async () => {
      await document.fonts.load('400 14px "Gavia Sans"');
      await document.fonts.load('600 14px "Gavia Sans"');
      await document.fonts.ready;
    });
    await preview.evaluate((element, currentTheme) => {
      // Frame real rendered components for the illustration. Cloning preserves
      // their DOM/classes/styles; it does not change the application or recipe.
      const panel = document.createElement("section");
      panel.id = "readme-preview";
      panel.style.cssText = "position:fixed;left:0;top:0;z-index:10000;box-sizing:border-box;width:416px;padding:24px;display:flex;flex-direction:column;gap:16px;background:var(--wl-bg);color:var(--wl-text);border:1px solid var(--wl-border);border-radius:12px";
      const label = document.createElement("strong");
      label.textContent = currentTheme === "gavia" ? "Gavia" : "Gavia Dark";
      panel.append(label);
      const selectors = ['[data-wl="page-header"]', "#recipe-profile-name", "#recipe-profile-email", '[data-wl="switch"]', 'button[type="submit"]'];
      for (const selector of selectors) {
        const source = element.querySelector(selector);
        if (!source) throw new Error("Missing README component: " + selector);
        const component = source.closest('[data-wl="field"]') ?? source;
        panel.append(component.cloneNode(true));
      }
      document.body.append(panel);
    }, theme);
    await page.mouse.move(1000, 900);
    screenshots.push((await page.locator("#readme-preview").screenshot({ animations: "disabled", caret: "hide" })).toString("base64"));
  }
  const composed = await page.evaluate(async (sources) => {
    const images = await Promise.all(sources.map((source) => new Promise((done, reject) => {
      const image = new Image();
      image.onload = () => done(image);
      image.onerror = reject;
      image.src = "data:image/png;base64," + source;
    })));
    const canvas = document.createElement("canvas");
    canvas.width = images.reduce((width, image) => width + image.width, 0) + 16;
    canvas.height = Math.max(...images.map((image) => image.height));
    const context = canvas.getContext("2d");
    context.fillStyle = "#eef0f2";
    context.fillRect(0, 0, canvas.width, canvas.height);
    let x = 0;
    for (const image of images) {
      context.drawImage(image, x, 0);
      x += image.width + 16;
    }
    return { width: canvas.width, height: canvas.height, base64: canvas.toDataURL("image/webp", 0.94).split(",")[1] };
  }, screenshots);
  const output = Buffer.from(composed.base64, "base64");
  assert.ok(output.byteLength <= 200_000, "README preview exceeds 200 kB");
  const path = resolve(root, "docs/brand/readme-preview.webp");
  writeFileSync(path, output);
  mkdirSync(resolve(root, ".tmp/readme-preview"), { recursive: true });
  writeFileSync(resolve(root, ".tmp/readme-preview/evidence.json"), JSON.stringify({
    url: base.href, themes: ["gavia", "gavia-dark"], components: ["WlPageHeader", "WlField", "WlInput", "WlSwitch", "WlButton"],
    width: composed.width, height: composed.height, bytes: output.byteLength, capturedAt: new Date().toISOString()
  }, null, 2) + "\n");
  console.log(`Captured ${path}: ${composed.width}×${composed.height}, ${output.byteLength} bytes; review before committing.`);
} finally {
  await browser.close();
}
