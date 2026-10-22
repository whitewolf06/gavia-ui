# Gavia Sans 0.6 font sources and build

Gavia Sans 0.6 is an experimental OFL derivative of Onest with independently authored numerals. The current family contains six weights (100, 300, 400, 500, 600, 700), each with an upright and italic file, and preserves the base's coverage of 780 mapped characters. The repository and public specimen keep only the accepted current Gavia Sans family; earlier development editions are available through Git history.

## Drawing and provenance

The letters retain Onest proportions and vertical metrics. A uniform 96% horizontal scale makes the letter collection slightly narrower; this is an Onest-derived alphabet, not an independently redrawn one. `draw_gavia.py` adds small non-affine terminal refinements to `a/а`, `e/е` and `l`. The two-storey `a/а` is restored. Punctuation, extended characters, source alternates, composite accents and marks remain derived from Onest, with corresponding horizontal metrics and anchors adjusted.

All ten numerals are independently authored in `draw_gavia.py`. Zero, two, five and eight use Bezier centre-line drawings expanded into strokes; one, three, four and seven use filled closed contours. Three has a horizontal top bar at Y707, a restrained diagonal transition and a curved lower bowl, with a bottom optical overshoot of -8. Six combines an expanded loop with a filled diagonal; its smooth counter is subtracted after union so the diagonal endpoint cannot interrupt the inner oval. Nine is the rotated counterpart of the same authored construction. One has a longer diagonal entry with a vertical terminal cut, a full vertical stem and a broad, flat foot for a classical silhouette. Zero is undotted and four is open. Accepted Regular ink widths, for 0 through 9, are 432, 418, 434, 430, 413, 430, 448, 423, 446 and 448 units. These current targets are verified from actual outlines; historical midpoint comparisons are no longer run. The form details are optical decisions rather than donor-outline interpolation. Four has a shorter upright and lower crossbar; seven adds a restrained left entry bracket; eight uses wider bowls with a calmer waist. Six and nine have wider ovals and cleaner diagonal terminal cuts.

The builder calibrates centre-line widths and heights before stroke expansion with bounded iterative searches. Flat forms occupy the 0–707 vertical range; curved forms allow optical overshoot to approximately -8 and 715. Six spans -8–707 and nine spans 0–715. This aligns the optical numeral height and baseline while preserving curved overshoot. The shared stroke calibration for weights 100/300/400/500/600/700 is 40/69/84/102/120/137 units; horizontal strokes use 92% of that thickness. Centre-line proportions are calibrated before expansion, so fitting a narrow or wide digit does not stretch its finished stroke. Skia expands the authored centre-line drawings and resolves contour overlaps; FontTools converts cubic Beziers to quadratic curves for TrueType output. These values are an optical starting point, not a claim that every numeral has identical perceived darkness at every size.

The accepted 0.600 drawing retains its original set of 24 binary SHA256 values in the verifier. The user-requested 2026-10-07 rename changes only name records to Gavia Sans. A separate frozen set of renamed binary hashes and accepted-0600-tables.json proves that every original table except name is unchanged; only head.checkSumAdjustment is normalized because the file checksum follows name changes. The fingerprint file has its own fixed SHA256. The verifier does not load earlier Gavia Sans editions or report historical cross-version comparisons.

The letters remain proportional. Default and `tnum` numerals have 600-unit advances. `pnum` changes advances and placement only: the same numeral drawing is retained, without an extra width or stroke transformation. Letter outlines, advance widths, source GPOS kerning and mark positions follow the same horizontal scaling. Full source kerning is retained.

The files named `Italic` contain a geometric 7-degree oblique of this drawing. They are separate font files, but are not independently drawn italic masters. Source TrueType bytecode is removed. Optical refinement, accent review, native rendering and small-size hinting assessment remain necessary.

JetBrains Mono is not an outline donor in 0.6. Its source binaries and notices remain in `sources/` for provenance and technical geometry QA only. Their presence and recorded hashes do not imply that the current builder imports their outlines. TT Chocolates, TT Norms Pro and TT Hoves Pro supply visual references only; their outlines are not used.

## Rebuild

Use Python 3.12 and install the pinned tooling locally from the repository root:

```powershell
python -m pip install --target .tools/font-build -r scripts/fonts/requirements.txt
python scripts/fonts/build_font.py
python scripts/fonts/verify_fonts.py
```

The current workstation can use the Python binary returned by Codex `load_workspace_dependencies` when Python is absent from PATH. `.tools/` remains ignored. These dependencies are build/verification tools, not UI-kit runtime dependencies:

| Dependency | Purpose |
| --- | --- |
| `fonttools==4.66.1` | Instantiate and transform the Onest base, convert curves, build TTF/WOFF2 metadata and OpenType features, and inspect output fonts. |
| `skia-pathops==0.9.2` | Expand authored numeral centre-line drawings into consistent stroke contours and resolve overlaps with filled polygons before TrueType conversion. |
| `brotli==1.2.0` | Encode and decode the WOFF2 webfont payload. |
| `uharfbuzz==0.56.3` | Verify actual OpenType shaping, kerning, marks and tabular/proportional numerals. |

