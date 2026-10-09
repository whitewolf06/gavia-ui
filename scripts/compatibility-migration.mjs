import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const id = "public-api-contracts-0.11";
const approvedChanges = [
  "autocomplete-multiple-model", "sidebar-select-readonly-items",
  "command-select-readonly-items-and-keywords", "pt-extension-return-unknown",
  "datepicker-range-mode-required"
];
const consumerFrom = "const selected = ref<unknown>(null);";
const consumerTo = "const selected = ref<number | null>(null);";
const approvedPolicies = new WeakSet();
export function normalizedHash(text) {
  return createHash("sha256").update(text.replaceAll("\r\n", "\n")).digest("hex");
}
export function declarationInventoryHash(baseline) {
  return normalizedHash(JSON.stringify(Object.keys(baseline.declarationHashes).sort().map((name) => [name, baseline.declarationHashes[name]])));
}
function exactKeys(value, names, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)
    || JSON.stringify(Object.keys(value).sort()) !== JSON.stringify([...names].sort())) {
    throw new Error(`Migration policy: invalid ${label} fields`);
  }
}
function guard(condition, message) { if (!condition) throw new Error(`Migration policy: ${message}`); }
// The manifest pins the reviewed release, not candidate declarations or diagnostics.
// Projections below are fixed code; adding an entry cannot suppress other errors.
export function validateMigrationPolicy({ policy, baseline, contractText, consumerText, currentVersion, changesetText, migrationNoteText }) {
  exactKeys(policy, ["schemaVersion", "id", "baseline", "targetMinor", "prepareVersion", "changeset", "migrationNote", "approvedChanges", "consumer"], "manifest");
  exactKeys(policy.baseline, ["version", "contractSha256", "inventorySha256", "consumerSha256"], "baseline");
  exactKeys(policy.consumer, ["from", "to", "migratedSha256"], "consumer");
  guard(policy.schemaVersion === 1 && policy.id === id, "unrecognized schema or approval");
  guard(policy.baseline.version === "0.9.1" && baseline.version === "0.9.1", "approval applies only to released 0.9.1");
  guard(policy.targetMinor === "0.11" && policy.prepareVersion === "0.10.0", "approval applies only to minor 0.11");
  guard(policy.changeset === ".changeset/public-api-contracts.md" && policy.migrationNote === "docs/migration-0.11.0.md", "reviewed changeset and migration note are required");
  guard(JSON.stringify(policy.approvedChanges) === JSON.stringify(approvedChanges), "unreviewed migration changes");
  guard(policy.consumer.from === consumerFrom && policy.consumer.to === consumerTo, "unreviewed consumer replacement");
  for (const hash of [policy.baseline.contractSha256, policy.baseline.inventorySha256, policy.baseline.consumerSha256, policy.consumer.migratedSha256]) {
    guard(typeof hash === "string" && /^[a-f0-9]{64}$/.test(hash), "invalid SHA256 pin");
  }
  guard(normalizedHash(contractText) === policy.baseline.contractSha256, "released contract changed");
  guard(declarationInventoryHash(baseline) === policy.baseline.inventorySha256, "released declaration inventory changed");
  guard(normalizedHash(consumerText) === policy.baseline.consumerSha256, "released Vue consumer changed");
  guard(typeof migrationNoteText === "string" && /^# (?:Upgrade to|Upgrading to|Обновление до) Gavia UI 0\.11\.0$/m.test(migrationNoteText.replaceAll("\r\n", "\n")), "0.11 migration note is missing");
  const prepared = currentVersion === policy.prepareVersion;
  guard(prepared || /^0\.11\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(currentVersion), `version ${currentVersion} is outside approved minor 0.11`);
  if (prepared) {
    const changeset = changesetText?.replaceAll("\r\n", "\n");
    guard(typeof changeset === "string" && /^---\n(?:"gavia-ui"|'gavia-ui'|gavia-ui): minor\n---\n\n\S/.test(changeset), "0.10.0 preparation requires the specific gavia-ui minor changeset");
  }
  const normalizedConsumer = consumerText.replaceAll("\r\n", "\n");
  guard(normalizedConsumer.split(consumerFrom).length === 2, "consumer replacement must occur exactly once");
  const migratedConsumer = normalizedConsumer.replace(consumerFrom, consumerTo);
  guard(normalizedHash(migratedConsumer) === policy.consumer.migratedSha256, "migrated Vue consumer hash changed");
  const approval = Object.freeze({ id, baselineVersion: baseline.version, targetMinor: policy.targetMinor, migratedConsumer, migrationNote: policy.migrationNote });
  approvedPolicies.add(approval);
  return approval;
}
export function loadMigrationPolicy(repoRoot, baselineDir, baseline, currentVersion) {
  const manifest = join(repoRoot, "scripts/migrations/public-api-0.11.json");
  // New stable baselines do not inherit approval for an older release.
  if (!existsSync(manifest) || baseline.version !== "0.9.1") return null;
  const policy = JSON.parse(readFileSync(manifest, "utf8"));
  const readOptional = (path) => existsSync(path) ? readFileSync(path, "utf8") : undefined;
  return validateMigrationPolicy({ policy, baseline, currentVersion,
    contractText: readFileSync(join(baselineDir, "contract.json"), "utf8"),
    consumerText: readFileSync(join(baselineDir, "consumer.vue"), "utf8"),
    changesetText: readOptional(join(repoRoot, ".changeset/public-api-contracts.md")),
    migrationNoteText: readOptional(join(repoRoot, "docs/migration-0.11.0.md"))
  });
}
export function isApprovedMigration(approval) { return approvedPolicies.has(approval); }
export function migrationTypeHelpers(approval) {
  guard(isApprovedMigration(approval), "typed projections require validated approval");
  return [
    // Mapped replacement preserves old modifiers and every unrelated property.
    'type ApprovedFields<P, R> = { [K in keyof P]: K extends keyof R ? R[K] : P[K] };',
    'type ApprovedCallback<Callback, Args extends unknown[]> = Callback extends (...args: any[]) => infer Result ? (...args: Args) => Result : Callback;',
    'type ApprovedSidebarGroup = ApprovedFields<Previous.WlSidebarGroup, { items: readonly Previous.WlSidebarItem[] } >;',
    'type ApprovedCommandItem = ApprovedFields<Previous.WlCommandPaletteItem, { keywords: readonly string[] } >;',
    'type ApprovedCommandGroup = ApprovedFields<Previous.WlCommandPaletteGroup, { items: readonly ApprovedCommandItem[] } >;'
  ];
}
export function migrationPropsProjection(approval, name, branch, props) {
  guard(isApprovedMigration(approval), "typed projections require validated approval");
  if (name === "WlDatePicker" && branch === 1) {
    return `RuntimeDomain<${props}, "selectionMode", "range", true>`;
  }
  if (name === "WlAutocomplete" && branch === 1) {
    return `ApprovedFields<${props}, { modelValue: unknown[] | null; "onUpdate:modelValue": ApprovedCallback<${props}["onUpdate:modelValue"], [value: unknown[] | null]> }>`;
  }
  if (name === "WlSidebar") {
    return `ApprovedFields<${props}, { onSelect: ApprovedCallback<${props}["onSelect"], [item: Previous.WlSidebarItem, group?: ApprovedSidebarGroup]> }>`;
  }
  if (name === "WlCommandPalette") {
    return `ApprovedFields<${props}, { onSelect: ApprovedCallback<${props}["onSelect"], [item: ApprovedCommandItem, group: ApprovedCommandGroup]> }>`;
  }
  return props;
}
