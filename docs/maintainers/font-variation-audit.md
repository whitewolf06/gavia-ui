# Gavia variable-font implementation and acceptance

## Owner visual acceptance — 2026-10-22

The owner confirmed that the font was checked and accepted visually. Repeating
font appearance approval is no longer an open task. Source version 1.0.0-rc.1
is prepared; measured CLS and automated acceptance of the exact candidate remain
pending. No new font build or validation ran. This supersedes owner/optical
acceptance-pending statements in the earlier dated checkpoints below; it does not
claim new platform-by-platform browser measurements or screen-reader results.

## Canonical activation and focused Chromium acceptance — 2026-10-21

The validated four-file payload below is now copied to the canonical font
directory and enabled by `styles/fonts/gavia.css`. This supersedes older
not-promoted/browser-pending statements. Static binaries and source artwork
retain their accepted hashes. Static face registrations are now inside
`@supports not (font-variation-settings: normal)`, because the initial real-browser
check selected exact static weights over the variable range and downloaded
redundant assets. The corrected stylesheet loads variable faces. Rebuilding a
draft replaces the generated block without nesting/duplicating registrations;
the single targeted CSS-generation Python unit passes.

Windows Chromium 145.0.7632.6 passes the [focused browser checks](../../.tmp/font-browser-2026-10-21.json):
Russian Gavia home requests one normal Core (75428 body / 75728 transfer bytes),
six presets and 450/550 load both variable styles, legacy `Gavia` works, specimen
controls render real italic, 18 Core/full raster comparisons match including
combining clusters/extended Cyrillic, weight 450 differs from both masters, and
the standalone ZIP contains 35 verified entries. No page error/font failure was
reported. The [screenshot](../../.tmp/gavia-variable-browser-2026-10-21.png) was
viewed; baseline PNGs were not changed.

One browser/context and Vite server shared a Windows Job capped at 1 GiB,
one CPU affinity and about one-quarter core, with a 180-second automated deadline
and 15-minute preview lifetime. The check took 43.92 seconds; peak commitment at
handoff was 811.86 MiB. See the [resource checkpoint](../../.tmp/font-browser-resource-checkpoint-2026-10-21.json).
Two single-system-process Chromium attempts crashed; normal Chromium passed
under the same aggregate RAM/CPU bounds. No simultaneous checks, new repository
launcher/dependency, full test/build/pack/visual-baseline/Pages sequence, commit,
push or publication occurred. Previous lint/Vitest failures remain pending.
T5.3 stays Partial for measured CLS and exact-candidate verification; owner visual
acceptance was confirmed on 2026-10-22 as recorded above. Local activation does
not claim release acceptance.

## Bounded Core/full delivery — 2026-10-21

The font-file budget now passes in both styles. The generated payload is
`.tmp/gavia-variable-bounded-2026-10-21-run02/`; no canonical font or CSS was
replaced. Full draft-build acceptance is still separate from this size result.

| File | Bytes | Purpose |
| --- | ---: | --- |
| `Gavia-Variable-Core.woff2` | **75,428** | Primary Latin-1/common Cyrillic request |
| `Gavia-Variable-Italic-Core.woff2` | **79,696** | Matching italic core |
| `Gavia-Variable.woff2` | 131,620 | Complete international fallback |
| `Gavia-Variable-Italic.woff2` | 138,676 | Complete italic fallback |

