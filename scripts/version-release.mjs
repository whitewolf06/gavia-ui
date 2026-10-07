import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { packageChangelog, releaseNotes, markdownHeadings, markdownParagraphs, normalizeMarkdownNotes } from "./release-notes.mjs";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (path) => readFileSync(join(root, path), "utf8").replaceAll("\r\n", "\n");

function changesetNotes() {
  return readdirSync(join(root, ".changeset")).sort()
    .filter((file) => file.endsWith(".md") && file !== "README.md")
    .flatMap((file) => {
      const source = read(".changeset/" + file);
      const frontmatter = source.match(/^---[ \t]*\n([\s\S]*?)\n---[ \t]*(?:\n|$)/);
      if (!frontmatter || !/^[ \t]*["']?gavia-ui["']?[ \t]*:[ \t]*(?:patch|minor|major)[ \t]*$/m.test(frontmatter[1])) return [];
      const notes = source.slice(frontmatter[0].length).trim();
      if (!notes) throw new Error("A changeset must have human-readable notes: " + file);
      return [normalizeMarkdownNotes(notes, file)];
    });
}

export function prepareChangelog(source, version, notes, promotedNotes = "") {
  const normalized = source.replaceAll("\r\n", "\n");
  const headings = markdownHeadings(normalized).filter((heading) => heading.level === 2);
  const pending = headings.filter((heading) => heading.title === "Не выпущено");
  if (pending.length > 1) throw new Error("Changelog has duplicate unreleased sections");
  const section = pending[0];
  const start = section?.index ?? headings[0]?.index ?? -1;
  const insertion = start < 0 ? normalized.length : start;
  const bodyStart = section ? section.bodyStart : insertion;
  const next = section ? headings.find((heading) => heading.index >= bodyStart) : undefined;
  const end = section ? next?.index ?? normalized.length : insertion;
  const current = section ? normalized.slice(bodyStart, end).trim() : "";
  const changeNotes = [...new Set(notes)].join("\n\n");
  const content = [current, promotedNotes, changeNotes && "### Changesets\n\n" + changeNotes].filter(Boolean).join("\n\n");
  if (!content) throw new Error("A release must have human-readable notes");
  const replacement = "## Не выпущено\n\n## " + version + " — подготовлено\n\n" + content + "\n\n";
  const prefix = normalized.slice(0, insertion).trimEnd();
  const suffix = normalized.slice(end).trimStart();
  return (prefix ? prefix + "\n\n" : "") + replacement + suffix;
}

/** Retained changesets supply their own text; carry reviewed editorial notes too. */
export function promotionNotes(source, version, changesets) {
  const normalized = source.replaceAll("\r\n", "\n");
  const headings = markdownHeadings(normalized).filter((heading) => heading.level === 2);
  const versions = headings.map((heading) => heading.title.split(" ")[0].replace(/^\[|\]$/g, ""))
    .filter((candidate) => candidate.startsWith(version + "-") && /^\d+\.\d+\.\d+-(?:alpha|beta|rc)\.\d+$/.test(candidate));
  const recorded = new Set(changesets.flatMap((note) => markdownParagraphs(note)));
  recorded.add("### Changesets");
  const editorial = versions.reverse().flatMap((candidate) => markdownParagraphs(releaseNotes(normalized, candidate)))
    .filter((paragraph) => !recorded.has(paragraph));
  return [...new Set(editorial)].join("\n\n");
}

function main() {
  if (process.argv.length > 2) throw new Error("Usage: pnpm release:version");
  const notes = changesetNotes();
  if (!notes.length) throw new Error("No gavia-ui changeset; nothing to version");
  const before = JSON.parse(read("packages/ui-kit/package.json")).version;
  const rootManifest = JSON.parse(read("package.json"));
  if (before !== rootManifest.version) throw new Error("Root/package versions differ before preparation");
  const source = read("CHANGELOG.md");
  if (packageChangelog(source) !== read("packages/ui-kit/CHANGELOG.md")) throw new Error("Changelog copies differ");
  // Validate all notes before Changesets consumes files or changes any versions.
  const previousNotes = before.includes("-") ? promotionNotes(source, before.split("-")[0], notes) : "";
  prepareChangelog(source, before, notes);
  const cli = join(root, "node_modules/@changesets/cli/bin.js");
  const result = spawnSync(process.execPath, [cli, "version"], { cwd: root, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) { process.exitCode = result.status ?? 1; return; }
  const version = JSON.parse(read("packages/ui-kit/package.json")).version;
  if (version === before) throw new Error("Changesets produced no new package version");
  const promoted = !version.includes("-") ? previousNotes : "";
  const changelog = prepareChangelog(source, version, notes, promoted);
  rootManifest.version = version;
  writeFileSync(join(root, "package.json"), JSON.stringify(rootManifest, null, 2) + "\n");
  writeFileSync(join(root, "CHANGELOG.md"), changelog);
  writeFileSync(join(root, "packages/ui-kit/CHANGELOG.md"), packageChangelog(changelog));
  mkdirSync(join(root, "docs"), { recursive: true });
  const migration = join(root, "docs/migration-" + version + ".md");
  if (!existsSync(migration)) {
    writeFileSync(migration, "# Обновление до Gavia UI " + version
      + "\n\nTODO: перечислите изменения, совместимость и действия потребителя.\n");
  }
  console.log("Prepared " + version + ". Review changelog/migration before creating a release tag. No publication performed.");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
