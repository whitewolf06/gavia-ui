import assert from "node:assert/strict";
import test from "node:test";
import { assertPagesProvenance } from "./pages-provenance.mjs";

const revision = "a".repeat(40);
const valid = {
  repository: "whitewolf06/gavia-ui", checkedOutSha: revision, latestMainSha: revision,
  event: { workflow_run: { name: "CI", id: 123, event: "push", head_branch: "main", conclusion: "success", head_sha: revision,
    head_repository: { full_name: "whitewolf06/gavia-ui" } } }
};

test("Pages accepts only the same successful canonical main revision", () => {
  assert.deepEqual(assertPagesProvenance(valid), { revision, runId: 123 });
});

test("Pages rejects forks, PR success, failures, mismatched checkout, stale main and invalid run identity", () => {
  for (const [field, value] of [["name", "Release"], ["event", "pull_request"], ["head_branch", "feature"], ["conclusion", "failure"], ["head_sha", "invalid"], ["id", -1]]) {
    const input = structuredClone(valid);
    input.event.workflow_run[field] = value;
    assert.throws(() => assertPagesProvenance(input));
  }
  for (const field of ["repository", "checkedOutSha", "latestMainSha"]) {
    assert.throws(() => assertPagesProvenance({ ...valid, [field]: "b".repeat(40) }));
  }
  const fork = structuredClone(valid);
  fork.event.workflow_run.head_repository.full_name = "someone/gavia-ui";
  assert.throws(() => assertPagesProvenance(fork));
});
