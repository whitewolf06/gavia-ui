import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

/** A successful PR, fork or stale main run must never become a Pages deployment. */
export function assertPagesProvenance({ event, repository, checkedOutSha, latestMainSha }) {
  const run = event?.workflow_run;
  if (repository !== "whitewolf06/gavia-ui" || run?.head_repository?.full_name !== repository) throw new Error("Pages requires the canonical repository");
  if (run.name !== "CI" || run.event !== "push" || run.head_branch !== "main" || run.conclusion !== "success") {
    throw new Error("Pages requires a successful CI run from a main push");
  }
  if (!/^[a-f0-9]{40}$/.test(run.head_sha) || !Number.isSafeInteger(run.id) || run.id <= 0) throw new Error("Invalid source run identity");
  if (checkedOutSha !== run.head_sha || latestMainSha !== run.head_sha) throw new Error("Pages source is stale or differs from checked-out CI revision");
  return { revision: run.head_sha, runId: run.id };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const git = (args) => {
    const result = spawnSync("git", args, { encoding: "utf8" });
    if (result.status !== 0) throw new Error("Cannot verify Pages Git provenance: " + result.stderr);
    return result.stdout.trim();
  };
  const result = assertPagesProvenance({
    event: JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, "utf8")),
    repository: process.env.GITHUB_REPOSITORY,
    checkedOutSha: git(["rev-parse", "HEAD"]),
    latestMainSha: git(["ls-remote", "origin", "refs/heads/main"]).split(/\s/)[0]
  });
  process.stdout.write(`Pages source verified: CI run ${result.runId}, commit ${result.revision}\n`);
}
