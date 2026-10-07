import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { renderToString } from "vue/server-renderer";
import * as kit from "gavia-ui";
import { createPackedSSRApp } from "./src/packed-fixture.mjs";

assert.equal(typeof window, "undefined");
assert.equal(typeof document, "undefined");
assert.ok(kit.WlButton && kit.WlInput && kit.WlSelect && kit.WlDatePicker);
assert.ok(kit.wlManifest.length >= 53);
assert.equal(kit.resolveWlToken("--wl-space-lg"), "16px");
const warnings = [];
const app = createPackedSSRApp();
app.config.warnHandler = (message) => { warnings.push(message); };
const context = {};
const html = await renderToString(app, context);
// Vue hydrates the kit's body Teleports from these separate SSR anchors.
// Put them before the application container, not inside the app's rendered tree.
const bodyTeleports = context.teleports?.body ?? "";
assert.ok((bodyTeleports.match(/<!--teleport (?:start )?anchor-->/g) ?? []).length >= 2,
  "Server rendering did not collect the closed Select and DatePicker Teleport anchors");
assert.deepEqual(warnings, [], "Server rendering emitted Vue warnings");
assert.match(html, /value="Gavia"/);
assert.match(html, /data-testid="click-count"[^>]*>0</);
assert.match(html, /aria-expanded="false"/);
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
assert.equal(new Set(ids).size, ids.length, "SSR generated duplicate IDs");
assert.ok(ids.filter((id) => id.startsWith("wl-field-packed")).length >= 2);
for (const match of html.matchAll(/\s(?:for|aria-describedby)="([^"]+)"/g)) {
  for (const reference of match[1].split(/\s+/)) assert.ok(ids.includes(reference), "SSR has a broken ID reference: " + reference);
}
writeFileSync("ssr.html", '<!doctype html><html lang="ru" data-wl-theme="gavia"><head><meta charset="utf-8"><link rel="icon" href="data:,"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Packed SSR consumer</title></head><body>' + bodyTeleports + '<div id="ssr-app">' + html + '</div><script type="module" src="/src/hydrate.mjs"></script></body></html>\n');
writeFileSync("ssr-evidence.json", JSON.stringify({
  nativeImport: true, renderedWithoutDOM: true, ids, warnings, teleportTargets: Object.keys(context.teleports ?? {})
}, null, 2) + "\n");
console.log("Packed native Node import and server rendering passed (" + ids.length + " stable IDs)");

