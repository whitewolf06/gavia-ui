import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { inflateRawSync } from "node:zlib";
import { expect, type Locator, type Page } from "@playwright/test";

const fontRoot = new URL("../../../packages/ui-kit/fonts/gavia/", import.meta.url);

/** Read the central directory independently of the build-time ZIP writer. */
function unzip(bytes: Buffer): Map<string, Buffer> {
  const end = bytes.length - 22;
  expect(bytes.readUInt32LE(end)).toBe(0x06054b50);
  const entries = bytes.readUInt16LE(end + 10);
  let offset = bytes.readUInt32LE(end + 16);
  const files = new Map<string, Buffer>();
  for (let index = 0; index < entries; index++) {
    expect(bytes.readUInt32LE(offset)).toBe(0x02014b50);
    expect(bytes.readUInt16LE(offset + 10)).toBe(8);
    const compressedLength = bytes.readUInt32LE(offset + 20);
    const rawLength = bytes.readUInt32LE(offset + 24);
    const nameLength = bytes.readUInt16LE(offset + 28);
    const name = bytes.subarray(offset + 46, offset + 46 + nameLength).toString("utf8");
    const local = bytes.readUInt32LE(offset + 42);
    expect(bytes.readUInt32LE(local)).toBe(0x04034b50);
    const start = local + 30 + bytes.readUInt16LE(local + 26) + bytes.readUInt16LE(local + 28);
    const file = inflateRawSync(bytes.subarray(start, start + compressedLength));
    expect(file.length, name).toBe(rawLength);
    files.set(name, file);
    offset += 46 + nameLength + bytes.readUInt16LE(offset + 30) + bytes.readUInt16LE(offset + 32);
  }
  return files;
}

export async function expectGaviaFontDownload(page: Page, link: Locator): Promise<void> {
  const pending = page.waitForEvent("download");
  await link.click();
  const download = await pending;
  expect(download.suggestedFilename()).toBe("Gavia-Sans-0.6.zip");
  const path = await download.path();
  expect(path).not.toBeNull();
  const files = unzip(readFileSync(path!));
  const prefix = "Gavia-Sans-0.6/";
  const manifest = JSON.parse(readFileSync(new URL("manifest.json", fontRoot), "utf8")) as {
    faces: { ttf: { file: string; sha256: string }; woff2: { file: string; sha256: string } }[];
  };
  expect(files.size).toBe(29);
  for (const face of manifest.faces) for (const format of [face.ttf, face.woff2]) {
    const bytes = files.get(prefix + format.file);
    expect(bytes, format.file).toBeDefined();
    expect(createHash("sha256").update(bytes!).digest("hex"), format.file).toBe(format.sha256);
  }
  for (const name of ["OFL.txt", "Onest-OFL.txt", "FONTLOG.txt"]) {
    expect(files.get(prefix + name)?.equals(readFileSync(new URL(name, fontRoot))), name).toBe(true);
  }
  const css = files.get(prefix + "gavia.css")!.toString("utf8");
  expect(css.match(/@font-face/g)).toHaveLength(24);
  for (const family of ["Gavia Sans", "Gavia"]) expect(Array.from(css.matchAll(/font-family:\s*"([^"]+)"\s*;/g)).filter((match) => match[1] === family)).toHaveLength(12);
  for (const match of css.matchAll(/url\("([^"]+)"\)/g)) expect(files.has(prefix + match[1]!.replace("./", ""))).toBe(true);
  expect(files.get(prefix + "README.txt")!.toString("utf8")).toContain("SIL Open Font License 1.1");
}
