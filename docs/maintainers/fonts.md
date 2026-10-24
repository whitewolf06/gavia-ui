# Gavia Sans maintenance

The [variable-font audit](font-variation-audit.md) records current incompatible
masters and the protected scratch build pipeline. Accepted static assets stay
unchanged until the authored geometry and rendering checks pass.

Gavia Sans is authored font software distributed under SIL OFL 1.1. Keep the
canonical source files, accepted table fingerprints, `OFL.txt`, `Onest-OFL.txt`
and derivative copyright notices. UI kit code remains MIT-licensed.

The source manifest identifies twelve faces and hashes for TTF and WOFF2.
Preserve the requested Gavia drawing and metrics when changing packaging or
building a variable font. A structural font check does not replace visual review
of specimens and real UI text. See
[font tooling](../../scripts/fonts/README.md) and the
[consumer font guide](../guide/font-gavia.md).

The npm allowlist ships WOFF2, font notices and the face manifest. TTF and the QA
report remain in source. The Playground's full font download reads repository
sources and retains both formats; npm exclusions must not change that download.

For an authorized release attachment, `scripts/archive-fonts.mjs` validates TTF
hashes, keeps the font notices and prepares a deterministic ZIP at an explicit
output path. It refuses to overwrite an existing file and does not publish.
Actual archive, browser font-loading and owner visual acceptance checks are
separate from generator unit tests.
