# Gavia Sans typeface

Gavia Sans 0.6 is included in the package. It is the primary font for Gavia and
Gavia Dark: Cyrillic and Latin, 780 glyphs, six weights:
Thin 100, Light 300, Regular 400, Medium 500, SemiBold 600 and Bold 700.
Each weight has separate upright and italic files.

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
[Theme compatibility](migration-themes.md).
Download the ZIP from the font page for standalone use.

## Examples and standalone use

The playground Font section (`?view=font`) includes headings, paragraphs,
numerals, every weight, Russian/English specimens and custom text.
The selected theme remains in the URL when moving between sections.
Toggles, weight selection, slider, input and demonstration button use UI kit
components. The hero heading follows the selected theme’s heading font;
letter, text, numeral and weight specimens below keep Gavia Sans in every theme.

The font page and shared footer offer **Gavia-Sans-0.6.zip**.
It contains 12 TTFs, 12 WOFF2s, standalone CSS, both licenses and brief
instructions. Vue is not required. Extract the archive, keep `gavia.css` beside
WOFF2 files and add `<link rel="stylesheet" href="./gavia.css">`.
The archive is built from verified font files with the playground;
Git does not store a separate binary ZIP. Its URL respects the GitHub Pages subpath.

WOFF2 and TTF files are available through `gavia-ui/fonts/gavia/<file>`.
TTF can be installed for desktop applications; WOFF2 can be used without Vue:

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
and verification are described in [font documentation](../scripts/fonts/README.md).

## Family name and compatibility

**Gavia Sans** is the font, **Gavia UI** the component library, and **Gavia** a theme.
Use `Gavia Sans` in CSS and when installing TTF.

The rename changes only the font name table. All accepted 0.6 outlines, dimensions,
spacing and kerning are preserved. Existing `styles/fonts/gavia.css`,
`fonts/gavia/*` paths and `Gavia-*.ttf` / `Gavia-*.woff2` filenames remain unchanged.
CSS also registers the compatible `Gavia` alias; existing
`font-family: "Gavia"` declarations continue to work.
The new download is `Gavia-Sans-0.6.zip`; the previous download name belongs
to unreleased development.
