import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, relative, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { applyComponentPlan, componentCategories, createComponentPlan, parseComponentArgs } from "./new-component.mjs";

const requireKit = createRequire(new URL("../packages/ui-kit/package.json", import.meta.url));
const { parse, compileScript, compileTemplate } = requireKit("vue/compiler-sfc");
const ts = requireKit("typescript");
const command = fileURLToPath(new URL("./new-component.mjs", import.meta.url));

function fixture(t) {
  const root = mkdtempSync(resolve(tmpdir(), "gavia-component-"));
  t.after(() => {
    const child = relative(resolve(tmpdir()), root);
    assert.match(child, /^gavia-component-[^\\/]+$/);
    rmSync(root, { recursive: true, force: true });
  });
  const write = (file, content) => {
    mkdirSync(dirname(resolve(root, file)), { recursive: true });
    writeFileSync(resolve(root, file), content, "utf8");
  };
  write("packages/ui-kit/package.json", JSON.stringify({ version: "0.13.0" }));
  write("packages/ui-kit/src/components/index.ts", 'export { WlExisting } from "./native-contracts";\n');
  write("packages/ui-kit/src/components/native-contracts.ts", 'import RawExisting from "./WlExisting.vue";\n// Existing contract helpers remain untouched.\n');
  write("packages/ui-kit/src/pt-types.ts", "export interface WlPtMap<TOpen extends boolean = true> {\n  existing: Root<TOpen>;\n}\n");
  write("packages/ui-kit/src/manifest/types.ts", 'export const WL_COMPONENT_INTRODUCED_IN: Readonly<Record<string, string>> = {\n  WlExisting: "0.1.0"\n};\n');
  for (const category of componentCategories) write(`packages/ui-kit/src/manifest/${category}.ts`, `export const ${category}Manifest = defineComponentManifest([\n  { name: "WlExisting", description: "Preserve strings such as ]); and braces {}" }\n]);\n`);
  write("packages/ui-kit/styles/base.css", "@layer wl.components { .wl-existing { color: red; } }\n");
  for (const group of ["inputs", "showcase"]) {
    const prefix = group === "inputs" ? "input" : "showcase";
    write(`apps/playground/src/documentation/components/${group}.ts`, `export const ${prefix}DocumentationExamples = localizeDocumentation({\n  WlExisting: { title: "Keep me" }\n});\nexport const ${prefix}DocumentationAccessibility = localizeDocumentation({\n  WlExisting: ["Keep semantics"]\n});\n`);
  }
  write("apps/playground/src/documentation/components/pt-sections.ts", 'export const documentationPtSections = localizeDocumentation({\n  WlExisting: [{ name: "root" }]\n});\n');
  for (const language of ["en", "ru"]) write(`apps/playground/src/i18n/messages/documentation.${language}.json`, JSON.stringify({ strings: { preserved: "Existing text" }, componentSearch: { label: "Preserved" } }, null, 2) + "\n");
  return { root, write, read: (file) => readFileSync(resolve(root, file), "utf8") };
}

function snapshot(root, base = root) {
  return readdirSync(base, { withFileTypes: true }).flatMap((entry) => {
    const file = resolve(base, entry.name);
    return entry.isDirectory() ? snapshot(root, file) : [[relative(root, file), readFileSync(file, "utf8")]];
  });
}

test("dry-run reports every output while leaving the fixture byte-for-byte unchanged", (t) => {
  const env = fixture(t);
  const before = snapshot(env.root);
  const plan = createComponentPlan({ root: env.root, name: "Scratch", category: "misc" });
  const files = applyComponentPlan(plan, { dryRun: true });
  assert.equal(plan.name, "WlScratch");
  assert.equal(files.length, 15);
  assert.equal(new Set(files).size, files.length);
  assert.deepEqual(snapshot(env.root), before);
});

test("explicit reuse-pt preserves an existing directive's sections and rejects missing names", (t) => {
  const env = fixture(t);
  assert.throws(() => createComponentPlan({ root: env.root, name: "Scratch", category: "misc", reusePt: true }), /missing pt name scratch/);
  const existing = "export interface WlPtMap<TOpen extends boolean = true> {\n  scratch: { root?: unknown; arrow?: unknown };\n}\n";
  env.write("packages/ui-kit/src/pt-types.ts", existing);
  const plan = createComponentPlan({ root: env.root, name: "Scratch", category: "misc", reusePt: true });
  applyComponentPlan(plan);
  assert.equal(env.read("packages/ui-kit/src/pt-types.ts"), existing);
  assert.equal(plan.files.length, 14);
  assert.equal(parseComponentArgs(["Scratch", "--category", "misc", "--reuse-pt"]).reusePt, true);
});

