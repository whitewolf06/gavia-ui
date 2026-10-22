# Preparing Gavia UI 1.0.0-rc.1

Status on **2026-10-22: the exact RC archive passes distribution checks and one
installed-consumer lane; remaining release gates and publication are pending**.
After source preparation, the owner separately authorized building and checking
the archive with hard resource limits, then approved up to four wrapper processes
within the same aggregate limit. The owner subsequently authorized a commit,
push and the existing CI through a separate RC branch/draft PR. Those remote
results remain pending; see the [CI handoff](../../review/IMPLEMENTATION.md#rc1-ci-handoff-2026-10-22).
No new infrastructure, merge, tag or publication is authorized. Follow
[the release procedure](releases.md) after the required separate delivery instructions.

## Candidate scope

Root and library source versions are **`1.0.0-rc.1`**. The intended npm channel
is **`next`**. Registry history observed on 2026-10-22 still has `latest: 0.12.1`
and no RC. Publication date and the two-to-four-week feedback window are pending.
Start the window only after actual publication is confirmed. Feedback may require
another candidate with its own verification.

- [x] Record the owner's 2026-10-22 [RC transition decision](../rfc/0001-public-api-1.0.md#accepted-rc-transition--2026-10-22):
  opt-in `next` and two to four weeks of feedback replace the previously required
  intermediate 0.x deprecation release. No published warning period is claimed.
- [x] Prepare root/library versions and Changesets prerelease metadata for
  `1.0.0-rc.1`; preserve Vue `^3.4.0`, the `Wl`/`wl-*`/`--wl-*` namespace and
  all five theme identifiers. Consumer verification remains separate.
- [x] Prepare English locale fallback, canonical pt/dismissible/tone names,
  Tooltip export migration and icon-action name types with before/after examples
  and explicit Russian locale opt-in. This records source preparation only;
  automated/consumer/manual acceptance below is pending.
- [ ] Review public utils/composables, new controls, router adapter boundaries,
  types, manifests, live SFC examples and English/Russian guides together.
- [ ] Close or explicitly disposition every required pre-1.0 item in the
  [implementation ledger](../../review/IMPLEMENTATION.md). Keep the
  [post-1.0 tasks](../../review/10-post-1.0.md) visibly queued.
- [x] Retain the completed variable-font geometry/metric/shaping and size evidence;
  record the owner's visual font acceptance on 2026-10-22. The original artwork
  and static binaries remain. The exact archive's font contents, hashes, CSS and
  consumer asset emission now pass; CLS and fresh browser checks remain pending.
- [x] Prepare the canonical changelog and [candidate migration](../migration.md#migration-1-0-rc-1),
  including localization, PT/tone/dismissible, Tooltip and icon-action names.
- [x] Generate package README/LICENSE/CHANGELOG through the existing prepack hook
  and verify their canonical contents in the installed RC archive. The ignored
  generated copies were not edited by hand.

## Prepared version state

The preparation updates only the root and published library versions. The private
Playground package, excluded from Changesets versioning, keeps 0.1.0 and its
`workspace:*` dependency. Dependency ranges and lockfile resolutions were not
changed by this preparation. Introduction metadata for the seven newly added
components now points to **1.0.0-rc.1**. The existing manifest contract accepts RC
suffixes as well as stable versions; it was updated but not run. This preserves
the first-public-version meaning without attributing new components to 0.12.1.
Playground source-version badges use the package metadata. The published-version
field is 0.12.1, matching the registry read-back rather than the prepared RC.

Changesets **3.0.3** uses `.changeset/pre.json` with `mode: pre`, `tag: rc` and
archives consumed notes in `.changeset/pre/`. The six notes retained there are
`canonical-api-1-0`, `gavia-variable-font-source`, `localization-1-0`,
`playground-canonical-home-links`, `review-followup-api` and `review-foundations`.
They remain available for stable promotion; no release notes were discarded.
The candidate numbering starts at the explicitly requested **rc.1**; no rc.0
release or publication is invented. The current package version determines the
next candidate number.

Metadata was edited directly against the installed Changesets 3 format; no
version command ran. The subsequent archive checks are recorded below and do
not constitute a Changesets versioning check. Do not rerun `release:version`
just to package rc.1: it prepares a subsequent version. Add a changeset for new
candidate changes; stable promotion later uses the existing prerelease-exit and
version procedure under separate authorization. Historical compatibility pins
and saved quality snapshots retain their original versions and evidence.

## Evidence for the exact candidate

The distribution result below belongs to one exact archive from the uncommitted
working tree on base HEAD `9c2be71fa6bbd3378aacdd4b8f5332775a75645d`. It does not
certify the whole release checklist. Earlier results retain their original source
boundaries; missing current-candidate checks remain pending.

| Gate | Required evidence | Status |
| --- | --- | --- |
| Source and generated assets | Strict package/Playground typechecks, lint, token/icon/API generation checks; no unexplained warnings | Partial: library build generated declarations with the existing strict diagnostic gate; separate typechecks, lint and asset-generation checks not run |
| Tests | Full library and Playground tests, coverage thresholds, focused regressions and release-tool tests | Pending |
| Distribution | Build, pack, tar file/license/font inspection, external Vue, installed-archive import/SSR, publint and attw | Verified for the archive below: library build, prepack/pack, contents, installed consumer, publint strict and all six attw JS/JSON entrypoints under the existing ESM-only profile |
| Consumer contracts | Minimum and current Vue, TypeScript consumer matrix, strict templates/TSX, unchanged compatibility snapshots and approved migration policy | Partial: pnpm / Vue 3.4.38 / TypeScript 6.0.3 passes 21 contract files and 66 copied SFCs with strict templates/TSX and skipLibCheck false; minimum/3.5/other-manager lanes and compatibility rerun pending |
| SSR IDs | Two instances, parallel/repeated SSR and hydration on Vue 3.4/3.5; no collisions, mismatches or suppression | Partial: native import and DOM-free SSR pass with seven stable IDs and no warnings on Vue 3.4.38; full SSR/hydration matrix pending |
| Browser behavior | Production build; desktop/mobile, open/active/selected accessibility-tree states, keyboard, disabled/empty states, focus and overlay cleanup | Pending |
| Themes and visuals | Five themes; Windows/Chromium canonical desktop/mobile images and reviewed diffs; Docker/Linux has separate supplemental baselines | Pending |
| Performance | Fresh bundle and transfer measurements, documented budgets with 5% headroom; no reused review measurements | Partial: installed WlButton graph passes the unchanged budget, 30383 gzip bytes including Vue / 24035 rendered kit bytes; broader measurements and CLS pending |
| Manual accessibility | [Ten-component NVDA/VoiceOver protocol](manual-accessibility.md), physical mobile results and explicit owner acceptance | Pending |
| Documentation site | Production Pages subpath, direct paths, legacy query links, prerender, search, recipes, starter examples and copied SFCs | Pending |

Full/browser/visual/Pages checks still require the user's separate instruction.
Correct screenshot differences require inspection before any baseline update.
Record unavailable platforms as pending or blocked.

<a id="archive-verification-2026-10-22"></a>

## Exact archive verification — 2026-10-22

The checked file is [gavia-ui-1.0.0-rc.1.tgz](../../.tmp/rc1-package-2026-10-22/gavia-ui-1.0.0-rc.1.tgz),
**1250887 bytes**, SHA256
`0748a7e32277e7ebeaaa1aef0306a65f8af3e756aeeabb344c2545d9f315081a`.
The installed-consumer evidence records the same hash; verification did not
repack or replace the archive. Later documentation edits do not change its bytes.

Environment: Windows, Node **24.15.0**, pnpm **10.34.5**, Vite **8.3.4**,
TypeScript **6.0.3**, vue-tsc **3.3.13**, consumer Vue **3.4.38**.
Every step ran sequentially inside a Windows Job with aggregate and per-process
**1024 MiB** commitment, **one logical processor**, at most **four processes**,
below-normal priority, a **90-second user-CPU limit per process** and the wall
deadline recorded below. Node heap limits were 512 MiB or less. Idle parent
Node/pnpm wrappers shared the aggregate limit. Consumer lifecycle commands used
pnpm's existing shell emulator through a session environment setting; no
repository script or configuration was added or weakened.

| Step | Result | Wall time / limit | Peak aggregate commitment | Evidence |
| --- | --- | --- | --- | --- |
| Library `vite build --configLoader runner` | PASS, including strict declaration generation | 68.98 / 180 s | 884.07 MiB | [log](../../.tmp/rc1-library-build-runner-2026-10-22.log), [resources](../../.tmp/rc1-library-build-runner-resources-2026-10-22.json) |
| Library `pnpm pack --pack-destination ...` | PASS; existing prepack generated all three package documents | 3.96 / 90 s | 111.16 MiB | [log](../../.tmp/rc1-pack-2026-10-22.log), [resources](../../.tmp/rc1-pack-resources-2026-10-22.json) |
| `publint <exact.tgz> --strict` | PASS, no findings | 2.42 / 90 s | 67.83 MiB | [log](../../.tmp/rc1-publint-2026-10-22.log), [resources](../../.tmp/rc1-publint-resources-2026-10-22.json) |
| `check-package-types.mjs <exact.tgz>` | PASS, six JS/JSON exports, existing `esm-only` profile | 24.10 / 120 s | 298.91 MiB | [log](../../.tmp/rc1-types-2026-10-22.log), [resources](../../.tmp/rc1-types-resources-2026-10-22.json) |
| `verify-package.mjs --archive <exact.tgz>` | PASS, actual archive installed offline | 134.90 / 180 s | 649.72 MiB | [log](../../.tmp/rc1-consumer-2026-10-22.log), [resources](../../.tmp/rc1-consumer-resources-2026-10-22.json), [consumer evidence](../../.tmp/package-verification/pnpm-vue-3.4.38-node.json) |
| `tar -tzf <exact.tgz>` | PASS, 192 files; no source/tests/scripts/node_modules, TTF or font QA report | 0.23 / 30 s | 2.35 MiB | [contents](../../.tmp/rc1-tar-contents-2026-10-22.txt), [archive summary](../../.tmp/rc1-archive-2026-10-22.json), [resources](../../.tmp/rc1-tar-resources-2026-10-22.json) |

The archive contains six library JS chunks, five theme files and **16 WOFF2s**:
12 accepted static faces and four Full/Core variable files. License/notices,
canonical package documents, font hashes, all CSS font URLs and emitted consumer
fonts pass the existing checks. Core files remain **75428 / 79696 bytes**, below
80000 each. Vue remains the external `^3.4.0` peer; no nested Vue, PrimeVue or
PrimeIcons package is present. The Node SSR check reports no warnings, and the
button probe retains only `WlButton` from the public component entry.

The consumer's all-component fixture emits a **548.71 kB** chunk, triggering
Vite's generic 500 kB warning. This fixture deliberately exercises the full
catalog; its warning is retained in the log. The separate installed-button graph
passes both unchanged size budgets. No warning threshold or assertion was relaxed.

The first build attempt used the default Vite config loader under the earlier
one-process cap and failed before source compilation when Vite spawned Windows
`net use`: [failed log](../../.tmp/rc1-library-build-2026-10-22.log),
[resources](../../.tmp/rc1-library-build-resources-2026-10-22.json).
It took 19.72 s, peak 1022.14 MiB. After explicit approval of wrapper processes,
the existing `runner` loader passed within the same RAM/CPU limits. The failed
attempt is not counted as a pass. No package source defect required a code change.

This run did not include full unit/coverage suites, Playground build, E2E,
visual/Pages/browser runs, the minimum/3.5 consumer matrix, compatibility rerun,
font reconstruction or manual accessibility/performance measurements. Their
earlier evidence is preserved; this archive check does not renew it.

## Feedback and delivery

1. Prepare a concrete candidate summary, upgrade guide, known limitations and
   the checked archive. Request the separately required delivery actions.
2. On authorized RC publication, confirm the registry `next` channel serves the
   checked archive. Record the feedback period start/end and public feedback URL.
3. Triage feedback into reproducible issues with version/environment evidence.
   Recheck changed behavior and every affected gate; retain original results.
4. Prepare stable versioning only after feedback and owner acceptance. Run the
   separately authorized stable checklist against its own exact archive.
5. Confirm npm `latest`, GitHub release artifacts and Pages at their public URLs.
   Pages must use successful verify/browser/visual gates for the same main SHA.
6. Publish only approved [announcement drafts](release-announcements.md) and
   remote repository metadata after actual read-back. No automatic external posts.

## Release record

```text
Candidate version: 1.0.0-rc.1
Source revision: RC PR/CI head SHA; local archive checkpoint predates commit on base HEAD 9c2be71
Archive: .tmp/rc1-package-2026-10-22/gavia-ui-1.0.0-rc.1.tgz (1250887 bytes)
Archive SHA256: 0748a7e32277e7ebeaaa1aef0306a65f8af3e756aeeabb344c2545d9f315081a
Authorized actions/date: preparation, then bounded build/pack/archive verification, 2026-10-22
CI handoff authorization, 2026-10-22: commit/push codex/gavia-1-0-rc-1 and draft PR into main
Code readiness: implemented scope recorded in review/IMPLEMENTATION.md
Automated gates: distribution and pnpm/Vue 3.4.38/TS 6.0.3 consumer PASS; other gates pending
Manual font acceptance: owner confirmed, 2026-10-22
Pending quality: performance/CLS and formal NVDA/VoiceOver/mobile protocol
Transition decision: RC feedback replaces the separate 0.x warning release
CI runs / remaining consumer matrix / exact-candidate browser and visuals: pending
Registry observation, 2026-10-22: latest 0.12.1; no candidate published
RC channel / publication date / integrity: next / pending / pending
GitHub release / Pages deployment: not performed
Feedback start/end: pending confirmed publication; duration two to four weeks
Stable release decision: pending feedback, acceptance and separate authorization
```
