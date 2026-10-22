# Gavia Sans typeface

Gavia Sans 0.6 is included in the package. It is the primary font for Gavia and
Gavia Dark: Cyrillic and Latin, 780 mapped characters, six weights:
Thin 100, Light 300, Regular 400, Medium 500, SemiBold 600 and Bold 700.
Modern browsers use a variable 100–700 weight axis, with separate upright and
italic files. The six weights above remain the authored presets. Accepted static
faces are retained for browsers without variable-font support.

## Theme setup

```ts
import "gavia-ui/styles/reset.css";
import "gavia-ui/styles/fonts/gavia.css";
import "gavia-ui/styles/base.css";
import "gavia-ui/themes/gavia.css";
```

Select `<html data-wl-theme="gavia">`. For Gavia Dark, import
`gavia-ui/themes/gavia-dark.css` and select `data-wl-theme="gavia-dark"`.
Both themes use Gavia Sans through `--wl-font`; headings inherit it through
`--wl-font-heading`. Import CSS explicitly: the library does not load styles
from JS. Without font CSS, the browser uses a system font.
Classic, Classic Dark and Newspaper keep their typography.
Token names and `--wl-mono` are unchanged.

The font and light theme have been included since Gavia UI 0.9.1;
Gavia Dark was added to the UI kit in 0.10.0.
[Theme compatibility](../migration.md#migration-themes).
Download the ZIP from the font page for standalone use.

## Examples and standalone use

The playground Font section (`?view=font`) includes headings, paragraphs,
numerals, every weight, Russian/English specimens and custom text. Its weight
slider adjusts 100–700 in steps of 1, updating the sample and alphabets as you
drag. The number beside it shows the current weight. Six presets remain
available; intermediate values do not select a different preset. Use Arrow keys
for single-weight changes and Home/End for the limits. Upright/italic selection
preserves the chosen weight, custom text and size.
The selected theme remains in the URL when moving between sections.
Toggles, weight selection, slider, input and demonstration button use UI kit
components. The hero heading follows the selected theme’s heading font;
letter, text, numeral and weight specimens below keep Gavia Sans in every theme.

The font page and shared footer offer **Gavia-Sans-0.6.zip**.
It contains 12 static TTFs, 12 static and four variable WOFF2s, standalone CSS,
provenance, both licenses and brief
instructions. Vue is not required. Extract the archive, keep `gavia.css` beside
WOFF2 files and add `<link rel="stylesheet" href="./gavia.css">`.
The archive is built from verified font files with the playground;
Git does not store a separate binary ZIP. Its URL respects the GitHub Pages subpath.

WOFF2 files are available through `gavia-ui/fonts/gavia/<file>`.
TTF files remain in the repository and full download for desktop applications;
the npm archive contains web fonts. WOFF2 can be used without Vue:

```css
@font-face {
  font-family: "Gavia Sans";
  src: url("./Gavia-Regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
body {
  font-family: "Gavia Sans", "Segoe UI", sans-serif;
  text-rendering: geometricPrecision;
}
```

Set the appropriate weights and `font-style` for other faces.
Numerals are tabular by default; `font-variant-numeric: proportional-nums`
switches to proportional widths. `text-rendering: geometricPrecision` preserves
equal tabular spacing in browsers with pixel-rounded font rendering.
Gavia sets this mode through `--wl-type-text-rendering`;
other themes keep `optimizeLegibility`.

## Source and license

UI kit code remains MIT-licensed. Font files are distributed separately under
SIL Open Font License 1.1: retain `OFL.txt`, `Onest-OFL.txt` and copyright notices
when redistributing. The alphabet is derived from Onest at 96% width, preserving
vertical proportions and refining terminals. Gavia Sans numerals are drawn
separately. Italic files have a geometric 7° slant. Build tooling, pinned sources
and verification are described in [font documentation](../../scripts/fonts/README.md).

## Family name and compatibility

**Gavia Sans** is the font, **Gavia UI** the component library, and **Gavia** a theme.
Use `Gavia Sans` in CSS and when installing TTF.

The rename changes only the font name table. All accepted 0.6 outlines, dimensions,
spacing and kerning are preserved. Existing `styles/fonts/gavia.css`,
WOFF2 package paths and filenames remain stable. TTF filenames are retained in
the repository and full font download; TTF and the QA report are excluded from
the npm archive. See [the package asset migration](../migration.md#migration-package-assets).
CSS also registers the compatible `Gavia` alias; existing
`font-family: "Gavia"` declarations continue to work.
The new download is `Gavia-Sans-0.6.zip`; the previous download name belongs
to unreleased development.

## Variable-font delivery

The repository now contains source for a 100–700 variable weight axis, default
400, in upright and oblique styles. It derives exact common representations of
the accepted master outlines instead of replacing the Gavia drawing. A Core
subset combines Latin-1, common Cyrillic, numbers and punctuation in one
request. Complete international faces retain every original character and
numeric alternative. They are declared before Core; Core deliberately defers
combining clusters to complete coverage to retain canonical composition and
authored mark positioning. No characters or layout features are removed.
Both styles
recover all six accepted masters exactly, including geometry, metrics and
shaping checks after WOFF2 serialization. The latest draft uses exact IUP with
zero tolerance and verifies every reconstructed tuple delta.

Four variable WOFF2 files (Full/Core in both styles) are now included in the
canonical package assets and enabled by the existing CSS import. The Playground
uses the same stylesheet, preloads normal Core and includes all four files in its
standalone ZIP. Static faces are enabled only when variable fonts are unsupported;
this prevents exact static weights competing with the variable range.

The builder enforces an **80,000-byte Core limit in both styles** before writing any
output. This replaces the earlier 101,356-byte Latin/Cyrillic pair. The target
applies to the primary English/Russian request; the full international font
is still available and using extended characters can load it as well. Focused
Windows Chromium checks measured one 75,428-byte font response on the Russian
Gavia home page. Both styles load at all six presets and intermediate weights;
Core/full combining-cluster rendering matches the complete face. The owner
accepted the font visually on 2026-10-22. Measured layout shift and automated
verification of the exact release candidate remain pending.

The existing font CSS import, family names and static-file paths remain valid.
No JavaScript font loader is needed. This local activation and focused browser
check do not constitute publication or full release verification.

The CSS also defines an optional metric-aligned local fallback:

```css
body {
  font-family: "Gavia Sans", "Gavia Sans Fallback", "Segoe UI", Arial, sans-serif;
}
```

That face aligns line-box metrics; its 100% size adjustment does not promise
matching local-font x-height or advance widths. The owner's visual acceptance
does not establish measured CLS or new platform-specific loading/transfer results.
See the [maintainer implementation record](../maintainers/font-variation-audit.md).