test("scaffold extends typed registries and preserves existing entries", (t) => {
  const env = fixture(t);
  const plan = createComponentPlan({ root: env.root, name: "WlScratch", category: "misc", since: "1.0.0-rc.1" });
  applyComponentPlan(plan);
  assert.match(env.read("packages/ui-kit/src/manifest/types.ts"), /WlScratch: "1\.0\.0-rc\.1"/);
  assert.match(env.read("packages/ui-kit/src/components/native-contracts.ts"), /WithNativeAttributes<typeof RawScratch, WlElementAttributes>/);
  assert.match(env.read("packages/ui-kit/src/pt-types.ts"), /scratch: Root<TOpen>/);
  assert.match(env.read("packages/ui-kit/src/manifest/misc.ts"), /Preserve strings such as/);
  assert.match(env.read("packages/ui-kit/styles/base.css"), /\.wl-existing/);
  assert.match(env.read("packages/ui-kit/styles/base.css"), /\.wl-scratch/);
  for (const language of ["en", "ru"]) {
    const messages = JSON.parse(env.read(`apps/playground/src/i18n/messages/documentation.${language}.json`));
    assert.equal(messages.strings.preserved, "Existing text");
    assert.equal(messages.componentSearch.label, "Preserved");
    assert.ok(messages.strings.generatedWlScratchDescription.length > 30);
  }
  for (const file of plan.files.filter((file) => file.path.endsWith(".vue"))) {
    const parsed = parse(file.content, { filename: resolve(env.root, file.path) });
    assert.deepEqual(parsed.errors, []);
    const script = compileScript(parsed.descriptor, { id: "scratch" });
    const result = compileTemplate({ source: parsed.descriptor.template.content, filename: file.path, id: "scratch", compilerOptions: { bindingMetadata: script.bindings } });
    assert.deepEqual(result.errors, []);
  }
  for (const file of plan.files.filter((file) => file.path.endsWith(".ts"))) {
    const result = ts.transpileModule(file.content, {
      fileName: file.path, reportDiagnostics: true, compilerOptions: { target: ts.ScriptTarget.ES2020 }
    });
    assert.deepEqual(result.diagnostics, []);
  }
});

test("all manifest categories use the right guide registry and deterministic output", (t) => {
  const env = fixture(t);
  for (const category of componentCategories) {
    const plan = createComponentPlan({ root: env.root, name: "HTMLPanel", category });
    assert.deepEqual(plan, createComponentPlan({ root: env.root, name: "HTMLPanel", category }));
    assert.ok(plan.files.some((file) => file.path === `packages/ui-kit/src/manifest/${category}.ts`));
    assert.ok(plan.files.some((file) => file.path === `apps/playground/src/documentation/components/${category === "inputs" ? "inputs" : "showcase"}/WlHTMLPanel.vue`));
    assert.ok(plan.files.some((file) => file.content.includes("wl-html-panel")));
  }
});

