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
const majorId = "public-api-1.0";
const majorChanges = ["canonical-pt-paths", "semantic-status-props-and-types", "semantic-pt-callback-contexts", "dismissible-spelling", "tooltip-component-and-directive-names", "icon-action-accessible-name"];
const majorPins = {
  contractSha256: "7e9ec21394223b0daff9bead96002806a1d72e4cf867fb0242e256e77c903443",
  inventorySha256: "b09293446c322dfcad1e6726e1c4555cfb6ac9f5b152e22cc9fccd0de2aef7cf",
  consumerSha256: "e0a130adf7dba8ffafb4b41ef53a7fcc28f26312c8fc5fd8cba59a63b9f8ae06",
  migratedSha256: "9c202025b5238f0a6a94dc6653566de1b4ce229b73ba9c90f0b2cf9716f9d169"
};
const majorConsumerFrom = 'variant="soft-danger"';
const majorConsumerTo = 'variant="soft" tone="danger"';
const componentNames = {
  datatable: "table", inputtext: "input", toggleswitch: "switch", selectbutton: "segmented",
  paginator: "pagination", progressbar: "progress", radiobutton: "radio", breadcrumb: "breadcrumbs",
  tablist: "tabs", tabpanels: "tabs", tabpanel: "tabs"
};
const sectionNames = {
  pcCloseButton: "closeButton", pcChip: "chip", pcToggleButton: "item", pcFilter: "filter",
  pcInputText: "inputText", pcPrevButton: "prevButton", pcNextButton: "nextButton", tabpanels: "panels", tabpanel: "panel"
};
const statusTypeNames = {
  WlAlertVariant: "WlTone", WlBadgeVariant: "WlTone", WlPillVariant: "WlTone",
  WlProgressVariant: "WlTone", WlTagVariant: "WlTagColor"
};
const approvedPolicies = new WeakSet();
export function normalizedHash(text) {
  return createHash("sha256").update(text.replaceAll("\r\n", "\n")).digest("hex");
}
export function declarationInventoryHash(baseline) {
  return normalizedHash(JSON.stringify(
    Object.keys(baseline.declarationHashes).sort().map((name) => [name, baseline.declarationHashes[name]])
  ));
}
function exactKeys(value, names, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)
    || JSON.stringify(Object.keys(value).sort()) !== JSON.stringify([...names].sort())) {
    throw new Error(`Migration policy: invalid ${label} fields`);
  }
}
function guard(condition, message) {
  if (!condition)
    throw new Error(`Migration policy: ${message}`);
}
// The manifest pins the reviewed release, not candidate declarations or diagnostics.
// Projections below are fixed code; adding an entry cannot suppress other errors.
export function validateMigrationPolicy({
  policy, baseline, contractText, consumerText, currentVersion, changesetText, migrationNoteText
}) {
  if (policy?.id === majorId)
    return validateMajorPolicy({ policy, baseline, contractText, consumerText, currentVersion, changesetText, migrationNoteText });
  exactKeys(policy, ["schemaVersion", "id", "baseline", "targetMinor", "prepareVersion", "changeset", "migrationNote", "approvedChanges", "consumer"], "manifest");
  exactKeys(policy.baseline, ["version", "contractSha256", "inventorySha256", "consumerSha256"], "baseline");
  exactKeys(policy.consumer, ["from", "to", "migratedSha256"], "consumer");
  guard(policy.schemaVersion === 1 && policy.id === id, "unrecognized schema or approval");
  guard(policy.baseline.version === "0.9.1" && baseline.version === "0.9.1", "approval applies only to released 0.9.1");
  guard(policy.targetMinor === "0.11" && policy.prepareVersion === "0.10.0", "approval applies only to minor 0.11");
  guard(policy.changeset === ".changeset/public-api-contracts.md" && policy.migrationNote === "docs/migration-0.11.0.md", "reviewed changeset and migration note are required");
  guard(JSON.stringify(policy.approvedChanges) === JSON.stringify(approvedChanges), "unreviewed migration changes");
  guard(policy.consumer.from === consumerFrom && policy.consumer.to === consumerTo, "unreviewed consumer replacement");
  for (const hash of [
    policy.baseline.contractSha256, policy.baseline.inventorySha256,
    policy.baseline.consumerSha256, policy.consumer.migratedSha256
  ]) {
    guard(typeof hash === "string" && /^[a-f0-9]{64}$/.test(hash), "invalid SHA256 pin");
  }
  guard(normalizedHash(contractText) === policy.baseline.contractSha256, "released contract changed");
  guard(declarationInventoryHash(baseline) === policy.baseline.inventorySha256, "released declaration inventory changed");
  guard(normalizedHash(consumerText) === policy.baseline.consumerSha256, "released Vue consumer changed");
  guard(typeof migrationNoteText === "string" && /^# (?:Upgrade to|Upgrading to|Обновление до) Gavia UI 0\.11\.0$/m.test(migrationNoteText.replaceAll("\r\n", "\n")), "0.11 migration note is missing");
  const prepared = currentVersion === policy.prepareVersion;
  guard(prepared || /^0\.11\.\d+(?:-[0-9A-Z.-]+)?$/i.test(currentVersion), `version ${currentVersion} is outside approved minor 0.11`);
  if (prepared) {
    const changeset = changesetText?.replaceAll("\r\n", "\n");
    guard(typeof changeset === "string" && /^---\n(?:"gavia-ui"|'gavia-ui'|gavia-ui): minor\n---\n\n\S/.test(changeset), "0.10.0 preparation requires the specific gavia-ui minor changeset");
  }
  const normalizedConsumer = consumerText.replaceAll("\r\n", "\n");
  guard(normalizedConsumer.split(consumerFrom).length === 2, "consumer replacement must occur exactly once");
  const migratedConsumer = normalizedConsumer.replace(consumerFrom, consumerTo);
  guard(normalizedHash(migratedConsumer) === policy.consumer.migratedSha256, "migrated Vue consumer hash changed");
  const approval = Object.freeze({
    id, baselineVersion: baseline.version, targetMinor: policy.targetMinor,
    migratedConsumer, migrationNote: policy.migrationNote
  });
  approvedPolicies.add(approval);
  return approval;
}
function validateMajorPolicy({ policy, baseline, contractText, consumerText, currentVersion, changesetText, migrationNoteText }) {
  exactKeys(policy, ["schemaVersion", "id", "baseline", "targetMinor", "prepareVersion", "changeset", "migrationNote", "approvedChanges", "consumer"], "manifest");
  exactKeys(policy.baseline, ["version", "contractSha256", "inventorySha256", "consumerSha256"], "baseline");
  exactKeys(policy.consumer, ["from", "to", "migratedSha256"], "consumer");
  guard(policy.schemaVersion === 1 && policy.id === majorId, "unrecognized schema or approval");
  guard(policy.baseline.version === "0.11.1" && baseline.version === "0.11.1", "1.0 approval applies only to released 0.11.1");
  guard(policy.targetMinor === "1.0" && policy.prepareVersion === "0.12.1", "approval applies only to major 1.0");
  guard(policy.changeset === ".changeset/canonical-api-1-0.md" && policy.migrationNote === "docs/migration.md#migration-1-0-public-api", "specific 1.0 changeset and migration anchor are required");
  guard(JSON.stringify(policy.approvedChanges) === JSON.stringify(majorChanges), "unreviewed 1.0 migration changes");
  for (const name of ["contractSha256", "inventorySha256", "consumerSha256"])
    guard(policy.baseline[name] === majorPins[name], "unreviewed 0.11.1 SHA256 pin");
  guard(policy.consumer.from === majorConsumerFrom && policy.consumer.to === majorConsumerTo
    && policy.consumer.migratedSha256 === majorPins.migratedSha256, "unreviewed 1.0 consumer replacement");
  guard(normalizedHash(contractText) === majorPins.contractSha256, "released contract changed");
  guard(declarationInventoryHash(baseline) === majorPins.inventorySha256, "released declaration inventory changed");
  guard(normalizedHash(consumerText) === majorPins.consumerSha256, "released Vue consumer changed");
  guard(typeof migrationNoteText === "string" && /<a id="migration-1-0-public-api"><\/a>/.test(migrationNoteText), "1.0 migration anchor is missing");
  const prepared = currentVersion === policy.prepareVersion;
  guard(prepared || /^1\.0\.\d+(?:-rc\.\d+)?$/.test(currentVersion), `version ${currentVersion} is outside approved 1.0 stable/RC releases`);
  if (prepared) {
    const changeset = changesetText?.replaceAll("\r\n", "\n");
    guard(typeof changeset === "string" && /^---\n(?:"gavia-ui"|'gavia-ui'|gavia-ui): major\n---\n\n\S/.test(changeset), "0.12.1 preparation requires the specific gavia-ui major changeset");
  }
  const normalized = consumerText.replaceAll("\r\n", "\n");
  guard(normalized.split(majorConsumerFrom).length === 2, "consumer replacement must occur exactly once");
  const migratedConsumer = normalized.replace(majorConsumerFrom, majorConsumerTo);
  guard(normalizedHash(migratedConsumer) === majorPins.migratedSha256, "migrated Vue consumer hash changed");
  const approval = Object.freeze({ id: majorId, baselineVersion: baseline.version, targetMinor: "1.0", migratedConsumer, migrationNote: policy.migrationNote });
  approvedPolicies.add(approval);
  return approval;
}
export function loadMigrationPolicy(repoRoot, baselineDir, baseline, currentVersion) {
  const major = baseline.version === "0.11.1";
  const manifest = join(repoRoot, major ? "scripts/migrations/public-api-1.0.json" : "scripts/migrations/public-api-0.11.json");
  // New stable baselines do not inherit approval for an older release.
  if (!existsSync(manifest) || (!major && baseline.version !== "0.9.1"))
    return null;
  // The 1.0 policy never authorizes an intervening 0.x release.
  if (major && currentVersion !== "0.12.1" && !/^1\.0\.\d+(?:-rc\.\d+)?$/.test(currentVersion))
    return null;
  const policy = JSON.parse(readFileSync(manifest, "utf8"));
  const readOptional = (path) => existsSync(path) ? readFileSync(path, "utf8") : undefined;
  return validateMigrationPolicy({ policy, baseline, currentVersion,
    contractText: readFileSync(join(baselineDir, "contract.json"), "utf8"),
    consumerText: readFileSync(join(baselineDir, "consumer.vue"), "utf8"),
    changesetText: readOptional(join(repoRoot, major ? ".changeset/canonical-api-1-0.md" : ".changeset/public-api-contracts.md")),
    migrationNoteText: readOptional(join(repoRoot, major ? "docs/migration.md" : "docs/migration-0.11.0.md"))
  });
}
export function isApprovedMigration(approval) {
  return approvedPolicies.has(approval);
}
export function migrationTypeHelpers(approval) {
  guard(isApprovedMigration(approval), "typed projections require validated approval");
  if (approval.id === majorId) {
    const mapType = (name, values) => `type ${name} = { ${Object.entries(values).map(([from, to]) => `${JSON.stringify(from)}: ${JSON.stringify(to)}`).join("; ")} };`;
    return [
      mapType("ApprovedPtComponentNames", componentNames),
      mapType("ApprovedPtSectionNames", sectionNames),
      "type ApprovedPtComponentName<K> = K extends keyof ApprovedPtComponentNames ? ApprovedPtComponentNames[K] : K;",
      "type ApprovedPtSectionName<K> = K extends keyof ApprovedPtSectionNames ? ApprovedPtSectionNames[K] : K;",
      "type ApprovedPtSections<P> = P extends object ? { [K in keyof P as ApprovedPtSectionName<K>]: P[K] } : P;",
      "type ApprovedTone = 'neutral' | 'accent' | 'info' | 'success' | 'warning' | 'danger';",
      "type ApprovedContextOptions<P, Added> = P extends { context: infer C } ? { [K in keyof P]: K extends 'context' ? C & Added : P[K] } : P;",
      "type ApprovedContextArgs<A extends readonly unknown[], Added> = { [K in keyof A]: K extends '0' ? ApprovedContextOptions<A[K], Added> : A[K] };",
      "type ApprovedContextSection<P, Added> = P extends (...args: infer A) => infer R ? (...args: ApprovedContextArgs<A, Added>) => R : P;",
      "type ApprovedSemanticSections<Component, P> = P extends object ? { [K in keyof P]: Component extends 'toast' ? K extends 'message' | 'messageIcon' ? ApprovedContextSection<P[K], { id: number; tone: ApprovedTone; severity: 'success' | 'info' | 'warn' | 'error' }> : P[K] : Component extends 'confirmdialog' ? K extends 'root' | 'mask' | 'header' | 'title' | 'content' | 'icon' | 'message' | 'footer' ? ApprovedContextSection<P[K], { tone: ApprovedTone; danger: boolean }> : P[K] : P[K] } : P;",
      "type ApprovedPtMap<P> = P extends object ? { [K in keyof P as K extends 'tabpanels' | 'tabpanel' ? never : ApprovedPtComponentName<K>]: K extends 'tablist' ? ApprovedPtSections<P[K]> & { panels?: P[Extract<keyof P, 'tabpanels'>]; panel?: P[Extract<keyof P, 'tabpanel'>] } : ApprovedSemanticSections<K, ApprovedPtSections<P[K]>> } : P;",
      "type ApprovedPtProp<P, Family = ''> = { [K in keyof P]: K extends 'pt' ? ApprovedSemanticSections<Family extends 'WlToast' ? 'toast' : Family extends 'WlConfirmDialog' ? 'confirmdialog' : '', ApprovedPtSections<P[K]>> : P[K] };",
      "type ApprovedConfig<P> = { [K in keyof P]: K extends 'pt' ? ApprovedPtMap<P[K]> : P[K] };",
      "type ApprovedButtonVariant<T> = T extends 'danger' ? 'primary' : T extends 'danger-quiet' ? 'ghost' : T extends 'soft-danger' ? 'soft' : T;",
      "type ApprovedAlertTone<T> = T extends 'ok' ? 'success' : T extends 'warn' ? 'warning' : T extends 'err' ? 'danger' : T;",
      "type ApprovedBadgeTone<T> = T extends 'gray' ? 'neutral' : T extends 'warn' ? 'warning' : T;",
      "type ApprovedProgressTone<T> = T extends 'default' ? 'accent' : T extends 'ok' ? 'success' : T;",
      "type ApprovedStatusProps<P, Family> = { [K in keyof P as K extends 'variant' ? Family extends 'WlTag' ? 'color' : 'tone' : K]: K extends 'variant' ? Family extends 'WlTag' ? P[K] : Family extends 'WlBadge' ? ApprovedBadgeTone<P[K]> : Family extends 'WlProgress' ? ApprovedProgressTone<P[K]> : ApprovedAlertTone<P[K]> : P[K] };",
      "type ApprovedButtonProps<P> = { [K in keyof P]: K extends 'variant' ? ApprovedButtonVariant<P[K]> : P[K] };",
      "type ApprovedDismissible<P> = { [K in keyof P as K extends 'dismissable' ? 'dismissible' : K]: P[K] };",
      "type ApprovedIconAction<P> = RuntimeDomain<P, Extract<keyof P, 'icon'>, undefined, false> | (P & ({ ariaLabel: string } | { 'aria-label': string } | { 'aria-labelledby': string }));",
      "type ApprovedPtArguments<A extends readonly unknown[]> = { [K in keyof A]: K extends '0' ? ApprovedPtMap<A[K]> : A[K] };"
    ];
  }
  return [
    // Mapped replacement preserves old modifiers and every unrelated property.
    "type ApprovedFields<P, R> = { [K in keyof P]: K extends keyof R ? R[K] : P[K] };",
    "type ApprovedCallback<Callback, Args extends unknown[]> = Callback extends (...args: any[]) => infer Result ? (...args: Args) => Result : Callback;",
    "type ApprovedSidebarGroup = ApprovedFields<Previous.WlSidebarGroup, { items: readonly Previous.WlSidebarItem[] } >;",
    "type ApprovedCommandItem = ApprovedFields<Previous.WlCommandPaletteItem, { keywords: readonly string[] } >;",
    "type ApprovedCommandGroup = ApprovedFields<Previous.WlCommandPaletteGroup, { items: readonly ApprovedCommandItem[] } >;"
  ];
}
export function migrationPropsProjection(approval, name, branch, props) {
  guard(isApprovedMigration(approval), "typed projections require validated approval");
  if (approval.id === majorId) {
    let result = `ApprovedPtProp<${props}, ${JSON.stringify(name)}>`;
    if (["WlAlert", "WlBadge", "WlPill", "WlProgress", "WlTag"].includes(name))
      result = `ApprovedStatusProps<${result}, ${JSON.stringify(name)}>`;
    if (name === "WlButton") result = `ApprovedButtonProps<${result}>`;
    if (["WlDialog", "WlDrawer", "WlPopover"].includes(name)) result = `ApprovedDismissible<${result}>`;
    if (name === "WlIconButton") result = `ApprovedIconAction<${result}>`;
    return result;
  }
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

/** Fixed reviewed names only; classes, tokens, package paths and DOM markers never project. */
export function migrationInventoryProjection(approval, kind, values) {
  guard(isApprovedMigration(approval), "inventory projections require validated approval");
  if (approval.id !== majorId) return values;
  return values.map((value) => {
    if (kind === "runtimeExports") return value === "WlTooltip" ? "WlTooltipDirective" : value;
    if (kind === "declarationExports") return statusTypeNames[value] ?? (value === "WlTooltip" ? "WlTooltipDirective" : value);
    if (kind !== "pt") return value;
    const [component, ...sections] = value.split(".");
    const prefix = component === "tabpanels" ? "tabs.panels" : component === "tabpanel" ? "tabs.panel" : componentNames[component] ?? component;
    return [prefix, ...sections.map((section) => sectionNames[section] ?? section)].join(".");
  });
}

/** Transform only the named released field/type; unrelated members remain Previous members. */
export function migrationPublicTypeProjection(approval, name, previous) {
  guard(isApprovedMigration(approval), "typed projections require validated approval");
  if (approval.id !== majorId) return { name, previous };
  const target = statusTypeNames[name] ?? name;
  if (name === "WlButtonVariant") return { name: target, previous: `ApprovedButtonVariant<${previous}>` };
  if (name === "WlAlertVariant" || name === "WlPillVariant") return { name: target, previous: `ApprovedAlertTone<${previous}>` };
  if (name === "WlBadgeVariant") return { name: target, previous: `ApprovedBadgeTone<${previous}>` };
  if (name === "WlProgressVariant") return { name: target, previous: `ApprovedProgressTone<${previous}>` };
  if (["WlPtMap", "WlPtConfig", "WlPtConfigStrict"].includes(name)) return { name, previous: `ApprovedPtMap<${previous}>` };
  if (name === "WlPtComponent") return { name, previous: `ApprovedPtComponentName<${previous}>` };
  if (name === "WlConfigOptions") return { name, previous: `ApprovedConfig<${previous}>` };
  if (name === "WlTooltipValue") return { name, previous: `ApprovedPtProp<${previous}>` };
  return { name: target, previous };
}

export function migrationCallableProjection(approval, name, args, result) {
  guard(isApprovedMigration(approval), "typed projections require validated approval");
  if (name !== "createWlPt") return { args, result };
  return approval.id === majorId
    ? { args: `ApprovedPtArguments<${args}>`, result: `ApprovedPtMap<${result}>` }
    : { args, result: "Record<string, unknown>" };
}
