# Legato Sans — font page

`?view=font` is a separate section of the main playground, accessible from
the shared header, mobile menu and command palette. Direct links also work
on GitHub Pages: `/legato-ui/?view=font&theme=gavia#wl-type-weights`.
Navigation preserves the theme and subpath; the theme is stored in the URL query.

The page shows Legato Sans 0.6 with three headings, two paragraphs,
interface labels and amounts, numerals, alphabets and all six weights.
The hero heading uses Legato Sans in both Legato themes, its Gavia Sans alias in
both Gavia themes, system sans in Classic / Classic Dark and Georgia in Newspaper.
Letter, text, numeral and weight specimens below use Legato Sans in all themes.
The presentation and surrounding elements follow the theme tokens.
Code examples use `--wl-mono`.

The top controls select Russian/English and upright/italic styles.
Language and style apply to the specimens; custom text is preserved.
The interactive sample has a live 100–700 weight slider with a step of 1 and a
numeric readout, six weight presets, a size of 12–72 px and custom text. Weight
changes apply immediately to the sample and both alphabets, in upright and
italic styles. Between authored presets the selector shows "Intermediate weight";
choosing a preset synchronizes the slider. Arrow keys change weight by 1;
Home/End select 100/700.
A separate example shows tabular `tnum` and proportional `pnum` numerals.

| Weight | Name | Upright | Italic |
| --- | --- | --- | --- |
| 100 | Thin | Legato-Thin.woff2 | Legato-ThinItalic.woff2 |
| 300 | Light | Legato-Light.woff2 | Legato-LightItalic.woff2 |
| 400 | Regular | Legato-Regular.woff2 | Legato-RegularItalic.woff2 |
| 500 | Medium | Legato-Medium.woff2 | Legato-MediumItalic.woff2 |
| 600 | SemiBold | Legato-SemiBold.woff2 | Legato-SemiBoldItalic.woff2 |
| 700 | Bold | Legato-Bold.woff2 | Legato-BoldItalic.woff2 |

The main `src/main.ts` explicitly imports `legato-ui/styles/fonts/legato.css`.
That CSS enables the variable Core/full faces and keeps the 12 static faces
and legacy family alias as a conditional fallback.
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
[consumer font guide](../../../../docs/guide/font-legato.md).

## Local preview

From the isolated worktree root: `pnpm dev --host 127.0.0.1 --port 5178`.
Open `http://127.0.0.1:5178/?view=font`.

## Checks

Navigation: `packages/ui-kit/tests/playground-navigation.test.ts`.
Interaction and font files: `apps/playground/e2e/font-page.spec.ts`.
Checks cover Russian/English, both styles, sample weight and size,
six pairs of faces, seven themes, regular and mobile navigation,
absence of old versions and horizontal overflow.