test("generated public types, examples and guides typecheck in an isolated consumer", (t) => {
  const env = fixture(t);
  cpSync(new URL("../packages/ui-kit/src/", import.meta.url), resolve(env.root, "packages/ui-kit/src"), { recursive: true });
  applyComponentPlan(createComponentPlan({ root: env.root, name: "Scratch", category: "misc" }));
  env.write("apps/playground/src/i18n/index.ts", "export function usePlaygroundI18n() { return { t: (key: string) => key }; }\n");
  const vuePath = fileURLToPath(new URL("../packages/ui-kit/node_modules/vue", import.meta.url)).replaceAll("\\", "/");
  env.write("tsconfig.json", JSON.stringify({
    compilerOptions: {
      target: "ES2020", module: "ESNext", moduleResolution: "bundler", strict: true,
      noUncheckedIndexedAccess: true, skipLibCheck: true, noEmit: true,
      lib: ["ES2020", "DOM", "DOM.Iterable"], types: [],
      jsx: "preserve", jsxImportSource: "vue", resolveJsonModule: true,
      paths: { vue: [vuePath], "vue/*": [vuePath + "/*"], "gavia-ui": ["./packages/ui-kit/src/index.ts"] }
    },
    include: ["packages/ui-kit/src/**/*.ts", "packages/ui-kit/src/**/*.vue", "apps/playground/src/design-system/examples/WlScratch.vue", "apps/playground/src/documentation/components/showcase/WlScratch.vue"],
    vueCompilerOptions: { target: 3.4 }
  }, null, 2));
  const compiler = requireKit.resolve("vue-tsc/bin/vue-tsc.js");
  const result = spawnSync(process.execPath, [compiler, "--noEmit", "-p", resolve(env.root, "tsconfig.json")], { encoding: "utf8", timeout: 60000 });
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test("rejects invalid names, categories, versions and arguments", (t) => {
  const env = fixture(t);
  for (const name of [undefined, "", "Wl", "../Scratch", "scratch", "Scratch.vue", "Scratch-Panel"]) assert.throws(() => createComponentPlan({ root: env.root, name, category: "misc" }));
  assert.throws(() => createComponentPlan({ root: env.root, name: "Scratch", category: "unknown" }), /Category/);
  assert.throws(() => createComponentPlan({ root: env.root, name: "Scratch", category: "misc", since: "latest" }), /semantic version/);
  for (const args of [["Scratch", "--unknown"], ["Scratch", "--category"], ["Scratch", "Other"], ["Scratch", "--since", "--dry-run"]]) assert.throws(() => parseComponentArgs(args));
  assert.deepEqual(parseComponentArgs(["Scratch", "--category", "data", "--dry-run"]), { name: "Scratch", category: "data", dryRun: true });
});

test("rejects file, component and pt collisions before any output is written", (t) => {
  const env = fixture(t);
  const options = { root: env.root, name: "Scratch", category: "misc" };
  env.write("packages/ui-kit/src/components/WlScratch.vue", "existing author work");
  const before = snapshot(env.root);
  assert.throws(() => createComponentPlan(options), /overwrite existing file/);
  assert.deepEqual(snapshot(env.root), before);
  assert.throws(() => createComponentPlan({ ...options, name: "Existing" }), /already registered/);
  const ptEnv = fixture(t);
  ptEnv.write("packages/ui-kit/src/pt-types.ts", "export interface WlPtMap<TOpen extends boolean = true> { scratch: Root<TOpen>; }");
  assert.throws(() => createComponentPlan({ ...options, root: ptEnv.root, name: "SCRATCH" }), /pt name scratch already exists/);
});

test("rejects unexpected registry shapes and translation collisions without writes", (t) => {
  const env = fixture(t);
  const options = { root: env.root, name: "Scratch", category: "misc" };
  env.write("packages/ui-kit/src/manifest/misc.ts", "export const miscManifest = [];\n");
  const before = snapshot(env.root);
  assert.throws(() => createComponentPlan(options), /stable insertion anchor/);
  assert.deepEqual(snapshot(env.root), before);
  env.write("packages/ui-kit/src/manifest/misc.ts", "export const miscManifest = defineComponentManifest([]);\n");
  env.write("apps/playground/src/i18n/messages/documentation.en.json", JSON.stringify({ strings: { generatedWlScratchTitle: "Already authored" } }));
  assert.throws(() => createComponentPlan(options), /translation key exists/);
});

test("stale plans cannot overwrite edits or create partial scaffolds", (t) => {
  const env = fixture(t);
  const plan = createComponentPlan({ root: env.root, name: "Scratch", category: "misc" });
  env.write("packages/ui-kit/styles/base.css", "/* concurrently authored CSS */\n");
  const before = snapshot(env.root);
  assert.throws(() => applyComponentPlan(plan), /changed after planning/);
  assert.deepEqual(snapshot(env.root), before);
});

test("rejects symlink output ancestors before writing", (t) => {
  const env = fixture(t);
  const external = resolve(env.root, "external");
  mkdirSync(external);
  const link = resolve(env.root, "apps/playground/src/design-system");
  mkdirSync(dirname(link), { recursive: true });
  try {
    symlinkSync(external, link, process.platform === "win32" ? "junction" : "dir");
  } catch (error) {
    if (error.code === "EPERM" || error.code === "EACCES") {
      t.skip("Symlink creation is unavailable");
      return;
    }
    throw error;
  }
  assert.throws(() => createComponentPlan({ root: env.root, name: "Scratch", category: "misc" }), /symlink output/);
  assert.deepEqual(readdirSync(external), []);
});

test("CLI dry-run is reviewable and errors return a nonzero status", (t) => {
  const env = fixture(t);
  const before = snapshot(env.root);
  const result = spawnSync(process.execPath, [command, "Scratch", "--category", "data", "--root", env.root, "--dry-run"], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Would scaffold WlScratch/);
  assert.match(result.stdout, /manifest\/data\.ts/);
  assert.deepEqual(snapshot(env.root), before);
  const invalid = spawnSync(process.execPath, [command, "Scratch", "--category", "bad", "--root", env.root], { encoding: "utf8" });
  assert.equal(invalid.status, 1);
  assert.match(invalid.stderr, /Category must be one of/);
});
