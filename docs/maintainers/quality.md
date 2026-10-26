# Maintainer quality and compatibility checks

This guide describes current procedures and budgets. Dated measurements are in
[the quality archive](../archive/quality-through-1.0.md) and
[release records](../archive/release-history.md); they are not fresh checks of a
later checkout. User-facing requirements are in [compatibility](../guide/compatibility.md).

## Versions and public contract

All components ship in one Gavia UI version. The manifest records each
component's introduction version; the root changelog records later changes.
After 1.0, patches preserve the public contract, minors add compatible features
and incompatible changes require a major with a migration. Historical 0.x
breaking changes required a minor and a Breaking changes notice.

The contract includes props and requiredness, event payloads, slots, v-model,
exposed methods, imports/exports, CSS classes, data attributes, tokens and PT
sections. After a build, `pnpm verify:compatibility` compares declarations with
the immutable 0.11.1 snapshot. Earlier snapshots also remain preserved.
Additions are allowed; removal or narrowing blocks CI unless an exact,
version-scoped migration policy permits the reviewed transition.

The released 1.0 transition uses `scripts/migrations/public-api-1.0.json`.
The checker reports original inventory, semantic and consumer differences before
applying the fixed canonical PT, status, dismissal, Tooltip and icon-action
projections. Toast/Confirm PT context additions preserve prior fields, callback
parameters and returns. Unrelated drift, CSS classes, tokens, DOM markers and
package paths remain strict. CI checks policy/consumer hashes and negative cases.
Later changes must not inherit a compatibility exception automatically; a
migration note alone does not disable the gate.

