import assert from "node:assert/strict";
import { test } from "node:test";
import { createRequire } from "node:module";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { declarationInventoryHash, normalizedHash, validateMigrationPolicy } from "./compatibility-migration.mjs";
import { compilerOptions, typeSource } from "./check-compatibility.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
function approvalInput() {
  const fixture = join(root, "packages/ui-kit/tests/fixtures/compatibility-0.9.1");
  const contractText = readFileSync(join(fixture, "contract.json"), "utf8");
  return {
    policy: JSON.parse(readFileSync(join(root, "scripts/migrations/public-api-0.11.json"), "utf8")),
    baseline: JSON.parse(contractText), contractText,
    consumerText: readFileSync(join(fixture, "consumer.vue"), "utf8"),
    currentVersion: "0.10.0",
    changesetText: '---\n"gavia-ui": minor\n---\n\nReviewed next minor migration.\n',
    migrationNoteText: "# Обновление до Gavia UI 0.11.0\n\nReviewed migration.\n"
  };
}
test("approved migration pins the release and performs one exact consumer change", () => {
  const input = approvalInput();
  const approval = validateMigrationPolicy(input);
  assert.equal(normalizedHash(input.contractText), input.policy.baseline.contractSha256);
  assert.equal(declarationInventoryHash(input.baseline), input.policy.baseline.inventorySha256);
  assert.equal(approval.migratedConsumer, input.consumerText.replaceAll("\r\n", "\n").replace(input.policy.consumer.from, input.policy.consumer.to));
  assert.equal(normalizedHash(approval.migratedConsumer), input.policy.consumer.migratedSha256);
  assert.ok(!approval.migratedConsumer.includes(input.policy.consumer.from));
  assert.ok(Object.isFrozen(approval));
  // Git checkout line endings do not change the immutable content approval.
  validateMigrationPolicy({ ...input, contractText: input.contractText.replaceAll("\r\n", "\n").replaceAll("\n", "\r\n"), consumerText: input.consumerText.replaceAll("\r\n", "\n") });
  for (const currentVersion of ["0.11.0", "0.11.9", "0.11.0-beta.1"]) {
    validateMigrationPolicy({ ...input, currentVersion, changesetText: undefined });
  }
});
test("migration approval cannot be widened by versions, edits, missing notes or a patch changeset", () => {
  const input = approvalInput();
  const cases = [
    ["wrong released version", { baseline: { ...input.baseline, version: "0.10.0" } }],
    ["changed released contract", { contractText: input.contractText + " " }],
    ["changed inventory", { baseline: { ...input.baseline, declarationHashes: { ...input.baseline.declarationHashes, "extra.d.ts": "0".repeat(64) } } }],
    ["changed consumer outside replacement", { consumerText: input.consumerText + "\n<!-- changed -->" }],
    ["missing migration note", { migrationNoteText: undefined }],
    ["incorrect migration note", { migrationNoteText: "# Obsolete 0.10 migration" }],
    ["missing required changeset", { changesetText: undefined }],
    ["patch changeset", { changesetText: input.changesetText.replace(": minor", ": patch") }],
    ["other package changeset", { changesetText: input.changesetText.replace("gavia-ui", "other-package") }],
    ...["0.9.1", "0.10.1", "0.12.0", "1.11.0"].map((currentVersion) => [currentVersion, { currentVersion }]),
    ["extra manifest allowlist", { policy: { ...input.policy, ignoredDiagnostics: [2344] } }],
    ["unreviewed change", { policy: { ...input.policy, approvedChanges: [...input.policy.approvedChanges, "all-models"] } }],
    ["unreviewed consumer replacement", { policy: { ...input.policy, consumer: { ...input.policy.consumer, to: "const selected = ref<any>(null);" } } }],
    ["unreviewed target", { policy: { ...input.policy, targetMinor: "0.12" } }]
  ];
  for (const [label, overrides] of cases) assert.throws(() => validateMigrationPolicy({ ...input, ...overrides }), /Migration policy:/, label);
  assert.throws(() => typeSource({ components: [], declarationExports: [] }, { id: input.policy.id }), /validated approval/);
});
test("typed migration projections accept only reviewed changes and still reject unrelated API losses", () => {
  const approval = validateMigrationPolicy(approvalInput());
  const ts = createRequire(join(root, "packages/ui-kit/package.json"))("typescript");
  const base = join(root, ".tmp");
  mkdirSync(base, { recursive: true });
  const fixture = mkdtempSync(join(base, "compatibility-migration-"));
  const baseline = { components: ["WlAutocomplete", "WlSidebar", "WlCommandPalette", "WlOther", "WlDatePicker"], declarationExports: [{ name: "createWlPt", callable: true }] };
  const commonHeader = 'import type { ComponentPublicInstance } from "vue";\n';
  const previousHeader = commonHeader + [
    'export interface WlSidebarItem { key: string; label: string; data?: unknown }',
    'export interface WlSidebarGroup { id: string; label?: string; items: WlSidebarItem[] }',
    'export interface WlCommandPaletteItem { id: string; label: string; keywords?: string[]; data?: unknown }',
    'export interface WlCommandPaletteGroup { id: string; label: string; items: WlCommandPaletteItem[] }',
    'export declare function createWlPt(overrides?: Record<string, unknown>): Record<string, Record<string, unknown>>;',
    'type PickerMode = "single" | "range";',
    'type PickerModel<Mode extends PickerMode> = (Mode extends "range" ? [Date | null, Date | null] : Date) | null;',
    'type PickerRuntime<P, Mode extends PickerMode> = P & ([Mode] extends ["single"] ? unknown : { selectionMode: Mode });',
    ''
  ].join("\n");
  const currentHeader = previousHeader.replace('items: WlSidebarItem[]', 'items: readonly WlSidebarItem[]')
    .replace('keywords?: string[]', 'keywords?: readonly string[]')
    .replace('items: WlCommandPaletteItem[]', 'items: readonly WlCommandPaletteItem[]')
    .replace('): Record<string, Record<string, unknown>>;', '): Record<string, unknown>;');
  const constructor = (name, props) => `export declare const ${name}: { new (): ComponentPublicInstance & { $props: { ${props} }; $slots: { default?: (props: { label: string }) => unknown }; open(target?: Event): void; clear(): boolean } };`;
  const callable = (name, props) => `export declare const ${name}: (props: { ${props} }, context?: { slots: { default?: (props: { label: string }) => unknown } }) => { __ctx?: { expose: (exposed: { open: (target?: Event) => void; clear: () => boolean }) => void } };`;
  const otherProps = 'label?: string; onChange?: (value: string) => void';
  const sidebarProps = 'label?: string; onSelect?: (item: WlSidebarItem, group?: WlSidebarGroup) => void';
  const commandProps = 'label?: string; onSelect?: (item: WlCommandPaletteItem, group: WlCommandPaletteGroup) => void';
  const previousDate = [
    'export declare const WlDatePicker: <Mode extends PickerMode = "single">(',
    'props: { selectionMode?: Mode; modelValue?: PickerModel<Mode>; "onUpdate:modelValue"?: (value: PickerModel<Mode>) => void },',
    'context?: { slots: { default?: (props: { label: string }) => unknown } }',
    ') => { __ctx?: { expose: (exposed: {}) => void } };'
  ].join("\n");
  const currentDate = previousDate.replace(
    'props: { selectionMode?: Mode; modelValue?: PickerModel<Mode>; "onUpdate:modelValue"?: (value: PickerModel<Mode>) => void },',
    'props: PickerRuntime<{ selectionMode?: Mode; modelValue?: PickerModel<Mode>; "onUpdate:modelValue"?: (value: PickerModel<Mode>) => void }, Mode>,'
  );
  const previous = previousHeader + [
    constructor("WlAutocomplete", 'suggestions?: unknown[]; multiple?: boolean; modelValue?: unknown; "onUpdate:modelValue"?: (value: unknown) => void'),
    constructor("WlSidebar", sidebarProps), constructor("WlCommandPalette", commandProps), callable("WlOther", otherProps), previousDate
  ].join("\n");
  const currentAuto = [
    'type Model<Item, Mode extends boolean> = Mode extends true ? Item[] | null : unknown;',
    'type RuntimeProp<P, Mode extends boolean> = P & ([Mode] extends [false] ? unknown : { multiple: Mode });',
    'export declare const WlAutocomplete: <Item = unknown, Mode extends boolean = false>(',
    'props: RuntimeProp<{ suggestions?: readonly Item[]; multiple?: Mode; modelValue?: Model<Item, Mode>; "onUpdate:modelValue"?: (value: Model<Item, Mode>) => void }, Mode>,',
    'context?: { slots: { default?: (props: { label: string }) => unknown } }',
    ') => { __ctx?: { expose: (exposed: { open: (target?: Event) => void; clear: () => boolean }) => void } };'
  ].join("\n");
  const current = currentHeader + [currentAuto, callable("WlSidebar", sidebarProps), callable("WlCommandPalette", commandProps), callable("WlOther", otherProps), currentDate].join("\n");
  const currentPath = join(fixture, "current/index.d.ts");
  const rawPath = join(fixture, "raw.ts");
  const adaptedPath = join(fixture, "adapted.ts");
  try {
    for (const name of ["previous", "current"]) mkdirSync(join(fixture, name));
    writeFileSync(join(fixture, "previous/index.d.ts"), previous);
    writeFileSync(rawPath, typeSource(baseline));
    writeFileSync(adaptedPath, typeSource(baseline, approval));
    const diagnostics = (candidate, path = adaptedPath) => {
      writeFileSync(currentPath, candidate);
      const program = ts.createProgram([path], compilerOptions(ts));
      return ts.getPreEmitDiagnostics(program);
    };
    const assertionLines = (failures, path) => {
      assert.ok(failures.every((diagnostic) => diagnostic.code === 2344 && diagnostic.file && resolve(diagnostic.file.fileName) === path), "test must fail a compatibility assertion, not declaration syntax");
      return failures.map((diagnostic) => diagnostic.file.text.split("\n")[diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start).line]).join("\n");
    };
    const rawFailures = diagnostics(current, rawPath);
    assert.ok(rawFailures.length);
    const rawLines = assertionLines(rawFailures, rawPath);
    for (const assertion of ["WlAutocomplete_1_inputsAndHandlers", "WlSidebar_0_inputsAndHandlers", "WlCommandPalette_0_inputsAndHandlers", "Return_createWlPt", "WlDatePicker_1_inputsAndHandlers"]) assert.ok(rawLines.includes(assertion), assertion);
    assert.deepEqual(diagnostics(current).map((failure) => ts.flattenDiagnosticMessageText(failure.messageText, "\n")), [], "only reviewed changes should pass after migration");
    const mutations = [
      ["unrelated prop removed", current.replace(otherProps, 'onChange?: (value: string) => void'), /WlOther_0_propNames/],
      ["unrelated input narrowed", current.replace(otherProps, otherProps.replace('label?: string', 'label?: number')), /WlOther_0_inputsAndHandlers/],
      ["unrelated event payload widened", current.replace(otherProps, otherProps.replace('(value: string)', '(value: unknown)')), /WlOther_0_inputsAndHandlers/],
      ["slot payload changed", current.replace(callable("WlSidebar", sidebarProps), callable("WlSidebar", sidebarProps).replace('props: { label: string }', 'props: { label: number }')), /WlSidebar_0_slotPayloads/],
      ["exposed method removed", current.replace(callable("WlCommandPalette", commandProps), callable("WlCommandPalette", commandProps).replace('; clear: () => boolean', '')), /WlCommandPalette_0_exposedNames/],
      ["single model narrowed", current.replace('Item[] | null : unknown', 'Item[] | null : number'), /WlAutocomplete_0_inputsAndHandlers/],
      ["multiple model further narrowed", current.replace('Item[] | null : unknown', 'number[] | null : unknown'), /WlAutocomplete_1_inputsAndHandlers/],
      ["model event payload widened", current.replace('(value: Model<Item, Mode>)', '(value: unknown)'), /WlAutocomplete_1_inputsAndHandlers/],
      ["sidebar label drift beyond readonly", current.replace('key: string; label: string', 'key: string; label: number'), /WlSidebar_0_inputsAndHandlers/],
      ["command payload drift beyond readonly", current.replace('id: string; label: string; keywords?', 'id: string; label: number; keywords?'), /WlCommandPalette_0_inputsAndHandlers/],
      ["range model changed beyond required mode", current.replace('modelValue?: PickerModel<Mode>;', 'modelValue?: Mode extends "range" ? number[] : PickerModel<Mode>;'), /WlDatePicker_1_inputsAndHandlers/],
      ["range event payload widened", current.replace('(value: PickerModel<Mode>)', '(value: unknown)'), /WlDatePicker_1_inputsAndHandlers/],
      ["default date mode newly required", current.replace('([Mode] extends ["single"] ? unknown : { selectionMode: Mode })', '{ selectionMode: Mode }'), /WlDatePicker_0_inputsAndHandlers/],
      ["pt return is no longer an object", current.replace('): Record<string, unknown>;', '): number;'), /Return_createWlPt/]
    ];
    for (const [label, candidate, expected] of mutations) {
      assert.notEqual(candidate, current, `${label} mutation did not change the declaration`);
      const failures = diagnostics(candidate);
      assert.ok(failures.length, `${label} was hidden by approved migration`);
      assert.match(assertionLines(failures, adaptedPath), expected, label);
    }
  } finally {
    assert.equal(dirname(fixture), base, "cleanup must stay inside worktree .tmp");
    rmSync(fixture, { recursive: true, force: true });
  }
});
