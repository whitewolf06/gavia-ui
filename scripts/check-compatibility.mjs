import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { loadMigrationPolicy, isApprovedMigration, migrationTypeHelpers, migrationPropsProjection } from "./compatibility-migration.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const kitDir = join(repoRoot, "packages/ui-kit");
const fixtureDir = join(kitDir, "tests/fixtures");
const versions = readdirSync(fixtureDir)
  .filter((name) => /^compatibility-\d+\.\d+\.\d+$/.test(name))
  .map((name) => name.slice("compatibility-".length))
  .sort((a, b) => {
    const left = a.split(".").map(Number);
    const right = b.split(".").map(Number);
    return left[0] - right[0] || left[1] - right[1] || left[2] - right[2];
  });
let baselineDir = join(fixtureDir, `compatibility-${versions.at(-1) ?? "0.9.1"}`);
const require = createRequire(join(kitDir, "package.json"));
// Historical 0.9.1 declarations were emitted using Vue 3.5's declaration ABI.
// Compare semantics in that type environment; the consumer below still compiles
// with the library's minimum Vue 3.4, and packed consumer CI checks both versions.
const semanticRequire = createRequire(join(repoRoot, "apps/playground/package.json"));
const semanticVuePackage = semanticRequire.resolve("vue/package.json");
const semanticVueTypes = resolve(dirname(semanticVuePackage), JSON.parse(readFileSync(semanticVuePackage, "utf8")).types);

