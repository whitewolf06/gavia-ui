import assert from "node:assert/strict";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join, resolve, dirname, relative, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { capturedConsumer, compilerOptions, subset, typeSource } from "./check-compatibility.mjs";
import { loadMigrationPolicy, normalizedHash } from "./compatibility-migration.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const kit = join(root, "packages/ui-kit");
const fixture = join(kit, "tests/fixtures/compatibility-0.9.1");
const baseline = JSON.parse(readFileSync(join(fixture, "contract.json"), "utf8"));
const require = createRequire(join(kit, "package.json"));
const ts = require("typescript");
const temporaryBase = join(kit, ".tmp");
mkdirSync(temporaryBase, { recursive: true });

function diagnosticsFor(change, { releaseFixture = fixture, releaseBaseline = baseline, currentHasGenericDataContracts = false } = {}) {
  const temporary = mkdtempSync(join(temporaryBase, "compatibility-mutation-"));
  try {
    cpSync(join(releaseFixture, "declarations"), join(temporary, "current"), { recursive: true });
    if (change) change(join(temporary, "current"));
    // Compare a copied candidate with the selected immutable release fixture.
    const source = typeSource(releaseBaseline, null, { currentHasGenericDataContracts })
      .replace('"./previous/index"', JSON.stringify(join(releaseFixture, "declarations/index").replaceAll("\\", "/")));
    const path = join(temporary, "contract.ts");
    writeFileSync(path, source);
    return ts.getPreEmitDiagnostics(ts.createProgram([path], compilerOptions(ts))).map((item) => {
      const line = item.file && item.start !== undefined ? item.file.text.split("\n")[item.file.getLineAndCharacterOfPosition(item.start).line] : "";
      return `${line}: ${ts.flattenDiagnosticMessageText(item.messageText, "\n")}`;
    });
  } finally {
    const within = relative(temporaryBase, resolve(temporary));
    assert.ok(within && !within.startsWith("..") && !isAbsolute(within), "cleanup must stay inside kit/.tmp");
    rmSync(temporary, { recursive: true, force: true });
  }
}
function mutate(directory, file, before, after) {
  const path = join(directory, file);
  const text = readFileSync(path, "utf8");
  assert.ok(text.includes(before), `mutation target missing: ${file}`);
  writeFileSync(path, text.replace(before, after));
}

test("additions to classes, tokens, exports and pt preserve the old inventory", () => {
  for (const key of ["classes", "tokens", "runtimeExports", "pt"]) {
    const errors = [];
    subset(baseline[key], [...baseline[key], "new-entry"], key, errors);
    assert.deepEqual(errors, []);
  }
});
test("removal of a public export, CSS class, token or pt section fails", () => {
  for (const key of ["classes", "tokens", "runtimeExports", "pt"]) {
    const errors = [];
    subset(baseline[key], baseline[key].slice(1), key, errors);
    assert.equal(errors.length, 1);
    assert.match(errors[0], /removed/);
  }
});
test("unchanged released declaration fixture passes", () => {
  assert.deepEqual(diagnosticsFor(), []);
});
test("narrowing a button prop fails the real declaration gate", () => {
  const errors = diagnosticsFor((directory) => mutate(directory, "components/WlButton.vue.d.ts", "variant?: WlButtonVariant;", 'variant?: "primary";'));
  assert.ok(errors.some((error) => error.includes("WlButton_0_inputsAndHandlers")), errors.join("\n"));
});
test("a newly required button prop fails the real declaration gate", () => {
  const errors = diagnosticsFor((directory) => mutate(directory, "components/WlButton.vue.d.ts", "type __VLS_Props = {", "type __VLS_Props = {\n    revision: string;"));
  assert.ok(errors.some((error) => error.includes("WlButton_0_inputsAndHandlers")), errors.join("\n"));
});
test("removing a declared slot fails the real declaration gate", () => {
  const errors = diagnosticsFor((directory) => mutate(directory, "components/WlButton.vue.d.ts", "icon?(_: {}): any;", ""));
  assert.ok(errors.some((error) => error.includes("WlButton_0_slotNames")), errors.join("\n"));
});
test("changing an event payload fails the real declaration gate", () => {
  const errors = diagnosticsFor((directory) => {
    const path = join(directory, "components/WlButton.vue.d.ts");
    writeFileSync(path, readFileSync(path, "utf8").replaceAll("MouseEvent", "KeyboardEvent"));
  });
  assert.ok(errors.some((error) => error.includes("WlButton_0_inputsAndHandlers")), errors.join("\n"));
});

