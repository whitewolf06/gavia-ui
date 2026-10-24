import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { relative, resolve } from "node:path";
import test from "node:test";
import { buildFontReleaseArchive } from "./archive-fonts.mjs";

function fixture(t) {
  const root = mkdtempSync(resolve(tmpdir(), "gavia-font-archive-"));
  const fonts = resolve(root, "packages/ui-kit/fonts/gavia");
  mkdirSync(fonts, { recursive: true });
  t.after(() => {
    assert.match(relative(resolve(tmpdir()), root), /^gavia-font-archive-[^\\/]+$/);
    rmSync(root, { recursive: true, force: true });
  });
  const bytes = Buffer.from("font fixture");
  const manifest = { family: "Gavia Sans", version: "0.600", license: "OFL-1.1", faces: [{ ttf: {
    file: "Gavia-Regular.ttf", sha256: createHash("sha256").update(bytes).digest("hex")
  } }] };
  writeFileSync(resolve(fonts, "Gavia-Regular.ttf"), bytes);
  for (const name of ["OFL.txt", "Onest-OFL.txt", "FONTLOG.txt"]) writeFileSync(resolve(fonts, name), "notice: " + name);
  const save = () => writeFileSync(resolve(fonts, "manifest.json"), JSON.stringify(manifest));
  save();
  return { root, fonts, manifest, save };
}

test("font release ZIP is deterministic and contains only verified TTF and font notices", (t) => {
  const env = fixture(t);
  const first = buildFontReleaseArchive(env.root);
  assert.equal(first.name, "Gavia-Sans-0.6-TTF.zip");
  assert.deepEqual(first.bytes, buildFontReleaseArchive(env.root).bytes);
  assert.deepEqual(first.entries, ["FONTLOG.txt", "Gavia-Regular.ttf", "OFL.txt", "Onest-OFL.txt"]);
  let offset = 0;
  const extracted = [];
  while (first.bytes.readUInt32LE(offset) === 0x04034b50) {
    const size = first.bytes.readUInt32LE(offset + 18);
    const nameSize = first.bytes.readUInt16LE(offset + 26);
    extracted.push(first.bytes.subarray(offset + 30, offset + 30 + nameSize).toString());
    offset += 30 + nameSize + size;
  }
  assert.deepEqual(extracted, first.entries.map((name) => "Gavia-Sans-0.6/" + name));
  assert.equal(first.bytes.readUInt32LE(offset), 0x02014b50);
  assert.equal(first.bytes.readUInt32LE(first.bytes.length - 22), 0x06054b50);
  assert.equal(first.bytes.readUInt32LE(first.bytes.length - 6), offset);
});

test("font release archive rejects modified bytes, traversal and duplicate assets", (t) => {
  const env = fixture(t);
  env.manifest.faces[0].ttf.file = "../outside.ttf";
  env.save();
  assert.throws(() => buildFontReleaseArchive(env.root), /Invalid or duplicate/);
  env.manifest.faces[0].ttf.file = "Gavia-Regular.ttf";
  env.manifest.faces.push(env.manifest.faces[0]);
  env.save();
  assert.throws(() => buildFontReleaseArchive(env.root), /Invalid or duplicate/);
  env.manifest.faces.pop();
  env.save();
  writeFileSync(resolve(env.fonts, "Gavia-Regular.ttf"), "changed");
  assert.throws(() => buildFontReleaseArchive(env.root), /Unverified font/);
});
