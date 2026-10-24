import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Every JS/types/JSON export is checked; CSS and fonts are archive assets. */
export function typedEntrypoints(exports) {
  const strings = (value) => typeof value === "string"
    ? [value]
    : value && typeof value === "object" ? Object.values(value).flatMap(strings) : [];
  return Object.entries(exports).filter(([, value]) => strings(value)
    .some((target) => /\.(?:[cm]?js|d\.[cm]?ts|json)$/.test(target))).map(([key]) => key);
}

export function checkPackageTypes(archive, root = resolve(dirname(fileURLToPath(import.meta.url)), "..")) {
  const packageJson = JSON.parse(execFileSync("tar", ["-xOf", archive, "package/package.json"], { encoding: "utf8" }));
  const entrypoints = typedEntrypoints(packageJson.exports);
  if (!entrypoints.includes(".")) throw new Error("Packed package has no typed root entrypoint");
  const toolPackage = resolve(root, "node_modules/@arethetypeswrong/cli/package.json");
  const metadata = JSON.parse(readFileSync(toolPackage, "utf8"));
  const bin = typeof metadata.bin === "string" ? metadata.bin : metadata.bin.attw;
  console.log(`Checking every packed JS/types/JSON export: ${entrypoints.join(", ")}`);
  execFileSync(process.execPath, [resolve(dirname(toolPackage), bin), archive, "--profile", "esm-only", "--entrypoints", ...entrypoints], { cwd: root, stdio: "inherit" });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 3) throw new Error("Usage: pnpm verify:types <exact-archive.tgz>");
  checkPackageTypes(resolve(process.argv[2]));
}
