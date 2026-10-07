import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, cpSync, rmSync, existsSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createQualityReport, validateQualityReport, coverageBadge } from "./update-quality-report.mjs";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const version = "0.9.1";
const measuredAt = "2026-10-07T22:42:02.947Z";
const summary = () => ({ total: { lines: { pct: 98.28 }, statements: { pct: 98.28 }, branches: { pct: 87.04 }, functions: { pct: 82.73 } } });
const run = () => ({ success: true, startTime: Date.parse(measuredAt), numTotalTests: 12, numPassedTests: 12, numFailedTests: 0, numFailedTestSuites: 0 });
const source = { revision: "a".repeat(40), dirty: true, environment: "local" };
const report = () => createQualityReport(summary(), run(), version, source);

// These synthetic measurements remain inside temporary fixtures, never the UI snapshot.
test("unit snapshot takes counts, percentages and canonical date from the actual reporter fields", () => {
  assert.deepEqual(report(), {
    schemaVersion: 1,
    version,
    measuredAt,
    source,
    tests: { passed: 12, total: 12 },
    coverage: { lines: 98.28, statements: 98.28, branches: 87.04, functions: 82.73 }
  });
});

test("failed, incomplete, empty and invalid-date runs cannot replace the measured snapshot", () => {
  for (const changed of [{ success: false }, { numFailedTests: 1 }, { numFailedTestSuites: 1 },
    { numPassedTests: 11 }, { numTotalTests: 0, numPassedTests: 0 }, { numPassedTests: "12" },
    { startTime: "now" }, { startTime: 0 }, { startTime: -1 }, { startTime: 9e15 }]) {
    assert.throws(() => createQualityReport(summary(), { ...run(), ...changed }, version, source));
  }
});

test("coverage requires all four finite numeric percentages within 0 through 100", () => {
  for (const dimension of ["lines", "statements", "branches", "functions"]) {
    for (const value of [undefined, null, "Unknown", "98.28", -1, 101, Infinity, NaN]) {
      const invalid = summary();
      invalid.total[dimension].pct = value;
      assert.throws(() => createQualityReport(invalid, run(), version, source), /Coverage/);
    }
  }
});

test("restore validates schema, version, date and source without changing measured provenance", () => {
  const original = report();
  assert.deepEqual(validateQualityReport(original, version), original);
  assert.equal(validateQualityReport({ ...original, source: { ...source, revision: null } }, version).source.revision, null);
  for (const invalid of [{ ...original, schemaVersion: 2 }, { ...original, version: "0.9.2" },
    { ...original, measuredAt: "yesterday" }, { ...original, measuredAt: "2026-02-30T00:00:00.000Z" },
    { ...original, source: { ...source, dirty: "false" } }, { ...original, source: { ...source, revision: "unknown" } },
    { ...original, source: { ...source, environment: "published" } }]) {
    assert.throws(() => validateQualityReport(invalid, version));
  }
});

test("offline accessible SVG snapshot labels only unit line coverage", () => {
  assert.equal(coverageBadge(98.28), '<svg xmlns="http://www.w3.org/2000/svg" width="188" height="24" viewBox="0 0 188 24" role="img" aria-labelledby="unit-coverage-title">\n'
    + '  <title id="unit-coverage-title">unit coverage: 98.28%</title>\n'
    + '  <rect x="0.5" y="0.5" width="187" height="23" rx="3" fill="#eef0f2" stroke="#c5cbd1"/>\n'
    + '  <path d="M119 1v22" stroke="#c5cbd1"/>\n'
    + '  <g fill="#26323d" font-family="Verdana, DejaVu Sans, sans-serif" font-size="11" text-anchor="middle">\n'
    + '    <text x="60" y="16">unit coverage</text>\n'
    + '    <text x="153" y="16" font-weight="600">98.28%</text>\n'
    + '  </g>\n</svg>\n');
  assert.match(coverageBadge(100), /unit coverage: 100%/);
  assert.throws(() => coverageBadge("98.28"));
});

