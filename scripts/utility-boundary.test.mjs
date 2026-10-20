import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { test } from "node:test";
import { assertPureUtilityEntry } from "./utility-boundary.mjs";

function fixture(files, callback) {
  const root = mkdtempSync(join(tmpdir(), "gavia-utils-"));
  try {
    for (const [name, source] of Object.entries(files)) {
      mkdirSync(join(root, name, ".."), { recursive: true });
      writeFileSync(join(root, name), source);
    }
    callback(root);
  } finally {
    assert.equal(dirname(realpathSync(root)), realpathSync(tmpdir()));
    assert.match(basename(root), /^gavia-utils-/);
    rmSync(root, { recursive: true, force: true });
  }
}
test("traces shared chunks and cycles without mistaking comments for dependencies", () => {
  fixture({ "dist/utils.js": 'export { fn } from "./shared.js"; // import Vue from "vue"', "dist/shared.js": 'export * from "./utils.js"; export const fn=()=>Intl.NumberFormat;' }, (root) => {
    assert.equal(assertPureUtilityEntry(root).length, 2);
  });
});
test("rejects Vue hidden in a shared production chunk", () => {
  fixture({ "dist/utils.js": 'export * from "./mixed.js";', "dist/mixed.js": 'import { ref } from "vue"; export const fn=ref;' }, (root) => {
    assert.throws(() => assertPureUtilityEntry(root), /runtime dependency vue/);
  });
});
test("rejects runtime dynamic imports hidden below a relative reexport", () => {
  fixture({ "dist/utils.js": 'export const fn=()=>import("vue");' }, (root) => {
    assert.throws(() => assertPureUtilityEntry(root), /runtime dependency vue/);
  });
});
