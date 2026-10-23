# Maintainer quality and compatibility checks

This document describes verification procedures. Dated results below are
historical evidence, not fresh checks or current publication status. User-facing
contracts are in [compatibility](../guide/compatibility.md).

## Versions and public contract

All components ship in one Gavia UI release. The catalog records the version
in which each component first appeared; see changelog for later changes.
Patch preserves the public contract; minor adds features. In 0.x, breaking
changes are allowed only in a minor with a Breaking changes notice and migration
guide. A minor increment does not itself imply incompatibility.
After 1.0, incompatible changes require a major.

The contract includes props and requiredness, events/payloads, slots, v-model,
exposed methods, imports/exports, CSS classes, data-wl, tokens and pt sections.
After a build, `pnpm verify:compatibility` compares actual declarations against
the immutable 0.11.1 snapshot. Earlier 0.3/0.5/0.9.1 snapshots are also preserved.
Additions are allowed; removal or narrowing blocks CI. The agreed 0.11 transition
uses a separate version-limited migration contract: it changes only specific
expected fields in the previous contract and one declaration in a copy of the
Vue consumer. Original differences remain in the report; additional breakage
still blocks the gate. A snapshot of a newly accepted stable release is added
separately after npm verification; `node scripts/check-compatibility.mjs --help`
describes the command. Do not update the baseline just to pass.
A migration note alone does not disable the gate. Type checks do not prove
identical behavior; unit/E2E checks remain necessary.

The prepared 1.0 source adds an exact policy in
`scripts/migrations/public-api-1.0.json` against the immutable 0.11.1 baseline.
The existing checker still reports original inventory, semantic and consumer
differences before applying fixed projections for canonical PT, reviewed status
types/props, dismissal spelling, Tooltip naming and icon-action names. Explicit
Toast/Confirm PT context additions preserve prior fields, callback parameters
and returns. Unrelated API drift, CSS classes, tokens, DOM markers and package
paths remain strict. Only preparation at 0.12.1 with the specific major changeset,
or 1.0 stable/RC versions, can select this policy; intervening 0.x releases do not
inherit it. CI checks the policy/consumer hashes and negative regression cases.
No historical fixture has been replaced. The policy does not
authorize publication or establish that the 0.x deprecation period was released.

New compile-only consumer fixtures check accepted props and expected errors:
model/resolver/mode, column keys, slot values, select payloads and pt sections.
They import the public entry point. `verify:package` copies the same TypeScript/Vue
fixtures into a clean consumer and compiles against declarations in the installed
archive. A source build does not prove published generic accuracy.
During 0.11.0 preparation, contracts were checked locally in source and in the installed archive.

### Checking new public contracts

verify:package prepares compile-only TS, Vue and TSX scenarios using the installed
archive’s public export. They check inference for options/model, rows and table
cell slots, navigation items/groups, actual v-model modifiers, locale, pt, native
attributes and exposed refs. A separate strict Vue consumer imports all public
components. Positive examples and expected errors are checked together;
an incorrect error-expectation directive must also stop compilation.

The minimum CI consumer uses Vue 3.4.0 + TypeScript 5.4.5; another uses pinned
Vue 3.5 and the current compiler. `--typescript <exact-version>` selects the
consumer compiler explicitly so linked vue-tsc does not substitute workspace
TypeScript. strictTemplates and JSX are enabled; skipLibCheck is disabled.
Historical compatibility fixtures are not rewritten.

