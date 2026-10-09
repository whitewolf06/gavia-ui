# Gavia Sans — font page

`?view=font` is a separate section of the main playground, accessible from
the shared header, mobile menu and command palette. Direct links also work
on GitHub Pages: `/gavia-ui/?view=font&theme=gavia#wl-type-weights`.
Navigation preserves the theme and subpath; the theme is stored in the URL query.

The page shows Gavia Sans 0.6: three headings, two paragraphs,
interface labels and amounts, numerals, alphabets and all six weights.
The hero heading uses the selected theme’s heading font: Gavia Sans in
Gavia / Gavia Dark, system sans in Classic / Classic Dark and Georgia in Newspaper.
Letter, text, numeral and weight specimens below keep Gavia Sans in all themes.
The presentation and surrounding elements follow the theme tokens.
Gavia Sans is the primary family for Gavia and Gavia Dark; code examples keep `--wl-mono`.

The top controls select Russian/English and upright/italic styles.
Language and style apply to the specimens; custom text is preserved.
The interactive sample supports weight, a size of 12–72 px and custom text.
A separate example shows tabular `tnum` and proportional `pnum` numerals.

| Weight | Name | Upright | Italic |
| --- | --- | --- | --- |
| 100 | Thin | Gavia-Thin.woff2 | Gavia-ThinItalic.woff2 |
| 300 | Light | Gavia-Light.woff2 | Gavia-LightItalic.woff2 |
| 400 | Regular | Gavia-Regular.woff2 | Gavia-RegularItalic.woff2 |
| 500 | Medium | Gavia-Medium.woff2 | Gavia-MediumItalic.woff2 |
| 600 | SemiBold | Gavia-SemiBold.woff2 | Gavia-SemiBoldItalic.woff2 |
| 700 | Bold | Gavia-Bold.woff2 | Gavia-BoldItalic.woff2 |

The main `src/main.ts` explicitly imports `gavia-ui/styles/fonts/gavia.css`.
That CSS registers 12 faces from package files.
`GaviaTypeStudy.vue` loads asynchronously with its page styles;
the main application provides the shared header and navigation.

Shared sample text is in `samples.ts`; font parameters are in `font.ts`.
Consumer applications import the font CSS alongside kit styles.
The library never loads CSS automatically from JavaScript.
Without CSS containing `@font-face`, a system font is used; applications may
override `--wl-font` and `--wl-font-heading`.
WOFF2/TTF files can be used independently of Vue and the components.

Font provenance, OFL requirements and build tools are covered by
[font documentation](../../../../scripts/fonts/README.md) and
[package README](../../../../packages/ui-kit/README.md).

## Local preview

From the isolated worktree root: `pnpm dev --host 127.0.0.1 --port 5178`.
Open `http://127.0.0.1:5178/?view=font`.

## Checks

Navigation: `packages/ui-kit/tests/playground-navigation.test.ts`.
Interaction and font files: `apps/playground/e2e/font-page.spec.ts`.
Checks cover Russian/English, both styles, sample weight and size,
six pairs of faces, five themes, regular and mobile navigation,
absence of old versions and horizontal overflow.
