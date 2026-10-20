# Gavia variable-font preflight

The 2026-10-17 read-only audit found that the accepted Gavia Sans 0.600 masters
cannot yet be interpolated safely. No font, CSS registration, manifest or
specimen asset was replaced. Static fonts remain the accepted drawing.

## Reproduce without installing tools

Use Python 3.12 or later from the repository root:

```sh
python -B scripts/fonts/audit_variable.py --report .tmp/gavia-variable-audit.json
python -B -m unittest discover -s scripts/fonts -p test_variable.py -v
```

The audit uses the standard library. Its report includes every source filename
and SHA256, affected glyph ID, Unicode label, contour endpoint and point-kind
sequence. Exit 0 means necessary structural checks pass; exit 1 means masters
are incompatible; exit 2 means invalid input or provenance. A matching topology
does not establish correct point correspondence or optical interpolation.

The current result is **24 incompatible glyphs in each style**, out of 886
glyphs per master. Coverage maps 780 characters. All twelve committed TTFs match
both the manifest and the independently frozen hashes in `verify_fonts.py`.
The focused tests passed 8/8, including malformed fonts, repeat-encoded flags,
composite ordering, manifest mismatch and a no-write check over existing assets.

## Affected authored numerals

Every numeral below affects its default, tabular and proportional form. The
other two authored numerals, 1 and 7, pass these structural checks. Letters,
extended characters and remaining glyphs also pass the structural comparison.

| Numeral | Points at 100 / 300 / 400 / 500 / 600 / 700, upright | Italic difference |
| --- | --- | --- |
| 0 | 60 / 60 / 56 / 58 / 58 / 60 | Same counts |
| 2 | 53 / 45 / 47 / 47 / 47 / 45 | Same counts |
| 3 | 43 / 42 / 42 / 40 / 40 / 40 | Weight 400 has 41 points |
| 4 | 12 / 12 / 12 / 12 / 12 / 13 | Same counts |
| 5 | 62 / 56 / 56 / 56 / 58 / 58 | Same counts |
| 6 | 67 / 67 / 67 / 67 / 58 / 58 | Same counts |
| 8 | 100 / 92 / 88 / 82 / 82 / 79 | Same counts |
| 9 | 67 / 67 / 67 / 67 / 58 / 58 | Same counts |

`draw_gavia.py` expands skeleton strokes, performs boolean operations and then
converts each result independently through `Cu2QuPen(max_err=.5)`. The accepted
outputs have different segment counts. Changing tolerances, fitting a donor
outline or padding arbitrary points would not establish a common authored
contour model. The existing drawing module and its frozen fingerprint remain
unchanged.

## Remediation and build boundary

Use shared semantic segment boundaries for the authored numeral paths, then
convert corresponding cubic segments together with a shared subdivision plan.
Exact curve subdivision may add points without changing the underlying curve;
the chosen conversion must prove correspondence and preserve every accepted
master's geometry and metrics within the existing acceptance contract. Boolean
results need contour ordering and direction checks before subdivision. A common
point count alone is insufficient. Keep default/tabular/proportional placement
and the seven-degree oblique consistent.

The initial supported axis is **100–700**, default 400. The review's 900 endpoint
has no accepted master and `STROKES` has no 900 calibration. Extending that range
requires a separately reviewed authored weight; the pipeline does not
extrapolate it or declare a misleading CSS range.

`scripts/fonts/build_variable.py --preflight` fails before loading optional
FontTools dependencies or creating output. After masters become compatible,
the separately authorized build accepts a **new scratch directory** via
`--output-dir`. It constructs actual `gvar` variation data through FontTools,
checks instantiated outlines/metrics at all accepted weights, and writes draft
WOFF2s and a draft manifest. Package, specimen and source directories are
protected against replacement. That build path has not run: it is currently
blocked by the master audit.

The 2026-10-18 investigation installed pinned optional tools only in ignored
`.tools/font-build`: FontTools 4.66.1, brotli 1.2.0, uharfbuzz 0.56.3 and
skia-pathops 0.9.2. It reproduced all 192 affected drawn numeral variants and
96 tabular aliases with their accepted coordinates and advances. Joint Cu2Qu
conversion produced compatible streams for digit 3; the other seven affected
digits already differ at the stroke-expansion/boolean stage. Digit 4 has a
contour-topology change before curve conversion. A shared converter alone
therefore does not resolve the prerequisite.

The unchanged full static-font verifier also passed all twelve faces, including
shaping, numeric alternatives, metrics, accepted geometry and frozen binary/table
identities. Its sole QA report write was redirected into ignored scratch, with
canonical fonts and their QA JSON unchanged. This establishes static-font
acceptance, not variable interpolation. See the dated
[verification record](../../review/VERIFICATION-2026-10-18.md) for local evidence.

Variable-font shaping checks, Latin/Latin-ext/Cyrillic subsets, fallback metrics,
font preloads, CSS migration and the 80 KB budget remain pending after compatible
masters. Windows Gavia/Gavia Dark screenshot review and native small-size
acceptance are separate requirements. No size or rendering improvement is
claimed by this preflight.

