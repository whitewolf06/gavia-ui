import assert from "node:assert/strict";
import { test } from "node:test";
import { releaseNotes } from "./release-notes.mjs";
import { prepareChangelog } from "./version-release.mjs";

test("release preparation deduplicates identical editorial/changeset paragraphs without a second notes section", () => {
  const source = "# Changelog\n\n## Unreleased\n\nFix focus restoration.\n\n## 0.1.0\n\nInitial release.\n";
  const result = prepareChangelog(source, "0.2.0", ["Fix focus restoration.", "Add typed slots."]);
  assert.equal(releaseNotes(result, "0.2.0"), "Fix focus restoration.\n\nAdd typed slots.");
  assert.equal(result.includes("### Changesets"), false);
  assert.equal(releaseNotes(result, "0.1.0"), "Initial release.");
});
