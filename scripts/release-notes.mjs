import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, resolve } from "node:path";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const docsRepository = "https://github.com/whitewolf06/gavia-ui/blob/";

/** Package Markdown is read outside the checkout, so local docs links become URLs. */
export function packageChangelog(source) {
  return source.replaceAll("(docs/", "(" + docsRepository + "main/docs/");
}

/** GitHub Release describes an immutable tag, including prerelease branch docs. */
export function releaseDocsLinks(source, version) {
  return source.replaceAll("(docs/", "(" + docsRepository + "v" + version + "/docs/");
}

function markdownLines(source) {
  const lines = [];
  let index = 0;
  let fence;
  for (const line of source.split("\n")) {
    const delimiter = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    let code = !!fence || /^(?: {4}|\t)/.test(line);
    if (fence) {
      if (delimiter && delimiter[1][0] === fence.character
        && delimiter[1].length >= fence.length && !delimiter[2].trim()) fence = undefined;
    } else if (delimiter && (delimiter[1][0] === "~" || !delimiter[2].includes("`"))) {
      fence = { character: delimiter[1][0], length: delimiter[1].length };
      code = true;
    }
    lines.push({ line, index, bodyStart: index + line.length + 1, code });
    index += line.length + 1;
  }
  return { lines, openFence: fence };
}

/** ATX headings outside fenced and indented code, with source offsets preserved. */
export function markdownHeadings(source) {
  return markdownLines(source).lines.flatMap((record) => {
    const heading = !record.code && record.line.match(/^( {0,3})(#{1,6})(?:[ \t]+|$)(.*)$/);
    if (!heading) return [];
    return [{ index: record.index, bodyStart: record.bodyStart, hashStart: record.index + heading[1].length,
      level: heading[2].length, title: heading[3].replace(/[ \t]+#+[ \t]*$/, "").trim() }];
  });
}

/** Paragraphs are deduplicated only as whole blocks, including complete fences. */
export function markdownParagraphs(source) {
  const paragraphs = [];
  let paragraph = [];
  for (const { line, code } of markdownLines(source.replaceAll("\r\n", "\n")).lines) {
    if (!code && !line.trim()) {
      if (paragraph.length) paragraphs.push(paragraph.join("\n"));
      paragraph = [];
    } else paragraph.push(line);
  }
  if (paragraph.length) paragraphs.push(paragraph.join("\n"));
  return paragraphs;
}

/** Embed notes below release headings without changing their hierarchy or code. */
export function normalizeMarkdownNotes(source, label) {
  const normalized = source.replaceAll("\r\n", "\n");
  const { lines, openFence } = markdownLines(normalized);
  if (openFence) throw new Error("Close the Markdown code fence in " + label + "; no versions changed");
  for (let index = 1; index < lines.length; index += 1) {
    const previous = lines[index - 1];
    if (!lines[index].code && !previous.code && previous.line.trim()
      && !/^ {0,3}(?:#{1,6}(?:[ \t]|$)|[-+*](?:[ \t]|$)|>|\d+[.)][ \t])/.test(previous.line)
      && /^ {0,3}(?:=+|-+)[ \t]*$/.test(lines[index].line)) {
      throw new Error("Use # Markdown headings instead of Setext headings in " + label + "; no versions changed");
    }
  }
  const headings = markdownHeadings(normalized);
  const offset = Math.max(0, 3 - Math.min(3, ...headings.map((heading) => heading.level)));
  if (headings.some((heading) => heading.level + offset > 6)) {
    throw new Error("Heading nesting in " + label + " cannot fit below the release heading; use levels ### through ######. No versions changed");
  }
  let result = normalized;
  for (const heading of headings.reverse()) {
    result = result.slice(0, heading.hashStart) + "#".repeat(heading.level + offset)
      + result.slice(heading.hashStart + heading.level);
  }
  return result;
}

export function releaseNotes(source, version) {
  const normalized = source.replaceAll("\r\n", "\n");
  const headings = markdownHeadings(normalized).filter((heading) => heading.level === 2);
  const matches = headings.filter((heading) => {
    const title = heading.title;
    return title === version || title.startsWith(version + " ")
      || title === "[" + version + "]" || title.startsWith("[" + version + "] ");
  });
  if (matches.length !== 1) throw new Error("Expected one reviewed changelog section for " + version);
  const heading = matches[0];
  const bodyStart = heading.bodyStart;
  const next = headings.find((candidate) => candidate.index >= bodyStart);
  const notes = normalized.slice(bodyStart, next?.index ?? normalized.length).trim();
  if (!notes) throw new Error("No reviewed changelog notes for " + version);
  return notes;
}

function main() {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 1 || args[0] !== "--check")) {
    throw new Error("Usage: node scripts/release-notes.mjs [--check]");
  }
  const version = JSON.parse(readFileSync(join(root, "packages/ui-kit/package.json"), "utf8")).version;
  const source = readFileSync(join(root, "CHANGELOG.md"), "utf8").replaceAll("\r\n", "\n");
  const packaged = readFileSync(join(root, "packages/ui-kit/CHANGELOG.md"), "utf8").replaceAll("\r\n", "\n");
  if (packageChangelog(source) !== packaged) throw new Error("Changelog copies differ");
  const exact = join(root, "docs/migration-" + version + ".md");
  const minor = join(root, "docs/migration-" + version.split(".").slice(0, 2).join(".") + ".md");
  const migration = existsSync(exact) ? exact : minor;
  if (!existsSync(migration) || /TODO/.test(readFileSync(migration, "utf8"))) {
    throw new Error("Complete the migration before publishing");
  }
  const notes = releaseNotes(source, version);
  if (args[0] === "--check") {
    console.log("Reviewed release notes and migration present for " + version);
  } else {
    console.log(releaseDocsLinks(notes, version) + "\n\n### Release playground\n\nExtract gavia-ui-playground-"
      + version + ".tgz and open it through a local HTTP server. This saved preview is for version comparisons; "
      + "current public documentation is on GitHub Pages.");
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
