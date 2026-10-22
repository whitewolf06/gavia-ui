# Preparing Gavia UI 1.0.0-rc.1

The candidate targets npm **`next`**. It has not been published; publication and
the two-to-four-week feedback period require separate owner approval.
The [1.0 migration](../migration.md#migration-1-0-rc-1) describes consumer changes.
The [release procedure](releases.md) governs delivery.

## Current candidate

Root and library versions are `1.0.0-rc.1`. Vue `^3.4.0`, TypeScript 5.4+,
`Wl*` / `wl-*` / `--wl-*`, explicit CSS imports and five themes remain supported.
The owner accepted an RC transition instead of a separate 0.x warning release.
The owner visually accepted the Gavia font on 2026-10-22.

The preparation baseline is `b141d905d48069c347f228baeba0ad07d3fbc747`:
[nine successful CI jobs](https://github.com/whitewolf06/gavia-ui/actions/runs/39759728383),
990 library tests and 432 Playground tests. These results describe that revision,
not subsequent candidate cleanup. Work is tracked in Kvorum, epic **GAVIAUI-1**.

## Candidate gates

Record results for one exact source SHA and its exact archive. Keep logs, hashes,
resource measurements and screenshots in CI artifacts or release attachments.
Do not commit execution journals or links to ignored local files.

| Gate | Evidence required before delivery | Current acceptance |
| --- | --- | --- |
| Source contracts | Strict types, lint, API metadata, compatibility, tokens/icons and dependency boundaries | Recheck after cleanup |
| Tests | Full library/Playground suites, coverage and release/package tooling | Recheck after cleanup |
| Exact distribution | Build, pack, contents/licenses/fonts, external Vue, strict publint and ESM declarations | Recheck the final archive |
| Installed consumers | pnpm/Vue 3.4, npm/Vue 3.4.0/TS 5.4 and Bun/Vue 3.5; SSR/hydration | Recheck the final archive |
| Browsers | Production keyboard/ARIA, overlays and desktop/mobile interaction projects | Recheck after cleanup |
| Visuals | Five themes on Windows/Chromium; separate supplemental Linux comparison | Recheck; review every unexpected diff before changing PNGs |
| Pages | Production subpath, prerender, canonical/legacy links and direct routes | Final-candidate preflight required |
| Performance | LCP, CLS, total transfer and fonts on home plus three docs pages, desktop/mobile and five themes | Measure final candidate |
| Manual accessibility | Ten key controls: NVDA/Firefox, macOS VoiceOver/Safari and iOS VoiceOver | Pending owner results; no pass or waiver |
| Owner acceptance | Candidate scope, known limitations and exact delivery actions | Pending |

Performance targets: CLS <0.1, home transfer ≤600 KB, documentation ≤650 KB,
home font transfer ≤90 KB. Record measured values in
[quality](quality.md#performance), with environment and sample scope.
Bundle-size budgets remain independent gates.

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
