import "./compatibility-migration.test.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, cpSync, symlinkSync, rmSync, existsSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { releaseChannel } from "./release-channel.mjs";
import { packageChangelog, releaseNotes, releaseDocsLinks, normalizeMarkdownNotes } from "./release-notes.mjs";
import { prepareChangelog, promotionNotes } from "./version-release.mjs";
import { assertPortableHtml } from "./archive-playground.mjs";
import { compilerOptions, typeSource } from "./check-compatibility.mjs";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));

test("stable archive goes to latest; previews never replace latest", () => {
  assert.equal(releaseChannel("0.9.2"), "latest");
  for (const version of ["0.10.0-beta.0", "1.0.0-rc.1", "0.9.2-alpha.12"]) {
    assert.equal(releaseChannel(version), "next");
  }
});

test("malformed and unknown prerelease versions fail before publication", () => {
  for (const version of ["v0.9.2", "0.9", "0.9.2-preview.1", "0.9.2-beta", "00.9.2", "0.9.2-beta.01", "0.9.2-beta.0+build"]) {
    assert.throws(() => releaseChannel(version));
  }
});

test("release notes select the exact version without leaking adjacent releases", () => {
  const source = "# Changelog\n\n## Unreleased\nDraft\n\n## 0.9.2 — prepared\nNew release\n\n## 0.9.1 — 2026-10-07\nOld release\n";
  assert.equal(releaseNotes(source, "0.9.2"), "New release");
  assert.throws(() => releaseNotes(source, "0.9.20"));
  assert.equal(releaseNotes("## [0.9.2] — prepared\nChecked notes\n", "0.9.2"), "Checked notes");
});

test("empty and duplicate release headings do not become release notes", () => {
  for (const source of ["## 0.9.2", "## 0.9.2\n\n", "## 0.9.2\nA\n## 0.9.2\nB\n", "## [0.9.2]garbage\nA\n"]) {
    assert.throws(() => releaseNotes(source, "0.9.2"));
  }
});

