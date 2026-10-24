import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

function crc32(bytes) {
  let value = 0xffffffff;
  for (const byte of bytes) {
    value ^= byte;
    for (let bit = 0; bit < 8; bit++) value = (value >>> 1) ^ ((value & 1) ? 0xedb88320 : 0);
  }
  return (value ^ 0xffffffff) >>> 0;
}

/** Deterministic, uncompressed ZIP; release preparation does not publish anything. */
export function buildFontReleaseArchive(root) {
  const fontRoot = join(root, "packages/ui-kit/fonts/gavia");
  const manifest = JSON.parse(readFileSync(join(fontRoot, "manifest.json"), "utf8"));
  if (manifest.family !== "Gavia Sans" || manifest.license !== "OFL-1.1" || !manifest.faces?.length) {
    throw new Error("Unexpected Gavia font manifest");
  }
  const version = String(Number(manifest.version));
  if (!/^\d+\.\d+$/.test(version)) throw new Error("Unexpected Gavia font version");
  const entries = [];
  const names = new Set();
  for (const face of manifest.faces) {
    const asset = face.ttf;
    if (!asset || basename(asset.file) !== asset.file || !/^Gavia-[\w-]+\.ttf$/.test(asset.file) || names.has(asset.file)) {
      throw new Error("Invalid or duplicate TTF asset in Gavia manifest");
    }
    names.add(asset.file);
    const bytes = readFileSync(join(fontRoot, asset.file));
    if (createHash("sha256").update(bytes).digest("hex") !== asset.sha256) throw new Error("Unverified font: " + asset.file);
    entries.push({ name: asset.file, bytes });
  }
  for (const name of ["OFL.txt", "Onest-OFL.txt", "FONTLOG.txt"]) entries.push({ name, bytes: readFileSync(join(fontRoot, name)) });
  entries.sort((left, right) => left.name.localeCompare(right.name, "en"));
  const records = [];
  const central = [];
  let offset = 0;
  for (const entry of entries) {
    const name = Buffer.from(`Gavia-Sans-${version}/${entry.name}`);
    const checksum = crc32(entry.bytes);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(33, 12); // 1980-01-01, fixed ZIP epoch.
    local.writeUInt32LE(checksum, 14);
    local.writeUInt32LE(entry.bytes.length, 18);
    local.writeUInt32LE(entry.bytes.length, 22);
    local.writeUInt16LE(name.length, 26);
    records.push(local, name, entry.bytes);
    const directory = Buffer.alloc(46);
    directory.writeUInt32LE(0x02014b50, 0);
    directory.writeUInt16LE(20, 4);
    directory.writeUInt16LE(20, 6);
    directory.writeUInt16LE(0x0800, 8);
    directory.writeUInt16LE(33, 14);
    directory.writeUInt32LE(checksum, 16);
    directory.writeUInt32LE(entry.bytes.length, 20);
    directory.writeUInt32LE(entry.bytes.length, 24);
    directory.writeUInt16LE(name.length, 28);
    directory.writeUInt32LE(offset, 42);
    central.push(directory, name);
    offset += local.length + name.length + entry.bytes.length;
  }
  const centralBytes = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralBytes.length, 12);
  end.writeUInt32LE(offset, 16);
  return { name: `Gavia-Sans-${version}-TTF.zip`, bytes: Buffer.concat([...records, centralBytes, end]), entries: entries.map((entry) => entry.name) };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.length !== 2 || args[0] !== "--output" || !args[1].toLowerCase().endsWith(".zip")) {
      throw new Error("Usage: node scripts/archive-fonts.mjs --output <explicit-path.zip>");
    }
    const archive = buildFontReleaseArchive(fileURLToPath(new URL("../", import.meta.url)));
    const output = resolve(args[1]);
    mkdirSync(dirname(output), { recursive: true });
    writeFileSync(output, archive.bytes, { flag: "wx" });
    console.log(`Prepared ${output}: ${archive.entries.length} verified fonts/notices. No publication performed.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