Four files replace the previous eight-file language partition. Core includes
Latin-1 letters, common Cyrillic, numbers, punctuation and currencies. Full
faces keep every original mapped character. CSS declares Full before Core in
each style/family; Core wins for ordinary covered text, while complete coverage
remains available for extended characters and combining clusters. Core does not
claim combining marks. Its retained precomposed Latin-1 glyphs preserve canonical
composition where available; complete coverage remains for other clusters. This follows
[CSS composite-font ordering](https://www.w3.org/TR/css-fonts-4/#composite-fonts)
and [cluster matching](https://www.w3.org/TR/css-fonts-4/#cluster-matching);
actual cross-browser loading and fallback remain pending acceptance.

Only private Core glyph names are omitted (`post` format 3). Glyph IDs, cmap,
GSUB/GPOS features, contours and advances remain intact. On reopening WOFF2,
the build restores the in-memory original GID-to-name mapping before checking
every retained glyph, metric and HarfBuzz result at all six accepted weights.
The original strict shaping checks and exact zero-tolerance IUP remain enabled.
No approximate outline, glyph-grid reduction, avar rewrite or OTL recomputation
is used. The earlier experimental layout/shape-equivalence helpers were removed.

[Build log](../../.tmp/font-bounded-build-2026-10-21-run02.log): all four files
passed endpoint/shaping checks after serialization in both styles.
[Identity audit](../../.tmp/font-bounded-identity-2026-10-21.log): Full files are
byte-identical to the previous draft, all 24 accepted static binaries and the
authored geometry source retain their frozen hashes. The builder rejects
**either** Core above 80,000 bytes before writing a payload.
[Focused Python tests](../../.tmp/font-bounded-unit-2026-10-21.log): 27/27 pass.
Scoped Vitest could not complete within 1 GiB: its first run reached the job
memory limit; its second used one native thread and a smaller JS heap and
stopped at that heap limit. Scoped ESLint on four integration files timed out at
90.06 seconds, peak 337.64 MiB. These are failures/pending checks, not passes;
no successful current Vitest/lint/typecheck/package/browser result is claimed.
The limits were retained and no further retry was started. See the
[current execution ledger](../../review/IMPLEMENTATION.md#t53-bounded-fonts-2026-10-21)
for exact resource logs.

Every calculation runs alone in a temporary Windows Job Object: 1 GiB committed
memory, one processor affinity, CPU hard cap 156/10000 on 16 logical processors
(about one quarter of one processor), below-normal priority and 90 seconds wall
time. The complete font build uses a 180-second wall limit and 40-second user
CPU limit; it passed in 129.27 seconds at **160.67 MiB** peak committed memory.
[Resource evidence](../../.tmp/font-bounded-build-resources-2026-10-21-run02.json).
An initial 90-second build was terminated at that exact bound without output.
Memory-allocation and timeout probes confirmed enforcement. The launcher exists
only in the execution session; no repository harness or dependency was added.
[Windows CPU controls](https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-jobobject_cpu_rate_control_information).

The 80,000-byte result is a **per-Core file** gate. Using italic and normal,
extended characters or combining clusters can request more than one file.
Actual main-page transferred bytes, CLS/loading, intermediate optical quality,
native small-size rendering and canonical activation remain pending. T5.3 stays
Partial until those acceptance items are complete. Browser results from the
previous static-font site do not certify this draft. No full checks, commits,
pushes, publication or baseline updates were performed in this iteration.

## Historical run-02/run-03 checkpoint — before Core/Extended

**Draft generation passed; T5.3 acceptance remains incomplete.** All 25 Python
unit tests passed. Both `gavia-variable-candidate-2026-10-21-run02` and
`gavia-variable-candidate-2026-10-21-run03` were built successfully under `.tmp/`.
The builds passed exact geometry, semantic-flag, coverage, metric and HarfBuzz
shaping guards at all six accepted masters in both styles, including checks
after WOFF2 serialization and reopening.

Run 03 additionally applies exact IUP optimization with `tolerance=0.0`. Every
optimized tuple is expanded again and compared with every original integer
delta, including phantom points, without rounding or an epsilon. Approximate
IUP and rounded residual deltas remain disabled.

The latest scratch payload contains eight variable WOFF2 files and its manifest
at `.tmp/gavia-variable-candidate-2026-10-21-run03/fonts/gavia/variable-manifest.json`.
Its measured file sizes include:

| File | Bytes |
| --- | ---: |
| `Gavia-Variable-Latin.woff2` | 62,276 |
| `Gavia-Variable-Cyrillic.woff2` | 39,080 |
| Normal Latin + Cyrillic | **101,356** |
| `Gavia-Variable.woff2` | 131,620 |
| `Gavia-Variable-Italic.woff2` | 138,676 |

The **80,000-byte main-page font target is not met**: the two normal core
subsets alone exceed it by 21,356 bytes. These are file sizes, not a browser
transfer measurement. The full variable faces are absent from candidate CSS
registrations; the stylesheet references the language subsets.

No draft was promoted. Canonical TTF/WOFF2 files, font CSS, frozen hashes,
source artwork and the current specimen remain unchanged. Browser transfer,
CLS/loading and fallback behavior, intermediate optical correspondence and
native small-size approval remain pending. Automated browser gates for the
current site exercise its accepted static fonts; their results cannot establish
variable-font acceptance or make T5.3 Verified.

## Historical source-only checkpoint — 2026-10-21, before the builds

**Implementation prepared; generation and all acceptance are deferred.**
The instruction for that source-only iteration authorized finishing T5.3 code
without runs, a new verification harness, commits, push or publication. No font builder, audit,
unit test, syntax/type/lint check, renderer or size measurement was executed in
this iteration. Accepted TTF/WOFF2 files, `draw_gavia.py`, frozen identities,
canonical font CSS and the current specimen remain unchanged.

The prior blocker now has a tracked implementation in
`scripts/fonts/variable_geometry.py` and the existing `build_variable.py`:

- Scale complete in-memory copies of all accepted masters from 1000 to 2000
  UPM through the pinned FontTools scaler, including component translations,
  metrics and positional layout tables. Physical coordinates in em stay the
  same; caret direction ratios are not dimensional lengths.
- Keep every original numeral point/full decoded flag in cyclic order.
  Materialize exact implied midpoints and degree-elevated lines, then add
  constant segments only inside named semantic spans. Exact rational directed
  polynomial recovery is a build guard, rather than a point-count assertion.
- Normalize all eight affected numerals in default, tabular and proportional
  forms, both styles and six accepted weights. The finite four correspondence
  uses seam A, duplicate K vertices at Bold and collapsed counters below Bold.
  Its weight-600 collapse is the exact midpoint of the original K–L edge,
  checked against the six saved coordinates. The recipe no longer reads `.tmp`.
- Construct real `gvar` data using integer direct deltas, including phantom
  points, with adjacent-master tent supports at quantized OpenType knots.
  Approximate IUP and rounded residual deltas are disabled. Existing layout
  variation is retained; phantom points supply horizontal/vertical metrics.
- Reopen serialized WOFF2 and recover all accepted weights before writing a
  payload. Check geometry, semantic flags, coverage, line/advance metrics and
  HarfBuzz shaping, including numeric alternatives and retained accent clusters.
  At this source-only checkpoint these guards had not executed for the new model.

`audit_variable.py` intentionally still reports the original masters as
incompatible. Likewise, `build_variable.py --preflight` retains the strict raw
audit. The separately authorized build path permits only the recognized
hash-pinned inputs and documented outline normalization; an unknown issue is
not automatically repaired or ignored.

### Prepared delivery

The existing build command stages a new scratch payload with two full variable
faces and Latin, Latin-ext and Cyrillic WOFF2 subsets for each style. Subsets
retain all layout features, including `pnum`/`tnum`, and share supported combining
marks so accented clusters remain in one font. The manifest records actual
cmap ranges, hashes, master identities, normalization provenance and pending
acceptance. The axis remains 100–700, default 400; no 900 master is invented.

`styles/fonts/gavia-variable.css` in that payload composes the existing static
registrations first, followed by supported variable registrations for both
`Gavia Sans` and `Gavia`. All twelve static WOFF2s and OFL notices are retained.
The separate `Gavia Sans Fallback` face aligns the accepted line box; its 100%
size adjustment does **not** claim measured local-font x-height/advance matching.
Consumers can explicitly add that fallback to their font stack.

The existing Playground font-download plugin and package/asset checks recognize
the optional variable manifest. The plugin adds a Latin preload and the variable
download files only when canonical font CSS actually references them. Vite
resolves the preload source together with the CSS asset, preserving hosted base
paths and development URLs. No runtime flag or additional build/test wrapper was
introduced. Current pages keep their accepted static assets and have no draft
font URL to load.

### Acceptance boundary recorded before generation

At this source-only checkpoint no variable font had been produced or promoted.
Exact endpoint recovery had to pass
when the code first runs; topology equality is still insufficient to establish
authored intermediate correspondence. The K/seam-A choice and adaptive internal
quadratic cuts require optical/native review over the axis, especially 600–700.
Windows Gavia/Gavia Dark screenshots, small sizes, shaping, browser preload/
fallback behavior and the **80 KB total main-page font-transfer target** remain
unmeasured. The implementation does not promise that the first draft meets them.

After a separately authorized build and acceptance, merge the generated WOFF2s,
`variable-manifest.json` and `VARIABLE-FONTLOG.txt` into the existing font folder,
and promote the staged CSS to the existing `styles/fonts/gavia.css` path. Keep
the canonical static manifest, originals, licenses and frozen verification
identities. The draft stylesheet is complete and does not import itself when
promoted. No version bump, font installation or publication is implied.

## Historical raw preflight and bounded investigations

The following records describe 2026-10-17/18. Their historical passes and blocked
delivery state do not validate the later implementation above.

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

The 2026-10-17 raw-audit result was **24 incompatible glyphs in each style**, out of 886
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

### Historical delivery boundary — 2026-10-18

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