function files(directory, extension) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? files(path, extension) : entry.name.endsWith(extension) ? [path] : [];
  }).sort();
}
function removeTemporary(path) {
  const target = resolve(path);
  const within = relative(join(kitDir, ".tmp"), target);
  if (!within || within.startsWith("..") || isAbsolute(within)) throw new Error(`Unsafe cleanup target: ${target}`);
  rmSync(target, { recursive: true, force: true });
}
function readJson(path) { return JSON.parse(readFileSync(path, "utf8")); }
function sorted(values) { return [...new Set(values)].sort(); }
export function subset(previous, current, label, errors) {
  const available = new Set(current);
  for (const value of previous) if (!available.has(value)) errors.push(`${label}: removed ${value}`);
}
function ptPaths(value, prefix = "") {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  return Object.entries(value).flatMap(([name, item]) => {
    const path = prefix ? `${prefix}.${name}` : name;
    return [path, ...ptPaths(item, path)];
  }).sort();
}
async function inventory(root) {
  const kit = join(root, "packages/ui-kit");
  const dist = join(kit, "dist");
  if (!existsSync(join(dist, "index.d.ts"))) throw new Error(`Build the library first: ${dist}`);
  const api = await import(pathToFileURL(join(dist, "index.js")).href);
  const markers = {};
  for (const file of files(join(kit, "src/components"), ".vue")) {
    markers[relative(join(kit, "src/components"), file).replaceAll("\\", "/")] = sorted(
      [...readFileSync(file, "utf8").matchAll(/\bdata-wl="([^"]+)"/g)].map((match) => match[1])
    );
  }
  const css = files(join(kit, "styles"), ".css").map((file) => readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "")).join("\n");
  const packageJson = readJson(join(kit, "package.json"));
  const tokens = readJson(join(kit, "tokens/source.json"));
  return {
    version: packageJson.version,
    exports: Object.fromEntries(Object.entries(packageJson.exports).map(([name, target]) => [name, typeof target === "string" ? [] : Object.keys(target).sort()])),
    runtimeExports: Object.keys(api).sort(),
    components: api.wlManifest.map((component) => component.name).sort(),
    classes: sorted([...css.matchAll(/(?<![A-Za-z0-9_-])\.(wl-[A-Za-z0-9_-]+)/g)].map((match) => match[1])),
    markers,
    tokens: tokens.tokens.map((token) => token.name).sort(),
    themes: tokens.themes.map((theme) => theme.name).sort(),
    pt: ptPaths(api.createWlPt())
  };
}
export function compilerOptions(ts) {
  return { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, strict: true, noEmit: true, skipLibCheck: false, types: [], paths: { vue: [semanticVueTypes] }, lib: ["lib.esnext.d.ts", "lib.dom.d.ts", "lib.dom.iterable.d.ts"] };
}
function publicTypes(ts, entry) {
  const program = ts.createProgram([entry], compilerOptions(ts));
  const checker = program.getTypeChecker();
  const module = checker.getSymbolAtLocation(program.getSourceFile(entry));
  return checker.getExportsOfModule(module).map((symbol) => {
    const target = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
    const declarations = target.declarations ?? [];
    const typeDeclaration = declarations.find((node) => ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node));
    const valueType = target.flags & ts.SymbolFlags.Value ? checker.getTypeOfSymbolAtLocation(target, declarations[0]) : undefined;
    const genericParameters = Math.max(0, ...(valueType?.getCallSignatures() ?? []).map((signature) => signature.typeParameters?.length ?? 0));
    return { name: symbol.name, type: !!(target.flags & ts.SymbolFlags.Type), value: !!(target.flags & ts.SymbolFlags.Value), callable: declarations.some((node) => ts.isFunctionDeclaration(node)), requiredParameters: (typeDeclaration?.typeParameters ?? []).filter((parameter) => !parameter.default).length, ...(genericParameters ? { genericParameters } : {}) };
  }).sort((a, b) => a.name.localeCompare(b.name, "en"));
}
// Historical self-checks can disable candidate data generics. New baselines
// record callable generic parameters from the released declarations, so each
// side is specialized in the same runtime domain without migration approval.
export function typeSource(baseline, migration = null, { currentHasGenericDataContracts = true } = {}) {
  if (migration && !isApprovedMigration(migration)) throw new Error("Typed migration projections require validated approval");
  const lines = [
    'import type * as Previous from "./previous/index";',
    'import * as Current from "./current/index";',
    'import type { ComponentPublicInstance, VNodeProps, AllowedComponentProps, ComponentCustomProps } from "vue";',
    'type Assert<T extends true> = T;',
    'type Assignable<A, B> = [A] extends [B] ? true : false;',
    // Conditional extraction + Omit can retain misleading object variance.
    // Check each field too, especially handler payloads; whole object assignment
    // still catches newly required fields that are absent from the old contract.
    'type InputsAccepted<A, B> = Assignable<A, B> extends true ? { [K in keyof A]-?: K extends keyof B ? Assignable<A[K], B[K]> : false }[keyof A] extends true | never ? true : false : false;',
    'type VueProps = VNodeProps & AllowedComponentProps & ComponentCustomProps;',
    'type Instance<T> = T extends abstract new (...args: any[]) => infer I ? I : never;',
    'type RawProps<T> = [Instance<T>] extends [never] ? T extends (...args: any[]) => any ? Parameters<T>[0] : never : Instance<T> extends { $props: infer P } ? P : never;',
    'type Props<T> = Omit<RawProps<T>, keyof VueProps>;',
    'type RuntimeDomain<P, Key extends keyof P, Value, Required extends boolean> = Omit<P, Key> & (Required extends true ? { [K in Key]-?: Value } : { [K in Key]?: Value });',
    'type Named<T> = { [K in keyof T as string extends K ? never : number extends K ? never : symbol extends K ? never : K]: T[K] };',
    'type RawSlots<T> = [Instance<T>] extends [never] ? T extends (props: any, context?: infer C, ...args: any[]) => any ? NonNullable<C> extends { slots: infer S } ? S : {} : {} : Instance<T> extends { $slots: infer S } ? S : {};',
    'type Slots<T> = Named<RawSlots<T>>;',
    'type CallableContext<T> = T extends (...args: any[]) => { __ctx?: infer C } ? NonNullable<C> : never;',
    'type CallableExposed<T> = [CallableContext<T>] extends [never] ? {} : CallableContext<T> extends { expose: (exposed: infer E) => any } ? E : {};',
    'type Exposed<T> = Omit<[Instance<T>] extends [never] ? CallableExposed<T> : Instance<T>, keyof ComponentPublicInstance | keyof RawProps<T>>;',
    'type KeysPreserved<A, B> = Exclude<keyof A, keyof B> extends never ? true : false;',
    'type AcceptedSlots<A, B> = { [K in keyof A]-?: K extends keyof B ? Assignable<A[K], B[K]> : false }[keyof A] extends true | never ? true : false;'
  ];
  if (migration) lines.push(...migrationTypeHelpers(migration));
  for (const name of baseline.components) {
    const previous = `typeof Previous.${name}`;
    const previousGeneric = baseline.declarationExports.some((item) => item.name === name && item.genericParameters > 0);
    let branches = [{ old: previous, current: `typeof Current.${name}`, props: `Props<${previous}>` }];
    if (name === "WlDatePicker") {
      branches = ['"single"', '"range"'].map((mode) => ({
        old: `${previous}<${mode}>`, current: `typeof Current.${name}<${mode}>`, props: `Props<${previous}<${mode}>>`
      }));
    } else if (currentHasGenericDataContracts && name === "WlTable") {
      // Generic erasure uses Row=object instead of the declared dictionary default.
      branches[0].current += "<Current.WlTableRow>";
      if (previousGeneric) {
        branches[0].old += "<Previous.WlTableRow>";
        branches[0].props = `Props<${branches[0].old}>`;
      }
    } else if (currentHasGenericDataContracts && name === "WlAutocomplete") {
      branches = ["false", "true", "boolean"].map((mode, index) => {
        const old = previousGeneric ? `${previous}<unknown, ${mode}>` : previous;
        return { old, current: `typeof Current.${name}<unknown, ${mode}>`,
          props: `RuntimeDomain<Props<${old}>, "multiple", ${mode}, ${index !== 0}>` };
      });
    } else if (currentHasGenericDataContracts && (name === "WlSelect" || name === "WlMultiSelect")) {
      const resolver = `NonNullable<Props<${previous}>["optionValue"]>`;
      branches = ["undefined", resolver].map((mode, index) => {
        const old = previousGeneric ? `${previous}<unknown, ${mode}>` : previous;
        return { old, current: `typeof Current.${name}<unknown, ${mode}>`,
          props: `RuntimeDomain<Props<${old}>, "optionValue", ${mode}, ${index !== 0}>` };
      });
    }
    // Compare every matching runtime domain. The unapproved path specializes
    // only the mode prop; approved migrations replace exact reviewed fields.
    // Slot and exposed contracts are always compared with the released original.
    for (let index = 0; index < branches.length; index += 1) {
      const { old, current, props: originalProps } = branches[index];
      const props = migration ? migrationPropsProjection(migration, name, index, originalProps) : originalProps;
      const id = `${name}_${index}`;
      lines.push(`type ${id}_propNames = Assert<KeysPreserved<Props<${old}>, Props<${current}>>>;`);
      lines.push(`type ${id}_inputsAndHandlers = Assert<InputsAccepted<${props}, Props<${current}>>>;`);
      lines.push(`type ${id}_slotNames = Assert<KeysPreserved<Slots<${old}>, Slots<${current}>>>;`);
      lines.push(`type ${id}_slotPayloads = Assert<AcceptedSlots<Slots<${old}>, Slots<${current}>>>;`);
      if (name !== "WlDatePicker") {
        lines.push(`type ${id}_exposedNames = Assert<KeysPreserved<Exposed<${old}>, Exposed<${current}>>>;`);
        lines.push(`type ${id}_exposedMethods = Assert<Assignable<Exposed<${current}>, Exposed<${old}>>>;`);
      }
    }
  }
  for (const item of baseline.declarationExports) {
    if (item.type && !item.requiredParameters) {
      lines.push(`type Public_${item.name} = Assert<Assignable<Previous.${item.name}, Current.${item.name}>>;`);
      lines.push(`type Public_${item.name}_keys = Assert<KeysPreserved<Named<Previous.${item.name}>, Named<Current.${item.name}>>>;`);
    }
    if (item.callable) {
      lines.push(`declare const args_${item.name}: Parameters<typeof Previous.${item.name}>;`);
      lines.push(`Current.${item.name}(...args_${item.name});`);
      // Icon names are an extensible catalog: new names may appear in resolver output.
      if (item.name !== "resolveWlIconName") {
        const previousReturn = migration && item.name === "createWlPt" ? "Record<string, unknown>" : `ReturnType<typeof Previous.${item.name}>`;
        lines.push(`type Return_${item.name} = Assert<Assignable<ReturnType<typeof Current.${item.name}>, ${previousReturn}>>;`);
      }
    }
  }
  return `${lines.join("\n")}\n`;
}