test("preparation preserves introduction/history and rejects duplicate unreleased sections", () => {
  const source = "# Changelog\n\nProject introduction.\n\n## 0.9.1\nPrevious.\n";
  const prepared = prepareChangelog(source, "0.9.2", ["New fix."]);
  assert.equal(prepared.match(/^# Changelog$/gm).length, 1);
  assert.match(prepared, /Project introduction\.\n\n## Unreleased/);
  assert.equal(releaseNotes(prepared, "0.9.2"), "### Changesets\n\nNew fix.");
  assert.equal(releaseNotes(prepared, "0.9.1"), "Previous.");
  assert.throws(() => prepareChangelog("## Unreleased\nA\n## Unreleased\nB\n", "0.9.2", ["Notes."]));
});

test("portable preview rejects root-relative assets for root and GitHub Pages bases", () => {
  for (const source of ['<script src="/assets/app.js"></script>', '<script src="/gavia-ui/assets/app.js"></script>', "<link href='/gavia-ui/assets/app.css'>", '<img src = "/logo.svg">']) {
    assert.throws(() => assertPortableHtml(source));
  }
  assert.doesNotThrow(() => assertPortableHtml('<script src="./assets/app.js"></script><link href="./assets/app.css"><a href="#font">Font</a>'));
});

function versionFixture(callback) {
  const base = join(root, ".tmp");
  mkdirSync(base, { recursive: true });
  const fixture = mkdtempSync(join(base, "version-fixture-"));
  const put = (path, value) => {
    const full = join(fixture, path);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, typeof value === "string" ? value : JSON.stringify(value, null, 2));
  };
  const run = (args, expected = 0) => {
    const result = spawnSync(process.execPath, args, { cwd: fixture, encoding: "utf8" });
    assert.equal(result.status, expected, result.stdout + result.stderr);
    return result;
  };
  try {
    put("package.json", { name: "gavia-ui-workspace", private: true, version: "0.9.1" });
    put("pnpm-workspace.yaml", 'packages:\n  - "packages/*"\n  - "apps/*"\n');
    put("packages/ui-kit/package.json", { name: "gavia-ui", version: "0.9.1" });
    put("apps/playground/package.json", { name: "gavia-ui-playground", private: true, version: "0.1.0" });
    const changelog = "# Changelog\n\n## Unreleased\n\n- Consumer-facing note: [guide](docs/quality.md).\n\n## 0.9.1 — 2026-10-07\n\n- Previous release: [migration](docs/migration-0.9.md).\n";
    put("CHANGELOG.md", changelog);
    put("packages/ui-kit/CHANGELOG.md", packageChangelog(changelog));
    put(".changeset/fixture.md", '---\n"gavia-ui": patch\n---\n\nA checked fix with [docs](docs/design-system.md).\n');
    cpSync(join(root, ".changeset/config.json"), join(fixture, ".changeset/config.json"));
    mkdirSync(join(fixture, "scripts"));
    mkdirSync(join(fixture, "docs"));
    for (const file of ["version-release.mjs", "release-notes.mjs"]) {
      cpSync(join(root, "scripts", file), join(fixture, "scripts", file));
    }
    symlinkSync(join(root, "node_modules"), join(fixture, "node_modules"), process.platform === "win32" ? "junction" : "dir");
    callback({ fixture, put, run, changelog });
  } finally {
    assert.equal(dirname(fixture), base, "cleanup must stay in the worktree .tmp directory");
    rmSync(fixture, { recursive: true, force: true });
  }
}

for (const prerelease of [false, true]) {
  test(`real Changesets ${prerelease ? "beta" : "patch"} preparation synchronizes versions and package docs links`, () => {
    versionFixture(({ fixture, put, run }) => {
      const cli = join(fixture, "node_modules/@changesets/cli/bin.js");
      const wrapper = join(fixture, "scripts/version-release.mjs");
      if (prerelease) run([cli, "pre", "enter", "beta"]);
      run([wrapper]);
      const kit = JSON.parse(readFileSync(join(fixture, "packages/ui-kit/package.json"), "utf8"));
      const workspace = JSON.parse(readFileSync(join(fixture, "package.json"), "utf8"));
      assert.equal(kit.version, prerelease ? "0.9.2-beta.0" : "0.9.2");
      assert.equal(workspace.version, kit.version);
      const result = readFileSync(join(fixture, "CHANGELOG.md"), "utf8");
      const packaged = readFileSync(join(fixture, "packages/ui-kit/CHANGELOG.md"), "utf8");
      assert.equal(packaged, packageChangelog(result));
      assert.match(result, /\(docs\/quality\.md\)/);
      assert.match(packaged, /\(https:\/\/github\.com\/whitewolf06\/gavia-ui\/blob\/main\/docs\/quality\.md\)/);
      assert.match(packaged, /\/docs\/design-system\.md\)/);
      assert.match(packaged, /\/docs\/migration-0\.9\.md\)/);
      assert.match(result, /## Unreleased\n\n## 0\.9\.2/);
      assert.match(releaseNotes(result, kit.version), /Consumer-facing note/);
      assert.match(releaseNotes(result, kit.version), /A checked fix/);
      assert.match(readFileSync(join(fixture, "docs/migration-" + kit.version + ".md"), "utf8"), /TODO/);
      if (prerelease) {
        const secondPreview = result.replace("## Unreleased\n\n", "## Unreleased\n\n- Editorial note for the second preview.\n\n");
        put("CHANGELOG.md", secondPreview);
        put("packages/ui-kit/CHANGELOG.md", packageChangelog(secondPreview));
        put(".changeset/second.md", '---\n"gavia-ui": patch\n---\n\nSecond checked fix.\n');
        run([wrapper]);
        assert.equal(JSON.parse(readFileSync(join(fixture, "package.json"), "utf8")).version, "0.9.2-beta.1");
        run([cli, "pre", "exit"]);
        run([wrapper]);
        assert.equal(JSON.parse(readFileSync(join(fixture, "package.json"), "utf8")).version, "0.9.2");
        const stable = readFileSync(join(fixture, "CHANGELOG.md"), "utf8");
        const stableNotes = releaseNotes(stable, "0.9.2");
        assert.match(stableNotes, /Consumer-facing note/);
        assert.match(stableNotes, /Editorial note for the second preview/);
        assert.equal(stableNotes.match(/A checked fix/g).length, 1);
        assert.equal(stableNotes.match(/Second checked fix/g).length, 1);
        assert.match(releaseNotes(stable, "0.9.2-beta.0"), /A checked fix/);
      }
    });
  });
}

test("empty changeset notes fail before consuming files or changing versions", () => {
  versionFixture(({ fixture, put, run }) => {
    put(".changeset/fixture.md", '---\n"gavia-ui": patch\n---\n');
    run([join(fixture, "scripts/version-release.mjs")], 1);
    assert.equal(JSON.parse(readFileSync(join(fixture, "package.json"), "utf8")).version, "0.9.1");
    assert.equal(JSON.parse(readFileSync(join(fixture, "packages/ui-kit/package.json"), "utf8")).version, "0.9.1");
    assert.ok(existsSync(join(fixture, ".changeset/fixture.md")));
  });
});

test("unfinished migration blocks release-notes publication check", () => {
  versionFixture(({ fixture, put, run }) => {
    run([join(fixture, "scripts/version-release.mjs")]);
    run([join(fixture, "scripts/release-notes.mjs"), "--check"], 1);
    put("docs/migration-0.9.2.md", "# Migration\n\nCompatible patch. No consumer changes required.\n");
    run([join(fixture, "scripts/release-notes.mjs"), "--check"]);
    const rendered = run([join(fixture, "scripts/release-notes.mjs")]).stdout;
    assert.match(rendered, /\(https:\/\/github\.com\/whitewolf06\/gavia-ui\/blob\/v0\.9\.2\/docs\/quality\.md\)/);
    assert.doesNotMatch(rendered, /\(docs\//);
    assert.match(rendered, /### Release playground\n\nExtract gavia-ui-playground-0\.9\.2\.tgz/);
    assert.match(rendered, /current public documentation is on GitHub Pages\./);
    assert.doesNotMatch(rendered, /Витрина этого выпуска|Распакуйте/);
    assert.match(readFileSync(join(fixture, "CHANGELOG.md"), "utf8"), /\(docs\/quality\.md\)/);
  });
});

test("preview provenance rejects mismatched versions and distinguishes clean, tracked and untracked changes", () => {
  const base = join(root, ".tmp");
  mkdirSync(base, { recursive: true });
  const fixture = mkdtempSync(join(base, "preview-fixture-"));
  const put = (path, value) => {
    const full = join(fixture, path);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, typeof value === "string" ? value : JSON.stringify(value));
  };
  const run = (command, args, expected = 0) => {
    const result = spawnSync(command, args, { cwd: fixture, encoding: "utf8" });
    assert.equal(result.status, expected, result.stdout + result.stderr);
    return result;
  };
  const archive = join(fixture, ".tmp/release-previews/gavia-ui-playground-0.9.1.tgz");
  const metadata = () => JSON.parse(run("tar", ["-xOf", archive, "./release-preview.json"]).stdout);
  try {
    put("package.json", { name: "gavia-ui-workspace", private: true, version: "0.9.2" });
    put("packages/ui-kit/package.json", { name: "gavia-ui", version: "0.9.1" });
    put("apps/playground/dist/index.html", '<script src="./assets/app.js"></script>');
    put(".gitignore", "dist/\n.tmp/\n");
    for (const file of ["archive-playground.mjs", "release-channel.mjs"]) {
      mkdirSync(join(fixture, "scripts"), { recursive: true });
      cpSync(join(root, "scripts", file), join(fixture, "scripts", file));
    }
    const script = join(fixture, "scripts/archive-playground.mjs");
    assert.match(run(process.execPath, [script], 1).stderr, /Root\/package versions differ/);
    assert.equal(existsSync(archive), false);
    assert.equal(existsSync(join(fixture, "apps/playground/dist/release-preview.json")), false);

    put("package.json", { name: "gavia-ui-workspace", private: true, version: "0.9.1" });
    run("git", ["init", "--quiet"]);
    run("git", ["add", "package.json", "packages/ui-kit/package.json", ".gitignore", "scripts"]);
    run("git", ["-c", "user.name=Release fixture", "-c", "user.email=fixture@example.invalid", "commit", "--quiet", "-m", "Create fixture"]);
    const commit = run("git", ["rev-parse", "HEAD"]).stdout.trim();
    run(process.execPath, [script]);
    assert.equal(metadata().dirty, false, "ignored build/archive output must not mark a clean checkout dirty");
    assert.equal(metadata().commit, commit);
    assert.equal(metadata().version, "0.9.1");

    put("local-candidate.txt", "Uncommitted source.\n");
    run(process.execPath, [script]);
    assert.equal(metadata().dirty, true, "nonignored untracked source must be recorded");
    rmSync(join(fixture, "local-candidate.txt"));
    put("package.json", { name: "gavia-ui-workspace", private: true, version: "0.9.1", description: "Uncommitted candidate" });
    run(process.execPath, [script]);
    assert.equal(metadata().dirty, true, "tracked source edits must be recorded");
    assert.equal(metadata().commit, commit, "base commit stays distinct from uncommitted candidate changes");
  } finally {
    assert.equal(dirname(fixture), base, "cleanup must stay in the worktree .tmp directory");
    rmSync(fixture, { recursive: true, force: true });
  }
});

test("Markdown notes preserve heading hierarchy and code fences through release extraction", () => {
  const code = ["````md", "## 0.9.2", "```", "## Code heading", "````", "~~~", "Title", "===", "## 0.9.1", "~~~", "    ## Indented code"].join("\n");
  const notes = ["# Scope", "Intro.", "", "## Details", "Important migration step.", "", "### Nested", "Nested step.", "", code, "", "After all code."].join("\n");
  const normalized = normalizeMarkdownNotes(notes, "fixture.md");
  assert.match(normalized, /^### Scope\n/m);
  assert.match(normalized, /^#### Details\n/m);
  assert.match(normalized, /^##### Nested\n/m);
  assert.ok(normalized.includes(code), "fenced and indented code must be preserved verbatim");
  const source = "# Changelog\n\n## Unreleased\n\nManual note.\n\n```md\n## Unreleased\n```\n\nManual ending.\n\n## 0.9.1\nOld release.\n";
  const prepared = prepareChangelog(source, "0.9.2", [normalized]);
  const rendered = releaseNotes(prepared, "0.9.2");
  for (const text of ["Manual note.", "Manual ending.", "Important migration step.", "Nested step.", "After all code.", code]) {
    assert.ok(rendered.includes(text), "release notes lost " + text);
  }
  assert.equal(releaseNotes(prepared, "0.9.1"), "Old release.");
});

test("real Changesets preparation normalizes embedded headings before writing changelog", () => {
  versionFixture(({ fixture, put, run }) => {
    put(".changeset/fixture.md", '---\n"gavia-ui": patch\n---\n\n# Overview\n\n## Migration\n\nImportant migration step.\n\n```md\n## 0.9.2\n```\n\nAfter the snippet.\n');
    run([join(fixture, "scripts/version-release.mjs")]);
    const source = readFileSync(join(fixture, "CHANGELOG.md"), "utf8");
    const notes = releaseNotes(source, "0.9.2");
    assert.match(notes, /^### Overview$/m);
    assert.match(notes, /^#### Migration$/m);
    assert.match(notes, /Important migration step\./);
    assert.match(notes, /After the snippet\./);
    assert.ok(notes.includes("```md\n## 0.9.2\n```"));
    assert.equal(readFileSync(join(fixture, "packages/ui-kit/CHANGELOG.md"), "utf8"), packageChangelog(source));
  });
});

test("unsafe Markdown fails before Changesets consumes notes or changes versions", () => {
  for (const notes of ["Heading\n===\nBody.", "# Parent\n###### Deepest child", "```md\n## Unclosed snippet"]) {
    versionFixture(({ fixture, put, run }) => {
      put(".changeset/fixture.md", '---\n"gavia-ui": patch\n---\n\n' + notes + "\n");
      const result = run([join(fixture, "scripts/version-release.mjs")], 1);
      assert.match(result.stderr, /fixture\.md/);
      assert.match(result.stderr, /[Nn]o versions changed/);
      assert.equal(JSON.parse(readFileSync(join(fixture, "package.json"), "utf8")).version, "0.9.1");
      assert.equal(JSON.parse(readFileSync(join(fixture, "packages/ui-kit/package.json"), "utf8")).version, "0.9.1");
      assert.ok(existsSync(join(fixture, ".changeset/fixture.md")));
    });
  }
});

test("GitHub Release docs use the exact stable or prerelease tag while package docs keep main", () => {
  const source = "See [migration](docs/migration.md).";
  for (const version of ["0.9.2", "0.9.2-beta.1"]) {
    assert.equal(releaseDocsLinks(source, version), "See [migration](https://github.com/whitewolf06/gavia-ui/blob/v" + version + "/docs/migration.md).");
  }
  assert.equal(packageChangelog(source), "See [migration](https://github.com/whitewolf06/gavia-ui/blob/main/docs/migration.md).");
});

test("beta promotion deduplicates whole fenced blocks without dropping delimiters or code", () => {
  const firstCode = "```md\n\nFirst snippet.\n\n```";
  const secondCode = "```md\n\nSecond snippet.\n\n```";
  const source = "# Changelog\n\n## Unreleased\n\n## 0.9.2-beta.1\n\n" + secondCode
    + "\n\n### Changesets\n\nChecked fix.\n\n## 0.9.2-beta.0\n\n" + firstCode + "\n\n### Changesets\n\nChecked fix.\n";
  const promoted = promotionNotes(source, "0.9.2", ["Checked fix."]);
  assert.ok(promoted.includes(firstCode));
  assert.ok(promoted.includes(secondCode));
  const stable = releaseNotes(prepareChangelog(source, "0.9.2", ["Checked fix."], promoted), "0.9.2");
  assert.ok(stable.includes(firstCode));
  assert.ok(stable.includes(secondCode));
  assert.equal(stable.match(/Checked fix\./g).length, 1);
});


test("compatibility type helpers preserve generic props and expose while rejecting real contract losses", () => {
  const ts = createRequire(join(root, "packages/ui-kit/package.json"))("typescript");
  const base = join(root, ".tmp");
  mkdirSync(base, { recursive: true });
  const fixture = mkdtempSync(join(base, "compatibility-helpers-"));
  const constructor = (name) => [
    `export declare const ${name}: {`,
    '  new (): ComponentPublicInstance & {',
    '    $props: { items?: readonly unknown[]; label?: string; onChange?: (value: unknown) => void };',
    '    $slots: { default?: (props: {}) => unknown };',
    '    open(target?: Event): void;',
    '    clear(): boolean;',
    '  };',
    '};'
  ].join("\n");
  const callable = (name) => [
    `export declare const ${name}: <T = unknown>(`,
    '  props: { items?: readonly T[]; label?: string; onChange?: (value: T) => void },',
    '  context?: { slots: { default?: (props: {}) => unknown } },',
    '  expose?: (exposed: { open: (target?: Event) => void; clear: () => boolean }) => void',
    ') => { __ctx?: { expose: (exposed: { open: (target?: Event) => void; clear: () => boolean }) => void } };'
  ].join("\n");
  const previousTable = [
    'export declare const WlTable: { new (): ComponentPublicInstance & {',
    '  $props: { value?: WlTableRow[]; columns?: { key: string; label: string }[] };',
    '  $slots: { "cell-name"?: (props: { row: WlTableRow; value: unknown }) => unknown };',
    '} };'
  ].join("\n");
  const currentTable = [
    'export declare const WlTable: <Row extends object = WlTableRow>(',
    '  props: { value?: readonly Row[]; columns?: readonly { key: Extract<keyof Row, string>; label: string }[] },',
    '  context?: { slots: { "cell-name"?: (props: { row: Row; value: unknown }) => unknown } }',
    ') => { __ctx?: { expose: (exposed: {}) => void } };'
  ].join("\n");
  const previousSelection = (name, model) => [
    `export declare const ${name}: { new (): ComponentPublicInstance & {`,
    `  $props: { options?: unknown[]; optionValue?: ValueResolver; modelValue?: ${model}; "onUpdate:modelValue"?: (value: ${model}) => void };`,
    '  $slots: {};',
    '} };'
  ].join("\n");
  const currentSelection = (name, model) => [
    `export declare const ${name}: <Item = unknown, Resolver extends ValueResolver | undefined = undefined>(`,
    `  props: RuntimeProp<{ options?: readonly Item[]; optionValue?: Resolver; modelValue?: ${model}; "onUpdate:modelValue"?: (value: ${model}) => void }, "optionValue", Resolver, undefined>,`,
    '  context?: { slots: {} }',
    ') => { __ctx?: { expose: (exposed: {}) => void } };'
  ].join("\n");
  const previousAuto = [
    'export declare const WlAutocomplete: { new (): ComponentPublicInstance & {',
    '  $props: { suggestions?: unknown[]; multiple?: boolean; modelValue?: unknown; "onUpdate:modelValue"?: (value: unknown) => void };',
    '  $slots: {};',
    '} };'
  ].join("\n");
  const currentAuto = [
    'export declare const WlAutocomplete: <Item = unknown, Multiple extends boolean = false>(',
    '  props: RuntimeProp<{ suggestions?: readonly Item[]; multiple?: Multiple; modelValue?: unknown; "onUpdate:modelValue"?: (value: unknown) => void }, "multiple", Multiple, false>,',
    '  context?: { slots: {} }',
    ') => { __ctx?: { expose: (exposed: {}) => void } };'
  ].join("\n");
  const header = [
    'import type { ComponentPublicInstance } from "vue";',
    'export type WlTableRow = Record<string, unknown>;',
    'type ValueResolver = string | ((option: unknown) => unknown);',
    'type RuntimeProp<P, Key extends PropertyKey, Value, Default> = P & ([Value] extends [Default] ? unknown : { [K in Key]: Value });',
    ''
  ].join("\n");
  const previous = header + [constructor("WlGeneric"), callable("WlCallable"), constructor("WlClassic"), previousTable, previousAuto,
    previousSelection("WlSelect", "unknown"), previousSelection("WlMultiSelect", "unknown[]")].join("\n");
  const current = header + [callable("WlGeneric"), callable("WlCallable"), constructor("WlClassic"), currentTable, currentAuto,
    currentSelection("WlSelect", "unknown"), currentSelection("WlMultiSelect", "unknown[]")].join("\n");
  const currentPath = join(fixture, "current/index.d.ts");
  const contractPath = join(fixture, "contract.ts");
  try {
    for (const version of ["previous", "current"]) mkdirSync(join(fixture, version));
    writeFileSync(join(fixture, "previous/index.d.ts"), previous);
    writeFileSync(contractPath, typeSource({ components: ["WlGeneric", "WlCallable", "WlClassic", "WlTable", "WlAutocomplete", "WlSelect", "WlMultiSelect"], declarationExports: [] }));
    const diagnostics = (candidate) => {
      writeFileSync(currentPath, candidate);
      const program = ts.createProgram([contractPath], compilerOptions(ts));
      return ts.getPreEmitDiagnostics(program);
    };
    const unchanged = diagnostics(current);
    assert.deepEqual(unchanged.map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")), [],
      "equivalent constructor/generic declarations must not report removed props or expose");
    const mutations = [
      ["generic prop removed", current.replace('items?: readonly T[]; label?: string;', 'items?: readonly T[];'), /WlGeneric_0_propNames/],
      ["generic input narrowed", current.replace('items?: readonly T[]; label?: string;', 'items?: readonly T[]; label?: number;'), /WlGeneric_0_inputsAndHandlers/],
      ["generic exposed method removed", current.replaceAll(' clear: () => boolean', ''), /WlGeneric_0_exposedNames/],
      ["generic exposed signature changed", current.replaceAll('open: (target?: Event) => void', 'open: (target: string) => void'), /WlGeneric_0_exposedMethods/],
      ["existing callable prop removed", current.replace(callable("WlCallable"), callable("WlCallable").replace(' label?: string;', '')), /WlCallable_0_propNames/],
      ["constructor input narrowed", current.replace(constructor("WlClassic"), constructor("WlClassic").replace('label?: string', 'label?: number')), /WlClassic_0_inputsAndHandlers/],
      ["default table columns narrowed", current.replace('key: Extract<keyof Row, string>', 'key: never'), /WlTable_0_inputsAndHandlers/],
      ["default table slot row changed", current.replace('props: { row: Row; value: unknown }', 'props: { row: number; value: unknown }'), /WlTable_0_slotPayloads/],
      ["multiple autocomplete model narrowed", current.replace(currentAuto, currentAuto.replace('modelValue?: unknown;', 'modelValue?: Multiple extends true ? Item[] | null : unknown;')), /WlAutocomplete_1_inputsAndHandlers/],
      ["resolved select model narrowed", current.replace(currentSelection("WlSelect", "unknown"), currentSelection("WlSelect", 'Resolver extends undefined ? unknown : number')), /WlSelect_1_inputsAndHandlers/],
      ["resolved multiselect model narrowed", current.replace(currentSelection("WlMultiSelect", "unknown[]"), currentSelection("WlMultiSelect", 'Resolver extends undefined ? unknown[] : number[]')), /WlMultiSelect_1_inputsAndHandlers/]
    ];
    for (const [label, candidate, expected] of mutations) {
      const failures = diagnostics(candidate);
      assert.ok(failures.length, `${label} was silently accepted`);
      assert.ok(failures.every((diagnostic) => diagnostic.code === 2344 && diagnostic.file && resolve(diagnostic.file.fileName) === contractPath),
        `${label}: fixture must fail a compatibility assertion, not its declaration syntax`);
      const lines = failures.map((diagnostic) => {
        const line = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start).line;
        return diagnostic.file.text.split("\n")[line];
      });
      assert.match(lines.join("\n"), expected, label);
    }
  } finally {
    assert.equal(dirname(fixture), base, "cleanup must stay in the worktree .tmp directory");
    rmSync(fixture, { recursive: true, force: true });
  }
});
