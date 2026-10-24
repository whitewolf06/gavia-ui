// @vitest-environment node
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import acceptedTables from "../../../../scripts/fonts/accepted-0600-tables.json";
import manifest from "../../fonts/gavia/manifest.json";
import packageManifest from "../../package.json";
import { getWlThemeTokens, resolveWlToken } from "../../src/design-system";
import baseline from "../fixtures/tokens-0.5.json";

const kitRoot = fileURLToPath(new URL("../../", import.meta.url));
const repositoryRoot = resolve(kitRoot, "../..");
const fontRoot = resolve(kitRoot, "fonts/gavia");
const cssPath = resolve(kitRoot, "styles/fonts/gavia.css");
const variableManifestPath = resolve(fontRoot, "variable-manifest.json");
const variableManifest = JSON.parse(readFileSync(variableManifestPath, "utf8"));
const variableFiles: {
  file: string; sha256: string; bytes: number; subset: string; style: string; unicodeRange: string;
}[]
  = variableManifest.files;
const hash = (content: Buffer) => createHash("sha256").update(content).digest("hex");
const acceptedBlock = /APPROVED_SANS_0600_SHA256 = \{([\s\S]*?)\r?\n\}/
  .exec(readFileSync(resolve(repositoryRoot, "scripts/fonts/verify_fonts.py"), "utf8"))?.[1];
const acceptedHashes: Record<string, string> = Object.fromEntries(
  [...(acceptedBlock ?? "").matchAll(/'(Gavia-[^']+\.(?:ttf|woff2))': '([a-f0-9]{64})'/g)]
    .map((match) => [match[1], match[2]])
);

function unicodeCharacters(range: string): Set<number> {
  const characters = new Set<number>();
  if (typeof range !== "string" || !range.trim()) throw new Error("Missing variable-font unicode range");
  for (const part of range.trim().split(/\s*,\s*/)) {
    const match = /^U\+([\dA-F]{4,6})(?:-([\dA-F]{4,6}))?$/i.exec(part);
    if (!match) throw new Error("Invalid variable-font unicode range: " + part);
    const first = Number.parseInt(match[1]!, 16);
    const last = Number.parseInt(match[2] ?? match[1]!, 16);
    if (last < first || last > 0x10ffff) throw new Error("Invalid variable-font unicode bounds: " + part);
    for (let character = first; character <= last; character += 1) characters.add(character);
  }
  return characters;
}

function combiningMark(character: number): boolean {
  return (character >= 0x300 && character <= 0x36f) || (character >= 0x1ab0 && character <= 0x1aff)
    || (character >= 0x1dc0 && character <= 0x1dff) || (character >= 0x20d0 && character <= 0x20ff)
    || (character >= 0xfe20 && character <= 0xfe2f);
}

/** Read actual sfnt tables; a renamed unrelated font cannot satisfy face metadata. */
function table(font: Buffer, name: string): Buffer {
  const count = font.readUInt16BE(4);
  for (let index = 0; index < count; index++) {
    const record = 12 + index * 16;
    if (font.toString("ascii", record, record + 4) !== name) continue;
    const start = font.readUInt32BE(record + 8);
    const length = font.readUInt32BE(record + 12);
    if (start + length > font.length) throw new Error("Invalid sfnt table bounds: " + name);
    return font.subarray(start, start + length);
  }
  throw new Error("Missing sfnt table: " + name);
}

function windowsName(font: Buffer, id: number): string {
  const names = table(font, "name");
  const count = names.readUInt16BE(2);
  const strings = names.readUInt16BE(4);
  for (let index = 0; index < count; index++) {
    const record = 6 + index * 12;
    if (names.readUInt16BE(record) !== 3 || names.readUInt16BE(record + 6) !== id) continue;
    const length = names.readUInt16BE(record + 8);
    const start = strings + names.readUInt16BE(record + 10);
    return Buffer.from(names.subarray(start, start + length)).swap16().toString("utf16le");
  }
  throw new Error("Missing Windows font name: " + id);
}

