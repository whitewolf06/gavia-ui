import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { packageChangelog } from "./release-notes.mjs";

/** Root files are canonical. This computes package artifacts without writing. */
export function packageDocumentation(root) {
  const read = (file) => readFileSync(join(root, file), "utf8").replaceAll("\r\n", "\n");
  const version = JSON.parse(read("packages/ui-kit/package.json")).version;
  if (typeof version !== "string" || !version) throw new Error("Package version is missing");
  const template = read("scripts/templates/package/README.md.tpl");
  if (!template.includes("{{version}}")) throw new Error("Package README template is missing its version placeholder");
  return {
    LICENSE: read("LICENSE"),
    "CHANGELOG.md": packageChangelog(read("CHANGELOG.md")),
    "README.md": template.replaceAll("{{version}}", version)
  };
}

/** Invoked only by packaging or an explicit docs-generation command. */
export function writePackageDocumentation(root, { check = false } = {}) {
  const documents = packageDocumentation(root);
  for (const [name, content] of Object.entries(documents)) {
    const target = join(root, "packages/ui-kit", name);
    if (check) {
      if (!existsSync(target) || readFileSync(target, "utf8").replaceAll("\r\n", "\n") !== content) {
        throw new Error(`Generated package ${name} is missing or stale; run the package prepack hook.`);
      }
    } else writeFileSync(target, content, "utf8");
  }
  return Object.keys(documents);
}
