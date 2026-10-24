import assert from "node:assert/strict";
import { test } from "node:test";
import { gzipSync } from "node:zlib";
import { checkSizeLimits, createSizeLimits, measureJavaScript } from "./size-budget.mjs";

test("measures each transferred JS chunk separately and ignores assets", () => {
  const first = "export const first = 1;";
  const second = "export const second = 2;";
  const result = measureJavaScript({ first: { type: "chunk", code: first }, second: { type: "chunk", code: second }, css: { type: "asset", source: "body{}" } });
  assert.equal(result.bytes, Buffer.byteLength(first + second));
  assert.equal(result.gzip, gzipSync(first).byteLength + gzipSync(second).byteLength);
});

test("derives a five percent ceiling from actual measurements", () => {
  assert.deepEqual(createSizeLimits([{ name: "vue34/select", gzip: 101 }]), { "vue34/select": 107 });
});

test("fails missing baselines and regressions rather than silently accepting them", () => {
  assert.match(checkSizeLimits([{ name: "select", gzip: 105 }], {})[0], /no reviewed baseline/);
  assert.match(checkSizeLimits([{ name: "select", gzip: 106 }], { select: 105 })[0], /exceeds/);
  assert.deepEqual(checkSizeLimits([{ name: "select", gzip: 105 }], { select: 105 }), []);
});
