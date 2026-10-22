import type { Plugin } from "vite";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, relative } from "node:path";
import { fileURLToPath, URL } from "node:url";
import { deflateRawSync } from "node:zlib";
import fontManifest from "../../../packages/ui-kit/fonts/gavia/manifest.json";

const gaviaRelease = Number.parseFloat(fontManifest.version).toFixed(1);
const gaviaDownloadName = "Gavia-Sans-" + gaviaRelease + ".zip";
const archivePath = "downloads/" + gaviaDownloadName;
const fontRoot = new URL("../../../packages/ui-kit/fonts/gavia/", import.meta.url);
const stylesheetUrl = new URL("../../../packages/ui-kit/styles/fonts/gavia.css", import.meta.url);

interface VariableFontFile {
  file: string;
  sha256: string;
  bytes: number;
  style: "normal" | "italic";
  subset: "full" | "core";
  unicodeRange: string;
}

/** Read the optional generated payload only after the canonical CSS opts into it. */
export function gaviaVariableFontFiles(metadata: unknown): readonly VariableFontFile[] {
  const manifest = metadata as {
    family?: unknown; axis?: { tag?: unknown; minimum?: unknown; default?: unknown; maximum?: unknown }; files?: unknown;
  } | null;
  if (manifest?.family !== "Gavia Sans" || manifest.axis?.tag !== "wght"
    || manifest.axis.minimum !== 100 || manifest.axis.default !== 400 || manifest.axis.maximum !== 700 || !Array.isArray(manifest.files)) {
    throw new Error("Invalid Gavia variable-font manifest");
  }
  const suffixes = { full: "", core: "-Core" } as const;
  const files = manifest.files as VariableFontFile[];
  const names = new Set<string>();
  for (const record of files) {
    if (!record || !["normal", "italic"].includes(record.style)
      || !Object.prototype.hasOwnProperty.call(suffixes, record.subset)
      || typeof record.sha256 !== "string" || !/^[a-f0-9]{64}$/.test(record.sha256)
      || !Number.isSafeInteger(record.bytes) || record.bytes <= 0 || typeof record.unicodeRange !== "string") {
      throw new Error("Invalid Gavia variable-font file record");
    }
    const expected = "Gavia-Variable" + (record.style === "italic" ? "-Italic" : "") + suffixes[record.subset] + ".woff2";
    if (record.file !== expected || names.has(record.file)) throw new Error("Unsafe or duplicate Gavia variable-font filename");
    names.add(record.file);
  }
  if (names.size !== 4) throw new Error("Gavia variable-font payload must contain both styles, each with full and core files");
  return files;
}

function variableFontAssets(css: string): { entries: { name: string; bytes: Buffer }[]; core?: string } {
  if (!css.includes("Gavia-Variable")) return { entries: [] };
  const manifestUrl = new URL("variable-manifest.json", fontRoot);
  if (!existsSync(manifestUrl)) throw new Error("Variable-font CSS requires its generated manifest and payload");
  const manifestBytes = readFileSync(manifestUrl);
  const files = gaviaVariableFontFiles(JSON.parse(manifestBytes.toString("utf8")));
  const entries = files.map((record) => {
    const bytes = readFileSync(new URL(record.file, fontRoot));
    if (bytes.length !== record.bytes || createHash("sha256").update(bytes).digest("hex") !== record.sha256) {
      throw new Error("Variable font differs from its generated manifest: " + record.file);
    }
    return { name: record.file, bytes };
  });
  entries.push({ name: "variable-manifest.json", bytes: manifestBytes });
  entries.push({ name: "VARIABLE-FONTLOG.txt", bytes: readFileSync(new URL("VARIABLE-FONTLOG.txt", fontRoot)) });
  return { entries, core: files.find((record) => record.style === "normal" && record.subset === "core")!.file };
}

// Small deterministic ZIP writer: no archive dependency is shipped to the browser.
function crc32(bytes: Buffer): number {
  let value = 0xffffffff;
  for (const byte of bytes) {
    value ^= byte;
    for (let bit = 0; bit < 8; bit++) value = (value >>> 1) ^ ((value & 1) ? 0xedb88320 : 0);
  }
  return (value ^ 0xffffffff) >>> 0;
}