An immutable 1.0.0 API/consumer snapshot is still a recorded
[release follow-up](../../ROADMAP.md#release-follow-up). Prepare it separately
from the verified published archive; `node scripts/check-compatibility.mjs --help`
describes snapshot generation. Preserve existing fixtures and review the result
rather than updating a baseline just to pass. This follow-up does not mean the
published archive skipped its migration-policy checks.

### Checking new public contracts

Compile-only fixtures import the public entry point and cover models, resolver
modes, column keys, slot values, select payloads, native attributes, actual
v-model modifiers, locale, PT and exposed refs. Positive examples and deliberate
errors run together; an incorrect error-expectation directive must fail.

`pnpm verify:package` copies the same TS, Vue and TSX fixtures into a clean
consumer of the installed archive. A separate strict Vue consumer imports every
public component and copyable SFC. The minimum CI consumer uses Vue 3.4.0 and
TypeScript 5.4.5; the other uses pinned Vue 3.5 and the current compiler.
`--typescript <exact-version>` selects that consumer compiler explicitly.
`strictTemplates` and JSX are enabled; `skipLibCheck` is disabled.

Check each prop/handler field rather than substituting whole objects with the
current type or ignoring TypeScript diagnostics. Source compilation, installed
declaration accuracy and compatibility are separate checks. The historical 0.11
results remain in the [quality snapshot](../archive/quality-through-1.0.md#checking-new-public-contracts)
and [migration guide](../migration.md#migration-0-11-0).

## Browsers and consumer environment

Target range: Chrome/Edge 111+, Firefox 121+, Safari/iOS Safari 16.4+ and
corresponding Android Chromium/Firefox. The foundation uses ES2020, CSS Layers,
`:has()`, `color-mix()` and container queries. These minimums reflect platform
features; the full suite has not run on every historical minimum version.
CI uses pinned Playwright Chromium, Firefox, WebKit and mobile Chromium.
WebKit covers an engine, not a physical Safari/iOS device. IE and old WebViews
are unsupported; the library installs no global polyfills. See
[consumer compatibility](../guide/compatibility.md) for the application contract.

Vue is the only required peer and CSS is imported explicitly. Repository
installation uses pnpm; isolated consumers intentionally cover other managers.
There is no CommonJS entry point. Package checks include Node16/NodeNext
resolution, native Node import, SSR, public types, copyable SFCs, licenses, font
URLs, package contents, publint/attw and a single-button bundle.

`pnpm verify:package:browser` uses the actual built consumer on desktop/mobile
and hydrates server HTML, preserving DOM, IDs and events without warnings.
Vue 3.4/3.5 share the root-scoped ID generator. Follow the [SSR guide](../guide/ssr.md)
for fresh request roots, matching initial tree/state, independent app prefixes
and `context.teleports.body` insertion. Arbitrary asynchronous branch reordering
and every Nuxt integration are not separately guaranteed. Importing the library
must not require `window` or `document`.

## Accessibility and graphics

Follow the [manual accessibility protocol](manual-accessibility.md) for exact
environments, the ten-component matrix and dated evidence. No manual run is
completed. The owner accepted unperformed NVDA/Firefox, macOS VoiceOver/Safari
and iOS VoiceOver checks as a known stable 1.0 limitation on 2026-10-25.
All unexecuted protocol cells remain Pending; automated CI and general owner
acceptance do not fill them.

The target is WCAG 2.2 AA. Axe scans visible DOM, including open lists/dialogs,
in all five themes. Critical keyboard, names, focus and cleanup behavior also
run across engines. An automated scan does not prove full WCAG conformance;
consumer applications need manual keyboard, zoom and assistive-technology checks.

Primary PNGs use Windows/pinned Chromium at desktop 1280 and mobile 390 widths.
Classic/Classic Dark geometry references use Arial/Consolas; Newspaper retains
its heading typography. Gavia/Gavia Dark use real Gavia Sans with upright/italic,
Latin, Cyrillic, numerals, home and overlays. Inspect expected/actual/diff before
accepting changes; CI never updates images automatically. Supplemental
Docker/Linux references remain separate. See [baseline maintenance](visual-baselines.md).

### Browser coverage strategy

Allocate cases by risk. Theme-independent behavior uses Gavia; critical focus,
native input/file selection, portals, history, transitions, scrolling and
responsive interactions also run in Firefox, WebKit and mobile Chromium.
`@cross-browser` selects that subset for secondary profiles. Chromium owns
Playground presentation and the full Axe sweep. Configured
[browser projects](../../apps/playground/playwright.config.ts) and tagged source
scenarios are the matrix, rather than a second hard-coded case count here.

All five themes remain covered by Windows visuals and Chromium accessibility,
including component states and quality/documentation pages. Secondary projects
do not register the same Axe cases or accumulate runtime skips. Narrow Alert
readability/dismissal scenarios use 320px and 390px in Gavia.

Axe uses `setLegacyMode(true)` to avoid the temporary `about:blank` helper that
stalled native Windows runs. Both entry points require no `iframe`/`frame`
elements and exactly one `page.frames()` entry. WCAG tags, scopes, rules and
zero-violation assertions remain unchanged. Adding frames requires full frame
coverage before altering these guards; an unexpected frame must fail the audit.

Manifest inventory, exact copyable source, parsing, public types and model
validation belong primarily to unit/contract tests. Keep representative browser
rendering and clipboard checks. Removing duplicates must preserve behavior,
assertions and relevant engine coverage; a smaller suite is not a passing run.

## Performance

Pages preflight measures cold production loading in Chromium at 1440×900 and
390×844 with a fresh context per route/theme. The mobile context uses pinned
Pixel 7 emulation. Home, WlButton, WlSelect and WlDialog across five themes give
40 loads. There is no CPU/network throttling; these are lab observations, not
field percentiles or results for every connection.

Measure after route mount, normal document loading and font readiness. Record
LCP, largest CLS session, navigation/resource transfer and font transfer. CLS
uses the [session-window definition](https://web.dev/articles/cls), excluding
recent-input shifts. Retain per-load resource breakdowns in the Chromium
`cold-loading-measurements.json` artifact. Budgets are CLS <0.1, home ≤600 KB,
docs ≤650 KB and home fonts ≤90 KB; a budget is not a measured result.
Loading/asset procedures are in [Playground performance](playground-performance.md).

### Measured RC cleanup snapshot

The 2026-10-24 table, exact revision and CI artifact are preserved in the
[archived measurement](../archive/quality-through-1.0.md#measured-rc-cleanup-snapshot).
Its values passed the configured budgets for that revision, not later changes.

## Coverage and size

`pnpm test:coverage` produces HTML, LCOV, JSON summary and Vitest results.
`pnpm quality:update` reads those reports to update Playground data and the
README badge; it rejects failed/incomplete runs. CI carries the report into
Pages and the portable Playground from the same workflow, checking version and
Git revision. Dates describe the unit measurement, not package publication.
See [quality presentation](playground.md#quality-and-compatibility) for shared UI.
Browser/visual/Axe results and publication remain separate workflow records.

CI minimums are lines/statements/branches/functions 97/97/85/81%; critical
attribute restoration when overlay closing is cancelled is 100%. Declarations,
generated catalogs, manifest metadata and re-export entry points are excluded;
components, utilities and icon/token resolution are included. Do not lower
thresholds for green CI or add tests that merely mirror implementation.

The installed single-WlButton consumer measures all gzipped JS including Vue,
and the complete retained kit graph before gzip. The README size badge excludes
CSS and fonts. Measurements, provenance and 5% headroom are canonical in
[`package-consumer-budget.json`](../../scripts/package-consumer-budget.json).
The separate Button/Select/form/all-components gate on Vue 3.4/3.5 uses
[`size-limits.json`](../../scripts/size-limits.json). Index-only size is not
comparable with a complete shared-chunk graph. Unused component/editor-catalog
assertions remain active. A budget change needs a measured reason. Full CSS is
explicitly imported; per-component CSS tree-shaking is not promised.

## Running checks

Use targeted commands in [AGENTS.md](../../AGENTS.md#4-daily-checks-and-recipes)
for affected behavior. Builds, packing, full suites, E2E, visual, Pages and
installed-consumer checks require an explicit instruction. Follow its complete
[release checklist](../../AGENTS.md#6-release-checklist--only-on-explicit-request)
and the [release procedure](releases.md) for delivery; prefer GitHub CI for the
heavy matrix on a resource-constrained workstation.

[CI maintenance](ci.md) owns workflow/provenance rules and
[visual maintenance](visual-baselines.md) owns screenshot acceptance. A build,
passing check, owner acceptance and publication remain separate states.