During local 0.11.0 preparation on October 8, 2026, package/playground typecheck,
build and pack passed: 686/686 unit tests for 0.11.0, lines/statements 98.44%,
branches 89.26%, functions 86.51%. The same archive was checked with Vue 3.4.0 /
TypeScript 5.4.5 through npm and Vue 3.5.40 / TypeScript 5.8.3 through pnpm:
21 positive/negative API fixtures, all 53 components and 59 copyable SFCs.
Node import/SSR passed in both environments; desktop/mobile and SSR hydration
were checked on both Vue versions. Bun 1.4.0 / Vue 3.5.40 also passed those checks.
The quality snapshot and badge came from that unit run. These are 0.11.0
preparation results. CI and publication status are recorded separately in
[release history](release-history.md#release-0110).

On October 8, the agreed 0.11 migration gate also passed for all 53 components.
Focused migration-mechanism tests passed 3/3, covering 17 invalid-policy rejections
and 14 unapproved API breakage scenarios. The earlier generic-helper test passed
1/1 with 11 negative scenarios. Comparison now checks each prop/handler field:
whole-object comparison had missed incompatible callback-payload widening.
No new builds, packs or full unit/E2E/visual runs were started in that iteration.

The historical 0.9.1 gate records five declaration changes: multiple Autocomplete
requires an array instead of unknown; CommandPalette and Sidebar select payloads
contain readonly collections; arbitrary createWlPt result extensions are unknown;
range DatePicker requires explicit selectionMode. The unchanged Vue consumer also
detects ref<unknown> in keyed Select. These transitions are explicitly included
in the 0.11 migration contract; fields are not replaced wholesale with Current,
and TypeScript diagnostics are not globally ignored.
Negative checks protect other event fields, models, slots and exposed methods.
Approval is tied to the original baseline, migration guide and minor Changeset,
then constrained to version 0.11. New API accuracy and compatibility with every
previous TypeScript contract are separate checks.
[Migration guide](../migration.md#migration-0-11-0).

## Browsers and consumer environment

Target range: Chrome/Edge 111+, Firefox 121+, Safari/iOS Safari 16.4+,
and corresponding Android Chromium/Firefox.
The foundation uses ES2020, CSS Layers, :has(), color-mix and container queries.
Minimums come from platform features; the full suite has not been run on every
historical minimum version. CI uses pinned Playwright 1.58.2 Chromium, Firefox,
WebKit and mobile Chromium. WebKit checks the engine; it does not replace a
separate Safari/iOS device.
Sources: [MDN :has](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:has),
[MDN color-mix](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/color-mix).
IE and old WebViews are unsupported. When extending requirements, define a
fallback/feature detection and a test first; the library installs no global polyfills.

Vue remains a peer; CSS is imported explicitly. Consumers may install through
pnpm, npm or Bun; the manager does not change API or theme.
Repository development uses only pnpm. ESM requires a Vue SFC bundler or a
plain ESM consumer; there is no CommonJS entry point.

`pnpm verify:package` checks the exact archive, native Node import, SSR,
types/copyable SFCs, build, files/licenses/font and a single-button bundle.
`pnpm verify:package:browser` also runs the actual built consumer on desktop/mobile
and hydrates server HTML: DOM and IDs are preserved, events work and there are
no hydration warnings. This checks Vue SSR without claiming separately verified
integration for every Nuxt module. Vue 3.4 and 3.5 use the same root-scoped
ID generator, reset for a fresh server-render root. Server-tree and hydration
order must match on both versions; arbitrary asynchronous branch reordering
is not separately guaranteed. Use explicit prefixes for independently mounted
applications that share a document.
Overlays and browser actions start after mount; importing the library must
not require window/document.

Overlays use Teleport to body. The SSR server must insert
`context.teleports.body` from `renderToString(app, context)` at the beginning of
body, before the application root, preserving portal order. The test server
does this and checks hydration without suppressing warnings.
Vue recommends a dedicated SSR container; if your framework handles only its
own teleport target, use its ClientOnly for these overlays and check integration
separately. [Vue SSR contract](https://vuejs.org/guide/scaling-up/ssr.html#teleports).

## Accessibility and graphics

Manual release acceptance follows the
[NVDA/VoiceOver protocol](manual-accessibility.md). Its ten-component matrix,
mobile setup, exact versions, dates and evidence are tracked separately from
automated checks. The prepared protocol currently has no completed manual runs.

The target is [WCAG 2.2 AA](https://www.w3.org/TR/WCAG22/).
Axe scans visible DOM, including open lists and dialogs, in five themes.
Scanning runs once in Chromium; critical keyboard and focus checks run in every engine.
Checks cover names, ARIA relationships, contrast, errors, disabled/loading and
focus restoration. An automated scan does not confirm full WCAG compliance:
the consumer application needs manual keyboard, zoom and NVDA/VoiceOver checks.

Visual PNGs use Windows/pinned Chromium, desktop 1280 and mobile 390.
Classic / Classic Dark geometry baselines use Arial/Consolas; Newspaper retains
its heading typography. Gavia / Gavia Dark baselines use real Gavia Sans,
including 12 faces, Cyrillic, Latin, numerals, home and overlays.
Review expected/actual/diff before accepting intentional changes.
CI never updates images automatically.

### Browser coverage strategy

Allocate the browser matrix by risk instead of repeating every scenario across
themes, engines and viewport sizes. Theme-independent behavior uses Gavia once;
critical library interactions also run in Firefox, WebKit and mobile Chromium.
Keep real focus, native input and file selection, portals, history, transitions,
scrolling and responsive layout in browser tests. Playground-only report,
catalog and documentation presentation runs in the primary Chromium project.

The default matrix registers 296 cases: 176 in Chromium, including 60 Axe
audits, and 40 critical scenarios in each of mobile Chromium, Firefox and
WebKit. The `@cross-browser` tag selects that critical subset for the three
secondary profiles. This replaces the earlier 878-case matrix; historical runs
of that matrix do not establish acceptance of the current suite.

All five themes remain covered by the dedicated Windows visual suite and the
Chromium accessibility suite. The latter registers 60 Axe cases: 50 page and
component-state audits plus ten quality-summary/documentation audits. Other
projects do not register these cases; they do not accumulate runtime skips.
Alert readability and both dismissal paths use 320px and 390px in Gavia rather
than repeating the same actions in five themes.

Axe uses its built-in `setLegacyMode(true)` option to collect results in the
audited page. Default `finishRun` collection uses a temporary `about:blank` page;
native Windows runs encountered stalls while creating or closing that helper.
Both audit entry points require zero `iframe`/`frame` elements and exactly one
entry in `page.frames()` before using the in-page mode. WCAG tags, include scopes,
enabled rules and zero-violation assertions remain unchanged. Adding framed
content requires full frame coverage before changing these guards or the mode;
an unexpected frame must fail the audit rather than escape coverage.

Manifest inventory, exact copyable source, public types, parsing and model
validation belong primarily to unit and contract tests. Keep representative
browser checks for actual rendering and clipboard interaction. Removing a
matrix duplicate must retain the underlying behavior, assertions and relevant
engine coverage; a smaller suite is not evidence that a check has passed.

## Performance

The Pages preflight measures cold production loading in Chromium at 1440×900
and 390×844, using a fresh browser context for every page/theme combination.
Mobile uses the pinned Pixel 7 device scale and touch/mobile emulation. The
sample covers home, WlButton, WlSelect and WlDialog in all five themes: 40 loads.
There is no CPU or network throttling; these are lab observations, not field
percentiles or a claim about every user's connection.

Measure after the route has mounted, normal document loading and font readiness.
Record LCP, the largest CLS session, navigation/resource transfer and font
transfer. CLS follows the [session-window definition](https://web.dev/articles/cls):
exclude recent-input shifts and use the largest burst within a five-second
window, with less than one second between shifts. Keep the resource breakdown
and per-load JSON in the Chromium CI artifact; publish only the measured summary
here. Preserve budgets of CLS <0.1, home ≤600 KB, docs ≤650 KB and home fonts
≤90 KB. A budget is not a measurement or acceptance result.

### Measured RC cleanup snapshot

Recorded on 2026-10-24 for `90512bcf2e1bdfbe9ce4d33bf65f8d284251b4fb` in the
[passing Pages preflight](https://github.com/whitewolf06/gavia-ui/actions/runs/40040006467/job/120708696559).
The Chromium artifact retains all 40 rows and their resource breakdowns in
`cold-loading-measurements.json`. All transfer columns below are bytes;
documentation values are WlButton / WlSelect / WlDialog, in that order.
LCP ranges and maximum CLS cover all four routes in each row.

| Theme | Width | Home | Documentation | Home fonts | LCP, ms | Maximum CLS |
| --- | ---: | ---: | --- | ---: | --- | ---: |
| Gavia | 1440 | 449633 | 527704 / 535648 / 533376 | 75728 | 172–648 | 0.042546 |
| Gavia Dark | 1440 | 512803 | 527704 / 535648 / 533376 | 75728 | 156–596 | 0.042546 |
| Classic | 1440 | 373905 | 451976 / 459920 / 457648 | 0 | 176–324 | 0.042110 |
| Classic Dark | 1440 | 437075 | 451976 / 459920 / 457648 | 0 | 180–320 | 0.042110 |
| Newspaper | 1440 | 373905 | 451976 / 459920 / 457648 | 0 | 168–184 | 0.042110 |
| Gavia | 390 | 465165 | 527704 / 535648 / 533376 | 75728 | 168–572 | 0 |
| Gavia Dark | 390 | 545019 | 527704 / 535648 / 533376 | 75728 | 148–560 | 0 |
| Classic | 390 | 389437 | 451976 / 459920 / 457648 | 0 | 304–544 | 0 |
| Classic Dark | 390 | 469291 | 451976 / 459920 / 457648 | 0 | 300–536 | 0 |
| Newspaper | 390 | 389437 | 451976 / 459920 / 457648 | 0 | 304–604 | 0 |

These observations pass every configured budget. They include initial
prerendered loading and do not claim zero layout shift or throttled-device LCP.
Classic, Classic Dark and Newspaper request no Gavia files after removing the
unconditional Core preload; Gavia themes retain one compact upright request.
The existing CI Chromium job runs Pages build, prerender, smoke checks and this
measurement independently of the browser-test step's outcome. Public Pages
deployment remains limited to a successful CI for the same current `main` SHA.
Supplemental Linux visuals reuse the existing container workflow; their PNGs
remain separate from the primary Windows baselines.

## Coverage and size

`pnpm test:coverage` creates HTML, LCOV, JSON summary and Vitest results in
`packages/ui-kit/coverage/tests.json`. `pnpm quality:update` reads percentages
and passed-test counts from those files, records the version and run time,
and updates playground data and the README SVG badge.
Home shows passed/total, unit pass rate and line coverage; the detailed page
shows lines, statements, branches and functions. Values go to WlProgress on a
0–100% scale with accessible percentage text. Theme tokens supply colors,
radii and motion; prefers-reduced-motion disables bar entry motion.
Metrics belong to that unit run. Browser/visual/axe and publication results
are separate workflow results.
The [saved measurement](../../apps/playground/src/project/quality-report.generated.json)
supplies the README badge. The [playground section](https://whitewolf06.github.io/gavia-ui/?view=docs&section=quality)
shows its build’s report; after CI publication it may differ from the saved snapshot.
The date is the measurement date, not package publication.
The generator rejects failed or incomplete runs; CI passes data to Pages and the
playground archive from the same workflow, validating the version and Git revision.
CI minimums are respectively 97/97/85/81%; critical attribute restoration when
overlay closing is cancelled is 100%.
Type declarations, generated catalogs, manifest metadata and re-export entry
points are excluded; components, utilities, icon resolution and token resolution
are included. Thresholds are not raised automatically or lowered for green CI.
Add scenarios for observed failures or meaningful uncovered branches, not percentages.

The installed single-WlButton consumer measures all gzipped JS, including the
Vue peer, and all retained kit chunks before gzip. The 2026-10-18 Node 24 run
measured 29,250 / 30,090 / 33,093 gzip bytes on Vue 3.4.0 / 3.4.38 / 3.5.40;
the complete retained kit graph is 27,145 bytes before gzip. Limits add 5% to
the measured maximum: 34,748 / 28,503 bytes. The README size badge is the saved
largest installed-consumer gzip measurement, excluding CSS and fonts.
The earlier index-only kit measurement is not comparable with the complete
shared-chunk graph. Unused component and editor-catalog assertions remain active.
Budgets, retained exports, prior measurements and provenance are recorded in
[`scripts/package-consumer-budget.json`](../../scripts/package-consumer-budget.json).
The separate eight-fixture gate covers Button, Select, form and all-components
graphs on Vue 3.4/3.5; its fresh measurements and 5% limits are in
[`scripts/size-limits.json`](../../scripts/size-limits.json).
A limit change needs a measured reason. Full CSS is imported explicitly; per-component
CSS tree-shaking is not promised. Applications choose lazy loading for heavy pages.
