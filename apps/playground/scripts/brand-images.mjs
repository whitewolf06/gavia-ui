import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import process from "node:process";
import { fileURLToPath, URL as NodeURL, pathToFileURL } from "node:url";

const root = fileURLToPath(new NodeURL("../../../", import.meta.url));
export const widths = [640, 1024, 1600, 1920];
export const images = ["gavia-lake-hero-v2", "gavia-lake-night-v2", "gavia-forest-card-v1", "gavia-reeds-card-v1"];
const relativeOutput = "apps/playground/src/assets/brand";
const sourceDirectory = "archives/brand";
const digest = (data) => createHash("sha256").update(data).digest("hex");

export function derivativePlan(workspace = root) {
  return images.flatMap((name) => widths.map((width) => ({
    source: resolve(workspace, sourceDirectory, name + ".png"),
    file: name + "-" + width + ".webp",
    path: resolve(workspace, relativeOutput, name + "-" + width + ".webp"),
    width
  })));
}

/** Check committed derivatives without loading optional image tooling. */
export async function checkBrandImages(workspace = root) {
  const directory = resolve(workspace, relativeOutput);
  const manifest = JSON.parse(await readFile(resolve(directory, "manifest.json"), "utf8"));
  const plan = derivativePlan(workspace);
  if (manifest.images.length !== plan.length) {
    throw new Error("Image derivative inventory changed; regenerate it intentionally");
  }
  for (const entry of plan) {
    const record = manifest.images.find((item) => item.file === entry.file);
    const expectedHeight = Math.round(entry.width / 3);
    const sourceFile = entry.file.replace(/-\d+\.webp$/, ".png");
    // Existing manifests record the original source location before archival.
    const recordedSource = record?.source === sourceDirectory + "/" + sourceFile
      || record?.source === "docs/brand/" + sourceFile;
    if (!record || record.width !== entry.width || record.height !== expectedHeight
      || !recordedSource) {
      throw new Error("Image derivative dimensions or provenance changed: " + entry.file);
    }
    if (record.sourceSha256 !== digest(await readFile(entry.source))
      || record.sha256 !== digest(await readFile(entry.path))) {
      throw new Error("Stale image derivative: " + entry.file);
    }
  }
  return manifest;
}

export async function generateBrandImages(sharp, workspace = root) {
  if (sharp.versions.sharp !== "0.35.5") throw new Error("Use sharp 0.35.5 for reproducible image derivatives");
  const records = [];
  for (const entry of derivativePlan(workspace)) {
    const original = await readFile(entry.source);
    const metadata = await sharp(original).metadata();
    if (metadata.width !== 2172 || metadata.height !== 724) {
      throw new Error("Authored image dimensions changed: " + entry.source);
    }
    const { data, info } = await sharp(original).resize({ width: entry.width, withoutEnlargement: true })
      .webp({ quality: 82, effort: 6, smartSubsample: true }).toBuffer({ resolveWithObject: true });
    if (info.width !== entry.width || info.height !== Math.round(entry.width / 3)) {
      throw new Error("Unexpected derivative dimensions");
    }
    records.push({
      file: entry.file,
      source: sourceDirectory + "/" + entry.file.replace(/-\d+\.webp$/, ".png"),
      sourceSha256: digest(original),
      sha256: digest(data),
      width: info.width,
      height: info.height,
      bytes: data.length,
      data
    });
  }
  // Encoding succeeds for every file before any derivative is replaced.
  const directory = resolve(workspace, relativeOutput);
  await mkdir(directory, { recursive: true });
  for (const record of records) await writeFile(resolve(directory, record.file), record.data);
  const manifest = {
    generator: "apps/playground/scripts/brand-images.mjs",
    sharp: sharp.versions.sharp,
    vips: sharp.versions.vips,
    webp: { quality: 82, effort: 6, smartSubsample: true },
    images: records.map(({ data: _data, ...record }) => record)
  };
  await writeFile(resolve(directory, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  return manifest;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === "--check") {
    const manifest = await checkBrandImages();
    process.stdout.write("Verified " + manifest.images.length + " responsive image derivatives.\n");
    return;
  }
  if (args[0] !== "--write" || args.length !== 3 || args[1] !== "--sharp-module") {
    throw new Error(
      "Usage: node apps/playground/scripts/brand-images.mjs --check | --write --sharp-module <sharp 0.35.5 module path>"
    );
  }
  const require = createRequire(import.meta.url);
  const sharp = require(resolve(args[2]));
  const manifest = await generateBrandImages(sharp);
  process.stdout.write("Generated " + manifest.images.length + " derivatives; authored source images were preserved.\n");
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  await main().catch((error) => {
    process.stderr.write(error.message + "\n");
    process.exitCode = 1;
  });
}
