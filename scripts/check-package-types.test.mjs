import assert from "node:assert/strict";
import { test } from "node:test";
import { typedEntrypoints } from "./check-package-types.mjs";

test("discovers every packed executable, declaration and JSON export without treating assets as JavaScript", () => {
  assert.deepEqual(typedEntrypoints({
    ".": { types: "./dist/index.d.ts", import: "./dist/index.js" },
    "./worker": { browser: { import: "./dist/worker.mjs" } },
    "./typed": { types: "./dist/typed.d.mts" },
    "./manifest.json": "./dist/manifest.json",
    "./styles/base.css": "./styles/base.css", "./fonts/*": "./fonts/*"
  }), [".", "./worker", "./typed", "./manifest.json"]);
});