FontTools documents the [variable build](https://fonttools.readthedocs.io/en/latest/varLib/index.html)
and [interpolatability diagnostics](https://fonttools.readthedocs.io/en/latest/varLib/interpolatable.html).

## Bounded zero-master feasibility, 2026-10-18

An isolated prototype normalized 36 accepted zero outlines across six weights,
both styles and default/tabular/proportional figures to a common 64-point
structure. It retained all 2,112 original points and flags and inserted only
96 tracked, constant quadratic segments at existing integer on-curve anchors.
Removing those additions recovered all 72 original directed rational-polynomial
contour streams, including implied midpoints, exactly. Advances and bearings
were preserved. An independent serialized-output check passed and rejected seven
deliberate corruptions; both actual processes exited zero. All 46 guarded font,
source and fixture inputs remained byte-identical.

## Further bounded endpoint-data proofs, 2026-10-18

Ignored prototypes now cover all eight structurally affected numerals. Each row
covers 36 accepted forms: six weights, both styles and
default/tabular/proportional figures. These are data proofs, not built fonts.

| Numeral | Common derived points per form | Representation and proved endpoint scope |
| --- | --- | --- |
| 0 | 64, two contours | Original 1000 UPM grid; 96 tracked constant quadratics across 36 forms |
| 2 | 55, one contour | Original 1000 UPM grid; 138 tracked constant quadratics |
| 5 | 62, one contour | Original 1000 UPM grid; 78 tracked constant quadratics |
| 3 | 61, one contour | Hypothetical 2000 UPM data; 579 exact implied midpoints and 69 constant quadratics |
| 6 / 9 | 71 each, contours 35/36 | Hypothetical 2000 UPM data; 264 midpoints and 120 constant quadratics across 72 forms |
| 8 | 104, contours 48/32/24 | Hypothetical 2000 UPM data; 144 midpoints, 18 exact line-elevation controls and 222 constant quadratics |
| 4 | 16, contours 12/4 | Hypothetical 2000 UPM data; entirely constant added counter and coincident ON padding, with the correspondence caveat below |

The proofs retain every original point and full decoded flag in cyclic order.
Removing only tracked additions recovers complete directed endpoint polynomial
streams and physical advance/bearing ratios. Doubled coordinates and UPM retain
the exact position in em; no rounding or curve fitting is involved. Saved-data
checks recover the accepted TTF arrays. Semantic span checks do not establish
correspondence between every internal adaptive quadratic cut. All 46 protected
font/source/fixture/recording inputs remain unchanged.

### Four: failed correspondence and bounded replacement

The first 12/4-point candidate preserved every endpoint but interpolated poorly:
at 625/650 its growing counter added disconnected ink; at 675 it crossed the
outer boundary. Moving only its collapsed counter point removed those islands
at the 19 tested weights, but could not remove the signed-ink area overshoot.
This failed correspondence remains recorded rather than accepted.

A bounded search then examined 81 outer templates: one original Bold vertex
receives three coincident ON points, with each of nine original cyclic seams.
Every template preserves original cyclic orientation, flags and endpoint
polynomials. Duplicating the right upright top K with seam A preserves all eight
stable A-F/K/L matches. The earlier claim that those eight matches uniquely
force padding at junction M was too strong; K is a counterexample. Padding at
the diagonal cap E is also area-monotone but breaks the F-to-F cap match.

For normal/default K, with `t = (weight - 600) / 100`, the conditional signed-ink
area is `156327 + 30607*t - (26785/2)*t*t`; its derivative is at least 3822 on
`[0,1]`. In all six style/figure groups, 19 exact rational samples at 605-695
have simple outer/counter polygons, a wholly contained counter, zero added
outside ink and actual nonzero fill equal to the polynomial. All 36 endpoint
forms were recovered exactly from the serialized candidate; four deliberate
corruptions were rejected.

This is a mathematical candidate requiring anatomical review. Its old notch
points H/I/J converge to K, while G converges to M: the short notch lip becomes
the Bold M-K top edge and other notch/stem-cap edges collapse. Keeping eight
landmarks and monotone area does not establish that this transfer matches the
author's intended intermediate drawing. Continuous-coordinate interpolation is
not an all-weight containment/topology or acceptable visual-continuity proof.

### Unchanged delivery boundary

The canonical audit still reports 24 incompatible glyphs per style; compatibility
and variable-font delivery remain **blocked**. No font was saved or built and
the accepted 1000 UPM static fonts, QA identities and public font contract remain
unchanged. A hypothetical 2000 UPM construction is not a binary-identity claim.
A whole-font decision must cover glyphs/components, translations, anchors,
horizontal/vertical and other UPM-dependent metadata, hinting and coordinate
limits consistently. Binary round-trip/instantiation, shaping, degenerate-point
compiler/native raster behavior, authored intermediate correspondence and
optical approval remain unproved. Subsets, CSS migration and size budgets remain
pending as described above.

Local evidence is under `.tmp/verification-2026-10-18/`: the
`font-{zero,two,five}-anchor-feasibility-run01/` reports,
`font-three-double-grid-feasibility-run01/`,
`font-six-nine-double-grid-summary.json`, `font-eight-double-grid-summary.json`,
and `font-four-{intermediate,counter-refinement,outer81}-run01/`. The last report
retains all 81 templates, the corrected landmark claim and the acceptance limits.