describe("Gavia Sans font distribution", () => {
  it("keeps complete cluster fallback in a separate family from compact Core", () => {
    const css = readFileSync(cssPath, "utf8");
    const faces = [...css.matchAll(/@font-face\s*\{([^}]+)\}/g)].map((match) => match[1]!);
    for (const family of ["Gavia Sans", "Gavia"]) {
      for (const style of ["normal", "italic"]) {
        const ranges = (subset: string) => {
          const file = variableFiles.find((record) => record.style === style && record.subset === subset)!;
          const cssFamily = subset === "core" ? family + " Core" : family;
          const face = faces.find((block) => block.includes('font-family: "' + cssFamily + '";')
            && block.includes("../../fonts/gavia/" + file.file))!;
          return unicodeCharacters(face.match(/unicode-range:([^;]+);/)![1]!);
        };
        const core = ranges("core");
        const full = ranges("full");
        expect([...core].filter((character) => !full.has(character)), family + " " + style + " complete cluster fallback").toEqual([]);
        const fullRecord = variableFiles.find((record) => record.style === style && record.subset === "full")!;
        const coverage = unicodeCharacters(fullRecord.unicodeRange);
        expect([...full].sort((a, b) => a - b)).toEqual([...coverage].sort((a, b) => a - b));
      }
    }
  });

  it("keeps both variable styles with compact cores and complete cluster fallbacks", () => {
    expect(variableManifest.family).toBe(manifest.family);
    expect(variableManifest.version).toBe(manifest.version);
    expect(variableManifest.license).toBe(manifest.license);
    expect(variableManifest.axis).toEqual({ tag: "wght", minimum: 100, default: 400, maximum: 700 });
    expect(variableFiles).toHaveLength(4);
    const suffixes: Record<string, string> = { full: "", core: "-Core" };
    const expected = ["normal", "italic"].flatMap((style) => Object.values(suffixes)
      .map((suffix) => "Gavia-Variable" + (style === "italic" ? "-Italic" : "") + suffix + ".woff2"));
    expect(variableFiles.map((file) => file.file).sort()).toEqual(expected.sort());
    for (const file of variableFiles) {
      expect(["normal", "italic"]).toContain(file.style);
      expect(Object.prototype.hasOwnProperty.call(suffixes, file.subset)).toBe(true);
      expect(file.file).toBe("Gavia-Variable" + (file.style === "italic" ? "-Italic" : "") + suffixes[file.subset] + ".woff2");
      expect(file.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(Number.isSafeInteger(file.bytes) && file.bytes > 0).toBe(true);
    }
    for (const file of variableFiles.filter((record) => record.subset === "core")) {
      expect(file.bytes).toBeLessThanOrEqual(80_000);
    }
    const coverage = (style: string, subset: string) => unicodeCharacters(
      variableFiles.find((file) => file.style === style && file.subset === subset)!.unicodeRange
    );
    const sorted = (characters: Iterable<number>) => [...characters].sort((left, right) => left - right);
    for (const style of ["normal", "italic"]) {
      const full = coverage(style, "full");
      const core = coverage(style, "core");
      expect(sorted([...core].filter((character) => !full.has(character))), style + " core inside full").toEqual([]);
      expect(sorted([...core].filter(combiningMark)), style + " clusters use the full face").toEqual([]);
    }
    expect(sorted(coverage("normal", "full"))).toEqual(sorted(coverage("italic", "full")));
  });

  it("ships only the accepted current family with every weight/style pair", () => {
    expect(manifest.family).toBe("Gavia Sans");
    expect(manifest.version).toBe("0.600");
    expect(manifest.license).toBe("OFL-1.1");
    expect(Object.keys(acceptedHashes)).toHaveLength(24);
    expect(manifest.faces).toHaveLength(12);
    const pairs = manifest.faces.map((face) => face.weight + "/" + face.style).sort();
    expect(pairs).toEqual([100, 300, 400, 500, 600, 700]
      .flatMap((weight) => [weight + "/normal", weight + "/italic"]).sort());
    expect(readdirSync(fontRoot).filter((file) => /\.(?:ttf|woff2)$/.test(file)).sort())
      .toEqual([...Object.keys(acceptedHashes), ...variableFiles.map((record) => record.file)].sort());
    expect(packageManifest.exports["./styles/fonts/gavia.css"]).toBe("./styles/fonts/gavia.css");
    expect(packageManifest.exports["./fonts/gavia/*"]).toBe("./fonts/gavia/*");
    expect(packageManifest.files).toEqual(expect.arrayContaining([
      "fonts/gavia/*.woff2",
      "fonts/gavia/*.txt",
      "fonts/gavia/manifest.json"
    ]));
    expect(packageManifest.files).not.toContain("fonts");
    expect(packageManifest.files).not.toContain("fonts/gavia/variable-manifest.json");
    expect(packageManifest.files.some((path) => /\.ttf|qa-report/i.test(path))).toBe(false);
  });

  it.each(manifest.faces)("preserves $name binaries, real style metadata and common line metrics", (face) => {
    const ttf = readFileSync(resolve(fontRoot, face.ttf.file));
    const web = readFileSync(resolve(fontRoot, face.woff2.file));
    for (const [asset, binary] of [[face.ttf, ttf], [face.woff2, web]] as const) {
      expect(asset.sha256, asset.file).toBe(acceptedHashes[asset.file]);
      expect(hash(binary), asset.file).toBe(acceptedHashes[asset.file]);
    }
    expect(ttf.readUInt32BE(0)).toBe(0x00010000);
    expect(web.toString("ascii", 0, 4)).toBe("wOF2");
    expect(web.readUInt32BE(4)).toBe(0x00010000);
    expect(web.readUInt32BE(8)).toBe(web.length);
    const original = acceptedTables.files[face.ttf.file as keyof typeof acceptedTables.files];
    for (const [tag, expected] of Object.entries(original.tables)) {
      const content = Buffer.from(table(ttf, tag));
      if (tag === "head") content.fill(0, 8, 12);
      expect(hash(content), face.ttf.file + " unchanged " + tag).toBe(expected);
    }
    const head = table(ttf, "head");
    expect(head.readUInt32BE(12)).toBe(0x5f0f3cf5);
    expect(head.readUInt16BE(18)).toBe(1000);
    const os2 = table(ttf, "OS/2");
    expect(os2.readUInt16BE(4)).toBe(face.weight);
    expect(Boolean(os2.readUInt16BE(62) & 1)).toBe(face.style === "italic");
    expect(windowsName(ttf, 16)).toBe("Gavia Sans");
    expect(windowsName(ttf, 21)).toBe("Gavia Sans");
    expect(windowsName(ttf, 4)).toMatch(/^Gavia Sans /);
    expect(windowsName(ttf, 6)).toMatch(/^GaviaSans-/);
    expect(windowsName(ttf, 5)).toBe("Version 0.600");
    const hhea = table(ttf, "hhea");
    expect([hhea.readInt16BE(4), hhea.readInt16BE(6), hhea.readInt16BE(8)])
      .toEqual([manifest.metrics.ascent, manifest.metrics.descent, manifest.metrics.lineGap]);
    for (const tag of ["cmap", "glyf", "GPOS", "GSUB"]) expect(table(ttf, tag).length, tag).toBeGreaterThan(0);
  });

  it("maps each CSS face to its matching real WOFF2 file", () => {
    const css = readFileSync(cssPath, "utf8");
    const allFaces = [...css.matchAll(/@font-face\s*\{([^}]+)\}/g)].map((match) => match[1]!);
    const faces = allFaces.filter((block) => /font-weight:\s*\d+\s*;/.test(block)
      && ["Gavia Sans", "Gavia", "Gavia Sans Core", "Gavia Core"].includes(block.match(/font-family:\s*"([^"]+)"\s*;/)?.[1] ?? ""));
    expect(faces).toHaveLength(24);
    for (const family of ["Gavia Sans", "Gavia"]) {
      const familyFaces = faces.filter((block) => block.match(/font-family:\s*"([^"]+)"\s*;/)?.[1] === family);
      expect(familyFaces).toHaveLength(12);
      for (const face of manifest.faces) {
        const candidates = familyFaces.filter((block) => Number(block.match(/font-weight:\s*(\d+)\s*;/)?.[1]) === face.weight
          && block.match(/font-style:\s*(normal|italic)\s*;/)?.[1] === face.style);
        expect(candidates, face.name).toHaveLength(1);
        const block = candidates[0]!;
        expect(block).toContain('font-family: "' + family + '";');
        expect(block).toMatch(/font-display:\s*swap\s*;/);
        const url = block.match(/url\("([^"]+)"\)/)?.[1];
        expect(url).toBe("../../fonts/gavia/" + face.woff2.file);
        expect(hash(readFileSync(resolve(dirname(cssPath), url!)))).toBe(face.woff2.sha256);
      }
    }
    const variableFaces = allFaces.filter((block) => /font-weight:\s*100\s+700\s*;/.test(block)
      && ["Gavia Sans", "Gavia", "Gavia Sans Core", "Gavia Core"].includes(block.match(/font-family:\s*"([^"]+)"\s*;/)?.[1] ?? ""));
    expect(variableFaces).toHaveLength(8);
    expect(css).toMatch(/^@supports not \(font-variation-settings: normal\) \{/);
    for (const file of variableFiles) {
      expect(file.file).toMatch(/^Gavia-Variable(?:-Italic)?(?:-Core)?\.woff2$/);
      const bytes = readFileSync(resolve(fontRoot, file.file));
      expect(bytes.length).toBe(file.bytes);
      expect(hash(bytes)).toBe(file.sha256);
      expect(bytes.toString("ascii", 0, 4)).toBe("wOF2");
      expect(bytes.readUInt32BE(4)).toBe(0x00010000);
      expect(bytes.readUInt32BE(8)).toBe(bytes.length);
      const matching = variableFaces.filter((block) => block.includes("../../fonts/gavia/" + file.file));
      expect(matching).toHaveLength(2);
      expect(matching.map((block) => block.match(/font-family:\s*"([^"]+)"\s*;/)?.[1]).sort())
        .toEqual(file.subset === "core" ? ["Gavia Core", "Gavia Sans Core"] : ["Gavia", "Gavia Sans"]);
      for (const block of matching) {
        expect(block).toContain("font-style: " + file.style + ";");
        expect(block).toContain("unicode-range: " + file.unicodeRange + ";");
        expect(block).toMatch(/font-display:\s*swap\s*;/);
      }
    }
    for (const file of variableFiles.filter((record) => record.subset === "core")) {
      const fullFile = variableFiles.find((candidate) => candidate.style === file.style && candidate.subset === "full")!;
      for (const family of ["Gavia Sans", "Gavia"]) {
        const fullIndex = variableFaces.findIndex((block) => block.includes('font-family: "' + family + '";')
          && block.includes(fullFile.file));
        const coreIndex = variableFaces.findIndex((block) => block.includes('font-family: "' + family + ' Core";')
          && block.includes(file.file));
        expect(fullIndex).toBeGreaterThanOrEqual(0);
        expect(coreIndex).toBeGreaterThan(fullIndex);
      }
    }
  });

  it("retains the licensed sources, authored geometry and derivative copyright", () => {
    for (const [file, expected] of Object.entries(manifest.sources)) {
      expect(hash(readFileSync(resolve(repositoryRoot, "scripts/fonts/sources", file))), file).toBe(expected);
    }
    expect(hash(readFileSync(resolve(repositoryRoot, manifest.authoredGeometry.file)))).toBe(manifest.authoredGeometry.sha256);
    const license = readFileSync(resolve(fontRoot, "OFL.txt"), "utf8");
    expect(license).toContain("SIL OPEN FONT LICENSE Version 1.1");
    expect(license).toContain("The Onest Project Authors");
    expect(license).toContain("The Gavia Font Project Contributors");
    const normalize = (text: string) => text.replace(/\r\n/g, "\n");
    expect(normalize(readFileSync(resolve(fontRoot, "Onest-OFL.txt"), "utf8")))
      .toBe(normalize(readFileSync(resolve(repositoryRoot, "scripts/fonts/sources/Onest-OFL.txt"), "utf8")));
    expect(packageManifest.license).toBe("MIT");
  });

  it("uses Gavia Sans for the branded theme and preserves legacy typography and code", () => {
    const gavia = getWlThemeTokens("gavia");
    expect(gavia["--wl-font"]).toMatch(/^"Gavia Sans Core", "Gavia Sans", .+sans-serif$/);
    expect(gavia["--wl-font-heading"]).toBe(gavia["--wl-font"]);
    for (const theme of ["white", "graphite", "newspaper"] as const) {
      for (const name of ["--wl-font", "--wl-font-heading", "--wl-mono"] as const) {
        expect(resolveWlToken(name, theme), theme + " " + name).toBe(baseline.themes[theme][name]);
      }
    }
    expect(gavia["--wl-mono"]).toBe(baseline.themes.white["--wl-mono"]);
    expect(gavia["--wl-type-code-family"]).toBe(gavia["--wl-mono"]);
    expect(resolveWlToken("--wl-font")).toBe(baseline.themes.white["--wl-font"]);
  });
});