function createGaviaFontArchive(): Buffer {
  const manifest = JSON.parse(readFileSync(new URL("manifest.json", fontRoot), "utf8")) as {
    version: string;
    family: string;
    faces: { ttf: { file: string; sha256: string }; woff2: { file: string; sha256: string } }[];
  };
  if (manifest.family !== "Gavia Sans") throw new Error("Unexpected font family");
  if (Number(manifest.version) !== Number(gaviaRelease)) throw new Error("Font download version does not match its manifest");
  const entries: { name: string; bytes: Buffer }[] = [];
  for (const face of manifest.faces) for (const format of [face.ttf, face.woff2]) {
    const bytes = readFileSync(new URL(format.file, fontRoot));
    if (createHash("sha256").update(bytes).digest("hex") !== format.sha256) throw new Error("Unverified font: " + format.file);
    entries.push({ name: format.file, bytes });
  }
  for (const name of ["OFL.txt", "Onest-OFL.txt", "FONTLOG.txt"]) entries.push({ name, bytes: readFileSync(new URL(name, fontRoot)) });
  const sourceCss = readFileSync(stylesheetUrl, "utf8");
  entries.push(...variableFontAssets(sourceCss).entries);
  const css = sourceCss
    .split("../../fonts/gavia/").join("./");
  entries.push({ name: "gavia.css", bytes: Buffer.from(css) });
  entries.push({ name: "README.txt", bytes: Buffer.from([
    "Gavia Sans " + gaviaRelease,
    "6 weights (100, 300, 400, 500, 600, 700), upright and oblique, Cyrillic and Latin.",
    "TTF: install the files on your computer. WOFF2: use gavia.css on the web.",
    'Web: <link rel="stylesheet" href="./gavia.css"> then font-family: "Gavia Sans", sans-serif; text-rendering: geometricPrecision;',
    "Keep gavia.css and the WOFF2 files in the same directory.",
    "Font software: SIL Open Font License 1.1. Keep both OFL files and copyright notices when redistributing.",
    "Derived from Onest. Gavia Sans numerals are authored separately; oblique faces use a 7 degree slope.",
    "",
    "TTF: установите файлы на компьютере. WOFF2: подключите gavia.css на сайте.",
    "Разместите gavia.css и WOFF2 в одной папке. Для точной ширины цифр в web задайте text-rendering: geometricPrecision.",
    "Vue и компоненты UI Kit не требуются.",
    "Лицензия шрифта: SIL OFL 1.1; сохраняйте обе лицензии и уведомления об авторских правах.",
    ""
  ].join("\n")) });

  const localRecords: Buffer[] = [];
  const centralRecords: Buffer[] = [];
  let offset = 0;
  const date = ((2026 - 1980) << 9) | (10 << 5) | 6;
  for (const entry of entries) {
    const name = Buffer.from("Gavia-Sans-" + gaviaRelease + "/" + entry.name);
    const compressed = deflateRawSync(entry.bytes, { level: 9 });
    const checksum = crc32(entry.bytes);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(8, 8);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(checksum, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(entry.bytes.length, 22);
    local.writeUInt16LE(name.length, 26);
    localRecords.push(local, name, compressed);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt16LE(date, 14);
    central.writeUInt32LE(checksum, 16);
    central.writeUInt32LE(compressed.length, 20);
    central.writeUInt32LE(entry.bytes.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(offset, 42);
    centralRecords.push(central, name);
    offset += local.length + name.length + compressed.length;
  }
  const central = Buffer.concat(centralRecords);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(central.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...localRecords, central, end]);
}

export function gaviaFontDownload(): Plugin {
  return {
    name: "gavia-font-download",
    transformIndexHtml: {
      order: "pre",
      handler(_html, context) {
        const { core } = variableFontAssets(readFileSync(stylesheetUrl, "utf8"));
        if (!core) return;
        const source = fileURLToPath(new URL(core, fontRoot));
        const href = context.server
          ? "/@fs/" + source.replace(/\\/g, "/")
          : relative(dirname(context.filename), source).replace(/\\/g, "/");
        return [{ tag: "link", attrs: { rel: "preload", as: "font", type: "font/woff2", crossorigin: "anonymous", href }, injectTo: "head" }];
      }
    },
    configureServer(server) {
      // Build on request so dev never serves a stale copy after font changes.
      server.middlewares.use((request, response, next) => {
        if (request.url?.split("?")[0] !== server.config.base + archivePath) return next();
        try {
          const archive = createGaviaFontArchive();
          response.setHeader("Content-Type", "application/zip");
          response.setHeader("Content-Disposition", 'attachment; filename="' + gaviaDownloadName + '"');
          response.setHeader("Content-Length", archive.length);
          response.end(archive);
        } catch (error) { next(error as Error); }
      });
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: archivePath, source: createGaviaFontArchive() });
    }
  };
}
