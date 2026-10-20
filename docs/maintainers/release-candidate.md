# Preparing the 1.0 release candidate

Status: **materials prepared; RC versioning, verification and release pending**.
This checklist implements the preparation portion of T9.8. It does not bump a
version, enter Changesets prerelease mode, create a tag, change remote settings
or authorize publication. Follow [the release procedure](releases.md) for the
actual commands after separate authorization.

## Candidate scope

The proposed first candidate is `1.0.0-rc.1`. Keep the RFC feedback period open
for two to four weeks after an actually published candidate; choose dates when
publication is confirmed. Feedback may require another candidate and new
verification. The repository's current source version is not an RC label.

- [ ] Review [the 1.0 decisions](../rfc/0001-public-api-1.0.md) and resolve open
  API questions before removing 0.x compatibility aliases.
- [ ] Preserve Vue `^3.4.0`, consumers on Vue 3.4/3.5, the `Wl`/`wl-*`/`--wl-*`
  namespace and all five theme identifiers.
- [ ] Complete English locale fallback and pt/dismissible/tone migrations with
  before/after examples, including the explicit Russian locale opt-in.
- [ ] Review public utils/composables, new controls, router adapter boundaries,
  types, manifests, live SFC examples and English/Russian guides together.
- [ ] Close or explicitly disposition every required pre-1.0 item in the
  [implementation ledger](../../review/IMPLEMENTATION.md). Keep the
  [post-1.0 tasks](../../review/10-post-1.0.md) visibly queued.
- [ ] Complete changelog and migration placeholders; generate package docs from
  canonical sources during the authorized package preparation.

## Evidence for the exact candidate

All entries below are **Pending** until a result identifies the exact SHA,
package version, archive SHA256, environment and run/artifact link.

| Gate | Required evidence | Status |
| --- | --- | --- |
| Source and generated assets | Strict package/Playground typechecks, lint, token/icon/API generation checks; no unexplained warnings | Pending |
| Tests | Full library and Playground tests, coverage thresholds, focused regressions and release-tool tests | Pending |
| Distribution | Build, pack, tar file/license/font inspection, external Vue, installed-archive import/SSR, publint and attw | Pending |
| Consumer contracts | Minimum and current Vue, TypeScript consumer matrix, strict templates/TSX, unchanged compatibility snapshots and approved migration policy | Pending |
| SSR IDs | Two instances, parallel/repeated SSR and hydration on Vue 3.4/3.5; no collisions, mismatches or suppression | Pending |
| Browser behavior | Production build; desktop/mobile, open/active/selected accessibility-tree states, keyboard, disabled/empty states, focus and overlay cleanup | Pending |
| Themes and visuals | Five themes; Windows/Chromium canonical desktop/mobile images and reviewed diffs; Docker/Linux has separate supplemental baselines | Pending |
| Performance | Fresh bundle and transfer measurements, documented budgets with 5% headroom; no reused review measurements | Pending |
| Manual accessibility | [Ten-component NVDA/VoiceOver protocol](manual-accessibility.md), physical mobile results and explicit owner acceptance | Pending |
| Documentation site | Production Pages subpath, direct paths, legacy query links, prerender, search, recipes, starter examples and copied SFCs | Pending |

Builds, packaging, full/browser/visual/Pages checks run only after the user's
separate instruction. Correct screenshot differences require inspection before
any baseline update. Record unavailable platforms as pending or blocked.

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
Candidate version / source SHA / archive SHA256:
Authorized actions and date:
Code readiness / automated gates / manual acceptance:
Pending items and owner decisions:
CI runs / consumer matrix / screenshot review:
NVDA / VoiceOver / physical mobile record:
Registry version / channel / integrity read-back:
GitHub release URL / Pages URL and deployed SHA:
Feedback window / issues / disposition:
Stable release decision and evidence:
```
