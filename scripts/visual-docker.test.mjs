import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { relative, resolve } from "node:path";
import test from "node:test";
import { dockerVisualPlan } from "./visual-docker.mjs";

function fixture(t) {
  const root = mkdtempSync(resolve(tmpdir(), "gavia-docker-plan-"));
  t.after(() => {
    assert.match(relative(resolve(tmpdir()), root), /^gavia-docker-plan-[^\\/]+$/);
    rmSync(root, { recursive: true, force: true });
  });
  writeFileSync(resolve(root, "package.json"), JSON.stringify({ devDependencies: { "@playwright/test": "1.58.2" } }));
  return root;
}

test("comparison mounts only supplemental Linux baselines read-only and isolated result output", (t) => {
  const root = fixture(t);
  const plan = dockerVisualPlan(root);
  assert.ok(plan.build.includes("PLAYWRIGHT_VERSION=1.58.2"));
  const mounts = plan.run.filter((arg) => arg.startsWith("type=bind,"));
  assert.equal(mounts.length, 2);
  assert.ok(mounts[0].endsWith("visual-baselines-linux,readonly"));
  assert.ok(mounts[1].includes("test-results-linux"));
  assert.ok(mounts.every((mount) => !mount.includes("node_modules") && !mount.includes("target=/workspace,")));
  assert.equal(plan.run.includes("--update-snapshots"), false);
  assert.equal(plan.run.includes("--update-snapshots=none"), true);
  assert.equal(plan.run[plan.run.indexOf("--env") + 1], "GAVIA_VISUAL_REVIEW=1");
});

test("only the explicit update flag makes Linux snapshots writable", (t) => {
  const root = fixture(t);
  const plan = dockerVisualPlan(root, ["--update-snapshots", "--project", "mobile"]);
  assert.equal(plan.run.filter((arg) => arg.includes("readonly")).length, 0);
  assert.deepEqual(plan.run.slice(-3), ["--project", "mobile", "--update-snapshots"]);
  for (const args of [["--update-snapshots", "--update-snapshots"], ["--project", "unknown"], ["--volume", "/"], ["--grep", ".*"]]) {
    assert.throws(() => dockerVisualPlan(root, args));
  }
  assert.throws(() => dockerVisualPlan(root + ",target=/outside"), /commas/);
  writeFileSync(resolve(root, "package.json"), JSON.stringify({ devDependencies: { "@playwright/test": "^1.58.2" } }));
  assert.throws(() => dockerVisualPlan(root), /Pin @playwright\/test exactly/);
});
