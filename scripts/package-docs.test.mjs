import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, relative, resolve } from "node:path";
import test from "node:test";
import { packageDocumentation, writePackageDocumentation } from "./package-docs.mjs";

function fixture(t) {
  const root = mkdtempSync(resolve(tmpdir(), "gavia-package-docs-"));
  t.after(() => {
    assert.match(relative(resolve(tmpdir()), root), /^gavia-package-docs-[^\\/]+$/);
    rmSync(root, { recursive: true, force: true });
  });
  const write = (file, content) => {
    mkdirSync(dirname(resolve(root, file)), { recursive: true });
    writeFileSync(resolve(root, file), content, "utf8");
  };
  write("LICENSE", "MIT canonical license\r\n");
  write("CHANGELOG.md", "# Changelog\r\n\r\n## Unreleased\r\n- See [guide](docs/quality.md#checks).\r\n");
  write("packages/ui-kit/package.json", '{"version":"0.13.0-beta.1"}');
  write("scripts/templates/package/README.md.tpl", "# Gavia UI\nSource {{version}}\n");
  return { root, write };
}

test("package docs derive only from canonical root files and the template", (t) => {
  const env = fixture(t);
  const documents = packageDocumentation(env.root);
  assert.equal(documents.LICENSE, "MIT canonical license\n");
  assert.match(documents["CHANGELOG.md"], /https:\/\/github\.com\/whitewolf06\/gavia-ui\/blob\/main\/docs\/quality\.md#checks/);
  assert.match(documents["README.md"], /Source 0\.13\.0-beta\.1/);
  assert.equal(existsSync(resolve(env.root, "packages/ui-kit/README.md")), false);
  assert.throws(() => writePackageDocumentation(env.root, { check: true }), /missing or stale/);
});

test("prepack regeneration is deterministic and detects stale copies without changing sources", (t) => {
  const env = fixture(t);
  const original = readFileSync(resolve(env.root, "CHANGELOG.md"), "utf8");
  writePackageDocumentation(env.root);
  assert.doesNotThrow(() => writePackageDocumentation(env.root, { check: true }));
  const first = readFileSync(resolve(env.root, "packages/ui-kit/README.md"), "utf8");
  writePackageDocumentation(env.root);
  assert.equal(readFileSync(resolve(env.root, "packages/ui-kit/README.md"), "utf8"), first);
  env.write("packages/ui-kit/README.md", "outdated manual copy");
  assert.throws(() => writePackageDocumentation(env.root, { check: true }), /README/);
  assert.equal(readFileSync(resolve(env.root, "CHANGELOG.md"), "utf8"), original);
});
