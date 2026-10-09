# Gavia UI compatibility and checks

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
the immutable 0.9.1 snapshot. Earlier 0.3/0.5 snapshots are also preserved.
Additions are allowed; removal or narrowing blocks CI. The agreed 0.11 transition
uses a separate version-limited migration contract: it changes only specific
expected fields in the previous contract and one declaration in a copy of the
Vue consumer. Original differences remain in the report; additional breakage
still blocks the gate. A snapshot of a newly accepted stable release is added
separately after npm verification; `node scripts/check-compatibility.mjs --help`
describes the command. Do not update the baseline just to pass.
A migration note alone does not disable the gate. Type checks do not prove
identical behavior; unit/E2E checks remain necessary.

New compile-only consumer fixtures check accepted props and expected errors:
model/resolver/mode, column keys, slot values, select payloads and pt sections.
They import the public entry point. `verify:package` copies the same TypeScript/Vue
fixtures into a clean consumer and compiles against declarations in the installed
archive. A source build does not prove published generic accuracy.
During 0.11.0 preparation, contracts were checked locally in source and in the installed archive.

<a id="проверка-новых-публичных-контрактов"></a>

### Checking new public contracts

verify:package prepares compile-only TS, Vue and TSX scenarios using the installed
archive’s public export. They check inference for options/model, rows and table
cell slots, navigation items/groups, actual v-model modifiers, locale, pt, native
attributes and exposed refs. A separate strict Vue consumer imports all 53
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
[release history](releases.md#release-0110).

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
[Migration guide](migration-0.11.0.md).

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
types/59 copyable SFCs, build, files/licenses/font and a single-button bundle.
`pnpm verify:package:browser` also runs the actual built consumer on desktop/mobile
and hydrates server HTML: DOM and IDs are preserved, events work and there are
no hydration warnings. This checks Vue SSR without claiming separately verified
integration for every Nuxt module. Vue 3.5 uses native SSR IDs; Vue 3.4 has an
application-scoped generator. In 3.4, synchronous SSR-tree and hydration order
must match; asynchronous branch order is not separately guaranteed.
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

The target is [WCAG 2.2 AA](https://www.w3.org/TR/WCAG22/).
Axe scans visible DOM, including open lists and dialogs, in five themes.
Scanning runs once in Chromium; keyboard and focus checks run in every engine.
Checks cover names, ARIA relationships, contrast, errors, disabled/loading and
focus restoration. An automated scan does not confirm full WCAG compliance:
the consumer application needs manual keyboard, zoom and NVDA/VoiceOver checks.

Visual PNGs use Windows/pinned Chromium, desktop 1280 and mobile 390.
Classic / Classic Dark geometry baselines use Arial/Consolas; Newspaper retains
its heading typography. Gavia / Gavia Dark baselines use real Gavia Sans,
including 12 faces, Cyrillic, Latin, numerals, home and overlays.
Review expected/actual/diff before accepting intentional changes.
CI never updates images automatically.

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
The [saved measurement](../apps/playground/src/project/quality-report.generated.json)
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

The single-WlButton consumer measures all gzipped JS, including the Vue peer
(limit 30,500 bytes), and kit code before gzip separately (13,500 bytes).
It also checks that unused components and editor catalogs are absent.
Budgets and headroom are recorded in `scripts/package-consumer-budget.json`;
a limit change needs a reason. Full CSS is imported explicitly; per-component
CSS tree-shaking is not promised. Applications choose lazy loading for heavy pages.
