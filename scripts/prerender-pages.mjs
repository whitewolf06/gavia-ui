import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { stripVTControlCharacters } from "node:util";

export function prerenderServerReady(output, origin) {
  return stripVTControlCharacters(output).includes(origin);
}

export function prerenderTargets(directory, routes) {
  const root = resolve(directory);
  const targets = routes.map((route) => {
    if (typeof route !== "string" || !/^(?:[\w-]+\/)*$/.test(route)) throw new Error(`Unsafe prerender route: ${route}`);
    const target = resolve(root, route, "index.html");
    const child = relative(root, target);
    if (isAbsolute(child) || child.startsWith(`..${sep}`)) throw new Error(`Prerender target escapes output: ${target}`);
    return { route, target };
  });
  // Keep the clean SPA index as the fallback until every direct route has been
  // rendered. Otherwise its home-only preloads leak into subsequent documents.
  return targets.sort((left, right) => Number(left.route === "") - Number(right.route === ""));
}

function assertOutputParent(root, target) {
  let parent = dirname(target);
  while (!existsSync(parent)) parent = dirname(parent);
  const child = relative(realpathSync(root), realpathSync(parent));
  if (isAbsolute(child) || child === ".." || child.startsWith(`..${sep}`)) throw new Error(`Prerender output follows a junction outside dist: ${target}`);
}

/** Runs in the browser; retain public paths without recording the owned preview origin. */
export function serializePrerenderHtml({ origin, root = document.documentElement }) {
  const clone = root.cloneNode(true);
  clone.removeAttribute("data-wl-boot");
  clone.setAttribute("data-playground-prerendered", "");
  clone.querySelector("#app")?.removeAttribute("data-v-app");
  for (const node of clone.querySelectorAll("body > :not(#app):not(script):not(noscript)")) node.remove();
  for (const element of clone.querySelectorAll("[href], [src], [action], [formaction], [poster]")) {
    for (const attribute of ["href", "src", "action", "formaction", "poster"]) {
      const value = element.getAttribute(attribute);
      if (!value || !/^(?:https?:)?\/\//i.test(value)) continue;
      try {
        const url = new URL(value, origin);
        if (url.origin === origin) element.setAttribute(attribute, url.pathname + url.search + url.hash);
      } catch { /* Preserve attributes that are not valid absolute URLs. */ }
    }
  }
  return "<!doctype html>\n" + clone.outerHTML;
}

/** Requires an existing production build and an explicitly requested browser run. */
export async function prerenderPages(workspace) {
  const app = resolve(workspace, "apps/playground");
  const dist = resolve(app, "dist");
  const manifest = JSON.parse(readFileSync(resolve(dist, "route-manifest.json"), "utf8"));
  if (!/^\/(?:[\w-]+\/)*$/.test(manifest.base)) throw new Error("Prerender requires an absolute deployment base");
  const targets = prerenderTargets(dist, manifest.routes);
  const index = readFileSync(resolve(dist, "index.html"), "utf8");
  if (!index.includes('type="module"')) throw new Error("Missing production application entry");
  const port = 4177;
  const origin = `http://127.0.0.1:${port}`;
  const server = spawn(process.execPath, [resolve(app, "node_modules/vite/bin/vite.js"), "preview", "--configLoader=runner", "--host", "127.0.0.1", "--port", String(port), "--strictPort", `--base=${manifest.base}`], { cwd: app, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
  let output = "";
  server.stdout.on("data", (value) => {
    output += value;
  });
  server.stderr.on("data", (value) => {
    output += value;
  });
  let browser;
  const evidence = [];
  try {
    let ready = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      if (server.exitCode !== null) throw new Error(`Preview did not start: ${output}`);
      try {
        ready = prerenderServerReady(output, origin) && (await fetch(origin + manifest.base)).ok;
      } catch { /* Wait only for this owned server. */ }
      if (ready) break;
      await new Promise((done) => setTimeout(done, 100));
    }
    if (!ready) throw new Error(`Preview did not become ready: ${output}`);
    const { chromium } = await import("@playwright/test");
    browser = await chromium.launch({ channel: process.env.GAVIA_E2E_CHROMIUM_CHANNEL });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: "light", reducedMotion: "reduce" });
    for (const { route, target } of targets) {
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      try {
        const response = await page.goto(origin + manifest.base + route, { waitUntil: "networkidle" });
        if (!response?.ok()) throw new Error(`Route failed: ${route}`);
        await page.waitForSelector("#app[data-v-app] main");
        const component = /\/components\/(Wl\w+)\/$/.exec(route)?.[1];
        if (component === "WlButton") await page.waitForSelector(".docs-button");
        else if (component) await page.waitForSelector(`[data-docs-component="${component}"] [data-testid="ds-example-preview"] [data-wl]`);
        else if (/docs\/(?:why|theming|recipes|accessibility|how-it-is-built)\/$/.test(route)) await page.waitForSelector("[data-guide]");
        await page.evaluate(() => document.fonts.ready);
        if (errors.length) throw new Error(`${route}: ${errors.join("; ")}`);
        const html = await page.evaluate(serializePrerenderHtml, { origin });
        assertOutputParent(dist, target);
        mkdirSync(dirname(target), { recursive: true });
        assertOutputParent(dist, target);
        writeFileSync(target, html);
        evidence.push({ route, title: await page.title(), language: await page.locator("html").getAttribute("lang"), bytes: Buffer.byteLength(html) });
      } finally { await page.close(); }
    }
    // A missing route still boots the app; all canonical paths have their own HTML.
    writeFileSync(resolve(dist, "404.html"), index);
    writeFileSync(resolve(dist, "prerender-report.json"), JSON.stringify({ routes: evidence }, null, 2) + "\n");
    return evidence;
  } finally {
    await browser?.close();
    server.kill();
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await prerenderPages(resolve(dirname(fileURLToPath(import.meta.url)), ".."));
  console.log(`Prerendered ${result.length} canonical documentation paths`);
}