Network access is only needed to install the tooling. The builder reads the committed Onest binary and authored geometry; the three retained source binaries and their notices are in `sources/`. Applications consuming the resulting fonts do not need Python or these packages.

`build_font.py` writes 12 TTF + 12 WOFF2 files, OFL notices, FONTLOG and a hash manifest to `packages/ui-kit/fonts/gavia/`, and copies current assets to `apps/playground/public/type-study/gavia/`. Font names, timestamps and glyph order are deterministic. The manifest records drawing-module and source hashes. `verify_fonts.py` checks the accepted binary SHA values independently of the manifest, source/drawing hashes, checksums, style metadata, TTF/WOFF2 round trips, coverage, composite references, line metrics, clipping, HarfBuzz shaping and tabular/proportional numerals. Actual geometry checks include the one's broad vertical-cut entry, the three's level cap-height top bar and horizontal thickness, numeral vertical bounds, measured zero/one stems, accepted Regular ink widths, and unrefined Latin/Cyrillic letter probes against independently instantiated Onest at 96% width and original height. Refined letters and numerals are also checked against unchanged source outlines. The generated report explicitly records that historical Gavia Sans comparisons are not performed. These checks do not replace visual optical review.

## Source files

- Current letter and extended-character base: [Onest](https://github.com/googlefonts/onest), [committed source binary origin](https://raw.githubusercontent.com/google/fonts/main/ofl/onest/Onest%5Bwght%5D.ttf).
- Provenance and QA reference only: [JetBrains Mono upright](https://raw.githubusercontent.com/JetBrains/JetBrainsMono/master/fonts/variable/JetBrainsMono%5Bwght%5D.ttf).
- Provenance and QA reference only: [JetBrains Mono italic](https://raw.githubusercontent.com/JetBrains/JetBrainsMono/master/fonts/variable/JetBrainsMono-Italic%5Bwght%5D.ttf).

Exact source SHA256 values are recorded in the family manifest. Original source copyright notices and licenses are preserved. Current Gavia Sans 0.6 font software stays under SIL OFL 1.1 as an Onest derivative with refined letter endings and Gavia Sans's authored numerals; the surrounding UI-kit and build code keep their existing license. Retained historical JetBrains files keep their original OFL notices.

## Use and review

Gavia Sans is the default proportional typeface of the Gavia and Gavia Dark themes. The canonical
`packages/ui-kit/tokens/source.json` defines the `--wl-font` override for `gavia` and `gavia-dark`;
`pnpm tokens:sync` generates the theme stylesheet, catalog and TypeScript values.
Headings inherit `--wl-font-heading`. Classic, Classic Dark and Newspaper retain their
existing stacks, and `--wl-mono` remains monospace for code.

Consumers explicitly import `gavia-ui/styles/fonts/gavia.css` alongside reset,
base and `themes/gavia.css` or `themes/gavia-dark.css`. The playground already registers the faces.
The library never imports CSS from JavaScript. Without the font stylesheet,
the Gavia themes use their system fallback. See [font documentation](../../docs/font-gavia.md).

The WOFF2/TTF files remain usable independently of Vue and components: register WOFF2 with ordinary `@font-face` on any site, or install TTF manually for native applications. The build does not install fonts into Windows.

The live specimen is the integrated playground page `?view=font` and presents
only accepted Gavia Sans 0.6: Russian and English text, upright/oblique samples,
six weights and editable text. Its menu and theme selector are shared with the
current playground; `?theme=...` survives navigation on local and Pages URLs.
The hero heading uses the selected theme's display font; the letterforms,
reading samples, numerals, weights and editable text retain Gavia Sans.
Font software and notices are shipped in `packages/ui-kit/fonts/gavia/`.
Source fonts and their OFL notices stay in `sources/`, outside the npm archive.
The font development history is retained on `codex/gavia-type-final` at `32ec879`;
it is not required by the current build or runtime.

Before a production release, review 12–18 px reading, the full basic alphabets and numerals, darkness and spacing across weights, kerning, precomposed and combining accents, native application rendering and hinting.

## Variable-font implementation

The owner visually accepted the variable font on 2026-10-22. Final-candidate
loading, CLS and archive checks follow the [font acceptance procedure](../../docs/maintainers/font-variation-audit.md). The
tracked normalizer derives compatible numeral representations in memory from
the accepted masters; it does not redraw them, fit a donor outline or edit the
frozen static binaries. Exact midpoint/line constructions on a complete 2000 UPM
font grid retain source points, flags, metrics and directed endpoint curves.
The four uses an explicit K/seam-A correspondence; intermediate optical quality
is not established by matching the six accepted endpoints.

The existing `build_variable.py` builds actual variable data from all six
masters with direct integer nodal outline deltas. It retains the existing
layout tables and numeric features and reopens WOFF2 before every endpoint,
metric and HarfBuzz shaping check. It writes only a new scratch payload with
static fallbacks, CSS, provenance and notices.

The four-file delivery uses Full/Core for upright and italic. Core combines
Latin-1 and common Cyrillic, numbers and punctuation; Full retains all original
characters, including complete combining clusters. Full is declared before
Core, which intentionally does not claim combining marks. Canonical composition
can differ from separate base/mark positioning in authored masters; retaining
the complete face avoids replacing that drawing with an approximate equivalent.
Only private Core glyph names are omitted (`post` format 3); reopening restores
the original GID aliases for the original strict geometry and shaping guards.
No OTL recomputation, contour approximation or variation-axis change is used.

The bounded 2026-10-21 build passed for all four files and all six weights per
style. Normal Core is **75,428 bytes**, italic Core **79,696 bytes**. The builder
rejects either Core above 80,000 bytes before writing output. Full files are
131,620 and 138,676 bytes, byte-identical to the prior draft. All 24 static-font
hashes and the authored source are unchanged. The current focused Python suite
passes 27/27 tests. See the [implementation and resource evidence](../../docs/maintainers/font-variation-audit.md).
The accepted scratch payload is `.tmp/gavia-variable-bounded-2026-10-21-run02/`.

These are per-Core sizes. A page using both styles, extended characters or
combining marks can load additional files. The four validated WOFF2s, provenance
and notices are now canonical assets, activated through the existing stylesheet.
Static faces are conditional on missing variable-font support; rebuilding the
draft replaces its generated CSS block without duplicating registrations.
Focused Windows Chromium checks measured one 75,428-byte home-page request and
passed both styles, all presets, intermediate weights, exact Core/full cluster
raster and standalone ZIP checks. One targeted CSS-generation unit also passes.
The owner confirmed visual font acceptance on 2026-10-22. Measured CLS and
automated verification of the exact 1.0.0-rc.1 candidate remain pending.
No new full validation, visual-baseline or Pages sequence was run.
The build ran alone with a 1 GiB Windows Job memory cap, one processor affinity,
about one quarter of one processor, and a hard 180-second deadline. It passed in
129.27 seconds with 160.67 MiB peak committed memory. Limits belong to the caller;
the bare Python commands below do not establish OS resource limits themselves.
No persistent launcher, new test harness or dependency was added.

Historical baseline: on 2026-10-21 all 25 Python unit tests passed before the
bounded Core/full change. Draft builds `run02` and `run03`
passed geometry, semantic-flag, coverage, metric and HarfBuzz shaping guards at
all six accepted weights in both styles, including reopened WOFF2 files.
Run 03 also uses exact IUP with `tolerance=0.0`; reconstruction checks every
tuple delta against the original integer value, including phantom points.
Its eight variable WOFF2s and manifest are staged only in
`.tmp/gavia-variable-candidate-2026-10-21-run03/`.

That baseline's normal Latin subset is 62,276 bytes and Cyrillic is 39,080 bytes:
**101,356 bytes combined, exceeding the 80,000-byte target**. The full normal
and italic faces are 131,620 and 138,676 bytes respectively; candidate CSS uses
the subsets rather than these full faces. Actual browser transfer and CLS are
still unmeasured. This historical pair does not measure the new Core request.

`python -B scripts/fonts/audit_variable.py` needs no optional dependencies and
does not rebuild or modify accepted fonts. That audit, and the default
`build_variable.py --preflight`, intentionally continue to reject the original
24 incompatible glyphs per style. Only the recognized accepted source can enter
the normalized draft-build path. The axis is 100–700, default 400; 900 needs an
authored calibration and acceptance first.

To reproduce when font building and tests are authorized:

```sh
python -B scripts/fonts/build_variable.py --output-dir .tmp/gavia-variable-candidate
python -B -m unittest discover -s scripts/fonts -p test_variable.py -v
```

Choose a new output directory each time. The builder only stages output; it does
not overwrite canonical files. The validated four-file payload is now separately
activated at the existing CSS/font paths, with its original build provenance
retained in `variable-manifest.json`. Static binaries, frozen identities and
source artwork remain unchanged. Focused browser acceptance is recorded above;
it does not replace full package/browser gates or optical/native owner review.

Git history preserves the accepted development states. Keep the public specimen and verifier focused on the current family; do not reintroduce earlier font files into public assets for regression checks.

When intentionally accepting a new drawing, update its version, builder metadata, font URL cache key and the verifier's accepted SHA/geometry expectations together. The frozen 0.600 hashes prevent a regenerated manifest from silently approving altered font content. Rebuilding with the pinned source and tooling must reproduce the accepted font binaries; generated QA reports can change when the verification contract is clarified.
