import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { createWlTheme, parseWlThemeConfig } from "gavia-ui/theme";

const require = createRequire(import.meta.url);
const manifestPath = require.resolve("gavia-ui/package.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
assert.equal(manifest.bin?.["gavia-theme"], "./bin/gavia-theme.mjs");
const bin = join(dirname(manifestPath), manifest.bin["gavia-theme"]);
const input = JSON.parse(readFileSync("theme.config.json", "utf8"));
const expected = createWlTheme(parseWlThemeConfig(input));
assert.ok(expected.contrast.every((pair) => pair.passes));
assert.equal(readFileSync("generated-theme.css", "utf8"), expected.css);
const checkedExitCodes = new Set();

function run(code, config = "theme.config.json", output = "generated-theme.css") {
  const result = spawnSync(process.execPath, [bin, "--config", config, "--output", output, "--check"], {
    cwd: process.cwd(), encoding: "utf8"
  });
  assert.ifError(result.error);
  assert.equal(result.status, code, result.stderr);
  checkedExitCodes.add(result.status);
  return result;
}

run(0);
writeFileSync("generated-theme.css", "out of date", "utf8");
run(2);
assert.equal(readFileSync("generated-theme.css", "utf8"), "out of date");
run(2, "theme.config.json", "missing-theme-output/theme.css");
assert.equal(existsSync("missing-theme-output"), false);

writeFileSync("bad-contrast.json", JSON.stringify({ ...input,
  overrides: { ...input.overrides, "--wl-palette-action-primary-bg": "#ffffff" }
}), "utf8");
const failed = run(3, "bad-contrast.json");
assert.match(failed.stderr, /Contrast failed:/);
assert.match(failed.stderr, /CSS is missing or out of date:/);
assert.equal(readFileSync("generated-theme.css", "utf8"), "out of date");
writeFileSync("invalid-theme.json", '{"schemaVersion":100}', "utf8");
run(1, "invalid-theme.json");
writeFileSync("generated-theme.css", expected.css, "utf8");
writeFileSync("theme-evidence.json", JSON.stringify({
  schemaVersion: input.schemaVersion, mode: input.mode ?? "full",
  apiCliCssEqual: true, contrast: expected.contrast,
  checkedExitCodes: [...checkedExitCodes].sort((first, second) => first - second)
}, null, 2) + "\n", "utf8");
