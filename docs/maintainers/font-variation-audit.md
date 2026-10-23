# Gavia variable-font acceptance

Gavia Sans uses the author's accepted six upright and six italic masters.
The variable axis is `wght` 100–700. Geometry, metrics and endpoint recovery are
part of the font contract; reducing transfer must not redraw the font.

## Accepted source

The owner visually accepted the font on 2026-10-22. The canonical stylesheet is
`packages/ui-kit/styles/fonts/gavia.css`; assets and source manifests live in
`packages/ui-kit/fonts/gavia/`. Static faces retain their accepted bytes and are
registered only under `@supports not (font-variation-settings: normal)`.

The preparation baseline's Core files are 75,428 bytes upright and 79,696 bytes
italic, each below the 80,000-byte file limit. Full faces preserve international
coverage. These byte sizes describe the prepared assets, not final-page transfer.
Final-candidate loading, CLS and archive acceptance belong to
[the candidate gates](release-candidate.md#candidate-gates).

Full CSS retains coverage of Core base characters so a marked grapheme can use
one complete face. Disjoint ranges split base/mark rendering in browser checks;
they are unsuitable for this font contract. See the
[cluster-matching rules](https://www.w3.org/TR/css-fonts-4/#cluster-matching).
The later Core declaration remains preferred for ordinary text. Home decorations
use SVG so they do not require the international face. Real network requests and
cross-browser cluster raster comparisons are separate acceptance checks;
`document.fonts.load()` may force both overlapping declarations during a probe.

## Reproduce through the existing pipeline

See [font tooling](../../scripts/fonts/README.md) for supported commands, Python
dependencies, source paths and explicit normalization permissions. Use existing
tools; do not install or rebuild implicitly during an unrelated check.

1. Audit the immutable masters and their recorded hashes before generating.
2. Generate into a new destination, never over accepted masters or artwork.
3. Check exact master recovery, contour direction/order, advances, metrics,
   shaping, interpolated weights and all required language coverage.
4. Check Core/Full CSS ranges and grapheme clusters. Full delivery must not
   force duplicate Core requests or break combining-mark shaping.
5. Verify generated manifests/hashes and both upright/italic Core byte budgets.
   Promote only pipeline output; never hand-edit generated font bytes or hashes.
6. Check the public stylesheet and aliases, conditional static fallback,
   standalone TTF/WOFF2 download and npm font licenses/URLs.

## Browser acceptance

Use one browser and one check at a time. On the workstation, apply the existing
hard aggregate RAM/CPU/process/time limits; use CI for full matrices.

- Check Gavia and Gavia Dark with the actual loaded font, not a system fallback.
- Check EN/RU home, extended alphabets, combining clusters and real italic.
- Check presets and intermediate weights, including the 100–700 slider.
- Confirm the normal home Core request is ≤90 KB transfer without redundant
  Full/static downloads when the page's text fits Core.
- Measure font-loading CLS and total page transfer on desktop and mobile.
- Compare Core/Full rendering where their retained glyphs are shared.

Store browser metrics and expected/actual/diff screenshots as CI artifacts or
release attachments. An unexpected visual change needs owner review before any
baseline update. Windows/Chromium remains primary; Linux references are separate.
The previous owner acceptance is retained when glyph geometry is unchanged.

## Delivery

The npm package contains WOFF2s, font notices and the small face manifest.
The large variable audit manifest stays in the repository for verification;
it is not a runtime dependency. Full desktop/font-download archives include
the relevant licenses and version metadata.

Passing a font audit, a build or a browser check does not establish npm
publication. Verify the exact candidate archive and actual published integrity
through [the release procedure](releases.md).