export function capturedConsumer(sourceRoot, previousBaselineDir, previousBaseline, releaseVersion) {
  const consumer = readFileSync(join(previousBaselineDir, "consumer.vue"), "utf8").replaceAll("\r\n", "\n");
  const migration = loadMigrationPolicy(sourceRoot, previousBaselineDir, previousBaseline, releaseVersion);
  return migration ? migration.migratedConsumer : consumer;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === "--help") {
    console.log("After pnpm build: node scripts/check-compatibility.mjs\n"
      + "Capture a new stable release: node scripts/check-compatibility.mjs --capture-baseline <stable version> <built tagged release checkout>\n"
      + "The most recent stable baseline is selected automatically; historical baselines cannot be overwritten.");
    return;
  }
  if (args[0] === "--capture-baseline") {
    if (args.length !== 3 || !/^\d+\.\d+\.\d+$/.test(args[1])) throw new Error("Usage: node scripts/check-compatibility.mjs --capture-baseline <stable version> <built release checkout>");
    const previousBaselineDir = baselineDir;
    const previousBaseline = readJson(join(previousBaselineDir, "contract.json"));
    baselineDir = join(fixtureDir, `compatibility-${args[1]}`);
    if (existsSync(baselineDir)) throw new Error(`A release baseline is immutable; refusing to overwrite ${args[1]}`);
    const sourceRoot = resolve(args[2]);
    const releaseRef = `v${args[1]}`;
    const releaseCommit = execFileSync("git", ["rev-parse", `${releaseRef}^{commit}`], { cwd: sourceRoot, encoding: "utf8" }).trim();
    const sourceCommit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: sourceRoot, encoding: "utf8" }).trim();
    if (sourceCommit !== releaseCommit) throw new Error("Release baseline source must be checked out at the exact release tag");
    // Pin API source and the reviewed policy used to freeze its consumer.
    const publicPaths = ["packages/ui-kit/src", "packages/ui-kit/styles", "packages/ui-kit/themes", "packages/ui-kit/tokens", "packages/ui-kit/package.json", "packages/ui-kit/tests/fixtures", "scripts/migrations", "docs/migration-0.11.0.md"];
    execFileSync("git", ["diff", "--quiet", releaseRef, "--", ...publicPaths], { cwd: sourceRoot });
    const dirty = execFileSync("git", ["status", "--porcelain", "--untracked-files=all", "--", ...publicPaths], { cwd: sourceRoot, encoding: "utf8" }).trim();
    if (dirty) throw new Error("Release baseline source must have no uncommitted public API files");
    const snapshot = await inventory(sourceRoot);
    if (snapshot.version !== args[1]) throw new Error("Source checkout must match the released version");
    const ts = createRequire(join(sourceRoot, "packages/ui-kit/package.json"))("typescript");
    snapshot.declarationExports = publicTypes(ts, join(sourceRoot, "packages/ui-kit/dist/index.d.ts"));
    const consumer = capturedConsumer(sourceRoot, previousBaselineDir, previousBaseline, snapshot.version);
    snapshot.schemaVersion = 1;
    snapshot.releaseCommit = releaseCommit;
    snapshot.declarationHashes = {};
    for (const path of files(join(sourceRoot, "packages/ui-kit/dist"), ".d.ts")) {
      const name = relative(join(sourceRoot, "packages/ui-kit/dist"), path).replaceAll("\\", "/");
      const contents = readFileSync(path, "utf8").replaceAll("\r\n", "\n");
      const destination = join(baselineDir, "declarations", name);
      mkdirSync(dirname(destination), { recursive: true });
      writeFileSync(destination, contents);
      snapshot.declarationHashes[name] = createHash("sha256").update(contents).digest("hex");
    }
    writeFileSync(join(baselineDir, "consumer.vue"), consumer);
    writeFileSync(join(baselineDir, "contract.json"), `${JSON.stringify(snapshot, null, 2)}\n`);
    console.log(`Captured released ${snapshot.version}: ${snapshot.components.length} components, ${snapshot.tokens.length} tokens, ${snapshot.declarationExports.length} public declarations.`);
    return;
  }
  if (args.length) throw new Error("Usage: node scripts/check-compatibility.mjs");
  const baseline = readJson(join(baselineDir, "contract.json"));
  const current = await inventory(repoRoot);
  const migration = loadMigrationPolicy(repoRoot, baselineDir, baseline, current.version);
  const errors = [];
  for (const [name, conditions] of Object.entries(baseline.exports)) {
    if (!(name in current.exports)) errors.push(`package exports: removed ${name}`);
    else subset(conditions, current.exports[name], `package exports ${name}`, errors);
  }
  for (const key of ["runtimeExports", "components", "classes", "tokens", "themes", "pt"]) subset(baseline[key], current[key], key, errors);
  for (const [file, markers] of Object.entries(baseline.markers)) subset(markers, current.markers[file] ?? [], `data-wl ${file}`, errors);
  for (const [name, expected] of Object.entries(baseline.declarationHashes)) {
    const actual = createHash("sha256").update(readFileSync(join(baselineDir, "declarations", name), "utf8").replaceAll("\r\n", "\n")).digest("hex");
    if (actual !== expected) errors.push(`Released declaration fixture changed: ${name}`);
  }
  const ts = require("typescript");
  const names = publicTypes(ts, join(kitDir, "dist/index.d.ts"));
  subset(baseline.declarationExports.map((item) => item.name), names.map((item) => item.name), "declaration exports", errors);
  if (errors.length) throw new Error(errors.join("\n"));
  const temporaryBase = join(kitDir, ".tmp");
  mkdirSync(temporaryBase, { recursive: true });
  const temporary = mkdtempSync(join(temporaryBase, "compatibility-"));
  try {
    const renderSource = (approval) => typeSource(baseline, approval)
      .replace('"./previous/index"', JSON.stringify(join(baselineDir, "declarations/index").replaceAll("\\", "/")))
      .replace('"./current/index"', JSON.stringify(join(kitDir, "dist/index").replaceAll("\\", "/")));
    const semanticCheck = (name, approval) => {
      const sourcePath = join(temporary, `${name}.ts`);
      writeFileSync(sourcePath, renderSource(approval));
      const program = ts.createProgram([sourcePath], compilerOptions(ts));
      return ts.formatDiagnosticsWithColorAndContext(ts.getPreEmitDiagnostics(program), {
        getCanonicalFileName: (file) => file, getCurrentDirectory: () => repoRoot, getNewLine: () => "\n"
      });
    };
    const consumerCheck = (name, consumerPath) => {
      const config = {
        compilerOptions: { target: "ES2022", module: "ESNext", moduleResolution: "Bundler", strict: true, noEmit: true, skipLibCheck: false, lib: ["ESNext", "DOM", "DOM.Iterable"], types: [], paths: { "gavia-ui": [join(kitDir, "dist/index.d.ts").replaceAll("\\", "/")] } },
        vueCompilerOptions: { strictTemplates: true, dataAttributes: ["data-*"] },
        files: [consumerPath]
      };
      const configPath = join(temporary, `${name}.json`);
      writeFileSync(configPath, JSON.stringify(config));
      try {
        execFileSync(process.execPath, [require.resolve("vue-tsc/bin/vue-tsc.js"), "--noEmit", "-p", configPath], { cwd: kitDir, encoding: "utf8", stdio: "pipe" });
        return "";
      } catch (error) {
        // Infrastructure failures are not API migrations.
        if (![1, 2].includes(error.status) || !error.stdout?.includes("error TS")) throw error;
        return error.stdout + (error.stderr ?? "");
      }
    };
    // Report the original released contract and app even with approved migration.
    // They remain frozen: every projection is applied to an independent copy.
    const rawContract = semanticCheck("released-contract", null);
    const rawConsumer = consumerCheck("released-consumer", join(baselineDir, "consumer.vue"));
    if (migration) {
      console.log(`Released ${baseline.version} differences before approved ${migration.targetMinor} migration (${migration.migrationNote}):`);
      console.log(rawContract || "Released declaration contract passed without migration.");
      console.log(rawConsumer || "Released Vue consumer passed without migration.");
      const migratedContract = semanticCheck("migrated-contract", migration);
      if (migratedContract) errors.push(migratedContract);
      const migratedConsumerPath = join(temporary, "migrated-consumer.vue");
      writeFileSync(migratedConsumerPath, migration.migratedConsumer);
      const migratedConsumer = consumerCheck("migrated-consumer", migratedConsumerPath);
      if (migratedConsumer) errors.push(`Approved ${migration.targetMinor} migrated consumer failed:\n${migratedConsumer}`);
    } else {
      if (rawContract) errors.push(rawContract);
      if (rawConsumer) errors.push(`Released ${baseline.version} Vue consumer failed:\n${rawConsumer}`);
    }
  } finally { removeTemporary(temporary); }
  if (errors.length) throw new Error(errors.join("\n"));
  const boundary = migration ? `Compatibility with ${baseline.version} after approved ${migration.targetMinor} migration passed` : `Compatibility with ${baseline.version} passed`;
  console.log(`${boundary}: ${baseline.components.length} components, public types/events/slots/models, ${baseline.classes.length} CSS classes, ${baseline.tokens.length} tokens, exports, data-wl and pt sections.`);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
