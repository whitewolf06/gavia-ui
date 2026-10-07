# Gavia 0.6 font sources and build

Gavia 0.6 is an experimental OFL derivative of Onest with independently authored numerals. The current family contains six weights (100, 300, 400, 500, 600, 700), each with an upright and italic file, and preserves the base's coverage of 780 mapped characters. The repository and public specimen keep only the accepted current Gavia family; earlier development editions are available through Git history.

## Drawing and provenance

The letters retain Onest proportions and vertical metrics. A uniform 96% horizontal scale makes the letter collection slightly narrower; this is an Onest-derived alphabet, not an independently redrawn one. `draw_gavia.py` adds small non-affine terminal refinements to `a/а`, `e/е` and `l`. The two-storey `a/а` is restored. Punctuation, extended characters, source alternates, composite accents and marks remain derived from Onest, with corresponding horizontal metrics and anchors adjusted.

All ten numerals are independently authored in `draw_gavia.py`. Zero, two, five and eight use Bezier centre-line drawings expanded into strokes; one, three, four and seven use filled closed contours. Three has a horizontal top bar at Y707, a restrained diagonal transition and a curved lower bowl, with a bottom optical overshoot of -8. Six combines an expanded loop with a filled diagonal; its smooth counter is subtracted after union so the diagonal endpoint cannot interrupt the inner oval. Nine is the rotated counterpart of the same authored construction. One has a longer diagonal entry with a vertical terminal cut, a full vertical stem and a broad, flat foot for a classical silhouette. Zero is undotted and four is open. Accepted Regular ink widths, for 0 through 9, are 432, 418, 434, 430, 413, 430, 448, 423, 446 and 448 units. These current targets are verified from actual outlines; historical midpoint comparisons are no longer run. The form details are optical decisions rather than donor-outline interpolation. Four has a shorter upright and lower crossbar; seven adds a restrained left entry bracket; eight uses wider bowls with a calmer waist. Six and nine have wider ovals and cleaner diagonal terminal cuts.

The builder calibrates centre-line widths and heights before stroke expansion with bounded iterative searches. Flat forms occupy the 0–707 vertical range; curved forms allow optical overshoot to approximately -8 and 715. Six spans -8–707 and nine spans 0–715. This aligns the optical numeral height and baseline while preserving curved overshoot. The shared stroke calibration for weights 100/300/400/500/600/700 is 40/69/84/102/120/137 units; horizontal strokes use 92% of that thickness. Centre-line proportions are calibrated before expansion, so fitting a narrow or wide digit does not stretch its finished stroke. Skia expands the authored centre-line drawings and resolves contour overlaps; FontTools converts cubic Beziers to quadratic curves for TrueType output. These values are an optical starting point, not a claim that every numeral has identical perceived darkness at every size.

The accepted 0.600 drawing is frozen by an independent set of 24 SHA256 values in the verifier. Those hashes cover complete TTF/WOFF2 content, including every outline, metric and layout table. The verifier does not load earlier Gavia editions or report historical cross-version comparisons.

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

`build_font.py` writes 12 TTF + 12 WOFF2 files, OFL notices, FONTLOG and a hash manifest to `packages/ui-kit/fonts/gavia/`, and copies current assets to `apps/playground/public/type-study/gavia/`. Font names, timestamps and glyph order are deterministic. The manifest records drawing-module and source hashes. `verify_fonts.py` checks the accepted binary SHA values independently of the manifest, source/drawing hashes, checksums, style metadata, TTF/WOFF2 round trips, coverage, composite references, line metrics, clipping, HarfBuzz shaping and tabular/proportional numerals. Actual geometry checks include the one's broad vertical-cut entry, the three's level cap-height top bar and horizontal thickness, numeral vertical bounds, measured zero/one stems, accepted Regular ink widths, and unrefined Latin/Cyrillic letter probes against independently instantiated Onest at 96% width and original height. Refined letters and numerals are also checked against unchanged source outlines. The generated report explicitly records that historical Gavia comparisons are not performed. These checks do not replace visual optical review.

## Source files

- Current letter and extended-character base: [Onest](https://github.com/googlefonts/onest), [committed source binary origin](https://raw.githubusercontent.com/google/fonts/main/ofl/onest/Onest%5Bwght%5D.ttf).
- Provenance and QA reference only: [JetBrains Mono upright](https://raw.githubusercontent.com/JetBrains/JetBrainsMono/master/fonts/variable/JetBrainsMono%5Bwght%5D.ttf).
- Provenance and QA reference only: [JetBrains Mono italic](https://raw.githubusercontent.com/JetBrains/JetBrainsMono/master/fonts/variable/JetBrainsMono-Italic%5Bwght%5D.ttf).

Exact source SHA256 values are recorded in the family manifest. Original source copyright notices and licenses are preserved. Current Gavia 0.6 font software stays under SIL OFL 1.1 as an Onest derivative with refined letter endings and Gavia's authored numerals; the surrounding UI-kit and build code keep their existing license. Retained historical JetBrains files keep their original OFL notices.

## Use and review

Gavia is the default proportional typeface of the Gavia theme. The canonical
`packages/ui-kit/tokens/source.json` defines the `--wl-font` override for `gavia`;
`pnpm tokens:sync` generates the theme stylesheet, catalog and TypeScript values.
Headings inherit `--wl-font-heading`. White, Graphite and Newspaper retain their
existing stacks, and `--wl-mono` remains monospace for code.

Consumers explicitly import `gavia-ui/styles/fonts/gavia.css` alongside reset,
base and `themes/gavia.css`. The playground already registers the faces.
The library never imports CSS from JavaScript. Without the font stylesheet,
the Gavia theme uses its system fallback. See [font documentation](../../docs/font-gavia.md).

The WOFF2/TTF files remain usable independently of Vue and components: register WOFF2 with ordinary `@font-face` on any site, or install TTF manually for native applications. The build does not install fonts into Windows.

The live specimen is the integrated playground page `?view=font` and presents
only accepted Gavia 0.6: Russian and English text, upright/oblique samples,
six weights and editable text. Its menu and theme selector are shared with the
current playground; `?theme=...` survives navigation on local and Pages URLs.
Font software and notices are shipped in `packages/ui-kit/fonts/gavia/`.
Source fonts and their OFL notices stay in `sources/`, outside the npm archive.
The font development history is retained on `codex/gavia-type-final` at `32ec879`;
it is not required by the current build or runtime.

Before a production release, review 12–18 px reading, the full basic alphabets and numerals, darkness and spacing across weights, kerning, precomposed and combining accents, native application rendering and hinting.

## Future revisions

Git history preserves the accepted development states. Keep the public specimen and verifier focused on the current family; do not reintroduce earlier font files into public assets for regression checks.

When intentionally accepting a new drawing, update its version, builder metadata, font URL cache key and the verifier's accepted SHA/geometry expectations together. The frozen 0.600 hashes prevent a regenerated manifest from silently approving altered font content. Rebuilding with the pinned source and tooling must reproduce the accepted font binaries; generated QA reports can change when the verification contract is clarified.
