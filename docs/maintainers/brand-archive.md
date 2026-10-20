# Brand source archive

Status: **local source separation implemented; checks deferred**. On 2026-10-19,
twenty allowlisted PNG, prompt and historical-variant files moved from `docs/brand`
to the version-controlled [`archives/brand`](../../archives/brand/README.md).
The original square social mark was also preserved there before replacement.
No source was deleted or re-encoded. No external destination was created.

## Active assets and provenance

`docs/brand` retains the final mark/button/social SVGs, four current background
WebPs and the real component-preview WebP. The twelve responsive WebPs remain in
`apps/playground/src/assets/brand`; no image derivative or baseline was changed.
The new 1280 x 640 social PNG remains at the existing public `gavia-social.png`
URL. Its SVG source uses the accepted mark and Gavia Regular outlines, preserving
the transparent eye and bill. Local image inspection covered text and margins;
social-provider and browser acceptance remains pending.

The immutable [2026-10-17 inventory](../brand/archive-proposal.json) still records
the original names, byte sizes, SHA-256 values and proposal state. Its twenty
archive candidates total 12,853,566 bytes; that is source storage, not a browser
transfer measurement. The archive index maps those names directly to the new
locations and records the extra original social mark. It is kept in this
repository so a checkout remains complete without an unapproved external upload.
Relocation does not shrink Git history.

## Maintain and recover sources

1. Read the archive index and adjacent original prompts. Preserve filenames,
   authorship and revision descriptions. The active README links to this archive;
   do not substitute generated art for an authored source.
2. Use a full repository checkout with `archives/brand` present. For a source
   comparison, use its original SHA-256 in the historical inventory. To restore
   a file for editing, copy that exact archived source into a separate work
   location; keep the archived original unchanged.
3. The existing `apps/playground/scripts/brand-images.mjs` now reads its four
   PNG sources from `archives/brand`. Old manifest `source` strings retain the
   original `docs/brand` provenance; the checker accepts only the corresponding
   old or new allowlisted path and still compares both source and output hashes.
   Future intentional regeneration records the new source location. No manifest
   was rewritten by hand for this relocation.
4. With verification authorized, use the same documented sharp 0.35.5 command in
   [Playground performance](playground-performance.md#responsive-brand-artwork)
   and inspect any resulting asset diff. Recovery/derivative verification was
   not run in this iteration; no reproducibility pass is claimed.

## Social-card maintenance

The self-contained [social SVG](../brand/gavia-social.svg) is 1280 x 640 and uses
outlined Gavia Regular text, the existing mark and colors `#294451`, `#52616a`
and `#f3f1e9`. The PNG was rasterized directly from it with the bundled sharp
runtime, without a browser capture or font replacement. Font licensing remains
documented by [Gavia OFL](../../packages/ui-kit/fonts/gavia/OFL.txt) and
[Onest OFL](../../packages/ui-kit/fonts/gavia/Onest-OFL.txt).
To update the composition, edit the SVG and intentionally export its PNG at the
same dimensions. Inspect the image before accepting it. Do not run the artwork
derivative generator for a social-only change.

No lint, builds, image-check commands, browser/visual/Pages tests or package checks
were run after these edits. GitHub settings, deployment and publication remain
separate owner-authorized actions. Keep original sources in the tracked archive
if a future external archival destination is introduced.