function fixture(callback) {
  const base = join(root, ".tmp");
  mkdirSync(base, { recursive: true });
  const directory = mkdtempSync(join(base, "quality-fixture-"));
  const put = (path, value) => {
    const full = join(directory, path);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, typeof value === "string" ? value : JSON.stringify(value), "utf8");
  };
  const command = (executable, args, options = {}) => {
    const result = spawnSync(executable, args, { cwd: directory, encoding: "utf8", ...options });
    assert.equal(result.status, options.expected ?? 0, result.stdout + result.stderr);
    return result;
  };
  const generate = (args = [], options = {}) => command(process.execPath,
    [join(directory, "scripts/update-quality-report.mjs"), ...args], {
      ...options,
      env: { ...process.env, CI: "false", GITHUB_ACTIONS: "false", GITHUB_SHA: "", ...options.env }
    });
  const jsonPath = "apps/playground/src/project/quality-report.generated.json";
  const json = () => JSON.parse(readFileSync(join(directory, jsonPath), "utf8"));
  try {
    put("package.json", { name: "gavia-ui-workspace", private: true, version });
    put("packages/ui-kit/package.json", { name: "gavia-ui", version });
    put("packages/ui-kit/coverage/coverage-summary.json", summary());
    put("packages/ui-kit/coverage/tests.json", run());
    put(".gitignore", "coverage/\n.tmp/\n");
    mkdirSync(join(directory, "scripts"));
    cpSync(join(root, "scripts/update-quality-report.mjs"), join(directory, "scripts/update-quality-report.mjs"));
    command("git", ["init", "--quiet"]);
    command("git", ["add", "package.json", "packages/ui-kit/package.json", "scripts", ".gitignore"]);
    command("git", ["-c", "user.name=Quality fixture", "-c", "user.email=fixture@example.invalid", "-c", "commit.gpgsign=false", "commit", "--quiet", "-m", "Create fixture"]);
    const revision = command("git", ["rev-parse", "HEAD"]).stdout.trim();
    callback({ directory, put, generate, json, revision, jsonPath });
  } finally {
    assert.equal(dirname(directory), base, "cleanup must stay within the worktree .tmp directory");
    rmSync(directory, { recursive: true, force: true });
  }
}

test("default coverage inputs are relative to the script checkout, with real Git measurement provenance", () => {
  fixture(({ directory, generate, json, revision }) => {
    generate([], { cwd: root });
    assert.equal(json().source.revision, revision);
    assert.equal(json().source.dirty, false, "ignored coverage output must not mark a clean source dirty");
    assert.equal(json().source.environment, "local");
    assert.equal(json().measuredAt, measuredAt);
    assert.match(readFileSync(join(directory, "docs/quality-coverage.svg"), "utf8"), /unit coverage: 98.28%/);
  });
});

test("custom coverage directory supplies its own values and failed input preserves existing output", () => {
  fixture(({ directory, put, generate, json, jsonPath }) => {
    const alternative = "alternate-coverage";
    put(alternative + "/coverage-summary.json", { total: { ...summary().total, lines: { pct: 99.1 } } });
    put(alternative + "/tests.json", { ...run(), startTime: Date.parse(measuredAt) + 1000, numTotalTests: 7, numPassedTests: 7 });
    generate(["--source", join(directory, alternative)]);
    assert.equal(json().coverage.lines, 99.1);
    assert.deepEqual(json().tests, { passed: 7, total: 7 });
    assert.equal(json().measuredAt, "2026-10-07T22:42:03.947Z");
    const before = readFileSync(join(directory, jsonPath), "utf8");
    const badge = readFileSync(join(directory, "docs/quality-coverage.svg"), "utf8");
    put(alternative + "/tests.json", { ...run(), success: false });
    generate(["--source", join(directory, alternative)], { expected: 1 });
    assert.equal(readFileSync(join(directory, jsonPath), "utf8"), before);
    assert.equal(readFileSync(join(directory, "docs/quality-coverage.svg"), "utf8"), badge);
    rmSync(join(directory, alternative, "tests.json"));
    generate(["--source", join(directory, alternative)], { expected: 1 });
    assert.equal(readFileSync(join(directory, jsonPath), "utf8"), before);
  });
});

test("flat CI artifact restores the original date/source and rejects foreign revision or version before writes", () => {
  fixture(({ directory, put, generate, json, revision, jsonPath }) => {
    const artifact = join(directory, ".tmp/quality-report");
    const original = { ...report(), source: { revision, dirty: false, environment: "ci" } };
    put(".tmp/quality-report/quality-report.generated.json", original);
    generate(["--restore", artifact], { env: { CI: "true", GITHUB_SHA: revision } });
    assert.deepEqual(json(), original, "restore must preserve the measurement rather than date it as a new run");
    const before = readFileSync(join(directory, jsonPath), "utf8");
    generate(["--restore", artifact], { expected: 1, env: { CI: "true", GITHUB_SHA: "b".repeat(40) } });
    assert.equal(readFileSync(join(directory, jsonPath), "utf8"), before);
    put(".tmp/quality-report/quality-report.generated.json", { ...original, version: "0.9.2" });
    generate(["--restore", artifact], { expected: 1 });
    assert.equal(readFileSync(join(directory, jsonPath), "utf8"), before);
  });
});

test("nested artifact fallback regenerates SVG without needing local coverage inputs", () => {
  fixture(({ directory, put, generate, json, jsonPath }) => {
    put(".tmp/nested-artifact/" + jsonPath, report());
    rmSync(join(directory, "packages/ui-kit/coverage"), { recursive: true, force: true });
    generate(["--restore", join(directory, ".tmp/nested-artifact")]);
    assert.deepEqual(json(), report());
    assert.ok(existsSync(join(directory, "docs/quality-coverage.svg")));
  });
});
