import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { releaseChannel } from "./release-channel.mjs";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));

export function assertPortableHtml(source) {
  const assets = [...source.matchAll(/\b(?:src|href)[ \t]*=[ \t]*["']([^"']+)["']/gi)];
  for (const [, url] of assets) {
    if (url.startsWith("/") && !url.startsWith("//")) {
      throw new Error("Preview must use relative paths: pnpm --filter gavia-ui-playground build --base=./");
    }
  }
}

function main() {
  const pkg = JSON.parse(readFileSync(join(root, "packages/ui-kit/package.json"), "utf8"));
  const workspace = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  if (workspace.version !== pkg.version) throw new Error("Root/package versions differ before archiving");
  releaseChannel(pkg.version);
  const dist = join(root, "apps/playground/dist");
  const index = join(dist, "index.html");
  if (!existsSync(index)) throw new Error("Build playground with --base=./ before archiving");
  assertPortableHtml(readFileSync(index, "utf8"));
  const out = join(root, ".tmp/release-previews");
  const commit = spawnSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" });
  if (commit.status !== 0) throw new Error("Cannot determine preview source commit");
  const status = spawnSync("git", ["status", "--porcelain=v1", "--untracked-files=normal"], { cwd: root, encoding: "utf8" });
  if (status.status !== 0) throw new Error("Cannot determine preview source changes");
  mkdirSync(out, { recursive: true });
  writeFileSync(join(dist, "release-preview.json"), JSON.stringify({
    version: pkg.version,
    commit: commit.stdout.trim(),
    dirty: status.stdout.trim().length > 0,
    instructions: "Extract and serve over HTTP; open index.html. Query links select pages and themes."
  }, null, 2) + "\n");
  const name = "gavia-ui-playground-" + pkg.version + ".tgz";
  const archive = join(out, name);
  const result = spawnSync("tar", ["-czf", archive, "-C", dist, "."], { stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error("Failed to create preview archive");
  writeFileSync(join(out, name + ".sha256"), createHash("sha256")
    .update(readFileSync(archive)).digest("hex") + "  " + name + "\n");
  console.log(archive);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
