import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, relative, resolve } from "node:path";
import test from "node:test";
import { normalizeDeclarationSpecifiers } from "./normalize-declarations.mjs";

const requireKit = createRequire(new URL("../packages/ui-kit/package.json", import.meta.url));
const ts = requireKit("typescript");

function fixture(t) {
  const root = mkdtempSync(resolve(tmpdir(), "gavia-declarations-"));
  t.after(() => {
    assert.match(relative(resolve(tmpdir()), root), /^gavia-declarations-[^\\/]+$/);
    rmSync(root, { recursive: true, force: true });
  });
  const write = (file, source) => {
    const path = resolve(root, file);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, source, "utf8");
  };
  write("package.json", '{"type":"module"}');
  write("src/types.ts", "export interface Options { value: string }");
  write("src/components/index.ts", 'export { default as Button } from "./Button.vue";');
  write("src/components/Button.vue", "<template><button /></template>");
  return { root, write, options: { sourceRoot: resolve(root, "src"), outDir: resolve(root, "dist") } };
}

test("normalizes import/export/import-type modules and directory indices without touching prose", (t) => {
  const env = fixture(t);
  const source = [
    '// import("./not-a-module") stays a comment.',
    'import type { Options } from "./types";',
    'export * from "./components";',
    'export type Copy = import("./types").Options;',
    'export type Literal = "./types";',
    'import type { External } from "vue";',
    'import "./styles.css";'
  ].join("\n");
  const normalized = normalizeDeclarationSpecifiers(source, resolve(env.root, "dist/index.d.ts"), env.options);
  assert.match(normalized, /from "\.\/types\.js"/);
  assert.match(normalized, /from "\.\/components\/index\.js"/);
  assert.match(normalized, /Copy = import\("\.\/types\.js"\)/);
  assert.match(normalized, /Literal = "\.\/types"/);
  assert.match(normalized, /not-a-module/);
  assert.match(normalized, /from "vue"/);
  assert.match(normalized, /import "\.\/styles\.css"/);
  assert.equal(normalizeDeclarationSpecifiers(normalized, resolve(env.root, "dist/index.d.ts"), env.options), normalized);
});

test("normalizes Vue declaration imports and explicit TypeScript extensions", (t) => {
  const env = fixture(t);
  const file = resolve(env.root, "dist/components/index.d.ts");
  const result = normalizeDeclarationSpecifiers('export { default as Button } from "./Button.vue";\nexport type T = import("../types.ts").Options;', file, env.options);
  assert.match(result, /\.\/Button\.vue\.js/);
  assert.match(result, /\.\.\/types\.js/);
  assert.throws(() => normalizeDeclarationSpecifiers('export * from "./missing";', file, env.options), /Cannot resolve declaration import/);
});

test("file targets take precedence over directory indices and import-equals paths are normalized", (t) => {
  const env = fixture(t);
  env.write("src/choice.tsx", "export interface Choice {}");
  env.write("src/choice/index.ts", "export interface DirectoryChoice {}");
  env.write("src/legacy.cts", "export = {};");
  const file = resolve(env.root, "dist/index.d.ts");
  const result = normalizeDeclarationSpecifiers('export * from "./choice"; import legacy = require("./legacy.cts");', file, env.options);
  assert.match(result, /from "\.\/choice\.js"/);
  assert.match(result, /require\("\.\/legacy\.cjs"\)/);
});

test("normalizes bare parent and current-directory imports emitted by generic Vue declarations", (t) => {
  const env = fixture(t);
  env.write("src/index.ts", "export interface Root {}");
  const file = resolve(env.root, "dist/components/Table.vue.d.ts");
  const normalized = normalizeDeclarationSpecifiers('export type R = import("..").Root; export type C = import(".").Button;', file, env.options);
  assert.match(normalized, /import\("\.\.\/index\.js"\)/);
  assert.match(normalized, /import\("\.\/index\.js"\)/);
});

for (const mode of [ts.ModuleKind.Node16, ts.ModuleKind.NodeNext]) {
  test(`normalized declaration fixture resolves in ${ts.ModuleKind[mode]} with strict library checking`, (t) => {
    const env = fixture(t);
    env.write("dist/types.d.ts", "export interface Options { value: string }");
    env.write("dist/components/Button.vue.d.ts", "declare const button: { label: string }; export default button;");
    for (const [file, content] of [
      ["index.d.ts", 'export * from "./components"; export type { Options } from "./types"; export type Copy = import("./types").Options;'],
      ["components/index.d.ts", 'export { default as Button } from "./Button.vue";']
    ]) env.write("dist/" + file, normalizeDeclarationSpecifiers(content, resolve(env.root, "dist", file), env.options));
    env.write("consumer.ts", 'import { Button, type Copy, type Options } from "./dist/index.js"; const value: Copy & Options = { value: Button.label }; export { value };');
    const program = ts.createProgram([resolve(env.root, "consumer.ts")], {
      module: mode, moduleResolution: mode === ts.ModuleKind.Node16 ? ts.ModuleResolutionKind.Node16 : ts.ModuleResolutionKind.NodeNext,
      strict: true, skipLibCheck: false, noEmit: true, types: [], target: ts.ScriptTarget.ES2020
    });
    const diagnostics = ts.getPreEmitDiagnostics(program);
    assert.deepEqual(diagnostics.map((entry) => ts.flattenDiagnosticMessageText(entry.messageText, "\n")), []);
    assert.match(readFileSync(resolve(env.root, "dist/components/index.d.ts"), "utf8"), /Button\.vue\.js/);
  });
}