test("removing a component declaration export fails the real declaration gate", () => {
  const errors = diagnosticsFor((directory) => mutate(directory, "components/index.d.ts", "default as WlButton", "default as RenamedButton"));
  assert.ok(errors.some((error) => error.includes("WlButton") && /no exported member|does not exist/.test(error)), errors.join("\n"));
});
test("adding optional props and widening accepted variants remains compatible", () => {
  const errors = diagnosticsFor((directory) => {
    mutate(directory, "components/WlButton.vue.d.ts", "type __VLS_Props = {", "type __VLS_Props = {\n    accessibleDescription?: string;");
    mutate(directory, "types.d.ts", 'export type WlButtonVariant = "primary"', 'export type WlButtonVariant = "new-variant" | "primary"');
  });
  assert.deepEqual(errors, []);
});

const genericFixture = join(kit, "tests/fixtures/compatibility-0.11.1");
const genericBaseline = JSON.parse(readFileSync(join(genericFixture, "contract.json"), "utf8"));
const genericOptions = { releaseFixture: genericFixture, releaseBaseline: genericBaseline, currentHasGenericDataContracts: true };

test("the 0.11.1 baseline freezes the reviewed consumer and has no inherited migration approval", () => {
  const policy = JSON.parse(readFileSync(join(root, "scripts/migrations/public-api-0.11.json"), "utf8"));
  assert.equal(normalizedHash(readFileSync(join(genericFixture, "consumer.vue"), "utf8")), policy.consumer.migratedSha256);
  assert.equal(loadMigrationPolicy(root, genericFixture, genericBaseline, "0.12.0"), null);
  assert.equal(capturedConsumer(root, genericFixture, genericBaseline, "0.12.0"), readFileSync(join(genericFixture, "consumer.vue"), "utf8"));
  for (const name of ["WlAutocomplete", "WlSelect", "WlMultiSelect", "WlTable"]) {
    assert.ok(genericBaseline.declarationExports.find((item) => item.name === name)?.genericParameters > 0, name);
  }
});

test("unchanged generic 0.11.1 declarations pass without migration policy", () => {
  assert.deepEqual(diagnosticsFor(undefined, genericOptions), []);
});

test("generic autocomplete multiple-domain narrowing fails without migration policy", () => {
  const errors = diagnosticsFor((directory) => mutate(directory, "components/WlAutocomplete.vue.d.ts", "multiple?: TMultiple & boolean;", "multiple?: false;"), genericOptions);
  assert.ok(errors.some((error) => error.includes("WlAutocomplete_1_inputsAndHandlers")), errors.join("\n"));
});

test("generic select model narrowing fails without migration policy", () => {
  const errors = diagnosticsFor((directory) => mutate(directory, "components/WlSelect.vue.d.ts", "modelValue?: WlSelectModel<NoInfer<TOption>, NoInfer<TResolver>>;", "modelValue?: string;"), genericOptions);
  assert.ok(errors.some((error) => error.includes("WlSelect_0_inputsAndHandlers")), errors.join("\n"));
});

test("generic table slot removal fails without migration policy", () => {
  const errors = diagnosticsFor((directory) => {
    const path = join(directory, "components/WlTable.vue.d.ts");
    const source = readFileSync(path, "utf8");
    assert.ok(source.includes("empty?: (props: {}) => unknown;"));
    writeFileSync(path, source.replaceAll("empty?: (props: {}) => unknown;", ""));
  }, genericOptions);
  assert.ok(errors.some((error) => error.includes("WlTable_0_slotNames")), errors.join("\n"));
});
