# Gavia Sans maintenance

Gavia Sans ships a continuous `wght` 100–700 axis with separate upright and
italic faces, derived from the six authored presets in each style. The owner
visually accepted the variable font on 2026-10-22. The
[acceptance record](../archive/font-variation-acceptance-1.0.md) preserves that
iteration and its browser/delivery requirements.

Gavia Sans is authored font software distributed under SIL OFL 1.1. Keep the
canonical source files, accepted table fingerprints, `OFL.txt`, `Onest-OFL.txt`
and derivative copyright notices. UI kit code remains MIT-licensed.

## Sources and delivery

The source manifest identifies twelve static faces and hashes for TTF/WOFF2.
Accepted static assets remain available under the conditional non-variable CSS
fallback. Variable files, manifests and the canonical stylesheet live in
`packages/ui-kit/fonts/gavia/` and `packages/ui-kit/styles/fonts/gavia.css`.
Preserve the authored outlines, metrics, shaping and public font paths; compact
delivery must not redraw the font. See [font tooling](../../scripts/fonts/README.md)
for source paths, Python dependencies and normalization permissions, and the
[consumer font guide](../guide/font-gavia.md) for installation and standalone use.

The npm allowlist ships WOFF2, font notices and the small face manifest. TTF,
the QA report and the large variable audit manifest remain in source. The
Playground's full font download reads repository sources and retains both
formats; npm exclusions must not change that download.

## Core and complete families

`Gavia Sans` / `Gavia` retain complete international coverage. Optional compact
faces use `Gavia Sans Core` / `Gavia Core`. Themes prefer
`"Gavia Sans Core", "Gavia Sans", ...` so a marked grapheme can fall back as a
whole rather than split across subsets of one family. Both Core styles have an
80,000-byte file budget; page transfer depends on the actual text and styles.

Core registrations use `@supports not (-moz-appearance: none)` because Firefox
splits some combining clusters ([Mozilla bug 543200](https://bugzilla.mozilla.org/show_bug.cgi?id=543200)).
Firefox intentionally requests the complete variable family. Chromium/WebKit
may use Core for ordinary text and the complete face for extended clusters.
Keep the family names explicit in probes and the complete face in custom stacks.
Do not restore a global Core preload: it duplicates a download when Firefox
selects the complete family. Any change to this workaround needs cross-browser
cluster comparisons, not only a font table check.

## Rebuild and accept a change

Use the existing pipeline only with explicit authorization; do not install or
rebuild fonts implicitly during a documentation or unrelated code check.

1. Audit immutable master hashes and generate into a new destination.
2. Check exact master recovery, contour order/direction, advances, metrics,
   shaping, interpolated weights and language coverage.
3. Check Core/complete ranges and grapheme clusters; avoid duplicate requests
   or broken combining marks. Verify both Core file budgets and generated hashes.
4. Promote pipeline output rather than hand-editing font bytes/manifests.
5. Check canonical/legacy CSS families and paths, static fallback, standalone
   TTF/WOFF2 download, licenses and package font URLs.

Then inspect real text in Gavia/Gavia Dark: EN/RU home, extended alphabets,
combining clusters, numerals, italic, six presets and intermediate slider weights.
Use the loaded face rather than a system fallback. Compare Core/complete shared
glyphs and verify Firefox's complete-family path. Measure desktop/mobile font
transfer and CLS; the Chromium/WebKit home budget is ≤90 KB without redundant
complete/static downloads when its text fits Core.

Use CI for full matrices. On a workstation, run one browser/check at a time under
the agreed aggregate RAM/CPU/process/time limits. Retain metrics and screenshot
diffs as artifacts; unexpected geometry changes require owner review before a
baseline update. Windows/Chromium remains primary, with separate Linux references.

## Release attachments

For an authorized release attachment, `scripts/archive-fonts.mjs` validates TTF
hashes, keeps the font notices and prepares a deterministic ZIP at an explicit
output path. It refuses to overwrite an existing file and does not publish.
Actual archive, browser font-loading and owner visual acceptance checks are
separate from generator unit tests. Check the exact archive and actual registry
integrity through the [release procedure](releases.md); a font audit alone does
not establish publication.
