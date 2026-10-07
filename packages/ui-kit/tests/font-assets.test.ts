// @vitest-environment node
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import manifest from "../fonts/gavia/manifest.json";
import packageManifest from "../package.json";
import acceptedTables from "../../../scripts/fonts/accepted-0600-tables.json";
import baseline from "./fixtures/tokens-0.5.json";
import { getWlThemeTokens, resolveWlToken } from "../src/design-system";

const kitRoot = fileURLToPath(new URL("../", import.meta.url));
const repositoryRoot = resolve(kitRoot, "../..");
const fontRoot = resolve(kitRoot, "fonts/gavia");
const cssPath = resolve(kitRoot, "styles/fonts/gavia.css");
const hash = (content: Buffer) => createHash("sha256").update(content).digest("hex");
const acceptedBlock = /APPROVED_SANS_0600_SHA256 = \{([\s\S]*?)\r?\n\}/
  .exec(readFileSync(resolve(repositoryRoot, "scripts/fonts/verify_fonts.py"), "utf8"))?.[1];
const acceptedHashes: Record<string, string> = Object.fromEntries(
  [...(acceptedBlock ?? "").matchAll(/'(Gavia-[^']+\.(?:ttf|woff2))': '([a-f0-9]{64})'/g)]
    .map((match) => [match[1], match[2]])
);

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
      .toEqual(Object.keys(acceptedHashes).sort());
    expect(packageManifest.exports["./styles/fonts/gavia.css"]).toBe("./styles/fonts/gavia.css");
    expect(packageManifest.exports["./fonts/gavia/*"]).toBe("./fonts/gavia/*");
    expect(packageManifest.files).toContain("fonts");
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
    const faces = [...css.matchAll(/@font-face\s*\{([^}]+)\}/g)].map((match) => match[1]!);
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
    expect(gavia["--wl-font"]).toMatch(/^"Gavia Sans", .+sans-serif$/);
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
