import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const reportPath = "apps/playground/src/project/quality-report.generated.json";
const badgePath = "docs/quality-coverage.svg";
const dimensions = ["lines", "statements", "branches", "functions"];

function object(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(label + " must be an object");
  return value;
}
function count(value, label, minimum = 0) {
  if (!Number.isSafeInteger(value) || value < minimum) throw new Error(label + " must be a valid test count");
  return value;
}
function percent(value, label) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 100) {
    throw new Error(label + " must be a percentage between 0 and 100");
  }
  return value;
}

/** Validate and retain only the agreed unit-measurement schema. */
export function validateQualityReport(value, expectedVersion) {
  const report = object(value, "Quality report");
  if (report.schemaVersion !== 1) throw new Error("Unsupported quality report schema");
  if (report.version !== expectedVersion) throw new Error("Quality report/package versions differ");
  if (typeof report.measuredAt !== "string" || !Number.isFinite(Date.parse(report.measuredAt))
    || new Date(report.measuredAt).toISOString() !== report.measuredAt) throw new Error("Invalid quality measurement date");
  const source = object(report.source, "Report source");
  if (source.revision !== null && (typeof source.revision !== "string" || !/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i.test(source.revision))) {
    throw new Error("Invalid source revision");
  }
  if (typeof source.dirty !== "boolean" || !["local", "ci"].includes(source.environment)) throw new Error("Invalid source environment");
  const tests = object(report.tests, "Unit tests");
  const total = count(tests.total, "Total tests", 1);
  const passed = count(tests.passed, "Passed tests", 1);
  if (passed !== total) throw new Error("All measured unit tests must pass");
  const measuredCoverage = object(report.coverage, "Unit coverage");
  const coverage = Object.fromEntries(dimensions.map((name) => [name, percent(measuredCoverage[name], "Coverage " + name)]));
  return {
    schemaVersion: 1,
    version: expectedVersion,
    measuredAt: report.measuredAt,
    source: { revision: source.revision, dirty: source.dirty, environment: source.environment },
    tests: { passed, total },
    coverage
  };
}

/** Counts and timestamp come from the same successful Vitest JSON reporter run. */
export function createQualityReport(summary, run, version, source) {
  object(run, "Vitest report");
  if (run.success !== true || run.numFailedTests !== 0
    || (run.numFailedTestSuites !== undefined && run.numFailedTestSuites !== 0)) {
    throw new Error("A successful Vitest run is required before updating unit coverage");
  }
  if (!Number.isSafeInteger(run.startTime) || run.startTime <= 0 || !Number.isFinite(new Date(run.startTime).getTime())) {
    throw new Error("Invalid Vitest startTime");
  }
  const totals = object(object(summary, "Coverage summary").total, "Coverage totals");
  return validateQualityReport({
    schemaVersion: 1,
    version,
    measuredAt: new Date(run.startTime).toISOString(),
    source,
    tests: { passed: run.numPassedTests, total: run.numTotalTests },
    coverage: Object.fromEntries(dimensions.map((name) => [name, object(totals[name], "Coverage " + name).pct]))
  }, version);
}

/** Native, offline badge describes unit line coverage only. */
export function coverageBadge(lines) {
  percent(lines, "Coverage lines");
  const value = Number(lines.toFixed(2)).toString() + "%";
  return '<svg xmlns="http://www.w3.org/2000/svg" width="188" height="24" viewBox="0 0 188 24" role="img" aria-labelledby="unit-coverage-title">\n'
    + '  <title id="unit-coverage-title">unit coverage: ' + value + '</title>\n'
    + '  <rect x="0.5" y="0.5" width="187" height="23" rx="3" fill="#eef0f2" stroke="#c5cbd1"/>\n'
    + '  <path d="M119 1v22" stroke="#c5cbd1"/>\n'
    + '  <g fill="#26323d" font-family="Verdana, DejaVu Sans, sans-serif" font-size="11" text-anchor="middle">\n'
    + '    <text x="60" y="16">unit coverage</text>\n'
    + '    <text x="153" y="16" font-weight="600">' + value + '</text>\n'
    + '  </g>\n</svg>\n';
}

function readJson(path) { return JSON.parse(readFileSync(path, "utf8")); }
function projectVersion() {
  const kit = readJson(join(root, "packages/ui-kit/package.json"));
  const workspace = readJson(join(root, "package.json"));
  if (typeof kit.version !== "string" || !kit.version || kit.version !== workspace.version) throw new Error("Root/package versions differ");
  return kit.version;
}
function sourceMetadata() {
  const commit = spawnSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" });
  const status = spawnSync("git", ["status", "--porcelain=v1", "--untracked-files=normal"], { cwd: root, encoding: "utf8" });
  if (commit.status !== 0 || status.status !== 0) throw new Error("Git source metadata is required for a new quality measurement");
  return {
    revision: commit.stdout.trim(),
    dirty: status.stdout.trim().length > 0,
    environment: process.env.GITHUB_ACTIONS === "true" || ["true", "1"].includes(process.env.CI) ? "ci" : "local"
  };
}
function verifyCIRevision(report) {
  if (process.env.GITHUB_SHA && report.source.revision !== process.env.GITHUB_SHA) {
    throw new Error("Quality report source revision differs from GITHUB_SHA");
  }
}
function writeReport(report) {
  const json = join(root, reportPath);
  const svg = join(root, badgePath);
  mkdirSync(dirname(json), { recursive: true });
  mkdirSync(dirname(svg), { recursive: true });
  writeFileSync(json, JSON.stringify(report, null, 2) + "\n", "utf8");
  writeFileSync(svg, coverageBadge(report.coverage.lines), "utf8");
  console.log("Unit quality measurement updated: " + report.tests.passed + "/" + report.tests.total
    + ", line coverage " + report.coverage.lines + "%, " + report.measuredAt + ", version " + report.version);
}
function main() {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === "--help") {
    console.log("node scripts/update-quality-report.mjs [--source <coverage directory> | --restore <artifact directory>]\n"
      + "Default inputs: packages/ui-kit/coverage/coverage-summary.json and tests.json from successful Vitest unit coverage.\n"
      + "Restore validates the measured version and GITHUB_SHA, preserving the original measurement date and source.");
    return;
  }
  if (args.length && (args.length !== 2 || !["--source", "--restore"].includes(args[0]) || !args[1])) {
    throw new Error("Usage: node scripts/update-quality-report.mjs [--source <directory> | --restore <directory>]");
  }
  const version = projectVersion();
  let report;
  if (args[0] === "--restore") {
    const artifact = resolve(args[1]);
    const flat = join(artifact, "quality-report.generated.json");
    const nested = join(artifact, reportPath);
    report = validateQualityReport(readJson(existsSync(flat) ? flat : nested), version);
  } else {
    const directory = args[0] === "--source" ? resolve(args[1]) : join(root, "packages/ui-kit/coverage");
    report = createQualityReport(readJson(join(directory, "coverage-summary.json")), readJson(join(directory, "tests.json")), version, sourceMetadata());
  }
  verifyCIRevision(report);
  writeReport(report);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
