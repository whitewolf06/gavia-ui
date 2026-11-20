import { copyFileSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { prerenderTargets } from "./prerender-pages.mjs";

// This directory is served by the owner's Pages site at the former project path.
const workspace = fileURLToPath(new URL("../", import.meta.url));
const dist = join(workspace, "apps/playground/dist");
const output = join(workspace, ".tmp/legacy-pages/gavia-ui");
const manifest = JSON.parse(readFileSync(join(dist, "route-manifest.json"), "utf8"));
if (manifest.base !== "/legato-ui/") throw new Error("Build the Legato Pages site before preparing its redirects");

for (const { route, target } of prerenderTargets(output, manifest.routes)) {
  const destination = "https://whitewolf06.github.io/legato-ui/" + route;
  const document = `<!doctype html>
<html lang="en"><meta charset="utf-8"><title>Legato UI</title>
<link rel="canonical" href="${destination}">
<script>location.replace(${JSON.stringify(destination)} + location.search + location.hash)</script>
<noscript><meta http-equiv="refresh" content="0;url=${destination}"></noscript>
<p><a href="${destination}">Continue to Legato UI</a></p></html>
`;
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, document);
}

// CLI clients and download links need the original bytes at their old URLs.
const downloads = join(output, "downloads");
mkdirSync(downloads, { recursive: true });
for (const file of readdirSync(join(dist, "downloads"))) {
  if (file.endsWith(".zip")) copyFileSync(join(dist, "downloads", file), join(downloads, file));
}
console.log(`Prepared ${manifest.routes.length} legacy routes in ${output}`);
