# Preparing Gavia UI 1.0.0-rc.1

The candidate targets npm **`next`**. The owner authorized G2 on 2026-10-24:
date the release, commit/push, create `v1.0.0-rc.1` and run Release on GitHub.
Registry publication is not claimed by this source-preparation record; confirm
it from the workflow and npm before starting the two-to-four-week feedback period.
The pre-release registry baseline is **`latest = 0.12.1`**; preserve that tag.
The [1.0 migration](../migration.md#migration-1-0-rc-1) describes consumer changes.
The [release procedure](releases.md) governs delivery.

## Current candidate

Root and library versions are `1.0.0-rc.1`. Vue `^3.4.0`, TypeScript 5.4+,
`Wl*` / `wl-*` / `--wl-*`, explicit CSS imports and five themes remain supported.
The owner accepted an RC transition instead of a separate 0.x warning release.
The owner visually accepted the Gavia font on 2026-10-22.
On 2026-10-24 the owner accepted this RC with unverified manual accessibility
as a known limitation and authorized G1: merge PR #2, then verify CI and public
Pages on GitHub. G1 completed at main `435d6b4522156c1803f2e31384bbb1259f3f662a`:
[CI passed all ten jobs](https://github.com/whitewolf06/gavia-ui/actions/runs/40093335008),
[Pages deployed the same SHA](https://github.com/whitewolf06/gavia-ui/actions/runs/40093940860),
and public canonical/query URLs plus the 156-route prerender manifest were read back.
The subsequent G2 authorization covers this RC only, with all heavy checks on GitHub.

Candidate snapshot `06c726437806d43371f25e933ffffb82ca8158d4` passed
[all ten CI jobs](https://github.com/whitewolf06/gavia-ui/actions/runs/40041135927):
991 library tests, 439 Playground tests, 98.66% unit line coverage, 296 browser
cases, 24 visual scenarios on each platform and 26 Pages cases including 40 cold
loads. The table below records that snapshot; later commits require their own
[PR checks](https://github.com/whitewolf06/gavia-ui/pull/2/checks).
Work is tracked in Kvorum, epic **GAVIAUI-1**. The original review is preserved
at `archive/review-2026-10`, commit `b141d905d48069c347f228baeba0ad07d3fbc747`.

## Candidate gates

Record results for one exact source SHA and its exact archive. Keep logs, hashes,
resource measurements and screenshots in CI artifacts or release attachments.
Do not commit execution journals or links to ignored local files.

| Gate | Evidence required before delivery | Current acceptance |
| --- | --- | --- |
| Source contracts | Strict types, lint, API metadata, compatibility, tokens/icons and dependency boundaries | Passed on Node 22.13/24 in the linked CI |
| Tests | Full library/Playground suites, coverage and release/package tooling | Passed in the linked CI; thresholds retained |
| Exact distribution | Build, pack, contents/licenses/fonts, external Vue, strict publint and ESM declarations | Passed for the archive identified below |
| Installed consumers | pnpm/Vue 3.4, npm/Vue 3.4.0/TS 5.4 and Bun/Vue 3.5; SSR/hydration | Passed; consumer reports identify the same archive |
| Browsers | Production keyboard/ARIA, overlays and desktop/mobile interaction projects | Passed in Chromium, Firefox, WebKit and mobile Chromium |
| Visuals | Five themes on Windows/Chromium; separate supplemental Linux comparison | Passed; 12 intentional changes reviewed as expected/actual/diff before adoption |
| Pages | Production subpath, prerender, canonical/legacy links and direct routes | G1 completed on 2026-10-24; same-main-SHA CI, deployment and public URL read-back passed |
| Performance | LCP, CLS, total transfer and fonts on home plus three docs pages, desktop/mobile and five themes | All budgets passed; measured table in quality.md |
| Manual accessibility | Ten key controls: NVDA/Firefox, macOS VoiceOver/Safari and iOS VoiceOver | Unverified; owner accepted the RC limitation on 2026-10-24; no manual pass claimed |
| Owner acceptance | Candidate scope, known limitations and exact delivery actions | RC accepted, G1 completed and G2 authorized on 2026-10-24; registry read-back pending |

Performance targets: CLS <0.1, home transfer ≤600 KB, documentation ≤650 KB,
home font transfer ≤90 KB. Record measured values in
[quality](quality.md#performance), with environment and sample scope.
Bundle-size budgets remain independent gates.

The [verified CI archive](https://github.com/whitewolf06/gavia-ui/actions/runs/40041135927/artifacts/12539093723)
is `gavia-ui-1.0.0-rc.1.tgz`: 1,188,531 bytes packed, 2,677,869 bytes unpacked,
191 files. SHA-256:
`0a5bd3e18bea8837ae9473ba6bce37f1b37b450396ae3693abc3bad44617fa73`.
This identifies a checked candidate, not a published npm package.

Firefox intentionally uses the complete Gavia variable face to preserve
combining clusters; ordinary upright transfer is 56,192 bytes above Core.
Chromium/WebKit retain compact Core delivery. Authored font binaries are unchanged.
Manual NVDA/VoiceOver checks remain unperformed. The owner's 2026-10-24 decision
accepts that gap for this RC as a known limitation; it is not a manual pass or
stable-release acceptance. Keep the individual protocol result cells Pending.

## Prepare the decision

1. Preserve the original review in `archive/review-2026-10` before removing it
   from the delivery branch. Verify the remote archive before deletion.
2. Finish candidate cleanup and reconcile SFCs, types, manifests, examples,
   EN/RU guides, changelog and migrations. Preserve immutable compatibility
   fixtures and the accepted font artwork.
3. Run the current [quality checklist](quality.md) against one final SHA.
   Prefer GitHub CI; local checks run sequentially inside approved resource
   limits. Do not run multiple heavy checks on the workstation.
4. Inspect the exact archive that will be published. Retain its integrity and
   the installed-consumer results together; do not repack after verification.
5. Obtain actual results for the [manual protocol](manual-accessibility.md).
   An explicit RC skip must appear as a known limitation; it is not a pass.
6. Present a short gate/result/evidence table, archive identity, migration,
   known limitations and the proposed delivery actions to the owner.

## Delivery gates

- **G1, separately authorized:** merge the accepted PR and verify Pages from
  the same successful main SHA. Confirm the actual public routes afterward.
- **G2, separately authorized:** tag the approved merge commit and publish the
  checked RC archive with provenance to `next`; stable `latest` stays unchanged.
  Verify registry tags, integrity, release attachments and an installed starter.
- Start the two-to-four-week feedback period only after confirmed publication.
  Track reproducible issues and prepare further candidates when necessary.
- **G3, separately authorized:** prepare stable versioning, repeat all gates
  for its exact archive and obtain owner acceptance before stable delivery.

Prepare [announcement drafts](release-announcements.md) in advance. Posting
announcements, publishing npm, creating release tags and merging remain separate
actions. Source readiness, automated checks, manual acceptance and publication
must always be reported as distinct states.
